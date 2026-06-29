import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stages = [
  "New Inquiry / Lead",
  "Contact Attempt",
  "Screening / Qualification",
  "Detox Needed",
  "Referred to Detox",
  "Currently in Detox",
  "Expected From Detox",
  "Scheduled Admission",
  "Arrived / Intake",
  "Admitted",
  "Did Not Admit / Lost",
  "Aftercare Follow-Up",
  "Closed",
];

export default async function Home() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

    const [
    openLeadsResult,
    detoxReferralsResult,
    currentlyInDetoxResult,
    expectedFromDetoxResult,
  ] = await Promise.all([
    supabase
      .from("patient_cards")
      .select("id", { count: "exact", head: true })
      .eq("conversion_status", "open")
      .eq("is_archived", false),

    supabase
      .from("patient_cards")
      .select("id", { count: "exact", head: true })
      .or("stage.eq.Referred to Detox,detox_needed.eq.yes")
      .eq("is_archived", false),

    supabase
      .from("patient_cards")
      .select("id", { count: "exact", head: true })
      .or("stage.eq.Currently in Detox,current_location_setting.eq.detox")
      .eq("is_archived", false),

    supabase
      .from("patient_cards")
      .select("id", { count: "exact", head: true })
      .in("expected_from_detox", ["yes", "maybe"])
      .eq("is_archived", false),
  ]);

  const { data: patientCards } = await supabase
    .from("patient_cards")
    .select(
      "id, patient_display_name, stage, level_of_care, expected_date, expected_time, blocker, next_action, priority, clinical_clearance_status",
    )
    .eq("is_archived", false)
    .order("expected_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

     const { data: recentActivityLogs } = await supabase
    .from("patient_activity_logs")
    .select(
      "id, activity_type, summary, detail, created_at, patient_cards(patient_display_name)",
    )
    .order("created_at", { ascending: false })
    .limit(5);  

   const statCards = [
    {
      label: "Open Leads",
      value: String(openLeadsResult.count ?? 0),
      detail: "Prospective patients still being worked by outreach.",
    },
    {
      label: "Detox Referrals",
      value: String(detoxReferralsResult.count ?? 0),
      detail: "Leads needing detox or already referred to detox.",
    },
    {
      label: "Currently in Detox",
      value: String(currentlyInDetoxResult.count ?? 0),
      detail: "People currently located in a detox setting.",
    },
    {
      label: "Expected From Detox",
      value: String(expectedFromDetoxResult.count ?? 0),
      detail: "People expected or possibly expected to come after detox.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Outreach Movement Board
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Outreach, Detox Pathway, Admission Movement, and Follow-Up Visibility
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                A human-centered operational board for prospective patient movement, lead origin, detox pathway tracking, blockers, next actions, follow-up ownership, and admission readiness.
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
                  Outreach Movement Board
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Cards move through outreach, detox, and pre-admission stages as ownership, blockers, and next actions change.
                </p>
              </div>

            <Link
  href="/patients/new"
  className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
>
  Add Movement Card
</Link>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {stages.slice(0, 6).map((stage) => {
  const cardsForStage =
    patientCards?.filter((card) => card.stage === stage) || [];

  return (
    <div
      key={stage}
      className="min-h-40 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">{stage}</h3>
        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
          {cardsForStage.length}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {cardsForStage.length > 0 ? (
          cardsForStage.map((card) => (
            <Link
  key={card.id}
  href={`/patients/${card.id}`}
  className="block rounded-xl border border-slate-700 bg-slate-900 p-4 transition hover:border-cyan-300/60 hover:bg-slate-800"
>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {card.patient_display_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {card.level_of_care || "LOC not set"}
                  </p>
                </div>

                <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-medium text-cyan-200">
                  {card.priority}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <p>
                  <span className="text-slate-500">Expected:</span>{" "}
                  {card.expected_date || "Not set"}
                  {card.expected_time ? ` at ${card.expected_time}` : ""}
                </p>

                <p>
                  <span className="text-slate-500">Clinical:</span>{" "}
                  {card.clinical_clearance_status}
                </p>

                {card.blocker ? (
                  <p className="text-amber-200">
                    <span className="text-amber-300">Blocker:</span>{" "}
                    {card.blocker}
                  </p>
                ) : null}

                {card.next_action ? (
                  <p>
                    <span className="text-slate-500">Next:</span>{" "}
                    {card.next_action}
                  </p>
                ) : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-500">
            No cards yet.
          </div>
        )}
      </div>
    </div>
  );
})}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-bold text-white">Recent Updates</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Activity logs will preserve who updated what, when it happened,
                and what the next action is.
              </p>

              <div className="mt-5 space-y-3">
  {recentActivityLogs && recentActivityLogs.length > 0 ? (
    recentActivityLogs.map((log) => (
      <article
        key={log.id}
        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm"
      >
        <p className="font-semibold text-slate-100">{log.summary}</p>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(log.created_at).toLocaleString()}
        </p>
        {log.detail ? (
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {log.detail}
          </p>
        ) : null}
      </article>
    ))
  ) : (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
      No activity logged yet.
    </div>
  )}
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
