import type {
    ScientificMemoryResult
} from "../scientific-memory/ScientificMemoryResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

export class MemoryCritiqueEngine {

    build(
        scientificMemory:
            ScientificMemoryResult,

        startIndex = 0
    ): ScientificCritique[] {

        const critiques:
            ScientificCritique[] = [];

        let counter =
            startIndex + 1;

        for (
            const entry
            of scientificMemory.currentMemory.entries ?? []
        ) {

            const latestConfidence =
                entry.confidenceHistory.at(-1) ?? 0;

            const latestEvidence =
                entry.evidenceHistory.at(-1) ?? 0;

            const latestStatus =
                entry.statusHistory.at(-1) ??
                "UNKNOWN";

            const evidence:
                string[] = [];

            let penalty = 0;

            let critiqueType:
                ScientificCritique["critiqueType"] | null =
                    null;

            if (
                latestConfidence < 70
            ) {

                critiqueType =
                    "LOW_CONFIDENCE";

                penalty +=
                    Math.min(
                        40,
                        70 - latestConfidence
                    );

                evidence.push(
                    `Latest confidence is ${latestConfidence}.`
                );

            }

            if (
                latestEvidence < 3
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "INSUFFICIENT_INDEPENDENCE";

                }

                penalty +=
                    latestEvidence === 0
                        ? 30
                        : latestEvidence === 1
                            ? 20
                            : 10;

                evidence.push(
                    `Latest evidence history contains only ${latestEvidence} independent source(s).`
                );

            }

            if (
                (
                    latestStatus === "CANONICAL" ||
                    latestStatus === "ESTABLISHED"
                ) &&
                latestConfidence < 85
            ) {

                critiqueType =
                    "STATUS_CONFIDENCE_MISMATCH";

                penalty += 25;

                evidence.push(
                    `Status ${latestStatus} may be too strong for confidence ${latestConfidence}.`
                );

            }

            if (
                entry.campaignsObserved < 3 &&
                (
                    latestStatus === "CANONICAL" ||
                    latestStatus === "ESTABLISHED"
                )
            ) {

                critiqueType =
                    "PREMATURE_STABILITY";

                penalty += 20;

                evidence.push(
                    `${latestStatus} status is based on only ${entry.campaignsObserved} campaign(s).`
                );

            }

            if (
                this.isConfidenceDeclining(
                    entry.confidenceHistory
                )
            ) {

                critiqueType =
                    "DECLINING_EVIDENCE";

                penalty += 25;

                evidence.push(
                    "Confidence declined across the most recent scientific-memory observations."
                );

            }

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
                    entry.knowledgeId,

                    targetEvidenceIds: [],

                targetType:
                    "KNOWLEDGE",

                statement:
                    entry.knowledgeId,

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
                    `Scientific memory contains ${entry.campaignsObserved} observation(s). ` +
                    `Latest status: ${latestStatus}. ` +
                    `Latest confidence: ${latestConfidence}. ` +
                    `Latest independent evidence count: ${latestEvidence}.`

            });

        }

        return critiques;

    }

    private isConfidenceDeclining(
        history:
            number[]
    ): boolean {

        if (
            history.length < 3
        ) {
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

            case "INSUFFICIENT_INDEPENDENCE":

                return "Collect evidence from at least one additional independent implementation or specification.";

            case "LOW_CONFIDENCE":

                return "Do not promote this knowledge until stronger direct evidence increases confidence.";

            case "DECLINING_EVIDENCE":

                return "Investigate which source or relation caused the recent loss of confidence or support.";

            case "PREMATURE_STABILITY":

                return "Require additional campaigns before treating the current status as stable or canonical.";

            case "STATUS_CONFIDENCE_MISMATCH":

                return "Recalculate the scientific status using stricter confidence and campaign-history thresholds.";

            default:

                return "Review this scientific-memory entry using additional evidence and campaign history.";

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