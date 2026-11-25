import type { AutonomousResearchPlan } from "@/server/oeclAutonomousResearchPlanner";

const labels:Record<string,string>={
  DECLARED_PREREQUISITE_CONFORMANCE:"Declared prerequisite",
  SHARED_PREREQUISITE_SEMANTICS:"Shared prerequisite semantics",
  SHARED_INTERFACE_SEMANTICS:"Shared method semantics",
  CONDITIONAL_ASSET_FLOW:"Possible adapter-based asset flow",
  SINGLE_ERC_NORMATIVE_TEST:"Candidate normative requirement",
  SINGLE_ERC_INTERFACE_TEST:"Documented interface obligation",
};
export function AutonomousResearchPanel({plan}:{plan:AutonomousResearchPlan}){
  const pairHypotheses=plan.hypotheses.filter(x=>x.relationshipScope==="CROSS_STANDARD_CONDITIONAL").length;
  return <section data-testid="oecl-autonomous-research" data-pair={plan.pairKey}
      aria-label="Automatic source-anchored scientific research plan"
      className="space-y-4 rounded-2xl border border-[#bad1c5] bg-[#f7fbf8] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#29684d]">
          Automated research design · documents only
        </p>
        <h4 className="mt-2 text-xl font-semibold text-[#214733]">What should the scientist test next?</h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#536c5d]">
          OECL automatically derives conditional predictions, possible counterexamples,
          positive and negative controls from the retrieved standard documents.
          Every proposal requires semantic review before execution.
        </p>
      </div>
      <span className="rounded-full border border-[#e1cba7] bg-[#fff9e9] px-3 py-1.5 text-[11px] font-semibold text-[#78562d]">
        PROPOSED · NOT TESTED
      </span>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-[#d6e4da] bg-white p-3">
        <p className="text-xs text-[#567060]">Source-anchored proposals</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[#26533d]">{plan.hypotheses.length}</p>
      </div>
      <div className="rounded-xl border border-[#d6e4da] bg-white p-3">
        <p className="text-xs text-[#567060]">Cross-standard candidates</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[#26533d]">{pairHypotheses}</p>
      </div>
      <div className="rounded-xl border border-[#d6e4da] bg-white p-3">
        <p className="text-xs text-[#567060]">EVM experiments executed here</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[#26533d]">0</p>
      </div>
    </div>
    <p className="text-xs font-semibold text-[#84613a]">
      {plan.planningStatus.replaceAll("_"," ")} · COMPATIBILITY NOT EVALUATED · NOT ADMITTED
    </p>

    {plan.abstentionReasons.length>0&&<div data-testid="oecl-scientist-abstention"
        className="rounded-xl border border-[#e7d7b8] bg-[#fffaf0] p-4">
      <p className="text-sm font-semibold text-[#795b32]">Where the scientist must abstain</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-[#746448]">
        {plan.abstentionReasons.map(x=><li key={x}>{x}</li>)}
      </ul>
    </div>}

    {plan.hypotheses.length>0&&<div className="space-y-3">
      <h5 className="text-sm font-semibold text-[#345745]">Hypotheses and explicit falsifiers</h5>
      {plan.hypotheses.map((h,i)=><details key={h.id}
          data-testid="oecl-autonomous-hypothesis" className="rounded-xl border border-[#d5e2d9] bg-white p-4"
          open={i===0?true:undefined}>
        <summary className="cursor-pointer text-sm font-semibold leading-6 text-[#2b513b]">
          {labels[h.family]??h.family}: {h.question}
        </summary>
        <div className="mt-3 space-y-3 text-xs leading-5 text-[#506d5c]">
          <p><strong>Conditional prediction:</strong> {h.conditionalPrediction}</p>
          <p className="rounded-lg bg-[#fff8ee] p-3 text-[#796044]">
            <strong>What would falsify it?</strong> {h.falsifier}
          </p>
          <p><strong>Alternative explanation:</strong> {h.alternativeExplanation}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <p><strong>Positive control:</strong> {h.positiveControl}</p>
            <p><strong>Negative control:</strong> {h.negativeControl}</p>
          </div>
          <p className="font-semibold">Prerequisites before any experiment</p>
          <ul className="list-disc space-y-1 pl-5">{h.preconditions.map(x=><li key={x}>{x}</li>)}</ul>
          <p className="font-semibold">Evidence needed</p>
          <ul className="list-disc space-y-1 pl-5">{h.evidenceRequired.map(x=><li key={x}>{x}</li>)}</ul>
          <p className="font-semibold">Documentary anchors</p>
          <ul className="space-y-2">{h.anchors.map(a=><li key={a.sourceId+a.kind+a.excerpt}
              className="rounded-md bg-[#f2f7f3] p-2">
            <p><strong>{a.sourceId}</strong> · {a.kind.replaceAll("_"," ")} · {a.excerpt}</p>
            <p className="mt-1 break-all font-mono text-[10px]">Document SHA-256: {a.documentSha256}</p>
            <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="mt-1 inline-block font-semibold text-[#276c4a] underline">Read original source</a>
          </li>)}</ul>
          <p className="break-all font-mono text-[10px]">{h.id} · {h.hypothesisStatus.replaceAll("_"," ")}</p>
        </div>
      </details>)}
    </div>}

    <details className="rounded-xl border border-[#d8e3d9] bg-white p-4">
      <summary className="cursor-pointer text-sm font-semibold text-[#3d5946]">
        Research plan provenance and execution barriers
      </summary>
      <div className="mt-3 space-y-2 text-xs leading-5 text-[#5b6d60]">
        <p>Engine: {plan.engine.replaceAll("_"," ")}. It is not unrestricted AI reasoning or self-executing Solidity.</p>
        <p>Execution: {plan.executionGate.replaceAll("_"," ")}.</p>
        <p>Sources are read from a mutable branch; the SHA-256 below identifies the retrieved document versions.</p>
        <ul className="list-disc space-y-1 pl-5">{plan.sourceRevisions.map(d=><li key={d.id}
          className="break-all font-mono text-[10px]">{d.id}: {d.sha256}</li>)}</ul>
        <p className="break-all font-mono text-[10px]">Plan SHA-256: {plan.planSha256}</p>
        <ul className="list-disc space-y-1 pl-5">{plan.evidenceGap.map(g=><li key={g}>{g}</li>)}</ul>
        <p className="font-semibold">Next actions</p>
        <ol className="list-decimal space-y-1 pl-5">{plan.nextActions.map(x=><li key={x}>{x}</li>)}</ol>
      </div>
    </details>
  </section>;
}
