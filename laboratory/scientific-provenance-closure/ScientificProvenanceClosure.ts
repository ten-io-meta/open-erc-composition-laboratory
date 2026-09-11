export type ScientificProvenanceClosureDomain =
    | "KNOWLEDGE"
    | "EXECUTION"
    | "POST_EXECUTION";

export type ScientificProvenanceClosureStatus =
    | "VALID"
    | "CAMPAIGN_MISMATCH"
    | "DOMAIN_ERROR"
    | "INVALID_KNOWLEDGE_INTEGRITY"
    | "INVALID_EXECUTION_INTEGRITY"
    | "INVALID_POST_EXECUTION_INTEGRITY"
    | "MISSING_KNOWLEDGE_COVERAGE"
    | "MISSING_EXECUTION_COVERAGE"
    | "MISSING_POST_EXECUTION_COVERAGE";

export interface ScientificProvenanceClosureIssue {

    status:
        ScientificProvenanceClosureStatus;

    domain:
        ScientificProvenanceClosureDomain;

    message: string;
}
