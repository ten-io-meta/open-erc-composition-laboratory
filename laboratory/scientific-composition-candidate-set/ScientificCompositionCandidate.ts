import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificProtocolRelationKind
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";


export type ScientificCompositionCandidateKind =
    | "FUNCTIONAL_COMPLEMENTARITY"
    | "DOCUMENTARY_COMPOSITION";


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
     * runtime interaction, polarity, confidence, or composition.
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


export type ScientificCompositionCandidate =
    | ScientificFunctionalCompositionCandidate
    | ScientificDocumentaryCompositionCandidateRecord;