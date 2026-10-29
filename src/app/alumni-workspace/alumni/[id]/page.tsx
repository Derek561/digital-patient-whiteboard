import AlumniSectionNav from "@/components/AlumniSectionNav";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NEXT_ACTIONS = ["Check in again","Call alumnus","Send text follow-up","Send email follow-up","Return requested call","Provide recovery resources","Assist with housing resources","Assist with employment resources","Assist with transportation resources","Review support request","Invite to alumni meeting","Coordinate with staff","No additional follow-up needed","Other"] as const;

const base = "/alumni-workspace/alumni/";
async function authorize() {
  const db = await createSupabaseServerClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/login?next=%2Falumni-workspace");
  const [{ data: profile }, { data: role }] = await Promise.all([
    db.from("profiles").select("is_active").eq("id",user.id).maybeSingle(),
    db.from("alumni_staff_roles").select("is_active").eq("staff_id",user.id).maybeSingle()
  ]);
  if (!profile?.is_active || !role?.is_active) redirect("/alumni-workspace");
  return { db, user };
}

async function addFollowup(form: FormData) {
  "use server";
  const { db, user } = await authorize();
  const alumniId = String(form.get("alumni_id") ?? "");
  const action = String(form.get("action") ?? "").trim();
  const otherAction = String(form.get("other_action") ?? "").trim();
  const finalAction = action === "Other" ? otherAction : action;
  const due = String(form.get("due") ?? "");
  const assignee = String(form.get("assignee") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(alumniId) || (!NEXT_ACTIONS.some(choice => choice === action) || (action === "Other" && (!otherAction || otherAction.length > 120))) || !/^\d{4}-\d{2}-\d{2}$/.test(due)) redirect("/alumni-workspace");
  const { data: person } = await db.from("alumni_people").select("id,is_fictional").eq("id",alumniId).maybeSingle();
  const { data: assigned } = await db.from("alumni_staff_roles").select("staff_id").eq("staff_id",assignee).eq("is_active",true).maybeSingle();
  if (!person?.is_fictional || !assigned) redirect(base+alumniId+"?error=Invalid%20assignment");
  const { data: task, error } = await db.from("alumni_followups").insert({alumni_id:alumniId,next_action:finalAction,due_on:due,assigned_staff_id:assignee}).select("id").single();
  if (error || !task) redirect(base+alumniId+"?error=Could%20not%20create%20follow-up");
  await db.from("alumni_events").insert({alumni_id:alumniId,actor_id:user.id,event_type:"followup_created",object_type:"followup",object_id:task.id,event_data:{assigned_staff_id:assignee}});
  revalidatePath(base+alumniId);
  redirect(base+alumniId+"?saved=1");
}

