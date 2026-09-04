import type { ProtocolSemanticResult } from "../protocol-semantics/ProtocolSemanticResult.js";
import type { SemanticReasoningResult } from "../reasoning/SemanticReasoningResult.js";
import type { ComposabilityEvidenceClaim } from "./ComposabilityEvidenceClaim.js";
import type { ComposabilityEvidenceResult } from "./ComposabilityEvidenceResult.js";

export class ComposabilityEvidenceEngine {

    build(
        semantics: ProtocolSemanticResult,
        reasoning: SemanticReasoningResult,
        extraction?: any
    ): ComposabilityEvidenceResult {

        try {

            const claims: ComposabilityEvidenceClaim[] = [];

            let counter = 1;

            const protocolByCapability = new Map<string, string[]>();

            for (const semantic of semantics.semantics) {
                for (const capability of semantic.capabilities) {
                    const protocols = protocolByCapability.get(capability) ?? [];
                    protocols.push(semantic.protocolId);
                    protocolByCapability.set(capability, protocols);
                }
            }

            for (const relation of reasoning.relations) {

                const protocolsA = protocolByCapability.get(relation.fromCapability) ?? [];
                const protocolsB = protocolByCapability.get(relation.toCapability) ?? [];

                for (const protocolA of protocolsA) {
                    for (const protocolB of protocolsB) {

                        if (protocolA === protocolB) {
                            continue;
                        }

                        claims.push(
                            this.createClaim(
                                counter,
                                protocolA,
                                protocolB,
                                relation.fromCapability,
                                relation.toCapability,
                                relation.relation,
                                relation.reason,
                                relation.evidence,
                                relation.confidence
                            )
                        );

                        counter++;

                    }
                }
            }

            const structuredClaims = this.extractStructuredClaims(
                extraction,
                semantics,
                counter
            );

            claims.push(...structuredClaims);

            return {
                sourceId: reasoning.sourceId,
                generatedAt: new Date().toISOString(),
                claims,
                errors: []
            };

        } catch (error) {

            return {
                sourceId: reasoning.sourceId,
                generatedAt: new Date().toISOString(),
                claims: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown composability evidence error"
                ]
            };

        }

    }

    private extractStructuredClaims(
        extraction: any,
        semantics: ProtocolSemanticResult,
        startCounter: number
    ): ComposabilityEvidenceClaim[] {

        if (!extraction?.claims) {
            return [];
        }

        const supportedRelations = [
            "ENABLES",
            "CONSTRAINS",
            "SUPPORTS",
            "BOUNDS",
            "REQUIRES",
            "VALIDATES",
            "INDICATES"
        ];

        const claims: ComposabilityEvidenceClaim[] = [];

        let counter = startCounter;

        for (const claim of extraction.claims) {

            const text = typeof claim === "string"
                ? claim
                : claim.text ?? "";

            const cleanText = text.replace(/\.$/, "").trim();

            const matchedRelation = supportedRelations.find(relation =>
                cleanText.includes(` ${relation} `)
            );

            if (!matchedRelation) {
                continue;
            }

            const [capabilityA, capabilityB] = cleanText
                .split(` ${matchedRelation} `)
                .map((part: string) => part.trim());

            if (!capabilityA || !capabilityB) {
                continue;
            }

            const protocolA = semantics.semantics.find(
                semantic =>
                    semantic.capabilities.includes(capabilityA)
            )?.protocolId;

            const protocolB = semantics.semantics.find(
                semantic =>
                    semantic.capabilities.includes(capabilityB)
            )?.protocolId;

            if (!protocolA || !protocolB || protocolA === protocolB) {
                continue;
            }

            claims.push(
                this.createClaim(
                    counter,
                    protocolA,
                    protocolB,
                    capabilityA,
                    capabilityB,
                    matchedRelation,
                    `Structured claim extracted from source: ${cleanText}`,
                    [`claim:${cleanText}`],
                    70
                )
            );

            counter++;

        }

        return claims;

    }

    private createClaim(
        counter: number,
        protocolA: string,
        protocolB: string,
        capabilityA: string,
        capabilityB: string,
        relation: string,
        reason: string,
        evidence: string[],
        semanticConfidence: number
    ): ComposabilityEvidenceClaim {

        const experimentalSupport = 0;
        const statisticalSupport = 0;
        const emergentPatternSupport = 0;

        const overallConfidence = Math.round(
            semanticConfidence * 0.6 +
            experimentalSupport * 0.2 +
            statisticalSupport * 0.1 +
            emergentPatternSupport * 0.1
        );

        const status =
            overallConfidence >= 80
                ? "SUPPORTED"
                : overallConfidence >= 50
                    ? "CANDIDATE"
                    : "INCONCLUSIVE";

        return {
            claimId: `COMP-EVIDENCE-${String(counter).padStart(5, "0")}`,
            protocolA,
            protocolB,
            capabilityA,
            capabilityB,
            relation,
            reason,
            evidence,
            semanticConfidence,
            experimentalSupport,
            statisticalSupport,
            emergentPatternSupport,
            overallConfidence,
            status
        };

    }

}