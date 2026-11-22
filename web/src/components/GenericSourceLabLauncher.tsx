"use client";

import { useEffect,useState } from "react";
import { ScientificAstGraphExplorer,type AstGraphView } from "./ScientificAstGraphExplorer";
import { IndependentEvmEvidencePanel } from "./IndependentEvmEvidencePanel";

type Entry={id:string;label:string;kind:string};
type Config={enabled:boolean;sources:Entry[];status:string};
type Job={status:string;requestId?:string;state?:string;message?:string;
  runUrl?:string|null;scientificVerdict?:string|null};
const done=new Set(["SOURCE_ARTIFACT_AVAILABLE","EXECUTION_FAILED"]);
const examples=new Set([
  "ERC-8060|ERC-8098","ERC-8060|ERC-20-BURNABLE",
  "ERC-8098|ERC-20","ERC-1155|ERC-20"
]);

function LoadedGraph({sourceA,sourceB,requestId,accessKey}:{
  sourceA:string;sourceB:string;requestId?:string;accessKey?:string;
}){
  const [view,setView]=useState<AstGraphView|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    const qs="?sourceA="+encodeURIComponent(sourceA)+
      "&sourceB="+encodeURIComponent(sourceB);
    const url=requestId?
      "/api/scientific/source-jobs/"+encodeURIComponent(requestId)+"/view"+qs:
      "/api/scientific/source-views"+qs;
    fetch(url,{signal:controller.signal,cache:"no-store",
      ...(requestId?{headers:{"x-oecl-access-key":accessKey||""}}:{})})
      .then(async r=>{
        const body=await r.json();
        if(!r.ok||body.status!=="VERIFIED_SOURCE_GRAPH"||!body.view)
          throw Error(body.message||body.status||"Unverified source evidence");
        const result=body.view as AstGraphView;
        if(result.scientificVerdict!=="INCONCLUSIVE"||
           result.candidateAdmission!=="NOT_ADMITTED"||
           result.sourceOnly!==true||result.evmExecuted!==false||
           result.selected?.[0]?.id!==sourceA||result.selected?.[1]?.id!==sourceB)
          throw Error("Scientific result failed client scope checks");
        return result;
      })
      .then(result=>{if(!controller.signal.aborted)setView(result);})
      .catch(e=>{if(!controller.signal.aborted)
        setError(e instanceof Error?e.message:"Scientific evidence unavailable");});
    return ()=>controller.abort();
  },[sourceA,sourceB,requestId,accessKey]);
  if(error)return <p role="alert"
    className="mt-4 rounded-xl border border-[#e1bcb7] bg-[#fff8f7] p-4 text-sm text-[#923e32]">
    Evidence unavailable: {error}. The interface has not inferred compatibility.
  </p>;
  if(!view)return <p role="status" className="mt-5 text-sm text-[#68746b]">
    Retrieving and verifying the compiler AST graph and source evidence...
  </p>;
  return <ScientificAstGraphExplorer view={view}/>;
}

