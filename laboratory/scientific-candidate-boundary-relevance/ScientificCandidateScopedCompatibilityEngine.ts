import type {
    ScientificCompositionCandidateSetResult
} from "../scientific-composition-candidate-set/ScientificCompositionCandidateSetResult.js";

import type {
    ScientificCompositionCandidateBoundaryObservation
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateBoundaryObservation.js";

import {
    ScientificCompositionCandidateCompatibilityEngine
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import type {
    ScientificCompositionCandidateCompatibilityProfile,
    ScientificCompositionCandidateCompatibilityProfileBoundary
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import type {
    ScientificCompositionCandidateCompatibilityAssessment
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityAssessment.js";

import type {
    ScientificCandidateBoundaryRelevanceAssessment
} from "./ScientificCandidateBoundaryRelevanceAssessment.js";


export interface ScientificCandidateScopedCompatibilityAssessment {

    candidateId:
        string;

    compatibility:
        ScientificCompositionCandidateCompatibilityAssessment;

    relevanceStatistics: {

        protocolBoundaryTotal:
            number;

        relevant:
            number;

        outOfScope:
            number;

        unresolved:
            number;

    };

    outOfScopeBoundaryIds:
        string[];

    unresolvedBoundaryIds:
        string[];

}


export interface ScientificCandidateScopedCompatibilityResult {

    assessments:
        ScientificCandidateScopedCompatibilityAssessment[];

    errors:
        string[];

}


export interface ScientificCandidateScopedCompatibilityInput {

    profiles:
        ScientificCompositionCandidateCompatibilityProfile[];

    candidateSet:
        ScientificCompositionCandidateSetResult;

    observations:
        ScientificCompositionCandidateBoundaryObservation[];

    relevanceAssessments:
        ScientificCandidateBoundaryRelevanceAssessment[];

}


export class ScientificCandidateScopedCompatibilityEngine {

    evaluate(
        input:
            ScientificCandidateScopedCompatibilityInput
    ): ScientificCandidateScopedCompatibilityResult {

        const errors:
            string[] = [];


        if (
            input.candidateSet.errors.length >
            0
        ) {

            errors.push(
                "Cannot evaluate scoped compatibility from candidate set containing errors."
            );

        }


        const profilesByProtocol =
            new Map(
                input.profiles.map(
                    profile => [
                        profile.protocolId,
                        profile
                    ] as const
                )
            );


        if (
            profilesByProtocol.size !==
            input.profiles.length
        ) {

            errors.push(
                "Scoped compatibility received duplicate profiles."
            );

        }


        const boundariesById =
            new Map<
                string,
                ScientificCompositionCandidateCompatibilityProfileBoundary
            >();


        for (const profile of input.profiles) {

            for (const boundary of profile.boundaries) {

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
                    ] as const
                )
            );


        const relevanceKeys =
            new Set<string>();


        for (
            const relevance
            of input.relevanceAssessments
        ) {

            const candidate =
                candidatesById.get(
                    relevance.candidateId
                );


            if (candidate === undefined) {

                errors.push(
                    `Relevance assessment ${relevance.assessmentId} references unknown candidate ${relevance.candidateId}.`
                );

                continue;

            }


            const boundary =
                boundariesById.get(
                    relevance.boundaryId
                );


            if (boundary === undefined) {

                errors.push(
                    `Relevance assessment ${relevance.assessmentId} references unknown boundary ${relevance.boundaryId}.`
                );

                continue;

            }


            if (
                boundary.participantId !==
                relevance.participantId
            ) {

                errors.push(
                    `Relevance assessment ${relevance.assessmentId} has incorrect boundary ownership.`
                );

            }


            if (
                relevance.participantId !==
                    candidate.sourceParticipantId &&
                relevance.participantId !==
                    candidate.targetParticipantId
            ) {

                errors.push(
                    `Relevance assessment ${relevance.assessmentId} belongs outside candidate ${candidate.candidateId}.`
                );

            }


            if (
                relevance.relevance ===
                    "RELEVANT" &&
                (
                    relevance.reason !==
                        "EXPLICIT_CANDIDATE_REACHABILITY_EVIDENCE" ||
                    relevance.evidenceIds.length ===
                        0
                )
            ) {

                errors.push(
                    `Relevant boundary ${relevance.boundaryId} lacks explicit reachability evidence.`
                );

            }


            if (
                relevance.relevance ===
                    "OUT_OF_SCOPE" &&
                (
                    relevance.reason !==
                        "EXPLICIT_CANDIDATE_EXCLUSION_EVIDENCE" ||
                    relevance.evidenceIds.length ===
                        0
                )
            ) {

                errors.push(
                    `Out-of-scope boundary ${relevance.boundaryId} lacks explicit exclusion evidence.`
                );

            }


            const key =
                `${relevance.candidateId}|${relevance.boundaryId}`;


            if (
                relevanceKeys.has(
                    key
                )
            ) {

                errors.push(
                    `Duplicate relevance assessment for ${key}.`
                );

            }


            relevanceKeys.add(
                key
            );

        }


        /*
         * Once scoped relevance is supplied, every protocol boundary
         * belonging to every candidate must have exactly one relevance
         * assessment.
         *
         * Missing relevance never means OUT_OF_SCOPE.
         */
        for (
            const candidate
            of input.candidateSet.candidates
        ) {

            const sourceProfile =
                profilesByProtocol.get(
                    candidate.sourceParticipantId
                );

            const targetProfile =
                profilesByProtocol.get(
                    candidate.targetParticipantId
                );


            if (
                sourceProfile === undefined ||
                targetProfile === undefined
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} has missing participant profile.`
                );

                continue;

            }


            const candidateBoundaries = [
                ...sourceProfile.boundaries,
                ...targetProfile.boundaries
            ];


            for (
                const boundary
                of candidateBoundaries
            ) {

                const key =
                    `${candidate.candidateId}|${boundary.boundaryId}`;


                if (
                    !relevanceKeys.has(
                        key
                    )
                ) {

                    errors.push(
                        `Candidate ${candidate.candidateId} has no relevance assessment for boundary ${boundary.boundaryId}.`
                    );

                }

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


        const assessments:
            ScientificCandidateScopedCompatibilityAssessment[] =
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


            const protocolBoundaries = [
                ...sourceProfile.boundaries,
                ...targetProfile.boundaries
            ];


            const candidateRelevance =
                input.relevanceAssessments.filter(
                    relevance =>
                        relevance.candidateId ===
                        candidate.candidateId
                );


            const relevant =
                candidateRelevance.filter(
                    relevance =>
                        relevance.relevance ===
                        "RELEVANT"
                );


            const outOfScope =
                candidateRelevance.filter(
                    relevance =>
                        relevance.relevance ===
                        "OUT_OF_SCOPE"
                );


            const unresolved =
                candidateRelevance.filter(
                    relevance =>
                        relevance.relevance ===
                        "UNRESOLVED"
                );


            const relevantBoundaryIds =
                new Set(
                    relevant.map(
                        relevance =>
                            relevance.boundaryId
                    )
                );


            const scopedProfiles:
                ScientificCompositionCandidateCompatibilityProfile[] = [
                    {
                        protocolId:
                            sourceProfile.protocolId,

                        boundaries:
                            sourceProfile.boundaries.filter(
                                boundary =>
                                    relevantBoundaryIds.has(
                                        boundary.boundaryId
                                    )
                            )
                    },
                    {
                        protocolId:
                            targetProfile.protocolId,

                        boundaries:
                            targetProfile.boundaries.filter(
                                boundary =>
                                    relevantBoundaryIds.has(
                                        boundary.boundaryId
                                    )
                            )
                    }
                ];


            const scopedCandidateSet:
                ScientificCompositionCandidateSetResult = {

                    candidates: [
                        candidate
                    ],

                    errors:
                        []

                };


            const scopedObservations =
                input.observations.filter(
                    observation =>
                        observation.candidateId ===
                            candidate.candidateId &&
                        relevantBoundaryIds.has(
                            observation.boundaryId
                        )
                );


            /*
             * An observation of an OUT_OF_SCOPE or UNRESOLVED boundary
             * contradicts its relevance classification because runtime
             * observation itself demonstrates candidate reachability.
             */
            const contradictoryObservation =
                input.observations.find(
                    observation =>
                        observation.candidateId ===
                            candidate.candidateId &&
                        !relevantBoundaryIds.has(
                            observation.boundaryId
                        )
                );


            if (
                contradictoryObservation !==
                undefined
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} observes boundary ${contradictoryObservation.boundaryId} that is not classified RELEVANT.`
                );

                continue;

            }


            const compatibility =
                new ScientificCompositionCandidateCompatibilityEngine()
                    .evaluate({

                        profiles:
                            scopedProfiles,

                        candidateSet:
                            scopedCandidateSet,

                        observations:
                            scopedObservations

                    });


            if (
                compatibility.errors.length >
                0 ||
                compatibility.assessments.length !==
                1
            ) {

                errors.push(
                    ...compatibility.errors,
                    `Candidate ${candidate.candidateId} did not produce exactly one scoped compatibility assessment.`
                );

                continue;

            }


            const base =
                compatibility.assessments[0];


            /*
             * A demonstrated violation remains CHALLENGE even if some
             * other boundaries still have unresolved relevance.
             *
             * SUPPORT, however, requires zero unresolved relevance.
             */
            const scientificPolarity =
                base.scientificPolarity ===
                    "CHALLENGE"
                    ? "CHALLENGE"
                    : unresolved.length >
                        0
                        ? "INCONCLUSIVE"
                        : base.scientificPolarity;


            assessments.push({

                candidateId:
                    candidate.candidateId,

                compatibility: {
                    ...base,
                    scientificPolarity
                },

                relevanceStatistics: {

                    protocolBoundaryTotal:
                        protocolBoundaries.length,

                    relevant:
                        relevant.length,

                    outOfScope:
                        outOfScope.length,

                    unresolved:
                        unresolved.length

                },

                outOfScopeBoundaryIds:
                    outOfScope
                        .map(
                            item =>
                                item.boundaryId
                        )
                        .sort(),

                unresolvedBoundaryIds:
                    unresolved
                        .map(
                            item =>
                                item.boundaryId
                        )
                        .sort()

            });

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


        return {
            assessments,
            errors:
                []
        };

    }

}