import type {
    ScientificSourceObservationLocator
} from "../scientific-source-observation/ScientificSourceObservationLocator.js";

import type {
    ScientificSourceFactKind
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolRelationKind,
    ScientificProtocolRelationEvidenceBasis
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateCompatibilityPolarity
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionHarmonyStatus
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";

import type {
    ScientificNProtocolCompositionConfiguration
} from "../scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";


export type ScientificDecisionTraceEvidenceKind =
    | "SOURCE_FACT"
    | "DOCUMENTARY_RELATION";


export interface ScientificDecisionTraceSourceEvidence {

    evidenceId:
        string;

    evidenceKind:
        ScientificDecisionTraceEvidenceKind;

    sourceId:
        string;

    sourceType:
        string;

    sourceRevision?:
        string;

    observationId:
        string;

    sourceLocation:
        string;

    filePath?:
        string;

    startLine?:
        number;

    endLine?:
        number;

    rawText:
        string;

    factKind?:
        ScientificSourceFactKind;

    relation?:
        ScientificProtocolRelationKind;

    relationEvidenceBasis?:
        ScientificProtocolRelationEvidenceBasis;

    subjectLocator?:
        ScientificSourceObservationLocator;

}


export type ScientificDecisionTraceArtifactKind =
    | "CONTRIBUTION"
    | "BOUNDARY"
    | "NEED";


export interface ScientificDecisionTraceParticipantArtifact {

    artifactId:
        string;

    artifactKind:
        ScientificDecisionTraceArtifactKind;

    participantId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    subject:
        string;

    evidenceIds:
        string[];

    resolvedEvidenceIds:
        string[];

    unresolvedEvidenceIds:
        string[];

}


export type ScientificDecisionTraceCandidateReason =
    | "FUNCTIONAL_MATCH_OPENED_CANDIDATE"
    | "DOCUMENTARY_RELATION_OPENED_CANDIDATE"
    | "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
    | "BOUNDARY_CHALLENGED"
    | "CANDIDATE_COMPATIBILITY_INCONCLUSIVE"
    | "NO_KNOWN_BOUNDARIES"
    | "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    | "UNEVALUATED_KNOWN_BOUNDARIES";


export interface ScientificDecisionTraceCandidate {

    traceId:
        string;

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    compatibilityAssessmentId:
        string;

    compatibilityPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

    discoveryEvidenceIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    knownBoundaryIds:
        string[];

    observedBoundaryIds:
        string[];

    unevaluatedBoundaryIds:
        string[];

    gapIds:
        string[];

    reasonCodes:
        ScientificDecisionTraceCandidateReason[];

    resolvedEvidenceIds:
        string[];

    unresolvedEvidenceIds:
        string[];

    traceBasis:
        "UPSTREAM_CANDIDATE_EVIDENCE_EXPLANATION";

}


export type ScientificDecisionTraceConfigurationGlobalStatus =
    | ScientificCompositionGlobalPolarity
    | "NOT_EVALUATED";


export interface ScientificDecisionTraceConfiguration {

    configurationId:
        string;

    kind:
        ScientificNProtocolCompositionConfiguration["kind"];

    participantIds:
        string[];

    readiness:
        ScientificNProtocolCompositionConfiguration["readiness"];

    selectedFunctionalCandidateIds:
        string[];

    knownBoundaryIds:
        string[];

    blockerIds:
        string[];

    globalStatus:
        ScientificDecisionTraceConfigurationGlobalStatus;

    bindingId?:
        string;

    targetId?:
        string;

    graphId?:
        string;

    globalAssessmentId?:
        string;

    observationIds:
        string[];

    runIds:
        string[];

    supportingRunId?:
        string;

}


export type ScientificDecisionTraceCompositionReason =
    | "EXACT_FULL_CONFIGURATION_HAS_GLOBAL_SUPPORT"
    | "STRICT_SUBSET_HAS_GLOBAL_SUPPORT"
    | "FULL_CONFIGURATION_GLOBALLY_CHALLENGED"
    | "GLOBAL_COMPOSITION_NOT_ESTABLISHED"
    | "NO_SOLVER_CONFIGURATION"
    | "CANDIDATE_TOPOLOGY_UNRESOLVED"
    | "BLOCKED_CONFIGURATION_PRESENT"
    | "INCONCLUSIVE_GLOBAL_EVIDENCE_PRESENT"
    | "CANDIDATE_EVIDENCE_GAPS_PRESENT";


export interface ScientificDecisionTraceComposition {

    traceId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    participantIds:
        string[];

    harmonyAssessmentId:
        string;

    harmonyStatus:
        ScientificCompositionHarmonyStatus;

    harmonyEvidenceBasis:
        "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE";

    solverSolutionId:
        string;

    solverResolutionStatus:
        string;

    candidateTraceIds:
        string[];

    configurations:
        ScientificDecisionTraceConfiguration[];

    reasonCodes:
        ScientificDecisionTraceCompositionReason[];

    decisionBasis:
        "UPSTREAM_SCIENTIFIC_DECISION_EXPLANATION";

    traceStatus:
        "EXPLAINED";

}


export interface ScientificDecisionTraceResult {

    evidenceCatalog:
        ScientificDecisionTraceSourceEvidence[];

    participantArtifacts:
        ScientificDecisionTraceParticipantArtifact[];

    candidateTraces:
        ScientificDecisionTraceCandidate[];

    compositionTraces:
        ScientificDecisionTraceComposition[];

    /*
     * Evidence may legitimately belong to a runtime provider whose
     * provenance adapter is not yet connected to this catalog.
     *
     * It remains explicit instead of being silently discarded.
     * Hito 24B/The Graph will add another resolvable provenance class.
     */
    unresolvedEvidenceIds:
        string[];

    errors:
        string[];

}