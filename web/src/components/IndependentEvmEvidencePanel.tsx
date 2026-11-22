"use client";

import {useEffect,useState} from "react";
import type {IndependentEvmReport} from "@/server/oeclIndependentEvmReport";

const endpoint="/api/scientific/independent-evm?sourceA=ERC-8060&sourceB=ERC-20-BURNABLE";
function pretty(s:string){return s.replaceAll("_"," ").toLowerCase();}
export function IndependentEvmEvidencePanel(){
  const [report,setReport]=useState<IndependentEvmReport|null>(null);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{
    const controller=new AbortController();
    fetch(endpoint,{signal:controller.signal,cache:"no-store"})
      .then(async r=>{
        const data=await r.json();
        if(!r.ok||data.status!=="VERIFIED_INDEPENDENT_EVM_EVIDENCE"||!data.report)
          throw Error(data.message||"Unverified local EVM evidence");
        return data.report as IndependentEvmReport;
      })
      .then(value=>{if(!controller.signal.aborted)setReport(value);})
      .catch(e=>{if(!controller.signal.aborted)
        setError(e instanceof Error?e.message:"Independent evidence unavailable");});
    return ()=>controller.abort();
  },[]);

  if(error)return <p role="alert" className="mt-4 rounded-xl border border-[#e8c2bc] bg-[#fff7f5] p-4 text-sm text-[#9a3026]">
    Evidence unavailable: {error}. OECL does not infer a scientific verdict.
  </p>;
  if(!report)return <p role="status" className="mt-5 text-sm text-[#69746b]">
    Verifying the independent source-bound EVM and native-evaluator receipts...
  </p>;

  const native=report.nativeEvaluation;
  return <section className="mt-6 space-y-5 rounded-2xl border border-[#ccd9d0] bg-white p-4 md:p-6"
    aria-label="Independent local EVM evidence and scientific evaluation">
    <header className="flex flex-wrap justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#296d50]">
          Independent evidence · immutable source revisions · local Hardhat EVM
        </p>
        <h3 className="mt-2 text-xl font-medium">ERC-8060 × ERC-20 Burnable</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647169]">
          A separate experiment checked whether the NFT redemption and fungible
          burn can take place in one transaction. This is a test fixture,
          not production deployment or universal interoperability proof.
        </p>
      </div>
      <span className="h-fit rounded-full border border-[#ddcaa8] bg-[#fff7e7] px-3 py-2 font-mono text-xs text-[#8c6b2e]">
        {report.scientificVerdict} · {report.candidateAdmission}
      </span>
    </header>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {([
        ["Positive receipts",report.localEvm.positiveCases],
        ["Negative receipts",report.localEvm.negativeCases],
        ["Native invariants",native.observedConstraints],
        ["Local EVM chain",report.localEvm.chainId]
      ] as const).map(([title,value])=><div key={title}
        className="rounded-xl border border-[#e1e8e3] p-3">
        <p className="text-[11px] text-[#67736b]">{title}</p>
        <p className="mt-2 text-2xl font-medium">{value}</p>
      </div>)}
    </div>

    <section className="rounded-xl bg-[#f4f8f5] p-4">
      <h4 className="font-semibold">What did the EVM actually demonstrate?</h4>
      <p className="mt-2 text-sm leading-6 text-[#53695b]">
        In the positive experiment, one NFT redemption released
        0.10 ETH while 1 fungible token was burned in the same transaction.
        The failed operations preserved their checked protocol state.
        These measurements apply only to the pinned local test environment.
      </p>
      <p className="mt-2 text-xs text-[#647169]">
        The separate native evaluator observed {native.observedConstraints}
        {" "}consistent numeric properties: local polarity <strong>{native.localPropertyPolarity}</strong>.
        Overall scientific verdict remains <strong>{native.finalScientificVerdict}</strong>;
        no candidate was admitted and source coverage is incomplete.
      </p>
    </section>

    <section>
      <h4 className="mb-3 text-sm font-semibold">Actual local EVM transaction receipts</h4>
      <div className="overflow-x-auto rounded-xl border border-[#e2e8e3]">
        <table className="w-full min-w-[600px] border-collapse text-left text-xs">
          <thead className="bg-[#f5f8f5] text-[#516356]">
            <tr>
              <th className="p-3 font-medium">Experiment</th>
              <th className="p-3 font-medium">EVM status</th>
              <th className="p-3 font-medium">Observed effect</th>
              <th className="p-3 font-medium">Transaction hash</th>
            </tr>
          </thead>
          <tbody>
            {report.cases.map(c=><tr key={c.name} className="border-t border-[#e8ece8]">
              <td className="p-3 font-medium">{pretty(c.name)}</td>
              <td className="p-3">{c.status===1?"Success":"Reverted"}</td>
              <td className="p-3 text-[#586a5f]">
                {c.status===1?"Measured local state changes":
                  c.rollbackObserved?"Protocol state preserved":"Not verified"}
              </td>
              <td className="p-3 font-mono text-[10px] text-[#647169]">
                <span title={c.transactionHash}>
                  {c.transactionHash.slice(0,10)}…{c.transactionHash.slice(-8)}
                </span>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-[#65746b]">
        These hashes identify transactions on an ephemeral chain (31337),
        not transactions on Ethereum mainnet.
      </p>
    </section>

    <details className="rounded-xl border border-[#dce5dd] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Four independently evaluated native source constraints
      </summary>
      <div className="mt-3 space-y-3">
        {native.constraints.map(c=><div key={c.id} className="rounded-lg bg-[#f6f8f6] p-3">
          <p className="text-xs font-semibold">
            {c.id.replaceAll("_"," ")}
          </p>
          <p className="mt-2 font-mono text-[11px] text-[#576a5d]">
            {c.predicate.leftMetric} {c.predicate.operator} {c.predicate.rightMetric}
          </p>
          <p className="mt-1 break-all text-[10px] text-[#65746b]">
            {c.filePath}:{c.line} · revision {c.sourceRevision}
          </p>
        </div>)}
      </div>
    </details>

    <details className="rounded-xl border border-[#dce5dd] p-4">
      <summary className="cursor-pointer text-sm font-semibold">
        Reproducibility and unresolved scientific conditions
      </summary>
      <p className="mt-3 break-all font-mono text-[10px] text-[#5d6f62]">
        EVM receipt SHA-256: {report.evidenceHashes.evmReceiptSha256}
      </p>
      <p className="mt-2 break-all font-mono text-[10px] text-[#5d6f62]">
        Native evaluation SHA-256: {report.evidenceHashes.nativeEvaluationSha256}
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-[#63736a]">
        {[...native.limitations,...report.limitations].map((l,i)=>
          <li key={i}>{l}</li>)}
      </ul>
    </details>

    <div className="flex flex-wrap gap-3">
      <a href={endpoint+"&download=1"}
        className="rounded-xl bg-[#205c44] px-4 py-3 text-xs font-semibold text-white">
        Download scientific EVM evidence (JSON)
      </a>
      <a href={"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/"+
        report.experimentRunId}
        target="_blank" rel="noopener noreferrer"
        className="rounded-xl border border-[#d0dbd1] px-4 py-3 text-xs font-semibold text-[#205c44]">
        Inspect original GitHub Actions artifacts
      </a>
    </div>
  </section>;
}
