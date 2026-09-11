import type {
    ScientificDecisionTraceCandidate
} from "../scientific-decision-trace/ScientificDecisionTrace.js";

import type {
    ScientificCandidateScopedCompatibilityAssessment
} from "../scientific-candidate-boundary-relevance/ScientificCandidateScopedCompatibilityEngine.js";

import type {
    ScientificCandidateFunctionalConfigurationEvidence
} from "../scientific-candidate-functional-configuration/ScientificCandidateFunctionalConfigurationEvidence.js";


export interface ScientificCandidateCompositionDossier {

    dossierId:
        string;

    candidateId:
        string;

    candidateTrace:
        ScientificDecisionTraceCandidate;

    scopedCompatibility:
        ScientificCandidateScopedCompatibilityAssessment | null;

    functionalConfigurations:
        ScientificCandidateFunctionalConfigurationEvidence[];

    dossierAuthority:
        "UPSTREAM_CANDIDATE_STATE_ONLY";

    dossierStatus:
        "PROJECTED";

}
