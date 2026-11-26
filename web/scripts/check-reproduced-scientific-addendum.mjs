import assert from "node:assert/strict";
import { designAutonomousResearch } from "../src/server/oeclAutonomousResearchPlanner.ts";
import { documentaryScientificQuality } from "../src/server/oeclScientificQualityContract.ts";
import { reviewScientificQuality } from "../src/server/oeclScientificQualityReviewer.ts";
import { reviewedScientificClaimLedger } from "../src/server/oeclScientificClaimGate.ts";
import { issueReproducedVaultAddendum,reproducedHash } from "../src/server/oeclReproducedVaultAddendum.ts";
import { independentlyReviewReproducedVault } from "../src/server/oeclReproducedVaultReviewer.ts";
import { reviewedReproducedVaultAddendum } from "../src/server/oeclReproducedVaultGate.ts";

const standard=id=>({
 id,availability:"PUBLISHED",title:id,description:null,abstract:null,
 status:"Final",category:"ERC",requires:[],interfaceNames:["transfer","deposit"],
 requirements:["Implementations MUST provide reviewed function behavior."],
 oeclPinnedSource:null,provenance:{
  sourceUrl:"https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+id.slice(4)+".md",
  canonicalUrl:"https://eips.ethereum.org/EIPS/eip-"+id.slice(4),
  ref:"master (mutable)",
  sha256:id==="ERC-20"?"a".repeat(64):"b".repeat(64),
 },
});
const pair={status:"DOCUMENTARY_COMPARISON",
 scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
 protocols:["ERC-4626","ERC-20"],
 standards:[standard("ERC-4626"),standard("ERC-20")],
 relation:{kind:"DECLARED_DEPENDENCY",statements:[],
  sharedPrerequisites:[],overlappingInterfaceNames:[]},
 researchQuestions:[],scientificVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",implementationVerified:false,
 evmExecuted:false,warnings:[],
};
pair.autonomousResearch=designAutonomousResearch(pair);
const quality=documentaryScientificQuality(pair);
const sourceReview=reviewScientificQuality(quality,{
 basis:"DOCUMENTARY_SOURCE_ONLY",report:pair});
assert.equal(sourceReview.accepted,true);
const {claimLedger,independentClaimReview}=reviewedScientificClaimLedger(
 quality,sourceReview,pair);
const bridge=reviewedReproducedVaultAddendum(
 quality,sourceReview,claimLedger,independentClaimReview);
