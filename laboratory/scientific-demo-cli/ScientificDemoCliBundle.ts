import type {
    ScientificFinalReportSummary
} from "../scientific-final-report/ScientificFinalReportSummary.js";

import type {
    ScientificCandidateCompositionDossierSummary
} from "../scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierSummary.js";

import type {
    ScientificCandidateWhyExplanation
} from "../scientific-why-explanation/ScientificCandidateWhyExplanation.js";


export interface ScientificDemoCliCandidate {

    dossier:
        ScientificCandidateCompositionDossierSummary;

    explanation:
        ScientificCandidateWhyExplanation;

}


export interface ScientificDemoCliBundle {

    finalReport:
        ScientificFinalReportSummary;

    candidates:
        ScientificDemoCliCandidate[];

    bundleAuthority:
        "PROJECTED_SCIENTIFIC_OUTPUT_ONLY";

}
