import type {
    ScientificCompositionComplementarityMatch
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityMatch.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificCompositionBoundaryObservation
} from "./ScientificCompositionBoundaryObservation.js";

import type {
    ScientificCompositionBoundaryEvaluation,
    ScientificCompositionCompatibilityAssessment,
    ScientificCompositionCompatibilityPolarity,
    ScientificCompositionCompatibilityResult
} from "./ScientificCompositionCompatibilityAssessment.js";


export interface ScientificCompositionCompatibilityEngineInput {

    profiles:
        ScientificProtocolCompositionProfile[];

    matches:
        ScientificCompositionComplementarityMatch[];

    observations:
        ScientificCompositionBoundaryObservation[];

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


export class ScientificCompositionCompatibilityEngine {

    evaluate(
        input:
            ScientificCompositionCompatibilityEngineInput
    ): ScientificCompositionCompatibilityResult {

        const errors:
            string[] = [];


        const profilesByProtocol =
            new Map<
                string,
                ScientificProtocolCompositionProfile
            >();

        const boundariesById =
            new Map<
                string,
                {
                    participantId:
                        string;
                }
            >();


        for (
            const profile
            of input.profiles
        ) {

            if (
                profilesByProtocol.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate protocol profile ${profile.protocolId}.`
                );

                continue;

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
                    boundary.participantId !==
                    profile.protocolId
                ) {

                    errors.push(
                        `Boundary ${boundary.boundaryId} does not belong to profile ${profile.protocolId}.`
                    );

                }


                if (
                    boundariesById.has(
                        boundary.boundaryId
                    )
                ) {

                    errors.push(
                        `Duplicate boundary ${boundary.boundaryId}.`
                    );

                }


                boundariesById.set(
                    boundary.boundaryId,
                    {
                        participantId:
                            profile.protocolId
                    }
                );

            }

        }


        const matchesById =
            new Map<
                string,
                ScientificCompositionComplementarityMatch
            >();


        for (
            const match
            of input.matches
        ) {

            if (
                matchesById.has(
                    match.matchId
                )
            ) {

                errors.push(
                    `Duplicate complementarity match ${match.matchId}.`
                );

                continue;

            }


            matchesById.set(
                match.matchId,
                match
            );


            if (
                !profilesByProtocol.has(
                    match.consumerParticipantId
                )
            ) {

                errors.push(
                    `Match ${match.matchId} references unknown consumer ${match.consumerParticipantId}.`
                );

            }


            if (
                !profilesByProtocol.has(
                    match.providerParticipantId
                )
            ) {

                errors.push(
                    `Match ${match.matchId} references unknown provider ${match.providerParticipantId}.`
                );

            }


            if (
                match.consumerParticipantId ===
                match.providerParticipantId
            ) {

                errors.push(
                    `Match ${match.matchId} cannot use the same participant as consumer and provider.`
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
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate boundary observation ${observation.observationId}.`
                );

            }


            observationIds.add(
                observation.observationId
            );


            const match =
                matchesById.get(
                    observation.matchId
                );


            if (!match) {

                errors.push(
                    `Boundary observation ${observation.observationId} references unknown match ${observation.matchId}.`
                );

                continue;

            }


            const boundary =
                boundariesById.get(
                    observation.boundaryId
                );


            if (!boundary) {

                errors.push(
                    `Boundary observation ${observation.observationId} references unknown boundary ${observation.boundaryId}.`
                );

                continue;

            }


            const belongsToMatch =
                boundary.participantId ===
                    match.consumerParticipantId ||
                boundary.participantId ===
                    match.providerParticipantId;


            if (!belongsToMatch) {

                errors.push(
                    `Boundary observation ${observation.observationId} uses boundary ${observation.boundaryId} from a participant outside match ${observation.matchId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                assessments: [],
                errors
            };

        }


        const observationsByMatchBoundary =
            new Map<
                string,
                ScientificCompositionBoundaryObservation[]
            >();


        for (
            const observation
            of input.observations
        ) {

            const key =
                encode([
                    observation.matchId,
                    observation.boundaryId
                ]);


            const existing =
                observationsByMatchBoundary.get(
                    key
                ) ?? [];


            existing.push(
                observation
            );


            observationsByMatchBoundary.set(
                key,
                existing
            );

        }


        const assessments:
            ScientificCompositionCompatibilityAssessment[] = [];


        for (
            const match
            of [...input.matches].sort(
                (a, b) =>
                    a.matchId.localeCompare(
                        b.matchId
                    )
            )
        ) {

            const consumer =
                profilesByProtocol.get(
                    match.consumerParticipantId
                )!;

            const provider =
                profilesByProtocol.get(
                    match.providerParticipantId
                )!;


            const relevantBoundaries =
                [
                    ...consumer.boundaries,
                    ...provider.boundaries
                ]
                .sort(
                    (a, b) =>
                        a.boundaryId.localeCompare(
                            b.boundaryId
                        )
                );


            const boundaryEvaluations:
                ScientificCompositionBoundaryEvaluation[] = [];


            for (
                const boundary
                of relevantBoundaries
            ) {

                const key =
                    encode([
                        match.matchId,
                        boundary.boundaryId
                    ]);


                const observations =
                    [
                        ...(
                            observationsByMatchBoundary.get(
                                key
                            ) ?? []
                        )
                    ]
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


                const hasPreservation =
                    observations.some(
                        observation =>
                            observation.verdict ===
                            "PRESERVED"
                    );


                const status:
                    ScientificCompositionBoundaryEvaluation["status"] =
                    hasViolation
                        ? "VIOLATED"
                        : hasPreservation
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
                        observations
                            .flatMap(
                                observation =>
                                    observation.evidenceIds
                            )
                            .sort()

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
                ScientificCompositionCompatibilityPolarity;


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
                 * No observed barriers is not evidence that
                 * compatibility is safe.
                 */
                scientificPolarity =
                    "INCONCLUSIVE";

            }
            else {

                scientificPolarity =
                    "SUPPORT";

            }


            assessments.push({

                assessmentId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-COMPATIBILITY",
                        match.matchId
                    ]),

                matchId:
                    match.matchId,

                consumerParticipantId:
                    match.consumerParticipantId,

                providerParticipantId:
                    match.providerParticipantId,

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
            errors: []
        };

    }

}
