export interface CompositionHypothesis {
    hypothesisId: string;
    title: string;
    confidence: number;
    evidence: number;
    description: string;
    recommendation: string;
    falsifiable: boolean;
    validationTarget: string;
    supportingEvidence: string[];
}
