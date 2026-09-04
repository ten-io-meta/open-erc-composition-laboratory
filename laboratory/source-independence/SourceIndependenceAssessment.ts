export type SourceIndependenceStatus =
    | "INDEPENDENT"
    | "DEPENDENT"
    | "INCONCLUSIVE"
    | "NOT_APPLICABLE";

export type SourceIndependenceReason =
    | "SAME_SOURCE_ID"
    | "SAME_REPOSITORY"
    | "SAME_NORMALIZED_LOCATION"
    | "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE"
    | "INSUFFICIENT_PROVENANCE"
    | "SINGLE_SOURCE";

export interface SourceIndependenceAssessment {

    sourceIds:
        string[];

    status:
        SourceIndependenceStatus;

    reason:
        SourceIndependenceReason;

    /**
     * Number of sources whose scientific independence has been
     * explicitly established by this assessment.
     *
     * This value must never be derived solely from sourceIds.length,
     * repository count, evidence count, experiment count or execution count.
     */
    establishedIndependentSources:
        number;

    /**
     * Human-readable explanation of the assessment.
     */
    explanation:
        string;

}