"use client";
import {useEffect,useState} from "react";
type IndexRecord={id:string;title:string;status:string;summary:string;requires:string[];sourceUrl:string;discussionUrl:string|null};
type IndexResult={status:string;totalIndexed:number;matches:number;source:{revision:string|null};standards:IndexRecord[];forum:{status:string}};
type Protocol={id:string;record:(IndexRecord&{mentions:string[];canonicalUrl:string})|null};
type ForumRead={url:string|null;status:string;title?:string;excerpt:string|null};
type PairReport={
 status:string;protocols:Protocol[];indexedOfficialRecords:number;
 documentary:{relation:string;declaredDependency:boolean;documentaryMention:boolean;
 discussionLinks:ForumRead[];recentForumTopicMentions:{id:number;title:string;url:string}[];caution:string};
 scientific:{evaluationStatus:string;compatibility:string;harmony:string;compositionValue:string;observedEmergentProperties:string[]};
 researchQuestions:string[];nextExperiment:string;note:string;
};
function normal(v:string){const m=v.trim().toUpperCase().match(/^(?:ERC[-\s]?)?([1-9]\d{0,7})$/);return m?"ERC-"+Number(m[1]):null}
export function ErcResearchExplorer(){
 const [query,setQuery]=useState("");
 const [listing,setListing]=useState<IndexResult|null>(null);
 const [left,setLeft]=useState("ERC-721");
 const [right,setRight]=useState("ERC-8004");
 const [report,setReport]=useState<PairReport|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [searchError,setSearchError]=useState<string|null>(null);
 async function search(q:string){
   setSearchError(null);
   try {
     const response=await fetch("/api/research/erc?q="+encodeURIComponent(q)+"&limit=24",{cache:"no-store"});
     if(!response.ok)throw Error("Catalog could not be read");
     setListing(await response.json());
   }catch{setSearchError("The ERC index is temporarily unavailable; no scientific conclusion was made");}
 }
 useEffect(()=>{void search("");},[]);
 async function compare(){
   const a=normal(left),b=normal(right);
   if(!a||!b||a===b){setError("Choose two different ERC identifiers");return;}
   setBusy(true);setError(null);setReport(null);
   try{
     const response=await fetch("/api/research/pair?left="+encodeURIComponent(a)+"&right="+encodeURIComponent(b),{cache:"no-store"});
     const payload=await response.json();
     if(!response.ok)throw Error(payload.message||"Research query failed");
     setReport(payload as PairReport);
   }catch(cause){setError(cause instanceof Error?cause.message:"Research query failed");}
   finally{setBusy(false)}
 }
 return <section className="mt-12 rounded-[28px] border border-[#cdd8d0] bg-white px-5 py-8 md:px-9 md:py-10">
   <div className="flex flex-wrap items-start justify-between gap-4">
     <div>
       <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1e5d46]">Open ERC research explorer</p>
       <h3 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">Explore standards. Investigate composition.</h3>
       <p className="mt-3 max-w-3xl text-sm leading-6 text-[#67736b]">Search the official ERC repository, inspect declared dependencies, consult linked Ethereum Magicians discussions, and distinguish candidate ideas from experimentally supported properties.</p>
     </div>
     <span className="rounded-full border border-[#ccd9d0] px-3 py-1.5 font-mono text-xs text-[#365e49]">{listing?.totalIndexed||0} official ERCs indexed</span>
   </div>
   <div className="mt-8 grid gap-6 lg:grid-cols-[.88fr_1.12fr]">
     <div className="rounded-2xl border border-[#e0e6e1] bg-[#fafcf9] p-5">
       <label htmlFor="erc-search" className="font-mono text-xs text-[#53645a]">SEARCH OFFICIAL ERCs</label>
       <form className="mt-3 flex gap-2" onSubmit={e=>{e.preventDefault();void search(query)}}>
         <input id="erc-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="721, royalty, agent..." className="min-w-0 flex-1 rounded-xl border border-[#cdd8d0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#196542]"/>
         <button type="submit" className="rounded-xl bg-[#194d39] px-4 py-2.5 text-sm font-medium text-white">Search</button>
       </form>
       <div className="mt-3 font-mono text-[10px] text-[#818d84]">{listing?.matches??0} records match · snapshot {listing?.source?.revision?.slice(0,10)||"not synced"}</div>
       {searchError&&<p className="mt-3 text-xs text-[#914c40]">{searchError}</p>}
       {listing?.status==="CATALOG_NOT_SYNCED"&&<p className="mt-4 text-sm text-[#8b6736]">The official corpus has not yet been generated. Scientific results remain unchanged.</p>}
       <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto">
         {listing?.standards.map(erc=><div key={erc.id} className="rounded-xl border border-[#e3e9e4] bg-white p-3">
           <div className="flex items-center justify-between gap-2">
             <span className="text-sm font-semibold">{erc.id} · {erc.title}</span>
             <span className="shrink-0 font-mono text-[10px] text-[#6a786f]">{erc.status}</span>
           </div>
           <p className="mt-1 line-clamp-2 text-xs text-[#7b8680]">{erc.summary||"No indexed abstract"}</p>
           <div className="mt-2 flex items-center gap-3 text-xs">
             <button onClick={()=>setLeft(erc.id)} className="text-[#1b6245] underline underline-offset-2">Select A</button>
             <button onClick={()=>setRight(erc.id)} className="text-[#1b6245] underline underline-offset-2">Select B</button>
             <a href={erc.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#777f78] underline underline-offset-2">Source</a>
           </div>
         </div>)}
       </div>
     </div>
     <div className="rounded-2xl border border-[#e0e6e1] p-5">
       <p className="font-mono text-xs text-[#53645a]">COMPARE TWO ERCs</p>
       <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={e=>{e.preventDefault();void compare()}}>
         <input aria-label="First ERC" value={left} onChange={e=>setLeft(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#cdd8d0] px-4 py-3 text-sm outline-none focus:border-[#196542]"/>
         <input aria-label="Second ERC" value={right} onChange={e=>setRight(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#cdd8d0] px-4 py-3 text-sm outline-none focus:border-[#196542]"/>
         <button type="submit" disabled={busy} className="rounded-xl bg-[#194d39] px-4 py-3 text-sm font-medium text-white disabled:opacity-50">{busy?"Checking...":"Investigate"}</button>
       </form>
       {error&&<p role="alert" className="mt-4 text-sm text-[#994335]">{error}</p>}
       {!report&&<div className="mt-7 rounded-xl bg-[#f3f6f2] px-4 py-5 text-sm leading-6 text-[#64736a]">A source reference is not a compatibility verdict. Verified system-level properties require joint execution, independent controls and evidence-preserving reports.</div>}
       {report&&<div className="mt-6 space-y-5">
         <div className="flex flex-wrap gap-2">
           <span className="rounded-full bg-[#f0f2e8] px-3 py-1.5 font-mono text-xs text-[#5c6235]">Documentary: {report.documentary.relation}</span>
           <span className="rounded-full bg-[#f7ede1] px-3 py-1.5 font-mono text-xs text-[#8d602a]">Scientific: {report.scientific.compatibility}</span>
           <span className="rounded-full bg-[#f3f4f1] px-3 py-1.5 font-mono text-xs text-[#657068]">Emergent: NOT DEMONSTRATED</span>
         </div>
         {report.protocols.map(item=><div key={item.id} className="border-t border-[#e5e9e4] pt-3">
           <div className="font-medium">{item.id} · {item.record?.title||"Not indexed in official ERC snapshot"}</div>
           <p className="mt-1 text-xs text-[#737e76]">{item.record?.summary||"This is not proof the proposal does not exist."}</p>
           {item.record&&<div className="mt-2 flex flex-wrap gap-3 text-xs text-[#1b6245]">
             <a href={item.record.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">GitHub source</a>
             {item.record.discussionUrl&&<a href={item.record.discussionUrl} target="_blank" rel="noopener noreferrer" className="underline">Referenced discussion</a>}
             <span>Requires: {item.record.requires.join(", ")||"none declared"}</span>
           </div>}
         </div>)}
         <div className="border-t border-[#e5e9e4] pt-4">
           <p className="font-mono text-[10px] uppercase text-[#1b6245]">Cross-source discussion evidence</p>
           {report.documentary.discussionLinks.filter(x=>x.url).map((x,i)=><div key={i} className="mt-2 text-xs leading-5 text-[#69776e]">
             <span className="font-medium">{x.status}:</span> {x.excerpt||"Discussion linked; content could not be confirmed."}{" "}
             {x.url&&<a href={x.url} target="_blank" rel="noopener noreferrer" className="underline">Forum/source</a>}
           </div>)}
           {report.documentary.recentForumTopicMentions.slice(0,4).map(t=><div key={t.id} className="mt-2 text-xs"><a href={t.url} target="_blank" rel="noopener noreferrer" className="underline">{t.title}</a> <span className="text-[#858e86]">(title mention only)</span></div>)}
           {report.documentary.discussionLinks.every(x=>!x.url)&&report.documentary.recentForumTopicMentions.length===0&&<p className="mt-2 text-xs text-[#7a847b]">No indexed forum discussion. This is not evidence of incompatibility.</p>}
         </div>
         <div className="border-t border-[#e5e9e4] pt-4">
           <p className="font-mono text-[10px] uppercase text-[#1b6245]">Scientific assessment</p>
           <p className="mt-2 text-sm">Compatibility: <strong>{report.scientific.compatibility}</strong> · Harmony: <strong>{report.scientific.harmony}</strong> · Composition value: <strong>{report.scientific.compositionValue}</strong></p>
           <p className="mt-2 text-xs leading-5 text-[#768078]">No emergent property has been established by this documentary comparison. {report.note}</p>
         </div>
         <details className="border-t border-[#e5e9e4] pt-3">
           <summary className="cursor-pointer text-sm font-medium">Proposed falsifiable experiments</summary>
           <ol className="mt-3 list-inside list-decimal space-y-2 text-xs leading-5 text-[#69776e]">{report.researchQuestions.map((question,i)=><li key={i}>{question}</li>)}</ol>
         </details>
       </div>}
     </div>
   </div>
 </section>;
}
