import type { ComposabilityEvidenceClaim } from "../composability-evidence/ComposabilityEvidenceClaim.js";

export interface EvidenceSupportResult {
    generatedAt: string;
    claims: ComposabilityEvidenceClaim[];
    errors: string[];
}