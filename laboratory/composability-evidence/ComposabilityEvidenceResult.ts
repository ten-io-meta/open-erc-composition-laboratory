import type { ComposabilityEvidenceClaim } from "./ComposabilityEvidenceClaim.js";

export interface ComposabilityEvidenceResult {

    sourceId: string;

    generatedAt: string;

    claims: ComposabilityEvidenceClaim[];

    errors: string[];

}