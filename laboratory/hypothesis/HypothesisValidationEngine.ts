import type { HypothesisResult } from "./HypothesisResult.js";
import type { HypothesisValidation } from "./HypothesisValidation.js";
import type { HypothesisValidationResult } from "./HypothesisValidationResult.js";
import type { EvidenceSupportResult } from "../evidence-support/EvidenceSupportResult.js";

/**
 * This V2 "validation" compares against claims from the SAME evidence
 * system that generated the hypotheses. It is a correlation check, NOT an
 * independent validation and NOT a test on the EVM. Its original CONFIRMED
 * branch incorrectly treated high-scoring recycled evidence as a new test.
 */
export class HypothesisValidationEngine {
    validate(
        hypotheses: HypothesisResult,
        evidence: EvidenceSupportResult
    ): HypothesisValidationResult {
        const fail = (error: string): HypothesisValidationResult => ({
            validatedAt: new Date().toISOString(), validations: [], errors: [error]
        });
        if (!hypotheses || !evidence ||
            !Array.isArray(hypotheses.hypotheses) ||
            !Array.isArray(evidence.claims) ||
            !Array.isArray(hypotheses.errors) || !Array.isArray(evidence.errors))
            return fail("INVALID_HYPOTHESIS_VALIDATION_INPUT");
        if (hypotheses.errors.length || evidence.errors.length)
            return fail("UPSTREAM_HYPOTHESIS_OR_EVIDENCE_ERRORS");
        if (hypotheses.hypotheses.length > 10_000 ||
            evidence.claims.length > 20_000)
            return fail("HYPOTHESIS_VALIDATION_INPUT_LIMIT");
        try {
            const seenHypotheses = new Set<string>();
            const validations: HypothesisValidation[] =
                hypotheses.hypotheses.map(hypothesis => {
                    if (!hypothesis ||
                        typeof hypothesis.hypothesisId !== "string" ||
                        !hypothesis.hypothesisId.trim() ||
                        seenHypotheses.has(hypothesis.hypothesisId) ||
                        typeof hypothesis.relation !== "string" ||
                        !hypothesis.relation.trim() ||
                        !Number.isFinite(hypothesis.confidence) ||
                        hypothesis.confidence < 0 || hypothesis.confidence > 100)
                        throw Error("INVALID_OR_DUPLICATE_HYPOTHESIS");
                    seenHypotheses.add(hypothesis.hypothesisId);
                    const matchingClaims = evidence.claims.filter(claim =>
                        claim && typeof claim.capabilityA === "string" &&
                        typeof claim.relation === "string" &&
                        typeof claim.capabilityB === "string" &&
                        `${claim.capabilityA}->${claim.relation}->${claim.capabilityB}` ===
                            hypothesis.relation
                    );
                    const matchedIds = [...new Set(matchingClaims
                        .map(claim => claim.claimId)
                        .filter((id): id is string =>
                            typeof id === "string" && id.trim().length > 0)
                    )].sort();
                    const evidenceMatched = matchedIds.length;
                    // Do not strengthen confidence by reusing the same
                    // originating evidence. No negative result was observed
                    // when there is simply no relation match.
                    const confidenceAfter = hypothesis.confidence;
                    const validationOutcome = evidenceMatched > 0
                        ? "PARTIAL" as const
                        : "UNSUPPORTED" as const;
                    return {
                        hypothesisId: hypothesis.hypothesisId,
                        relation: hypothesis.relation,
                        statusBefore: hypothesis.status,
                        statusAfter: "EMERGING",
                        confidenceBefore: hypothesis.confidence,
                        confidenceAfter,
                        evidenceMatched,
                        validationOutcome,
                        observations: [
                            evidenceMatched > 0
                                ? `Correlated with ${evidenceMatched} previously available unique source claim(s).`
                                : "No matching source claim; this is missing support, not a falsifying experiment.",
                            "No independent holdout, adversarial test or EVM execution verified this hypothesis."
                        ],
                        matchedPriorClaimIds: matchedIds,
                        verificationScope: "PRIOR_SOURCE_CLAIM_CORRELATION_ONLY",
                        independentlyValidated: false,
                        evmExecuted: false,
                        compatibilityVerdict: "NOT_EVALUATED"
                    };
                });
            return {
                validatedAt: new Date().toISOString(),
                validations,
                errors: []
            };
        } catch(error) {
            return fail(error instanceof Error ?
                error.message : "UNKNOWN_HYPOTHESIS_VALIDATION_ERROR");
        }
    }
}
