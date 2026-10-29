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
 const channel=String(form.get("channel")??"");
 const scenario=simulatorScenarios.find(s=>s.id===String(form.get("scenario")??""));
 if(!scenario||!["sms","email"].includes(channel))redirect("/alumni-workspace/simulator?error=Invalid%20scenario");
 const {data:alumnus}=await db.from("alumni_people").select("id,is_fictional").eq("id",alumniId).maybeSingle();
 if(!alumnus?.is_fictional)redirect("/alumni-workspace/simulator?error=Fictional%20record%20required");
 const {data:prior}=await db.from("alumni_conversations").select("id,assigned_staff_id").eq("alumni_id",alumniId).eq("channel",channel).order("created_at",{ascending:false}).limit(1).maybeSingle();
 let conversation=prior;
 if(!conversation){
  const {data:created,error}=await db.from("alumni_conversations").insert({alumni_id:alumniId,channel,assigned_staff_id:user.id}).select("id,assigned_staff_id").single();
  if(error||!created)redirect("/alumni-workspace/simulator?error=Conversation%20failed");
  conversation=created;
 }
 const {data:message,error:messageError}=await db.from("alumni_messages").insert({conversation_id:conversation.id,direction:"inbound",body:scenario.body,delivery_state:"simulated",created_by:null}).select("id").single();
 if(messageError||!message)redirect("/alumni-workspace/simulator?error=Message%20failed");
 const category= scenario.id==="transport"?"Transportation":scenario.id==="housing"?"Housing":scenario.id==="employment"?"Employment":scenario.id==="meeting"?"Community meeting":null;
 await db.from("alumni_events").insert({alumni_id:alumniId,actor_id:user.id,event_type:"simulated_inbound_triage",object_type:"message",object_id:message.id,event_data:{scenario:scenario.id,priority:scenario.priority,channel,source:"simulation"}});
 if(category){
  const {data:existing}=await db.from("alumni_support_requests").select("id").eq("alumni_id",alumniId).eq("category",category).in("status",["open","in_progress"]).limit(1).maybeSingle();
  if(!existing){
   const {error}=await db.from("alumni_support_requests").insert({alumni_id:alumniId,assigned_staff_id:conversation.assigned_staff_id??user.id,category,summary:scenario.body,status:"open"});
   if(error)redirect("/alumni-workspace/simulator?error=Support%20creation%20failed");
  }
 }
 if(scenario.action){
  const {data:existing}=await db.from("alumni_followups").select("id").eq("alumni_id",alumniId).eq("next_action",scenario.action).eq("status","open").limit(1).maybeSingle();
  if(!existing){
   const {error}=await db.from("alumni_followups").insert({alumni_id:alumniId,conversation_id:conversation.id,assigned_staff_id:conversation.assigned_staff_id??user.id,next_action:scenario.action,due_on:new Date().toISOString().slice(0,10)});
   if(error)redirect("/alumni-workspace/simulator?error=Followup%20creation%20failed");
  }
 }
 revalidatePath("/alumni-workspace");
 revalidatePath("/alumni-workspace/inbox");
 revalidatePath("/alumni-workspace/support");
 revalidatePath("/alumni-workspace/alumni/"+alumniId);
 redirect("/alumni-workspace/inbox?thread="+conversation.id+"&saved=1");
}
export default async function Simulator({searchParams}:{searchParams:Promise<{error?:string}>}){
 const {db}=await session();const query=await searchParams;
 const {data:people}=await db.from("alumni_people").select("id,display_name").eq("is_fictional",true).order("display_name");
 return <main className="ac-app"><aside className="ac-sidebar"><div className="ac-brand"><div className="ac-brand-mark">SPR</div><div><strong>Alumni Connect</strong><small>Simple Path Recovery</small></div></div><div className="ac-demo">FICTIONAL SIMULATOR</div><nav className="ac-nav"><Link href="/alumni-workspace">Today</Link><Link href="/alumni-workspace/inbox">Inbox</Link><Link href="/alumni-workspace?view=directory">Alumni</Link><Link href="/alumni-workspace/support">Support</Link><Link className="ac-nav-active" href="/alumni-workspace/simulator">Simulate message</Link></nav></aside><div className="ac-main"><header className="ac-topbar"><div><p className="ac-eyebrow">FICTIONAL COMMUNICATION ENGINE</p><h1>Incoming message simulator</h1><p>Generate a fictional inbound event, automatically create needed work, then open the shared conversation.</p></div><span className="ac-sim-pill">● Simulator</span></header>
 {query.error&&<p role="alert">{query.error}</p>}
 <section className="ac-card"><div className="ac-card-head"><div><h2>Receive fictional message</h2><p>Nothing is sent to a real phone or email address.</p></div></div>
 <form action={receive} style={{maxWidth:540,display:"grid",gap:16}}>
 <label>Alumnus<select className="ac-input" name="alumni">{(people??[]).map(p=><option value={p.id} key={p.id}>{p.display_name}</option>)}</select></label>
 <label>Incoming channel<select className="ac-input" name="channel"><option value="sms">SMS</option><option value="email">Email</option></select></label>
 <label>Fictional incoming event<select className="ac-input" name="scenario">{simulatorScenarios.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
 <button type="submit" className="ac-primary">Receive message and process</button></form>
 </section><section className="ac-card"><h2>Expected connected results</h2><p>One message saves in the shared Inbox and alumni history. When the selected scenario implies an identifiable need, the simulator opens a support request and follow-up, unless an identical open item exists. Today reflects that work. Staff must still verify real-world outcomes.</p></section></div></main>;
}