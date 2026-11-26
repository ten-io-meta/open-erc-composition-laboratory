import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import pinned from "../src/data/erc8060Erc8098ScientificDossier.json" with {type:"json"};
import { designAutonomousResearch } from "../src/server/oeclAutonomousResearchPlanner.ts";
import { documentaryScientificQuality,pinnedScientificQuality } from "../src/server/oeclScientificQualityContract.ts";
import { reviewScientificQuality } from "../src/server/oeclScientificQualityReviewer.ts";
import { issueScientificClaimLedger,scientificClaimHash } from "../src/server/oeclScientificClaimLedger.ts";
import { independentlyReviewScientificClaims } from "../src/server/oeclScientificClaimReviewer.ts";
import { reviewedScientificClaimLedger } from "../src/server/oeclScientificClaimGate.ts";
import { verifyPortableQuality,verifyPortableClaimLedger } from "./verify-quality-artifact.mjs";

const standard=(id,requires=[],names=["transfer"])=>({
 id,availability:"PUBLISHED",title:id,description:null,abstract:null,status:"Final",category:"ERC",
 requires,interfaceNames:names,requirements:["Implementations MUST check the specified behavior."],
 oeclPinnedSource:null,provenance:{
  sourceUrl:"https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+id.slice(4)+".md",
  canonicalUrl:"https://eips.ethereum.org/EIPS/eip-"+id.slice(4),
  ref:"master (mutable)",sha256:id==="ERC-20"?"a".repeat(64):"b".repeat(64),
 },
});
const pair={
 status:"DOCUMENTARY_COMPARISON",scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
 protocols:["ERC-4626","ERC-20"],
 standards:[standard("ERC-4626",["EIP-20"],["deposit","withdraw"]),
  standard("ERC-20",[],["transfer","transferFrom"])],
 relation:{kind:"DECLARED_DEPENDENCY",statements:["ERC-4626 requires ERC-20"],
  sharedPrerequisites:[],overlappingInterfaceNames:[]},
 researchQuestions:[],scientificVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
 implementationVerified:false,evmExecuted:false,warnings:[],
};
pair.autonomousResearch=designAutonomousResearch(pair);
const qDoc=documentaryScientificQuality(pair);
const docReview=reviewScientificQuality(qDoc,{basis:"DOCUMENTARY_SOURCE_ONLY",report:pair});
assert.equal(docReview.accepted,true);
const doc=reviewedScientificClaimLedger(qDoc,docReview,pair);
assert.equal(doc.independentClaimReview.accepted,true);
assert.equal(doc.claimLedger.hypotheses.length>0,true);
assert.deepEqual(doc.claimLedger.observations,[]);
assert.equal(doc.claimLedger.conclusion.status,"NOT_EVALUATED");
assert.equal(doc.claimLedger.utility.status,"NOT_YET_DEMONSTRATED");
assert.equal(doc.claimLedger.utility.score,null);
assert.equal(doc.claimLedger.utility.demonstratedExternalImpact,false);
assert.equal(verifyPortableClaimLedger(doc.claimLedger,qDoc,pair).accepted,true);
const docPublicResponse={...pair,qualityContract:qDoc,independentQualityReview:docReview,
 claimLedger:doc.claimLedger,independentClaimReview:doc.independentClaimReview};
const portableDoc=verifyPortableQuality({
 contract:qDoc,claimLedger:doc.claimLedger,review:{accepted:true}
},docPublicResponse);
assert.equal(portableDoc.status,"CONSISTENT_WITH_PROVIDED_EVIDENCE",
 JSON.stringify(portableDoc.failedChecks));
assert.equal(portableDoc.claimLedgerReview.accepted,true);

const hash=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const pinHash=hash(pinned);
const runUrl="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127";
const qPin=pinnedScientificQuality(pinned,pinHash,runUrl);
const pinReview=reviewScientificQuality(qPin,{basis:"PINNED_LOCAL_EVM_SNAPSHOT",
 report:pinned,snapshotSha256:pinHash,evidenceRunUrl:runUrl});
