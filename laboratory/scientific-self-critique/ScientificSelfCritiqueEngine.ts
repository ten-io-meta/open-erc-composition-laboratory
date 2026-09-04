import type {
    ScientificDiscoveryResult
} from "../scientific-discovery/ScientificDiscoveryResult.js";

import {
    DiscoveryCritiqueEngine
} from "./DiscoveryCritiqueEngine.js";

import type {
    ScientificValidationResult
} from "../scientific-validation/ScientificValidationResult.js";

import type {
    ContradictionResult
} from "../contradiction-engine/ContradictionResult.js";

import {
    ContradictionCritiqueEngine
} from "./ContradictionCritiqueEngine.js";

import type {
    ScientificEvidenceAccumulatorResult
} from "../scientific-evidence-accumulator/ScientificEvidenceAccumulatorResult.js";

import type {
    ScientificMemoryResult
} from "../scientific-memory/ScientificMemoryResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

import type {
    ScientificSelfCritiqueResult
} from "./ScientificSelfCritiqueResult.js";

import {
    TheoryCritiqueEngine
} from "./TheoryCritiqueEngine.js";
import {
    EvidenceCritiqueEngine
} from "./EvidenceCritiqueEngine.js";

import {
    MemoryCritiqueEngine
} from "./MemoryCritiqueEngine.js";

export class ScientificSelfCritiqueEngine {

