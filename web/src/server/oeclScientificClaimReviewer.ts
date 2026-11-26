import { createHash } from "node:crypto";
import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import type { ScientificDossier } from "./oeclScientificDossier";
import type { DocumentaryPair } from "./oeclErcDocumentaryDiscovery";
import type { ScientificClaimLedger } from "./oeclScientificClaimLedger";

/**
 * Independent semantic reviewer. Deliberately does NOT import the ledger
 * issuer. Reconstructs classes, measurements and disclosure requirements
 * directly from the separate quality report and its source inputs.
 */
export type ScientificClaimReview={
  schemaVersion:"OECL_SCIENTIFIC_CLAIM_REVIEW_V1";
  accepted:boolean;
  status:"REVIEWABLE_CLAIM_CLASSIFICATION"|"REJECTED";
  failedChecks:string[];
  checkedLedgerSha256:string|null;
  independentEvmReplay:false;
  externalImpactValidated:false;
  sourceOriginIndependentlyAuthenticated:false;
  candidateAdmission:"NOT_ADMITTED";
  compatibilityVerdict:"NOT_EVALUATED";
};
const hash=(x:unknown)=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const eq=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const has=(v:unknown,expected:string[])=>v!==null&&typeof v==="object"&&!Array.isArray(v)&&
  eq(Object.keys(v).sort(),[...expected].sort());
const sha=(s:unknown)=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const positive=(s:unknown)=>typeof s==="string"&&/^[0-9]+$/.test(s);
const receipt=(s:unknown)=>typeof s==="string"&&/^0x[a-f0-9]{64}$/i.test(s);

