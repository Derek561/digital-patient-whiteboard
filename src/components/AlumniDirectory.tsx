"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
type Person={id:string;display_name:string;sms_allowed:boolean;email_allowed:boolean;call_allowed:boolean};
export default function AlumniDirectory({people}:{people:Person[]}){
 const [term,setTerm]=useState(""); const [filter,setFilter]=useState("all");
 const visible=useMemo(()=>people.filter(p=>p.display_name.toLowerCase().includes(term.toLowerCase())&&(filter==="all"||(filter==="permitted"&&(p.sms_allowed||p.email_allowed||p.call_allowed))||(filter==="restricted"&&!(p.sms_allowed||p.email_allowed||p.call_allowed)))).slice(0,60),[people,term,filter]);
 return <section className="ac-card">
   <div className="ac-card-head"><div><h2>Alumni directory</h2><p>Search a person to open their complete relationship history.</p></div><span className="ac-count">{people.length} alumni</span></div>
   <div className="ac-searchline"><input aria-label="Search alumni" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search alumni by name..." className="ac-input"/><select aria-label="Contact preference filter" className="ac-input" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All alumni</option><option value="permitted">Contact permitted</option><option value="restricted">Contact restricted</option></select></div>
   <div className="ac-directory-list">{visible.length?visible.map(p=><Link className="ac-person" href={"/alumni-workspace/alumni/"+p.id} key={p.id}><span className="ac-avatar">{p.display_name.replace("Demo ","").slice(0,2).toUpperCase()}</span><span className="ac-person-main"><strong>{p.display_name}</strong><small>{p.sms_allowed||p.email_allowed||p.call_allowed?"Contact preferences on file":"Contact not permitted"} · Fictional record</small></span><span aria-hidden="true" className="ac-arrow">›</span></Link>):<p className="ac-empty">No matching alumni found.</p>}</div>
   {visible.length===60&&<p className="ac-help">Showing first 60 matches. Refine your search to find someone quickly.</p>}
 </section>;
}