    build(
    campaignId: string,
    validations: ScientificValidationResult,
    contradictions: ContradictionResult,
    evidenceAccumulator: ScientificEvidenceAccumulatorResult,
    scientificMemory: ScientificMemoryResult,
    scientificDiscoveries: ScientificDiscoveryResult
): ScientificSelfCritiqueResult {

        try {

            const critiques: ScientificCritique[] = [];

            let counter = 1;

            /*
             * ==================================================
             * 1. CRITIQUE SCIENTIFIC THEORIES
             * ==================================================
             */

            const theoryCritiques =
    new TheoryCritiqueEngine().build(
        validations,
        critiques.length
    );

critiques.push(
    ...theoryCritiques
);

counter +=
    theoryCritiques.length;

            /*
             * ==================================================
             * 2. CRITIQUE EVIDENCE HISTORIES
             * ==================================================
             */

            const evidenceCritiques =
    new EvidenceCritiqueEngine().build(
        evidenceAccumulator,
        critiques.length
    );

critiques.push(
    ...evidenceCritiques
);

counter +=
    evidenceCritiques.length;

            /*
             * ==================================================
             * 3. CRITIQUE SCIENTIFIC MEMORY
             * ==================================================
             */

            const memoryCritiques =
    new MemoryCritiqueEngine().build(
        scientificMemory,
        critiques.length
    );

critiques.push(
    ...memoryCritiques
);

counter +=
    memoryCritiques.length;
            /*
             * ==================================================
             * 4. DIRECT CONTRADICTION CRITIQUES
             * ==================================================
             */

            const contradictionCritiques =
    new ContradictionCritiqueEngine().build(
        contradictions,
        critiques.length
    );

critiques.push(
    ...contradictionCritiques
);

counter +=
    contradictionCritiques.length;
    /*
 * ==================================================
 * 5. CRITIQUE SCIENTIFIC DISCOVERIES
 * ==================================================
 */

const discoveryCritiques =
    new DiscoveryCritiqueEngine().build(
        scientificDiscoveries,
        critiques.length
    );

critiques.push(
    ...discoveryCritiques
);

counter +=
    discoveryCritiques.length;

            const deduplicated =
                this.deduplicate(
                    critiques
                );

            deduplicated.sort(
                (a, b) =>
                    this.severityWeight(
                        b.severity
                    ) -
                    this.severityWeight(
                        a.severity
                    ) ||
                    a.robustnessScore -
                    b.robustnessScore
            );

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                critiques:
                    deduplicated,

                statistics: {

                    critiques:
                        deduplicated.length,

                    critical:
                        this.countSeverity(
                            deduplicated,
                            "CRITICAL"
                        ),

                    high:
                        this.countSeverity(
                            deduplicated,
                            "HIGH"
                        ),

                    medium:
                        this.countSeverity(
                            deduplicated,
                            "MEDIUM"
                        ),

                    low:
                        this.countSeverity(
                            deduplicated,
                            "LOW"
                        ),

                    theoriesCritiqued:
                        deduplicated.filter(
                            critique =>
                                critique.targetType ===
                                "THEORY"
                        ).length,

                    knowledgeCritiqued:
                        deduplicated.filter(
                            critique =>
                                critique.targetType ===
                                "KNOWLEDGE"
                        ).length,

                    evidenceHistoriesCritiqued:
                        deduplicated.filter(
                            critique =>
                                critique.targetType ===
                                "EVIDENCE_HISTORY"
                        ).length,
                        discoveriesCritiqued:
    deduplicated.filter(
        critique =>
            critique.targetType ===
            "DISCOVERY"
    ).length,

                  averageRobustnessScore:
                        this.average(
                            deduplicated.map(
                                critique =>
                                    critique.robustnessScore
                            )
                        ),

                    veryHighFalsificationRisk:
                        this.countRisk(
                            deduplicated,
                            "VERY_HIGH"
                        ),

                    highFalsificationRisk:
                        this.countRisk(
                            deduplicated,
                            "HIGH"
                        ),

                    moderateFalsificationRisk:
                        this.countRisk(
                            deduplicated,
                            "MODERATE"
                        ),

                    lowFalsificationRisk:
                        this.countRisk(
                            deduplicated,
                            "LOW"
                        )

                },

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                campaignId,

                critiques: [],

                statistics: {
                    critiques: 0,
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    theoriesCritiqued: 0,
                    knowledgeCritiqued: 0,
                    evidenceHistoriesCritiqued: 0,
                    discoveriesCritiqued: 0,
                    averageRobustnessScore: 0,
                    veryHighFalsificationRisk: 0,
                    highFalsificationRisk: 0,
                    moderateFalsificationRisk: 0,
                    lowFalsificationRisk: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown scientific self-critique error"
                ]

            };

        }

    }

    private isConfidenceDeclining(
        history: number[]
    ): boolean {

        if (history.length < 3) {
            return false;
        }

        const recent =
            history.slice(-3);

        return (
            recent[0] >
            recent[1] &&
            recent[1] >
            recent[2]
        );

    }

    private severityFor(
        robustnessScore: number
    ): ScientificCritique["severity"] {

        if (robustnessScore < 30) {
            return "CRITICAL";
        }

        if (robustnessScore < 50) {
            return "HIGH";
        }

        if (robustnessScore < 75) {
            return "MEDIUM";
        }

        return "LOW";

    }

    private riskFor(
        robustnessScore: number
    ): ScientificCritique["falsificationRisk"] {

        if (robustnessScore < 30) {
            return "VERY_HIGH";
        }

        if (robustnessScore < 50) {
            return "HIGH";
        }

        if (robustnessScore < 75) {
            return "MODERATE";
        }

        return "LOW";

    }

    private recommendationFor(
        critiqueType:
            ScientificCritique["critiqueType"]
    ): string {

        switch (critiqueType) {

            case "CONTRADICTORY_EVIDENCE":

                return "Prioritize an adversarial experiment designed to reproduce and resolve the contradictory evidence.";

            case "INSUFFICIENT_INDEPENDENCE":

                return "Collect evidence from at least one additional independent implementation or specification.";

            case "LOW_CONFIDENCE":

                return "Do not promote this knowledge until stronger direct evidence increases confidence.";

            case "DECLINING_EVIDENCE":

                return "Investigate which source or relation caused the recent loss of confidence or support.";

            case "VOLATILE_EVIDENCE":

                return "Separate contextual variants and test whether the apparent volatility reflects multiple valid operating conditions.";

            case "WEAK_VALIDATION":

                return "Repeat scientific validation using stronger implementation evidence and adversarial tests.";

            case "PREMATURE_STABILITY":

                return "Require additional campaigns before treating the current status as stable or canonical.";

            case "STATUS_CONFIDENCE_MISMATCH":

                return "Recalculate the scientific status using stricter confidence and campaign-history thresholds.";

            case "LIMITED_CAMPAIGN_HISTORY":

                return "Observe the knowledge across additional campaigns before drawing temporal conclusions.";

            case "NO_ADVERSARIAL_VALIDATION":

                return "Create a falsification-oriented experiment using sources not currently supporting the theory.";

                case "DISCOVERY_FALSE_POSITIVE_RISK":

    return "Attempt to falsify this discovery using independent graph paths, alternative source subsets, and adversarial composition analysis.";

case "INSUFFICIENT_DISCOVERY_EVIDENCE":

    return "Collect additional independent graph evidence before treating this discovery as scientifically established.";

default:

    return "Review this scientific critique using additional independent evidence and adversarial testing.";

        }

    }

    private deduplicate(
        critiques:
            ScientificCritique[]
    ): ScientificCritique[] {

        const unique =
            new Map<string, ScientificCritique>();

        for (const critique of critiques) {

            const key =
                `${critique.targetType}:` +
                `${critique.targetId}:` +
                `${critique.critiqueType}`;

            const existing =
                unique.get(key);

            if (
                !existing ||
                critique.robustnessScore <
                existing.robustnessScore
            ) {

                unique.set(
                    key,
                    critique
                );

            }

        }

        return [
            ...unique.values()
        ];

    }

    private countSeverity(
        critiques:
            ScientificCritique[],
        severity:
            ScientificCritique["severity"]
    ): number {

        return critiques.filter(
            critique =>
                critique.severity === severity
        ).length;

    }

    private countRisk(
        critiques:
            ScientificCritique[],
        risk:
            ScientificCritique["falsificationRisk"]
    ): number {

        return critiques.filter(
            critique =>
                critique.falsificationRisk === risk
        ).length;

    }

    private severityWeight(
        severity:
            ScientificCritique["severity"]
    ): number {

        switch (severity) {

            case "CRITICAL":
                return 4;

            case "HIGH":
                return 3;

            case "MEDIUM":
                return 2;

            case "LOW":
                return 1;

        }

    }

    private clamp(
        value: number
    ): number {

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(value)
            )
        );

    }

    private average(
        values: number[]
    ): number {

        if (values.length === 0) {
            return 0;
        }

        return Math.round(
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) /
            values.length
        );

    }

}