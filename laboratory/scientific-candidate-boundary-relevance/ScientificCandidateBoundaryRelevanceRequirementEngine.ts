import type {
    ScientificCandidateBoundaryRelevanceResult
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";

import type {
    ScientificCandidateBoundaryRelevanceRequirement,
    ScientificCandidateBoundaryRelevanceRequirementKind
} from "./ScientificCandidateBoundaryRelevanceRequirement.js";


export interface ScientificCandidateBoundaryRelevanceRequirementResult {

    requirements:
        ScientificCandidateBoundaryRelevanceRequirement[];

    statistics: {
        total: number;
        acquireEvidence: number;
        resolveConflict: number;
    };

    errors:
        string[];

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


export class ScientificCandidateBoundaryRelevanceRequirementEngine {

    derive(
        input:
            ScientificCandidateBoundaryRelevanceResult
    ): ScientificCandidateBoundaryRelevanceRequirementResult {

        const errors:
            string[] = [];

        if (
            input.errors.length >
            0
        ) {

            errors.push(
                "Cannot derive relevance requirements from a relevance result containing errors."
            );

        }


        const assessmentIds =
            new Set<string>();

        const candidateBoundaryKeys =
            new Set<string>();


        for (
            const assessment
            of input.assessments
        ) {

            if (
                assessmentIds.has(
                    assessment.assessmentId
                )
            ) {

                errors.push(
                    `Duplicate relevance assessment ${assessment.assessmentId}.`
                );

            }

            assessmentIds.add(
                assessment.assessmentId
            );


            const key =
                `${assessment.candidateId}|${assessment.boundaryId}`;


            if (
                candidateBoundaryKeys.has(
                    key
                )
            ) {

                errors.push(
                    `Duplicate candidate-boundary relevance assessment ${key}.`
                );

            }

            candidateBoundaryKeys.add(
                key
            );


            if (
                assessment.relevance ===
                    "RELEVANT" &&
                (
                    assessment.reason !==
                        "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE" ||
                    assessment.evidenceIds.length ===
                        0
                )
            ) {

                errors.push(
                    `Relevant boundary ${assessment.boundaryId} lacks explicit reachability evidence.`
                );

            }


            if (
                assessment.relevance ===
                    "OUT_OF_SCOPE" &&
                (
                    assessment.reason !==
                        "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE" ||
                    assessment.evidenceIds.length ===
                        0
                )
            ) {

                errors.push(
                    `Out-of-scope boundary ${assessment.boundaryId} lacks explicit exclusion evidence.`
                );

            }


            if (
                assessment.relevance ===
                    "UNRESOLVED" &&
                assessment.reason ===
                    "NO_RELEVANCE_EVIDENCE" &&
                assessment.evidenceIds.length !==
                    0
            ) {

                errors.push(
                    `Boundary ${assessment.boundaryId} claims NO_RELEVANCE_EVIDENCE but contains evidence.`
                );

            }


            if (
                assessment.relevance ===
                    "UNRESOLVED" &&
                assessment.reason ===
                    "CONFLICTING_RELEVANCE_EVIDENCE" &&
                assessment.evidenceIds.length ===
                    0
            ) {

                errors.push(
                    `Boundary ${assessment.boundaryId} claims conflicting relevance without evidence.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                requirements:
                    [],

                statistics: {
                    total:
                        0,
                    acquireEvidence:
                        0,
                    resolveConflict:
                        0
                },

                errors:
                    errors.sort()
            };

        }


        const requirements:
            ScientificCandidateBoundaryRelevanceRequirement[] =
            [];


        for (
            const assessment
            of [...input.assessments].sort(
                (a, b) =>
                    a.assessmentId.localeCompare(
                        b.assessmentId
                    )
            )
        ) {

            if (
                assessment.relevance !==
                "UNRESOLVED"
            ) {

                continue;

            }


            let kind:
                ScientificCandidateBoundaryRelevanceRequirementKind;


            if (
                assessment.reason ===
                "NO_RELEVANCE_EVIDENCE"
            ) {

                kind =
                    "ACQUIRE_CANDIDATE_RELEVANCE_EVIDENCE";

            }
            else if (
                assessment.reason ===
                "CONFLICTING_RELEVANCE_EVIDENCE"
            ) {

                kind =
                    "RESOLVE_CONFLICTING_CANDIDATE_RELEVANCE_EVIDENCE";

            }
            else {

                errors.push(
                    `Unsupported unresolved relevance reason ${assessment.reason}.`
                );

                continue;

            }


            requirements.push({

                requirementId:
                    encode([
                        "SCIENTIFIC-CANDIDATE-BOUNDARY-RELEVANCE-REQUIREMENT",
                        assessment.candidateId,
                        assessment.participantId,
                        assessment.boundaryId,
                        kind
                    ]),

                assessmentId:
                    assessment.assessmentId,

                candidateId:
                    assessment.candidateId,

                participantId:
                    assessment.participantId,

                boundaryId:
                    assessment.boundaryId,

                kind,

                triggeringReason:
                    assessment.reason,

                currentEvidenceIds:
                    [...assessment.evidenceIds]
                        .sort(),

                readiness:
                    "READY"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {
                requirements:
                    [],

                statistics: {
                    total:
                        0,
                    acquireEvidence:
                        0,
                    resolveConflict:
                        0
                },

                errors:
                    errors.sort()
            };

        }


        requirements.sort(
            (a, b) =>
                a.requirementId.localeCompare(
                    b.requirementId
                )
        );


        return {

            requirements,

            statistics: {

                total:
                    requirements.length,

                acquireEvidence:
                    requirements.filter(
                        requirement =>
                            requirement.kind ===
                            "ACQUIRE_CANDIDATE_RELEVANCE_EVIDENCE"
                    ).length,

                resolveConflict:
                    requirements.filter(
                        requirement =>
                            requirement.kind ===
                            "RESOLVE_CONFLICTING_CANDIDATE_RELEVANCE_EVIDENCE"
                    ).length

            },

            errors:
                []

        };

    }

}