const base=bridge.reproductionAddendum;
assert.equal(bridge.independentReproductionReview.accepted,true);
assert.equal(bridge.independentReproductionReview.independentEvmReexecutedByReviewer,false);
assert.equal(quality.experiment.status,"NOT_EXECUTED");
assert.equal(claimLedger.observations.length,0);
assert.equal(claimLedger.conclusion.status,"NOT_EVALUATED");
assert.equal(base.demonstrate.openzeppelin.burnedShares,21);
assert.equal(base.demonstrate.solmate.burnedShares,20);
assert.equal(base.experiment.minedReceiptsAcrossBothRuns,28);
assert.equal(base.challenge.controls.unminedControlsAcrossBothRuns,12);
assert.equal(base.conclusion.scientificVerdict,"INCONCLUSIVE");
assert.equal(base.conclusion.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(base.conclusion.candidateAdmission,"NOT_ADMITTED");
assert.equal(base.conclusion.demonstratedExternalImpact,false);
assert.equal(base.experiment.reexecutedByThisWebRequest,false);
assert.equal(base.demonstrate.receiptBytesIndependentlyVerifiedByThisWebRequest,false);
assert.equal(base.demonstrate.verifiedEthereumConsensus,false);
assert.equal(base.limits.unresolved.length,6);
const attacks=[
 ["fake compatibility",e=>e.conclusion.compatibilityVerdict="COMPATIBLE"],
 ["fake candidate admission",e=>e.conclusion.candidateAdmission="ADMITTED"],
 ["pretend global proof",e=>e.conclusion.scientificVerdict="PROVEN"],
 ["invent production safety",e=>e.conclusion.universalSecurityCertification=true],
 ["invent market utility",e=>e.conclusion.demonstratedExternalImpact=true],
 ["invent numeric success score",e=>e.conclusion.hypothesisVolumeScore=100],
 ["forge local EVM chain",e=>e.experiment.localChainId=1],
 ["forge L2 mainnet",e=>e.experiment.evmEngine="MAINNET"],
 ["add independent consensus",e=>e.experiment.independentClientDiversity=true],
 ["claim web reexecuted",e=>e.experiment.reexecutedByThisWebRequest=true],
 ["pretend only one runner",e=>e.experiment.distinctCiExecutionJobs=1],
 ["change counted receipt",e=>e.experiment.minedReceiptsAcrossBothRuns=29],
 ["change negative controls",e=>e.challenge.controls.unminedControlsAcrossBothRuns=11],
 ["change positive control",e=>e.challenge.controls.oneExpectedSuccessPerVariant=false],
 ["change null hypothesis",e=>e.investigate.statement="Vaults are always compatible"],
 ["change hypothesis ID",e=>e.investigate.hypothesisId="TRUE_PROOF"],
 ["remove falsifier",e=>e.investigate.falsifier=""],
 ["fake autonomous economic law",e=>e.investigate.sourceInference="AUTONOMOUS_LAW_DISCOVERY"],
 ["inflate search",e=>e.investigate.searchedCandidates=626],
 ["alter donation",e=>e.investigate.donationAutomaticallySelected=20],
 ["alter withdrawal",e=>e.investigate.withdrawalAutomaticallySelected=15],
 ["alter OZ burned shares",e=>e.demonstrate.openzeppelin.burnedShares=20],
 ["alter Solmate burned shares",e=>e.demonstrate.solmate.burnedShares=21],
 ["forge vault assets",e=>e.demonstrate.solmate.vaultAssets=22],
 ["forge first receipt digest",e=>e.demonstrate.originalWitnessSha256="a".repeat(64)],
 ["forge second receipt digest",e=>e.demonstrate.secondWitnessSha256="b".repeat(64)],
 ["forge comparison digest",e=>e.demonstrate.comparisonSha256="c".repeat(64)],
 ["forge source code hash",e=>e.demonstrate.proposalJsonSha256="f".repeat(64)],
 ["rewrite GitHub run",e=>e.demonstrate.sourceActionRunUrl="https://attacker.invalid/proven"],
 ["change source commit",e=>e.experiment.sourceRevision.solmate="b".repeat(40)],
 ["invent GitHub artifact",e=>e.demonstrate.artifactIds.original=1],
 ["forge Git commit",e=>e.demonstrate.gitHeadSha="a".repeat(40)],
 ["claim receipt validation in web",e=>e.demonstrate.receiptBytesIndependentlyVerifiedByThisWebRequest=true],
 ["claim authenticated upstream source",e=>e.demonstrate.externallyAuthenticatedSourceOrigin=true],
 ["claim Ethereum consensus",e=>e.demonstrate.verifiedEthereumConsensus=true],
 ["remove limitations",e=>e.limits.unresolved=[]],
 ["pretend permanent archive",e=>e.limits.artifactRetention="FOREVER"],
 ["fake blockchain signature",e=>e.integrity.blockchainAttestation=true],
 ["claim signed archive",e=>e.integrity.signature=true],
 ["forge documentary quality",e=>e.linkage.documentaryQualitySha256="a".repeat(64)],
 ["forge documentary claims",e=>e.linkage.documentaryClaimLedgerSha256="b".repeat(64)],
 ["pretend cross-ERC compatibility",e=>e.linkage.relation="UNIVERSAL_CROSS_ERC_COMPATIBILITY"],
 ["claim another ERC",e=>e.linkage.relatedDocumentaryPair="ERC-20|ERC-721"],
 ["extra hidden certified field",e=>e.researchCertifiedByEthereum=true],
 ["extra hidden utility proof",e=>e.conclusion.provenRevenueUsd=1000000],
];
let rejected=0;
for(const [name,mutate] of attacks){
 const forged=structuredClone(base);
 mutate(forged);
 const {integrity,...body}=forged;
 // Attackers are free to recompute SHA-256: meaning must be checked separately.
 forged.integrity.sha256=reproducedHash(body);
 const actual=independentlyReviewReproducedVault(forged,quality,claimLedger);
 assert.equal(actual.accepted,false,"FORGED_REPRODUCTION_ACCEPTED:"+name);
 assert.equal(actual.conclusion,"INCONCLUSIVE");
 assert.equal(actual.candidateAdmission,"NOT_ADMITTED");
 rejected++;
}
assert.equal(independentlyReviewReproducedVault(base,{
 ...quality,scientificVerdict:"PROVEN"},claimLedger).accepted,false);
assert.equal(independentlyReviewReproducedVault(base,quality,{
 ...claimLedger,conclusion:{...claimLedger.conclusion,status:"PROVEN"}}).accepted,false);
assert.throws(()=>issueReproducedVaultAddendum({
 ...quality,experiment:{...quality.experiment,status:"LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE"}
},claimLedger),/UNVERIFIED_DOCUMENTARY/);
assert.throws(()=>reviewedReproducedVaultAddendum(quality,{
 ...sourceReview,accepted:false},claimLedger,independentClaimReview),
 /PARENT_REVIEW_MISSING/);
console.log("OECL_REPRODUCED_SCIENTIFIC_QUALITY_ADDENDUM_PASS",JSON.stringify({
 acceptedOriginal:true,
 forgedAddendaRejected:rejected,
 sourceOnlyQualityNotPromoted:true,
 sourceOnlyClaimLedgerNotPromoted:true,
 independentWebEvmReplay:false,
 scopedEvmReproductionArchived:true,
 universalCompatibility:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED"
}));
