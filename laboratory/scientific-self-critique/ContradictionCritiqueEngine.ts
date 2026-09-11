import type {
    ContradictionResult
} from "../contradiction-engine/ContradictionResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

export class ContradictionCritiqueEngine {

    build(
        contradictions:
            ContradictionResult,

        startIndex = 0
    ): ScientificCritique[] {

        const critiques:
            ScientificCritique[] = [];

        let counter =
            startIndex + 1;

        for (
            const contradiction
            of contradictions.contradictions ?? []
        ) {

            const severity:
                ScientificCritique["severity"] =
                    contradiction.severity === "HIGH"
                        ? "CRITICAL"
                        : "HIGH";

            const robustnessScore =
                contradiction.severity === "HIGH"
                    ? 20
                    : 40;

            critiques.push({

                critiqueId:
                    `SCIENTIFIC-CRITIQUE-${String(
                        counter++
                    ).padStart(5, "0")}`,

                targetId:
                    contradiction.contradictionId,

                    targetEvidenceIds: [],

                targetType:
                    "KNOWLEDGE",

                statement:
                    `${contradiction.subject} ${contradiction.object}`,

                severity,

                critiqueType:
                    "CONTRADICTORY_EVIDENCE",

                evidence: [

                    `${contradiction.subject} has competing relations ` +
                    `${contradiction.relationA} and ` +
                    `${contradiction.relationB} toward ` +
                    `${contradiction.object}.`

                ],

                robustnessScore,

                falsificationRisk:
                    this.riskFor(
                        robustnessScore
                    ),

                recommendation:
                    "Design a controlled experiment that reproduces both competing relations under equivalent conditions.",

                explanation:
                    `A direct contradiction with severity ` +
                    `${contradiction.severity} was detected.`

            });

        }

        return critiques;

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

}