import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import AlumniDirectory from "@/components/AlumniDirectory";
export default async function AlumniToday({searchParams}:{searchParams:Promise<{view?:string}>}){
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login?next=%2Falumni-workspace");
 const [{data:profile},{data:staff}]=await Promise.all([
 db.from("profiles").select("full_name,is_active").eq("id",user.id).maybeSingle(),
 db.from("alumni_staff_roles").select("alumni_role,is_active").eq("staff_id",user.id).maybeSingle()
 ]);
 if(!profile?.is_active||!staff?.is_active)redirect("/login?message=Alumni%20access%20not%20active");
 const [{data:people},{data:followups},{data:conversations},{data:support},{data:staffProfiles},{data:cadence}]=await Promise.all([
 db.from("alumni_people").select("id,display_name,sms_allowed,email_allowed,call_allowed").order("display_name").limit(500),
 db.from("alumni_followups").select("id,alumni_id,next_action,due_on,status,assigned_staff_id").eq("status","open").order("due_on",{ascending:true}).limit(200),
 db.from("alumni_conversations").select("id,alumni_id,channel,created_at").order("created_at",{ascending:false}).limit(8),
 db.from("alumni_support_requests").select("id,alumni_id,status").limit(200),
 db.from("profiles").select("id,full_name"),
 db.from("alumni_cadence").select("id,alumni_id,checkpoint,due_on,status").eq("status","scheduled").order("due_on",{ascending:true}).limit(200)
 ]);
 const params=await searchParams;const view=params.view==="directory"?"directory":"today";
 const names=new Map((people??[]).map(p=>[p.id,p.display_name]));
 const staffNames=new Map((staffProfiles??[]).map(p=>[p.id,p.full_name]));
 const myQueue=(followups??[]).filter(f=>f.assigned_staff_id===user.id);
 const due=(followups??[]).filter(f=>f.due_on<=new Date().toISOString().slice(0,10));
 const dueCadence=(cadence??[]).filter(c=>c.due_on<=new Date().toISOString().slice(0,10));
 const display=profile.full_name||user.email?.split("@")[0]||"Staff";
 const routes=[{label:"Today",href:"/alumni-workspace",sym:"◫",active:view==="today"},{label:"Inbox",href:"/alumni-workspace/inbox",sym:"✉",active:false},{label:"Alumni",href:"/alumni-workspace?view=directory",sym:"◎",active:view==="directory"},{label:"Support",href:"/alumni-workspace/support",sym:"♡",active:false},{label:"Lifecycle",href:"/alumni-workspace/lifecycle",sym:"◷",active:false},{label:"Simulate message",href:"/alumni-workspace/simulator",sym:"⚡",active:false},{label:"Record contact",href:"/alumni-workspace/record",sym:"＋",active:false}];
 return <main className="ac-app">
 <aside className="ac-sidebar"><div className="ac-brand"><div className="ac-brand-mark">SPR</div><div><strong>Alumni Connect</strong><small>Simple Path Recovery</small></div></div>
 <div className="ac-demo">FICTIONAL SIMULATOR</div><nav className="ac-nav" aria-label="Main navigation">{routes.map(r=><Link href={r.href} className={r.active?"ac-nav-active":""} key={r.label}><span>{r.sym}</span>{r.label}</Link>)}</nav>
 <div className="ac-side-bottom"><div className="ac-identity"><span className="ac-avatar">{display.slice(0,2).toUpperCase()}</span><div><strong>{display}</strong><small>{staff.alumni_role==="admin"?"Administrator":"Alumni liaison"}</small></div></div><p>Nothing here sends real messages.</p></div></aside>
 <div className="ac-main"><header className="ac-topbar"><div><div className="ac-eyebrow">SPR ALUMNI CONTINUITY</div><h1>{view==="today"?"Today":"Alumni"}</h1><p>{view==="today"?"One place to see what matters and take action.":"Find anyone, review their history, and continue the relationship."}</p></div><div className="ac-top-actions"><span className="ac-sim-pill">● Simulator</span><Link href="/alumni-workspace/record" className="ac-primary">+ Record contact</Link></div></header>
 {view==="directory"?<AlumniDirectory people={people??[]}/>:<>
 <section className="ac-stats"><Link href="/alumni-workspace?view=directory" className="ac-stat"><span>Enrolled alumni</span><strong>{people?.length??0}</strong><small>Fictional profiles</small></Link><a href="#my-work" className="ac-stat"><span>My follow-ups</span><strong>{myQueue.length}</strong><small>Assigned to you</small></a><a href="#team-work" className="ac-stat"><span>Due or overdue</span><strong>{due.length}</strong><small>Shared staff responsibility</small></a><a href="#support" className="ac-stat"><span>Support requests</span><strong>{support?.filter(s=>s.status!=="resolved"&&s.status!=="closed").length??0}</strong><small>Open or in progress</small></a></section>
 <section className="ac-card"><div className="ac-card-head"><div><h2>Discharge follow-up cadence</h2><p>Automatically scheduled touchpoints. Due does not mean contacted or completed.</p></div><span className="ac-count">{dueCadence.length} due or overdue</span></div><div className="ac-task-list">{dueCadence.length?dueCadence.slice(0,8).map(c=><Link className="ac-task" href={"/alumni-workspace/alumni/"+c.alumni_id} key={c.id}><span className="ac-task-dot team"/><span><strong>{c.checkpoint} · {names.get(c.alumni_id)??"Alumnus"}</strong><small>Scheduled {c.due_on} · Outreach not yet confirmed</small></span><span className="ac-arrow">›</span></Link>):<p className="ac-empty">No discharge touchpoints are currently due.</p>}</div><Link href="/alumni-workspace/lifecycle" className="ac-link">Review all scheduled touchpoints →</Link></section>
 <div className="ac-columns"><section id="my-work" className="ac-card"><div className="ac-card-head"><div><h2>Your next actions</h2><p>What's assigned to you, prioritized by due date.</p></div><span className="ac-count">{myQueue.length} open</span></div><div className="ac-task-list">{myQueue.slice(0,8).length?myQueue.slice(0,8).map(f=><Link className="ac-task" href={"/alumni-workspace/alumni/"+f.alumni_id} key={f.id}><span className="ac-task-dot"/><span><strong>{f.next_action}</strong><small>{names.get(f.alumni_id)??"Alumnus"} · Due {f.due_on}</small></span><span className="ac-arrow">›</span></Link>):<div className="ac-empty">You're all caught up. New assignments will appear here.</div>}</div></section>
 <section id="team-work" className="ac-card"><div className="ac-card-head"><div><h2>Team follow-ups</h2><p>Shared work. Any authorized staff member can help.</p></div><span className="ac-count">{followups?.length??0} open</span></div><div className="ac-task-list">{(followups??[]).slice(0,8).length?(followups??[]).slice(0,8).map(f=><Link className="ac-task" href={"/alumni-workspace/alumni/"+f.alumni_id} key={f.id}><span className="ac-task-dot team"/><span><strong>{f.next_action}</strong><small>{names.get(f.alumni_id)??"Alumnus"} · {staffNames.get(f.assigned_staff_id)??"Unassigned"} · {f.due_on}</small></span><span className="ac-arrow">›</span></Link>):<div className="ac-empty">No team follow-ups yet.</div>}</div></section></div>
 <section className="ac-card"><div className="ac-card-head"><div><h2>Recent conversations</h2><p>Pick up where another staff member left off.</p></div><Link href="/alumni-workspace/inbox" className="ac-link">Open inbox →</Link></div><div className="ac-recent">{(conversations??[]).length?(conversations??[]).map(c=><Link href={"/alumni-workspace/inbox?thread="+c.id} className="ac-recent-row" key={c.id}><span className="ac-avatar">{(names.get(c.alumni_id)??"AL").slice(0,2).toUpperCase()}</span><span><strong>{names.get(c.alumni_id)??"Fictional alumnus"}</strong><small>{c.channel.toUpperCase()} · {new Date(c.created_at).toLocaleDateString()}</small></span><span className="ac-arrow">›</span></Link>):<div className="ac-empty">No conversations yet. You can record a fictional contact to start.</div>}</div></section>
 <section id="support" className="ac-footnote"><strong>Full simulator under construction.</strong> This first integrated staff home uses actual simulator data. Support, campaigns, community and administrative reporting will join this workspace as working simulated flows. No live sending.</section>
 </>}</div></main>;
}