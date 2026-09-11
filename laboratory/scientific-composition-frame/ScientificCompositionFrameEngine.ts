import type {
    ScientificCompositionFrame,
    ScientificCompositionFrameObjective
} from "./ScientificCompositionFrame.js";

import type {
    ScientificCompositionFrameParticipant
} from "./ScientificCompositionFrameParticipant.js";

import type {
    ScientificCompositionContribution
} from "./ScientificCompositionContribution.js";

import type {
    ScientificCompositionBoundary
} from "./ScientificCompositionBoundary.js";

import type {
    ScientificCompositionNeed
} from "./ScientificCompositionNeed.js";

import type {
    ScientificCompositionFrameResult
} from "./ScientificCompositionFrameResult.js";


export interface ScientificCompositionFrameEngineInput {

    objective:
        ScientificCompositionFrameObjective;

    participants:
        ScientificCompositionFrameParticipant[];

    contributions?:
        ScientificCompositionContribution[];

    boundaries?:
        ScientificCompositionBoundary[];

    needs?:
        ScientificCompositionNeed[];

}


export class ScientificCompositionFrameEngine {

    build(
        input:
            ScientificCompositionFrameEngineInput
    ): ScientificCompositionFrameResult {

        const errors:
            string[] = [];


        const participants =
            [...input.participants]
                .sort(
                    (a, b) =>
                        a.participantId.localeCompare(
                            b.participantId
                        )
                );


        if (
            participants.length <
            2
        ) {

            errors.push(
                "A scientific composition frame requires at least two participants."
            );

        }


        const participantIds =
            new Set<string>();


        for (
            const participant
            of participants
        ) {

            if (
                participantIds.has(
                    participant.participantId
                )
            ) {

                errors.push(
                    `Duplicate scientific composition frame participant ${participant.participantId}.`
                );

                continue;

            }


            participantIds.add(
                participant.participantId
            );

        }


        const contributions =
            [
                ...(input.contributions ?? [])
            ].sort(
                (a, b) =>
                    a.contributionId.localeCompare(
                        b.contributionId
                    )
            );


        const boundaries =
            [
                ...(input.boundaries ?? [])
            ].sort(
                (a, b) =>
                    a.boundaryId.localeCompare(
                        b.boundaryId
                    )
            );


        const needs =
            [
                ...(input.needs ?? [])
            ].sort(
                (a, b) =>
                    a.needId.localeCompare(
                        b.needId
                    )
            );


        for (
            const contribution
            of contributions
        ) {

            if (
                !participantIds.has(
                    contribution.participantId
                )
            ) {

                errors.push(
                    `Scientific composition contribution ${contribution.contributionId} references unknown participant ${contribution.participantId}.`
                );

            }

        }


        for (
            const boundary
            of boundaries
        ) {

            if (
                !participantIds.has(
                    boundary.participantId
                )
            ) {

                errors.push(
                    `Scientific composition boundary ${boundary.boundaryId} references unknown participant ${boundary.participantId}.`
                );

            }

        }


        for (
            const need
            of needs
        ) {

            if (
                !participantIds.has(
                    need.participantId
                )
            ) {

                errors.push(
                    `Scientific composition need ${need.needId} references unknown participant ${need.participantId}.`
                );

            }


            for (
                const providerId
                of need.candidateProviderParticipantIds
            ) {

                if (
                    !participantIds.has(
                        providerId
                    )
                ) {

                    errors.push(
                        `Scientific composition need ${need.needId} references unknown provider ${providerId}.`
                    );

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                frame:
                    null,

                errors

            };

        }


        const frameId =
            [
                "SCIENTIFIC-COMPOSITION-FRAME",
                input.objective.objectiveId,
                ...participants.map(
                    participant =>
                        participant.participantId
                )
            ].join("|");


        const frame:
            ScientificCompositionFrame = {

                frameId,

                objective: {

                    objectiveId:
                        input.objective.objectiveId,

                    description:
                        input.objective.description,

                    requiredSubjects:
                        [
                            ...input.objective.requiredSubjects
                        ].sort()

                },

                participants:
                    participants.map(
                        participant => ({

                            ...participant,

                            sourceIds:
                                [
                                    ...participant.sourceIds
                                ].sort(),

                            sourceRevisions:
                                [
                                    ...participant.sourceRevisions
                                ].sort()

                        })
                    ),

                contributions,

                boundaries,

                needs,

                evaluationStatus:
                    "UNEVALUATED"

            };


        return {

            frame,

            errors: []

        };

    }

}
