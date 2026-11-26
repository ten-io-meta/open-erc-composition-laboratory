import { createHash } from "node:crypto";
import type { ScientificQualityContract } from "./oeclScientificQualityContract";
import type { ScientificClaimLedger } from "./oeclScientificClaimLedger";

/**
 * Companion (not replacement) to the exact-field Scientific Quality Contract
 * V1 and Claim Ledger V1. Those deliberately remain DOCUMENTARY_SOURCE_ONLY.
 * A separately linked observation is about TWO *implementations* of ERC4626,
 * not the universal composability of ERC4626 and ERC20.
 *
 * The archive was actually mined in two separate CI jobs. This read-only
 * adapter DOES NOT replay terminated chains or authenticate remote sources.
 */
export const REPRODUCTION_SCHEMA="OECL_SCIENTIFIC_REPRODUCTION_ADDENDUM_V1" as const;
export const REPRODUCTION_RUN="45901609187";
export const REPRODUCTION_ACTION_URL=
 "https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/"+REPRODUCTION_RUN;
export const REPRODUCTION_HEAD_SHA="c7fb535fba976488f3a0c24dba2b700b5938dbfd";
export const REPRODUCTION_PROPOSAL_SHA256="bc7c0474f659057b1e3854d25f90ff47141805655c827c74837b032143532e74";
export const REPRODUCTION_EVIDENCE={
 proposalJsonSha256:"22f8ea9d0c1ce5da9ee03786acd36788d25d4e6a44d1e06f861134a84e87941a",
 originalWitnessJsonSha256:"eab4261ed3c206460b2b48c8f838035f8032107b914bc2dee8cbd8d408e53271",
 secondWitnessJsonSha256:"4b92ed5d276786d4b54b93f9554fb4797746844bc36ce3ebe7730caffc2c694f",
 comparisonJsonSha256:"13b5ae18135a56ecf66a0b5b849eb634561669b7e123ee6bcc67d951721ba809",
 originalArtifactId:15155408982,
 independentArtifactId:15155722505,
 sourceCommit:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
 solmateCommit:"89365b880c4f3c786bdd453d4b8e8fe410344a69",
 compiler:"0.8.26+commit.8a97fa7a.Emscripten.clang",
} as const;
export const REPRODUCED_PAIR="ERC-20|ERC-4626" as const;

export type ReproducedVaultAddendum={
 schemaVersion:typeof REPRODUCTION_SCHEMA;
 linkage:{
  relatedDocumentaryPair:typeof REPRODUCED_PAIR;
  documentaryQualitySha256:string;
  documentaryClaimLedgerSha256:string;
  relation:"ADJACENT_IMPLEMENTATION_COMPARISON_NOT_PROOF_OF_ERC_COMPOSITION";
 };
 investigate:{
  kind:"SOURCE_BOUND_REVIEWED_ECONOMIC_MODELS";
  hypothesisId:"EQUAL_BURNED_SHARES_UNDER_EQUAL_ASSET_INTERVENTION";
  statement:string;
  falsifier:string;
  sourceInference:"ABI_AST_CAPABILITIES_ONLY_ECONOMIC_MODELS_HUMAN_REVIEWED";
  donationAutomaticallySelected:2;
  withdrawalAutomaticallySelected:21;
  searchedCandidates:480;
 };
 challenge:{
  status:"COUNTEREXAMPLE_REPRODUCED_UNDER_PINNED_LOCAL_FIXTURES";
  nullHypothesisVerdict:"REFUTED_IN_TWO_LOCAL_EVM_EXECUTIONS";
  controls:{twoExpectedRevertsPerVariant:true;oneExpectedSuccessPerVariant:true;
   unminedControlsAcrossBothRuns:12};
 };
 experiment:{
  status:"TWO_SEPARATE_CI_LOCAL_EVM_EXECUTIONS_ARCHIVED";
  localChainId:31337;
  evmEngine:"HARDHAT_IN_BOTH_RUNNERS";
  minedReceiptsAcrossBothRuns:28;
  distinctCiExecutionJobs:2;
  independentClientDiversity:false;
  reexecutedByThisWebRequest:false;
  proposalSha256:typeof REPRODUCTION_PROPOSAL_SHA256;
  sourceRevision:{openzeppelinDependency:string;solmate:string;solidityCompiler:string};
 };
 demonstrate:{
  status:"SCOPED_LOCAL_REPRODUCTION_REVIEWABLE";
  openzeppelin:{burnedShares:21;remainingShares:19;vaultAssets:21};
  solmate:{burnedShares:20;remainingShares:20;vaultAssets:21};
  assetsOriginallyMintedPerFixture:100;
  directlyDonatedAssetsPerFixture:2;
  assetsWithdrawnPerFixture:21;
  originalWitnessSha256:string;secondWitnessSha256:string;
  comparisonSha256:string;
  proposalJsonSha256:string;
  sourceActionRunUrl:string;
  gitHeadSha:string;
  artifactIds:{original:number;independent:number};
  independentlyReviewedAtArchiveCreation:true;
  receiptBytesIndependentlyVerifiedByThisWebRequest:false;
  verifiedEthereumConsensus:false;
  externallyAuthenticatedSourceOrigin:false;
 };
 conclusion:{
  kind:"SCOPED_FALSIFICATION_NOT_UNIVERSAL_COMPATIBILITY";
  finding:"THE_TWO_PINNED_IMPLEMENTATIONS_BURN_DIFFERENT_SHARES_IN_THIS_SAME_LOCAL_CASE";
  scientificVerdict:"INCONCLUSIVE";
  compatibilityVerdict:"NOT_EVALUATED";
  candidateAdmission:"NOT_ADMITTED";
  universalSecurityCertification:false;
  utilityStatus:"REPRODUCIBLE_LOCAL_QUESTION_NOT_PROVEN_EXTERNAL_IMPACT";
  demonstratedExternalImpact:false;
  hypothesisVolumeScore:null;
 };
 limits:{
  status:"LIMITED_TWO_LOCAL_FIXTURE_RUNS";
  unresolved:string[];
  artifactRetention:"GITHUB_ACTIONS_ARTIFACTS_MAY_EXPIRE";
 };
 integrity:{algorithm:"SHA-256-JSON-INSERTION_ORDER";sha256:string;
  signature:false;blockchainAttestation:false};
};
export const reproducedHash=(x:unknown)=>createHash("sha256")
 .update(JSON.stringify(x)).digest("hex");
