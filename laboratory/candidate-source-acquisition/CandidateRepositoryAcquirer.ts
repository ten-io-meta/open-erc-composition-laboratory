import type {
    CandidateSourceAcquisition
} from "./CandidateSourceAcquisitionResult.js";

export interface CandidateRepositoryAcquirer {

    acquire(
        repository: string
    ): Promise<CandidateSourceAcquisition>;
}