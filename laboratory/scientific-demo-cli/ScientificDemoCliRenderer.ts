import type {
    ScientificDemoCliBundle
} from "./ScientificDemoCliBundle.js";

import {
    ScientificFinalReportRenderer
} from "../scientific-final-report/ScientificFinalReportRenderer.js";

import {
    ScientificCandidateCompositionDossierRenderer
} from "../scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierRenderer.js";

import {
    ScientificCandidateWhyExplanationRenderer
} from "../scientific-why-explanation/ScientificCandidateWhyExplanationRenderer.js";


export interface ScientificDemoCliRenderedOutput {

    text:
        string;

    json:
        string;

    renderAuthority:
        "PROJECTED_CLI_BUNDLE_ONLY";

}


export class ScientificDemoCliRenderer {

    render(
        bundle:
            ScientificDemoCliBundle
    ): ScientificDemoCliRenderedOutput {

        const finalReport =
            new ScientificFinalReportRenderer()
                .render(bundle.finalReport);

        const sections:
            string[] = [
                finalReport.text
            ];

        for (const candidate of bundle.candidates) {

            const dossier =
                new ScientificCandidateCompositionDossierRenderer()
                    .render(candidate.dossier);

            const explanation =
                new ScientificCandidateWhyExplanationRenderer()
                    .render(candidate.explanation);

            sections.push(
                dossier.text,
                explanation
            );
        }

        return {
            text:
                sections.join("\n\n==============================\n\n"),

            json:
                JSON.stringify(bundle, null, 2),

            renderAuthority:
                "PROJECTED_CLI_BUNDLE_ONLY"
        };

    }

}
