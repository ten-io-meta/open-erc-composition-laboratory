import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import pinned from "../src/data/erc8060Erc8098ScientificDossier.json" with {type:"json"};
import { designAutonomousResearch } from "../src/server/oeclAutonomousResearchPlanner.ts";
import { scientificQualityHash,documentaryScientificQuality,pinnedScientificQuality } from "../src/server/oeclScientificQualityContract.ts";
import { reviewScientificQuality } from "../src/server/oeclScientificQualityReviewer.ts";

function standard(id,requires=[],names=["transfer"]){
  return {id,availability:"PUBLISHED",
    title:"Reviewed "+id,description:null,abstract:null,status:"Final",category:"ERC",
    requires,interfaceNames:names,requirements:[
      "Implementations MUST provide the declared behavior under reviewed preconditions."
    ],oeclPinnedSource:null,provenance:{
      sourceUrl:"https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+id.slice(4)+".md",
      canonicalUrl:"https://eips.ethereum.org/EIPS/eip-"+id.slice(4),
      ref:"master (mutable)",sha256:id==="ERC-20"?"a".repeat(64):"b".repeat(64),
    }};
}
const pair={
 status:"DOCUMENTARY_COMPARISON",scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
 protocols:["ERC-4626","ERC-20"],
 standards:[standard("ERC-4626",["EIP-20"],["deposit","withdraw"]),
   standard("ERC-20",[],["transfer","transferFrom"])],
 relation:{kind:"DECLARED_DEPENDENCY",statements:["ERC-4626 requires ERC-20"],
  sharedPrerequisites:[],overlappingInterfaceNames:[]},
 researchQuestions:[],scientificVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",implementationVerified:false,evmExecuted:false,warnings:[],
};
pair.autonomousResearch=designAutonomousResearch(pair);
const doc=documentaryScientificQuality(pair);
const docContext={basis:"DOCUMENTARY_SOURCE_ONLY",report:pair};
assert.equal(reviewScientificQuality(doc,docContext).accepted,true);
assert.equal(doc.investigate.hypotheses.length>0,true);
assert.equal(doc.experiment.status,"NOT_EXECUTED");
assert.equal(doc.experiment.minedTransactionHashes.length,0);
assert.equal(doc.demonstrate.independentlyReplayed,false);
assert.equal(doc.limits.unknowns.some(x=>x.includes("mutable")||x.includes("Mutable")),true);
assert.equal(doc.compatibilityVerdict,"NOT_EVALUATED");
assert.equal(doc.candidateAdmission,"NOT_ADMITTED");

const snapshotSha=createHash("sha256").update(JSON.stringify(pinned)).digest("hex");
const run="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127";
const archive=pinnedScientificQuality(pinned,snapshotSha,run);
const pinContext={basis:"PINNED_LOCAL_EVM_SNAPSHOT",
 report:pinned,snapshotSha256:snapshotSha,evidenceRunUrl:run};
assert.equal(reviewScientificQuality(archive,pinContext).accepted,true);
assert.equal(archive.scientificVerdict,"INCONCLUSIVE");
assert.equal(archive.experiment.chainId,31337);
assert.equal(archive.experiment.minedTransactionHashes.length,1);
assert.equal(archive.demonstrate.independentlyReplayed,false);
assert.equal(archive.challenge.untestedThreats.length,9);
assert.equal(archive.candidateAdmission,"NOT_ADMITTED");

