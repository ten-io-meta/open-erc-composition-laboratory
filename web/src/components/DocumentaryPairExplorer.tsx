"use client";

import { useEffect, useState } from "react";
import type { DocumentaryPair, StandardDocument } from "@/server/oeclErcDocumentaryDiscovery";

type ReadState = { key: string; data: DocumentaryPair | null; error: string | null };

function DocumentationCard({ item }: { item: StandardDocument }) {
  const published = item.availability === "PUBLISHED";
  return <section className="rounded-2xl border border-[#d7e2d9] bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="font-mono text-xs font-semibold text-[#246247]">{item.id}</p>
        <h4 className="mt-2 text-lg font-semibold">{item.title ?? "Specification not confirmed"}</h4>
      </div>
      <span className="rounded-full bg-[#edf4ef] px-3 py-1.5 text-[11px] text-[#456c53]">
        {published ? (item.status ?? "published document") : "Source not confirmed"}
      </span>
    </div>
    {published ? <>
      {item.description && <p className="mt-2 text-sm text-[#526a5a]">{item.description}</p>}
      {item.abstract && <p className="mt-3 text-sm leading-6 text-[#66786c]">{item.abstract}</p>}
      <p className="mt-4 text-xs font-semibold text-[#546e5b]">Declared EIP prerequisites (may be ERC or Core)</p>
      <p className="mt-1 text-sm text-[#3b5745]">
        {item.requires.length ? item.requires.join(" · ") : "None listed in front matter"}
      </p>
      {item.interfaceNames.length>0 && <>
        <p className="mt-4 text-xs font-semibold text-[#546e5b]">Named interface elements in specification</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {item.interfaceNames.slice(0,14).map(name=><span key={name}
            className="rounded-lg border border-[#dfe8df] bg-[#f4f8f4] px-2.5 py-1 font-mono text-[11px]">{name}</span>)}
        </div>
        <p className="mt-2 text-[11px] text-[#7b887c]">Document labels only; no Solidity ABI has been verified.</p>
      </>}
      {item.requirements.length>0 && <details className="mt-4 rounded-lg bg-[#f6f9f5] p-3">
        <summary className="cursor-pointer text-xs font-semibold">Inspect normative excerpts ({item.requirements.length})</summary>
        <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-5 text-[#5c705f]">
          {item.requirements.map((line,i)=><li key={i}>{line}</li>)}
        </ul>
      </details>}
      <p className="mt-4 break-all font-mono text-[10px] text-[#768479]">
        Document SHA-256: {item.provenance.sha256}
      </p>
    </> : <p className="mt-3 text-sm leading-6 text-[#725936]">
      {item.availability === "SOURCE_UNAVAILABLE"
        ? "The registry could not be reached. This does not mean the ERC does not exist."
        : "No matching specification was found in the official ethereum/ERCs repository. A draft, unmerged proposal, or custom implementation may still exist."}
    </p>}
    <a href={item.provenance.sourceUrl} target="_blank" rel="noopener noreferrer"
      className="mt-4 inline-block break-all text-xs font-semibold text-[#236747] underline">
      View original ERC repository document
    </a>
  </section>;
}

export function DocumentaryPairExplorer({protocolA,protocolB}:{protocolA:string;protocolB:string}){
  const [state,setState]=useState<ReadState|null>(null);
  const key=protocolA+"|"+protocolB;
  useEffect(()=>{
    const ctrl=new AbortController();
    async function read(){
      try{
        const url="/api/scientific/standards-pair?protocolA="+encodeURIComponent(protocolA)+
          "&protocolB="+encodeURIComponent(protocolB);
        const response=await fetch(url,{signal:ctrl.signal,cache:"no-store"});
        const body=await response.json();
        if(!response.ok||body.status!=="DOCUMENTARY_COMPARISON"||
          body.scope!=="OFFICIAL_ERC_SPECIFICATIONS_ONLY"||
          body.scientificVerdict!=="NOT_EVALUATED"||
          body.candidateAdmission!=="NOT_ADMITTED"||
          body.evmExecuted!==false||body.implementationVerified!==false||
          body.protocols?.[0]!==protocolA||body.protocols?.[1]!==protocolB)
          throw Error(body.message||"Documentary evidence failed scope checks.");
        if(!ctrl.signal.aborted)setState({key,data:body as DocumentaryPair,error:null});
      }catch(e){
        if(!ctrl.signal.aborted)setState({key,data:null,
          error:e instanceof Error?e.message:"The official ERC documents are unavailable."});
      }
    }
    void read();
    return ()=>ctrl.abort();
  },[protocolA,protocolB]);
  const result=state?.key===key?state:null;
  if(!result)return <div role="status" className="rounded-2xl bg-[#f0f6f2] p-5 text-sm text-[#466a52]">
    Looking up both ERC specifications and their declared dependencies...
  </div>;
  if(result.error)return <div role="alert" className="rounded-2xl border border-[#dec3b9] bg-[#fff8f4] p-5 text-sm text-[#8e4e3a]">
    Official specification lookup unavailable: {result.error}. No relationship is inferred.
  </div>;
  const d=result.data!;
  const relationTitle={
    DECLARED_DEPENDENCY:"Documented relationship found",
    SHARED_DEPENDENCY:"Shared specification foundation",
    NO_DECLARED_DEPENDENCY:"No direct prerequisite declared",
    INCOMPLETE_SPECIFICATIONS:"Incomplete specification evidence",
  }[d.relation.kind];
  return <section data-testid="oecl-documentary-results" aria-label="Any ERC documentary investigation"
    className="space-y-5">
    <div className="rounded-2xl border border-[#b9d6c2] bg-[#f0f8f1] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#287049]">
          Spec-level research · no EVM execution
        </p>
        <span className="rounded-full border border-[#d4b985] bg-[#fff9e9] px-3 py-1 text-[11px] font-semibold text-[#795c2d]">
          NOT EVALUATED · NOT ADMITTED
        </span>
      </div>
      <h4 className="mt-3 text-xl font-semibold text-[#1c4932]">{relationTitle}</h4>
      {d.relation.statements.map(statement=><p key={statement}
        className="mt-2 text-sm leading-6 text-[#42634d]">{statement}</p>)}
      {d.relation.sharedPrerequisites.length>0 && <p className="mt-3 text-xs text-[#476b50]">
        Shared declared prerequisites: {d.relation.sharedPrerequisites.join(", ")}
      </p>}
      {d.relation.overlappingInterfaceNames.length>0 && <p className="mt-3 text-xs text-[#476b50]">
        Same interface labels occur in both documents: {d.relation.overlappingInterfaceNames.join(", ")}.
        These names do not prove compatible signatures or behavior.
      </p>}
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      {d.standards.map(s=><DocumentationCard key={s.id} item={s}/>)}
    </div>
    <div className="rounded-2xl border border-[#e3d7bf] bg-[#fffbf2] p-5">
      <h4 className="font-semibold text-[#6f512b]">What OECL would need to test next</h4>
      <p className="mt-2 text-sm leading-6 text-[#76664b]">
        Select concrete source implementations and immutable revisions, resolve inherited interfaces
        and permissions, derive a candidate interaction, then check executable call paths, asset custody,
        failure rollback and independent EVM receipts. Until then, this is a documentary comparison only.
      </p>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#755d39]">Evidence limitations</summary>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-[#766852]">
          {d.warnings.map(x=><li key={x}>{x}</li>)}
        </ul>
      </details>
    </div>
  </section>;
}
