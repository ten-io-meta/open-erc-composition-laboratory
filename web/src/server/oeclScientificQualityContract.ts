import { createHash } from "node:crypto";
import type { DocumentaryPair } from "./oeclErcDocumentaryDiscovery";
import type { ScientificDossier } from "./oeclScientificDossier";

/**
 * Scientific quality is an EVIDENCE GATE, not a claim of trust.
 * No LLM, contract interpreter, wallet, network call or execution dispatch.
 * Hashing binds an issued JSON snapshot; it is NOT a signature or independent
 * confirmation of Ethereum receipts / mutable ERC source authenticity.
 */
export const QUALITY_SCHEMA = "OECL_SCIENTIFIC_QUALITY_CONTRACT_V1" as const;
export type ScientificQualityBasis = "DOCUMENTARY_SOURCE_ONLY"|"PINNED_LOCAL_EVM_SNAPSHOT";
export type ScientificSourceRecord = {
  id:string; sha256:string; locator:string;
  provenance:"MUTABLE_OFFICIAL_SPEC_SNAPSHOT"|"PINNED_IMPLEMENTATION_SOURCE";
};
export type QualityHypothesis = {
  id:string; statement:string; prediction:string; falsifier:string;
  positiveControl:string; negativeControl:string;
  anchors:{sourceId:string;sha256:string;locator:string}[];
  status:"PROPOSED_NOT_EXECUTED"|"SOURCE_HYPOTHESIS_WITH_SCOPED_EVM_OBSERVATION";
};
export type ScientificQualityContract = {
  schemaVersion:typeof QUALITY_SCHEMA;
  basis:ScientificQualityBasis;
  subject:{pairKey:string;scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY"|"PINNED_LOCAL_HARDHAT_EVM"};
  provenance:{
    sourceRecords:ScientificSourceRecord[];
    planSha256:string|null;
    snapshotSha256:string|null;
    evidenceRunUrl:string|null;
    graphSha256:string|null;
    evmArtifactSha256:string|null;
  };
  investigate:{
    status:"SOURCE_ANCHORED_PROPOSAL"|"PINNED_SOURCE_HYPOTHESIS"|"ABSTAIN_MISSING_SOURCE";
    hypotheses:QualityHypothesis[];
  };
  challenge:{
    status:"CONTROLS_DESIGNED_NOT_EXECUTED"|"PARTIAL_ARCHIVED_ADVERSARIAL_OBSERVATIONS"|"NO_SUPPORTED_HYPOTHESIS";
    observedCaseIds:string[];
    untestedThreats:{id:string;reason:string}[];
  };
  experiment:{
    status:"NOT_EXECUTED"|"LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE";
    chainId:number|null;
    minedTransactionHashes:string[];
    evmReceiptReplayedByQualityVerifier:false;
    noExecutionAuthority:true;
  };
  demonstrate:{
    status:"PROPOSAL_ONLY"|"SCOPED_ARCHIVED_OBSERVATION_ONLY";
    evidenceRefs:string[];
    sourceCoverageComplete:false;
    universalCompatibilityProven:false;
    independentlyReplayed:false;
  };
  limits:{status:"INCONCLUSIVE_OR_NOT_EVALUATED";unknowns:string[]};
  scientificVerdict:"INCONCLUSIVE"|"NOT_EVALUATED";
  compatibilityVerdict:"NOT_EVALUATED";
  candidateAdmission:"NOT_ADMITTED";
  integrity:{
    algorithm:"SHA-256-JSON-INSERTION_ORDER";
    sha256:string;
    signature:false;
    trustedExternalAttestation:false;
  };
};

export const scientificQualityHash=(value:unknown):string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const isSha=(value:unknown):value is string =>
  typeof value==="string"&&/^[a-f0-9]{64}$/.test(value);

function seal(value:Omit<ScientificQualityContract,"integrity">):ScientificQualityContract{
  // Fixed object field order is part of the versioned serialization contract.
  return {...value,integrity:{
    algorithm:"SHA-256-JSON-INSERTION_ORDER",
    sha256:scientificQualityHash(value),
    signature:false,
    trustedExternalAttestation:false,
  }};
}

export function documentaryScientificQuality(
  pair:DocumentaryPair
):ScientificQualityContract{
  if(pair.status!=="DOCUMENTARY_COMPARISON"||
     pair.scope!=="OFFICIAL_ERC_SPECIFICATIONS_ONLY"||
     pair.scientificVerdict!=="NOT_EVALUATED"||
     pair.candidateAdmission!=="NOT_ADMITTED"||
     pair.implementationVerified!==false||pair.evmExecuted!==false||
     pair.standards.length!==2||pair.protocols.length!==2||
     pair.standards.some((s,i)=>s.id!==pair.protocols[i])||
     pair.protocols[0]===pair.protocols[1]||
     pair.autonomousResearch?.schemaVersion!=="OECL_AUTONOMOUS_DOCUMENTARY_SCIENTIST_V1"||
     pair.autonomousResearch.sourceCompiled!==false||
     pair.autonomousResearch.evmExecuted!==false||
     pair.autonomousResearch.experimentDispatched!==false||
     pair.autonomousResearch.compatibilityVerdict!=="NOT_EVALUATED"||
     pair.autonomousResearch.candidateAdmission!=="NOT_ADMITTED"||
     !isSha(pair.autonomousResearch.planSha256)){
    throw Error("OECL_QUALITY_REJECTED_UNVERIFIED_DOCUMENTARY_INPUT");
  }
  const plan=pair.autonomousResearch;
  const sourceRecords:ScientificSourceRecord[]=pair.standards
    .filter(s=>s.availability==="PUBLISHED"&&isSha(s.provenance.sha256))
    .map(s=>({id:s.id,sha256:s.provenance.sha256!,locator:s.provenance.sourceUrl,
      provenance:"MUTABLE_OFFICIAL_SPEC_SNAPSHOT"}));
  const hypotheses:QualityHypothesis[]=plan.hypotheses.map(h=>({
    id:h.id,statement:h.question,prediction:h.conditionalPrediction,
    falsifier:h.falsifier,positiveControl:h.positiveControl,negativeControl:h.negativeControl,
    anchors:h.anchors.map(a=>({sourceId:a.sourceId,sha256:a.documentSha256,
      locator:a.sourceUrl})),status:"PROPOSED_NOT_EXECUTED",
  }));
  const unknowns=[...new Set([...plan.evidenceGap,...plan.abstentionReasons,
    "Mutable ERC master snapshots are not immutable source revisions.",
    "No implementation bytecode, mined EVM receipt or independent EVM replay has been verified for this investigation."])];
  return seal({
    schemaVersion:QUALITY_SCHEMA,basis:"DOCUMENTARY_SOURCE_ONLY",
    subject:{pairKey:[...pair.protocols].sort((a,b)=>
      Number(a.slice(4))-Number(b.slice(4))).join("|"),
      scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY"},
    provenance:{sourceRecords,planSha256:plan.planSha256,snapshotSha256:null,
      evidenceRunUrl:null,graphSha256:null,evmArtifactSha256:null},
    investigate:{status:hypotheses.length?"SOURCE_ANCHORED_PROPOSAL":
      "ABSTAIN_MISSING_SOURCE",hypotheses},
    challenge:{status:hypotheses.length?"CONTROLS_DESIGNED_NOT_EXECUTED":
      "NO_SUPPORTED_HYPOTHESIS",observedCaseIds:[],untestedThreats:[]},
    experiment:{status:"NOT_EXECUTED",chainId:null,minedTransactionHashes:[],
      evmReceiptReplayedByQualityVerifier:false,noExecutionAuthority:true},
    demonstrate:{status:"PROPOSAL_ONLY",evidenceRefs:[],sourceCoverageComplete:false,
      universalCompatibilityProven:false,independentlyReplayed:false},
    limits:{status:"INCONCLUSIVE_OR_NOT_EVALUATED",unknowns},
    scientificVerdict:"NOT_EVALUATED",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
  });
}

export function pinnedScientificQuality(
  pinned:ScientificDossier,snapshotSha256:string,evidenceRunUrl:string
):ScientificQualityContract{
  if(!isSha(snapshotSha256)||scientificQualityHash(pinned)!==snapshotSha256||
     !/^https:\/\/github\.com\/ten-io-meta\/open-erc-composition-laboratory\/actions\/runs\/[0-9]+$/.test(evidenceRunUrl)||
     pinned.schemaVersion!=="OECL_USER_SCIENTIFIC_DOSSIER_V1"||
     pinned.scope!=="PINNED_LOCAL_HARDHAT_EVM"||
     pinned.verdict!=="INCONCLUSIVE"||
     pinned.candidateAdmission!=="NOT_ADMITTED"||
     pinned.universalCompatibilityEstablished!==false||
     pinned.experiment.chainId!==31337||
     pinned.experiment.propertyStatus!=="OBSERVED_IN_PINNED_LOCAL_EVM"||
     pinned.discovery.status!=="UNEVALUATED_SOURCE_HYPOTHESIS"||
     pinned.discovery.origin!=="COMPILER_RESOLVED_SOLIDITY_AST_ONLY"||
     pinned.scientificQuestions.sourceCoverageComplete!==false||
     pinned.scientificQuestions.allQuestionsResolved!==false||
     pinned.adversarial.status!=="PARTIAL_COVERAGE"||
     !/^0x[a-f0-9]{64}$/i.test(pinned.experiment.transactionHash)||
     !isSha(pinned.artifacts.graph.sha256)||!isSha(pinned.artifacts.evm.sha256)||
     pinned.participants.length!==2||
     pinned.participants.some(p=>!isSha(p.sourceSha256)||
       !/^[a-f0-9]{40}$/.test(p.revision))){
    throw Error("OECL_QUALITY_REJECTED_UNVERIFIED_PINNED_SNAPSHOT");
  }
  const sources:ScientificSourceRecord[]=pinned.participants.map(p=>({
    id:p.repository,sha256:p.sourceSha256,
    locator:"https://github.com/"+p.repository+"/tree/"+p.revision,
    provenance:"PINNED_IMPLEMENTATION_SOURCE",
  }));
  const hypothesis:QualityHypothesis={
    id:pinned.discovery.hypothesisId,
    statement:pinned.discovery.relation,
    prediction:pinned.discovery.predictedProperties.join("; "),
    falsifier:"A reproducible local test under equivalent reviewed preconditions that contradicts the claimed atomic state changes or rollback behavior.",
    positiveControl:"JOINT_SUCCESS",
    negativeControl:"REVERT-ERC20-APPROVAL; REVERT-NFT-APPROVAL; REVERT-NONOWNER",
    anchors:sources.map(s=>({sourceId:s.id,sha256:s.sha256,locator:s.locator})),
    status:"SOURCE_HYPOTHESIS_WITH_SCOPED_EVM_OBSERVATION",
  };
  return seal({
    schemaVersion:QUALITY_SCHEMA,basis:"PINNED_LOCAL_EVM_SNAPSHOT",
    subject:{pairKey:"ERC-8060|ERC-8098",scope:"PINNED_LOCAL_HARDHAT_EVM"},
    provenance:{sourceRecords:sources,planSha256:null,snapshotSha256,
      evidenceRunUrl,graphSha256:pinned.artifacts.graph.sha256,
      evmArtifactSha256:pinned.artifacts.evm.sha256},
    investigate:{status:"PINNED_SOURCE_HYPOTHESIS",hypotheses:[hypothesis]},
    challenge:{status:"PARTIAL_ARCHIVED_ADVERSARIAL_OBSERVATIONS",
      observedCaseIds:[...pinned.adversarial.observedCaseIds],
      untestedThreats:pinned.adversarial.untested.map(t=>({id:t.id,reason:t.reason}))},
    experiment:{status:"LOCAL_EVM_OBSERVED_IN_PINNED_ARCHIVE",chainId:31337,
      minedTransactionHashes:[pinned.experiment.transactionHash],
      evmReceiptReplayedByQualityVerifier:false,noExecutionAuthority:true},
    demonstrate:{status:"SCOPED_ARCHIVED_OBSERVATION_ONLY",
      evidenceRefs:[pinned.artifacts.graph.sha256,pinned.artifacts.evm.sha256],
      sourceCoverageComplete:false,universalCompatibilityProven:false,
      independentlyReplayed:false},
    limits:{status:"INCONCLUSIVE_OR_NOT_EVALUATED",unknowns:[
      ...pinned.limitations,
      ...pinned.adversarial.untested.map(t=>t.id+": "+t.reason),
      "The quality verifier checks the pinned snapshot and evidence references, not a new replay of the terminated local EVM."
    ]},
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
  });
}
