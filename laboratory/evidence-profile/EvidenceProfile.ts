export interface EvidenceProfile {

    sourceId: string;

    evidenceType: string;

    quality: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "SUSPICIOUS";

    reproducible: boolean;

    hasImplementation: boolean;

    hasTests: boolean;

    hasInvariants: boolean;

    hasCoverage: boolean;

    hasCitation: boolean;

    confidenceWeight: number;

    observations: string[];

}