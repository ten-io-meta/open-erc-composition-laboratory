import type {
    ScientificCandidateCompatibilitySupportProjection,
    ScientificCandidateFunctionalConfigurationEvidence,
    ScientificCandidateRuntimeBinding,
    ScientificObservedFunctionalInteraction,
    ScientificObservedFunctionalParticipant
} from "./ScientificCandidateFunctionalConfigurationEvidence.js";


export interface ScientificCandidateFunctionalConfigurationEvidenceInput {

    candidateId:
        string;

    participantIds:
        string[];

    runtimeBinding:
        ScientificCandidateRuntimeBinding;

    chainId:
        string | number;

    sharedRuntime:
        boolean;

    participants:
        ScientificObservedFunctionalParticipant[];

    interactions:
        ScientificObservedFunctionalInteraction[];

    compatibility:
        ScientificCandidateCompatibilitySupportProjection;

}


export interface ScientificCandidateFunctionalConfigurationEvidenceResult {

    evidence:
        ScientificCandidateFunctionalConfigurationEvidence | null;

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


function normalizeAddress(
    address:
        string
): string {

    return address
        .trim()
        .toLowerCase();

}


export class ScientificCandidateFunctionalConfigurationEvidenceEngine {

    evaluate(
        input:
            ScientificCandidateFunctionalConfigurationEvidenceInput
    ): ScientificCandidateFunctionalConfigurationEvidenceResult {

        const errors:
            string[] = [];


        if (!input.candidateId.trim()) {

            errors.push(
                "Functional configuration requires candidateId."
            );

        }


        const candidateParticipantIds =
            new Set(
                input.participantIds
            );


        if (
            input.participantIds.length <
                2 ||
            candidateParticipantIds.size !==
                input.participantIds.length
        ) {

            errors.push(
                "Functional configuration requires at least two distinct candidate participants."
            );

        }


        if (
            input.runtimeBinding.genericCandidateId !==
            input.candidateId
        ) {

            errors.push(
                "Runtime binding belongs to another generic candidate."
            );

        }


        if (
            !input.runtimeBinding.runtimeCandidateId.trim()
        ) {

            errors.push(
                "Runtime binding requires runtime candidate identity."
            );

        }


        if (
            input.runtimeBinding.evidenceIds.length ===
            0
        ) {

            errors.push(
                "Runtime binding requires explicit evidence."
            );

        }


        if (
            input.sharedRuntime !==
            true
        ) {

            errors.push(
                "Functional configuration requires one observed shared runtime."
            );

        }


        if (
            input.compatibility.candidateId !==
            input.candidateId
        ) {

            errors.push(
                "Compatibility assessment belongs to another candidate."
            );

        }


        if (
            input.compatibility.scientificPolarity !==
            "SUPPORT"
        ) {

            errors.push(
                "Functional configuration requires candidate-scoped SUPPORT."
            );

        }


        if (
            input.compatibility.total <=
                0 ||
            input.compatibility.preserved !==
                input.compatibility.total ||
            input.compatibility.violated !==
                0 ||
            input.compatibility.unevaluated !==
                0
        ) {

            errors.push(
                "Functional configuration requires complete preservation of evaluated relevant boundaries."
            );

        }


        if (
            input.compatibility.unresolvedRelevance !==
            0
        ) {

            errors.push(
                "Functional configuration cannot be evidenced with unresolved boundary relevance."
            );

        }


        const participantsById =
            new Map(
                input.participants.map(
                    participant => [
                        participant.participantId,
                        participant
                    ] as const
                )
            );


        if (
            participantsById.size !==
            input.participants.length
        ) {

            errors.push(
                "Functional configuration contains duplicate participant reports."
            );

        }


        if (
            input.participants.length !==
            input.participantIds.length
        ) {

            errors.push(
                "Functional configuration participant reports do not cover the exact candidate participant set."
            );

        }


        for (
            const participantId
            of input.participantIds
        ) {

            const participant =
                participantsById.get(
                    participantId
                );


            if (participant === undefined) {

                errors.push(
                    `Missing runtime participant ${participantId}.`
                );

                continue;

            }


            if (
                participant.executed !==
                true
            ) {

                errors.push(
                    `Participant ${participantId} was not executed.`
                );

            }


            if (
                participant.contractAddresses.length ===
                0
            ) {

                errors.push(
                    `Participant ${participantId} has no observed contract address.`
                );

            }


            const normalizedAddresses =
                participant.contractAddresses.map(
                    normalizeAddress
                );


            if (
                normalizedAddresses.some(
                    address =>
                        !address
                ) ||
                new Set(
                    normalizedAddresses
                ).size !==
                    normalizedAddresses.length
            ) {

                errors.push(
                    `Participant ${participantId} has invalid or duplicate contract addresses.`
                );

            }

        }


        for (
            const participant
            of input.participants
        ) {

            if (
                !candidateParticipantIds.has(
                    participant.participantId
                )
            ) {

                errors.push(
                    `Runtime participant ${participant.participantId} belongs outside the candidate.`
                );

            }

        }


        if (
            input.interactions.length ===
            0
        ) {

            errors.push(
                "Functional configuration requires at least one observed cross-protocol interaction."
            );

        }


        const interactionIds =
            new Set<string>();


        for (
            const interaction
            of input.interactions
        ) {

            if (
                interactionIds.has(
                    interaction.observationId
                )
            ) {

                errors.push(
                    `Duplicate functional interaction ${interaction.observationId}.`
                );

            }


            interactionIds.add(
                interaction.observationId
            );


            if (
                interaction.runtimeCandidateId !==
                input.runtimeBinding.runtimeCandidateId
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} belongs to another runtime candidate.`
                );

            }


            if (
                interaction.sourceParticipantId ===
                interaction.targetParticipantId
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} is not cross-protocol.`
                );

            }


