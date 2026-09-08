import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateCompatibilityPolarity,
    ScientificCompositionCandidateBoundaryEvaluationStatus
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


export interface ScientificCompositionEnvelopeParticipant {

    participantId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

    contributions:
        ScientificProtocolCompositionProfile["contributions"];

    boundaries:
        ScientificProtocolCompositionProfile["boundaries"];

    needs:
        ScientificProtocolCompositionProfile["needs"];

}


export interface ScientificCompositionEnvelopeBoundaryCandidateEvaluation {

    candidateId:
        string;

    assessmentId:
        string;

    status:
        ScientificCompositionCandidateBoundaryEvaluationStatus;

    observationIds:
        string[];

    evidenceIds:
        string[];

}


export type ScientificCompositionEnvelopeBoundaryEvidenceStatus =
    | "PRESERVED_IN_CANDIDATE_EVIDENCE"
    | "VIOLATED_IN_CANDIDATE_EVIDENCE"
    | "UNEVALUATED_IN_CANDIDATE_EVIDENCE";


export interface ScientificCompositionEnvelopeBoundaryRegion {

    boundaryId:
        string;

    participantId:
        string;

    candidateIds:
        string[];

    candidateEvaluations:
        ScientificCompositionEnvelopeBoundaryCandidateEvaluation[];

    /*
     * This status aggregates only candidate-scoped evidence.
     *
     * PRESERVED here does NOT mean simultaneous N-protocol
     * preservation. That requires a later global/harmony layer.
     */
    candidateEvidenceStatus:
        ScientificCompositionEnvelopeBoundaryEvidenceStatus;

    evidenceIds:
        string[];

}


export type ScientificCompositionEnvelopeBoundaryCoverage =
    | "NO_KNOWN_BOUNDARIES"
    | "KNOWN_BOUNDARIES_PRESENT";


export interface ScientificCompositionEnvelopeRelation {

    candidateId:
        string;

    candidateKind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    discoveryEvidenceIds:
        string[];

    compatibilityAssessmentId:
        string;

    boundaryIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    compatibilityPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

    boundaryCoverage:
        ScientificCompositionEnvelopeBoundaryCoverage;

    functionalNeedId?:
        string;

    functionalContributionId?:
        string;

    documentaryRelation?:
        ScientificProtocolRelationKind;

    evaluationStatus:
        "EVALUATED";

}


export interface ScientificCompositionEnvelopeStatistics {

    participants:
        number;

    relations:
        number;

    contributions:
        number;

    knownBoundaries:
        number;

    needs:
        number;

    unresolvedNeeds:
        number;

    preservedBoundaryRegions:
        number;

    violatedBoundaryRegions:
        number;

    unevaluatedBoundaryRegions:
        number;

    supportedRelations:
        number;

    challengedRelations:
        number;

    inconclusiveRelations:
        number;

    relationsWithoutKnownBoundaries:
        number;

}


export interface ScientificCompositionEnvelope {

    envelopeId:
        string;

    setId:
        string;

    candidateGraphId:
        string;

    candidateEvaluationGraphId:
        string;

    objectiveId:
        string;

    participants:
        ScientificCompositionEnvelopeParticipant[];

    participantIds:
        string[];

    relations:
        ScientificCompositionEnvelopeRelation[];

    boundaryRegions:
        ScientificCompositionEnvelopeBoundaryRegion[];

    unresolvedNeedIds:
        string[];

    statistics:
        ScientificCompositionEnvelopeStatistics;

    /*
     * ASSEMBLED means only that the evidence envelope has been
     * constructed consistently.
     *
     * It is deliberately not a harmony or composition verdict.
     */
    assemblyStatus:
        "ASSEMBLED";

}


export interface ScientificCompositionEnvelopeResult {

    envelopes:
        ScientificCompositionEnvelope[];

    isolatedParticipantIds:
        string[];

    errors:
        string[];

}