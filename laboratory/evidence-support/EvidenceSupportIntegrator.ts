import type { ComposabilityEvidenceClaim } from "../composability-evidence/ComposabilityEvidenceClaim.js";

import { ProtocolRegistry } from "../normalization/ProtocolRegistry.js";

export class EvidenceSupportIntegrator {

    private readonly registry = new ProtocolRegistry();

    integrate(
        claims: ComposabilityEvidenceClaim[],
        benchmark: any,
        matrix: any[],
        patterns: any[]
    ): ComposabilityEvidenceClaim[] {

        const getMatrixMatch = (claim: ComposabilityEvidenceClaim): any | undefined => {
            return matrix.find((entry: any) =>
                this.registry.samePair(
                    claim.protocolA,
                    claim.protocolB,
                    entry.protocolA,
                    entry.protocolB
                )
            );
        };

        const getRelationshipEvidence = (claim: ComposabilityEvidenceClaim): boolean => {
            const protocolA = this.registry.normalize(claim.protocolA);
            const protocolB = this.registry.normalize(claim.protocolB);

            const pairTextA = `${protocolA} + ${protocolB}`;
            const pairTextB = `${protocolB} + ${protocolA}`;

            const raw = JSON.stringify(patterns);

            return raw.includes(pairTextA) ||
                raw.includes(pairTextB) ||
                raw.includes(claim.capabilityA) ||
                raw.includes(claim.capabilityB);
        };

        return claims.map(claim => {

            const matrixMatch = getMatrixMatch(claim);

            const experimentalSupport = matrixMatch
                ? Math.round(
                    (
                        (matrixMatch.successfulCompositions ?? 0) /
                        Math.max(matrixMatch.evidence ?? 1, 1)
                    ) * 100
                )
                : 0;

            const statisticalSupport = matrixMatch
                ? Math.round(
                    (
                        (matrixMatch.compatibility ?? 0) +
                        (matrixMatch.safetyScore ?? 0) +
                        (matrixMatch.stabilityScore ?? 0)
                    ) / 3
                )
                : 0;

            const emergentPatternSupport = getRelationshipEvidence(claim)
                ? 75
                : 0;

            const overallConfidence = Math.round(
                claim.semanticConfidence * 0.35 +
                experimentalSupport * 0.25 +
                statisticalSupport * 0.25 +
                emergentPatternSupport * 0.15
            );

            const status =
                overallConfidence >= 80
                    ? "SUPPORTED"
                    : overallConfidence >= 50
                        ? "CANDIDATE"
                        : "INCONCLUSIVE";

            return {
                ...claim,
                evidence: [
                    ...claim.evidence,
                    ...(matrixMatch ? [`matrix:${matrixMatch.protocolA}+${matrixMatch.protocolB}`] : []),
                    ...(emergentPatternSupport > 0 ? ["emergent-patterns"] : [])
                ],
                experimentalSupport,
                statisticalSupport,
                emergentPatternSupport,
                overallConfidence,
                status
            };

        });

    }

}