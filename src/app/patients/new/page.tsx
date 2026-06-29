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

export default async function NewPatientPage({
  searchParams,
}: NewPatientPageProps) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const message = params?.message;

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
            Add Outreach / Patient Movement Card
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Track who is being worked on before admission, where the lead
            originated, where the person is currently located, whether detox is
            needed, and what must happen next to move them toward admission.
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
            <h2 className="text-xl font-bold text-white">Lead Identity</h2>
            <p className="mt-1 text-sm text-slate-400">
              Use minimum necessary identifying information.
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
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Lead Origin</h2>
            <p className="mt-1 text-sm text-slate-400">
              Capture where the call, lead, or referral came from.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Lead Source
                <select
                  name="lead_source"
                  defaultValue=""
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="">Select source</option>
                  <option value="google_ad">Google Ad</option>
                  <option value="organic">Organic</option>
                  <option value="referral_partner">Referral Partner</option>
                  <option value="family">Family</option>
                  <option value="alumni">Alumni</option>
                  <option value="self">Self</option>
                  <option value="provider">Provider</option>
                  <option value="hospital">Hospital</option>
                  <option value="detox">Detox</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Referral Source Name
                <input
                  name="referral_source_name"
                  placeholder="Specific person, facility, campaign, or source"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Current Location / Detox Pathway
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Track where the person is now and whether detox placement is part
              of the path.
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
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
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Program Target / Follow-Up
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Target Program
                <input
                  name="target_program"
                  placeholder="PHP, IOP, OP, housing, detox referral only"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
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
                Next Follow-Up Due
                <input
                  name="next_follow_up_due_at"
                  type="datetime-local"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
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
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">Admission Readiness</h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Expected Admission Date
                <input
                  name="expected_date"
                  type="date"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Expected Time / ETA
                <input
                  name="expected_time"
                  type="time"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Insurance / Payment
                <select
                  name="insurance_payment_status"
                  defaultValue="unknown"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="unknown">Unknown</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="issue">Issue</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Clinical Clearance
                <select
                  name="clinical_clearance_status"
                  defaultValue="not_started"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="not_started">Not Started</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied_referred_out">
                    Denied / Referred Out
                  </option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Transportation
                <select
                  name="transportation_status"
                  defaultValue="pending"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="not_needed">Not Needed</option>
                  <option value="issue">Issue</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Next Action Due
                <input
                  name="next_action_due_at"
                  type="datetime-local"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Blocker / Next Action
            </h2>

            <div className="mt-4 grid gap-5">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Blocker
                <input
                  name="blocker"
                  placeholder="Example: no answer, detox pending, insurance issue, clinical review needed"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Next Action
                <input
                  name="next_action"
                  placeholder="Example: call referral source, confirm detox admission, follow up tomorrow"
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Operational Notes
                <textarea
                  name="operational_notes"
                  rows={4}
                  placeholder="Minimum necessary operational update only."
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>
            </div>
          </section>

          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Reminder: do not enter clinical notes, therapy content, diagnoses,
            trauma details, or unnecessary PHI.
          </div>

          <button
            type="submit"
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Create Movement Card
          </button>
        </form>
      </section>
    </main>
  );
}
