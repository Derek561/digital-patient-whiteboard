import {randomUUID} from "node:crypto";
import Link from "next/link";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {simulatorScenarios} from "@/lib/alumni/simulator-scenarios";

async function session(){
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/login");
 const [{data:profile},{data:role}]=await Promise.all([
  db.from("profiles").select("is_active").eq("id",user.id).maybeSingle(),
  db.from("alumni_staff_roles").select("is_active").eq("staff_id",user.id).maybeSingle()
 ]);
 if(!profile?.is_active||!role?.is_active)redirect("/login");
 return {db,user};
}
async function receive(form:FormData){
 "use server";
 const {db,user}=await session();
 const alumniId=String(form.get("alumni")??"");
 const eventId=String(form.get("event_id")??"");
 if(!/^[0-9a-f-]{36}$/i.test(eventId))redirect("/alumni-workspace/simulator?error=Invalid%20event%20identifier");
 const channel=String(form.get("channel")??"");
 const scenario=simulatorScenarios.find(s=>s.id===String(form.get("scenario")??""));
 if(!scenario||!["sms","email"].includes(channel))redirect("/alumni-workspace/simulator?error=Invalid%20scenario");
 const {data:result,error}=await db.rpc("alumni_receive_simulated_v06",{p_alumni_id:alumniId,p_channel:channel,p_scenario:scenario.id,p_event_id:eventId});
 if(error||!result?.conversation_id){console.error("Fictional inbound transaction failed",error?.code,error?.message);redirect("/alumni-workspace/simulator?error=Processing%20failed%3B%20no%20partial%20records%20saved");}
 const conversationId=String(result.conversation_id);
 if(result.duplicate)redirect("/alumni-workspace/inbox?thread="+conversationId+"&duplicate=1");
 revalidatePath("/alumni-workspace");
 revalidatePath("/alumni-workspace/inbox");
 revalidatePath("/alumni-workspace/support");
 revalidatePath("/alumni-workspace/alumni/"+alumniId);
 redirect("/alumni-workspace/inbox?thread="+conversationId+"&saved=1");
}
export default async function Simulator({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {db}=await session();const query=await searchParams;
 const {data:people}=await db.from("alumni_people").select("id,display_name").eq("is_fictional",true).order("display_name");
 return <main className="ac-app"><aside className="ac-sidebar"><div className="ac-brand"><div className="ac-brand-mark">SPR</div><div><strong>Alumni Connect</strong><small>Simple Path Recovery</small></div></div><div className="ac-demo">FICTIONAL SIMULATOR</div><nav className="ac-nav"><Link href="/alumni-workspace">Today</Link><Link href="/alumni-workspace/inbox">Inbox</Link><Link href="/alumni-workspace?view=directory">Alumni</Link><Link href="/alumni-workspace/support">Support</Link><Link className="ac-nav-active" href="/alumni-workspace/simulator">Simulate message</Link></nav></aside><div className="ac-main"><header className="ac-topbar"><div><p className="ac-eyebrow">FICTIONAL COMMUNICATION ENGINE</p><h1>Incoming message simulator</h1><p>Generate a fictional inbound event, automatically create needed work, then open the shared conversation.</p></div><span className="ac-sim-pill">● Simulator</span></header>
 {query.error&&<p role="alert">{query.error}</p>}
 <section className="ac-card"><div className="ac-card-head"><div><h2>Receive fictional message</h2><p>Nothing is sent to a real phone or email address.</p></div></div>
 <form action={receive} style={{maxWidth:540,display:"grid",gap:16}}><input type="hidden" name="event_id" value={randomUUID()}/>
 <label>Alumnus<select className="ac-input" name="alumni">{(people??[]).map(p=><option value={p.id} key={p.id}>{p.display_name}</option>)}</select></label>
 <label>Incoming channel<select className="ac-input" name="channel"><option value="sms">SMS</option><option value="email">Email</option></select></label>
 <label>Fictional incoming event<select className="ac-input" name="scenario">{simulatorScenarios.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
 <button type="submit" className="ac-primary">Receive message and process</button></form>
 </section><section className="ac-card"><h2>Expected connected results</h2><p>One message saves in the shared Inbox and alumni history. When the selected scenario implies an identifiable need, the simulator opens a support request and follow-up, unless an identical open item exists. Today reflects that work. Staff must still verify real-world outcomes.</p></section></div></main>;
}