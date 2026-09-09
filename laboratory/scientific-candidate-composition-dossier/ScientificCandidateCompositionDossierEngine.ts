import type {
    ScientificDecisionTraceCandidate
} from "../scientific-decision-trace/ScientificDecisionTrace.js";

import type {
    ScientificCandidateScopedCompatibilityAssessment
} from "../scientific-candidate-boundary-relevance/ScientificCandidateScopedCompatibilityEngine.js";

import type {
    ScientificCandidateFunctionalConfigurationEvidence
} from "../scientific-candidate-functional-configuration/ScientificCandidateFunctionalConfigurationEvidence.js";

import type {
    ScientificCandidateCompositionDossier
} from "./ScientificCandidateCompositionDossier.js";


export interface ScientificCandidateCompositionDossierEngineInput {

    dossierId:
        string;

    candidateTrace:
        ScientificDecisionTraceCandidate;

    scopedCompatibility:
        ScientificCandidateScopedCompatibilityAssessment | null;

    functionalConfigurations:
        ScientificCandidateFunctionalConfigurationEvidence[];

}


export interface ScientificCandidateCompositionDossierEngineResult {

    dossier:
        ScientificCandidateCompositionDossier | null;

    errors:
        string[];

}


export class ScientificCandidateCompositionDossierEngine {

    project(
        input:
            ScientificCandidateCompositionDossierEngineInput
    ): ScientificCandidateCompositionDossierEngineResult {

        const errors:
            string[] = [];

        const candidateId =
            input.candidateTrace.candidateId;

        if (!input.dossierId.trim()) {
            errors.push("Candidate dossier requires dossierId.");
        }

        if (
            input.scopedCompatibility !== null &&
            input.scopedCompatibility.candidateId !== candidateId
        ) {
            errors.push(
                "Scoped compatibility candidateId does not match candidate trace."
            );
        }

        for (const configuration of input.functionalConfigurations) {
            if (configuration.candidateId !== candidateId) {
                errors.push(
                    "Functional configuration candidateId does not match candidate trace."
                );
            }
        }

        if (errors.length > 0) {
            return {
                dossier: null,
                errors
            };
        }

        return {
            dossier: {
                dossierId: input.dossierId,
                candidateId,
                candidateTrace: input.candidateTrace,
                scopedCompatibility: input.scopedCompatibility,
                functionalConfigurations: [
                    ...input.functionalConfigurations
                ],
                dossierAuthority:
                    "UPSTREAM_CANDIDATE_STATE_ONLY",
                dossierStatus:
                    "PROJECTED"
            },
            errors: []
        };

    }

}
