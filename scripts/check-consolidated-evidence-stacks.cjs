"use strict";
/**
 * Invariant gate for a real two-parent Git integration of two independently
 * tested, *still unmerged* scientific stacks. Detects accidental partial
 * copying, unexplained new work, and changed research or evidence bytes.
 * It does NOT attest the security of Solmate or execute a Solidity test.
 */
const assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const RESEARCH="c7fb535fba976488f3a0c24dba2b700b5938dbfd";
const QUALITY="1e8008fbf8a1af9ad5babfc6c8737e593693167f";
const SHARED_MAIN="2de920f3ceeb1ed2a5256f6123fb10841d5818cb";
const INTEGRATION_MERGE="e5ee94b89fc6749c108c040a8db120389dc547ff";
const researchFiles={
  ".github/workflows/oecl-auto-counterexample-proposal.yml": "A",
  ".github/workflows/oecl-erc4626-blind-probe.yml": "A",
  ".github/workflows/oecl-erc4626-vault-local-evm.yml": "A",
  ".github/workflows/oecl-reusable-vault-grammar.yml": "A",
  ".github/workflows/oecl-solmate-independent-vault.yml": "A",
  ".github/workflows/oecl-vault-donation-counterexample.yml": "A",
  "docs/oecl-auto-counterexample-proposal.md": "A",
  "docs/oecl-erc4626-vault-experiment.md": "A",
  "docs/oecl-independent-second-evm-reproduction.md": "A",
  "docs/oecl-reusable-vault-grammar.md": "A",
  "docs/oecl-solmate-cross-vault.md": "A",
  "docs/oecl-vault-donation-counterexample.md": "A",
  "laboratory/scientific-open-source-worker/ReusableVaultOperationGrammar.cjs": "A",
  "laboratory/scientific-open-source-worker/SolmateCrossVaultProtocol.cjs": "A",
  "laboratory/scientific-open-source-worker/SourceBoundExperimentProposalPlanner.cjs": "A",
  "laboratory/scientific-open-source-worker/VaultAssetFlowProtocol.cjs": "A",
  "laboratory/scientific-open-source-worker/VaultDonationCounterexample.cjs": "A",
  "laboratory/scientific-open-source-worker/replay-auto-counterexample-second-evm.cjs": "A",
  "laboratory/scientific-open-source-worker/run-auto-counterexample-proposal.cjs": "A",
  "laboratory/scientific-open-source-worker/run-erc4626-blind-source-probe.cjs": "A",
  "laboratory/scientific-open-source-worker/run-erc4626-vault-evm.cjs": "A",
  "laboratory/scientific-open-source-worker/run-reusable-vault-grammar-evm.cjs": "A",
  "laboratory/scientific-open-source-worker/run-solmate-cross-vault-evm.cjs": "A",
  "laboratory/scientific-open-source-worker/run-vault-donation-counterexample.cjs": "A",
  "scripts/check-auto-counterexample-falsifiers.cjs": "A",
  "scripts/check-auto-counterexample-proposal.test.cjs": "A",
  "scripts/check-erc4626-vault-protocol.test.cjs": "A",
  "scripts/check-erc4626-vault-witness-falsifiers.cjs": "A",
  "scripts/check-independent-second-evm-discrepancies.cjs": "A",
  "scripts/check-reusable-vault-grammar.test.cjs": "A",
  "scripts/check-reusable-vault-witness-falsifiers.cjs": "A",
  "scripts/check-solmate-cross-vault-falsifiers.cjs": "A",
  "scripts/check-solmate-pinned-source.cjs": "A",
  "scripts/check-vault-donation-counterexample.test.cjs": "A",
  "scripts/check-vault-donation-falsifiers.cjs": "A",
  "scripts/compare-auto-counterexample-independent-evms.cjs": "A",
  "scripts/review-auto-counterexample-proposal.cjs": "A",
  "scripts/review-erc4626-vault-flow.cjs": "A",
  "scripts/review-reusable-vault-grammar.cjs": "A",
  "scripts/review-solmate-cross-vault-evm.cjs": "A",
  "scripts/review-vault-donation-counterexample.cjs": "A"
};
const qualityFiles={
  ".github/workflows/oecl-reproduction-quality-bridge.yml": "A",
  ".github/workflows/web-scientific-dossier.yml": "M",
  "docs/oecl-portable-quality-verifier.md": "A",
  "docs/oecl-reproduced-evm-quality-bridge.md": "A",
  "docs/oecl-scientific-claim-ledger.md": "A",
  "docs/oecl-scientific-quality-contract.md": "A",
  "web/scripts/check-browser-user-journey.mjs": "M",
  "web/scripts/check-portable-scientific-quality.mjs": "A",
  "web/scripts/check-reproduced-scientific-addendum.mjs": "A",
  "web/scripts/check-scientific-claim-ledger.mjs": "A",
  "web/scripts/check-scientific-quality-contract.mjs": "A",
  "web/scripts/check-vault-reproduction-falsifiers.mjs": "A",
  "web/scripts/smoke-scientific-dossier.mjs": "M",
  "web/scripts/verify-quality-artifact.mjs": "A",
  "web/scripts/verify-vault-reproduction.mjs": "A",
  "web/src/app/api/scientific/dossier/route.ts": "M",
  "web/src/app/api/scientific/quality/route.ts": "A",
  "web/src/app/api/scientific/quality/verify/route.ts": "A",
  "web/src/app/api/scientific/standards-pair/route.ts": "M",
  "web/src/components/DocumentaryPairExplorer.tsx": "M",
  "web/src/components/ReproducedVaultResearchPanel.tsx": "A",
  "web/src/components/ScientificDossierResults.tsx": "M",
  "web/src/components/ScientificQualityPanel.tsx": "A",
  "web/src/server/oeclReproducedVaultAddendum.ts": "A",
  "web/src/server/oeclReproducedVaultGate.ts": "A",
  "web/src/server/oeclReproducedVaultReviewer.ts": "A",
  "web/src/server/oeclScientificClaimGate.ts": "A",
  "web/src/server/oeclScientificClaimLedger.ts": "A",
  "web/src/server/oeclScientificClaimReviewer.ts": "A",
  "web/src/server/oeclScientificQualityContract.ts": "A",
  "web/src/server/oeclScientificQualityReviewer.ts": "A"
};
const extras={
 "scripts/check-consolidated-evidence-stacks.cjs":"A",
 ".github/workflows/oecl-consolidated-scientific-integrity.yml":"A",
 "docs/oecl-consolidated-scientific-stack.md":"A",
 // Exact reviewed privacy proposals from #50 only, without changing any
 // of the original 72 scientific research or quality-source Git blobs.
 ".github/workflows/oecl-public-private-research-boundary.yml":"A",
 ".gitignore":"M",
 "docs/RESEARCH_BOUNDARY_AUDIT.md":"A",
 "scripts/check-public-research-boundary.cjs":"A",
 "scripts/run-research-memory.ts":"M",
};
const git=(...args)=>execFileSync("git",args,{encoding:"utf8",maxBuffer:10000000}).trim();
assert.equal(git("merge-base",RESEARCH,QUALITY),SHARED_MAIN,
 "UPSTREAM_STACKS_NOT_BASED_ON_SAME_STABLE_MAIN_COMMIT");
