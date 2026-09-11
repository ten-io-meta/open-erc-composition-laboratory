import type {
    ScientificCompositionCandidateSetResult
} from "../scientific-composition-candidate-set/ScientificCompositionCandidateSetResult.js";

import type {
    ScientificCompositionCandidateBoundaryObservation
} from "./ScientificCompositionCandidateBoundaryObservation.js";

import type {
    ScientificCompositionCandidateBoundaryEvaluation,
    ScientificCompositionCandidateCompatibilityAssessment,
    ScientificCompositionCandidateCompatibilityPolarity,
    ScientificCompositionCandidateCompatibilityResult
} from "./ScientificCompositionCandidateCompatibilityAssessment.js";


export interface ScientificCompositionCandidateCompatibilityProfileBoundary {

    boundaryId:
        string;

    participantId:
        string;

}


export interface ScientificCompositionCandidateCompatibilityProfile {

    protocolId:
        string;

    boundaries:
        ScientificCompositionCandidateCompatibilityProfileBoundary[];

}


export interface ScientificCompositionCandidateCompatibilityEngineInput {

    profiles:
        ScientificCompositionCandidateCompatibilityProfile[];

    candidateSet:
        ScientificCompositionCandidateSetResult;

    observations:
        ScientificCompositionCandidateBoundaryObservation[];

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


export class ScientificCompositionCandidateCompatibilityEngine {

    evaluate(
        input:
            ScientificCompositionCandidateCompatibilityEngineInput
    ): ScientificCompositionCandidateCompatibilityResult {

        const errors:
            string[] = [];


        if (
            input.candidateSet.errors.length >
            0
        ) {

            errors.push(
                "Cannot evaluate candidate compatibility from a candidate set containing errors."
            );

        }


        const profilesByProtocol =
            new Map<
                string,
                ScientificCompositionCandidateCompatibilityProfile
            >();


        const boundariesById =
            new Map<
                string,
                ScientificCompositionCandidateCompatibilityProfileBoundary
            >();


        for (
            const profile
            of input.profiles
        ) {

            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Candidate compatibility received unsupported participant identity ${profile.protocolId}.`
                );

            }


            if (
                profilesByProtocol.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate candidate compatibility participant ${profile.protocolId}.`
                );

            }


            profilesByProtocol.set(
                profile.protocolId,
                profile
            );


            for (
                const boundary
                of profile.boundaries
            ) {

                if (
                    !boundary.boundaryId.trim()
                ) {

                    errors.push(
                        `Participant ${profile.protocolId} contains an empty boundary identity.`
                    );

                    continue;

                }


                if (
                    boundary.participantId !==
                    profile.protocolId
                ) {

                    errors.push(
                        `Boundary ${boundary.boundaryId} ownership does not match profile ${profile.protocolId}.`
                    );

                }


                if (
                    boundariesById.has(
                        boundary.boundaryId
                    )
                ) {

                    errors.push(
                        `Duplicate candidate compatibility boundary ${boundary.boundaryId}.`
                    );

                }


                boundariesById.set(
                    boundary.boundaryId,
                    boundary
                );

            }

        }


        const candidatesById =
            new Map(
                input.candidateSet.candidates.map(
                    candidate => [
                        candidate.candidateId,
                        candidate
                    ]
                )
            );


        if (
            candidatesById.size !==
            input.candidateSet.candidates.length
        ) {

            errors.push(
                "Candidate compatibility received duplicate candidate identities."
            );

        }


        for (
            const candidate
            of input.candidateSet.candidates
        ) {

            if (
                !profilesByProtocol.has(
                    candidate.sourceParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} references unknown source participant ${candidate.sourceParticipantId}.`
                );

            }


            if (
                !profilesByProtocol.has(
                    candidate.targetParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} references unknown target participant ${candidate.targetParticipantId}.`
                );

            }


