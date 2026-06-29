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
      <section className="mx-auto w-full max-w-4xl">
        <Link href="/" className="text-sm font-medium text-cyan-300">
          Back to dashboard
        </Link>

        <header className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Digital Patient Whiteboard
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            Add Patient Card
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Add minimum necessary operational information only. This is not a
            clinical note, CRM record, or housing census entry.
          </p>
        </header>

        {message ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            {message}
          </div>
        ) : null}

        <form
          action={createPatientCard}
          className="mt-6 grid gap-5 rounded-3xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Patient Display Name
              <input
                name="patient_display_name"
                required
                placeholder="Example: J.S."
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Stage
              <select
                name="stage"
                defaultValue="Prospective Lead"
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
              Level of Care
              <input
                name="level_of_care"
                placeholder="PHP, IOP, OP, Housing, Detox referral"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Referral Source
              <input
                name="referral_source"
                placeholder="Outreach, family, provider, hospital, self"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Expected Date
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
              Location Need
              <input
                name="location_need"
                placeholder="Housing, home, detox, hotel, unknown"
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
                <option value="denied_referred_out">Denied / Referred Out</option>
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

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Blocker
            <input
              name="blocker"
              placeholder="Example: insurance card pending"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            Next Action
            <input
              name="next_action"
              placeholder="Example: call referral source before noon"
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

          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
            Reminder: do not enter clinical notes, therapy content, diagnoses,
            trauma details, or unnecessary PHI.
          </div>

          <button
            type="submit"
            className="rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Create Patient Card
          </button>
        </form>
      </section>
    </main>
  );
}
