import type { ProtocolSemanticResult } from "../protocol-semantics/ProtocolSemanticResult.js";
import type { SemanticReasoningResult } from "../reasoning/SemanticReasoningResult.js";
import type { ComposabilityEvidenceClaim } from "./ComposabilityEvidenceClaim.js";
import type { ComposabilityEvidenceResult } from "./ComposabilityEvidenceResult.js";

export class ComposabilityEvidenceEngine {

    build(
        semantics: ProtocolSemanticResult,
        reasoning: SemanticReasoningResult
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

                        const semanticConfidence = relation.confidence;

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

                        claims.push({
                            claimId: `COMP-EVIDENCE-${String(counter).padStart(5, "0")}`,
                            protocolA,
                            protocolB,
                            capabilityA: relation.fromCapability,
                            capabilityB: relation.toCapability,
                            relation: relation.relation,
                            reason: relation.reason,
                            evidence: relation.evidence,
                            semanticConfidence,
                            experimentalSupport,
                            statisticalSupport,
                            emergentPatternSupport,
                            overallConfidence,
                            status
                        });

                        counter++;

                    }

                }

            }

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

}