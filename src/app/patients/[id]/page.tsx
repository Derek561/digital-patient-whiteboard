import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { archivePatientCard, updatePatientCard } from "./actions";
import DictationTextarea from "@/components/DictationTextarea";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
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

export default async function PatientDetailPage({
  params,
  searchParams,
}: PatientDetailPageProps) {
  const { id } = await params;
  const message = (await searchParams)?.message;

  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: card, error } = await supabase
    .from("patient_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !card) {
    notFound();
  }

  const updatePatientCardWithId = updatePatientCard.bind(null, id);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <section className="mx-auto w-full max-w-5xl">
        <Link href="/" className="text-sm font-medium text-cyan-300">
          Back to dashboard
        </Link>

        <header className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Outreach Movement Card
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">
            {card.patient_display_name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Update stage, detox pathway, blocker, and next action. Use minimum
            necessary operational information only.
          </p>
        </header>

        {message ? (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            {message}
          </div>
        ) : null}

        <form
          action={updatePatientCardWithId}
          className="mt-6 grid gap-6 rounded-3xl border border-slate-800 bg-slate-900 p-6"
        >
          <section>
            <h2 className="text-xl font-bold text-white">Movement Status</h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Stage
                <select
                  name="stage"
                  defaultValue={card.stage || "New Inquiry / Lead"}
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
                Conversion Status
                <select
                  name="conversion_status"
                  defaultValue={card.conversion_status || "open"}
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
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white">
              Location / Detox Pathway
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Location / Setting
                <select
                  name="current_location_setting"
                  defaultValue={card.current_location_setting || "unknown"}
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
                  defaultValue={card.detox_needed || "unknown"}
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
                  defaultValue={card.detox_referred_to || ""}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Current Detox
                <input
                  name="current_detox"
                  defaultValue={card.current_detox || ""}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Expected From Detox?
                <select
                  name="expected_from_detox"
                  defaultValue={card.expected_from_detox || "unknown"}
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
                  defaultValue={card.expected_to_admit_after_detox || "unknown"}
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
              Follow-Up / Blocker
            </h2>

            <div className="mt-4 grid gap-5">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Blocker
                <input
                  name="blocker"
                  defaultValue={card.blocker || ""}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Next Action
                <input
                  name="next_action"
                  defaultValue={card.next_action || ""}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Next Follow-Up Due
                  <input
                    name="next_follow_up_due_at"
                    type="datetime-local"
                    defaultValue={
                      card.next_follow_up_due_at
                        ? card.next_follow_up_due_at.slice(0, 16)
                        : ""
                    }
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
  Assigned Owner
  <input
    name="assigned_owner"
    defaultValue={card.assigned_owner || ""}
    placeholder="Example: Derek, Admissions, Case Manager, Outreach"
    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
  />
</label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Next Action
                  <select
                    name="next_action"
                    defaultValue={card.next_action || ""}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-300"
                  >
                    <option value="">No next action selected</option>
                    <option value="Call back needed">Call back needed</option>
                    <option value="Left voicemail">Left voicemail</option>
                    <option value="Text sent">Text sent</option>
                    <option value="Waiting on detox confirmation">
                      Waiting on detox confirmation
                    </option>
                    <option value="Waiting on insurance verification">
                      Waiting on insurance verification
                    </option>
                    <option value="Waiting on transportation plan">
                      Waiting on transportation plan
                    </option>
                    <option value="Confirm discharge window">
                      Confirm discharge window
                    </option>
                    <option value="Confirm discharge window and transportation plan">
                      Confirm discharge window and transportation plan
                    </option>
                    <option value="Follow up tomorrow">
                      Follow up tomorrow
                    </option>
                    <option value="No further action today">
                      No further action today
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </label>

               <DictationTextarea
  name="quick_update_note"
  label="Quick Update Note"
  rows={3}
  placeholder="Optional. Example: Left voicemail with detox admissions office. Follow up tomorrow morning."
  helperText="Minimum necessary only. Phone users can tap the keyboard microphone. Desktop users can use Start Dictation if available."
/>
              </div>

              <label className="flex flex-col gap-2 text-sm text-slate-300">
                Operational Notes
                <textarea
                  name="operational_notes"
                  rows={4}
                  defaultValue={card.operational_notes || ""}
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
            Save Movement Update
          </button>
        </form>

        <section className="mt-6 rounded-3xl border border-rose-400/30 bg-rose-400/10 p-6">
          <h2 className="text-xl font-bold text-rose-100">
            Close / Archive Card
          </h2>

          <p className="mt-2 text-sm leading-6 text-rose-100/80">
            Use this only when the card should leave the active outreach board.
            This does not delete the record.
          </p>

          <form
            action={archivePatientCard.bind(null, card.id)}
            className="mt-5 space-y-4"
          >
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Close Reason
              <select
                name="close_reason"
                required
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-rose-300"
              >
                <option value="">Select reason</option>
                <option value="admitted_to_program">Admitted to program</option>
                <option value="admitted_elsewhere">Admitted elsewhere</option>
                <option value="lost_contact">Lost contact</option>
                <option value="not_appropriate">
                  Not appropriate for program
                </option>
                <option value="duplicate">Duplicate card</option>
                <option value="no_further_action">No further action</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Close Note
              <textarea
                name="close_note"
                rows={3}
                placeholder="Minimum necessary close note only."
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-rose-300"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-rose-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-rose-200"
            >
              Close and Archive Card
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