const parents=git("rev-list","--parents","-n","1",INTEGRATION_MERGE).split(" ");
assert.deepEqual(parents,[INTEGRATION_MERGE,QUALITY,RESEARCH],
 "ORIGINAL_MERGE_IS_NOT_A_TWO_PARENT_SOURCE_QUALITY_CONSOLIDATION");
for(const ref of [RESEARCH,QUALITY,INTEGRATION_MERGE]){
 execFileSync("git",["merge-base","--is-ancestor",ref,"HEAD"]);
}
const overlap=Object.keys(researchFiles).filter(x=>Object.hasOwn(qualityFiles,x));
assert.deepEqual(overlap,[],"SCIENTIFIC_SOURCE_QUALITY_PATH_CONFLICT");
const expected=new Map(Object.entries({...researchFiles,...qualityFiles,...extras}));
const changed=git("diff","--name-status","--no-renames",SHARED_MAIN,"HEAD").split("\n")
 .filter(Boolean).map(line=>{const [status,...parts]=line.split("\t");return {status,path:parts.join("\t")};});
assert.equal(changed.length,expected.size,
 "CONSOLIDATED_TREE_FILES_MISSING_OR_UNREVIEWED_FILES_ADDED");
for(const {status,path} of changed){
 assert.equal(expected.get(path),status,"UNEXPECTED_EDIT_IN_CONSOLIDATED_STACK:"+path);
}
function reviewOriginalBytes(origin,files){
 for(const filename of Object.keys(files)){
  const expectedBlob=git("rev-parse",origin+":"+filename);
  const actualBlob=git("rev-parse","HEAD:"+filename);
  assert.equal(actualBlob,expectedBlob,
   "REVIEWED_SCIENTIFIC_SOURCE_OR_QUALITY_CHANGED:"+filename);
 }
}
reviewOriginalBytes(RESEARCH,researchFiles);
reviewOriginalBytes(QUALITY,qualityFiles);
const candidate=git("rev-parse","HEAD");
console.log("OECL_SCIENTIFIC_STACK_CONSOLIDATION_INTEGRITY_PASS",
 JSON.stringify({head:candidate,originalMerge:INTEGRATION_MERGE,
 researchParent:RESEARCH,qualityParent:QUALITY,
 reviewedResearchFiles:Object.keys(researchFiles).length,
 reviewedQualityFiles:Object.keys(qualityFiles).length,
 allowedIntegrationMetadataFiles:Object.keys(extras).length,
 overlappingPaths:0,
 allResearchAndQualityBlobsByteIdentical:true,
 userMergeRequired:true,
 sourceOrEvmAuthorizedForPublicUse:false,
 independentEthereumConsensus:false,
 candidateAdmission:"NOT_ADMITTED",
 compatibilityVerdict:"NOT_EVALUATED"}));
