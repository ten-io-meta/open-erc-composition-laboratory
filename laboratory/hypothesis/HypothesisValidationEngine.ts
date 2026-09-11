import type { HypothesisResult } from "./HypothesisResult.js";
import type { HypothesisValidation } from "./HypothesisValidation.js";
import type { HypothesisValidationResult } from "./HypothesisValidationResult.js";

import type { EvidenceSupportResult } from "../evidence-support/EvidenceSupportResult.js";

export class HypothesisValidationEngine {

    validate(
        hypotheses: HypothesisResult,
        evidence: EvidenceSupportResult
    ): HypothesisValidationResult {

        try {

            const validations: HypothesisValidation[] = hypotheses.hypotheses.map(
                hypothesis => {

                    const matchingClaims = evidence.claims.filter(
                        claim => {
                            const relation =
                                `${claim.capabilityA}->${claim.relation}->${claim.capabilityB}`;

                            return relation === hypothesis.relation;
                        }
                    );

                    const evidenceMatched = matchingClaims.length;

                    const averageEvidenceConfidence =
                        evidenceMatched > 0
                            ? Math.round(
                                matchingClaims.reduce(
                                    (sum, claim) => sum + claim.overallConfidence,
                                    0
                                ) / evidenceMatched
                            )
                            : 0;

                    const confidenceAfter =
                        evidenceMatched > 0
                            ? Math.round(
                                (hypothesis.confidence + averageEvidenceConfidence) / 2
                            )
                            : Math.max(0, hypothesis.confidence - 10);

                    const validationOutcome =
                        evidenceMatched > 0 && averageEvidenceConfidence >= 70
                            ? "CONFIRMED"
                            : evidenceMatched > 0
                                ? "PARTIAL"
                                : "UNSUPPORTED";

                    const statusAfter =
                        validationOutcome === "CONFIRMED" && confidenceAfter >= 80
                            ? "VALIDATED"
                            : validationOutcome === "CONFIRMED"
                                ? "SUPPORTED"
                                : validationOutcome === "PARTIAL"
                                    ? "EMERGING"
                                    : "REJECTED";

                    const observations = [
                        evidenceMatched > 0
                            ? `Matched ${evidenceMatched} evidence claim(s).`
                            : "No supporting evidence claims matched this hypothesis.",
                        `Average evidence confidence: ${averageEvidenceConfidence}%.`
                    ];

                    return {
                        hypothesisId: hypothesis.hypothesisId,
                        relation: hypothesis.relation,
                        statusBefore: hypothesis.status,
                        statusAfter,
                        confidenceBefore: hypothesis.confidence,
                        confidenceAfter,
                        evidenceMatched,
                        validationOutcome,
                        observations
                    };

                }
            );

            return {
                validatedAt: new Date().toISOString(),
                validations,
                errors: []
            };

        } catch (error) {

            return {
                validatedAt: new Date().toISOString(),
                validations: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown hypothesis validation V2 error"
                ]
            };

        }

    }

}