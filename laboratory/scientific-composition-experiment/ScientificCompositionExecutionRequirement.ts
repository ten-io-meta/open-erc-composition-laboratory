import type {
    ScientificCompositionCandidate,
    ScientificCompositionParticipantKind
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionConstraint
} from "../scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";


export interface ScientificCompositionExecutionParticipantSource {

    participantSide:
        | "A"
        | "B";

    participantKind:
        ScientificCompositionParticipantKind;

    participantId:
        string;

    sourceId:
        string;

    /*
     * Joint composition execution must use an explicitly pinned
     * scientific source revision.
     */
    sourceRevision:
        string;

    repository:
        string;

}


export interface ScientificCompositionExecutionRequirement {

    requirementId:
        string;

    evaluationSpecificationId:
        string;

    /*
     * Complete scientific composition identity.
     *
     * Execution must never reconstruct participant identity from
     * target ids, repository names, or free-form evidence strings.
     */
    candidate:
        ScientificCompositionCandidate;

    /*
     * Exact observed constraints admitted by the scientific
     * evaluation specification.
     */
    constraints:
        ScientificCompositionConstraint[];

    participantAConstraintIds:
        string[];

    participantBConstraintIds:
        string[];

    unresolvedGuardFactIds:
        string[];

    /*
     * Explicit participant -> source -> revision -> repository
     * bindings for later joint execution.
     */
    participantSources:
        ScientificCompositionExecutionParticipantSource[];

}


export function cloneScientificCompositionExecutionRequirement(
    requirement:
        ScientificCompositionExecutionRequirement
): ScientificCompositionExecutionRequirement {

    return {

        requirementId:
            requirement.requirementId,

        evaluationSpecificationId:
            requirement.evaluationSpecificationId,

        candidate: {

            ...requirement.candidate,

            participantA: {
                ...requirement.candidate.participantA
            },

            participantB: {
                ...requirement.candidate.participantB
            },

            supportingCapabilityIdsA:
                [
                    ...requirement
                        .candidate
                        .supportingCapabilityIdsA
                ].sort(),

            supportingCapabilityIdsB:
                [
                    ...requirement
                        .candidate
                        .supportingCapabilityIdsB
                ].sort(),

            provenance:
                requirement
                    .candidate
                    .provenance
                    .map(
                        provenance => ({
                            ...provenance
                        })
                    )
                    .sort(
                        (
                            left,
                            right
                        ) => {

                            const leftKey =
                                [
                                    left.kind,
                                    left.sourceId,
                                    left.sourceRevision ?? "",
                                    left.evidenceId
                                ].join("|");

                            const rightKey =
                                [
                                    right.kind,
                                    right.sourceId,
                                    right.sourceRevision ?? "",
                                    right.evidenceId
                                ].join("|");

                            return leftKey.localeCompare(
                                rightKey
                            );

                        }
                    )

        },

        constraints:
            requirement
                .constraints
                .map(
                    constraint => ({

                        ...constraint,

                        locator: {
                            ...constraint.locator
                        }

                    })
                )
                .sort(
                    (
                        left,
                        right
                    ) =>
                        left.constraintId.localeCompare(
                            right.constraintId
                        )
                ),

        participantAConstraintIds:
            [
                ...requirement
                    .participantAConstraintIds
            ].sort(),

        participantBConstraintIds:
            [
                ...requirement
                    .participantBConstraintIds
            ].sort(),

        unresolvedGuardFactIds:
            [
                ...requirement
                    .unresolvedGuardFactIds
            ].sort(),

        participantSources:
            requirement
                .participantSources
                .map(
                    source => ({
                        ...source
                    })
                )
                .sort(
                    (
                        left,
                        right
                    ) => {

                        const leftKey =
                            [
                                left.participantSide,
                                left.participantKind,
                                left.participantId,
                                left.sourceId,
                                left.sourceRevision,
                                left.repository
                            ].join("|");

                        const rightKey =
                            [
                                right.participantSide,
                                right.participantKind,
                                right.participantId,
                                right.sourceId,
                                right.sourceRevision,
                                right.repository
                            ].join("|");

                        return leftKey.localeCompare(
                            rightKey
                        );

                    }
                )

    };

}
