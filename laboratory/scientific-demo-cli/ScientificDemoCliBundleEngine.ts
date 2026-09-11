import type {
    ScientificFinalReportSummary
} from "../scientific-final-report/ScientificFinalReportSummary.js";

import type {
    ScientificDemoCliBundle,
    ScientificDemoCliCandidate
} from "./ScientificDemoCliBundle.js";


export interface ScientificDemoCliBundleEngineInput {

    finalReport:
        ScientificFinalReportSummary;

    candidates:
        ScientificDemoCliCandidate[];

}


export interface ScientificDemoCliBundleEngineResult {

    bundle:
        ScientificDemoCliBundle | null;

    errors:
        string[];

}


export class ScientificDemoCliBundleEngine {

    project(
        input:
            ScientificDemoCliBundleEngineInput
    ): ScientificDemoCliBundleEngineResult {

        const errors:
            string[] = [];

        if (
            input.finalReport.summaryAuthority !==
                "FINAL_REPORT_PROJECTION_ONLY" ||
            input.finalReport.summaryStatus !== "PROJECTED"
        ) {
            errors.push(
                "CLI requires a projected final scientific report summary."
            );
        }

        for (const candidate of input.candidates) {

            if (
                candidate.dossier.summaryAuthority !==
                    "DOSSIER_PROJECTION_ONLY" ||
                candidate.dossier.summaryStatus !== "PROJECTED"
            ) {
                errors.push(
                    "CLI requires projected candidate dossier summaries."
                );
            }

            if (
                candidate.explanation.explanationAuthority !==
                    "UPSTREAM_DOSSIER_STATE_ONLY" ||
                candidate.explanation.explanationStatus !== "PROJECTED"
            ) {
                errors.push(
                    "CLI requires projected candidate explanations."
                );
            }

            if (
                candidate.dossier.candidateId !==
                candidate.explanation.candidateId
            ) {
                errors.push(
                    "CLI candidate dossier and explanation candidateId mismatch."
                );
            }
        }

        if (errors.length > 0) {
            return {
                bundle: null,
                errors
            };
        }

        return {
            bundle: {
                finalReport: input.finalReport,
                candidates: [...input.candidates],
                bundleAuthority:
                    "PROJECTED_SCIENTIFIC_OUTPUT_ONLY"
            },
            errors: []
        };

    }

}
