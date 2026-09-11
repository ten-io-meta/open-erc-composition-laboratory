import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";

import type {
    ScientificCandidateBoundaryRelevanceAssessment
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";


export interface ScientificCandidateBoundaryRelevanceGapOverlayEngineInput {

    diagnosis:
        ScientificCompositionCandidateEvidenceGapResult;

    relevanceAssessments:
        ScientificCandidateBoundaryRelevanceAssessment[];

}


function sortedUnique(
    values: string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


function sameStrings(
    left: string[],
    right: string[]
): boolean {

    return (
        JSON.stringify(
            [...left].sort()
        ) ===
        JSON.stringify(
            [...right].sort()
        )
    );

}


function encode(
    parts: string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


export class ScientificCandidateBoundaryRelevanceGapOverlayEngine {

    apply(
        input:
            ScientificCandidateBoundaryRelevanceGapOverlayEngineInput
    ): ScientificCompositionCandidateEvidenceGapResult {

        const errors:
            string[] = [
                ...input.diagnosis.errors
            ];


        if (
            input.diagnosis.errors.length >
            0
        ) {

            return {
                ...input.diagnosis,
                errors:
                    sortedUnique(
                        errors
                    )
            };

        }


        const diagnosticsByCandidate =
            new Map(
                input.diagnosis.diagnostics
                    .map(
                        diagnostic => [
                            diagnostic.candidateId,
                            diagnostic
                        ] as const
                    )
            );


        if (
            diagnosticsByCandidate.size !==
            input.diagnosis.diagnostics.length
        ) {

            errors.push(
                "Relevance gap overlay received duplicate candidate diagnostics."
            );

        }


        const seenRelevance =
            new Set<string>();


        for (
            const assessment
            of input.relevanceAssessments
        ) {

            if (
                !diagnosticsByCandidate.has(
                    assessment.candidateId
                )
            ) {

                errors.push(
                    `Relevance assessment ${assessment.assessmentId} references candidate ${assessment.candidateId} without an evidence-gap diagnostic.`
                );

            }


            const key =
                `${assessment.candidateId}|${assessment.boundaryId}`;


            if (
                seenRelevance.has(
                    key
                )
            ) {

                errors.push(
                    `Duplicate relevance assessment for ${key}.`
                );

            }


            seenRelevance.add(
                key
            );

        }


        if (
            errors.length >
            0
        ) {

            return {
                ...input.diagnosis,
                errors:
                    sortedUnique(
                        errors
                    )
            };

        }


        const diagnostics =
            input.diagnosis.diagnostics
                .map(
                    diagnostic => {

                        const relevance =
                            input.relevanceAssessments
                                .filter(
                                    assessment =>
                                        assessment.candidateId ===
                                        diagnostic.candidateId
                                );


                        /*
                         * Backward compatibility:
                         *
                         * no relevance ingress means the legacy
                         * evidence-gap diagnosis is preserved exactly.
                         */
                        if (
                            relevance.length ===
                            0
                        ) {

                            return diagnostic;

                        }


                        const relevantBoundaryIds =
                            sortedUnique(
                                relevance
                                    .filter(
                                        assessment =>
                                            assessment.relevance ===
                                            "RELEVANT"
                                    )
                                    .map(
                                        assessment =>
                                            assessment.boundaryId
                                    )
                            );


                        const unresolvedBoundaryIds =
                            sortedUnique(
                                relevance
                                    .filter(
                                        assessment =>
                                            assessment.relevance ===
                                            "UNRESOLVED"
                                    )
                                    .map(
                                        assessment =>
                                            assessment.boundaryId
                                    )
                            );


                        /*
                         * ScopedCompatibility must expose exactly the
                         * boundaries already proven RELEVANT.
                         */
                        if (
                            !sameStrings(
                                relevantBoundaryIds,
                                diagnostic.knownBoundaryIds
                            )
                        ) {

                            errors.push(
                                `Candidate ${diagnostic.candidateId} known boundaries do not match RELEVANT boundary assessments.`
                            );

                        }


                        if (
                            unresolvedBoundaryIds.length ===
                            0
                        ) {

                            return diagnostic;

                        }


                        if (
                            diagnostic.resolution !==
                            "REQUIRES_ADDITIONAL_EVIDENCE"
                        ) {

                            errors.push(
                                `Candidate ${diagnostic.candidateId} has unresolved boundary relevance but its evidence resolution is ${diagnostic.resolution}.`
                            );

                        }


                        /*
                         * NO_KNOWN_BOUNDARIES is false when protocol
                         * boundaries are already known but their
                         * candidate relevance is unresolved.
                         *
                         * If there are zero RELEVANT boundaries, asking
                         * for candidate compatibility observations is
                         * also premature: relevance must be resolved first.
                         */
                        const gaps =
                            diagnostic.gaps
                                .filter(
                                    gap => {

                                        if (
                                            gap.kind ===
                                            "NO_KNOWN_BOUNDARIES"
                                        ) {

                                            return false;

                                        }


                                        if (
                                            diagnostic.knownBoundaryIds.length ===
                                                0 &&
                                            gap.kind ===
                                                "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
                                        ) {

                                            return false;

                                        }


                                        return true;

                                    }
                                )
                                .map(
                                    gap => ({
                                        ...gap,
                                        boundaryIds:
                                            [...gap.boundaryIds]
                                    })
                                );


                        gaps.push({

                            gapId:
                                encode([
                                    "SCIENTIFIC-COMPOSITION-CANDIDATE-EVIDENCE-GAP",
                                    diagnostic.candidateId,
                                    "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE"
                                ]),

                            kind:
                                "UNRESOLVED_CANDIDATE_BOUNDARY_RELEVANCE",

                            candidateId:
                                diagnostic.candidateId,

                            boundaryIds:
                                unresolvedBoundaryIds

                        });


                        gaps.sort(
                            (a, b) =>
                                a.gapId.localeCompare(
                                    b.gapId
                                )
                        );


                        return {
                            ...diagnostic,
                            gaps
                        };

                    }
                );


        if (
            errors.length >
            0
        ) {

            return {
                ...input.diagnosis,
                errors:
                    sortedUnique(
                        errors
                    )
            };

        }


        return {
            ...input.diagnosis,
            diagnostics,
            errors:
                []
        };

    }

}
