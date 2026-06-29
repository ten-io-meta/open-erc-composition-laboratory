import type { EvidenceQuality } from "./EvidenceQuality.js";

export interface EvidenceAssessment {

    sourceId: string;

    quality: EvidenceQuality;

    confidence: number;

    reproducible: boolean;

    hasImplementation: boolean;

    hasTests: boolean;

    hasFormalInvariants: boolean;

    peerReviewed: boolean;

    observations: string[];

}