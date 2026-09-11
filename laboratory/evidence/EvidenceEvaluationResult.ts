import type { EvidenceAssessment } from "./EvidenceAssessment.js";

export interface EvidenceEvaluationResult {

    evaluatedAt: string;

    sourceId: string;

    assessment: EvidenceAssessment;

    errors: string[];

}