export function independentlyReviewScientificClaims(
  input:unknown,
  quality:ScientificQualityContract,
  report:DocumentaryPair|ScientificDossier,
):ScientificClaimReview{
  const failedChecks:string[]=[];
  const require=(cond:unknown,msg:string)=>{if(!cond)failedChecks.push(msg);};
  const ledger=input as Partial<ScientificClaimLedger>|null;
  const base={
    schemaVersion:"OECL_SCIENTIFIC_CLAIM_REVIEW_V1" as const,
    independentEvmReplay:false as const,
    externalImpactValidated:false as const,
    sourceOriginIndependentlyAuthenticated:false as const,
    candidateAdmission:"NOT_ADMITTED" as const,
    compatibilityVerdict:"NOT_EVALUATED" as const,
  };
  if(!ledger||typeof ledger!=="object"||Array.isArray(ledger)){
    return {...base,accepted:false,status:"REJECTED",failedChecks:["NO_LEDGER"],
      checkedLedgerSha256:null};
  }
  try{
    const {integrity,...body}=ledger;
    require(has(ledger,["schemaVersion","basis","subjectPairKey",
      "qualityContractSha256","sourceReportSha256",
      "hypotheses","observations","conclusion","utility","scientificVerdict",
      "compatibilityVerdict","candidateAdmission","provenance","integrity"])&&
      has(ledger.conclusion,["kind","status","scope","statement",
        "supportingObservationIds","universalCompatibilityProven","independentEvmReplay"])&&
      has(ledger.utility,["status","concreteResearchUse","demonstratedExternalImpact",
        "securityCertification","countingHypothesesIsEvidence","score",
        "rationale","missingForStrongerClaim"])&&
      has(ledger.provenance,["independentSourceOriginAuthentication",
        "independentEvmReplay","sourceOrExecutionAuthorityGranted"])&&
      has(integrity,["algorithm","sha256","signature","trustedExternalAttestation"]),
      "UNEXPECTED_LEDGER_FIELDS");
    require(ledger.schemaVersion==="OECL_SCIENTIFIC_CLAIM_LEDGER_V1"&&
      ledger.basis===quality.basis&&
      ledger.subjectPairKey===quality.subject.pairKey&&
      ledger.scientificVerdict===quality.scientificVerdict&&
      ledger.compatibilityVerdict==="NOT_EVALUATED"&&
      ledger.candidateAdmission==="NOT_ADMITTED",
      "LEDGER_SCOPE_OR_VERDICT_MISMATCH");
    require(sha(ledger.qualityContractSha256)&&
      ledger.qualityContractSha256===quality.integrity.sha256&&
      sha(ledger.sourceReportSha256)&&
      ledger.sourceReportSha256===hash(report),
      "EVIDENCE_PARENT_DIGEST_MISMATCH");
    require(integrity?.algorithm==="SHA-256-JSON-INSERTION_ORDER"&&
      sha(integrity.sha256)&&integrity.sha256===hash(body)&&
      integrity.signature===false&&integrity.trustedExternalAttestation===false,
      "TAMPERED_DIGEST_OR_FAKE_SIGNATURE");
    require(ledger.provenance?.independentEvmReplay===false&&
      ledger.provenance?.independentSourceOriginAuthentication===false&&
      ledger.provenance?.sourceOrExecutionAuthorityGranted===false&&
      ledger.conclusion?.independentEvmReplay===false&&
      ledger.conclusion?.universalCompatibilityProven===false&&
      ledger.utility?.demonstratedExternalImpact===false&&
      ledger.utility?.securityCertification===false&&
      ledger.utility?.countingHypothesesIsEvidence===false&&
      ledger.utility?.score===null&&
      eq(ledger.utility?.missingForStrongerClaim,quality.limits.unknowns),
      "FALSE_EXTERNAL_UTILITY_OR_UNSUPPORTED_PROMOTION");
    const expectedHypotheses=quality.investigate.hypotheses.map(h=>({
      id:h.id,kind:"HYPOTHESIS",
      proofStatus:quality.basis==="DOCUMENTARY_SOURCE_ONLY"?
        "SOURCE_HYPOTHESIS_NOT_EXECUTED":
        "SOURCE_HYPOTHESIS_NOT_PROVEN_BY_ONE_SCOPED_EXPERIMENT",
      statement:h.statement,prediction:h.prediction,
      falsifier:h.falsifier,positiveControl:h.positiveControl,
      negativeControl:h.negativeControl,
      sourceSha256:h.anchors.map(a=>a.sha256),
    }));
    require(eq(ledger.hypotheses,expectedHypotheses)&&
      expectedHypotheses.every(h=>h.statement&&h.prediction&&h.falsifier&&
        h.positiveControl&&h.negativeControl&&h.sourceSha256.length>0&&
        h.sourceSha256.every(sha)),
      "UNSUPPORTED_HYPOTHESIS_OR_UNLINKED_FALSIFIER");

    if(quality.basis==="DOCUMENTARY_SOURCE_ONLY"){
      const d=report as DocumentaryPair;
      require(d.status==="DOCUMENTARY_COMPARISON"&&
        d.evmExecuted===false&&
        quality.experiment.status==="NOT_EXECUTED"&&
        quality.experiment.minedTransactionHashes.length===0&&
        ledger.scientificVerdict==="NOT_EVALUATED"&&
        quality.provenance.planSha256===d.autonomousResearch.planSha256,
        "SOURCE_ONLY_REPORT_PROMOTED_TO_EXECUTED");
      require(eq(ledger.observations,[])&&
        eq(ledger.conclusion,{
          kind:"CONCLUSION",status:"NOT_EVALUATED",
          scope:"NO_EVM_EXPERIMENT",
          statement:"No EVM compatibility, safety or economic impact conclusion can be drawn from these source-only hypotheses.",
          supportingObservationIds:[],universalCompatibilityProven:false,
          independentEvmReplay:false,
        }),"FICTIONAL_DOCUMENTARY_OBSERVATION_OR_CONCLUSION");
      require(eq(ledger.utility,{
        status:"NOT_YET_DEMONSTRATED",
        concreteResearchUse:"IDENTIFY_UNTESTED_PRECONDITIONS",
        demonstratedExternalImpact:false,securityCertification:false,
        countingHypothesesIsEvidence:false,score:null,
        rationale:"The report identifies reviewable questions and falsifiers, but provides no executed witness or demonstrated user benefit.",
        missingForStrongerClaim:[...quality.limits.unknowns],
      }),"HYPOTHESIS_COUNT_MASQUERADES_AS_UTILITY");
    }else if(quality.basis==="PINNED_LOCAL_EVM_SNAPSHOT"){
      const d=report as ScientificDossier,e=d.experiment;
      require(d.schemaVersion==="OECL_USER_SCIENTIFIC_DOSSIER_V1"&&
        d.verdict==="INCONCLUSIVE"&&
        quality.scientificVerdict==="INCONCLUSIVE"&&
        e.chainId===31337&&receipt(e.transactionHash)&&
        e.bothBurnsInSameTransaction===true&&e.localConstraintResult==="SUPPORT"&&
        [e.ethRedeemedWei,e.nftObligationDecreaseWei,e.supplyBeforeBaseUnits,
          e.supplyAfterBaseUnits,e.supplyDecreaseBaseUnits].every(positive)&&
        eq(quality.experiment.minedTransactionHashes,[e.transactionHash]),
        "PINNED_OBSERVATION_NOT_REPRODUCED_FROM_REPORT");
      require(eq(ledger.observations,[{
        id:"PINNED_LOCAL_EVM_COUPLED_REDUCTION",
        kind:"OBSERVATION",
        proofStatus:"ARCHIVED_LOCAL_EVM_OBSERVATION_NOT_INDEPENDENTLY_REPLAYED",
        scope:"ONE_PINNED_HARDHAT_TRANSACTION",
        chainId:31337,transactionHash:e.transactionHash,
        statement:"BOTH_REDUCTIONS_RECORDED_IN_ONE_PINNED_LOCAL_TRANSACTION",
        measurements:{
          ethRedeemedWei:e.ethRedeemedWei,
          nftObligationDecreaseWei:e.nftObligationDecreaseWei,
          supplyBeforeBaseUnits:e.supplyBeforeBaseUnits,
          supplyAfterBaseUnits:e.supplyAfterBaseUnits,
          supplyDecreaseBaseUnits:e.supplyDecreaseBaseUnits,
          bothBurnsInSameTransaction:true,
          localConstraintResult:"SUPPORT",
        },
        evidenceRefs:[...quality.demonstrate.evidenceRefs],
      }]),"FORGED_LOCAL_EVM_MEASUREMENTS_OR_RECEIPT");
      require(eq(ledger.conclusion,{
        kind:"CONCLUSION",status:"INCONCLUSIVE",
        scope:"ONE_PINNED_LOCAL_EVM_SCENARIO_ONLY",
        statement:"The archived local transaction supports only a bounded coupled-reduction observation; cross-ERC compatibility and broader safety remain unproven.",
        supportingObservationIds:["PINNED_LOCAL_EVM_COUPLED_REDUCTION"],
        universalCompatibilityProven:false,independentEvmReplay:false,
      }),"SCOPED_OBSERVATION_PROMOTED_TO_UNIVERSAL_CONCLUSION");
      require(eq(ledger.utility,{
        status:"SCOPED_REVIEWABLE_FINDING_ONLY",
        concreteResearchUse:"INSPECT_ONE_PINNED_ATOMICITY_AND_ROLLBACK_SCENARIO",
        demonstratedExternalImpact:false,securityCertification:false,
        countingHypothesesIsEvidence:false,score:null,
        rationale:"A named local receipt and archived artifacts make one scenario reviewable, but do not establish externally reproduced results or real-world safety.",
        missingForStrongerClaim:[...quality.limits.unknowns],
      }),"ARCHIVED_OBSERVATION_PROMOTED_TO_PROVEN_IMPACT");
    }else require(false,"UNREVIEWED_CLAIM_BASIS");
  }catch{
    failedChecks.push("LEDGER_REVIEW_EXCEPTION");
  }
  return {...base,accepted:failedChecks.length===0,
    status:failedChecks.length?"REJECTED":"REVIEWABLE_CLAIM_CLASSIFICATION",
    failedChecks,checkedLedgerSha256:typeof ledger.integrity?.sha256==="string"?
      ledger.integrity.sha256:null};
}
