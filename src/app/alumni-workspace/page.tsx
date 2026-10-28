import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireStaff() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login?next=%2Falumni-workspace");
  const { data: profile } = await db.from("profiles").select("is_active").eq("id", user.id).maybeSingle();
  const { data: alumniStaff } = await db.from("alumni_staff_roles").select("alumni_role,is_active").eq("staff_id", user.id).maybeSingle();
  if (!profile?.is_active || !alumniStaff?.is_active) redirect("/login?message=Alumni%20access%20not%20active");
  return { db, user, alumniRole: alumniStaff.alumni_role };
}

async function recordFictionalContact(form: FormData) {
  "use server";
  const { db, user } = await requireStaff();
  const alumniId = String(form.get("alumni_id") ?? "");
  const channel = String(form.get("channel") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const nextAction = String(form.get("next_action") ?? "").trim();
  const dueOn = String(form.get("due_on") ?? "");
  if (!["sms", "email", "call"].includes(channel) || !note || note.length > 500 || !nextAction || nextAction.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(dueOn)) {
    redirect("/alumni-workspace?error=Please%20complete%20all%20fields");
  }
  const { data: person } = await db.from("alumni_people").select("id,is_fictional,sms_allowed,email_allowed,call_allowed").eq("id", alumniId).maybeSingle();
  if (!person?.is_fictional || !(channel === "sms" ? person.sms_allowed : channel === "email" ? person.email_allowed : person.call_allowed)) {
    redirect("/alumni-workspace?error=Contact%20not%20permitted");
  }
  const { data: conversation, error: cError } = await db.from("alumni_conversations").insert({ alumni_id: alumniId, channel, assigned_staff_id: user.id }).select("id").single();
  if (cError || !conversation) redirect("/alumni-workspace?error=Could%20not%20save%20conversation");
  const { error: mError } = await db.from("alumni_messages").insert({ conversation_id: conversation.id, direction: "outbound", body: note, delivery_state: "simulated", created_by: user.id });
  if (mError) redirect("/alumni-workspace?error=Could%20not%20save%20message");
  const { error: fError } = await db.from("alumni_followups").insert({ alumni_id: alumniId, conversation_id: conversation.id, assigned_staff_id: user.id, next_action: nextAction, due_on: dueOn });
  if (fError) redirect("/alumni-workspace?error=Could%20not%20save%20followup");
  await db.from("alumni_events").insert({ alumni_id: alumniId, actor_id: user.id, event_type: "fictional_contact_recorded", object_type: "conversation", object_id: conversation.id, event_data: { channel } });
  revalidatePath("/alumni-workspace");
  redirect("/alumni-workspace?saved=1");
}

export default async function AlumniWorkspace({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { db, user, alumniRole } = await requireStaff();
  const params = await searchParams;
  const [{ data: people, error: peopleError }, { data: conversations }, { data: followups }] = await Promise.all([
    db.from("alumni_people").select("id,display_name,sms_allowed,email_allowed,call_allowed").order("display_name"),
    db.from("alumni_conversations").select("id,alumni_id,channel,created_at").order("created_at", { ascending: false }).limit(30),
    db.from("alumni_followups").select("id,alumni_id,next_action,due_on,status").eq("status","open").order("due_on").limit(30),
  ]);
  const label = new Map<string, string>((people ?? []).map(p => [p.id, p.display_name] as const));
  return <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-8">
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="rounded-2xl border border-sky-800 bg-slate-900 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Simple Path Recovery</p>
        <h1 className="mt-1 text-3xl font-bold">Alumni Connect | Saved Demo</h1>
        <p className="mt-2 text-sm text-slate-300">Fictional contacts, real database storage. No calls or messages are sent.</p>
        <p className="mt-2 text-xs text-slate-400">Signed in: {user.email} · {alumniRole === "admin" ? "Administrator" : "Liaison"}</p>
      </header>
      {params.saved && <p role="status" className="rounded-lg bg-emerald-900 p-3">Fictional interaction and follow-up saved in Supabase.</p>}
      {params.error && <p role="alert" className="rounded-lg bg-rose-900 p-3">{params.error}</p>}
      {peopleError && <p role="alert">Unable to load fictional alumni records.</p>}
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold">Record a fictional interaction</h2>
        <form action={recordFictionalContact} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">Alumnus
            <select name="alumni_id" required className="rounded-lg bg-slate-950 p-3">{(people ?? []).filter(p=>p.sms_allowed||p.email_allowed||p.call_allowed).map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select>
          </label>
          <label className="grid gap-2 text-sm">Method
            <select name="channel" className="rounded-lg bg-slate-950 p-3"><option value="sms">Text (simulation)</option><option value="email">Email (simulation)</option><option value="call">Call (simulation)</option></select>
          </label>
          <label className="grid gap-2 text-sm sm:col-span-2">What happened (fictional)
            <textarea name="note" maxLength={500} required placeholder="Example: Simulated reply requesting a check-in" className="min-h-24 rounded-lg bg-slate-950 p-3"/>
          </label>
          <label className="grid gap-2 text-sm">Next step<input name="next_action" maxLength={120} required defaultValue="Check in again" className="rounded-lg bg-slate-950 p-3"/></label>
          <label className="grid gap-2 text-sm">Follow-up date<input name="due_on" type="date" required className="rounded-lg bg-slate-950 p-3"/></label>
          <button type="submit" className="rounded-xl bg-sky-300 p-3 font-semibold text-slate-950 sm:col-span-2">Save fictional contact and follow-up</button>
        </form>
        <p className="mt-3 text-xs text-amber-300">Taylor Brooks is excluded because all contact permissions are revoked. Every submission is rechecked on the server.</p>
      </section>
      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><h2 className="text-lg font-semibold">Saved conversation history ({conversations?.length ?? 0})</h2>
        <ul className="mt-3 space-y-2">{(conversations ?? []).map(c=><li className="rounded-lg bg-slate-950 p-3 text-sm" key={c.id}>{label.get(c.alumni_id) ?? "Fictional alumnus"} · {c.channel.toUpperCase()}<p className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</p></li>)}</ul></section>
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><h2 className="text-lg font-semibold">Shared follow-up queue ({followups?.length ?? 0})</h2>
        <ul className="mt-3 space-y-2">{(followups ?? []).map(f=><li key={f.id} className="rounded-lg bg-slate-950 p-3 text-sm"><strong>{label.get(f.alumni_id) ?? "Fictional alumnus"}</strong><p>{f.next_action}</p><p className="text-xs text-sky-300">Due {f.due_on}</p></li>)}</ul></section>
      </div>
    </div>
  </main>;
}
