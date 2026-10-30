import AlumniSectionNav from "@/components/AlumniSectionNav";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function staffSession() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login?next=%2Falumni-workspace");
  const [{ data: profile }, { data: role }] = await Promise.all([
    db.from("profiles").select("is_active").eq("id", user.id).maybeSingle(),
    db.from("alumni_staff_roles").select("is_active,alumni_role").eq("staff_id", user.id).maybeSingle(),
  ]);
  if (!profile?.is_active || !role?.is_active) redirect("/login?message=Alumni%20access%20not%20active");
  return { db, user };
}

async function saveReply(form: FormData) {
  "use server";
  const { db, user } = await staffSession();
  const conversationId = String(form.get("conversation") ?? "");
  const direction = String(form.get("direction") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !["inbound", "outbound"].includes(direction) || body.length < 1 || body.length > 1000) {
    redirect("/alumni-workspace/inbox?error=Check%20message%20details");
  }
  const { data: conversation } = await db.from("alumni_conversations").select("id,alumni_id,channel").eq("id", conversationId).maybeSingle();
  if (!conversation) redirect("/alumni-workspace/inbox?error=Conversation%20unavailable");
  const { data: person } = await db.from("alumni_people").select("is_fictional,sms_allowed,email_allowed,call_allowed").eq("id", conversation.alumni_id).maybeSingle();
  const permitted = conversation.channel === "sms" ? person?.sms_allowed : conversation.channel === "email" ? person?.email_allowed : person?.call_allowed;
  if (!person?.is_fictional || (direction === "outbound" && !permitted)) redirect("/alumni-workspace/inbox?error=Outgoing%20contact%20not%20permitted");
  const { error } = await db.from("alumni_messages").insert({
    conversation_id: conversationId, direction, body, created_by: user.id, delivery_state: "simulated",
  });
  if (error) redirect("/alumni-workspace/inbox?error=Could%20not%20save%20message");
  await db.from("alumni_events").insert({
    alumni_id: conversation.alumni_id, actor_id: user.id, event_type: direction === "inbound" ? "fictional_reply_entered" : "fictional_staff_response",
    object_type: "conversation", object_id: conversationId, event_data: { channel: conversation.channel },
  });
  revalidatePath("/alumni-workspace/inbox");
  redirect("/alumni-workspace/inbox?thread=" + encodeURIComponent(conversationId) + "&saved=1");
}

