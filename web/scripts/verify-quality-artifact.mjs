/**
 * OECL offline quality verifier v1 — portable Node.js, no OECL runtime imports.
 *
 * Usage:
 *   node web/scripts/verify-quality-artifact.mjs quality.json report.json [raw-sources.json]
 *
 * quality.json: response from /api/scientific/quality
 * report.json: response from /api/scientific/standards-pair or /api/scientific/dossier
 * raw-sources.json (optional documentary only): {"ERC-20":"<exact raw markdown>",...}
 *
 * IMPORTANT: no wallet, web fetch, script execution, EVM replay or agent consent.
 * This reviewer reconstructs quality claims, not authenticity of mutable origins.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const PORTABLE_VERIFIER_VERSION="OECL_PORTABLE_QUALITY_VERIFIER_V1";
const trustedPinnedSnapshot="9cfb5bbd4bf0b98a424827a13057507d5ef3f3ea3e30e256eb9cc8cdf2ef13a6";
const trustedPinnedRun="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/44963511127";
const sha=value=>createHash("sha256").update(value).digest("hex");
const canonical=value=>JSON.stringify(value);
const equals=(a,b)=>canonical(a)===canonical(b);
const hashable=value=>sha(canonical(value));
const shaOk=v=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
const cleanId=v=>typeof v==="string"&&/^ERC-[1-9][0-9]{0,7}$/.test(v);
const keys=(v,expected)=>v!==null&&typeof v==="object"&&
 !Array.isArray(v)&&equals(Object.keys(v).sort(),[...expected].sort());
const stringArray=v=>Array.isArray(v)&&v.every(s=>typeof s==="string");
const bounded=()=>({schemaVersion:PORTABLE_VERIFIER_VERSION,
 verdict:"NOT_EVALUATED",compatibilityVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED",scientificClaimsPromoted:false,
 evidenceReexecuted:false,remoteSourceOriginAuthenticated:false,
 downloadedFromServerTrusted:false,failedChecks:[],passedChecks:[]});

export function verifyPortableQuality(sourceResponse,sourceReport,rawSources=null){
 const out=bounded();
 const check=(condition,code)=>{
   (condition?out.passedChecks:out.failedChecks).push(code);
 };
 const q=sourceResponse?.contract??sourceResponse?.qualityContract??sourceResponse;
 if(!q||typeof q!=="object"||Array.isArray(q))
   return {...out,status:"REJECTED",failedChecks:["MISSING_QUALITY_CONTRACT"]};
 try{
  // Never trust the embedded server review or an agent-supplied signature.
  const {integrity,...body}=q;
  check(keys(q,["schemaVersion","basis","subject","provenance","investigate",
   "challenge","experiment","demonstrate","limits","scientificVerdict",
   "compatibilityVerdict","candidateAdmission","integrity"]),
    "UNEXPECTED_QUALITY_KEYS");
  check(q.schemaVersion==="OECL_SCIENTIFIC_QUALITY_CONTRACT_V1",
    "UNKNOWN_QUALITY_SCHEMA");
  check(keys(q.subject,["pairKey","scope"])&&
    keys(q.provenance,["sourceRecords","planSha256","snapshotSha256",
      "evidenceRunUrl","graphSha256","evmArtifactSha256"])&&
    keys(q.investigate,["status","hypotheses"])&&
    keys(q.challenge,["status","observedCaseIds","untestedThreats"])&&
    keys(q.experiment,["status","chainId","minedTransactionHashes",
      "evmReceiptReplayedByQualityVerifier","noExecutionAuthority"])&&
    keys(q.demonstrate,["status","evidenceRefs","sourceCoverageComplete",
      "universalCompatibilityProven","independentlyReplayed"])&&
    keys(q.limits,["status","unknowns"])&&
    keys(q.integrity,["algorithm","sha256","signature","trustedExternalAttestation"]),
    "UNEXPECTED_NESTED_QUALITY_KEYS");
  check(Array.isArray(q.provenance?.sourceRecords)&&
    q.provenance.sourceRecords.every(s=>keys(s,["id","sha256","locator","provenance"])&&
      typeof s.id==="string"&&shaOk(s.sha256)&&typeof s.locator==="string")&&
    Array.isArray(q.investigate?.hypotheses)&&
    q.investigate.hypotheses.every(h=>keys(h,["id","statement","prediction",
      "falsifier","positiveControl","negativeControl","anchors","status"])&&
      ["id","statement","prediction","falsifier","positiveControl",
       "negativeControl","status"].every(k=>typeof h[k]==="string"&&h[k].length>0)&&
      Array.isArray(h.anchors)&&h.anchors.length>0&&
      h.anchors.every(a=>keys(a,["sourceId","sha256","locator"])&&
        typeof a.sourceId==="string"&&shaOk(a.sha256)&&typeof a.locator==="string"))&&
    stringArray(q.challenge?.observedCaseIds)&&
    Array.isArray(q.challenge?.untestedThreats)&&
    q.challenge.untestedThreats.every(t=>keys(t,["id","reason"])&&
      typeof t.id==="string"&&typeof t.reason==="string")&&
    stringArray(q.experiment?.minedTransactionHashes)&&
    stringArray(q.demonstrate?.evidenceRefs)&&
    stringArray(q.limits?.unknowns)&&q.limits.unknowns.length>0,
    "INVALID_NESTED_TYPES_OR_UNANCHORED_HYPOTHESIS");
  check(integrity?.algorithm==="SHA-256-JSON-INSERTION_ORDER"&&
    shaOk(integrity.sha256)&&integrity.sha256===hashable(body)&&
    integrity.signature===false&&integrity.trustedExternalAttestation===false,
    "HASH_OR_SIGNATURE_CLAIM");
  check(q.compatibilityVerdict==="NOT_EVALUATED"&&
    q.candidateAdmission==="NOT_ADMITTED"&&
    ["NOT_EVALUATED","INCONCLUSIVE"].includes(q.scientificVerdict)&&
    q.experiment?.noExecutionAuthority===true&&
    q.experiment?.evmReceiptReplayedByQualityVerifier===false&&
    q.demonstrate?.independentlyReplayed===false&&
    q.demonstrate?.universalCompatibilityProven===false&&
    q.demonstrate?.sourceCoverageComplete===false&&
    q.limits?.status==="INCONCLUSIVE_OR_NOT_EVALUATED",
    "UNSUPPORTED_SCIENTIFIC_PROMOTION");
  check(q.basis==="DOCUMENTARY_SOURCE_ONLY"||
    q.basis==="PINNED_LOCAL_EVM_SNAPSHOT","UNSUPPORTED_EVIDENCE_BASIS");
  if(q.basis==="DOCUMENTARY_SOURCE_ONLY"){
   const pair=sourceReport?.status==="DOCUMENTARY_COMPARISON"?
     sourceReport:sourceReport?.report;
   check(pair?.status==="DOCUMENTARY_COMPARISON"&&
     pair.scope==="OFFICIAL_ERC_SPECIFICATIONS_ONLY"&&
     pair.candidateAdmission==="NOT_ADMITTED"&&
     pair.scientificVerdict==="NOT_EVALUATED"&&
     pair.evmExecuted===false&&pair.implementationVerified===false&&
     Array.isArray(pair.protocols)&&pair.protocols.length===2&&
     pair.protocols.every(cleanId)&&pair.protocols[0]!==pair.protocols[1]&&
     Array.isArray(pair.standards)&&pair.standards.length===2&&
     pair.standards.every((d,i)=>d.id===pair.protocols[i]),
    "DOCUMENTARY_REPORT_CONTEXT_INVALID");
   const plan=pair?.autonomousResearch;
   const planCopy={...plan};delete planCopy.planSha256;
   check(plan?.schemaVersion==="OECL_AUTONOMOUS_DOCUMENTARY_SCIENTIST_V1"&&
     plan.engine==="DETERMINISTIC_SOURCE_ANCHORED_PLANNER"&&
     plan.outcome==="PROPOSED_NOT_TESTED"&&
     plan.scope==="OFFICIAL_ERC_SPECIFICATIONS_ONLY"&&
     plan.sourceCompiled===false&&plan.evmExecuted===false&&
     plan.experimentDispatched===false&&
     plan.humanSemanticReviewRequired===true&&
     plan.compatibilityVerdict==="NOT_EVALUATED"&&
     plan.candidateAdmission==="NOT_ADMITTED"&&shaOk(plan.planSha256)&&
     hashable(planCopy)===plan.planSha256,
    "DOCUMENTARY_PLAN_SELF_INTEGRITY_FAILED");
   const key=[...pair.protocols].sort((a,b)=>
     Number(a.slice(4))-Number(b.slice(4))).join("|");
   check(q.subject?.pairKey===key&&plan?.pairKey===key&&
     q.subject?.scope==="OFFICIAL_ERC_SPECIFICATIONS_ONLY",
     "DOCUMENTARY_PAIR_KEY_MISMATCH");
   const published=pair.standards.filter(d=>d.availability==="PUBLISHED"&&
     shaOk(d.provenance?.sha256));
   const sources=published.map(d=>({
    id:d.id,sha256:d.provenance.sha256,locator:d.provenance.sourceUrl,
    provenance:"MUTABLE_OFFICIAL_SPEC_SNAPSHOT",
   }));
   const revisions=published.map(d=>({
    id:d.id,sha256:d.provenance.sha256,ref:"master (mutable)",
   })).sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
   check(equals(q.provenance?.sourceRecords,sources)&&
     equals(plan?.sourceRevisions,revisions)&&
     q.provenance?.planSha256===plan.planSha256&&
     q.provenance?.snapshotSha256===null&&
     q.provenance?.evidenceRunUrl===null&&
     q.provenance?.graphSha256===null&&
     q.provenance?.evmArtifactSha256===null&&
     published.every(d=>d.provenance.ref==="master (mutable)"&&
       d.provenance.sourceUrl==="https://raw.githubusercontent.com/ethereum/ERCs/master/ERCS/erc-"+d.id.slice(4)+".md"),
     "DOCUMENTARY_SOURCE_PROVENANCE_MISMATCH");
   const hypotheses=(plan?.hypotheses??[]).map(h=>({
    id:h.id,statement:h.question,prediction:h.conditionalPrediction,
    falsifier:h.falsifier,positiveControl:h.positiveControl,
    negativeControl:h.negativeControl,
    anchors:(h.anchors??[]).map(a=>({
      sourceId:a.sourceId,sha256:a.documentSha256,locator:a.sourceUrl,
    })),status:"PROPOSED_NOT_EXECUTED",
   }));
   check(equals(q.investigate?.hypotheses,hypotheses)&&
     q.investigate?.status===(hypotheses.length?
       "SOURCE_ANCHORED_PROPOSAL":"ABSTAIN_MISSING_SOURCE")&&
     hypotheses.every(h=>h.anchors.length>0&&h.falsifier&&
       h.positiveControl&&h.negativeControl&&
       h.anchors.every(a=>sources.some(s=>s.id===a.sourceId&&
         s.sha256===a.sha256&&s.locator===a.locator))),
     "DOCUMENTARY_HYPOTHESES_AND_FALSIFIERS_MISMATCH");
   check(q.challenge?.status===(hypotheses.length?
       "CONTROLS_DESIGNED_NOT_EXECUTED":"NO_SUPPORTED_HYPOTHESIS")&&
     equals(q.challenge?.observedCaseIds,[])&&
     equals(q.challenge?.untestedThreats,[])&&
     q.experiment?.status==="NOT_EXECUTED"&&
     q.experiment?.chainId===null&&
     equals(q.experiment?.minedTransactionHashes,[])&&
     q.demonstrate?.status==="PROPOSAL_ONLY"&&
     equals(q.demonstrate?.evidenceRefs,[])&&
     q.scientificVerdict==="NOT_EVALUATED",
     "FICTIONAL_DOCUMENTARY_EVM_OR_CONTROLS");
   const unknowns=[...new Set([...(plan?.evidenceGap??[]),
     ...(plan?.abstentionReasons??[]),
     "Mutable ERC master snapshots are not immutable source revisions.",
     "No implementation bytecode, mined EVM receipt or independent EVM replay has been verified for this investigation."])];
   check(equals(q.limits?.unknowns,unknowns),
     "DOCUMENTARY_LIMITATIONS_HIDDEN");
   if(rawSources!==null){
    check(keys(rawSources,published.map(d=>d.id))&&
      published.every(d=>{
        const text=rawSources[d.id];
        if(typeof text!=="string"||text.length>200000||
           sha(text)!==d.provenance.sha256)return false;
        const front=text.match(/^---\r?\n([\s\S]{0,12000}?)\r?\n---/);
        return Boolean(front&&
          new RegExp("^eip:\\s*"+d.id.slice(4)+"\\s*$","m").test(front[1])&&
          /^category:\s*ERC\s*$/mi.test(front[1]));
      }),"LOCAL_RAW_DOCUMENT_BYTES_HASH_OR_HEADER_MISMATCH");
   }
  }else if(q.basis==="PINNED_LOCAL_EVM_SNAPSHOT"){
   const d=sourceReport?.dossier??sourceReport;
   check(d?.schemaVersion==="OECL_USER_SCIENTIFIC_DOSSIER_V1"&&
     d.verdict==="INCONCLUSIVE"&&d.candidateAdmission==="NOT_ADMITTED"&&
     d.scope==="PINNED_LOCAL_HARDHAT_EVM"&&
     d.universalCompatibilityEstablished===false&&
     hashable(d)===trustedPinnedSnapshot,
     "PINNED_DOSSIER_TRUST_ANCHOR_MISMATCH");
   check(q.subject?.pairKey==="ERC-8060|ERC-8098"&&
     q.subject?.scope==="PINNED_LOCAL_HARDHAT_EVM",
     "PINNED_SUBJECT_MISMATCH");
   const sources=d?.participants?.map(p=>({
    id:p.repository,sha256:p.sourceSha256,
    locator:"https://github.com/"+p.repository+"/tree/"+p.revision,
    provenance:"PINNED_IMPLEMENTATION_SOURCE",
   }));
   check(equals(q.provenance?.sourceRecords,sources)&&
     q.provenance?.snapshotSha256===trustedPinnedSnapshot&&
     q.provenance?.planSha256===null&&
     q.provenance?.evidenceRunUrl===trustedPinnedRun&&
     q.provenance?.graphSha256===d?.artifacts?.graph?.sha256&&
     q.provenance?.evmArtifactSha256===d?.artifacts?.evm?.sha256,
     "PINNED_SOURCE_OR_ARTIFACT_MISMATCH");
   const h={
     id:d?.discovery?.hypothesisId,statement:d?.discovery?.relation,
     prediction:d?.discovery?.predictedProperties?.join("; "),
     falsifier:"A reproducible local test under equivalent reviewed preconditions that contradicts the claimed atomic state changes or rollback behavior.",
     positiveControl:"JOINT_SUCCESS",
     negativeControl:"REVERT-ERC20-APPROVAL; REVERT-NFT-APPROVAL; REVERT-NONOWNER",
     anchors:sources?.map(s=>({
       sourceId:s.id,sha256:s.sha256,locator:s.locator,
     })),status:"SOURCE_HYPOTHESIS_WITH_SCOPED_EVM_OBSERVATION",
   };
   check(q.investigate?.status==="PINNED_SOURCE_HYPOTHESIS"&&
     equals(q.investigate?.hypotheses,[h]),
     "PINNED_HYPOTHESIS_MISMATCH");
   check(q.challenge?.status==="PARTIAL_ARCHIVED_ADVERSARIAL_OBSERVATIONS"&&
     equals(q.challenge?.observedCaseIds,d?.adversarial?.observedCaseIds)&&
     equals(q.challenge?.untestedThreats,d?.adversarial?.untested),
     "PINNED_ADVERSARIAL_EVIDENCE_MISMATCH");
   check(q.experiment?.status==="LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE"&&
     q.experiment.chainId===31337&&
     equals(q.experiment.minedTransactionHashes,[d?.experiment?.transactionHash])&&
     /^0x[a-f0-9]{64}$/i.test(d?.experiment?.transactionHash??"")&&
     q.demonstrate?.status==="SCOPED_ARCHIVED_OBSERVATION_ONLY"&&
     equals(q.demonstrate?.evidenceRefs,[
      d?.artifacts?.graph?.sha256,d?.artifacts?.evm?.sha256])&&
     q.scientificVerdict==="INCONCLUSIVE",
     "PINNED_EVM_SCOPE_OR_REFERENCES_CHANGED");
   const unknowns=[...(d?.limitations??[]),
     ...(d?.adversarial?.untested??[]).map(t=>t.id+": "+t.reason),
     "The quality verifier checks the pinned snapshot and evidence references, not a new replay of the terminated local EVM."];
   check(equals(q.limits?.unknowns,unknowns),
     "PINNED_ADVERSARIAL_LIMITATIONS_MISSING");
   check(rawSources===null,"RAW_DOCUMENT_MAP_NOT_RELEVANT_TO_PINNED_DOSSIER");
  }
 }catch{
  out.failedChecks.push("INVALID_OR_UNREADABLE_QUALITY_STRUCTURE");
 }
 const base={
  ...out,
  evidenceBasis:q.basis,
  submittedContractSha256:shaOk(q?.integrity?.sha256)?q.integrity.sha256:null,
  verificationTier:q.basis==="DOCUMENTARY_SOURCE_ONLY"?
    (rawSources===null?"DOCUMENTARY_RECONCILIATION_ONLY":
      "SUBMITTED_RAW_DOCUMENT_BYTES_MATCHED"):
    "KNOWN_PINNED_ARCHIVE_SNAPSHOT_MATCHED",
  rawSourceBytesMatched:q.basis==="DOCUMENTARY_SOURCE_ONLY"&&
    rawSources!==null&&
    !out.failedChecks.includes("LOCAL_RAW_DOCUMENT_BYTES_HASH_OR_HEADER_MISMATCH"),
 };
 return {...base,
  status:out.failedChecks.length?"REJECTED":"CONSISTENT_WITH_PROVIDED_EVIDENCE",
  verifierIndependentOfOeclServer:true,
  scientificClaimsPromoted:false,
  evidenceReexecuted:false,
  remoteSourceOriginAuthenticated:false,
  downloadedFromServerTrusted:false,
 };
}

function readJson(file){
 const bytes=readFileSync(file);
 if(bytes.byteLength>4_000_000)throw Error("LOCAL_JSON_EXCEEDS_4MB");
 return JSON.parse(bytes.toString("utf8"));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const [artifact,report,raw]=process.argv.slice(2);
  if(!artifact||!report||process.argv.length>5)throw Error(
   "Usage: node verify-quality-artifact.mjs <quality.json> <source-report.json> [raw-sources.json]");
  const result=verifyPortableQuality(readJson(artifact),readJson(report),
   raw?readJson(raw):null);
  process.stdout.write(JSON.stringify(result,null,2)+"\n");
  if(result.status==="REJECTED")process.exitCode=1;
 }catch(e){
  process.stderr.write("OECL_OFFLINE_QUALITY_VERIFICATION_FAILED: "+
   (e instanceof Error?e.message:String(e))+"\n");
  process.exitCode=1;
 }
}
