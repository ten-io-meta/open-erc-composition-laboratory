export type ScientificKnowledgeEvidenceMatchStatus =
    | "MATCHED"
    | "AMBIGUOUS"
    | "UNMATCHED";

export interface ScientificKnowledgeEvidenceMatch {

    matchId: string;

    campaignId: string;

    feedbackId: string;

    sourceConclusionId?: string;

    evidenceId: string;

    experimentId: string;

    sourceIds: string[];

    targetEvidenceIds: string[];

    executionPlanId: string;

    executionTaskId: string;

       stepId: string;

    /*
     * Concrete repository associated with the runtime
     * execution from which this evidence match originated,
     * when one repository was operationally resolved.
     *
     * This preserves execution provenance only. It must not
     * by itself be interpreted as an independent scientific
     * source or as increased confidence.
     */
    repository:
        string | null;

    feedbackAction:
        | "STRENGTHEN"
        | "CHALLENGE"
        | "HOLD";

    matchStatus:
        ScientificKnowledgeEvidenceMatchStatus;

    knowledgeId:
        string | null;

    candidateKnowledgeIds:
        string[];

    matchMethod:
        | "SOURCE_CONCLUSION_ID"
        | "THEORY_PROVENANCE"
        | "EXPLICIT_KNOWLEDGE_ID"
        | "EXACT_CANONICAL_STATEMENT"
        | "NONE";

    statement: string;

    generatedAt: string;

    explanation: string;

}