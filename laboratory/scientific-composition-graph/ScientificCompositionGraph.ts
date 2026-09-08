import type {
    ScientificCompositionCompatibilityPolarity
} from "../scientific-composition-compatibility/ScientificCompositionCompatibilityAssessment.js";

import type {
    ScientificCompositionObjectiveCoverage
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityMatch.js";


export interface ScientificCompositionGraphNode {

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


export interface ScientificCompositionGraphEdge {

    edgeId:
        string;

    matchId:
        string;

    consumerParticipantId:
        string;

    providerParticipantId:
        string;

    needId:
        string;

    contributionId:
        string;

    compatibilityAssessmentId:
        string;

    compatibilityPolarity:
        ScientificCompositionCompatibilityPolarity;

    boundaryIds:
        string[];

    evidenceIds:
        string[];

}


export interface ScientificCompositionGraphStatistics {

    nodes:
        number;

    edges:
        number;

    supportedEdges:
        number;

    challengedEdges:
        number;

    inconclusiveEdges:
        number;

    unresolvedNeeds:
        number;

    unresolvedObjectiveSubjects:
        number;

}


export type ScientificCompositionGraphPolarity =
    | "CHALLENGE"
    | "INCONCLUSIVE";


export interface ScientificCompositionGraph {

    graphId:
        string;

    objectiveId:
        string;

    nodes:
        ScientificCompositionGraphNode[];

    edges:
        ScientificCompositionGraphEdge[];

    unresolvedNeedIds:
        string[];

    objectiveCoverage:
        ScientificCompositionObjectiveCoverage[];

    statistics:
        ScientificCompositionGraphStatistics;

    /*
     * This graph summarizes edge-level evidence.
     *
     * SUPPORT is intentionally not available globally yet:
     * independently supported edges do not establish that the
     * entire N-participant composition preserves all boundaries
     * simultaneously.
     */
    scientificPolarity:
        ScientificCompositionGraphPolarity;

}


export interface ScientificCompositionGraphResult {

    graph:
        ScientificCompositionGraph | null;

    errors:
        string[];

}
