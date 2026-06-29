import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statCards = [
  {
    label: "Expected Today",
    value: "0",
    detail: "Scheduled admissions or arrivals due today",
  },
  {
    label: "Pending Clinical Review",
    value: "0",
    detail: "Cards waiting for clinical clearance status",
  },
  {
    label: "Active Blockers",
    value: "0",
    detail: "Insurance, transport, documents, or approval issues",
  },
  {
    label: "Overdue Next Actions",
    value: "0",
    detail: "Follow-ups past their due date",
  },
];

const stages = [
  "Prospective Lead",
  "Pending Verification",
  "Pending Clinical Review",
  "Scheduled Admission",
  "Travel / ETA Confirmed",
  "Arrived / On Site",
  "Intake In Progress",
  "Admitted",
  "Did Not Admit",
  "Discharge / Transition Pending",
  "Aftercare Follow-Up",
  "Closed / No Further Action",
];

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }
  
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Digital Patient Whiteboard
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Admissions, Movement, Transition, and Aftercare Visibility
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                A human-centered operational board for patient movement,
                accountability, blockers, next actions, activity logs, and
                role-based visibility.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              <p className="font-semibold">Boundary</p>
              <p className="mt-1 max-w-md">
                This tool does not replace Kipu, CRM, or Oceanside Housing
                census. It is a visibility layer for operational movement and
                accountability.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm font-medium text-slate-400">{card.label}</p>
              <p className="mt-3 text-4xl font-bold text-white">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Patient Movement Board
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Cards will move through lifecycle stages as ownership,
                  blockers, and next actions change.
                </p>
              </div>

              <button className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
                Add Patient Card
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {stages.slice(0, 6).map((stage) => (
                <div
                  key={stage}
                  className="min-h-40 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-200">
                      {stage}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      0
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">
                    No cards yet.
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold text-white">Recent Updates</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Activity logs will preserve who updated what, when it happened,
                and what the next action is.
              </p>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
                No activity logged yet.
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold text-white">
                First Build Spine
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Cards</li>
                <li>Stages</li>
                <li>Owners</li>
                <li>Blockers</li>
                <li>Next actions</li>
                <li>Logs</li>
                <li>Role access</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6">
              <h2 className="text-xl font-bold text-amber-100">
                Minimum Necessary Reminder
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-100/80">
                Operational updates only. Clinical notes, therapy content,
                diagnoses, and unnecessary PHI stay in the correct system of
                record.
              </p>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
