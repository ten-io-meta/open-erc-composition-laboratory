import type {
    ScientificCompositionCandidateKind
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


export interface ScientificCompositionCandidateGraphNode {

    participantId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


interface ScientificCompositionCandidateGraphEdgeBase {

    edgeId:
        string;

    candidateId:
        string;

    kind:
        ScientificCompositionCandidateKind;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    evidenceIds:
        string[];

    /*
     * Candidate graph edges are discovery topology only.
     *
     * They do not establish:
     * - compatibility,
     * - runtime interaction,
     * - scientific polarity,
     * - successful composition.
     */
    evaluationStatus:
        "UNEVALUATED";

}


export interface ScientificFunctionalCompositionCandidateGraphEdge
    extends ScientificCompositionCandidateGraphEdgeBase {

    kind:
        "FUNCTIONAL_COMPLEMENTARITY";

    functionalMatchId:
        string;

    needId:
        string;

    needSubject:
        string;

    contributionId:
        string;

    contributionKind:
        ScientificCompositionContribution["kind"];

    contributionSubject:
        string;

}


export interface ScientificDocumentaryCompositionCandidateGraphEdge
    extends ScientificCompositionCandidateGraphEdgeBase {

    kind:
        "DOCUMENTARY_COMPOSITION";

    documentaryCandidateId:
        string;

    relation:
        ScientificProtocolRelationKind;

}


export type ScientificCompositionCandidateGraphEdge =
    | ScientificFunctionalCompositionCandidateGraphEdge
    | ScientificDocumentaryCompositionCandidateGraphEdge;


export interface ScientificCompositionCandidateGraphStatistics {

    nodes:
        number;

    candidateEdges:
        number;

    functionalCandidateEdges:
        number;

    documentaryCandidateEdges:
        number;

}


export interface ScientificCompositionCandidateGraph {

    graphId:
        string;

    objectiveId:
        string;

    nodes:
        ScientificCompositionCandidateGraphNode[];

    edges:
        ScientificCompositionCandidateGraphEdge[];

    statistics:
        ScientificCompositionCandidateGraphStatistics;

}


export interface ScientificCompositionCandidateGraphResult {

    graph:
        ScientificCompositionCandidateGraph | null;

    errors:
        string[];

}