const isSha=(s:unknown):s is string=>
 typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);

export function issueReproducedVaultAddendum(
 quality:ScientificQualityContract,
 ledger:ScientificClaimLedger,
):ReproducedVaultAddendum{
 if(quality.schemaVersion!=="OECL_SCIENTIFIC_QUALITY_CONTRACT_V1"||
    quality.basis!=="DOCUMENTARY_SOURCE_ONLY"||
    quality.subject.pairKey!==REPRODUCED_PAIR||
    !isSha(quality.integrity.sha256)||
    quality.experiment.status!=="NOT_EXECUTED"||
    quality.experiment.minedTransactionHashes.length!==0||
    quality.scientificVerdict!=="NOT_EVALUATED"||
    quality.compatibilityVerdict!=="NOT_EVALUATED"||
    quality.candidateAdmission!=="NOT_ADMITTED"||
    ledger.schemaVersion!=="OECL_SCIENTIFIC_CLAIM_LEDGER_V1"||
    ledger.basis!=="DOCUMENTARY_SOURCE_ONLY"||
    ledger.qualityContractSha256!==quality.integrity.sha256||
    ledger.conclusion.status!=="NOT_EVALUATED"||
    ledger.observations.length!==0||
    ledger.utility.status!=="NOT_YET_DEMONSTRATED"||
    ledger.utility.demonstratedExternalImpact!==false||
    !isSha(ledger.integrity.sha256)){
  throw Error("UNVERIFIED_DOCUMENTARY_QUALITY_CANNOT_LINK_REPRODUCED_CASE");
 }
 const proposal=REPRODUCTION_EVIDENCE;
 const base:Omit<ReproducedVaultAddendum,"integrity">={
  schemaVersion:REPRODUCTION_SCHEMA,
  linkage:{
   relatedDocumentaryPair:REPRODUCED_PAIR,
   documentaryQualitySha256:quality.integrity.sha256,
   documentaryClaimLedgerSha256:ledger.integrity.sha256,
   relation:"ADJACENT_IMPLEMENTATION_COMPARISON_NOT_PROOF_OF_ERC_COMPOSITION",
  },
  investigate:{
   kind:"SOURCE_BOUND_REVIEWED_ECONOMIC_MODELS",
   hypothesisId:"EQUAL_BURNED_SHARES_UNDER_EQUAL_ASSET_INTERVENTION",
   statement:"Under the matched direct donation and asset withdrawal, two pinned ERC4626 implementations burn equal numbers of shares.",
   falsifier:"Two separately mined local experiments show unequal burned shares with conserved underlying balances and negative controls.",
   sourceInference:"ABI_AST_CAPABILITIES_ONLY_ECONOMIC_MODELS_HUMAN_REVIEWED",
   donationAutomaticallySelected:2,withdrawalAutomaticallySelected:21,
   searchedCandidates:480,
  },
  challenge:{
   status:"COUNTEREXAMPLE_REPRODUCED_UNDER_PINNED_LOCAL_FIXTURES",
   nullHypothesisVerdict:"REFUTED_IN_TWO_LOCAL_EVM_EXECUTIONS",
   controls:{twoExpectedRevertsPerVariant:true,oneExpectedSuccessPerVariant:true,
    unminedControlsAcrossBothRuns:12},
  },
  experiment:{
   status:"TWO_SEPARATE_CI_LOCAL_EVM_EXECUTIONS_ARCHIVED",
   localChainId:31337,evmEngine:"HARDHAT_IN_BOTH_RUNNERS",
   minedReceiptsAcrossBothRuns:28,distinctCiExecutionJobs:2,
   independentClientDiversity:false,reexecutedByThisWebRequest:false,
   proposalSha256:REPRODUCTION_PROPOSAL_SHA256,
   sourceRevision:{
    openzeppelinDependency:proposal.sourceCommit,solmate:proposal.solmateCommit,
    solidityCompiler:proposal.compiler,
   },
  },
  demonstrate:{
   status:"SCOPED_LOCAL_REPRODUCTION_REVIEWABLE",
   openzeppelin:{burnedShares:21,remainingShares:19,vaultAssets:21},
   solmate:{burnedShares:20,remainingShares:20,vaultAssets:21},
   assetsOriginallyMintedPerFixture:100,
   directlyDonatedAssetsPerFixture:2,assetsWithdrawnPerFixture:21,
   proposalJsonSha256:proposal.proposalJsonSha256,
   originalWitnessSha256:proposal.originalWitnessJsonSha256,
   secondWitnessSha256:proposal.secondWitnessJsonSha256,
   comparisonSha256:proposal.comparisonJsonSha256,
   sourceActionRunUrl:REPRODUCTION_ACTION_URL,
   gitHeadSha:REPRODUCTION_HEAD_SHA,
   artifactIds:{original:proposal.originalArtifactId,
    independent:proposal.independentArtifactId},
   independentlyReviewedAtArchiveCreation:true,
   receiptBytesIndependentlyVerifiedByThisWebRequest:false,
   verifiedEthereumConsensus:false,
   externallyAuthenticatedSourceOrigin:false,
  },
  conclusion:{
   kind:"SCOPED_FALSIFICATION_NOT_UNIVERSAL_COMPATIBILITY",
   finding:"THE_TWO_PINNED_IMPLEMENTATIONS_BURN_DIFFERENT_SHARES_IN_THIS_SAME_LOCAL_CASE",
   scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
   candidateAdmission:"NOT_ADMITTED",universalSecurityCertification:false,
   utilityStatus:"REPRODUCIBLE_LOCAL_QUESTION_NOT_PROVEN_EXTERNAL_IMPACT",
   demonstratedExternalImpact:false,hypothesisVolumeScore:null,
  },
  limits:{
   status:"LIMITED_TWO_LOCAL_FIXTURE_RUNS",
   unresolved:[
    "Both jobs used the same Hardhat EVM engine, compiler and pinned research source revisions.",
    "The two mathematical share models and intervention class were reviewed by human developers.",
    "Raw Ethereum consensus, public production deployments and upstream source authenticity were not independently demonstrated.",
    "The documentary ERC-4626 x ERC-20 comparison is not upgraded by this separate cross-implementation research case.",
    "Solmate uses AGPL-3.0-only upstream code and is soft-deprecated; legal distribution review remains unresolved.",
    "Archived CI artifacts have a finite retention period and must be preserved or re-executed to permit future receipt-level reviews.",
   ],
   artifactRetention:"GITHUB_ACTIONS_ARTIFACTS_MAY_EXPIRE",
  },
 };
 return {...base,integrity:{algorithm:"SHA-256-JSON-INSERTION_ORDER",
  sha256:reproducedHash(base),signature:false,blockchainAttestation:false}};
}
