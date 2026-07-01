import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
    stage?: string;
    lead_source?: string;
    conversion_status?: string;
  }>;
};

type PatientCard = {
  id: string;
  patient_display_name: string;
  stage: string;
  level_of_care: string | null;
  expected_date: string | null;
  expected_time: string | null;
  blocker: string | null;
  next_action: string | null;
  priority: string | null;
  clinical_clearance_status: string | null;
  lead_source: string | null;
  referral_source_name: string | null;
  current_location_setting: string | null;
  detox_referred_to: string | null;
  current_detox: string | null;
  conversion_status: string | null;
  assigned_owner: string | null;
  next_follow_up_due_at: string | null;
  next_action_due_at: string | null;
};

type ActivityLog = {
  id: string;
  stage_at_time: string | null;
  update_type: string | null;
  update_note: string | null;
  next_action: string | null;
  next_action_due_at: string | null;
  created_at: string;
};

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

const leadSourceOptions = [
  { value: "", label: "All sources" },
  { value: "google_ad", label: "Google Ad" },
  { value: "outreach", label: "Outreach" },
  { value: "family", label: "Family" },
  { value: "provider", label: "Provider" },
  { value: "hospital", label: "Hospital" },
  { value: "detox", label: "Detox" },
  { value: "self", label: "Self" },
  { value: "other", label: "Other" },
];

const conversionStatusOptions = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "likely", label: "Likely" },
  { value: "uncertain", label: "Uncertain" },
  { value: "lost", label: "Lost" },
  { value: "admitted", label: "Admitted" },
  { value: "closed", label: "Closed" },
];

function isOverdue(dateValue: string | null) {
  if (!dateValue) return false;

  return new Date(dateValue).getTime() < Date.now();
}

function isDueToday(dateValue: string | null) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isUpcoming(dateValue: string | null) {
  if (!dateValue) return false;

  return new Date(dateValue).getTime() > Date.now();
}

function formatDateTime(dateValue: string | null) {
  if (!dateValue) return "Not set";

  return new Date(dateValue).toLocaleString();
}

function formatLeadSource(value: string | null) {
  if (!value) return "Source not set";

  const match = leadSourceOptions.find((option) => option.value === value);

  return match?.label || value;
}

function formatShortDate(dateValue: string | null) {
  if (!dateValue) return "Not set";

  return new Date(dateValue).toLocaleDateString();
}

