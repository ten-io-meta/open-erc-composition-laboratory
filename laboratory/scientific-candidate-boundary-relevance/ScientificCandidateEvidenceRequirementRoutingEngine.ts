import type {
    ScientificCompositionCandidateEvidenceDiagnostic,
    ScientificCompositionCandidateEvidenceGap
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGap.js";

import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";


export interface ScientificCandidateEvidenceRequirementRoutingInput {

    diagnosis:
        ScientificCompositionCandidateEvidenceGapResult;

}


export interface ScientificCandidateEvidenceRequirementRoutingResult {

    /*
     * Candidate evidence diagnostics remain authoritative upstream.
     *
     * This is only the projection admitted to the legacy
     * boundary-evidence Requirement -> Specification pipeline.
     */
    legacyDiagnosis:
        ScientificCompositionCandidateEvidenceGapResult;

    /*
     * Relevance gaps remain represented by the separate
     * CandidateBoundaryRelevanceRequirement pipeline.
     */
    routedRelevanceGapIds:
        string[];

    relevanceOnlyDiagnosticIds:
        string[];

    errors:
        string[];

}


function cloneGap(
    gap:
        ScientificCompositionCandidateEvidenceGap
): ScientificCompositionCandidateEvidenceGap {

    return {

        ...gap,

        boundaryIds:
            [...gap.boundaryIds]

    };

}


function cloneDiagnostic(
    diagnostic:
        ScientificCompositionCandidateEvidenceDiagnostic,
    gaps:
        ScientificCompositionCandidateEvidenceGap[]
): ScientificCompositionCandidateEvidenceDiagnostic {

    return {

        ...diagnostic,

        knownBoundaryIds:
            [...diagnostic.knownBoundaryIds],

        observedBoundaryIds:
            [...diagnostic.observedBoundaryIds],

        unevaluatedBoundaryIds:
            [...diagnostic.unevaluatedBoundaryIds],

        compatibilityObservationIds:
            [...diagnostic.compatibilityObservationIds],

        compatibilityEvidenceIds:
            [...diagnostic.compatibilityEvidenceIds],

        gaps:
            gaps.map(
                cloneGap
            )

    };

}


export class ScientificCandidateEvidenceRequirementRoutingEngine {

    route(
        input:
            ScientificCandidateEvidenceRequirementRoutingInput
    ): ScientificCandidateEvidenceRequirementRoutingResult {

        const errors:
            string[] = [];


        if (
            input.diagnosis.errors.length >
            0
        ) {

            errors.push(
                "Cannot route candidate evidence requirements from a diagnosis containing errors."
            );


            return {

                legacyDiagnosis: {

                    diagnostics:
                        [],

                    errors:
                        [...errors]

                },

                routedRelevanceGapIds:
                    [],

                relevanceOnlyDiagnosticIds:
                    [],

                errors

            };

        }


        const legacyDiagnostics:
            ScientificCompositionCandidateEvidenceDiagnostic[] =
            [];

        const routedRelevanceGapIds:
            string[] =
            [];

        const relevanceOnlyDiagnosticIds:
            string[] =
            [];


        for (
            const diagnostic
            of [...input.diagnosis.diagnostics].sort(
                (a, b) =>
                    a.diagnosticId.localeCompare(
                        b.diagnosticId
                    )
            )
        ) {

            const relevanceGaps =
                diagnostic.gaps
                    .filter(
                        gap =>
                            gap.kind ===
                            "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
                    );


            const legacyGaps =
                diagnostic.gaps
                    .filter(
                        gap =>
                            gap.kind !==
                            "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
                    );


            /*
             * A relevance gap is unresolved evidence, but its acquisition
             * authority belongs to the relevance-requirement pipeline.
             *
             * Routing it away from the legacy pipeline does not resolve it.
             */
            if (
                relevanceGaps.length >
                    0 &&
                diagnostic.resolution !==
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains unresolved candidate-boundary relevance but is not marked REQUIRES_ADDITIONAL_EVIDENCE.`
                );

                continue;

            }


            if (
                legacyGaps.length >
                    0 &&
                diagnostic.resolution !==
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} contains legacy evidence gaps but is not marked REQUIRES_ADDITIONAL_EVIDENCE.`
                );

                continue;

            }


            if (
                diagnostic.resolution ===
                    "REQUIRES_ADDITIONAL_EVIDENCE" &&
                relevanceGaps.length ===
                    0 &&
                legacyGaps.length ===
                    0
            ) {

                errors.push(
                    `Diagnostic ${diagnostic.diagnosticId} requires additional evidence but contains no routable evidence gaps.`
                );

                continue;

            }


            routedRelevanceGapIds.push(
                ...relevanceGaps.map(
                    gap =>
                        gap.gapId
                )
            );


            /*
             * Relevance-only diagnostics remain visible in the authoritative
             * candidateEvidenceGaps result, but must not create an empty
             * legacy evidence-requirement plan.
             */
            if (
                relevanceGaps.length >
                    0 &&
                legacyGaps.length ===
                    0
            ) {

                relevanceOnlyDiagnosticIds.push(
                    diagnostic.diagnosticId
                );

                continue;

            }


            /*
             * Mixed diagnostics retain only the classic boundary-evidence
             * gaps at this ingress. Relevance remains owned upstream.
             */
            legacyDiagnostics.push(
                cloneDiagnostic(
                    diagnostic,
                    legacyGaps
                )
            );

        }


        if (
            errors.length >
            0
        ) {

            const sortedErrors =
                [...errors].sort();


            return {

                legacyDiagnosis: {

                    diagnostics:
                        [],

                    errors:
                        sortedErrors

                },

                routedRelevanceGapIds:
                    [...new Set(
                        routedRelevanceGapIds
                    )].sort(),

                relevanceOnlyDiagnosticIds:
                    [...new Set(
                        relevanceOnlyDiagnosticIds
                    )].sort(),

                errors:
                    sortedErrors

            };

        }


        return {

            legacyDiagnosis: {

                diagnostics:
                    legacyDiagnostics.sort(
                        (a, b) =>
                            a.diagnosticId.localeCompare(
                                b.diagnosticId
                            )
                    ),

                errors:
                    []

            },

            routedRelevanceGapIds:
                [...new Set(
                    routedRelevanceGapIds
                )].sort(),

            relevanceOnlyDiagnosticIds:
                [...new Set(
                    relevanceOnlyDiagnosticIds
                )].sort(),

            errors:
                []

        };

    }

}