import { createHash } from "node:crypto";
import type { ScientificDossier } from "./oeclScientificDossier";
import type { DocumentaryPair } from "./oeclErcDocumentaryDiscovery";
import type { ScientificQualityContract } from "./oeclScientificQualityContract";

/**
 * Companion to immutable quality-contract V1, avoiding breaking clients that
 * independently validate the exact V1 JSON field set. Claim classification
 * is not an independent execution verdict, a marketplace quality score,
 * or an ERC compatibility statement.
 */
export const CLAIM_LEDGER_SCHEMA="OECL_SCIENTIFIC_CLAIM_LEDGER_V1" as const;
type ClaimProofStatus=
 "SOURCE_HYPOTHESIS_NOT_EXECUTED"|
 "SOURCE_HYPOTHESIS_NOT_PROVEN_BY_ONE_SCOPED_EXPERIMENT";
type HypothesisClaim={
  id:string;kind:"HYPOTHESIS";proofStatus:ClaimProofStatus;
  statement:string;prediction:string;falsifier:string;
  positiveControl:string;negativeControl:string;
  sourceSha256:string[];
};
type LocalObservation={
  id:"PINNED_LOCAL_EVM_COUPLED_REDUCTION";
  kind:"OBSERVATION";
  proofStatus:"ARCHIVED_LOCAL_EVM_OBSERVATION_NOT_INDEPENDENTLY_REPLAYED";
  scope:"ONE_PINNED_HARDHAT_TRANSACTION";
  chainId:31337;
  transactionHash:string;
  statement:"BOTH_REDUCTIONS_RECORDED_IN_ONE_PINNED_LOCAL_TRANSACTION";
  measurements:{
    ethRedeemedWei:string;
    nftObligationDecreaseWei:string;
    supplyBeforeBaseUnits:string;
    supplyAfterBaseUnits:string;
    supplyDecreaseBaseUnits:string;
    bothBurnsInSameTransaction:true;
    localConstraintResult:"SUPPORT";
  };
  evidenceRefs:string[];
};
type ClaimConclusion={
  kind:"CONCLUSION";
  status:"NOT_EVALUATED"|"INCONCLUSIVE";
  scope:"NO_EVM_EXPERIMENT"|"ONE_PINNED_LOCAL_EVM_SCENARIO_ONLY";
  statement:string;
  supportingObservationIds:string[];
  universalCompatibilityProven:false;
  independentEvmReplay:false;
};
type UtilityAssessment={
  status:"NOT_YET_DEMONSTRATED"|"SCOPED_REVIEWABLE_FINDING_ONLY";
  concreteResearchUse:"IDENTIFY_UNTESTED_PRECONDITIONS"|
    "INSPECT_ONE_PINNED_ATOMICITY_AND_ROLLBACK_SCENARIO";
  demonstratedExternalImpact:false;
  securityCertification:false;
  countingHypothesesIsEvidence:false;
  score:null;
  rationale:string;
  missingForStrongerClaim:string[];
};
export type ScientificClaimLedger={
  schemaVersion:typeof CLAIM_LEDGER_SCHEMA;
  basis:ScientificQualityContract["basis"];
  subjectPairKey:string;
  qualityContractSha256:string;
  sourceReportSha256:string;
  hypotheses:HypothesisClaim[];
  observations:LocalObservation[];
  conclusion:ClaimConclusion;
  utility:UtilityAssessment;
  scientificVerdict:"NOT_EVALUATED"|"INCONCLUSIVE";
  compatibilityVerdict:"NOT_EVALUATED";
  candidateAdmission:"NOT_ADMITTED";
  provenance:{
    independentSourceOriginAuthentication:false;
    independentEvmReplay:false;
    sourceOrExecutionAuthorityGranted:false;
  };
  integrity:{algorithm:"SHA-256-JSON-INSERTION_ORDER";sha256:string;
    signature:false;trustedExternalAttestation:false};
};
const hash=(value:unknown)=>createHash("sha256")
  .update(JSON.stringify(value)).digest("hex");
const SHA=/^[a-f0-9]{64}$/;
const tx=/^0x[a-f0-9]{64}$/i;
const positiveNumber=(x:string)=>/^[0-9]+$/.test(x);
export function scientificClaimHash(value:unknown):string{return hash(value);}
function seal(value:Omit<ScientificClaimLedger,"integrity">):ScientificClaimLedger{
  return {...value,integrity:{algorithm:"SHA-256-JSON-INSERTION_ORDER",
    sha256:hash(value),signature:false,trustedExternalAttestation:false}};
}

/**
 * Caller must first independently review the quality contract against
 * the source report. Ledger issuance never queries a network or EVM.
 */
