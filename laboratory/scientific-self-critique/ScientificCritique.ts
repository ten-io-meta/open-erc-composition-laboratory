export interface ScientificCritique {

    critiqueId: string;

    targetId: string;

    targetEvidenceIds: string[];

    targetType:
    | "THEORY"
    | "KNOWLEDGE"
    | "EVIDENCE_HISTORY"
    | "DISCOVERY";
    
    statement: string;

    severity:
        | "CRITICAL"
        | "HIGH"
        | "MEDIUM"
        | "LOW";

    critiqueType:
    | "CONTRADICTORY_EVIDENCE"
    | "INSUFFICIENT_INDEPENDENCE"
    | "LOW_CONFIDENCE"
    | "DECLINING_EVIDENCE"
    | "VOLATILE_EVIDENCE"
    | "WEAK_VALIDATION"
    | "PREMATURE_STABILITY"
    | "STATUS_CONFIDENCE_MISMATCH"
    | "LIMITED_CAMPAIGN_HISTORY"
    | "NO_ADVERSARIAL_VALIDATION"
    | "DISCOVERY_FALSE_POSITIVE_RISK"
    | "INSUFFICIENT_DISCOVERY_EVIDENCE";

    evidence: string[];

    robustnessScore: number;

    falsificationRisk:
        | "VERY_HIGH"
        | "HIGH"
        | "MODERATE"
        | "LOW";

    recommendation: string;

    explanation: string;

}