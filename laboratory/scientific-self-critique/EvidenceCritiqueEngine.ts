import type {
    ScientificEvidenceAccumulatorResult
} from "../scientific-evidence-accumulator/ScientificEvidenceAccumulatorResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

export class EvidenceCritiqueEngine {

    build(
        evidenceAccumulator:
            ScientificEvidenceAccumulatorResult,

        startIndex = 0
    ): ScientificCritique[] {

        const critiques:
            ScientificCritique[] = [];

        let counter =
            startIndex + 1;

        for (
            const history
            of evidenceAccumulator.histories ?? []
        ) {

            const evidence:
                string[] = [];

            let penalty = 0;

            let critiqueType:
                ScientificCritique["critiqueType"] | null =
                    null;

            if (
                history.evidenceTrend ===
                "DECLINING"
            ) {

                critiqueType =
                    "DECLINING_EVIDENCE";

                penalty += 45;

                evidence.push(
                    `Evidence trend is DECLINING across ${history.totalCampaignsObserved} campaign(s).`
                );

            }

            if (
                history.evidenceTrend ===
                "VOLATILE"
            ) {

                critiqueType =
                    "VOLATILE_EVIDENCE";

                penalty += 35;

                evidence.push(
                    "Evidence confidence or source support changes inconsistently between campaigns."
                );

            }

            if (
                history.totalCampaignsObserved < 3
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "LIMITED_CAMPAIGN_HISTORY";

                }

                penalty += 20;

                evidence.push(
                    `Only ${history.totalCampaignsObserved} campaign snapshot(s) are available.`
                );

            }

            if (
                history.stabilityScore >= 90 &&
                history.totalCampaignsObserved < 3
            ) {

                critiqueType =
                    "PREMATURE_STABILITY";

                penalty += 20;

                evidence.push(
                    `Stability score ${history.stabilityScore} is based on fewer than three campaigns.`
                );

            }

            if (
                history.highestSourceCount < 3
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "INSUFFICIENT_INDEPENDENCE";

                }

                penalty += 15;

                evidence.push(
                    `Maximum source diversity is only ${history.highestSourceCount}.`
                );

            }

            if (
                history.totalConfidenceGain < 0
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "DECLINING_EVIDENCE";

                }

                penalty +=
                    Math.min(
                        25,
                        Math.abs(
                            history.totalConfidenceGain
                        )
                    );

                evidence.push(
                    `Total confidence changed by ${history.totalConfidenceGain}.`
                );

            }

            if (
                history.totalSourceGain < 0
            ) {

                if (!critiqueType) {

                    critiqueType =
                        "DECLINING_EVIDENCE";

                }

                penalty += 20;

                evidence.push(
                    `Independent source support changed by ${history.totalSourceGain}.`
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
                    history.knowledgeId,

                    targetEvidenceIds: [],

                targetType:
                    "EVIDENCE_HISTORY",

                statement:
                    history.statement,

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
                    `Evidence history was reviewed across ` +
                    `${history.totalCampaignsObserved} campaign(s). ` +
                    `Trend: ${history.evidenceTrend}. ` +
                    `Stability score: ${history.stabilityScore}. ` +
                    `Confidence range: ${history.lowestConfidence}-${history.highestConfidence}.`

            });

        }

        return critiques;

    }

    private severityFor(
        robustnessScore: number
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
        robustnessScore: number
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

            case "DECLINING_EVIDENCE":

                return "Investigate which source or relation caused the recent loss of confidence or support.";

            case "VOLATILE_EVIDENCE":

                return "Separate contextual variants and test whether the apparent volatility reflects multiple valid operating conditions.";

            case "PREMATURE_STABILITY":

                return "Require additional campaigns before treating the current status as stable or canonical.";

            case "LIMITED_CAMPAIGN_HISTORY":

                return "Observe the knowledge across additional campaigns before drawing temporal conclusions.";

            default:

                return "Review the evidence history and gather additional independent observations.";

        }

    }

    private clamp(
        value: number
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