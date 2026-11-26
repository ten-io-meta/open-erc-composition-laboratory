import type { ReproducedVaultAddendum } from "@/server/oeclReproducedVaultAddendum";
import type { ReproducedVaultReview } from "@/server/oeclReproducedVaultReviewer";

/**
 * This is an ADDENDUM about OZ vs Solmate implementations of ERC4626.
 * It does not upgrade the documentary relationship of ERC4626 + ERC20.
 */
export function ReproducedVaultResearchPanel({
 evidence,review,
}:{evidence:ReproducedVaultAddendum;review:ReproducedVaultReview}){
 const url="/api/scientific/quality?protocolA=ERC-4626&protocolB=ERC-20&basis=documentary&download=1";
 const verify="/api/scientific/quality/verify?protocolA=ERC-4626&protocolB=ERC-20"+
  "&basis=documentary&sha256="+evidence.linkage.documentaryQualitySha256+
  "&reproductionSha256="+evidence.integrity.sha256+
  "&claimsSha256="+evidence.linkage.documentaryClaimLedgerSha256;
 return <section data-testid="oecl-two-evm-reproduction" aria-label="Scoped independent EVM reproduction"
   className="space-y-4 rounded-2xl border border-[#c7d9e9] bg-[#f5f8fc] p-5">
   <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#335982]">
     Separate pinned experiment · Two local EVM executions
   </p>
   <h4 className="text-lg font-semibold text-[#22476b]">A question OECL could refute twice</h4>
   <p className="text-xs leading-5 text-[#50667c]">
     A bounded model comparison of <strong>OpenZeppelin</strong> and <strong>Solmate</strong>
     {" "}ERC-4626 implementations. This is not an ERC-20 × ERC-4626
     interoperability certification or a general security finding.
   </p>
   <div className="grid gap-2 sm:grid-cols-2">
     {([
       {name:"OpenZeppelin",result:evidence.demonstrate.openzeppelin},
       {name:"Solmate",result:evidence.demonstrate.solmate},
     ]).map(item=><div key={item.name}
       className="rounded-lg border border-[#d8e4f0] bg-white p-3">
       <p className="text-sm font-semibold text-[#294e72]">{item.name}</p>
       <p className="mt-2 text-2xl font-semibold text-[#1e4165]">
         {item.result.burnedShares} shares burned
       </p>
       <p className="mt-1 text-xs text-[#567087]">
         {item.result.remainingShares} shares and {item.result.vaultAssets} underlying
         assets left in the vault
       </p>
     </div>)}
   </div>
   <p className="text-xs leading-5 text-[#4c6780]">
     In each pinned research fixture: deposit 40, donate 2, withdraw 21.
     Two separately executed CI-local Hardhat runs produced 28 mined receipts
     and 12 unmined controls in total. Scoped equal-share-burn hypothesis:
     <strong> {evidence.challenge.nullHypothesisVerdict}</strong>.
   </p>
   <div className="rounded-lg border border-[#d8e4f0] bg-white p-3 text-xs leading-5 text-[#415b73]">
     <p><strong>Scientific conclusion: {evidence.conclusion.scientificVerdict}</strong>.
       {" "}Compatibility: <strong>{evidence.conclusion.compatibilityVerdict}</strong>.
       {" "}Admission: <strong>{evidence.conclusion.candidateAdmission}</strong>.</p>
     <p className="mt-2">Archived evidence metadata review:
       <strong> {review.accepted?"PASSED":"REJECTED"}</strong>. This web request
       did <strong>not</strong> repeat an EVM run or independently re-verify
       every receipt. Both CI runs used the same Hardhat engine; public-chain
       consensus and real-world economic utility remain unproven.</p>
   </div>
   <details className="rounded-lg border border-[#d8e4f0] bg-white p-3 text-xs">
     <summary className="cursor-pointer font-semibold">Unresolved limitations ({evidence.limits.unresolved.length})</summary>
     <ul className="mt-3 list-disc space-y-2 pl-4 text-[#526b80]">
       {evidence.limits.unresolved.map((x,i)=><li key={i}>{x}</li>)}
     </ul>
   </details>
   <p className="break-all font-mono text-[10px] text-[#536c82]">
     Reproduction document SHA-256: {evidence.integrity.sha256}
   </p>
   <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#2f5e89]">
     <a href={evidence.demonstrate.sourceActionRunUrl} target="_blank"
       rel="noopener noreferrer" className="underline underline-offset-2">
       Inspect source CI run and witness artifacts
     </a>
     <a href={url} className="underline underline-offset-2">
       Download quality dossier and reproduction
     </a>
     <a href={verify} target="_blank" rel="noopener noreferrer"
       className="underline underline-offset-2">
       Reconstruct all three digest bindings
     </a>
   </div>
 </section>;
}
