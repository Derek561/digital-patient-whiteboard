import Link from "next/link";
export default function AlumniSectionNav({current}:{current:"inbox"|"history"|"support"|"record"}){
const links=[["Today","/alumni-workspace"],["Inbox","/alumni-workspace/inbox"],["Alumni","/alumni-workspace?view=directory"],["Support","/alumni-workspace/support"],["Lifecycle","/alumni-workspace/lifecycle"],["Record contact","/alumni-workspace/record"]] as const;
return <div className="ac-section-nav"><div className="ac-section-brand"><span className="ac-brand-mark">SPR</span><span><strong>Alumni Connect</strong><small>Fictional simulator · Simple Path Recovery</small></span></div><nav aria-label="Alumni Connect sections">{links.map(([name,url])=><Link key={url} href={url} aria-current={(current==="inbox"&&name==="Inbox")||(current==="history"&&name==="Alumni")||(current==="support"&&name==="Support")||(current==="record"&&name==="Record contact")?"page":undefined}>{name}</Link>)}</nav></div>;
}