async function completeFollowup(form: FormData) {
  "use server";
  const { db, user } = await authorize();
  const alumniId = String(form.get("alumni_id") ?? "");
  const taskId = String(form.get("task_id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(alumniId) || !/^[0-9a-f-]{36}$/i.test(taskId)) redirect("/alumni-workspace");
  const { data: task } = await db.from("alumni_followups").select("id,status").eq("id",taskId).eq("alumni_id",alumniId).maybeSingle();
  if (!task || task.status !== "open") redirect(base+alumniId+"?error=Task%20is%20not%20open");
  const { error } = await db.from("alumni_followups").update({status:"completed",completed_at:new Date().toISOString(),completed_by:user.id}).eq("id",taskId).eq("alumni_id",alumniId).eq("status","open");
  if (error) redirect(base+alumniId+"?error=Could%20not%20complete%20task");
  await db.from("alumni_events").insert({alumni_id:alumniId,actor_id:user.id,event_type:"followup_completed",object_type:"followup",object_id:taskId});
  revalidatePath(base+alumniId);
  redirect(base+alumniId+"?completed=1");
}

export default async function AlumniHistory({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{saved?:string;completed?:string;error?:string}>}) {
 const {id}=await params;
 const query=await searchParams;
 const {db,user}=await authorize();
 const [{data:person},{data:conversations},{data:tasks},{data:profiles},{data:roles},{data:cadence}]=await Promise.all([
   db.from("alumni_people").select("id,display_name,discharge_on,sms_allowed,email_allowed,call_allowed").eq("id",id).maybeSingle(),
   db.from("alumni_conversations").select("id,channel,created_at").eq("alumni_id",id).order("created_at",{ascending:true}),
   db.from("alumni_followups").select("id,next_action,due_on,status,assigned_staff_id,completed_by,completed_at,created_at").eq("alumni_id",id).order("created_at",{ascending:false}),
   db.from("profiles").select("id,full_name"),
   db.from("alumni_staff_roles").select("staff_id,alumni_role").eq("is_active",true),
   db.from("alumni_cadence").select("id,checkpoint,due_on,status").eq("alumni_id",id).order("due_on")
 ]);
 if (!person) redirect("/alumni-workspace");
 const names=new Map<string,string>((profiles??[]).map(p=>[p.id,p.full_name || "Staff"] as const));
 const allowedStaff=(roles??[]).map(r=>({id:r.staff_id,name:names.get(r.staff_id)??"Staff member"}));
 const ids=(conversations??[]).map(c=>c.id);
 const {data:messages}=ids.length ? await db.from("alumni_messages").select("id,conversation_id,direction,body,created_at,created_by").in("conversation_id",ids).order("created_at",{ascending:true}).limit(500) : {data:[]};
 const channels=new Map<string,string>((conversations??[]).map(c=>[c.id,c.channel] as const));
 const history=(messages??[]).slice().sort((a,b)=>a.created_at.localeCompare(b.created_at));
 return <main className="ac-unified-page"><AlumniSectionNav current="history"/><div className="mx-auto max-w-5xl space-y-5">
   <header className="rounded-2xl border border-sky-700/40 bg-slate-900 p-5">
     <p className="text-xs font-bold uppercase tracking-widest text-sky-300">Simple Path Recovery</p>
     <h1 className="mt-1 text-2xl font-bold">{person.display_name} | Unified History</h1>
     <p className="mt-2 text-sm text-slate-300">All recorded contact across staff and conversations, oldest first. Fictional data only.</p>
     <p className="mt-2 text-xs text-slate-400">Viewing as: {user.email}</p>
     <p className={`mt-2 text-sm ${person.sms_allowed||person.email_allowed||person.call_allowed?"text-emerald-300":"text-rose-300"}`}>{person.sms_allowed||person.email_allowed||person.call_allowed?"Contact preferences on file":"Do not contact: all permissions revoked"}</p>
     <div className="mt-3 flex flex-wrap gap-4 text-sm text-sky-300"><Link href="/alumni-workspace">Staff workspace</Link><Link href="/alumni-workspace/inbox">Conversation inbox</Link></div>
   </header>
   {query.saved&&<p role="status" className="rounded-lg bg-emerald-900 p-3">Follow-up saved.</p>}
   {query.completed&&<p role="status" className="rounded-lg bg-emerald-900 p-3">Follow-up completed and attributed to the signed-in staff member.</p>}
   {query.error&&<p role="alert" className="rounded-lg bg-rose-900 p-3">{query.error}</p>}
   <section className="ac-card"><div className="ac-card-head"><div><h2>Discharge and engagement schedule</h2><p>Discharged: {person.discharge_on??"Not recorded"} · Scheduled outreach is not proof of contact.</p></div><Link href={"/alumni-workspace/lifecycle?alumni="+id} className="ac-link">Manage lifecycle →</Link></div><div className="ac-task-list">{(cadence??[]).map(c=><div className="ac-task" key={c.id}><span className="ac-task-dot team"/><span><strong>{c.checkpoint}</strong><small>Due {c.due_on} · {c.status}</small></span></div>)}{!(cadence??[]).length&&<p className="ac-empty">No discharge schedule on file.</p>}</div></section>
   <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
    <h2 className="text-xl font-semibold">Complete contact history ({history.length})</h2>
    <p className="mt-1 text-xs text-slate-400">Messages from separate SMS, email and call conversations appear together. Every entry retains its origin.</p>
    <ol className="mt-4 space-y-3">{history.map(m=><li key={m.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
      <div className="flex flex-wrap justify-between gap-2 text-sm font-semibold"><span>{(channels.get(m.conversation_id)??"contact").toUpperCase()} · {m.direction==="inbound"?"Fictional incoming reply":"Staff test message"}</span><span className="text-xs font-normal text-slate-400">{new Date(m.created_at).toLocaleString()}</span></div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm">{m.body}</p>
      <p className="mt-2 text-xs text-sky-300">Recorded by: {names.get(m.created_by??"")??"Unknown staff"}</p>
    </li>)}</ol>
   </section>
   <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
     <h2 className="text-xl font-semibold">Follow-up actions ({tasks?.length??0})</h2>
     <div className="mt-3 space-y-3">{(tasks??[]).map(t=><div key={t.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
       <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{t.next_action}</p><p className="mt-1 text-xs text-slate-300">Due {t.due_on} · Assigned: {names.get(t.assigned_staff_id??"")??"Unassigned"}</p><p className="mt-1 text-xs text-slate-400">Status: {t.status}{t.completed_by?" · Completed by "+(names.get(t.completed_by)??"Staff"):""}</p></div>
         {t.status==="open"&&<form action={completeFollowup}><input type="hidden" name="alumni_id" value={id}/><input type="hidden" name="task_id" value={t.id}/><button className="rounded-lg bg-emerald-300 px-3 py-2 text-sm font-semibold text-slate-950">Complete</button></form>}
       </div>
     </div>)}</div>
     <h3 className="mt-6 font-semibold">Create a follow-up</h3>
     <form action={addFollowup} className="mt-3 grid gap-3 sm:grid-cols-2">
       <input type="hidden" name="alumni_id" value={id}/>
       <label className="grid gap-1 text-sm sm:col-span-2">Next action<select name="action" required defaultValue="" className="rounded-lg bg-slate-950 p-3"><option value="" disabled>Choose next action</option>{NEXT_ACTIONS.map(choice=><option key={choice} value={choice}>{choice}</option>)}</select></label>
       <details className="sm:col-span-2 rounded-lg border border-slate-700 p-3 text-sm"><summary className="cursor-pointer text-sky-200">Other action: add a short description if selected</summary><label className="mt-3 grid gap-1">Describe other action<input name="other_action" maxLength={120} className="rounded-lg bg-slate-950 p-3" placeholder="Only needed when choosing Other"/></label></details>
       <label className="grid gap-1 text-sm">Due date<input name="due" type="date" required className="rounded-lg bg-slate-950 p-3"/></label>
       <label className="grid gap-1 text-sm">Who will follow up?<select name="assignee" defaultValue={user.id} className="rounded-lg bg-slate-950 p-3">{allowedStaff.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
       <button type="submit" className="rounded-lg bg-sky-300 p-3 font-semibold text-slate-950 sm:col-span-2">Save follow-up</button>
     </form>
   </section>
 </div></main>;
}
