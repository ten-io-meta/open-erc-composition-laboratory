import { createHash } from "node:crypto";
import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import type { ScientificClaimLedger } from "./oeclScientificClaimLedger";
import type { ReproducedVaultAddendum } from "./oeclReproducedVaultAddendum";

/**
 * Independent, fail-closed *structural* reviewer of a pinned CI archive
 * addendum. Does not import its producer and DOES NOT replay EVM receipts.
 * Full raw witness verification is a separate required CI gate.
 */
export type ReproducedVaultReview={
 schemaVersion:"OECL_REPRODUCED_LOCAL_EVM_ADDENDUM_REVIEW_V1";
 accepted:boolean;
 status:"ARCHIVED_CROSS_RUN_METADATA_RECONCILED"|"REJECTED";
 failures:string[];
 reviewedAddendumSha256:string|null;
 independentEvmReexecutedByReviewer:false;
 independentEthereumClientConsensus:false;
 independentUpstreamOriginAuthentication:false;
 incompatibleOrUnsafeERCsCertified:false;
 documentaryPairUpgraded:false;
 conclusion:"INCONCLUSIVE";
 candidateAdmission:"NOT_ADMITTED";
};
const sha=(x:unknown)=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const eq=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const keys=(v:unknown,expected:string[])=>v!==null&&typeof v==="object"&&!Array.isArray(v)&&
 eq(Object.keys(v).sort(),[...expected].sort());
