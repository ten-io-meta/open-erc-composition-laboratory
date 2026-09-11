import type {
    ScientificCompositionCandidateBlockedEvidenceRequirement,
    ScientificCompositionCandidateEvidenceSpecification
} from "./ScientificCompositionCandidateEvidenceSpecification.js";


export interface ScientificCompositionCandidateEvidenceSpecificationStatistics {

    plans:
        number;

    specifications:
        number;

    blockedRequirements:
        number;

    boundaryEvidenceAcquisitionSpecifications:
        number;

    candidateBoundaryObservationSpecifications:
        number;

}


export interface ScientificCompositionCandidateEvidenceSpecificationResult {

    specifications:
        ScientificCompositionCandidateEvidenceSpecification[];

    blockedRequirements:
        ScientificCompositionCandidateBlockedEvidenceRequirement[];

    statistics:
        ScientificCompositionCandidateEvidenceSpecificationStatistics;

    errors:
        string[];

}