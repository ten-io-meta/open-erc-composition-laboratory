import type {
    ScientificDecisionTraceResult
} from "../scientific-decision-trace/ScientificDecisionTrace.js";

import type {
    ScientificEvidenceLineageResult
} from "../scientific-evidence-lineage/ScientificEvidenceLineage.js";

import type {
    ScientificCompositionGlobalAssessment,
    ScientificCompositionGlobalPolarity
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";


export interface ScientificFinalReport {

    reportId:
        string;

    scientificPolarity:
        ScientificCompositionGlobalPolarity;

    globalAssessment:
        ScientificCompositionGlobalAssessment;

    decisionTrace:
        ScientificDecisionTraceResult;

    evidenceLineage:
        ScientificEvidenceLineageResult;

    decisionAuthority:
        "UPSTREAM_SCIENTIFIC_STATE_ONLY";

    reportStatus:
        "PROJECTED";

}
