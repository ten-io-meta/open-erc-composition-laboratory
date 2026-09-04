export interface ScientificValidation {

    validationId: string;

    theoryId: string;

    theoryTitle: string;

    sourcePatternRelation: string;

    theoryConfidence: number;

    supportingEvidence: number;

    supportingEvidenceIds: string[];

    contradictoryEvidence: number;

    contradictoryEvidenceIds: string[];

    independentSources: number;

    validationScore: number;

    status:
        | "VALIDATED"
        | "CHALLENGED"
        | "REJECTED"
        | "INCONCLUSIVE";

    challenges: string[];

    explanation: string;

}