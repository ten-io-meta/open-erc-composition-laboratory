export type ScientificReferentialIntegrityStatus =
    | "VALID"
    | "BROKEN_CONCLUSION_REFERENCE"
    | "BROKEN_PATTERN_REFERENCE"
    | "CONCLUSION_PATTERN_MISMATCH"
    | "RELATION_MISMATCH"
    | "ORIGIN_TARGET_MISMATCH"
    | "DUPLICATE_ORIGIN";

export interface ScientificReferentialIntegrity {

    integrityId: string;

    knowledgeId: string;

    sourceConclusionId: string;

    sourcePatternId: string;

    sourcePatternRelation: string;

    originTargetId: string;

    status:
        ScientificReferentialIntegrityStatus;

    valid: boolean;

    issues: string[];

    explanation: string;
}