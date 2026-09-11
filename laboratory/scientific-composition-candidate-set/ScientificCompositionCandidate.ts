import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificCompositionProvenance
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";


export type ScientificCompositionCandidateKind =
    | "FUNCTIONAL_COMPLEMENTARITY"
    | "DOCUMENTARY_COMPOSITION"
    | "STRUCTURAL_FOUNDATION";


interface ScientificCompositionCandidateBase {

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
     * Candidate discovery alone establishes no compatibility,
     * runtime interaction, polarity, confidence or composition.
     */
    evaluationStatus:
        "UNEVALUATED";

}


export interface ScientificFunctionalCompositionCandidate
    extends ScientificCompositionCandidateBase {

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

    evidenceBasis:
        "EXACT_NORMALIZED_SUBJECT_MATCH";

}


export interface ScientificDocumentaryCompositionCandidateRecord
    extends ScientificCompositionCandidateBase {

    kind:
        "DOCUMENTARY_COMPOSITION";

    documentaryCandidateId:
        string;

    relation:
        ScientificProtocolRelationKind;

}


export interface ScientificStructuralFoundationCompositionCandidateRecord
    extends ScientificCompositionCandidateBase {

    kind:
        "STRUCTURAL_FOUNDATION";

    structuralFoundationCandidateId:
        string;

    sourceCrossProtocolCandidateId:
        string;

    /*
     * sourceParticipantId / targetParticipantId are canonical
     * storage order only for this candidate kind.
     *
     * They do not represent semantic direction.
     */
    directionality:
        "UNDIRECTED";

    foundationProtocolId:
        string;

    provenance:
        ScientificCompositionProvenance[];

}


export type ScientificCompositionCandidate =
    | ScientificFunctionalCompositionCandidate
    | ScientificDocumentaryCompositionCandidateRecord
    | ScientificStructuralFoundationCompositionCandidateRecord;