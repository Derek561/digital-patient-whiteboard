"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Channel = "Call" | "Text" | "Email";
type DemoPerson = {
  id: string;
  name: string;
  enrollment: string;
  assignedTo: string;
  contactAllowed: boolean;
  contactPreference: Channel;
  nextAction: string | null;
  dueOn: string | null;
};
type DemoActivity = {
  id: number;
  personId: string;
  channel: Channel;
  outcome: string;
  note: string;
  nextAction: string;
  dueOn: string;
  staff: string;
  recordedAt: string;
};

// Fictional people. No former patient information or contact details.
const initialPeople: DemoPerson[] = [
  { id: "sample-alex", name: "Alex Rivera (fictional)", enrollment: "Demo enrollment", assignedTo: "Drew", contactAllowed: true, contactPreference: "Call", nextAction: null, dueOn: null },
  { id: "sample-jordan", name: "Jordan Lee (fictional)", enrollment: "Demo enrollment", assignedTo: "Dom", contactAllowed: true, contactPreference: "Text", nextAction: null, dueOn: null },
  { id: "sample-taylor", name: "Taylor Brooks (fictional)", enrollment: "Contact permission revoked", assignedTo: "Drew", contactAllowed: false, contactPreference: "Email", nextAction: null, dueOn: null },
];

const channels: Channel[] = ["Call", "Text", "Email"];

