"use client";

import { useEffect, useState } from "react";
import type { PinnedScientificCycle } from "@/server/oeclPinnedScientificCycles";

export function PinnedScientificCyclePanel({sourceA,sourceB}:{sourceA:string;sourceB:string}){
  const selectedKey=sourceA+"|"+sourceB;
  const [record,setRecord]=useState<{key:string;data:PinnedScientificCycle}|null>(null);
  const [failure,setFailure]=useState<{key:string;message:string}|null>(null);
  // The selected pair is part of the rendered state identity: never display the
  // preceding pair's proven observations under a newly selected heading.
  const cycle=record?.key===selectedKey?record.data:null;
  const error=failure?.key===selectedKey?failure.message:null;
  useEffect(()=>{
    const ctrl=new AbortController();
    async function load(){
      try{
        const url="/api/scientific/cycles?sourceA="+encodeURIComponent(sourceA)+
          "&sourceB="+encodeURIComponent(sourceB);
        const response=await fetch(url,{signal:ctrl.signal,cache:"no-store"});
        const result=await response.json() as PinnedScientificCycle;
        if(!response.ok||result.status!=="REVIEWED_SCOPED_SCIENTIFIC_CYCLE"||
           result.schemaVersion!=="OECL_PUBLIC_PINNED_SCIENTIFIC_CYCLE_V1"||
           result.scientificVerdict!=="INCONCLUSIVE"||
           result.compatibilityVerdict!=="NOT_EVALUATED"||
           result.candidateAdmission!=="NOT_ADMITTED"||
           result.selected.sort().join("|")!==[sourceA,sourceB].sort().join("|"))
          throw Error("Reviewed source/EVM cycle failed its scope and provenance checks.");
        if(!ctrl.signal.aborted)setRecord({key:sourceA+"|"+sourceB,data:result});
      }catch(cause){
        if(!ctrl.signal.aborted)setFailure({key:sourceA+"|"+sourceB,
          message:cause instanceof Error?cause.message:"Cycle evidence unavailable."});
      }
    }
    void load();
    return()=>ctrl.abort();
  },[sourceA,sourceB]);

  if(error)return <p role="alert" className="rounded-xl border border-[#e1c4bf] bg-[#fff5f2] p-4 text-sm text-[#854338]">
    Scientific cycle could not be established: {error}. No compatibility claim is made.
  </p>;
  if(!cycle)return <p role="status" className="rounded-xl bg-[#f1f6f2] p-4 text-sm text-[#506858]">
    Checking independently reviewed hypothesis and local EVM cycle...
  </p>;

  const x=cycle.cycle;
  const download="/api/scientific/cycles?sourceA="+encodeURIComponent(sourceA)+
    "&sourceB="+encodeURIComponent(sourceB)+"&download=1";
  return <section data-testid="oecl-scientific-cycle" data-pair={selectedKey}
      aria-label="Pinned scientific hypothesis and falsification cycle"
      className="space-y-5 rounded-2xl border border-[#b7cfc0] bg-[#fbfdfa] p-5 md:p-6">
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#276a48]">
        Reviewed scientific cycle / source AST → falsifier → local EVM → scoped conclusion
      </p>
      <h4 className="mt-2 text-lg font-semibold leading-6 text-[#1a4831]">{x.title}</h4>
      <p className="mt-2 text-sm leading-6 text-[#597062]">
        Compiler-derived hypotheses were documented before execution. Only the preregistered
        pinned local fixture was executed, and its findings were independently reconciled.
      </p>
      <p className="mt-2 text-xs font-semibold text-[#8a6539]">
        SCIENTIFIC VERDICT INCONCLUSIVE · COMPATIBILITY NOT EVALUATED · CANDIDATE NOT ADMITTED
      </p>
    </header>

    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-[#d2e1d6] bg-white p-4">
        <p className="text-xs font-semibold uppercase text-[#467054]">01 · Compiler AST hypothesis</p>
        <p className="mt-2 text-sm font-medium text-[#264b35]">{x.hypothesisKind.replaceAll("_"," ")}</p>
        <p className="mt-2 text-sm leading-6 text-[#4c6758]">{x.hypothesis}</p>
        <p className="mt-2 break-all text-[11px] text-[#657e6d]">ID {x.hypothesisId}</p>
        <p className="mt-1 text-xs text-[#785f37]">Path screen: {x.sourcePathScreen.replaceAll("_"," ")}</p>
      </div>
      <div className="rounded-xl border border-[#d2e1d6] bg-white p-4">
        <p className="text-xs font-semibold uppercase text-[#467054]">02 · How the claim can be challenged</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#264b35]">{x.question}</p>
        <p className="mt-2 text-xs leading-5 text-[#5c7363]">
          {x.preregisteredTestCount} preregistered {x.hypothesisKind==="POTENTIAL_COUPLED_STATE_DECREASE"?
            "boundary challenges in addition to the two positive operations":"specific falsification probes"}.
        </p>
        <p className="mt-2 text-xs text-[#846e4b]">No structural AST match alone establishes execution or compatibility.</p>
      </div>
    </div>

    <div>
      <h5 className="text-sm font-semibold text-[#28523c]">03 · What the isolated EVM actually observed</h5>
      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        {x.tests.map(test=><article key={test.id} data-testid="oecl-cycle-case"
            className="min-w-0 rounded-xl border border-[#d8e5da] bg-white p-4">
          <p className="text-sm font-semibold text-[#244a33]">{test.name}</p>
          <p className="mt-2 text-xs leading-5 text-[#556d5d]"><strong>Would challenge:</strong> {test.falsifier}</p>
          <p className="mt-2 text-sm leading-6 text-[#3f644d]"><strong>Observed:</strong> {test.observation}</p>
          <p className="mt-2 text-[11px] font-semibold text-[#64796b]">
            {test.evidenceType==="UNMINED_READ_ONLY_ABI_PROBE"?
              "Read-only local provider call — NO mined receipt":
              "Receipt checked against the local Hardhat provider"}
          </p>
          {"tx" in test&&<p className="mt-2 break-all font-mono text-[10px] text-[#607468]">
            Local transaction: {test.tx}
          </p>}
          {"zeroTx" in test&&<p className="mt-2 break-all font-mono text-[10px] text-[#607468]">
            Successful zero-quantity boundary: {test.zeroTx}
          </p>}
          <p className="mt-2 break-all font-mono text-[10px] text-[#8a9589]">{test.id}</p>
        </article>)}
      </div>
    </div>

    <div className="rounded-xl border border-[#e1d7be] bg-[#fffaf0] p-4">
      <p className="text-sm font-semibold text-[#78562f]">04 · Scientific conclusion and limits</p>
      <p className="mt-1 text-sm leading-6 text-[#6b5c40]">
        {x.positiveOutcome.replaceAll("_"," ")} — in the reviewed local fixture only.
        No universal compatibility, autonomous general proof, or candidate admission has been established.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[#73634d]">
        {x.limitations.map(limit=><li key={limit}>{limit}</li>)}
      </ul>
    </div>

    <details className="rounded-xl border border-[#d9e4dc] bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#365c43]">
        Source revision, artifact hashes and exact CI provenance
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-5 text-[#5b6e61]">
        <p>Reviewed GitHub Actions run {x.provenance.sourceRunId} · integrated source {cycle.sourceCommit.slice(0,12)}</p>
        <p className="break-all font-mono">Source AST graph SHA-256: {x.provenance.sourceGraphSha256}</p>
        <p className="break-all font-mono">Preregistered source cycle SHA-256: {x.provenance.sourcePlanSha256}</p>
        <p className="break-all font-mono">Independent scientific conclusion SHA-256: {x.provenance.scientificConclusionSha256}</p>
        <p className="break-all font-mono">Pinned public excerpt SHA-256: {cycle.snapshotSha256}</p>
        <p className="break-all font-mono">Implementation revisions: {x.provenance.sourceARevision} × {x.provenance.sourceBRevision}</p>
        <p>{cycle.evidenceDisclosure}</p>
      </div>
    </details>
    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#256647]">
      <a href={cycle.rawEvidenceUrl} target="_blank" rel="noopener noreferrer" className="underline">
        Inspect original CI source and EVM evidence
      </a>
      <a href={download} className="underline">Download scoped scientific cycle JSON</a>
    </div>
  </section>;
}
