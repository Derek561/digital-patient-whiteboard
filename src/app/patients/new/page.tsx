import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPatientCard } from "./actions";
import DictationTextarea from "@/components/DictationTextarea";

type NewPatientPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

const captureTypes = [
  {
    value: "potential_client",
    label: "Potential Client",
    helper: "New lead we are working.",
  },
  {
    value: "referral_source_admission",
    label: "Referral Source Admission",
    helper: "Coming from a referral source.",
  },
  {
    value: "relapse_detox",
    label: "Relapse / Detox",
    helper: "Client or lead in detox.",
  },
];

const sourceOptions = [
  "Allure",
  "Banyan",
  "Amethyst",
  "The Palms",
  "Still Detox",
  "Level-Up",
  "The Best Treatment - TBT",
  "Beacon",
  "Family",
  "Self",
  "Other",
  "Unknown",
];

const locationOptions = [
  { value: "unknown", label: "Unknown" },
  { value: "home", label: "Home" },
  { value: "street_unstable", label: "Street / unstable" },
  { value: "detox", label: "Detox" },
  { value: "hospital", label: "Hospital / medical" },
  { value: "jail", label: "Jail / legal setting" },
  { value: "using_active_relapse", label: "Using / active relapse" },
  { value: "with_family", label: "With family" },
  { value: "other", label: "Other" },
];

const ownerOptions = [
  "Derek",
  "Matt",
  "Dominic",
  "Drew",
  "Admissions",
  "Outreach",
  "Case Manager",
];

const nextActionOptions = [
  "Call back needed",
  "Confirm detox placement",
  "Confirm discharge date",
  "Confirm transportation",
  "Send to admissions",
  "Waiting on referral source",
  "Follow up tomorrow",
  "No action yet",
  "Other",
];

export default async function NewPatientPage({
  searchParams,
}: NewPatientPageProps) {
  const message = (await searchParams)?.message;

  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-bold text-cyan-300">
            Back to dashboard
          </Link>

          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Staff Capture
          </span>
        </div>

        <header className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">
            Outreach Movement Board
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
            Add Lead
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Fast phone-first entry. Pick what this is, who it is, where they are,
            who owns it, and what happens next.
          </p>
        </header>

        {message ? (
          <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            {message}
          </div>
        ) : null}

        <form
          action={createPatientCard}
          className="mt-5 grid gap-5 rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6"
        >
          <section>
            <h2 className="text-xl font-black text-white">
              What are you adding?
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {captureTypes.map((type) => (
                <label
                  key={type.value}
                  className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-950 p-4 transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
                >
                  <input
                    type="radio"
                    name="capture_type"
                    value={type.value}
                    defaultChecked={type.value === "potential_client"}
                    className="peer sr-only"
                  />

                  <span className="block text-base font-black text-white peer-checked:text-cyan-200">
                    {type.label}
                  </span>

                  <span className="mt-2 block text-xs leading-5 text-slate-400">
                    {type.helper}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-5">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Who is it?
              <input
                name="patient_display_name"
                required
                placeholder="Example: John S, J.S., or approved display name"
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Source
              <select
                name="source_or_facility"
                defaultValue=""
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              >
                <option value="">Select source or facility</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Other source name
                <input
                  name="other_source_name"
                  placeholder="Type source if not listed"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Where now?
              <select
                name="current_location_setting"
                defaultValue="unknown"
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              >
                {locationOptions.map((location) => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Owner
              <select
                name="assigned_owner"
                defaultValue=""
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              >
                <option value="">Select owner</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Follow up
              <input
                name="next_follow_up_due_at"
                type="datetime-local"
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              />
            </label>
          </section>

          <section className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Next step
              <select
                name="next_action"
                defaultValue="Call back needed"
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              >
                {nextActionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
              Priority
              <select
                name="priority"
                defaultValue="medium"
                className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </section>

          <DictationTextarea
            name="quick_note"
            label="Note"
            rows={5}
            placeholder="Example: At Banyan. Possible discharge Friday. Drew calls back tomorrow."
            helperText="Phone tip: use the keyboard mic if needed."
          />

          <details className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <summary className="cursor-pointer text-base font-black text-cyan-200">
              More details, if needed
            </summary>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Expected Admission Date
                <input
                  name="expected_date"
                  type="date"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Expected Admission Time
                <input
                  name="expected_time"
                  type="time"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Tentative Detox DC Date
                <input
                  name="tentative_detox_dc_date"
                  type="date"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Target Program
                <select
                  name="target_program"
                  defaultValue=""
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                >
                  <option value="">Not set</option>
                  <option value="PHP">PHP</option>
                  <option value="IOP">IOP</option>
                  <option value="OP">OP</option>
                  <option value="Housing">Housing</option>
                  <option value="Detox referral only">Detox referral only</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Detox Needed?
                <select
                  name="detox_needed"
                  defaultValue="unknown"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Detox Referred To
                <input
                  name="detox_referred_to"
                  placeholder="Facility name"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Current Detox
                <input
                  name="current_detox"
                  placeholder="Facility name"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Blocker
                <input
                  name="blocker"
                  placeholder="Transport, insurance, documents, phone off, other"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Expected From Detox?
                <select
                  name="expected_from_detox"
                  defaultValue="unknown"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-300">
                Expected To Admit After Detox?
                <select
                  name="expected_to_admit_after_detox"
                  defaultValue="unknown"
                  className="min-h-14 rounded-xl border border-slate-700 bg-slate-950 px-4 py-4 text-base text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </label>

              <input name="lead_source" type="hidden" value="outreach" />
            </div>
          </details>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Operational movement only. Clinical notes, diagnoses, therapy
            content, trauma details, and unnecessary PHI stay in the correct
            system of record.
          </div>

          <div className="sticky bottom-3 z-10 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur">
            <button
              type="submit"
              className="min-h-14 w-full rounded-xl bg-cyan-300 px-4 py-4 text-base font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Save Lead
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}