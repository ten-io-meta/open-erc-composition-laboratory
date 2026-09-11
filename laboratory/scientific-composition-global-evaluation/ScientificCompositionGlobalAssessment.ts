export type ScientificCompositionGlobalBoundaryStatus =
    | "PRESERVED"
    | "VIOLATED"
    | "UNEVALUATED";


export type ScientificCompositionGlobalPolarity =
    | "SUPPORT"
    | "CHALLENGE"
    | "INCONCLUSIVE";


export interface ScientificCompositionGlobalBoundaryEvaluation {

    boundaryId:
        string;

    participantId:
        string;

    status:
        ScientificCompositionGlobalBoundaryStatus;

    observationIds:
        string[];

    evidenceIds:
        string[];

}


export interface ScientificCompositionGlobalRunAssessment {

    runId:
        string;

    boundaryEvaluations:
        ScientificCompositionGlobalBoundaryEvaluation[];

    preserved:
        number;

    violated:
        number;

    unevaluated:
        number;

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

}


export interface ScientificCompositionGlobalAssessment {

    assessmentId:
        string;

    graphId:
        string;

    runAssessments:
        ScientificCompositionGlobalRunAssessment[];

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

    supportingRunId?:
        string;

}


export interface ScientificCompositionGlobalEvaluationResult {

    assessment:
        ScientificCompositionGlobalAssessment | null;

    errors:
        string[];

}