export function GenericSourceLabLauncher(){
  const [config,setConfig]=useState<Config|null>(null);
  const [sourceA,setSourceA]=useState("ERC-8060");
  const [sourceB,setSourceB]=useState("ERC-20-BURNABLE");
  const [showExample,setShowExample]=useState(false);
  const [showIndependentEvm,setShowIndependentEvm]=useState(false);
  const [accessKey,setAccessKey]=useState("");
  const [requestId,setRequestId]=useState<string|null>(null);
  const [job,setJob]=useState<Job|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [submitting,setSubmitting]=useState(false);

  useEffect(()=>{
    const abort=new AbortController();
    fetch("/api/scientific/source-jobs",{signal:abort.signal,cache:"no-store"})
      .then(async r=>r.json() as Promise<Config>)
      .then(value=>{if(!abort.signal.aborted)setConfig(value);})
      .catch(()=>{if(!abort.signal.aborted)setError("Source registry unavailable");});
    return ()=>abort.abort();
  },[]);

  useEffect(()=>{
    if(!requestId||accessKey.length<32)return;
    let stopped=false;
    let timer:ReturnType<typeof setTimeout>|undefined;
    async function poll(){
      try{
        const response=await fetch("/api/scientific/source-jobs/"+encodeURIComponent(requestId!),{
          headers:{"x-oecl-access-key":accessKey},cache:"no-store"
        });
        const body=await response.json() as Job;
        if(stopped)return;
        if(!response.ok)setError(body.status||"Status unavailable");
        else{setJob(body);setError(null);}
        if(!done.has(body.state||""))timer=setTimeout(poll,5000);
      }catch{
        if(!stopped){
          setError("Could not verify the source analysis job");
          timer=setTimeout(poll,5000);
        }
      }
    }
    timer=setTimeout(poll,1000);
    return ()=>{stopped=true;if(timer)clearTimeout(timer);};
  },[requestId,accessKey]);

  const valid=config?.sources?.some(s=>s.id===sourceA)&&
    config.sources.some(s=>s.id===sourceB)&&sourceA!==sourceB;
  const sample=examples.has(sourceA+"|"+sourceB);
  async function start(){
    if(!config?.enabled||!valid||submitting||requestId||accessKey.length<32)return;
    setSubmitting(true);setError(null);
    try{
      const response=await fetch("/api/scientific/source-jobs",{
        method:"POST",
        headers:{"content-type":"application/json","x-oecl-access-key":accessKey},
        body:JSON.stringify({sourceA,sourceB}),cache:"no-store"
      });
      const body=await response.json() as Job;
      if(!response.ok||body.status!=="SOURCE_DISPATCH_ACCEPTED"||!body.requestId)
        throw Error(body.status||"The isolated worker refused this job");
      setJob(body);setRequestId(body.requestId);setShowExample(false);
    }catch(e){setError(e instanceof Error?e.message:"Submission failed");}
    finally{setSubmitting(false);}
  }
  return <section className="mt-7 rounded-[24px] border border-[#d0dad2] bg-[#f7f9f7] p-5 md:p-6"
    aria-label="Open source-only Solidity graph laboratory">
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#174c38]">
      Open composition laboratory · compiler AST
    </p>
    <h3 className="mt-2 text-xl font-medium">Explore source capabilities and relationships</h3>
    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#68706c]">
      Compare two source profiles, inspect real compiler-resolved calls and
      restrictions, and examine unadmitted structural hypotheses. Four
      verified examples are available immediately; fresh analyses require
      the isolated research runner.
    </p>

    {config&&<div className="mt-5 grid gap-3 sm:grid-cols-2">
      {([{id:"source-a",label:"Source A",value:sourceA,set:setSourceA},
        {id:"source-b",label:"Source B",value:sourceB,set:setSourceB}] as const)
        .map(item=><div key={item.id}>
          <label htmlFor={item.id} className="mb-2 block text-xs font-semibold text-[#66756d]">
            {item.label}
          </label>
          <select id={item.id} value={item.value} disabled={Boolean(requestId)}
            onChange={e=>{item.set(e.target.value);setShowExample(false);setShowIndependentEvm(false);}}
            className="w-full rounded-xl border border-[#cfd7d2] bg-white px-4 py-3 text-sm">
            {config.sources.map(source=><option key={source.id} value={source.id}>
              {source.label}
            </option>)}
          </select>
        </div>)}
    </div>}
    <p className="mt-3 text-xs text-[#68746b]">
      ERC-20 Burnable is an extension, not a distinct ERC. Missing hypotheses
      do not establish incompatibility; AST source facts do not prove EVM feasibility.
    </p>
    {config&&<div className="mt-4 flex flex-wrap items-center gap-3">
      <button type="button" disabled={!valid||!sample}
        onClick={()=>setShowExample(true)}
        className="rounded-xl border border-[#2c7353] px-5 py-3 text-sm font-medium text-[#215d43] disabled:opacity-40">
        Explore verified AST example
      </button>
      {sourceA==="ERC-8060"&&sourceB==="ERC-20-BURNABLE"&&
        <button type="button" onClick={()=>setShowIndependentEvm(true)}
          className="rounded-xl bg-[#215d43] px-5 py-3 text-sm font-medium text-white">
          Explore verified independent EVM evidence
        </button>}
      {!sample&&<p className="text-xs text-[#96703e]">
        No verified static example for this pair; use the research worker when enabled.
      </p>}
    </div>}
    {showIndependentEvm&&sourceA==="ERC-8060"&&sourceB==="ERC-20-BURNABLE"&&
      <IndependentEvmEvidencePanel/>}
    {showExample&&sample&&<LoadedGraph key={"example:"+sourceA+":"+sourceB}
      sourceA={sourceA} sourceB={sourceB}/>}

    {!config?<p className="mt-4 text-sm text-[#68746b]">Loading source registry...</p>:
      !config.enabled?
      <p className="mt-5 rounded-xl border border-[#e0e5e0] bg-white p-4 text-sm text-[#68746b]">
        Fresh analysis is disabled on this deployment. Verified examples remain
        browsable without credentials; no job has been launched.
      </p>:
      <div className="mt-6 space-y-3 border-t border-[#d8e1d9] pt-5">
        <label htmlFor="oecl-source-access-key" className="block text-sm font-semibold">
          Research access key
        </label>
        <input id="oecl-source-access-key" type="password" autoComplete="off"
          spellCheck={false} value={accessKey}
          onChange={e=>setAccessKey(e.target.value)}
          placeholder="Authorized researcher key"
          className="w-full rounded-xl border border-[#cad6cc] bg-white px-4 py-3 text-sm"/>
        <button type="button" onClick={start}
          disabled={!valid||accessKey.length<32||Boolean(requestId)||submitting}
          className="rounded-xl bg-[#216047] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">
          {submitting?"Requesting isolated analysis...":"Analyze selected pair with the AST worker"}
        </button>
        <p className="text-xs text-[#68746b]">
          Only reviewed immutable source revisions are accepted. No arbitrary
          repository URLs, custom scripts or EVM execution are permitted.
        </p>
      </div>}
    {error&&<p role="alert" className="mt-4 text-sm text-[#9b3128]">{error}</p>}
    {job&&<div className="mt-5 rounded-xl border border-[#d9e3da] bg-white p-4">
      <p className="font-mono text-xs font-semibold">{job.state||job.status}</p>
      <p className="mt-2 text-xs text-[#68746b]">{job.message}</p>
      <p className="mt-2 break-all font-mono text-[10px] text-[#68746b]">
        Request ID: {requestId}</p>
      {job.runUrl&&<a href={job.runUrl} target="_blank"
        rel="noopener noreferrer" className="mt-2 inline-block text-xs text-[#215d43] underline">
        View independent GitHub Actions run
      </a>}
      {job.state==="SOURCE_ARTIFACT_AVAILABLE"&&requestId&&
        <LoadedGraph key={"live:"+requestId} requestId={requestId}
          accessKey={accessKey} sourceA={sourceA} sourceB={sourceB}/>}
    </div>}
  </section>;
}