assert.equal(pinReview.accepted,true);
const local=reviewedScientificClaimLedger(qPin,pinReview,pinned);
assert.equal(local.independentClaimReview.accepted,true);
assert.equal(local.claimLedger.observations.length,1);
assert.equal(local.claimLedger.observations[0].measurements.bothBurnsInSameTransaction,true);
assert.equal(local.claimLedger.observations[0].transactionHash,pinned.experiment.transactionHash);
assert.equal(local.claimLedger.conclusion.status,"INCONCLUSIVE");
assert.equal(local.claimLedger.conclusion.universalCompatibilityProven,false);
assert.equal(local.claimLedger.utility.status,"SCOPED_REVIEWABLE_FINDING_ONLY");
assert.equal(local.claimLedger.utility.demonstratedExternalImpact,false);
assert.equal(local.claimLedger.provenance.independentEvmReplay,false);
assert.equal(verifyPortableClaimLedger(local.claimLedger,qPin,pinned).accepted,true);
const portablePin=verifyPortableQuality({
 contract:qPin,claimLedger:local.claimLedger,review:{accepted:true}
},{dossier:pinned});
assert.equal(portablePin.status,"CONSISTENT_WITH_PROVIDED_EVIDENCE",
 JSON.stringify(portablePin.failedChecks));
assert.equal(portablePin.claimLedgerReview.accepted,true);

