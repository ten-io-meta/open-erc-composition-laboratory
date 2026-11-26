import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync,rmSync,writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join,resolve } from "node:path";
import { spawnSync } from "node:child_process";
import pinned from "../src/data/erc8060Erc8098ScientificDossier.json" with {type:"json"};
import { designAutonomousResearch } from "../src/server/oeclAutonomousResearchPlanner.ts";
import { documentaryScientificQuality,pinnedScientificQuality,scientificQualityHash } from "../src/server/oeclScientificQualityContract.ts";
import { verifyPortableQuality } from "./verify-quality-artifact.mjs";

const sha=s=>createHash("sha256").update(s).digest("hex");
const markdown={
 "ERC-4626":"---\neip: 4626\ntitle: Tokenized Vaults\nstatus: Final\ncategory: ERC\nrequires: 20\n---\n\n## Specification\n\nAn implementation MUST check share conversion.\n",
 "ERC-20":"---\neip: 20\ntitle: Token Standard\nstatus: Final\ncategory: ERC\n---\n\n## Specification\n\nAn implementation MUST implement transfers.\n",
};
const spec=(id,requires=[],methods=[])=>({
 id,availability:"PUBLISHED",title:id,description:null,abstract:null,
 status:"Final",category:"ERC",requires,interfaceNames:methods,
 requirements:["An implementation MUST implement the documented standard."],
 oeclPinnedSource:null,provenance:{
  sourceUrl:"https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+id.slice(4)+".md",
  canonicalUrl:"https://eips.ethereum.org/EIPS/eip-"+id.slice(4),
  sha256:sha(markdown[id]),ref:"master (mutable)",
 },
});
const pair={
 status:"DOCUMENTARY_COMPARISON",scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
 protocols:["ERC-4626","ERC-20"],
 standards:[spec("ERC-4626",["EIP-20"],["deposit","withdraw"]),
  spec("ERC-20",[],["transfer","transferFrom"])],
 relation:{kind:"DECLARED_DEPENDENCY",statements:["ERC-4626 requires ERC-20"],
  sharedPrerequisites:[],overlappingInterfaceNames:[]},
 researchQuestions:[],scientificVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
 implementationVerified:false,evmExecuted:false,warnings:[],
};
pair.autonomousResearch=designAutonomousResearch(pair);
const documentary=documentaryScientificQuality(pair);
const docEnvelope={status:"SCIENTIFIC_QUALITY_CONTRACT_REVIEWED",contract:documentary,
 review:{accepted:true}};
const good=verifyPortableQuality(docEnvelope,pair,markdown);
assert.equal(good.status,"CONSISTENT_WITH_PROVIDED_EVIDENCE",JSON.stringify(good.failedChecks));
assert.equal(good.verificationTier,"SUBMITTED_RAW_DOCUMENT_BYTES_MATCHED");
assert.equal(good.remoteSourceOriginAuthenticated,false);
assert.equal(good.evidenceReexecuted,false);
assert.equal(good.candidateAdmission,"NOT_ADMITTED");
const structural=verifyPortableQuality(docEnvelope,pair);
assert.equal(structural.status,"CONSISTENT_WITH_PROVIDED_EVIDENCE");
assert.equal(structural.verificationTier,"DOCUMENTARY_RECONCILIATION_ONLY");
assert.equal(structural.rawSourceBytesMatched,false);
const pinnedHash="9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6";
assert.equal(sha(JSON.stringify(pinned)),pinnedHash);
const runUrl="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127";
const archive=pinnedScientificQuality(pinned,pinnedHash,runUrl);
const pinnedEnvelope={status:"SCIENTIFIC_QUALITY_CONTRACT_REVIEWED",contract:archive,
 review:{accepted:false,independentEvmReplay:true}};
const original=verifyPortableQuality(pinnedEnvelope,{dossier:pinned});
assert.equal(original.status,"CONSISTENT_WITH_PROVIDED_EVIDENCE",JSON.stringify(original.failedChecks));
assert.equal(original.verificationTier,"KNOWN_PINNED_ARCHIVE_SNAPSHOT_MATCHED");
assert.equal(original.evidenceReexecuted,false);
assert.equal(original.scientificClaimsPromoted,false);

