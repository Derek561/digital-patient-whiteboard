import Link from "next/link";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
async function staff(){
 const db=await createSupabaseServerClient();const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login");
 const {data:role}=await db.from("alumni_staff_roles").select("alumni_role,is_active").eq("staff_id",user.id).maybeSingle();
 const {data:profile}=await db.from("profiles").select("is_active").eq("id",user.id).maybeSingle();
 if(!role?.is_active||!profile?.is_active)redirect("/login");
 return {db,role:role.alumni_role};
}
async function setDischarge(form:FormData){"use server";
 const {db,role}=await staff();if(role!=="admin")redirect("/alumni-workspace/lifecycle?error=Administrator%20required");
 const id=String(form.get("alumni")??"");const date=String(form.get("discharge")??"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))redirect("/alumni-workspace/lifecycle?error=Valid%20date%20required");
 const {data:person}=await db.from("alumni_people").select("id,is_fictional").eq("id",id).maybeSingle();
 if(!person?.is_fictional)redirect("/alumni-workspace/lifecycle?error=Fictional%20record%20required");
 const {error}=await db.from("alumni_people").update({discharge_on:date}).eq("id",id);
 if(error)redirect("/alumni-workspace/lifecycle?error=Unable%20to%20save%20discharge");
 revalidatePath("/alumni-workspace/lifecycle");revalidatePath("/alumni-workspace");
 redirect("/alumni-workspace/lifecycle?alumni="+encodeURIComponent(id)+"&saved=1");
}
export default async function Lifecycle({searchParams}:{searchParams:Promise<{alumni?:string;saved?:string;error?:string}>}){
 const {db,role}=await staff();const p=await searchParams;
 const {data:people}=await db.from("alumni_people").select("id,display_name,discharge_on,sms_allowed,email_allowed,call_allowed").eq("is_fictional",true).order("display_name").limit(500);
 const selected=(people??[]).find(x=>x.id===p.alumni)??people?.[0];
 const {data:cadence}=selected?await db.from("alumni_cadence").select("id,checkpoint,due_on,status").eq("alumni_id",selected.id).order("due_on"): {data:[]};
 return <main className="ac-app"><aside className="ac-sidebar"><div className="ac-brand"><div className="ac-brand-mark">SPR</div><div><strong>Alumni Connect</strong><small>Simple Path Recovery</small></div></div><div className="ac-demo">FICTIONAL SIMULATOR</div><nav className="ac-nav"><Link href="/alumni-workspace">Today</Link><Link href="/alumni-workspace/inbox">Inbox</Link><Link href="/alumni-workspace?view=directory">Alumni</Link><Link href="/alumni-workspace/support">Support</Link><Link className="ac-nav-active" href="/alumni-workspace/lifecycle">Lifecycle</Link></nav></aside><div className="ac-main"><header className="ac-topbar"><div><p className="ac-eyebrow">SPR ALUMNI CONTINUITY</p><h1>Discharge and follow-up cadence</h1><p>Set one fictional discharge date. The system creates the continuing contact schedule.</p></div><span className="ac-sim-pill">● Simulator</span></header>{p.saved&&<p role="status" className="ac-footnote">Discharge saved and scheduled checkpoints generated.</p>}{p.error&&<p role="alert">{p.error}</p>}<section className="ac-card"><div className="ac-card-head"><div><h2>Alumni lifecycle</h2><p>Fictional records only. Cadence is a configurable SPR starting proposal, not a universal SAMHSA requirement.</p></div></div><form method="get" className="grid gap-3"><label>Review alumnus<select className="ac-input" name="alumni" defaultValue={selected?.id}>{(people??[]).map(x=><option value={x.id} key={x.id}>{x.display_name}</option>)}</select></label><button type="submit" className="ac-primary">View schedule</button></form>{selected&&<div className="ac-footnote">Discharge: {selected.discharge_on??"Not set"} · SMS: {selected.sms_allowed?"permitted":"not permitted"} · Email: {selected.email_allowed?"permitted":"not permitted"} · Call: {selected.call_allowed?"permitted":"not permitted"}</div>}{role==="admin"&&selected&&<form action={setDischarge} className="grid gap-3" style={{marginTop:18}}><input type="hidden" name="alumni" value={selected.id}/><label>Set fictional discharge date<input className="ac-input" name="discharge" type="date" defaultValue={selected.discharge_on??""} required/></label><button type="submit" className="ac-primary">Generate or update cadence</button></form>}</section><section className="ac-card"><div className="ac-card-head"><div><h2>Scheduled touchpoints</h2><p>These are planned outreach opportunities, not proof of contact.</p></div><span className="ac-count">{cadence?.length??0} checkpoints</span></div><div className="ac-task-list">{(cadence??[]).map(c=><div className="ac-task" key={c.id}><span className="ac-task-dot team"/><span><strong>{c.checkpoint}</strong><small>Due {c.due_on} · {c.status}</small></span></div>)}{!cadence?.length&&<p className="ac-empty">No schedule yet. An administrator can set the fictional discharge date above.</p>}</div></section></div></main>;
}