function formatDue(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function AlumniStaffDemo({
  staffEmail,
  legacyRole,
}: {
  staffEmail: string;
  legacyRole: string;
}) {
  const [people, setPeople] = useState<DemoPerson[]>(initialPeople);
  const [selectedId, setSelectedId] = useState(initialPeople[0].id);
  const [activities, setActivities] = useState<DemoActivity[]>([]);
  const [channel, setChannel] = useState<Channel>("Call");
  const [outcome, setOutcome] = useState("We talked");
  const [note, setNote] = useState("");
  const [nextAction, setNextAction] = useState("Check in again");
  const [dueOn, setDueOn] = useState("");
  const [notice, setNotice] = useState("");

  const selected = people.find((person) => person.id === selectedId) ?? people[0];
  const personActivities = activities.filter((entry) => entry.personId === selected.id);
  const queue = useMemo(
    () => people.filter((person) => person.nextAction && person.dueOn)
      .sort((a, b) => (a.dueOn ?? "").localeCompare(b.dueOn ?? "")),
    [people],
  );

  function selectPerson(person: DemoPerson) {
    setSelectedId(person.id);
    setChannel(person.contactPreference);
    setOutcome("We talked");
    setNote("");
    setNextAction("Check in again");
    setDueOn("");
    setNotice("");
  }

  function recordDemoOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Authorization is demonstrated in the UI only; this never sends a real message.
    if (!selected.contactAllowed) {
      setNotice("Blocked: this fictional person has revoked contact permission.");
      return;
    }
    if (!dueOn || !nextAction.trim()) {
      setNotice("Select a follow-up date and enter the next action.");
      return;
    }

    const entry: DemoActivity = {
      id: Date.now(),
      personId: selected.id,
      channel,
      outcome,
      note: note.trim(),
      nextAction: nextAction.trim(),
      dueOn,
      staff: staffEmail,
      recordedAt: new Date().toISOString(),
    };
    setActivities((previous) => [entry, ...previous]);
    setPeople((previous) => previous.map((person) => person.id === selected.id
      ? { ...person, nextAction: entry.nextAction, dueOn: entry.dueOn }
      : person));
    setNotice(`Fictional ${channel.toLowerCase()} outcome recorded. Follow-up now appears in the work queue.`);
    setNote("");
  }

  function resetDemo() {
    setPeople(initialPeople);
    setActivities([]);
    setSelectedId(initialPeople[0].id);
    setChannel("Call");
    setOutcome("We talked");
    setNote("");
    setNextAction("Check in again");
    setDueOn("");
    setNotice("Demo reset. No real records were changed.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-sky-400/30 bg-gradient-to-r from-slate-900 to-slate-800 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Simple Path Recovery</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Alumni Connect</h1>
              <p className="mt-2 text-sm text-slate-300">Staff workflow lab · Sign in → person → outcome → next step</p>
            </div>
            <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200">FICTIONAL DEMO · NO REAL MESSAGES</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>Signed in: {staffEmail} · Current legacy profile role: {legacyRole}</span>
            <div className="flex gap-3">
              <button onClick={resetDemo} className="rounded-lg border border-slate-600 px-3 py-2 text-slate-100 hover:bg-slate-700">Reset demo</button>
              <Link href="/" className="rounded-lg border border-slate-700 px-3 py-2 text-slate-300 hover:bg-slate-800">Legacy homepage</Link>
            </div>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-lg font-semibold">People</h2>
            <p className="mb-4 mt-1 text-xs text-slate-400">Fictional records, not an alumni import.</p>
            <div className="space-y-2">
              {people.map((person) => (
                <button type="button" key={person.id} onClick={() => selectPerson(person)}
                  aria-pressed={selected.id === person.id}
                  className={`w-full rounded-xl border p-4 text-left transition ${selected.id === person.id ? "border-sky-400 bg-sky-400/10" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}>
                  <div className="text-sm font-semibold">{person.name}</div>
                  <div className="mt-1 text-xs text-slate-400">Assigned: {person.assignedTo}</div>
                  <div className={`mt-2 text-xs ${person.contactAllowed ? "text-emerald-300" : "text-amber-300"}`}>
                    {person.contactAllowed ? "Demo contact permission active" : "Contact revoked · no outreach"}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{selected.enrollment} · Liaison: {selected.assignedTo} · Preferred: {selected.contactPreference}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected.contactAllowed ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
                  {selected.contactAllowed ? "Contact permitted in demo" : "Do not contact"}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-5">
                <h3 className="text-base font-semibold">Record an outreach outcome</h3>
                <p className="mt-1 text-xs text-slate-400">This does not start a call, send a text, or send an email. It only rehearses the documentation sequence in this browser session.</p>
                <form onSubmit={recordDemoOutcome} className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm">Method
                    <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}
                      disabled={!selected.contactAllowed} className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50">
                      {channels.map((value) => <option key={value} value={value}>{value} (simulation)</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">Outcome
                    <select value={outcome} onChange={(event) => setOutcome(event.target.value)}
                      disabled={!selected.contactAllowed} className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50">
                      <option>We talked</option>
                      <option>No answer</option>
                      <option>Left a message</option>
                      <option>Asked for a resource</option>
                      <option>Requested a call back</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm sm:col-span-2">Short note (optional)
                    <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)}
                      disabled={!selected.contactAllowed} placeholder="A brief, fictional follow-up note"
                      className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50" />
                  </label>
                  <label className="grid gap-2 text-sm">Next step
                    <input value={nextAction} onChange={(event) => setNextAction(event.target.value)}
                      disabled={!selected.contactAllowed} maxLength={120}
                      className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50" />
                  </label>
                  <label className="grid gap-2 text-sm">Follow-up date
                    <input type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)}
                      disabled={!selected.contactAllowed} required
                      className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50" />
                  </label>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={!selected.contactAllowed}
                      className="w-full rounded-xl bg-sky-300 px-4 py-3 font-bold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                      {selected.contactAllowed ? "Record fictional outcome and follow-up" : "Contact recording blocked by revoked permission"}
                    </button>
                    <p aria-live="polite" className="mt-3 min-h-5 text-sm text-sky-200">{notice}</p>
                  </div>
                </form>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="font-semibold">Interaction history</h3>
              {personActivities.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No fictional contact outcomes recorded yet.</p>
              ) : <ol className="mt-4 space-y-3">
                {personActivities.map((entry) => <li key={entry.id} className="rounded-xl border border-slate-700 p-3">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <strong>{entry.channel}: {entry.outcome}</strong>
                    <span className="text-xs text-slate-400">{new Date(entry.recordedAt).toLocaleString()}</span>
                  </div>
                  {entry.note && <p className="mt-2 text-sm text-slate-300">{entry.note}</p>}
                  <p className="mt-2 text-xs text-sky-200">Next: {entry.nextAction} · {formatDue(entry.dueOn)}</p>
                </li>)}
              </ol>}
            </section>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Follow-up work queue</h2>
          <p className="mt-1 text-xs text-slate-400">Populates automatically when you record a fictional outcome.</p>
          {queue.length === 0 ? <p className="mt-4 text-sm text-slate-400">No follow-ups scheduled in this demo session.</p> :
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {queue.map((person) => <button key={person.id} type="button" onClick={() => selectPerson(person)}
                className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-sky-400">
                <p className="font-semibold">{person.name}</p>
                <p className="mt-2 text-sm text-slate-300">{person.nextAction}</p>
                <p className="mt-2 text-xs text-sky-200">Due {formatDue(person.dueOn!)} · {person.assignedTo}</p>
              </button>)}
            </div>}
        </section>
        <p className="pb-6 text-center text-xs text-slate-500">Demo state is temporary and resets on refresh. No database writes, contact delivery, or production role-policy changes.</p>
      </div>
    </main>
  );
}