// Falsification includes attackers who RECOMPUTE the internal JSON digest.
// Those must still fail source/semantic comparison, not just SHA mismatch.
const documentaryAttacks=[
 ["invent EVM",x=>x.experiment.status="LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE"],
 ["forge mined receipt",x=>x.experiment.minedTransactionHashes=["0x"+"1".repeat(64)]],
 ["fake network",x=>x.experiment.chainId=31337],
 ["fake admitted candidate",x=>x.candidateAdmission="ADMITTED"],
 ["fake compatibility",x=>x.compatibilityVerdict="COMPATIBLE"],
 ["fake evidence",x=>x.demonstrate.evidenceRefs=["0".repeat(64)]],
 ["claim replay",x=>x.demonstrate.independentlyReplayed=true],
 ["enable execution",x=>x.experiment.noExecutionAuthority=false],
 ["alter hypothesis prediction",x=>x.investigate.hypotheses[0].prediction="always safe"],
 ["remove falsifier",x=>x.investigate.hypotheses[0].falsifier=""],
 ["remove negative control",x=>x.investigate.hypotheses[0].negativeControl=""],
 ["forge anchor",x=>x.investigate.hypotheses[0].anchors[0].sha256="1".repeat(64)],
 ["forge source",x=>x.provenance.sourceRecords[0].sha256="1".repeat(64)],
 ["forge plan",x=>x.provenance.planSha256="1".repeat(64)],
 ["hide uncertainties",x=>x.limits.unknowns=[]],
 ["fake immutable revision",x=>x.provenance.sourceRecords[0].provenance="PINNED_IMPLEMENTATION_SOURCE"],
 ["fake signature",x=>x.integrity.signature=true],
 ["change subject",x=>x.subject.pairKey="ERC-20|ERC-721"],
 ["remove hypothesis",x=>x.investigate.hypotheses=[]],
 ["remove approved-source warnings",x=>x.limits.unknowns.pop()],
];
const archiveAttacks=[
 ["promote verdict",x=>x.scientificVerdict="PROVEN"],
 ["fake admission",x=>x.candidateAdmission="ADMITTED"],
 ["falsify chain",x=>x.experiment.chainId=1],
 ["alter local transaction",x=>x.experiment.minedTransactionHashes[0]="0x"+"a".repeat(64)],
 ["forge graph ref",x=>x.provenance.graphSha256="b".repeat(64)],
 ["forge EVM ref",x=>x.provenance.evmArtifactSha256="c".repeat(64)],
 ["remove negative cases",x=>x.challenge.observedCaseIds=[]],
 ["hide untested threats",x=>x.challenge.untestedThreats=[]],
 ["claim universal proof",x=>x.demonstrate.universalCompatibilityProven=true],
 ["claim new EVM replay",x=>x.experiment.evmReceiptReplayedByQualityVerifier=true],
 ["claim signature",x=>x.integrity.signature=true],
 ["forge reviewer scope",x=>x.provenance.evidenceRunUrl="https://evil.example.com/verified"],
 ["wrong source",x=>x.provenance.sourceRecords[0].sha256="c".repeat(64)],
 ["remove source records",x=>x.provenance.sourceRecords=[]],
 ["fake complete source coverage",x=>x.demonstrate.sourceCoverageComplete=true],
 ["change pinned hypothesis",x=>x.investigate.hypotheses[0].statement="ALWAYS_COMPATIBLE"],
 ["remove archived limitation",x=>x.limits.unknowns.pop()],
 ["replace evidence with text",x=>x.demonstrate.evidenceRefs=["I checked it"]],
];
let rejected=0;
for(const [label,mutate] of documentaryAttacks){
 const value=structuredClone(doc);mutate(value);
 // Rehash (except explicit forged signing) to test semantic review.
 if(label!=="fake signature"){
  const {integrity,...rest}=value;
  value.integrity.sha256=scientificQualityHash(rest);
 }
 assert.equal(reviewScientificQuality(value,docContext).accepted,false,
   "Forged documentary claim admitted: "+label);
 rejected++;
}
for(const [label,mutate] of archiveAttacks){
 const value=structuredClone(archive);mutate(value);
 if(label!=="claim signature"){
  const {integrity,...rest}=value;
  value.integrity.sha256=scientificQualityHash(rest);
 }
 assert.equal(reviewScientificQuality(value,pinContext).accepted,false,
   "Forged pinned EVM claim admitted: "+label);
 rejected++;
}
const swapped=reviewScientificQuality(doc,pinContext);
assert.equal(swapped.accepted,false);
assert.equal(reviewScientificQuality({},docContext).accepted,false);
assert.equal(reviewScientificQuality(null,docContext).accepted,false);
assert.throws(()=>pinnedScientificQuality({...pinned,verdict:"PROVEN"},snapshotSha,run));
assert.throws(()=>documentaryScientificQuality({...pair,evmExecuted:true}));
console.log("OECL_SCIENTIFIC_QUALITY_CONTRACT_PASS",JSON.stringify({
  documentaryProposalOnly:true,pinnedArchiveOnly:true,
  structuralReviewerIndependent:true,forgedPackagesRejected:rejected,
  unsupportedPromotionRejected:true,independentEvmReplay:false}));
