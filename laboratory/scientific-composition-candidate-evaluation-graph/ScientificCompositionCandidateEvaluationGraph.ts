import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionCandidateCompatibilityPolarity
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


export interface ScientificCompositionCandidateEvaluationGraphNode {

    participantId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


interface ScientificCompositionCandidateEvaluationGraphEdgeBase {

    edgeId:
        string;

    candidateGraphEdgeId:
        string;

    candidateId:
        string;

    kind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    /*
     * Evidence which opened the composition candidate.
     *
     * It is deliberately kept separate from compatibility
     * evidence so documentary discovery cannot silently become
     * evidence that boundaries were preserved.
     */
    discoveryEvidenceIds:
        string[];

    compatibilityAssessmentId:
        string;

    compatibilityAssessmentBasis:
        "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS";

    boundaryIds:
        string[];

    compatibilityEvidenceIds:
        string[];

    compatibilityPolarity:
        ScientificCompositionCandidateCompatibilityPolarity;

    /*
     * EVALUATED means only that the candidate has passed through
     * the candidate-boundary compatibility evaluator.
     *
     * INCONCLUSIVE remains a valid evaluated result.
     */
    evaluationStatus:
        "EVALUATED";

}


export interface ScientificFunctionalCandidateEvaluationGraphEdge
    extends ScientificCompositionCandidateEvaluationGraphEdgeBase {

    kind:
        "FUNCTIONAL_COMPLEMENTARITY";

    functionalMatchId:
        string;

    needId:
        string;

    contributionId:
        string;

    contributionKind:
        ScientificCompositionContribution["kind"];

}


export interface ScientificDocumentaryCandidateEvaluationGraphEdge
    extends ScientificCompositionCandidateEvaluationGraphEdgeBase {

    kind:
        "DOCUMENTARY_COMPOSITION";

    documentaryCandidateId:
        string;

    relation:
        ScientificProtocolRelationKind;

}


export type ScientificCompositionCandidateEvaluationGraphEdge =
    | ScientificFunctionalCandidateEvaluationGraphEdge
    | ScientificDocumentaryCandidateEvaluationGraphEdge;


export interface ScientificCompositionCandidateEvaluationGraphStatistics {

    nodes:
        number;

    evaluatedCandidateEdges:
        number;

    supportedCandidateEdges:
        number;

    challengedCandidateEdges:
        number;

    inconclusiveCandidateEdges:
        number;

    functionalCandidateEdges:
        number;

    documentaryCandidateEdges:
        number;

}


export interface ScientificCompositionCandidateEvaluationGraph {

    graphId:
        string;

    candidateGraphId:
        string;

    objectiveId:
        string;

    nodes:
        ScientificCompositionCandidateEvaluationGraphNode[];

    edges:
        ScientificCompositionCandidateEvaluationGraphEdge[];

    statistics:
        ScientificCompositionCandidateEvaluationGraphStatistics;

    /*
     * There is intentionally no graph-wide SUPPORT polarity here.
     *
     * Candidate-level boundary preservation is not equivalent to
     * simultaneous N-protocol composition.
     */

}


export interface ScientificCompositionCandidateEvaluationGraphResult {

    graph:
        ScientificCompositionCandidateEvaluationGraph | null;

    errors:
        string[];

}