import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateCompatibilityPolarity
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionCandidateEvidenceDiagnostic
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGap.js";

import type {
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";

import type {
    ScientificCompositionHarmonyStatus
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificNProtocolCompositionConfiguration
} from "../scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


export type ScientificCompositionVisualizationGlobalStatus =
    | ScientificCompositionGlobalPolarity
    | "NOT_EVALUATED";


export interface ScientificCompositionVisualizationNode {

    participantId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    contributionIds:
        string[];

    boundaryIds:
        string[];

    needIds:
        string[];

}


export interface ScientificCompositionVisualizationRelation {

    candidateId:
        string;

    kind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    /*
     * Candidate-level compatibility only.
     *
     * This is deliberately not a global composition verdict.
     */
    compatibilityPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

    boundaryIds:
        string[];

    discoveryEvidenceIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    compatibilityObservationIds:
        string[];

    gapIds:
        string[];

    gapKinds:
        ScientificCompositionCandidateEvidenceDiagnostic["gaps"][number]["kind"][];

    evidenceResolution:
        ScientificCompositionCandidateEvidenceDiagnostic["resolution"];

    functionalMatchId?:
        string;

    needId?:
        string;

    contributionId?:
        string;

    documentaryCandidateId?:
        string;

    documentaryRelation?:
        ScientificProtocolRelationKind;

    structuralFoundationCandidateId?:
        string;

    structuralFoundationDirectionality?:
        "UNDIRECTED";

    foundationProtocolId?:
        string;

}


export interface ScientificCompositionVisualizationConfiguration {

    configurationId:
        string;

    kind:
        ScientificNProtocolCompositionConfiguration["kind"];

    participantIds:
        string[];

    selectedFunctionalCandidateIds:
        string[];

    knownBoundaryIds:
        string[];

    blockers:
        ScientificNProtocolCompositionConfiguration["blockers"];

    readiness:
        ScientificNProtocolCompositionConfiguration["readiness"];

    /*
     * NOT_EVALUATED is reserved for solver configurations which
     * never reached global evaluation because they are BLOCKED.
     */
    globalStatus:
        ScientificCompositionVisualizationGlobalStatus;

    bindingId?:
        string;

    targetId?:
        string;

    graphId?:
        string;

    observationIds:
        string[];

    runIds:
        string[];

    supportingRunId?:
        string;

}


export interface ScientificCompositionVisualizationEnvelope {

    visualizationId:
        string;

    envelopeId:
        string;

    setId:
        string;

    objectiveId:
        string;

    harmonyAssessmentId:
        string;

    harmonyStatus:
        ScientificCompositionHarmonyStatus;

    nodes:
        ScientificCompositionVisualizationNode[];

    relations:
        ScientificCompositionVisualizationRelation[];

    configurations:
        ScientificCompositionVisualizationConfiguration[];

    unresolvedNeedIds:
        string[];

    supportedFullConfigurationIds:
        string[];

    challengedFullConfigurationIds:
        string[];

    inconclusiveFullConfigurationIds:
        string[];

    supportedSubsetConfigurationIds:
        string[];

    blockedFullConfigurationIds:
        string[];

    blockedSubsetConfigurationIds:
        string[];

    /*
     * This object is a projection for rendering.
     *
     * It introduces no compatibility, harmony or geometry claim.
     */
    modelBasis:
        "SCIENTIFIC_STATE_PROJECTION";

    projectionStatus:
        "PROJECTED";

}


export interface ScientificCompositionVisualizationResult {

    visualizations:
        ScientificCompositionVisualizationEnvelope[];

    isolatedParticipantIds:
        string[];

    errors:
        string[];

}