const documentaryAttacks=[
 ["promote compatibility",l=>l.compatibilityVerdict="COMPATIBLE"],
 ["admit unsafe candidate",l=>l.candidateAdmission="ADMITTED"],
 ["forge conclusion",l=>l.conclusion.status="PROVEN"],
 ["forge observation",l=>l.observations.push({id:"FAKE_MAINNET_PROOF"})],
 ["fake receipt",l=>l.observations=[{transactionHash:"0x"+"f".repeat(64)}]],
 ["fake scoped EVM",l=>l.conclusion.scope="ONE_PINNED_LOCAL_EVM_SCENARIO_ONLY"],
 ["fake published proof",l=>l.conclusion.statement="Universal compatibility proven"],
 ["fake support",l=>l.conclusion.supportingObservationIds=["FAKE"]],
 ["claim independent replay",l=>l.conclusion.independentEvmReplay=true],
 ["claim universal",l=>l.conclusion.universalCompatibilityProven=true],
 ["fake use value",l=>l.utility.status="IMPACT_PROVEN"],
 ["invent product revenue",l=>l.utility.demonstratedExternalImpact=true],
 ["invent security certification",l=>l.utility.securityCertification=true],
 ["score hypotheses",l=>l.utility.score=100],
 ["count hypotheses as evidence",l=>l.utility.countingHypothesesIsEvidence=true],
 ["hide unknowns",l=>l.utility.missingForStrongerClaim=[]],
 ["forge research use",l=>l.utility.concreteResearchUse="RISK_FREE_YIELD"],
 ["alter hypothesis prediction",l=>l.hypotheses[0].prediction="fully compatible"],
 ["remove falsifier",l=>l.hypotheses[0].falsifier=""],
 ["remove control",l=>l.hypotheses[0].negativeControl=""],
 ["forge source",l=>l.hypotheses[0].sourceSha256=["0".repeat(64)]],
 ["forge parent quality",l=>l.qualityContractSha256="0".repeat(64)],
 ["forge source report",l=>l.sourceReportSha256="a".repeat(64)],
 ["grant execution",l=>l.provenance.sourceOrExecutionAuthorityGranted=true],
 ["insert hidden field",l=>l.certification="ERC_COMPATIBILITY_CERTIFIED"],
];
const localAttacks=[
 ["fake local receipts",l=>l.observations[0].transactionHash="0x"+"f".repeat(64)],
 ["fake chain ID",l=>l.observations[0].chainId=1],
 ["fabricate redeemed ETH",l=>l.observations[0].measurements.ethRedeemedWei="999999"],
 ["fabricate supply change",l=>l.observations[0].measurements.supplyDecreaseBaseUnits="0"],
 ["hide negative control",l=>l.hypotheses[0].negativeControl=""],
 ["invent verification",l=>l.observations[0].proofStatus="CONSENSUS_PROVEN"],
 ["change evidence archive",l=>l.observations[0].evidenceRefs=["f".repeat(64)]],
 ["invent second observation",l=>l.observations.push({id:"MAINNET_PROOF"})],
 ["remove observation",l=>l.observations=[]],
 ["declare EVM replay",l=>l.provenance.independentEvmReplay=true],
 ["forge external source auth",l=>l.provenance.independentSourceOriginAuthentication=true],
 ["forge security certificate",l=>l.utility.securityCertification=true],
 ["declare economic impact",l=>l.utility.demonstratedExternalImpact=true],
 ["claim global proof",l=>l.conclusion.universalCompatibilityProven=true],
 ["replace limited conclusion",l=>l.conclusion.statement="All vaults secure"],
 ["withdraw conclusion evidence",l=>l.conclusion.supportingObservationIds=[]],
 ["declare utility score",l=>l.utility.score=9.8],
 ["count hypotheses as evidence",l=>l.utility.countingHypothesesIsEvidence=true],
 ["conceal adversarial limits",l=>l.utility.missingForStrongerClaim.pop()],
 ["change utility",l=>l.utility.status="VERIFIED_REVENUE"],
 ["forge parent source",l=>l.sourceReportSha256="0".repeat(64)],
 ["forge claim digest parent",l=>l.qualityContractSha256="f".repeat(64)],
 ["add hidden evidence field",l=>l.utility.provenByEthereum=true],
 ["promote verdict",l=>l.scientificVerdict="PROVEN"],
 ["switch to documentary",l=>l.basis="DOCUMENTARY_SOURCE_ONLY"],
];
let rejections=0;
for(const [name,mutation] of documentaryAttacks){
 const forged=structuredClone(doc.claimLedger);mutation(forged);
 const {integrity,...body}=forged;forged.integrity.sha256=scientificClaimHash(body);
 assert.equal(independentlyReviewScientificClaims(forged,qDoc,pair).accepted,false,
  "SERVER_ACCEPTED_REHASHED_DOC_FORGERY:"+name);
 assert.equal(verifyPortableClaimLedger(forged,qDoc,pair).accepted,false,
  "OFFLINE_ACCEPTED_REHASHED_DOC_FORGERY:"+name);
 rejections++;
}
for(const [name,mutation] of localAttacks){
 const forged=structuredClone(local.claimLedger);mutation(forged);
 const {integrity,...body}=forged;forged.integrity.sha256=scientificClaimHash(body);
 assert.equal(independentlyReviewScientificClaims(forged,qPin,pinned).accepted,false,
  "SERVER_ACCEPTED_REHASHED_EVM_FORGERY:"+name);
 assert.equal(verifyPortableClaimLedger(forged,qPin,pinned).accepted,false,
  "OFFLINE_ACCEPTED_REHASHED_EVM_FORGERY:"+name);
 rejections++;
}
assert.throws(()=>reviewedScientificClaimLedger(qDoc,{
 ...docReview,accepted:false},pair),/UNVERIFIED_QUALITY_PARENT/);
assert.throws(()=>issueScientificClaimLedger(qDoc,{...pair,evmExecuted:true}),
 /CLAIM_LEDGER_CANNOT_PROMOTE_DOCUMENTARY_SOURCE/);
assert.throws(()=>issueScientificClaimLedger(qPin,{...pinned,
  experiment:{...pinned.experiment,chainId:1}}),
 /CLAIM_LEDGER_PINNED_LOCAL_EVM_UNVERIFIED/);
console.log("OECL_CLAIM_LEDGER_UTILITY_FALSIFIERS_PASS",JSON.stringify({
 testedDocumentary:"UNTESTED",testedPinned:"SCOPED_ARCHIVE_ONLY",
 rehashedTamperingRejected:rejections,serverAndOfflineReviewersBothReject:true,
 noUtilityScoringByHypothesisCount:true,independentEvmReplay:false,
 compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
}));