export default async function Home({ searchParams }: HomePageProps) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const signedInEmail = user.email || "Signed in";
  const renderedAt = new Date().toLocaleString();

  const params = (await searchParams) || {};
  const searchQuery = params.q?.trim() || "";
  const selectedStage = params.stage || "";
  const selectedLeadSource = params.lead_source || "";
  const selectedConversionStatus = params.conversion_status || "";

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

  let patientCardsQuery = supabase
    .from("patient_cards")
    .select(
      "id, patient_display_name, stage, level_of_care, expected_date, expected_time, blocker, next_action, priority, clinical_clearance_status, lead_source, referral_source_name, current_location_setting, detox_referred_to, current_detox, conversion_status, assigned_owner, next_follow_up_due_at, next_action_due_at",
    )
    .eq("is_archived", false)
    .order("next_follow_up_due_at", {
      ascending: true,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false });

  if (selectedStage) {
    patientCardsQuery = patientCardsQuery.eq("stage", selectedStage);
  }

  if (selectedLeadSource) {
    patientCardsQuery = patientCardsQuery.eq("lead_source", selectedLeadSource);
  }

  if (selectedConversionStatus) {
    patientCardsQuery = patientCardsQuery.eq(
      "conversion_status",
      selectedConversionStatus,
    );
  }

  if (searchQuery) {
    patientCardsQuery = patientCardsQuery.or(
      [
        `patient_display_name.ilike.%${searchQuery}%`,
        `referral_source_name.ilike.%${searchQuery}%`,
        `detox_referred_to.ilike.%${searchQuery}%`,
        `current_detox.ilike.%${searchQuery}%`,
        `next_action.ilike.%${searchQuery}%`,
        `blocker.ilike.%${searchQuery}%`,
        `assigned_owner.ilike.%${searchQuery}%`,
      ].join(","),
    );
  }

  const { data: patientCardsData, error: patientCardsError } =
    await patientCardsQuery;

  const { data: recentActivityData } = await supabase
    .from("patient_activity_logs")
    .select(
      "id, stage_at_time, update_type, update_note, next_action, next_action_due_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const patientCards = (patientCardsData || []) as PatientCard[];
  const recentActivity = (recentActivityData || []) as ActivityLog[];
  const overdueCards = patientCards.filter((card) =>
  isOverdue(card.next_follow_up_due_at),
);

const dueTodayCards = patientCards.filter(
  (card) =>
    isDueToday(card.next_follow_up_due_at) &&
    !isOverdue(card.next_follow_up_due_at),
);

const upcomingCards = patientCards
  .filter((card) => isUpcoming(card.next_follow_up_due_at))
  .slice(0, 6);

const unassignedCards = patientCards.filter(
  (card) => !card.assigned_owner,
);

const workQueueSections = [
  {
    title: "Overdue Follow-Ups",
    count: overdueCards.length,
    cards: overdueCards,
    emptyText: "No overdue follow-ups.",
    badgeClass:
      "border-rose-400/40 bg-rose-400/10 text-rose-200",
  },
  {
    title: "Due Today",
    count: dueTodayCards.length,
    cards: dueTodayCards,
    emptyText: "Nothing else due today.",
    badgeClass:
      "border-amber-300/40 bg-amber-300/10 text-amber-100",
  },
  {
    title: "Upcoming",
    count: upcomingCards.length,
    cards: upcomingCards,
    emptyText: "No upcoming follow-ups set.",
    badgeClass:
      "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  },
  {
    title: "Unassigned",
    count: unassignedCards.length,
    cards: unassignedCards,
    emptyText: "All active cards have an owner.",
    badgeClass:
      "border-slate-600 bg-slate-800 text-slate-200",
  },
];
  const cardsByStage = stages.map((stage) => ({
    stage,
    cards: patientCards.filter((card) => card.stage === stage),
  }));

  const statCards = [
    {
      label: "Open Leads",
      value: openLeadsResult.count || 0,
      description: "Prospective patients still being worked by outreach.",
    },
    {
      label: "Detox Referrals",
      value: detoxReferralsResult.count || 0,
      description: "Leads needing detox or already referred to detox.",
    },
    {
      label: "Currently in Detox",
      value: currentlyInDetoxResult.count || 0,
      description: "People currently located in a detox setting.",
    },
    {
      label: "Expected From Detox",
      value: expectedFromDetoxResult.count || 0,
      description: "People expected or possibly expected to come after detox.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
              Staff Session
            </p>

            <p className="mt-2 text-sm text-slate-300">
              Signed in as{" "}
              <span className="font-semibold text-white">{signedInEmail}</span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Page loaded: {renderedAt}
            </p>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-rose-300/60 hover:bg-rose-400/10 hover:text-rose-100"
            >
              Sign out
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.5em] text-cyan-300">
                Outreach Movement Board
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-white md:text-5xl">
                Outreach, Detox Pathway, Admission Movement, and Follow-Up
                Visibility
              </h1>
              <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
                A human-centered operational board for prospective patient
                movement, lead origin, detox pathway tracking, blockers, next
                actions, follow-up ownership, and admission readiness.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              <p className="font-bold">Boundary</p>
              <p className="mt-2 max-w-sm leading-5">
                This tool does not replace Kipu, CRM, or Oceanside Housing
                census. It is a visibility layer for operational movement and
                accountability.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
  <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
        Work Queue
      </p>
      <h2 className="mt-2 text-2xl font-black text-white">
        My Follow-Ups / Overdue Work Queue
      </h2>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        Fast accountability view for follow-ups, overdue items, upcoming work,
        and unassigned outreach movement cards.
      </p>
    </div>
  </div>

  <div className="grid gap-4 xl:grid-cols-4">
    {workQueueSections.map((section) => (
      <div
        key={section.title}
        className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white">{section.title}</h3>
          <span
            className={`rounded-full border px-2 py-1 text-xs font-semibold ${section.badgeClass}`}
          >
            {section.count}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {section.cards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-xs text-slate-500">
              {section.emptyText}
            </div>
          ) : (
            section.cards.slice(0, 5).map((card) => (
              <Link
                key={`${section.title}-${card.id}`}
                href={`/patients/${card.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition hover:border-cyan-300/60 hover:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {card.patient_display_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {card.stage}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-semibold text-slate-300">
                    {card.priority || "normal"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs">
                  <p className="text-slate-400">
                    Owner:{" "}
                    <span className="text-slate-200">
                      {card.assigned_owner || "Unassigned"}
                    </span>
                  </p>

                  <p className="text-slate-400">
                    Due:{" "}
                    <span className="text-slate-200">
                      {formatDateTime(card.next_follow_up_due_at)}
                    </span>
                  </p>

                  <p className="text-slate-400">
                    Next:{" "}
                    <span className="text-slate-200">
                      {card.next_action || "Not set"}
                    </span>
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    ))}
  </div>
</section>

        <section className="grid gap-4 md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{card.label}</p>
              <p className="mt-2 text-4xl font-black text-white">
                {card.value}
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-400">
                {card.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <form className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] md:items-end">
            <label className="flex flex-col gap-2 text-xs text-slate-400">
              Search
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Name, source, detox, blocker, owner, next action"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs text-slate-400">
              Stage
              <select
                name="stage"
                defaultValue={selectedStage}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              >
                <option value="">All stages</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs text-slate-400">
              Lead Source
              <select
                name="lead_source"
                defaultValue={selectedLeadSource}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              >
                {leadSourceOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs text-slate-400">
              Conversion
              <select
                name="conversion_status"
                defaultValue={selectedConversionStatus}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300"
              >
                {conversionStatusOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Search
            </button>

            <Link
              href="/"
              className="rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-bold text-slate-200 transition hover:bg-slate-800"
            >
              Clear
            </Link>
          </form>
        </section>

        {patientCardsError ? (
          <section className="rounded-2xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm text-rose-100">
            Unable to load movement cards: {patientCardsError.message}
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Outreach Movement Board
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Showing {patientCards.length} active movement card
                  {patientCards.length === 1 ? "" : "s"}. Cards move through
                  outreach, detox, and pre-admission stages as ownership,
                  blockers, and next actions change.
                </p>
              </div>

              <Link
                href="/patients/new"
                className="rounded-xl bg-cyan-300 px-5 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Add Movement Card
              </Link>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {cardsByStage.map(({ stage, cards }) => (
                <section
                  key={stage}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{stage}</h3>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      {cards.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {cards.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-xs text-slate-500">
                        No cards yet.
                      </div>
                    ) : (
                      cards.map((card) => (
                        <Link
                          key={card.id}
                          href={`/patients/${card.id}`}
                          className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-cyan-300/60 hover:bg-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-white">
                                {card.patient_display_name}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {card.level_of_care || "LOC not set"}
                              </p>
                            </div>

                            <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs font-semibold text-cyan-200">
                              {card.priority || "normal"}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col gap-2 text-xs">
                            <p className="text-slate-400">
                              Source:{" "}
                              <span className="text-slate-200">
                                {formatLeadSource(card.lead_source)}
                              </span>
                            </p>

                            <p className="text-slate-400">
                              Expected:{" "}
                              <span className="text-slate-200">
                                {card.expected_date
                                  ? `${formatShortDate(card.expected_date)}${
                                      card.expected_time
                                        ? ` at ${card.expected_time}`
                                        : ""
                                    }`
                                  : "Not set"}
                              </span>
                            </p>

                            <p className="text-slate-400">
                              Clinical:{" "}
                              <span className="text-slate-200">
                                {card.clinical_clearance_status || "not started"}
                              </span>
                            </p>

                            <p className="text-slate-400">
                              Owner:{" "}
                              <span className="text-slate-200">
                                {card.assigned_owner || "Unassigned"}
                              </span>
                            </p>

                            <p className="text-slate-400">
                              Follow-up:{" "}
                              <span className="text-slate-200">
                                {formatDateTime(card.next_follow_up_due_at)}
                              </span>
                            </p>

                            <p className="text-slate-400">
                              Next:{" "}
                              <span className="text-slate-200">
                                {card.next_action || "Not set"}
                              </span>
                            </p>

                            {card.blocker ? (
                              <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-amber-100">
                                Blocker: {card.blocker}
                              </p>
                            ) : null}

                            {isOverdue(card.next_follow_up_due_at) ? (
                              <p className="rounded-lg border border-rose-400/40 bg-rose-400/10 px-2 py-1 font-semibold text-rose-200">
                                Follow-up overdue
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-black text-white">Recent Updates</h2>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Activity logs will preserve who updated what, when it happened,
                and what the next action is.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                {recentActivity.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-xs text-slate-500">
                    No activity yet.
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <p className="text-sm font-bold text-white">
                        {activity.update_type || "updated"} at{" "}
                        {activity.stage_at_time || "Unknown Stage"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-slate-300">
                        {activity.update_note || "No note recorded."}
                      </p>

                      {activity.next_action ? (
                        <p className="mt-2 text-xs text-cyan-200">
                          Next: {activity.next_action}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="text-xl font-black text-white">
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

            <section className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5">
              <h2 className="text-xl font-black text-amber-100">
                Minimum Necessary Reminder
              </h2>
              <p className="mt-3 text-sm leading-6 text-amber-50/90">
                Operational updates only. Clinical notes, therapy content,
                diagnoses, and unnecessary PHI stay in the correct system of
                record.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}