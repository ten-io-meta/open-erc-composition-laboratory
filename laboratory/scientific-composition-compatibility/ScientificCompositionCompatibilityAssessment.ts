export type ScientificCompositionBoundaryEvaluationStatus =
    | "PRESERVED"
    | "VIOLATED"
    | "UNEVALUATED";


export type ScientificCompositionCompatibilityPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "INCONCLUSIVE";


export interface ScientificCompositionBoundaryEvaluation {

    boundaryId:
        string;

    participantId:
        string;

    status:
        ScientificCompositionBoundaryEvaluationStatus;

    observationIds:
        string[];

    evidenceIds:
        string[];

}


export interface ScientificCompositionCompatibilityStatistics {

    total:
        number;

    preserved:
        number;

    violated:
        number;

    unevaluated:
        number;

}


export interface ScientificCompositionCompatibilityAssessment {

    assessmentId:
        string;

    matchId:
        string;

    consumerParticipantId:
        string;

    providerParticipantId:
        string;

    boundaryEvaluations:
        ScientificCompositionBoundaryEvaluation[];

    statistics:
        ScientificCompositionCompatibilityStatistics;

    scientificPolarity:
        ScientificCompositionCompatibilityPolarity;

}


export interface ScientificCompositionCompatibilityResult {

    assessments:
        ScientificCompositionCompatibilityAssessment[];

    errors:
        string[];

}
