"use client";

import { useState, type FormEvent } from "react";
import index from "@/data/officialErcIndex.json";

type ERCSpec = {
 id:string;status:"FETCHED"|"SOURCE_UNAVAILABLE"|"NOT_IN_OFFICIAL_SNAPSHOT";
 title:string|null;editorialStatus:string|null;summary:string|null;discussionUrl:string|null;requires:string[];references:string[];
 url:string;sourceRevision:string;
};
type ErcResearch = {
 status:string;
 protocols:string[];
 provenance:{repository:string;treeSha:string;commitSha:string;indexedDocuments:number;forum:string};
 standards:ERCSpec[];
 forum:Array<{status:string;query:string;topics:Array<{id:number;title:string;url:string}>}>;
 documentaryRelations:Array<{kind:string;source:string;target:string;explanation:string;evidenceUrl:string}>;
 scientificProjection:{compatibility:string;harmony:string;valueStatus:string;findingCount:number;basis:string}|null;
 newExperimentExecuted:boolean;
 emergentPropertiesVerified:string[];
 conclusion:string;
 researchQuestions:string[];
 limitation:string;
};
function normalize(value:string) {
 const match=/^(?:ERC[- ]?)?([1-9]\d{0,6})$/i.exec(value.trim());
 return match?"ERC-"+Number(match[1]):null;
}
export function ErcResearchExplorer() {
 const [a,setA]=useState("ERC-721");
 const [b,setB]=useState("ERC-8060");
 const [report,setReport]=useState<ErcResearch|null>(null);
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(false);
 const ready=normalize(a)!==null&&normalize(b)!==null&&normalize(a)!==normalize(b);
 async function compare(event:FormEvent<HTMLFormElement>) {
   event.preventDefault();
   const left=normalize(a),right=normalize(b);
   if(!left||!right||left===right)return;
   setMessage("");setReport(null);setLoading(true);
   try {
     const response=await fetch("/api/research/erc-pair?"+new URLSearchParams({a:left,b:right}),
       {cache:"no-store"});
     const body=await response.json();
     if(!response.ok)throw Error(body?.message||"Research sources are unavailable.");
     setReport(body as ErcResearch);
   } catch {setMessage("Source lookup failed. No compatibility verdict has been inferred.");}
   finally{setLoading(false);}
 }
 return (
   <section id="erc-research" className="mt-16 rounded-[28px] border border-[#ced8d1] bg-white p-6 shadow-sm md:p-9">
     <div className="flex flex-wrap items-start justify-between gap-5">
       <div>
         <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#174c38]">OECL · ERC research explorer</p>
         <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] md:text-4xl">What can these ERCs do together?</h2>
         <p className="mt-3 max-w-3xl text-sm leading-6 text-[#656d67]">
           Compare official GitHub specifications with Ethereum Magicians discussions.
           A documented relation is a candidate, <strong>not</strong> proven composition.
           Only recorded experimental evidence can support a scientific verdict.
         </p>
       </div>
       <div className="rounded-2xl bg-[#eff4f0] px-5 py-4 text-right">
         <div className="font-mono text-3xl font-semibold text-[#174c38]">{index.count}</div>
         <div className="max-w-[170px] text-xs leading-5 text-[#68746b]">official ERC documents indexed</div>
         <div className="mt-1 font-mono text-[9px] uppercase text-[#7a867e]">Index presence ≠ validation</div>
       </div>
     </div>
     <form onSubmit={compare} className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
       <label className="text-xs font-semibold text-[#57615b]">
         First ERC
         <input aria-label="First ERC" value={a} onChange={e=>setA(e.target.value)}
           placeholder="ERC-721" list="oecl-indexed-ercs"
           className="mt-2 w-full rounded-xl border border-[#c5d0c8] bg-[#fafcf9] px-4 py-3 text-base text-[#16261c] focus:border-[#174c38] focus:outline-none"/>
       </label>
       <label className="text-xs font-semibold text-[#57615b]">
         Second ERC
         <input aria-label="Second ERC" value={b} onChange={e=>setB(e.target.value)}
           placeholder="ERC-8060" list="oecl-indexed-ercs"
           className="mt-2 w-full rounded-xl border border-[#c5d0c8] bg-[#fafcf9] px-4 py-3 text-base text-[#16261c] focus:border-[#174c38] focus:outline-none"/>
       </label>
       <button type="submit" disabled={!ready||loading}
         className="self-end rounded-xl bg-[#174c38] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
         {loading?"Researching…":"Investigate"}
       </button>
       <datalist id="oecl-indexed-ercs">{index.ids.map(id=><option key={id} value={"ERC-"+id}/>)}</datalist>
     </form>
     {message&&<p role="alert" className="mt-5 text-sm text-[#9b3f36]">{message}</p>}
     {report&&(
       <div className="mt-8 space-y-7 border-t border-[#d8e0d9] pt-7" aria-live="polite">
         <div className="flex flex-wrap items-center justify-between gap-3">
           <h3 className="text-2xl font-semibold">{report.protocols.join("  ×  ")}</h3>
           <span className="rounded-full border border-[#c7d0ca] px-3 py-1 font-mono text-[10px] uppercase text-[#58655d]">Documentary research · no runtime experiment</span>
         </div>
         <div className="grid gap-3 md:grid-cols-2">
           {report.standards.map(doc=>(
             <article key={doc.id} className="rounded-2xl border border-[#dbe3dd] p-5">
               <div className="font-mono text-[11px] text-[#174c38]">{doc.id} · {doc.status}</div>
               <h4 className="mt-2 text-lg font-semibold">{doc.title??"Source not available in official snapshot"}</h4>
               <p className="mt-2 text-xs text-[#68746b]">Editorial status: {doc.editorialStatus??"Unknown"}</p>
               {doc.summary&&<p className="mt-3 text-sm leading-6 text-[#515b54]">{doc.summary}</p>}
               <p className="mt-2 text-xs text-[#68746b]">Declared requires: {doc.requires.length?doc.requires.join(", "):"None found"}</p>
               <p className="mt-2 text-xs text-[#68746b]">Text references: {doc.references.length?doc.references.slice(0,12).join(", "):"None found"}</p>
               <div className="mt-4 flex flex-wrap gap-4">
                 <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#174c38] underline">Official GitHub document</a>
                 {doc.discussionUrl && /^https:\/\/(?:ethereum-magicians\.org|github\.com|ethresear\.ch)\//i.test(doc.discussionUrl)&&(
                   <a href={doc.discussionUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#174c38] underline">Discussion linked in ERC</a>
                 )}
               </div>
             </article>
           ))}
         </div>
         <div>
           <h4 className="text-lg font-semibold">Cross-document observations</h4>
           {report.documentaryRelations.length?(
             <ul className="mt-3 space-y-2">
               {report.documentaryRelations.map((relation,i)=>(
                 <li key={i} className="rounded-xl bg-[#f3f6f3] px-4 py-3 text-sm leading-6">
                   <span className="mr-2 font-mono text-[10px] text-[#174c38]">{relation.kind}</span>
                   {relation.explanation}
                 </li>
               ))}
             </ul>
           ):<p className="mt-2 text-sm text-[#68746b]">No explicit dependency or cross-reference was found in the retrieved specifications. This is not proof of incompatibility.</p>}
         </div>
         <div className="grid gap-5 md:grid-cols-2">
           <div className="rounded-xl border border-[#dce1da] bg-[#f8f9f5] p-5">
             <h4 className="font-semibold">Scientific assessment</h4>
             {report.scientificProjection?(
               <div className="mt-3 space-y-2 text-sm">
                 <p>Existing snapshot compatibility: <strong>{report.scientificProjection.compatibility}</strong></p>
                 <p>Full composition: <strong>{report.scientificProjection.harmony}</strong></p>
                 <p>Composition value: <strong>{report.scientificProjection.valueStatus}</strong></p>
                 <p className="text-xs text-[#68746b]">These results are projected from frozen OECL research, not generated by this request.</p>
               </div>
             ):<p className="mt-3 text-sm leading-6 text-[#68746b]">NOT EVALUATED. No materialized experimental result for this pair exists in the current web catalog.</p>}
             <p className="mt-4 border-t border-[#dce1da] pt-3 text-sm">
               Verified emergent properties in this comparison: <strong>{report.emergentPropertiesVerified.length}</strong>
             </p>
           </div>
           <div className="rounded-xl border border-[#dce1da] bg-[#f8f9f5] p-5">
             <h4 className="font-semibold">Ethereum Magicians discussion signals</h4>
             {report.forum.map(group=>(
               <div key={group.query} className="mt-3">
                 <div className="font-mono text-xs text-[#667067]">{group.query} · {group.status}</div>
                 {group.topics.length?(
                   <ul className="mt-2 space-y-2">{group.topics.map(t=>(
                     <li key={t.id}><a href={t.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#174c38] underline">{t.title}</a></li>
                   ))}</ul>
                 ):<p className="mt-1 text-xs text-[#777e77]">{group.status==="SEARCHED"?"No matching topics returned; not proof no discussion exists.":"Forum unavailable; evidence incomplete."}</p>}
               </div>
             ))}
           </div>
         </div>
         <div className="border-t border-[#dce1da] pt-5">
           <h4 className="text-lg font-semibold">Questions for the next reproducible experiment</h4>
           <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
             {report.researchQuestions.map((q,i)=><li key={i}>{q}</li>)}
           </ol>
         </div>
         <p className="text-xs leading-5 text-[#748079]">
           {report.limitation} GitHub source commit {report.provenance.commitSha.slice(0,12)}.
           No mint, deploy, wallet connection or chain write is performed.
         </p>
       </div>
     )}
   </section>
 );
}
