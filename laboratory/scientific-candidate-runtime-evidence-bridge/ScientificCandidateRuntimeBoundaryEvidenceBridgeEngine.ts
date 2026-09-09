import type {
    ScientificCompositionCandidateBoundaryObservation
} from "../scientific-composition-candidate-compatibility/ScientificCompositionCandidateBoundaryObservation.js";

import type {
    ScientificStructuralFoundationCompositionCandidateRecord
} from "../scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionConstraintObservation
} from "../scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";


export interface ScientificCandidateRuntimeBoundaryEvidenceBinding {

    targetObservationId:
        string;

    sourceObservationId:
        string;

    sourceConstraintId:
        string;

    sourceFactId:
        string;

    targetBoundaryId:
        string;

}


export interface ScientificCandidateRuntimeBoundaryEvidenceBridgeResult {

    observations:
        ScientificCompositionCandidateBoundaryObservation[];

    bindings:
        ScientificCandidateRuntimeBoundaryEvidenceBinding[];

    errors:
        string[];

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


function normalize(
    value:
        string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}


function sortedUnique(
    values:
        string[]
): string[] {

    return [
        ...new Set(values)
    ].sort();

}


export class ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine {

    bridge(
        candidate:
            ScientificStructuralFoundationCompositionCandidateRecord,
        requirement:
            ScientificCompositionExecutionRequirement,
        constraintObservations:
            ScientificCompositionConstraintObservation[],
        profiles:
            ScientificProtocolCompositionProfile[]
    ): ScientificCandidateRuntimeBoundaryEvidenceBridgeResult {

        const errors:
            string[] = [];


        if (
            candidate.kind !==
            "STRUCTURAL_FOUNDATION"
        ) {

            errors.push(
                "Runtime boundary bridge requires a structural-foundation target candidate."
            );

        }


        if (
            candidate.directionality !==
            "UNDIRECTED"
        ) {

            errors.push(
                "Structural-foundation target candidate must remain undirected."
            );

        }


        if (
            requirement.candidate.candidateId !==
            candidate.sourceCrossProtocolCandidateId
        ) {

            errors.push(
                "Execution requirement candidate identity does not match the structural candidate source identity."
            );

        }


        if (
            requirement.candidate.mechanism !==
            "SHARED_PROTOCOL_FOUNDATION"
        ) {

            errors.push(
                "Execution requirement does not represent shared-protocol-foundation discovery."
            );

        }


        if (
            requirement.candidate.foundationProtocolId !==
            candidate.foundationProtocolId
        ) {

            errors.push(
                "Execution requirement foundation does not match the structural target candidate."
            );

        }


        const sourceParticipants =
            [
                requirement.candidate.participantA.id,
                requirement.candidate.participantB.id
            ].sort();


        const targetParticipants =
            [
                candidate.sourceParticipantId,
                candidate.targetParticipantId
            ].sort();


        if (
            JSON.stringify(sourceParticipants) !==
            JSON.stringify(targetParticipants)
        ) {

            errors.push(
                "Execution requirement participants do not match the structural target candidate."
            );

        }


        const profilesByProtocol =
            new Map(
                profiles.map(
                    profile => [
                        profile.protocolId,
                        profile
                    ] as const
                )
            );


        if (
            profilesByProtocol.size !==
            profiles.length
        ) {

            errors.push(
                "Runtime boundary bridge received duplicate protocol profiles."
            );

        }


        const constraintsById =
            new Map(
                requirement.constraints.map(
                    constraint => [
                        constraint.constraintId,
                        constraint
                    ] as const
                )
            );


        if (
            constraintsById.size !==
            requirement.constraints.length
        ) {

            errors.push(
                "Execution requirement contains duplicate constraint identities."
            );

        }


        const seenObservationIds =
            new Set<string>();


        for (
            const observation
            of constraintObservations
        ) {

            if (
                seenObservationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate runtime constraint observation ${observation.observationId}.`
                );

            }


            seenObservationIds.add(
                observation.observationId
            );


            if (
                observation.candidateId !==
                requirement.candidate.candidateId
            ) {

                errors.push(
                    `Runtime observation ${observation.observationId} belongs to another source candidate.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                observations: [],
                bindings: [],
                errors: errors.sort()
            };

        }


        const observations:
            ScientificCompositionCandidateBoundaryObservation[] =
            [];

        const bindings:
            ScientificCandidateRuntimeBoundaryEvidenceBinding[] =
            [];


        for (
            const observation
            of [...constraintObservations].sort(
                (a, b) =>
                    a.observationId.localeCompare(
                        b.observationId
                    )
            )
        ) {

            const constraint =
                constraintsById.get(
                    observation.constraintId
                );


            if (
                constraint ===
                undefined
            ) {

                errors.push(
                    `Runtime observation ${observation.observationId} references unknown constraint ${observation.constraintId}.`
                );

                continue;

            }


            if (
                constraint.candidateId !==
                requirement.candidate.candidateId
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} belongs to another source candidate.`
                );

                continue;

            }


            const expectedParticipant =
                constraint.participantSide ===
                    "A"
                    ? requirement.candidate.participantA
                    : requirement.candidate.participantB;


            if (
                expectedParticipant.id !==
                constraint.participantId
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} participant identity disagrees with its candidate side.`
                );

                continue;

            }


