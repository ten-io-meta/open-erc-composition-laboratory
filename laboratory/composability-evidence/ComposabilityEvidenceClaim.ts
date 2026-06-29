import type { ComposabilityEvidenceStatus } from "./ComposabilityEvidenceStatus.js";

export interface ComposabilityEvidenceClaim {

    claimId: string;

    protocolA: string;

    protocolB: string;

    capabilityA: string;

    capabilityB: string;

    relation: string;

    reason: string;

    evidence: string[];

    semanticConfidence: number;

    experimentalSupport: number;

    statisticalSupport: number;

    emergentPatternSupport: number;

    overallConfidence: number;

    status: ComposabilityEvidenceStatus;

}