async function finishFollowup(form:FormData) {
 "use server";
 const {db,user}=await staffSession();
 const taskId=String(form.get("task_id")??"");
 const conversationId=String(form.get("conversation")??"");
 if(!/^[0-9a-f-]{36}$/i.test(taskId)||!/^[0-9a-f-]{36}$/i.test(conversationId))redirect("/alumni-workspace/inbox?error=Invalid%20task");
 const {data:conversation}=await db.from("alumni_conversations").select("id,alumni_id").eq("id",conversationId).maybeSingle();
 if(!conversation)redirect("/alumni-workspace/inbox?error=Conversation%20unavailable");
 const {data:task}=await db.from("alumni_followups").select("id,status,alumni_id").eq("id",taskId).eq("alumni_id",conversation.alumni_id).maybeSingle();
 if(!task||task.status!=="open")redirect("/alumni-workspace/inbox?thread="+conversationId+"&error=Task%20not%20open");
 const {error}=await db.from("alumni_followups").update({status:"completed",completed_at:new Date().toISOString(),completed_by:user.id}).eq("id",taskId).eq("alumni_id",conversation.alumni_id).eq("status","open");
 if(error)redirect("/alumni-workspace/inbox?thread="+conversationId+"&error=Task%20update%20failed");
 await db.from("alumni_events").insert({alumni_id:conversation.alumni_id,actor_id:user.id,event_type:"followup_completed",object_type:"followup",object_id:taskId,event_data:{source:"shared_inbox"}});
 revalidatePath("/alumni-workspace");revalidatePath("/alumni-workspace/alumni/"+conversation.alumni_id);
 redirect("/alumni-workspace/inbox?thread="+conversationId+"&taskdone=1");
}
export default async function SharedInbox({ searchParams }: { searchParams: Promise<{ thread?: string; saved?: string; error?: string; taskdone?:string }> }) {
  const { db, user } = await staffSession();
  const params = await searchParams;
  const [{ data: people }, { data: conversations }, { data: staffProfiles }] = await Promise.all([
    db.from("alumni_people").select("id,display_name,sms_allowed,email_allowed,call_allowed").order("display_name"),
    db.from("alumni_conversations").select("id,alumni_id,channel,created_at").order("created_at", { ascending: false }).limit(100),
    db.from("profiles").select("id,full_name"),
  ]);
  const names = new Map<string,string>((people ?? []).map(p => [p.id, p.display_name] as const));
  const staffNames = new Map<string,string>((staffProfiles ?? []).map(p => [p.id, p.full_name || "Staff"] as const));
  const selected = (conversations ?? []).find(c => c.id === params.thread) ?? conversations?.[0];
  const selectedPerson = (people ?? []).find(p => p.id === selected?.alumni_id);
  const allowed = selected?.channel === "sms" ? selectedPerson?.sms_allowed : selected?.channel === "email" ? selectedPerson?.email_allowed : selectedPerson?.call_allowed;
  const { data: messages, error: messagesError } = selected
    ? await db.from("alumni_messages").select("id,direction,body,created_by,created_at").eq("conversation_id", selected.id).order("created_at", { ascending: true }).limit(100)
    : { data: [], error: null };
  const [{data:relatedTasks},{data:relatedSupport}]=selected?await Promise.all([
    db.from("alumni_followups").select("id,next_action,due_on,status,assigned_staff_id").eq("alumni_id",selected.alumni_id).eq("status","open").order("due_on").limit(20),
    db.from("alumni_support_requests").select("id,category,summary,status,assigned_staff_id").eq("alumni_id",selected.alumni_id).in("status",["open","in_progress"]).limit(20)
  ]):[{data:[]},{data:[]}];
  return <main className="ac-unified-page"><AlumniSectionNav current="inbox"/>
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="rounded-2xl border border-sky-700/40 bg-slate-900 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Simple Path Recovery</p>
        <h1 className="mt-1 text-2xl font-bold">Alumni Connect | Shared Inbox</h1>
        <p className="mt-2 text-sm text-slate-300">One shared conversation history. Fictional messages only. No texts or emails are delivered.</p>
        <p className="mt-2 text-xs text-slate-400">Signed in: {user.email}</p>
        <Link href="/alumni-workspace" className="mt-3 inline-block text-sm text-sky-300 underline">Back to staff workspace</Link>
      </header>
      {params.taskdone && <p role="status" className="rounded-lg bg-emerald-900 p-3">Follow-up completed by the signed-in staff member.</p>}
      {params.saved && <p role="status" className="rounded-lg bg-emerald-900 p-3">Fictional message saved to the shared conversation.</p>}
      {params.error && <p role="alert" className="rounded-lg bg-rose-900 p-3">{params.error}</p>}
      <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
        <nav aria-label="Conversations" className="rounded-xl border border-slate-700 bg-slate-900 p-3">
          <h2 className="mb-3 font-semibold">Conversations ({conversations?.length ?? 0})</h2>
          <div className="space-y-2">{(conversations ?? []).map(c =>
            <Link key={c.id} href={"/alumni-workspace/inbox?thread=" + c.id}
              className={`block rounded-lg border p-3 text-sm ${selected?.id === c.id ? "border-sky-400 bg-sky-900/30" : "border-slate-700 bg-slate-950"}`}>
              <strong>{names.get(c.alumni_id) ?? "Fictional alumnus"}</strong>
              <p className="mt-1 text-xs text-slate-300">{c.channel.toUpperCase()} · {new Date(c.created_at).toLocaleDateString()}</p>
            </Link>)}
          </div>
        </nav>
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          {!selected ? <p className="text-slate-300">No conversations yet. Record a fictional interaction in the staff workspace to begin.</p> : <>
            <h2 className="text-xl font-semibold">{names.get(selected.alumni_id) ?? "Fictional alumnus"} · {selected.channel.toUpperCase()}</h2>
            <p className="mt-1 text-xs text-slate-400">Shared with all authorized staff. Messages identify the sender and the staff member who recorded or processed them.</p>
            {messagesError && <p className="mt-3 text-rose-300">Could not load this conversation.</p>}
            <ol className="mt-4 space-y-3">{(messages ?? []).map(m =>
              <li key={m.id} className={`max-w-[90%] rounded-xl p-3 text-sm ${m.direction === "outbound" ? "ml-auto bg-sky-900/50" : "bg-slate-800"}`}>
                <p className="text-xs font-semibold text-sky-200">{m.direction === "inbound" ? ""Fictional alumnus · incoming" : "SPR staff · simulated response"}</p>
                <p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(m.created_at).toLocaleString()} · {m.direction==="inbound"?"Processed by ":"Recorded by "}{staffNames.get(m.created_by ?? "") ?? "Unknown staff"}</p>
              </li>)}</ol>
            <section className="mt-5 rounded-xl border border-slate-300 bg-white p-4 text-slate-900">
              <h3 className="font-bold">Related work · {names.get(selected.alumni_id)??"Alumnus"}</h3>
              <p className="mt-1 text-xs text-slate-600">Open support and follow-ups, visible while staff communicate. A message alone does not prove a request was resolved.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div><h4 className="text-sm font-bold">Support ({relatedSupport?.length??0})</h4>
                 {(relatedSupport??[]).map(r=><div key={r.id} className="mt-2 rounded-lg border border-slate-200 p-2 text-sm"><strong>{r.category}</strong><p>{r.summary}</p><p className="text-xs text-slate-600">{r.status.replace("_"," ")} · {staffNames.get(r.assigned_staff_id??"")??"Unassigned"}</p></div>)}
                 {!(relatedSupport??[]).length&&<p className="mt-2 text-xs">No open support requests.</p>}
                 <Link href="/alumni-workspace/support" className="mt-2 inline-block text-sm text-blue-700 underline">Manage support →</Link>
                </div>
                <div><h4 className="text-sm font-bold">Follow-ups ({relatedTasks?.length??0})</h4>
                 {(relatedTasks??[]).map(t=><div key={t.id} className="mt-2 rounded-lg border border-slate-200 p-2 text-sm"><strong>{t.next_action}</strong><p className="text-xs text-slate-600">Due {t.due_on} · {staffNames.get(t.assigned_staff_id??"")??"Unassigned"}</p>
                  <form action={finishFollowup} className="mt-2"><input type="hidden" name="conversation" value={selected.id}/><input type="hidden" name="task_id" value={t.id}/><button className="rounded bg-teal-700 px-3 py-1 text-xs font-semibold text-white">Mark completed</button></form></div>)}
                 {!(relatedTasks??[]).length&&<p className="mt-2 text-xs">No open follow-ups.</p>}
                </div>
              </div>
              <Link className="mt-3 inline-block text-sm text-blue-700 underline" href={"/alumni-workspace/alumni/"+selected.alumni_id}>Full relationship history →</Link>
            </section>
            <form action={saveReply} className="mt-6 space-y-3 border-t border-slate-700 pt-4">
              <input type="hidden" name="conversation" value={selected.id}/>
              <label className="block text-sm">Test action
                <select name="direction" className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3">
                  {allowed && <option value="outbound">Write fictional staff response</option>}
                  <option value="inbound">Manually add fictional inbound exception</option>
                </select>
              </label>
              <label className="block text-sm">Message
                <textarea name="body" required maxLength={1000} rows={3} placeholder="Write a fictional message for the shared test conversation" className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3"/>
              </label>
              {!allowed && <p className="text-sm text-amber-300">Outgoing contact is not permitted. Incoming fictional replies can still be recorded.</p>}
              <button type="submit" className="w-full rounded-lg bg-sky-300 p-3 font-semibold text-slate-950">Save fictional message to conversation</button>
            </form>
          </>}
        </section>
      </div>
    </div>
  </main>;
}