const rehash=(q)=>{
 const {integrity,...body}=q;
 q.integrity.sha256=scientificQualityHash(body);
 return q;
};
const attacks=[
 ["false signature",x=>x.contract.integrity.signature=true,docEnvelope,pair,markdown],
 ["extra contract certification",x=>x.contract.securityCertification="CONSENSUS_PROOF",docEnvelope,pair,markdown],
 ["extra hidden demonstrate key",x=>x.contract.demonstrate.mainnetVerified=true,docEnvelope,pair,markdown],
 ["fake EVM",x=>x.contract.experiment.status="LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE",docEnvelope,pair,markdown],
 ["forge EVM receipts",x=>x.contract.experiment.minedTransactionHashes=["0x"+"f".repeat(64)],docEnvelope,pair,markdown],
 ["false admission",x=>x.contract.candidateAdmission="ADMITTED",docEnvelope,pair,markdown],
 ["omit source record",x=>x.contract.provenance.sourceRecords.pop(),docEnvelope,pair,markdown],
 ["forge source hash",x=>x.contract.provenance.sourceRecords[0].sha256="0".repeat(64),docEnvelope,pair,markdown],
 ["forge hypothesis anchor",x=>x.contract.investigate.hypotheses[0].anchors[0].sha256="f".repeat(64),docEnvelope,pair,markdown],
 ["remove falsifier",x=>x.contract.investigate.hypotheses[0].falsifier="",docEnvelope,pair,markdown],
 ["remove counterexample controls",x=>x.contract.investigate.hypotheses[0].negativeControl="",docEnvelope,pair,markdown],
 ["hide limitations",x=>x.contract.limits.unknowns.pop(),docEnvelope,pair,markdown],
 ["claim independent EVM replay",x=>x.contract.demonstrate.independentlyReplayed=true,docEnvelope,pair,markdown],
 ["fake signed attestation",x=>x.contract.integrity.trustedExternalAttestation=true,docEnvelope,pair,markdown],
 ["hide source only",x=>x.contract.subject.scope="PINNED_LOCAL_HARDHAT_EVM",docEnvelope,pair,markdown],
 ["change plan hash",x=>x.contract.provenance.planSha256="0".repeat(64),docEnvelope,pair,markdown],
 ["pin wrong archive digest",x=>x.contract.provenance.snapshotSha256="f".repeat(64),pinnedEnvelope,{dossier:pinned},null],
 ["forge pinned transaction",x=>x.contract.experiment.minedTransactionHashes=["0x"+"a".repeat(64)],pinnedEnvelope,{dossier:pinned},null],
 ["forge pinned adversaries",x=>x.contract.challenge.untestedThreats=[],pinnedEnvelope,{dossier:pinned},null],
 ["claim pinned globally verified",x=>x.contract.demonstrate.universalCompatibilityProven=true,pinnedEnvelope,{dossier:pinned},null],
 ["forge pinned positive control",x=>x.contract.investigate.hypotheses[0].positiveControl="FAKE",pinnedEnvelope,{dossier:pinned},null],
 ["pretend archive was mainnet",x=>x.contract.experiment.chainId=1,pinnedEnvelope,{dossier:pinned},null],
 ["replace archived graph ref",x=>x.contract.demonstrate.evidenceRefs[0]="0".repeat(64),pinnedEnvelope,{dossier:pinned},null],
 ["suppress pinned unresolved questions",x=>x.contract.limits.unknowns=[],pinnedEnvelope,{dossier:pinned},null],
];
let rejected=0;
for(const [label,mutation,src,report,raw] of attacks){
 const forged=structuredClone(src);mutation(forged);
 rehash(forged.contract);
 const result=verifyPortableQuality(forged,report,raw);
 assert.equal(result.status,"REJECTED",label);
 rejected++;
}
const alteredSource={...markdown,"ERC-20":markdown["ERC-20"].replace("transfers","arbitrary promises")};
assert.equal(verifyPortableQuality(docEnvelope,pair,alteredSource).status,"REJECTED");
rejected++;
const forgedReport=structuredClone(pair);
forgedReport.standards[1].provenance.sha256="0".repeat(64);
assert.equal(verifyPortableQuality(docEnvelope,forgedReport,markdown).status,"REJECTED");
rejected++;
const forgedPinned=structuredClone(pinned);
forgedPinned.experiment.transactionHash="0x"+"1".repeat(64);
assert.equal(verifyPortableQuality(pinnedEnvelope,{dossier:forgedPinned}).status,"REJECTED");
rejected++;
assert.equal(verifyPortableQuality(docEnvelope,null).status,"REJECTED");
rejected++;
assert.equal(verifyPortableQuality(pinnedEnvelope,{dossier:pinned},{}).status,"REJECTED");
rejected++;

// CLI genuine external-process contract: reads independently supplied JSON,
// never makes an HTTP request, never trusts server review.accepted.
const temp=mkdtempSync(join(tmpdir(),"oecl-independent-quality-"));
try{
 const qualityPath=join(temp,"quality.json"),reportPath=join(temp,"report.json"),
  rawPath=join(temp,"raw.json"),script=resolve("scripts/verify-quality-artifact.mjs");
 for(const [path,obj] of [[qualityPath,docEnvelope],[reportPath,pair],[rawPath,markdown]])
  writeFileSync(path,JSON.stringify(obj));
 const pass=spawnSync(process.execPath,[script,qualityPath,reportPath,rawPath],
  {cwd:process.cwd(),encoding:"utf8"});
 assert.equal(pass.status,0,pass.stderr||pass.stdout);
 assert.equal(JSON.parse(pass.stdout).rawSourceBytesMatched,true);
 writeFileSync(rawPath,JSON.stringify(alteredSource));
 const reject=spawnSync(process.execPath,[script,qualityPath,reportPath,rawPath],
  {cwd:process.cwd(),encoding:"utf8"});
 assert.equal(reject.status,1,"OFFLINE_VERIFIER_EXITED_SUCCESS_WITH_FORGED_SOURCE");
}finally{rmSync(temp,{recursive:true,force:true});}
console.log("OECL_PORTABLE_SCIENTIFIC_QUALITY_PASS",JSON.stringify({
 correctDocumentaryAndPinnedArtifacts:true,
 separateProcessOfflineVerification:true,
 forgedPackagesAndContextRejected:rejected,
 untrustedServerReviewIgnored:true,
 noIndependentEvmReplayClaim:true,
 noRemoteSourceAuthenticityClaim:true,
 universalCompatibilityNotEvaluated:true,
}));
