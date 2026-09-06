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
        const getMatrixMatch = (
            claim: ComposabilityEvidenceClaim
        ): any | undefined => {
            return matrix.find((entry: any) =>
                this.hasClaimSpecificIdentity(
                    claim,
                    entry
                )
            );
        };

        const getRelationshipEvidence = (
            claim: ComposabilityEvidenceClaim
        ): boolean => {
            return patterns.some((entry: any) =>
                this.hasClaimSpecificIdentity(
                    claim,
                    entry
                )
            );
        };

        return claims.map(claim => {
            const matrixMatch =
                getMatrixMatch(claim);

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

            const emergentPatternSupport =
                getRelationshipEvidence(claim)
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
                    ...(matrixMatch
                        ? [
                            `matrix:${matrixMatch.protocolA}+${matrixMatch.protocolB}`
                        ]
                        : []),
                    ...(emergentPatternSupport > 0
                        ? ["emergent-patterns"]
                        : [])
                ],
                experimentalSupport,
                statisticalSupport,
                emergentPatternSupport,
                overallConfidence,
                status
            };
        });
    }

    private hasClaimSpecificIdentity(
        claim: ComposabilityEvidenceClaim,
        evidence: any
    ): boolean {
        if (!evidence) {
            return false;
        }

        if (
            evidence.claimId &&
            String(evidence.claimId) === claim.claimId
        ) {
            return true;
        }

        if (
            !evidence.protocolA ||
            !evidence.protocolB ||
            !evidence.capabilityA ||
            !evidence.capabilityB ||
            !evidence.relation
        ) {
            return false;
        }

        const protocolAMatches =
            this.registry.normalize(
                String(evidence.protocolA)
            ) ===
            this.registry.normalize(
                claim.protocolA
            );

        const protocolBMatches =
            this.registry.normalize(
                String(evidence.protocolB)
            ) ===
            this.registry.normalize(
                claim.protocolB
            );

        const capabilityAMatches =
            this.normalizeIdentity(
                evidence.capabilityA
            ) ===
            this.normalizeIdentity(
                claim.capabilityA
            );

        const capabilityBMatches =
            this.normalizeIdentity(
                evidence.capabilityB
            ) ===
            this.normalizeIdentity(
                claim.capabilityB
            );

        const relationMatches =
            this.normalizeIdentity(
                evidence.relation
            ) ===
            this.normalizeIdentity(
                claim.relation
            );

        return (
            protocolAMatches &&
            protocolBMatches &&
            capabilityAMatches &&
            capabilityBMatches &&
            relationMatches
        );
    }

    private normalizeIdentity(
        value: unknown
    ): string {
        return String(value ?? "")
            .trim()
            .toUpperCase();
    }
}