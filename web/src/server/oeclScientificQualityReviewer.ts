import { createHash } from "node:crypto";
import type { DocumentaryPair } from "./oeclErcDocumentaryDiscovery";
import type { ScientificDossier } from "./oeclScientificDossier";
import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import { verifyAutonomousResearchPlan } from "./oeclAutonomousResearchPlanner";

/**
 * Independent structural reviewer: intentionally never imports the quality
 * builder or trusts the submitted envelope's claimed classifications.
 * It compares every relevant claim against the separately supplied server
 * source report. It cannot replay a terminated EVM or authenticate a mutable
 * remote document by its self-reported hash.
 */
export type ScientificQualityReview = {
  schemaVersion:"OECL_SCIENTIFIC_QUALITY_REVIEW_V1";
  status:"INDEPENDENT_STRUCTURAL_REVIEW_PASSED"|"REJECTED";
  accepted:boolean;
  reviewedContractSha256:string|null;
  checks:string[];
  failures:string[];
  independentEvmReplay:false;
  externalSourceBytesReverified:false;
  compatibilityVerdict:"NOT_EVALUATED";
  candidateAdmission:"NOT_ADMITTED";
  notice:string;
};

type Context =
  | {basis:"DOCUMENTARY_SOURCE_ONLY";report:DocumentaryPair}
  | {basis:"PINNED_LOCAL_EVM_SNAPSHOT";report:ScientificDossier;
     snapshotSha256:string;evidenceRunUrl:string};
const sha=(value:unknown)=>createHash("sha256")
  .update(JSON.stringify(value)).digest("hex");
const shaOk=(v:unknown)=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);