            if (
                !targetParticipants.includes(
                    constraint.participantId
                )
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} belongs outside the structural target candidate.`
                );

                continue;

            }


            const profile =
                profilesByProtocol.get(
                    constraint.participantId
                );


            if (
                profile ===
                undefined
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} has no matching generic protocol profile.`
                );

                continue;

            }


            if (
                profile.sourceId !==
                constraint.sourceId
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} source identity does not match its generic profile.`
                );

                continue;

            }


            if (
                constraint.sourceRevision ===
                    undefined ||
                profile.sourceRevision ===
                    undefined ||
                constraint.sourceRevision.toLowerCase() !==
                    profile.sourceRevision.toLowerCase()
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} source revision does not exactly match its generic profile.`
                );

                continue;

            }


            const matchingBoundaries =
                profile.boundaries.filter(
                    boundary =>
                        boundary.participantId ===
                            constraint.participantId &&
                        boundary.kind ===
                            "SOURCE_CONSTRAINT" &&
                        boundary.evidenceIds.includes(
                            constraint.factId
                        ) &&
                        normalize(
                            boundary.subject
                        ) ===
                        normalize(
                            constraint.rawText
                        )
                );


            if (
                matchingBoundaries.length !==
                1
            ) {

                errors.push(
                    `Constraint ${constraint.constraintId} requires exactly one generic boundary match, observed ${matchingBoundaries.length}.`
                );

                continue;

            }


            const boundary =
                matchingBoundaries[0];


            const targetObservationId =
                encode([
                    "SCIENTIFIC-CANDIDATE-RUNTIME-BOUNDARY-OBSERVATION",
                    candidate.candidateId,
                    observation.observationId,
                    boundary.boundaryId
                ]);


            observations.push({

                observationId:
                    targetObservationId,

                candidateId:
                    candidate.candidateId,

                boundaryId:
                    boundary.boundaryId,

                verdict:
                    observation.verdict,

                evidenceIds:
                    sortedUnique([
                        observation.observationId,
                        constraint.constraintId,
                        constraint.factId,
                        ...boundary.evidenceIds,
                        ...observation.evidence
                    ])

            });


            bindings.push({

                targetObservationId,

                sourceObservationId:
                    observation.observationId,

                sourceConstraintId:
                    constraint.constraintId,

                sourceFactId:
                    constraint.factId,

                targetBoundaryId:
                    boundary.boundaryId

            });

        }


        if (
            errors.length >
            0
        ) {

            return {
                observations: [],
                bindings: [],
                errors: errors.sort()
            };

        }


        observations.sort(
            (a, b) =>
                a.observationId.localeCompare(
                    b.observationId
                )
        );


        bindings.sort(
            (a, b) =>
                a.targetObservationId.localeCompare(
                    b.targetObservationId
                )
        );


        return {
            observations,
            bindings,
            errors: []
        };

    }

}