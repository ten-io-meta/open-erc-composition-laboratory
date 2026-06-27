import type { Pattern } from "./Pattern.js";

export class PatternDiscoveryEngine {

    discover(datasets: any[]): Pattern[] {

        const patterns: Pattern[] = [];

        let settlementFailures = 0;
        let settlementEvidence = 0;

        let cursorFailures = 0;
        let cursorEvidence = 0;

        for (const dataset of datasets) {

            for (const validation of dataset.validationResults ?? []) {

                if (validation.rule === "settlement-safety") {

                    settlementEvidence++;

                    if (!validation.passed) {
                        settlementFailures++;
                    }

                }

                if (validation.rule === "cursor-safety") {

                    cursorEvidence++;

                    if (!validation.passed) {
                        cursorFailures++;
                    }

                }

            }

        }

        if (settlementEvidence > 0) {

            patterns.push({

                name: "Settlement Failure Frequency",

                confidence:
                    Math.round(
                        ((settlementEvidence - settlementFailures)
                            / settlementEvidence) * 100
                    ),

                evidence: settlementEvidence,

                description:
                    "Observed settlement safety success rate."

            });

        }

        if (cursorEvidence > 0) {

            patterns.push({

                name: "Cursor Safety Frequency",

                confidence:
                    Math.round(
                        ((cursorEvidence - cursorFailures)
                            / cursorEvidence) * 100
                    ),

                evidence: cursorEvidence,

                description:
                    "Observed cursor safety success rate."

            });

        }

        return patterns;

    }

}