            if (
                candidate.sourceParticipantId ===
                candidate.targetParticipantId
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} is not cross-protocol.`
                );

            }


            if (
                candidate.evaluationStatus !==
                "UNEVALUATED"
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} is not unevaluated at compatibility ingress.`
                );

            }

        }


        const observationIds =
            new Set<string>();


        for (
            const observation
            of input.observations
        ) {

            if (
                !observation.observationId.trim()
            ) {

                errors.push(
                    "Candidate compatibility received an empty observation identity."
                );

                continue;

            }


            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate candidate compatibility observation ${observation.observationId}.`
                );

            }


            observationIds.add(
                observation.observationId
            );


            const candidate =
                candidatesById.get(
                    observation.candidateId
                );


            if (
                !candidate
            ) {

                errors.push(
                    `Observation ${observation.observationId} references unknown candidate ${observation.candidateId}.`
                );

                continue;

            }


            const boundary =
                boundariesById.get(
                    observation.boundaryId
                );


            if (
                !boundary
            ) {

                errors.push(
                    `Observation ${observation.observationId} references unknown boundary ${observation.boundaryId}.`
                );

                continue;

            }


            if (
                boundary.participantId !==
                    candidate.sourceParticipantId &&
                boundary.participantId !==
                    candidate.targetParticipantId
            ) {

                errors.push(
                    `Observation ${observation.observationId} references boundary ${observation.boundaryId} outside candidate ${candidate.candidateId}.`
                );

            }


            if (
                observation.verdict !==
                    "PRESERVED" &&
                observation.verdict !==
                    "VIOLATED"
            ) {

                errors.push(
                    `Observation ${observation.observationId} has unsupported verdict ${String(observation.verdict)}.`
                );

            }


            if (
                observation.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Observation ${observation.observationId} contains no evidence.`
                );

            }


            const evidenceIds =
                new Set<string>();


            for (
                const evidenceId
                of observation.evidenceIds
            ) {

                if (
                    !evidenceId.trim()
                ) {

                    errors.push(
                        `Observation ${observation.observationId} contains an empty evidence identity.`
                    );

                    continue;

                }


                if (
                    evidenceIds.has(
                        evidenceId
                    )
                ) {

                    errors.push(
                        `Observation ${observation.observationId} contains duplicate evidence ${evidenceId}.`
                    );

                }


                evidenceIds.add(
                    evidenceId
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                assessments:
                    [],

                errors:
                    errors.sort()

            };

        }


        const observationsByCandidateBoundary =
            new Map<
                string,
                ScientificCompositionCandidateBoundaryObservation[]
            >();


        for (
            const observation
            of input.observations
        ) {

            const key =
                encode([
                    observation.candidateId,
                    observation.boundaryId
                ]);


            const existing =
                observationsByCandidateBoundary.get(
                    key
                ) ?? [];


            existing.push(
                observation
            );


            observationsByCandidateBoundary.set(
                key,
                existing
            );

        }


        const assessments:
            ScientificCompositionCandidateCompatibilityAssessment[] =
            [];


        for (
            const candidate
            of [...input.candidateSet.candidates].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            const sourceProfile =
                profilesByProtocol.get(
                    candidate.sourceParticipantId
                )!;


            const targetProfile =
                profilesByProtocol.get(
                    candidate.targetParticipantId
                )!;


            const relevantBoundaries =
                [
                    ...sourceProfile.boundaries,
                    ...targetProfile.boundaries
                ]
                    .sort(
                        (a, b) =>
                            a.boundaryId.localeCompare(
                                b.boundaryId
                            )
                    );


            const boundaryEvaluations:
                ScientificCompositionCandidateBoundaryEvaluation[] =
                [];


            for (
                const boundary
                of relevantBoundaries
            ) {

                const observations =
                    (
                        observationsByCandidateBoundary.get(
                            encode([
                                candidate.candidateId,
                                boundary.boundaryId
                            ])
                        ) ??
                        []
                    )
                        .sort(
                            (a, b) =>
                                a.observationId.localeCompare(
                                    b.observationId
                                )
                        );


                const hasViolation =
                    observations.some(
                        observation =>
                            observation.verdict ===
                            "VIOLATED"
                    );


                const status =
                    hasViolation
                        ? "VIOLATED"
                        : observations.length >
                            0
                            ? "PRESERVED"
                            : "UNEVALUATED";


                boundaryEvaluations.push({

                    boundaryId:
                        boundary.boundaryId,

                    participantId:
                        boundary.participantId,

                    status,

                    observationIds:
                        observations.map(
                            observation =>
                                observation.observationId
                        ),

                    evidenceIds:
                        [
                            ...new Set(
                                observations.flatMap(
                                    observation =>
                                        observation.evidenceIds
                                )
                            )
                        ].sort()

                });

            }


            const preserved =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "PRESERVED"
                ).length;


            const violated =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "VIOLATED"
                ).length;


            const unevaluated =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "UNEVALUATED"
                ).length;


            let scientificPolarity:
                ScientificCompositionCandidateCompatibilityPolarity;


            if (
                violated >
                0
            ) {

                scientificPolarity =
                    "CHALLENGE";

            }
            else if (
                boundaryEvaluations.length ===
                    0 ||
                unevaluated >
                    0
            ) {

                /*
                 * Absence of known boundaries is not evidence of
                 * compatibility.
                 *
                 * Likewise, unobserved known boundaries remain
                 * scientifically inconclusive.
                 */
                scientificPolarity =
                    "INCONCLUSIVE";

            }
            else {

                /*
                 * SUPPORT is deliberately scoped only to preservation
                 * of all known participant boundaries for this exact
                 * candidate.
                 */
                scientificPolarity =
                    "SUPPORT";

            }


            assessments.push({

                assessmentId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-COMPATIBILITY",
                        candidate.candidateId
                    ]),

                candidateId:
                    candidate.candidateId,

                candidateKind:
                    candidate.kind,

                sourceParticipantId:
                    candidate.sourceParticipantId,

                targetParticipantId:
                    candidate.targetParticipantId,

                assessmentBasis:
                    "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

                boundaryEvaluations,

                statistics: {

                    total:
                        boundaryEvaluations.length,

                    preserved,

                    violated,

                    unevaluated

                },

                scientificPolarity

            });

        }


        return {

            assessments,

            errors:
                []

        };

    }

}