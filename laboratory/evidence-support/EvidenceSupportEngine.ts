import type { ComposabilityEvidenceClaim } from "../composability-evidence/ComposabilityEvidenceClaim.js";
import type { EvidenceSupportResult } from "./EvidenceSupportResult.js";

import { EvidenceSupportIntegrator } from "./EvidenceSupportIntegrator.js";

export class EvidenceSupportEngine {
    build(
        claims: ComposabilityEvidenceClaim[],
        benchmark: any = {},
        matrix: any[] = [],
        patterns: any[] = []
    ): EvidenceSupportResult {
        try {
            const integrator = new EvidenceSupportIntegrator();

            return {
                generatedAt: new Date().toISOString(),
                claims: integrator.integrate(
                    claims,
                    benchmark,
                    matrix,
                    patterns
                ),
                errors: []
            };
        } catch (error) {
            return {
                generatedAt: new Date().toISOString(),
                claims: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown evidence support error"
                ]
            };
        }
    }
}