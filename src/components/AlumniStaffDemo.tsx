"use client";

import { useMemo, useState, type FormEvent } from "react";

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
const outcomeByMethod: Record<Channel, string[]> = {
  Call: ["We talked", "No answer", "Left a voicemail", "Requested a callback", "Asked for a resource"],
  Text: ["Test message prepared", "Fictional reply received", "No reply (fictional)", "Requested a callback", "Asked for a resource"],
  Email: ["Test email prepared", "Fictional reply received", "No reply (fictional)", "Requested a callback", "Asked for a resource"],
};

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
  const [outcome, setOutcome] = useState(outcomeByMethod.Call[0]);
  const [note, setNote] = useState("");
  const [nextAction, setNextAction] = useState("Check in again");
  const [dueOn, setDueOn] = useState("");
  const [notice, setNotice] = useState("");
  const [activeContact, setActiveContact] = useState<Channel | null>(null);
  const [draft, setDraft] = useState("");

  const selected = people.find((person) => person.id === selectedId) ?? people[0];
  const personActivities = activities.filter((entry) => entry.personId === selected.id);
  const queue = useMemo(
    () => people.filter((person) => person.nextAction && person.dueOn)
      .sort((a, b) => (a.dueOn ?? "").localeCompare(b.dueOn ?? "")),
    [people],
  );

  function beginContact(method: Channel) {
    if (!selected.contactAllowed) {
      setNotice("Contact blocked: permission has been revoked.");
      return;
    }
    setChannel(method);
    setOutcome(outcomeByMethod[method][0]);
    setActiveContact(method);
    setDraft("");
    setNotice(`${method} test opened. Nothing has been sent or dialed.`);
  }

  function selectPerson(person: DemoPerson) {
    setSelectedId(person.id);
    setActiveContact(null);
    setDraft("");
    setChannel(person.contactPreference);
    setOutcome(outcomeByMethod[person.contactPreference][0]);
    setNote("");
    setNextAction("Check in again");
    setDueOn("");
    setNotice("");
  }

  function recordDemoOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeContact || activeContact !== channel) {
      setNotice("Choose a communication action first.");
      return;
    }
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
    setActiveContact(null);
    setDraft("");
  }

  function resetDemo() {
    setActiveContact(null);
    setDraft("");
    setPeople(initialPeople);
    setActivities([]);
    setSelectedId(initialPeople[0].id);
    setChannel("Call");
    setOutcome(outcomeByMethod.Call[0]);
    setNote("");
    setNextAction("Check in again");
    setDueOn("");
    setNotice("Demo reset. No real records were changed.");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-3 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-3 sm:space-y-6">
        <header className="rounded-2xl border border-sky-400/30 bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Simple Path Recovery</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Alumni Connect</h1>
              <p className="mt-1 text-sm text-slate-300">Choose an alumnus. Reach out. Follow through.</p>
            </div>
            <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200">FICTIONAL DEMO · NO MESSAGES SENT</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="break-all">Staff: {staffEmail} · Role: {legacyRole}</span>
            <div className="flex gap-3">
              <button onClick={resetDemo} className="rounded-lg border border-slate-600 px-3 py-2 text-slate-100 hover:bg-slate-700">Reset demo</button>
            </div>
          </div>
        </header>

        <label className="grid gap-1.5 rounded-xl border border-sky-400/30 bg-slate-900 p-3 text-sm font-semibold lg:hidden">
          Choose alumnus
          <select
            aria-label="Choose fictional alumnus"
            className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-3 text-base text-white"
            value={selectedId}
            onChange={(event) => {
              const person = people.find((item) => item.id === event.target.value);
              if (person) selectPerson(person);
            }}
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>{person.name} · {person.contactAllowed ? "Contact allowed" : "Do not contact"}</option>
            ))}
          </select>
        </label>
        <section className="grid gap-3 lg:grid-cols-[280px_1fr] lg:gap-5">
          <aside className="hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:block">
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
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">{selected.enrollment} · Liaison: {selected.assignedTo} · Preferred: {selected.contactPreference}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selected.contactAllowed ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
                  {selected.contactAllowed ? "Contact permitted in demo" : "Do not contact"}
                </span>
              </div>

              <div className="mt-3 border-t border-slate-800 pt-3 sm:mt-5 sm:pt-5">
                <h3 className="text-base font-semibold">Contact this alumnus</h3>
                <p className="mt-1 text-sm text-slate-400">Choose how to reach out. Test mode: no calls are placed and no messages are delivered.</p>
                <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Communication method">
                  {channels.map((method) => (
                    <button key={method} type="button" disabled={!selected.contactAllowed}
                      onClick={() => beginContact(method)}
                      aria-pressed={activeContact === method}
                      className={`rounded-xl border px-2 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${activeContact === method ? "border-sky-300 bg-sky-300 text-slate-950" : "border-slate-600 bg-slate-950 text-white hover:border-sky-300"}`}>
                      {method === "Call" ? "Call" : method === "Text" ? "Text" : "Email"}
                    </button>
                  ))}
                </div>
                {!selected.contactAllowed && <p className="mt-3 text-sm font-semibold text-rose-300">Do not contact. Permission revoked.</p>}
                {activeContact && selected.contactAllowed && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-sm text-sky-100" role="status">
                      {activeContact === "Call" ? "Test call opened. No number was dialed." : activeContact === "Text" ? "Test text composer opened. Nothing will be sent." : "Test email composer opened. Nothing will be sent."}
                    </div>
                    {activeContact !== "Call" && (
                      <label className="grid gap-2 text-sm">Draft {activeContact.toLowerCase()} (test only)
                        <textarea rows={3} value={draft} onChange={(event) => setDraft(event.target.value)}
                          maxLength={1000} placeholder="Write a sample message. It will not be delivered or saved."
                          className="rounded-lg border border-slate-600 bg-slate-950 p-3" />
                      </label>
                    )}
                    <h4 className="font-semibold">Record what happened (fictional)</h4>
                    <form onSubmit={recordDemoOutcome} className="grid gap-3 sm:grid-cols-2">

                  <label className="grid gap-2 text-sm">Outcome
                    <select value={outcome} onChange={(event) => setOutcome(event.target.value)}
                      disabled={!selected.contactAllowed} className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50">
                      {outcomeByMethod[channel].map((choice) => (
                        <option key={choice}>{choice}</option>
                      ))}
                    </select>
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
                  <details className="rounded-lg border border-slate-700 p-3 text-sm sm:col-span-2">
                    <summary className="cursor-pointer font-medium text-sky-200">Add a note (optional)</summary>
                    <label className="mt-3 grid gap-2">Short note
                      <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)}
                        disabled={!selected.contactAllowed} placeholder="Brief fictional follow-up note"
                        className="rounded-lg border border-slate-600 bg-slate-950 p-3 disabled:opacity-50" />
                    </label>
                  </details>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={!selected.contactAllowed}
                      className="w-full rounded-xl bg-sky-300 px-4 py-3 font-bold text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                      Record test outcome and follow-up
                    </button>
                    <p aria-live="polite" className="mt-3 min-h-5 text-sm text-sky-200">{notice}</p>
                  </div>
                    </form>
                  </div>
                )}
                <p aria-live="polite" className="mt-3 text-sm text-sky-200">{!activeContact ? notice : ""}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="font-semibold">Interaction history <span className="text-sm font-normal text-slate-400">({personActivities.length})</span></h3>
              {personActivities.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No fictional contact outcomes recorded yet.</p>
              ) : <ol className="mt-4 space-y-3">
                {personActivities.map((entry) => <li key={entry.id} className="rounded-xl border border-slate-700 p-3">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <strong>Test {entry.channel}: {entry.outcome}</strong>
                    <span className="text-xs text-slate-400">{new Date(entry.recordedAt).toLocaleString()}</span>
                  </div>
                  {entry.note && <p className="mt-2 text-sm text-slate-300">{entry.note}</p>}
                  <p className="mt-2 text-xs text-sky-200">Next: {entry.nextAction} · {formatDue(entry.dueOn)}</p>
                </li>)}
              </ol>}
            </section>
          </div>
        </section>

        <section id="follow-up-queue" className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Follow-up work queue ({queue.length})</h2>
          <p className="mt-1 text-xs text-slate-400">Simulated follow-ups appear here immediately. No records leave this page.</p>
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
