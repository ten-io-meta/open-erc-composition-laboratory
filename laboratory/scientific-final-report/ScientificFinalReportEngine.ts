import type {
    ScientificFinalReport
} from "./ScientificFinalReport.js";

import type {
    ScientificDecisionTraceResult
} from "../scientific-decision-trace/ScientificDecisionTrace.js";

import type {
    ScientificEvidenceLineageResult
} from "../scientific-evidence-lineage/ScientificEvidenceLineage.js";

import type {
    ScientificCompositionGlobalAssessment
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export interface ScientificFinalReportEngineInput {

    reportId:
        string;

    globalAssessment:
        ScientificCompositionGlobalAssessment | null;

    decisionTrace:
        ScientificDecisionTraceResult | null;

    evidenceLineage:
        ScientificEvidenceLineageResult | null;

}


export interface ScientificFinalReportEngineResult {

    report:
        ScientificFinalReport | null;

    errors:
        string[];

}


export class ScientificFinalReportEngine {

    project(
        input:
            ScientificFinalReportEngineInput
    ): ScientificFinalReportEngineResult {

        const errors:
            string[] = [];

        if (!input.reportId.trim()) {
            errors.push(
                "Final scientific report requires reportId."
            );
        }

        if (input.globalAssessment === null) {
            errors.push(
                "Final scientific report requires global assessment."
            );
        }

        if (input.decisionTrace === null) {
            errors.push(
                "Final scientific report requires decision trace."
            );
        }

        if (input.evidenceLineage === null) {
            errors.push(
                "Final scientific report requires evidence lineage."
            );
        }

        if (errors.length > 0) {
            return {
                report: null,
                errors
            };
        }

        const globalAssessment =
            input.globalAssessment!;

        return {
            report: {
                reportId:
                    input.reportId,

                scientificPolarity:
                    globalAssessment.scientificPolarity,

                globalAssessment,

                decisionTrace:
                    input.decisionTrace!,

                evidenceLineage:
                    input.evidenceLineage!,

                decisionAuthority:
                    "UPSTREAM_SCIENTIFIC_STATE_ONLY",

                reportStatus:
                    "PROJECTED"
            },

            errors: []
        };

    }

}
