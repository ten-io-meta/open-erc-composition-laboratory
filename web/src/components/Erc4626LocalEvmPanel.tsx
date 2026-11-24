"use client";

import { useEffect,useState } from "react";
import type { VerifiedErc4626LocalEvm } from "@/server/oeclPinnedErc4626Evm";

type ResponseData = VerifiedErc4626LocalEvm & {status:"VERIFIED_PINNED_LOCAL_EVM"};
export function Erc4626LocalEvmPanel(){
  const [data,setData]=useState<ResponseData|null>(null);
  const [error,setError]=useState<string|null>(null);
  useEffect(()=>{
    const ctrl=new AbortController();
    async function load(){
      try{
        const r=await fetch("/api/scientific/erc4626-evm",{signal:ctrl.signal,cache:"no-store"});
        const j=await r.json() as ResponseData;
        if(!r.ok||j.status!=="VERIFIED_PINNED_LOCAL_EVM"||
           j.runId!==45212718140||
           j.experiment.scope!=="OZ_4_9_6_ERC4626_ERC20_ISOLATED_FIXTURE_ONLY"||
           j.experiment.scientificVerdict!=="INCONCLUSIVE"||
           j.experiment.candidateAdmission!=="NOT_ADMITTED"||
           j.experiment.evmExecuted!==true||j.experiment.localChainId!==31337||
           j.experiment.minedReceipts.length!==7||
           j.experiment.readOnlyNegativeControls.length!==3)
          throw Error("Local EVM receipt scope or provenance could not be verified.");
        if(!ctrl.signal.aborted)setData(j);
      }catch(e){
        if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:"Independent EVM evidence unavailable.");
      }
    }
    void load();
    return()=>ctrl.abort();
  },[]);
  if(error)return <p role="alert" className="rounded-xl border border-[#e8c5bd] bg-[#fff5f2] p-4 text-sm text-[#934936]">
    ERC-4626 local EVM evidence unavailable: {error}. No scientific conclusion inferred.
  </p>;
  if(!data)return <p role="status" className="rounded-xl bg-[#f1f7f2] p-4 text-sm text-[#5a755f]">
    Verifying independent ERC-4626 × ERC-20 local-EVM receipts...
  </p>;
  const e=data.experiment,o=e.observations;
  return <section aria-label="Independent ERC-4626 and ERC-20 local EVM evidence"
    data-testid="oecl-erc4626-evm" className="space-y-4 rounded-2xl border border-[#bfcfda] bg-white p-5">
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#245778]">
        03 / New independent local EVM experiment
      </p>
      <h4 className="text-xl font-semibold">ERC-4626 vault × ERC-20 asset: tested accounting path</h4>
      <p className="text-sm leading-6 text-[#5d7180]">
        A locked OpenZeppelin 4.9.6 fixture deployed a vault and token on an isolated
        Hardhat chain (ID 31337). These are actual local EVM transactions, not network activity
        or proof of compatibility across arbitrary implementations.
      </p>
      <p className="text-xs font-semibold text-[#916936]">
        LOCAL OBSERVATION · GLOBAL VERDICT INCONCLUSIVE · CANDIDATE NOT ADMITTED
      </p>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-[#f0f6f2] p-4">
        <p className="text-xs text-[#4b6654]">Initial vault deposit</p>
        <p className="mt-1 text-xl font-semibold">100 tokens</p>
        <p className="mt-1 text-xs text-[#567362]">Issued 100 shares</p>
      </div>
      <div className="rounded-xl bg-[#f0f6f2] p-4">
        <p className="text-xs text-[#4b6654]">Owner redemption</p>
        <p className="mt-1 text-xl font-semibold">40 tokens</p>
        <p className="mt-1 text-xs text-[#567362]">40 shares burned</p>
      </div>
      <div className="rounded-xl bg-[#f0f6f2] p-4">
        <p className="text-xs text-[#4b6654]">Final vault assets / shares</p>
        <p className="mt-1 text-xl font-semibold">70 / 70</p>
        <p className="mt-1 text-xs text-[#567362]">Second account deposited 10 tokens</p>
      </div>
    </div>
    <div>
      <h5 className="text-sm font-semibold">Seven confirmed local EVM transactions</h5>
      <div className="mt-2 overflow-x-auto rounded-xl border border-[#dbe5df]">
        <table className="w-full min-w-[580px] text-left text-xs">
          <thead className="bg-[#f1f6f3] text-[#466553]">
            <tr><th className="p-3">Operation</th><th className="p-3">Status</th>
              <th className="p-3">Local block</th><th className="p-3">Transaction hash</th></tr>
          </thead>
          <tbody>
            {e.minedReceipts.map(x=><tr key={x.txHash} className="border-t border-[#e4eae6]">
              <td className="p-3">{x.name}</td><td className="p-3 font-semibold text-[#257347]">
                {x.status===1?"SUCCESS":"UNVERIFIED"}
              </td><td className="p-3 tabular-nums">{x.blockNumber}</td>
              <td className="break-all p-3 font-mono text-[10px]">{x.txHash}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h5 className="text-sm font-semibold">Three EVM simulations that correctly reverted</h5>
      <p className="mt-1 text-xs leading-5 text-[#7d6947]">
        These checks used <code>callStatic</code>; they are EVM simulations without mined transaction receipts.
      </p>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-xs text-[#596e61]">
        {e.readOnlyNegativeControls.map(x=><li key={x.name}>{x.name} — reverted,
          state unchanged, no mined transaction</li>)}
      </ul>
    </div>
    <details className="rounded-xl border border-[#dfdfd7] p-3">
      <summary className="cursor-pointer text-sm font-semibold">Evidence provenance, source hashes and scientific limitations</summary>
      <div className="mt-3 space-y-3 text-xs leading-5 text-[#596e61]">
        <p>Run: {data.runId}, locked solc: {e.compilerVersion}, OpenZeppelin: {e.lockedDependency.version}</p>
        <p className="break-all font-mono">Fixture SHA-256: {e.sourceSha256}</p>
        <p className="break-all font-mono">Original compiler observation: vault assets after deposit {o.afterDeposit.assetsInVault} base units.</p>
        <ul className="list-disc space-y-1 pl-5">{e.limitations.map(x=><li key={x}>{x}</li>)}</ul>
      </div>
    </details>
    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#256647]">
      <a target="_blank" rel="noopener noreferrer" href={data.provenanceUrl} className="underline">
        Inspect original GitHub Actions EVM run
      </a>
      <a href="/api/scientific/erc4626-evm?download=1" className="underline">
        Download verified evidence JSON
      </a>
    </div>
  </section>;
}
