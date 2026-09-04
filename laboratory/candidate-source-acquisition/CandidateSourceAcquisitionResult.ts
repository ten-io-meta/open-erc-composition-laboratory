export type CandidateSourceAcquisitionStatus =
    | "ACQUIRED"
    | "SKIPPED"
    | "REJECTED"
    | "FAILED";

export interface CandidateSourceAcquisition {

    repository: string;

    sourceId: string | null;

    status: CandidateSourceAcquisitionStatus;

    /*
     * Candidate acquisition must never imply
     * scientific source admission.
     */
    enabled: false;

    errors: string[];
}

export interface CandidateSourceAcquisitionResult {

    generatedAt: string;

    candidates: CandidateSourceAcquisition[];

    errors: string[];
}