export function issueScientificClaimLedger(
  quality:ScientificQualityContract,
  sourceReport:DocumentaryPair|ScientificDossier,
):ScientificClaimLedger{
  if(!SHA.test(quality?.integrity?.sha256??"")||
     quality.compatibilityVerdict!=="NOT_EVALUATED"||
     quality.candidateAdmission!=="NOT_ADMITTED"||
     quality.demonstrate.independentlyReplayed!==false||
     quality.demonstrate.universalCompatibilityProven!==false||
     quality.experiment.evmReceiptReplayedByQualityVerifier!==false){
    throw Error("CLAIM_LEDGER_SOURCE_QUALITY_NOT_APPROVED");
  }
  const hypotheses:HypothesisClaim[]=quality.investigate.hypotheses.map(h=>({
    id:h.id,kind:"HYPOTHESIS",
    proofStatus:quality.basis==="DOCUMENTARY_SOURCE_ONLY"?
      "SOURCE_HYPOTHESIS_NOT_EXECUTED":
      "SOURCE_HYPOTHESIS_NOT_PROVEN_BY_ONE_SCOPED_EXPERIMENT",
    statement:h.statement,prediction:h.prediction,
    falsifier:h.falsifier,positiveControl:h.positiveControl,
    negativeControl:h.negativeControl,
    sourceSha256:h.anchors.map(a=>a.sha256),
  }));
  const observations:LocalObservation[]=[];
  let conclusion:ClaimConclusion;
  let utility:UtilityAssessment;
  if(quality.basis==="DOCUMENTARY_SOURCE_ONLY"){
    const report=sourceReport as DocumentaryPair;
    if(report.status!=="DOCUMENTARY_COMPARISON"||
       report.scope!=="OFFICIAL_ERC_SPECIFICATIONS_ONLY"||
       report.evmExecuted!==false||
       quality.experiment.status!=="NOT_EXECUTED"||
       quality.experiment.minedTransactionHashes.length!==0||
       quality.scientificVerdict!=="NOT_EVALUATED"||
       quality.provenance.planSha256!==report.autonomousResearch.planSha256){
      throw Error("CLAIM_LEDGER_CANNOT_PROMOTE_DOCUMENTARY_SOURCE");
    }
    conclusion={kind:"CONCLUSION",status:"NOT_EVALUATED",
      scope:"NO_EVM_EXPERIMENT",
      statement:"No EVM compatibility, safety or economic impact conclusion can be drawn from these source-only hypotheses.",
      supportingObservationIds:[],universalCompatibilityProven:false,
      independentEvmReplay:false};
    utility={status:"NOT_YET_DEMONSTRATED",
      concreteResearchUse:"IDENTIFY_UNTESTED_PRECONDITIONS",
      demonstratedExternalImpact:false,securityCertification:false,
      countingHypothesesIsEvidence:false,score:null,
      rationale:"The report identifies reviewable questions and falsifiers, but provides no executed witness or demonstrated user benefit.",
      missingForStrongerClaim:[...quality.limits.unknowns]};
  }else if(quality.basis==="PINNED_LOCAL_EVM_SNAPSHOT"){
    const report=sourceReport as ScientificDossier,e=report.experiment;
    if(report.schemaVersion!=="OECL_USER_SCIENTIFIC_DOSSIER_V1"||
       report.verdict!=="INCONCLUSIVE"||
       quality.scientificVerdict!=="INCONCLUSIVE"||
       quality.experiment.status!=="LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE"||
       e.chainId!==31337||
       e.bothBurnsInSameTransaction!==true||
       e.localConstraintResult!=="SUPPORT"||
       !tx.test(e.transactionHash)||
       ![e.ethRedeemedWei,e.nftObligationDecreaseWei,e.supplyBeforeBaseUnits,
         e.supplyAfterBaseUnits,e.supplyDecreaseBaseUnits].every(positiveNumber)||
       quality.experiment.minedTransactionHashes.length!==1||
       quality.experiment.minedTransactionHashes[0]!==e.transactionHash||
       quality.demonstrate.evidenceRefs.length!==2||
       !quality.demonstrate.evidenceRefs.every(s=>SHA.test(s))){
      throw Error("CLAIM_LEDGER_PINNED_LOCAL_EVM_UNVERIFIED");
    }
    observations.push({id:"PINNED_LOCAL_EVM_COUPLED_REDUCTION",kind:"OBSERVATION",
      proofStatus:"ARCHIVED_LOCAL_EVM_OBSERVATION_NOT_INDEPENDENTLY_REPLAYED",
      scope:"ONE_PINNED_HARDHAT_TRANSACTION",chainId:31337,
      transactionHash:e.transactionHash,
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
      evidenceRefs:[...quality.demonstrate.evidenceRefs]});
    conclusion={kind:"CONCLUSION",status:"INCONCLUSIVE",
      scope:"ONE_PINNED_LOCAL_EVM_SCENARIO_ONLY",
      statement:"The archived local transaction supports only a bounded coupled-reduction observation; cross-ERC compatibility and broader safety remain unproven.",
      supportingObservationIds:["PINNED_LOCAL_EVM_COUPLED_REDUCTION"],
      universalCompatibilityProven:false,independentEvmReplay:false};
    utility={status:"SCOPED_REVIEWABLE_FINDING_ONLY",
      concreteResearchUse:"INSPECT_ONE_PINNED_ATOMICITY_AND_ROLLBACK_SCENARIO",
      demonstratedExternalImpact:false,securityCertification:false,
      countingHypothesesIsEvidence:false,score:null,
      rationale:"A named local receipt and archived artifacts make one scenario reviewable, but do not establish externally reproduced results or real-world safety.",
      missingForStrongerClaim:[...quality.limits.unknowns]};
  }else throw Error("CLAIM_LEDGER_BASIS_NOT_REGISTERED");

  return seal({
    schemaVersion:CLAIM_LEDGER_SCHEMA,basis:quality.basis,
    subjectPairKey:quality.subject.pairKey,
    qualityContractSha256:quality.integrity.sha256,
    sourceReportSha256:hash(sourceReport),
    hypotheses,observations,conclusion,utility,
    scientificVerdict:quality.scientificVerdict,
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    provenance:{independentSourceOriginAuthentication:false,
      independentEvmReplay:false,sourceOrExecutionAuthorityGranted:false},
  });
}