            if (
                !candidateParticipantIds.has(
                    interaction.sourceParticipantId
                ) ||
                !candidateParticipantIds.has(
                    interaction.targetParticipantId
                )
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} references a participant outside the candidate.`
                );

                continue;

            }


            if (
                interaction.evidenceIds.length ===
                0
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} has no evidence.`
                );

            }


            const sourceParticipant =
                participantsById.get(
                    interaction.sourceParticipantId
                );

            const targetParticipant =
                participantsById.get(
                    interaction.targetParticipantId
                );


            if (
                sourceParticipant === undefined ||
                targetParticipant === undefined
            ) {

                continue;

            }


            const sourceAddresses =
                new Set(
                    sourceParticipant
                        .contractAddresses
                        .map(
                            normalizeAddress
                        )
                );


            const targetAddresses =
                new Set(
                    targetParticipant
                        .contractAddresses
                        .map(
                            normalizeAddress
                        )
                );


            if (
                !sourceAddresses.has(
                    normalizeAddress(
                        interaction.sourceAddress
                    )
                )
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} source address is not bound to source participant ${interaction.sourceParticipantId}.`
                );

            }


            if (
                !targetAddresses.has(
                    normalizeAddress(
                        interaction.targetAddress
                    )
                )
            ) {

                errors.push(
                    `Interaction ${interaction.observationId} target address is not bound to target participant ${interaction.targetParticipantId}.`
                );

            }

        }


        if (errors.length > 0) {

            return {
                evidence:
                    null,
                errors:
                    errors.sort()
            };

        }


        const evidence:
            ScientificCandidateFunctionalConfigurationEvidence = {

                configurationId:
                    encode([
                        "SCIENTIFIC-CANDIDATE-OBSERVED-FUNCTIONAL-CONFIGURATION",
                        input.candidateId,
                        input.runtimeBinding.runtimeCandidateId,
                        String(input.chainId)
                    ]),

                candidateId:
                    input.candidateId,

                runtimeCandidateId:
                    input.runtimeBinding.runtimeCandidateId,

                kind:
                    "OBSERVED_RUNTIME_CONFIGURATION",

                status:
                    "EVIDENCED",

                chainId:
                    input.chainId,

                sharedRuntime:
                    true,

                participantIds:
                    [...input.participantIds]
                        .sort(),

                participantContractAddresses:
                    input.participants
                        .map(
                            participant => ({
                                participantId:
                                    participant.participantId,

                                contractAddresses:
                                    participant
                                        .contractAddresses
                                        .map(
                                            normalizeAddress
                                        )
                                        .sort()
                            })
                        )
                        .sort(
                            (a, b) =>
                                a.participantId.localeCompare(
                                    b.participantId
                                )
                        ),

                interactionObservationIds:
                    input.interactions
                        .map(
                            interaction =>
                                interaction.observationId
                        )
                        .sort(),

                bindingEvidenceIds:
                    [...input.runtimeBinding.evidenceIds]
                        .sort(),

                interpretation:
                    "CANDIDATE_SCOPED_OBSERVED_FUNCTIONAL_CONFIGURATION"

            };


        return {
            evidence,
            errors:
                []
        };

    }

}