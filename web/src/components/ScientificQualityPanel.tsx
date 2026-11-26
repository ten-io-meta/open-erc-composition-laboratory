import type { ScientificQualityContract } from "@/server/oeclScientificQualityContract";
import type { ScientificQualityReview } from "@/server/oeclScientificQualityReviewer";

const rubric=[
  {id:"investigate",title:"1 · Investigate"},
  {id:"challenge",title:"2 · Challenge"},
  {id:"experiment",title:"3 · Experiment"},
  {id:"demonstrate",title:"4 · Demonstrate"},
  {id:"limits",title:"5 · Recognize limits"},
] as const;

/** This is presentation only. All fields are server generated and reviewed. */
export function ScientificQualityPanel({
  contract,review,protocolA,protocolB,basis,
}:{
  contract:ScientificQualityContract;
  review:ScientificQualityReview;
  protocolA:string;protocolB:string;
  basis:"documentary"|"pinned";
}){
  const params="protocolA="+encodeURIComponent(protocolA)+
    "&protocolB="+encodeURIComponent(protocolB)+"&basis="+basis;
  const base="/api/scientific/quality?"+params;
  const verify="/api/scientific/quality/verify?"+params+
    "&sha256="+contract.integrity.sha256;
  const stages:{
    investigate:string;challenge:string;experiment:string;
    demonstrate:string;limits:string;
  }={
    investigate:contract.investigate.status,
    challenge:contract.challenge.status,
    experiment:contract.experiment.status,
    demonstrate:contract.demonstrate.status,
    limits:contract.limits.status,
  };
  return <section data-testid="oecl-scientific-quality-contract"
      aria-label="Scientific quality contract"
      className="space-y-4 rounded-2xl border border-[#b6d2c1] bg-[#f6faf7] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#286747]">
          OECL / Scientific quality contract v1
        </p>
        <h4 className="mt-2 text-lg font-semibold text-[#1d4933]">
          What OECL knows, observed, and cannot prove
        </h4>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-[#51695b]">
          A machine-readable chain of hypotheses, falsifiers, evidence references and limits.
          Structural verification is not an independent replay of Ethereum execution.
        </p>
      </div>
      <span className="rounded-full border border-[#dfd1a9] bg-[#fff7e6] px-3 py-2 text-xs font-semibold text-[#755c27]">
        {contract.scientificVerdict} · {contract.candidateAdmission}
      </span>
    </div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {rubric.map(r=><div key={r.id} className="rounded-xl border border-[#d7e4d9] bg-white p-3">
        <p className="text-xs font-semibold text-[#315743]">{r.title}</p>
        <p className="mt-2 break-words font-mono text-[10px] leading-4 text-[#647869]">
          {stages[r.id]}
        </p>
      </div>)}
    </div>
    <div className="rounded-xl border border-[#d9e5dc] bg-white p-4 text-xs text-[#4b6454]">
      <p className="font-semibold">
        Independent structure check: {review.accepted?"PASSED":"REJECTED"}
      </p>
      <p className="mt-2">
        Source-level hypotheses: {contract.investigate.hypotheses.length}.
        {" "}Archived local transactions referenced: {contract.experiment.minedTransactionHashes.length}.
        {" "}Untested threat classes: {contract.challenge.untestedThreats.length}.
      </p>
      {contract.investigate.hypotheses.length>0&&
        <p className="mt-2 leading-5">
          First falsifier: {contract.investigate.hypotheses[0].falsifier}
        </p>}
      <p className="mt-2 leading-5">
        Independent EVM replay: <strong>NOT PERFORMED by this verifier</strong>.
        {" "}External source bytes authenticated: <strong>NO</strong>.
      </p>
      <p className="mt-2 break-all font-mono text-[10px]">
        Contract SHA-256: {contract.integrity.sha256}
      </p>
    </div>
    <details className="rounded-xl border border-[#d7e4d9] bg-white p-4">
      <summary className="cursor-pointer text-xs font-semibold text-[#345743]">
        Inspect unresolved questions ({contract.limits.unknowns.length})
      </summary>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-[#596d60]">
        {contract.limits.unknowns.map((x,i)=><li key={i}>{x}</li>)}
      </ul>
    </details>
    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#28654b]">
      <a href={base+"&download=1"} className="underline underline-offset-2">
        Download machine-readable contract
      </a>
      <a href={verify} className="underline underline-offset-2"
         target="_blank" rel="noopener noreferrer">
        Reconstruct and verify digest
      </a>
    </div>
  </section>;
}
