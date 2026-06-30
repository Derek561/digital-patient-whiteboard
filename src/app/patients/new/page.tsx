import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPatientCard } from "./actions";

type NewPatientPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
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

const nextActionOptions = [
  "Call back needed",
  "Left voicemail",
  "Waiting on response",
  "Needs screening",
  "Needs insurance verification",
  "Needs detox placement",
  "Confirm detox admission",
  "Confirm detox discharge",
  "Confirm transportation",
  "Schedule admission",
  "Follow up tomorrow",
  "Escalate to supervisor",
  "No further action",
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
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <section className="mx-auto w-full max-w-5xl">
        <Link href="/" className="text-sm font-medium text-cyan-300">
          Back to dashboard
        </Link>

        <header className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Digital Patient Whiteboard
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Quick Capture Movement Card
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Capture the minimum operational details while the call or outreach
            contact is active. Full profile details can be completed later.
          </p>
        </header>

        {message ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            {message}
          </div>
        ) : null}

        <form
          action={createPatientCard}
          className="mt-6 grid gap-6 rounded-3xl border border-slate-800 bg-slate-900 p-6"
        >
          <section>
            <h2 className="text-xl font-bold text-white">Quick Capture</h2>
            <p className="mt-1 text-sm text-slate-400">
              Use this section during live calls. Keep it fast and operational.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Lead / Patient Display Name
                <input
                  name="patient_display_name"
                  required
                  placeholder="Example: J.S. or approved display name"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Stage
                <select
                  name="stage"
                  defaultValue="New Inquiry / Lead"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Lead Source
                <select
                  name="lead_source"
                  defaultValue=""
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="">Select source</option>
                  <option value="google_ad">Google Ad</option>
                  <option value="outreach">Outreach</option>
                  <option value="family">Family</option>
                  <option value="provider">Provider</option>
                  <option value="hospital">Hospital</option>
                  <option value="detox">Detox</option>
                  <option value="self">Self</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Location / Setting
                <select
                  name="current_location_setting"
                  defaultValue="unknown"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="home">Home</option>
                  <option value="hospital">Hospital / Medical</option>
                  <option value="detox">Detox</option>
                  <option value="jail">Jail / Legal Custody</option>
                  <option value="residential">Residential Treatment</option>
                  <option value="outside_php_iop">Outside PHP / IOP</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Detox Needed?
                <select
                  name="detox_needed"
                  defaultValue="unknown"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Next Action
                <select
                  name="next_action"
                  defaultValue=""
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="">Select next action</option>
                  {nextActionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-5">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Quick Note
                <textarea
                  name="operational_notes"
                  rows={4}
                  placeholder="Short operational note only. No clinical content, diagnoses, or therapy details."
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
            </div>
          </section>

          <details className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <summary className="cursor-pointer text-sm font-bold text-cyan-200">
              Show advanced details
            </summary>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Referral Source Name
                <input
                  name="referral_source_name"
                  placeholder="Specific person, facility, campaign, or source"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Target Program
                <input
                  name="target_program"
                  placeholder="PHP, IOP, OP, housing, detox referral only"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Detox Referred To
                <input
                  name="detox_referred_to"
                  placeholder="Detox facility we referred to"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Detox
                <input
                  name="current_detox"
                  placeholder="Detox facility where person is currently located"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Expected From Detox?
                <select
                  name="expected_from_detox"
                  defaultValue="unknown"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Expected To Admit After Detox?
                <select
                  name="expected_to_admit_after_detox"
                  defaultValue="unknown"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Conversion Status
                <select
                  name="conversion_status"
                  defaultValue="open"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="open">Open</option>
                  <option value="likely">Likely</option>
                  <option value="uncertain">Uncertain</option>
                  <option value="lost">Lost</option>
                  <option value="admitted">Admitted</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Priority
                <select
                  name="priority"
                  defaultValue="medium"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Next Follow-Up Due
                <input
                  name="next_follow_up_due_at"
                  type="datetime-local"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Blocker
                <input
                  name="blocker"
                  placeholder="Insurance, transport, documents, approval, other"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
            </div>
          </details>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Quick capture is for operational movement only. Clinical notes,
            diagnoses, therapy content, trauma details, and unnecessary PHI stay
            in the correct system of record.
          </div>

          <button
            type="submit"
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Save Movement Card
          </button>
        </form>
      </section>
    </main>
  );
}