export function reviewScientificQuality(
  input:unknown,context:Context
):ScientificQualityReview{
  const failures:string[]=[];
  const checks:string[]=[];
  const need=(condition:unknown,reason:string)=>{
    if(condition)checks.push(reason);else failures.push(reason);
  };
  const q=input as Partial<ScientificQualityContract>|null;
  const base={
    schemaVersion:"OECL_SCIENTIFIC_QUALITY_REVIEW_V1" as const,
    independentEvmReplay:false as const,
    externalSourceBytesReverified:false as const,
    compatibilityVerdict:"NOT_EVALUATED" as const,
    candidateAdmission:"NOT_ADMITTED" as const,
    notice:"This is an independent structural check against server-side input. A digest is not a signature, remote source authentication or independent EVM receipt replay.",
  };
  if(!q||typeof q!=="object"||Array.isArray(q)){
    return {...base,status:"REJECTED",accepted:false,reviewedContractSha256:null,
      checks,failures:["NOT_AN_EVIDENCE_ENVELOPE"]};
  }
  try{
    const {integrity,...content}=q;
    need(q.schemaVersion==="OECL_SCIENTIFIC_QUALITY_CONTRACT_V1","SCHEMA_NOT_RECOGNIZED");
    need(q.basis===context.basis,"BASIS_CONTEXT_MISMATCH");
    need(integrity?.algorithm==="SHA-256-JSON-INSERTION_ORDER"&&
      shaOk(integrity.sha256)&&integrity.sha256===sha(content)&&
      integrity.signature===false&&integrity.trustedExternalAttestation===false,
      "CONTRACT_DIGEST_OR_FALSE_SIGNATURE");
    need(q.scientificVerdict==="NOT_EVALUATED"||
      q.scientificVerdict==="INCONCLUSIVE","UNSUPPORTED_GLOBAL_VERDICT");
    need(q.compatibilityVerdict==="NOT_EVALUATED"&&
      q.candidateAdmission==="NOT_ADMITTED","ILLICIT_COMPATIBILITY_OR_ADMISSION");
    need(q.experiment?.noExecutionAuthority===true&&
      q.experiment.evmReceiptReplayedByQualityVerifier===false&&
      q.demonstrate?.independentlyReplayed===false&&
      q.demonstrate.sourceCoverageComplete===false&&
      q.demonstrate.universalCompatibilityProven===false,
      "FALSE_REPLAY_AUTHORIZATION_OR_UNIVERSAL_PROOF");
    need(q.limits?.status==="INCONCLUSIVE_OR_NOT_EVALUATED"&&
      Array.isArray(q.limits.unknowns)&&q.limits.unknowns.length>0,
      "SCIENTIFIC_LIMITS_OMITTED");

    if(context.basis==="DOCUMENTARY_SOURCE_ONLY"){
      const pair=context.report,plan=pair.autonomousResearch;
      need(verifyAutonomousResearchPlan(pair,plan),"SOURCE_DOCUMENT_PLAN_NOT_RECONSTRUCTIBLE");
      need(pair.status==="DOCUMENTARY_COMPARISON"&&
        pair.scope==="OFFICIAL_ERC_SPECIFICATIONS_ONLY"&&
        pair.evmExecuted===false&&pair.implementationVerified===false&&
        pair.candidateAdmission==="NOT_ADMITTED"&&pair.scientificVerdict==="NOT_EVALUATED",
        "SERVER_DOCUMENTARY_INPUT_NOT_SAFE");
      const key=[...pair.protocols].sort((a,b)=>
        Number(a.slice(4))-Number(b.slice(4))).join("|");
      need(q.subject?.pairKey===key&&
        q.subject?.scope==="OFFICIAL_ERC_SPECIFICATIONS_ONLY",
        "SCIENTIFIC_SUBJECT_NOT_SOURCE_BOUND");
      const sources=pair.standards.filter(d=>d.availability==="PUBLISHED"&&
        shaOk(d.provenance.sha256)).map(d=>({
        id:d.id,sha256:d.provenance.sha256,locator:d.provenance.sourceUrl,
        provenance:"MUTABLE_OFFICIAL_SPEC_SNAPSHOT",
      }));
      need(equal(q.provenance?.sourceRecords,sources)&&
        q.provenance?.planSha256===plan.planSha256&&
        q.provenance?.snapshotSha256===null&&q.provenance?.evidenceRunUrl===null&&
        q.provenance?.graphSha256===null&&q.provenance?.evmArtifactSha256===null,
        "DOCUMENTARY_SOURCE_LINKAGE_NOT_REPRODUCIBLE");
      const hypotheses=plan.hypotheses.map(h=>({
        id:h.id,statement:h.question,prediction:h.conditionalPrediction,
        falsifier:h.falsifier,positiveControl:h.positiveControl,
        negativeControl:h.negativeControl,
        anchors:h.anchors.map(a=>({
          sourceId:a.sourceId,sha256:a.documentSha256,locator:a.sourceUrl,
        })),status:"PROPOSED_NOT_EXECUTED",
      }));
      need(equal(q.investigate?.hypotheses,hypotheses)&&
        q.investigate?.status===(hypotheses.length?
          "SOURCE_ANCHORED_PROPOSAL":"ABSTAIN_MISSING_SOURCE"),
        "HYPOTHESIS_FALSIFIER_SOURCE_LINKAGE_INVALID");
      need(hypotheses.every(h=>h.statement&&h.prediction&&h.falsifier&&
        h.positiveControl&&h.negativeControl&&h.anchors.length>0&&
        h.anchors.every(a=>sources.some(s=>s.id===a.sourceId&&
          s.sha256===a.sha256&&s.locator===a.locator))),
        "UNSUPPORTED_DOCUMENTARY_HYPOTHESIS");
      need(q.challenge?.status===(hypotheses.length?
        "CONTROLS_DESIGNED_NOT_EXECUTED":"NO_SUPPORTED_HYPOTHESIS")&&
        equal(q.challenge?.observedCaseIds,[])&&
        equal(q.challenge?.untestedThreats,[]),"FICTIONAL_EXPERIMENTAL_CONTROLS");
      need(q.experiment?.status==="NOT_EXECUTED"&&
        q.experiment.chainId===null&&
        equal(q.experiment.minedTransactionHashes,[])&&
        q.demonstrate.status==="PROPOSAL_ONLY"&&
        equal(q.demonstrate.evidenceRefs,[])&&
        q.scientificVerdict==="NOT_EVALUATED",
        "DOCUMENTARY_PLAN_FALSLY_PROMOTED_TO_EVM_EVIDENCE");
      const unknowns=[...new Set([...plan.evidenceGap,...plan.abstentionReasons,
        "Mutable ERC master snapshots are not immutable source revisions.",
        "No implementation bytecode, mined EVM receipt or independent EVM replay has been verified for this investigation."])];
      need(equal(q.limits?.unknowns,unknowns),
        "UNRESOLVED_DOCUMENTARY_GAPS_HIDDEN");
    }else{
      const d=context.report;
      need(d.schemaVersion==="OECL_USER_SCIENTIFIC_DOSSIER_V1"&&
        d.verdict==="INCONCLUSIVE"&&d.candidateAdmission==="NOT_ADMITTED"&&
        d.scope==="PINNED_LOCAL_HARDHAT_EVM"&&
        d.experiment.chainId===31337&&
        d.experiment.propertyStatus==="OBSERVED_IN_PINNED_LOCAL_EVM"&&
        d.adversarial.status==="PARTIAL_COVERAGE"&&
        d.scientificQuestions.sourceCoverageComplete===false,
        "PINNED_REPORT_NOT_SCOPED");
      need(sha(d)===context.snapshotSha256&&shaOk(context.snapshotSha256),
        "PINNED_SNAPSHOT_BYTES_MISMATCH");
      need(q.subject?.pairKey==="ERC-8060|ERC-8098"&&
        q.subject?.scope==="PINNED_LOCAL_HARDHAT_EVM",
        "PINNED_SUBJECT_CHANGED");
      const sources=d.participants.map(p=>({
        id:p.repository,sha256:p.sourceSha256,
        locator:"https://github.com/"+p.repository+"/tree/"+p.revision,
        provenance:"PINNED_IMPLEMENTATION_SOURCE",
      }));
      need(equal(q.provenance?.sourceRecords,sources)&&
        q.provenance?.planSha256===null&&
        q.provenance?.snapshotSha256===context.snapshotSha256&&
        q.provenance?.evidenceRunUrl===context.evidenceRunUrl&&
        q.provenance?.graphSha256===d.artifacts.graph.sha256&&
        q.provenance?.evmArtifactSha256===d.artifacts.evm.sha256,
        "PINNED_SOURCE_AND_ARCHIVE_REFERENCES_MISMATCH");
      const h={
        id:d.discovery.hypothesisId,statement:d.discovery.relation,
        prediction:d.discovery.predictedProperties.join("; "),
        falsifier:"A reproducible local test under equivalent reviewed preconditions that contradicts the claimed atomic state changes or rollback behavior.",
        positiveControl:"JOINT_SUCCESS",
        negativeControl:"REVERT-ERC20-APPROVAL; REVERT-NFT-APPROVAL; REVERT-NONOWNER",
        anchors:sources.map(s=>({
          sourceId:s.id,sha256:s.sha256,locator:s.locator,
        })),status:"SOURCE_HYPOTHESIS_WITH_SCOPED_EVM_OBSERVATION",
      };
      need(q.investigate?.status==="PINNED_SOURCE_HYPOTHESIS"&&
        equal(q.investigate.hypotheses,[h]),
        "PINNED_HYPOTHESIS_CHANGED");
      need(q.challenge?.status==="PARTIAL_ARCHIVED_ADVERSARIAL_OBSERVATIONS"&&
        equal(q.challenge.observedCaseIds,d.adversarial.observedCaseIds)&&
        equal(q.challenge.untestedThreats,d.adversarial.untested),
        "ADVERSARIAL_FAILURES_HIDDEN_OR_FORGED");
      need(q.experiment?.status==="LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE"&&
        q.experiment.chainId===31337&&
        equal(q.experiment.minedTransactionHashes,[d.experiment.transactionHash])&&
        /^0x[a-f0-9]{64}$/i.test(d.experiment.transactionHash),
        "PINNED_LOCAL_EVM_PROVENANCE_CHANGED");
      need(q.demonstrate?.status==="SCOPED_ARCHIVED_OBSERVATION_ONLY"&&
        equal(q.demonstrate.evidenceRefs,[
          d.artifacts.graph.sha256,d.artifacts.evm.sha256])&&
        q.scientificVerdict==="INCONCLUSIVE",
        "ARCHIVED_EVIDENCE_WRONGLY_UPGRADED");
      need(equal(q.limits?.unknowns,[...d.limitations,
        ...d.adversarial.untested.map(t=>t.id+": "+t.reason),
        "The quality verifier checks the pinned snapshot and evidence references, not a new replay of the terminated local EVM."]),
        "PINNED_LIMITATIONS_MISSING");
    }
  }catch{
    failures.push("STRUCTURE_OR_SOURCE_REVIEW_EXCEPTION");
  }
  return {...base,status:failures.length?"REJECTED":
    "INDEPENDENT_STRUCTURAL_REVIEW_PASSED",
    accepted:failures.length===0,
    reviewedContractSha256:typeof q.integrity?.sha256==="string"?
      q.integrity.sha256:null,checks,failures};
}
