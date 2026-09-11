import type {
    ScientificDiscoveryResult
} from "../scientific-discovery/ScientificDiscoveryResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

export class DiscoveryCritiqueEngine {

    build(
        discoveries:
            ScientificDiscoveryResult,

        startIndex = 0
    ): ScientificCritique[] {

        const critiques:
            ScientificCritique[] = [];

        let counter =
            startIndex + 1;

        for (
            const discovery
            of discoveries.discoveries ?? []
        ) {

            const evidence:
                string[] = [];

            let penalty = 0;

            let critiqueType:
                ScientificCritique["critiqueType"] | null =
                    null;

            /*
             * ==================================================
             * 1. LOW DISCOVERY CONFIDENCE
             * ==================================================
             */

            if (
                discovery.confidence < 40
            ) {

                critiqueType =
                    "DISCOVERY_FALSE_POSITIVE_RISK";

                penalty +=
                    Math.min(
                        45,
                        40 -
                        discovery.confidence +
                        15
                    );

                evidence.push(
                    `Discovery confidence is only ${discovery.confidence}.`
                );

            }

            /*
             * ==================================================
             * 2. LIMITED GRAPH EVIDENCE
             * ==================================================
             */

            const edgeCount =
                discovery.relatedEdges?.length ??
                0;

            const nodeCount =
                discovery.relatedNodes?.length ??
                0;

            if (
                edgeCount < 2
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "INSUFFICIENT_DISCOVERY_EVIDENCE";

                }

                penalty += 20;

                evidence.push(
                    `The discovery is supported by only ${edgeCount} related graph edge(s).`
                );

            }

            if (
                nodeCount === 0
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "INSUFFICIENT_DISCOVERY_EVIDENCE";

                }

                penalty += 25;

                evidence.push(
                    "The discovery does not reference any related graph node."
                );

            }

            /*
             * ==================================================
             * 3. IMPORTANCE / CONFIDENCE MISMATCH
             * ==================================================
             */

            if (
                discovery.importance === "HIGH" &&
                discovery.confidence < 70
            ) {

                critiqueType =
                    "DISCOVERY_FALSE_POSITIVE_RISK";

                penalty += 20;

                evidence.push(
                    `The discovery is classified as HIGH importance but confidence is only ${discovery.confidence}.`
                );

            }

            /*
             * ==================================================
             * 4. TYPE-SPECIFIC SCIENTIFIC CHECKS
             * ==================================================
             */

            if (
                discovery.discoveryType ===
                    "COMPOSITION_PATH" &&
                edgeCount < 2
            ) {

                critiqueType =
                    "INSUFFICIENT_DISCOVERY_EVIDENCE";

                penalty += 20;

                evidence.push(
                    "A composition path requires sufficient graph connectivity to support the proposed multi-step relation."
                );

            }

            if (
                discovery.discoveryType ===
                    "BRIDGE_NODE" &&
                edgeCount < 2
            ) {

                critiqueType =
                    "DISCOVERY_FALSE_POSITIVE_RISK";

                penalty += 20;

                evidence.push(
                    "A bridge-node classification based on fewer than two graph edges may represent a structural false positive."
                );

            }

            if (
                discovery.discoveryType ===
                    "CENTRAL_CAPABILITY" &&
                edgeCount < 4
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "INSUFFICIENT_DISCOVERY_EVIDENCE";

                }

                penalty += 15;

                evidence.push(
                    `A central capability classification is supported by only ${edgeCount} graph connection(s).`
                );

            }

            /*
             * Strong discoveries are not criticised merely
             * for existing.
             */

            if (!critiqueType) {
                continue;
            }

            const robustnessScore =
                this.clamp(
                    100 - penalty
                );

            critiques.push({

                critiqueId:
                    `SCIENTIFIC-CRITIQUE-${String(
                        counter++
                    ).padStart(5, "0")}`,

                targetId:
                    discovery.discoveryId,

                    targetEvidenceIds: [],

                targetType:
                    "DISCOVERY",

                statement:
                    discovery.statement,

                severity:
                    this.severityFor(
                        robustnessScore
                    ),

                critiqueType,

                evidence,

                robustnessScore,

                falsificationRisk:
                    this.riskFor(
                        robustnessScore
                    ),

                recommendation:
                    this.recommendationFor(
                        critiqueType
                    ),

                explanation:
                    `Scientific discovery ${discovery.discoveryId} ` +
                    `was evaluated as type ${discovery.discoveryType}. ` +
                    `Confidence: ${discovery.confidence}. ` +
                    `Importance: ${discovery.importance}. ` +
                    `Related nodes: ${nodeCount}. ` +
                    `Related edges: ${edgeCount}.`

            });

        }

        return critiques;

    }

    private severityFor(
        robustnessScore:
            number
    ): ScientificCritique["severity"] {

        if (
            robustnessScore < 30
        ) {
            return "CRITICAL";
        }

        if (
            robustnessScore < 50
        ) {
            return "HIGH";
        }

        if (
            robustnessScore < 75
        ) {
            return "MEDIUM";
        }

        return "LOW";

    }

    private riskFor(
        robustnessScore:
            number
    ): ScientificCritique["falsificationRisk"] {

        if (
            robustnessScore < 30
        ) {
            return "VERY_HIGH";
        }

        if (
            robustnessScore < 50
        ) {
            return "HIGH";
        }

        if (
            robustnessScore < 75
        ) {
            return "MODERATE";
        }

        return "LOW";

    }

    private recommendationFor(
        critiqueType:
            ScientificCritique["critiqueType"]
    ): string {

        switch (
            critiqueType
        ) {

            case "DISCOVERY_FALSE_POSITIVE_RISK":

                return (
                    "Attempt to falsify this discovery using independent graph paths, " +
                    "alternative source subsets, and adversarial composition analysis."
                );

            case "INSUFFICIENT_DISCOVERY_EVIDENCE":

                return (
                    "Collect additional independent graph evidence before treating " +
                    "this discovery as scientifically established."
                );

            default:

                return (
                    "Re-evaluate this discovery using additional independent " +
                    "evidence and alternative graph configurations."
                );

        }

    }

    private clamp(
        value:
            number
    ): number {

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    value
                )
            )
        );

    }

}