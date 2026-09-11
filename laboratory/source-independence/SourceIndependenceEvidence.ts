export type SourceIndependenceEvidenceStatus =
    | "INDEPENDENT"
    | "DEPENDENT";

export interface SourceIndependenceEvidence {

    /**
     * First scientific source participating in the
     * independence assessment.
     */
    sourceAId:
        string;

    /**
     * Second scientific source participating in the
     * independence assessment.
     */
    sourceBId:
        string;

    /**
     * Explicit scientific assessment of the relationship
     * between the two sources.
     *
     * This value must not be inferred from source type,
     * repository count, evidence count or execution count.
     */
    status:
        SourceIndependenceEvidenceStatus;

    /**
     * Human-readable scientific basis for the assessment.
     */
    basis:
        string;

    /**
     * Evidence supporting this independence/dependence
     * assessment when available.
     */
    evidenceIds:
        string[];

}