import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";


export type ScientificCompositionComplementarityEvidenceBasis =
    "EXACT_NORMALIZED_SUBJECT_MATCH";


export interface ScientificCompositionComplementarityMatch {

    matchId:
        string;

    consumerParticipantId:
        string;

    providerParticipantId:
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
        ScientificCompositionComplementarityEvidenceBasis;

    evidenceIds:
        string[];

    /*
     * A match only identifies a possible functional complement.
     * Boundary compatibility has not yet been evaluated.
     */
    evaluationStatus:
        "UNEVALUATED";

}


export interface ScientificCompositionObjectiveCoverage {

    requiredSubject:
        string;

    status:
        | "COVERED"
        | "UNRESOLVED";

    providerParticipantIds:
        string[];

    contributionIds:
        string[];

}
