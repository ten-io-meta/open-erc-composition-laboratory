import type {
    ScientificValidationResult
} from "../scientific-validation/ScientificValidationResult.js";

import type {
    ScientificCritique
} from "./ScientificCritique.js";

export class TheoryCritiqueEngine {

    build(
        validations:
            ScientificValidationResult,

        startIndex = 0
    ): ScientificCritique[] {

        const critiques:
            ScientificCritique[] = [];

        let counter =
            startIndex + 1;

        for (
            const validation
            of validations.validations ?? []
        ) {

            const evidence:
                string[] = [];

            let penalty = 0;

            let critiqueType:
                ScientificCritique["critiqueType"] =
                    "NO_ADVERSARIAL_VALIDATION";

            if (
                validation.contradictoryEvidence > 0
            ) {

                critiqueType =
                    "CONTRADICTORY_EVIDENCE";

                penalty +=
                    Math.min(
                        50,
                        validation.contradictoryEvidence * 20
                    );

                evidence.push(
                    `${validation.contradictoryEvidence} contradictory finding(s) affect this theory.`
                );

            }

            if (
                validation.independentSources < 3
            ) {

                if (
                    critiqueType ===
                    "NO_ADVERSARIAL_VALIDATION"
                ) {

                    critiqueType =
                        "INSUFFICIENT_INDEPENDENCE";

                }

                penalty +=
                    validation.independentSources === 0
                        ? 35
                        : validation.independentSources === 1
                            ? 25
                            : 15;

                evidence.push(
                    `Only ${validation.independentSources} independent source(s) support this theory.`
                );

            }

            if (
                validation.validationScore < 60
            ) {

                if (
                    validation.contradictoryEvidence === 0
                ) {

                    critiqueType =
                        "WEAK_VALIDATION";

                }

                penalty +=
                    Math.min(
                        35,
                        60 - validation.validationScore
                    );

                evidence.push(
                    `Validation score is only ${validation.validationScore}.`
                );

            }

            if (
                validation.status ===
                "INCONCLUSIVE"
            ) {

                penalty += 15;

                evidence.push(
                    "The scientific validation remains inconclusive."
                );

            }

            if (
                validation.status ===
                "REJECTED"
            ) {

                critiqueType =
                    "WEAK_VALIDATION";

                penalty += 40;

                evidence.push(
                    "The theory has already been rejected by scientific validation."
                );

            }

            if (
                validation.challenges.length > 0
            ) {

                evidence.push(
                    ...validation.challenges
                );

            }

            if (
                evidence.length === 0
            ) {

                evidence.push(
                    "No explicit contradictory evidence was found, but the theory still requires adversarial testing against independent implementations."
                );

                penalty = 10;

                critiqueType =
                    "NO_ADVERSARIAL_VALIDATION";

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
                    validation.theoryId,

                    targetEvidenceIds: [],

                targetType:
                    "THEORY",

                statement:
                    validation.theoryTitle,

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
                    `Theory received robustness score ${robustnessScore}. ` +
                    `The critique considered ${validation.supportingEvidence} supporting edge(s), ` +
                    `${validation.independentSources} independent source(s), ` +
                    `${validation.contradictoryEvidence} contradictory finding(s), ` +
                    `and validation status ${validation.status}.`

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

            case "CONTRADICTORY_EVIDENCE":

                return "Prioritize an adversarial experiment designed to reproduce and resolve the contradictory evidence.";

            case "INSUFFICIENT_INDEPENDENCE":

                return "Collect evidence from at least one additional independent implementation or specification.";

            case "WEAK_VALIDATION":

                return "Repeat scientific validation using stronger implementation evidence and adversarial tests.";

            case "NO_ADVERSARIAL_VALIDATION":

                return "Create a falsification-oriented experiment using sources not currently supporting the theory.";

            default:

                return "Review the theory with additional independent evidence and adversarial testing.";

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