const validHash=(s:unknown)=>typeof s==="string"&&/^[0-9a-f]{64}$/.test(s);
const expectedLimits=[
 "Both jobs used the same Hardhat EVM engine, compiler and pinned research source revisions.",
 "The two mathematical share models and intervention class were reviewed by human developers.",
 "Raw Ethereum consensus, public production deployments and upstream source authenticity were not independently demonstrated.",
 "The documentary ERC-4626 x ERC-20 comparison is not upgraded by this separate cross-implementation research case.",
 "Solmate uses AGPL-3.0-only upstream code and is soft-deprecated; legal distribution review remains unresolved.",
 "Archived CI artifacts have a finite retention period and must be preserved or re-executed to permit future receipt-level reviews.",
];
function verifyParent(quality:ScientificQualityContract,ledger:ScientificClaimLedger){
 try{
  const {integrity:qi,...qb}=quality,{integrity:li,...lb}=ledger;
  return quality.schemaVersion==="OECL_SCIENTIFIC_QUALITY_CONTRACT_V1"&&
   quality.basis==="DOCUMENTARY_SOURCE_ONLY"&&
   quality.subject.pairKey==="ERC-20|ERC-4626"&&
   quality.experiment.status==="NOT_EXECUTED"&&
   quality.experiment.minedTransactionHashes.length===0&&
   quality.demonstrate.independentlyReplayed===false&&
   quality.scientificVerdict==="NOT_EVALUATED"&&
   quality.compatibilityVerdict==="NOT_EVALUATED"&&
   quality.candidateAdmission==="NOT_ADMITTED"&&
   qi.signature===false&&qi.trustedExternalAttestation===false&&
   validHash(qi.sha256)&&qi.sha256===sha(qb)&&
   ledger.schemaVersion==="OECL_SCIENTIFIC_CLAIM_LEDGER_V1"&&
   ledger.basis==="DOCUMENTARY_SOURCE_ONLY"&&
   ledger.conclusion.status==="NOT_EVALUATED"&&
   ledger.observations.length===0&&
   ledger.utility.status==="NOT_YET_DEMONSTRATED"&&
   ledger.utility.demonstratedExternalImpact===false&&
   ledger.qualityContractSha256===qi.sha256&&
   ledger.compatibilityVerdict==="NOT_EVALUATED"&&
   ledger.candidateAdmission==="NOT_ADMITTED"&&
   li.signature===false&&li.trustedExternalAttestation===false&&
   validHash(li.sha256)&&li.sha256===sha(lb);
 }catch{return false;}
}
export function independentlyReviewReproducedVault(
 input:unknown,quality:ScientificQualityContract,ledger:ScientificClaimLedger,
):ReproducedVaultReview{
 const failures:string[]=[];
 const need=(valid:unknown,reason:string)=>{if(!valid)failures.push(reason)};
 const base={
  schemaVersion:"OECL_REPRODUCED_LOCAL_EVM_ADDENDUM_REVIEW_V1" as const,
  independentEvmReexecutedByReviewer:false as const,
  independentEthereumClientConsensus:false as const,
  independentUpstreamOriginAuthentication:false as const,
  incompatibleOrUnsafeERCsCertified:false as const,
  documentaryPairUpgraded:false as const,
  conclusion:"INCONCLUSIVE" as const,
  candidateAdmission:"NOT_ADMITTED" as const,
 };
 if(!input||typeof input!=="object"||Array.isArray(input)){
  return {...base,accepted:false,status:"REJECTED",failures:["MISSING_ADDENDUM"],
   reviewedAddendumSha256:null};
 }
 const a=input as Partial<ReproducedVaultAddendum>;
 try{
  const {integrity,...body}=a;
  need(verifyParent(quality,ledger),"PARENT_DOCUMENTARY_SCIENCE_NOT_VERIFIED");
  need(keys(a,["schemaVersion","linkage","investigate","challenge","experiment",
     "demonstrate","conclusion","limits","integrity"])&&
   keys(a.linkage,["relatedDocumentaryPair","documentaryQualitySha256",
     "documentaryClaimLedgerSha256","relation"])&&
   keys(a.investigate,["kind","hypothesisId","statement","falsifier","sourceInference",
     "donationAutomaticallySelected","withdrawalAutomaticallySelected","searchedCandidates"])&&
   keys(a.challenge,["status","nullHypothesisVerdict","controls"])&&
   keys(a.challenge?.controls,["twoExpectedRevertsPerVariant",
     "oneExpectedSuccessPerVariant","unminedControlsAcrossBothRuns"])&&
   keys(a.experiment,["status","localChainId","evmEngine","minedReceiptsAcrossBothRuns",
     "distinctCiExecutionJobs","independentClientDiversity","reexecutedByThisWebRequest",
     "proposalSha256","sourceRevision"])&&
   keys(a.experiment?.sourceRevision,["openzeppelinDependency","solmate","solidityCompiler"])&&
   keys(a.demonstrate,["status","openzeppelin","solmate","assetsOriginallyMintedPerFixture",
     "directlyDonatedAssetsPerFixture","assetsWithdrawnPerFixture",
     "proposalJsonSha256","originalWitnessSha256","secondWitnessSha256",
     "comparisonSha256","sourceActionRunUrl","gitHeadSha","artifactIds",
     "independentlyReviewedAtArchiveCreation","receiptBytesIndependentlyVerifiedByThisWebRequest",
     "verifiedEthereumConsensus","externallyAuthenticatedSourceOrigin"])&&
   keys(a.demonstrate?.openzeppelin,["burnedShares","remainingShares","vaultAssets"])&&
   keys(a.demonstrate?.solmate,["burnedShares","remainingShares","vaultAssets"])&&
   keys(a.demonstrate?.artifactIds,["original","independent"])&&
   keys(a.conclusion,["kind","finding","scientificVerdict","compatibilityVerdict",
     "candidateAdmission","universalSecurityCertification","utilityStatus",
     "demonstratedExternalImpact","hypothesisVolumeScore"])&&
   keys(a.limits,["status","unresolved","artifactRetention"])&&
   keys(integrity,["algorithm","sha256","signature","blockchainAttestation"]),
   "UNKNOWN_OR_MISSING_ARCHIVE_ADDENDUM_FIELD");
  need(a.schemaVersion==="OECL_SCIENTIFIC_REPRODUCTION_ADDENDUM_V1"&&
   a.linkage?.relatedDocumentaryPair==="ERC-20|ERC-4626"&&
   a.linkage.documentaryQualitySha256===quality.integrity.sha256&&
   a.linkage.documentaryClaimLedgerSha256===ledger.integrity.sha256&&
   a.linkage.relation==="ADJACENT_IMPLEMENTATION_COMPARISON_NOT_PROOF_OF_ERC_COMPOSITION",
   "DOCUMENTARY_SOURCE_AND_CLAIM_LINKAGE_MISMATCH");
  need(eq(a.investigate,{
   kind:"SOURCE_BOUND_REVIEWED_ECONOMIC_MODELS",
   hypothesisId:"EQUAL_BURNED_SHARES_UNDER_EQUAL_ASSET_INTERVENTION",
   statement:"Under the matched direct donation and asset withdrawal, two pinned ERC4626 implementations burn equal numbers of shares.",
   falsifier:"Two separately mined local experiments show unequal burned shares with conserved underlying balances and negative controls.",
   sourceInference:"ABI_AST_CAPABILITIES_ONLY_ECONOMIC_MODELS_HUMAN_REVIEWED",
   donationAutomaticallySelected:2,withdrawalAutomaticallySelected:21,
   searchedCandidates:480,
  }),"REVIEWED_HYPOTHESIS_OR_FALSIFIER_ALTERED");
  need(eq(a.challenge,{
   status:"COUNTEREXAMPLE_REPRODUCED_UNDER_PINNED_LOCAL_FIXTURES",
   nullHypothesisVerdict:"REFUTED_IN_TWO_LOCAL_EVM_EXECUTIONS",
   controls:{twoExpectedRevertsPerVariant:true,oneExpectedSuccessPerVariant:true,
    unminedControlsAcrossBothRuns:12},
  }),"CONTROL_COUNTS_OR_COUNTEREXAMPLE_PROMOTED");
  need(eq(a.experiment,{
   status:"TWO_SEPARATE_CI_LOCAL_EVM_EXECUTIONS_ARCHIVED",
   localChainId:31337,evmEngine:"HARDHAT_IN_BOTH_RUNNERS",
   minedReceiptsAcrossBothRuns:28,distinctCiExecutionJobs:2,
   independentClientDiversity:false,reexecutedByThisWebRequest:false,
   proposalSha256:"bc7c0474f659057b1e3854d25f90ff47141805655c827c74837b032143532e74",
   sourceRevision:{
    openzeppelinDependency:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    solmate:"89365b880c4f3c786bdd453d4b8e8fe410344a69",
    solidityCompiler:"0.8.26+commit.8a97fa7a.Emscripten.clang",
   },
  }),"EVM_REPLAY_SCOPE_OR_PINNED_PROVENANCE_CHANGED");
  need(eq(a.demonstrate,{
   status:"SCOPED_LOCAL_REPRODUCTION_REVIEWABLE",
   openzeppelin:{burnedShares:21,remainingShares:19,vaultAssets:21},
   solmate:{burnedShares:20,remainingShares:20,vaultAssets:21},
   assetsOriginallyMintedPerFixture:100,directlyDonatedAssetsPerFixture:2,
   assetsWithdrawnPerFixture:21,
   proposalJsonSha256:"22f8ea9d0c1ce5da9ee03786acd36788d25d4e6a44d1e06f861134a84e87941a",
   originalWitnessSha256:"eab4261ed3c206460b2b48c8f838035f8032107b914bc2dee8cbd8d408e53271",
   secondWitnessSha256:"4b92ed5d276786d4b54b93f9554fb4797746844bc36ce3ebe7730caffc2c694f",
   comparisonSha256:"13b5ae18135a56ecf66a0b5b849eb634561669b7e123ee6bcc67d951721ba809",
   sourceActionRunUrl:"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45901609187",
   gitHeadSha:"c7fb535fba976488f3a0c24dba2b700b5938dbfd",
   artifactIds:{original:15155408982,independent:15155722505},
   independentlyReviewedAtArchiveCreation:true,
   receiptBytesIndependentlyVerifiedByThisWebRequest:false,
   verifiedEthereumConsensus:false,externallyAuthenticatedSourceOrigin:false,
  }),"PINNED_EXECUTION_ARTIFACT_DIGEST_OR_ECONOMIC_LEDGER_CHANGED");
  need(eq(a.conclusion,{
   kind:"SCOPED_FALSIFICATION_NOT_UNIVERSAL_COMPATIBILITY",
   finding:"THE_TWO_PINNED_IMPLEMENTATIONS_BURN_DIFFERENT_SHARES_IN_THIS_SAME_LOCAL_CASE",
   scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
   candidateAdmission:"NOT_ADMITTED",universalSecurityCertification:false,
   utilityStatus:"REPRODUCIBLE_LOCAL_QUESTION_NOT_PROVEN_EXTERNAL_IMPACT",
   demonstratedExternalImpact:false,hypothesisVolumeScore:null,
  }),"FALSE_GENERAL_COMPATIBILITY_OR_DEMONSTRATED_MARKET_IMPACT");
  need(eq(a.limits,{
   status:"LIMITED_TWO_LOCAL_FIXTURE_RUNS",
   unresolved:expectedLimits,
   artifactRetention:"GITHUB_ACTIONS_ARTIFACTS_MAY_EXPIRE",
  }),"UNRESOLVED_EPISTEMIC_OR_ARTIFACT_LIMITS_REMOVED");
  need(integrity?.algorithm==="SHA-256-JSON-INSERTION_ORDER"&&
   validHash(integrity.sha256)&&integrity.sha256===sha(body)&&
   integrity.signature===false&&integrity.blockchainAttestation===false,
   "RECOMPUTED_DIGEST_OR_SIGNATURE_UNTRUSTED");
 }catch{failures.push("MALFORMED_REPRODUCTION_ADDENDUM");}
 return {...base,accepted:failures.length===0,
  status:failures.length?"REJECTED":"ARCHIVED_CROSS_RUN_METADATA_RECONCILED",
  failures,reviewedAddendumSha256:validHash(a.integrity?.sha256)?
   a.integrity!.sha256:null};
}
