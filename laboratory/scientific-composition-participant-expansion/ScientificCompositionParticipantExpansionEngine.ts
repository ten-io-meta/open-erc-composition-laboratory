import type {
    ScientificProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificCompositionParticipantSource,
    ScientificExpandedCompositionParticipant
} from "./ScientificCompositionParticipantExpansion.js";

import type {
    ScientificCompositionParticipantExpansionResult
} from "./ScientificCompositionParticipantExpansionResult.js";


export interface ScientificCompositionParticipantExpansionEngineInput {

    initialParticipants:
        ScientificCompositionParticipantSource[];

    availableProtocolSources:
        ScientificCompositionParticipantSource[];

    relations:
        ScientificProtocolRelationEvidence[];

}


function sourceOccurrenceKey(
    source:
        ScientificCompositionParticipantSource
): string {

    return [
        source.protocolId,
        source.sourceId,
        source.sourceRevision ?? ""
    ]
        .map(
            component =>
                `${component.length}:${component}`
        )
        .join("|");

}


export class ScientificCompositionParticipantExpansionEngine {

    expand(
        input:
            ScientificCompositionParticipantExpansionEngineInput
    ): ScientificCompositionParticipantExpansionResult {

        const errors:
            string[] = [];


        const initialProtocolIds =
            new Set<string>();

        const availableOccurrenceKeys =
            new Set<string>();

        const relationEvidenceIds =
            new Set<string>();

        const availableByProtocolId =
            new Map<
                string,
                ScientificCompositionParticipantSource[]
            >();


        for (
            const initial
            of input.initialParticipants
        ) {

            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    initial.protocolId
                )
            ) {

                errors.push(
                    `Participant expansion received unsupported initial protocol identity ${initial.protocolId}.`
                );

            }


            if (
                !initial.sourceId.trim()
            ) {

                errors.push(
                    `Initial participant ${initial.protocolId} has an empty source identity.`
                );

            }


            if (
                initialProtocolIds.has(
                    initial.protocolId
                )
            ) {

                errors.push(
                    `Duplicate initial participant ${initial.protocolId}.`
                );

            }


            initialProtocolIds.add(
                initial.protocolId
            );

        }


        for (
            const available
            of input.availableProtocolSources
        ) {

            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    available.protocolId
                )
            ) {

                errors.push(
                    `Participant expansion received unsupported available protocol identity ${available.protocolId}.`
                );

            }


            if (
                !available.sourceId.trim()
            ) {

                errors.push(
                    `Available protocol ${available.protocolId} has an empty source identity.`
                );

            }


            const occurrenceKey =
                sourceOccurrenceKey(
                    available
                );


            if (
                availableOccurrenceKeys.has(
                    occurrenceKey
                )
            ) {

                errors.push(
                    `Duplicate available protocol source occurrence ${occurrenceKey}.`
                );

            }


            availableOccurrenceKeys.add(
                occurrenceKey
            );


            const existing =
                availableByProtocolId.get(
                    available.protocolId
                ) ?? [];


            existing.push(
                available
            );


            availableByProtocolId.set(
                available.protocolId,
                existing
            );

        }


        for (
            const relation
            of input.relations
        ) {

            if (
                !relation.relationEvidenceId.trim()
            ) {

                errors.push(
                    "Participant expansion received an empty documentary relation evidence identity."
                );

                continue;

            }


            if (
                relationEvidenceIds.has(
                    relation.relationEvidenceId
                )
            ) {

                errors.push(
                    `Duplicate documentary relation evidence identity ${relation.relationEvidenceId}.`
                );

            }


            relationEvidenceIds.add(
                relation.relationEvidenceId
            );


            if (
                relation.subjectProtocolId !==
                    undefined &&
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.subjectProtocolId
                )
            ) {

                errors.push(
                    `Relation ${relation.relationEvidenceId} has unsupported subject protocol identity ${relation.subjectProtocolId}.`
                );

            }


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.objectProtocolId
                )
            ) {

                errors.push(
                    `Relation ${relation.relationEvidenceId} has unsupported object protocol identity ${relation.objectProtocolId}.`
                );

            }

        }


        for (
            const initial
            of input.initialParticipants
        ) {

            const exactAvailable =
                (
                    availableByProtocolId.get(
                        initial.protocolId
                    ) ?? []
                )
                    .some(
                        available =>
                            available.sourceId ===
                                initial.sourceId &&
                            available.sourceRevision ===
                                initial.sourceRevision
                    );


            if (
                !exactAvailable
            ) {

                errors.push(
                    `Initial participant ${initial.protocolId} source provenance is absent from the available protocol inventory.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                participants:
                    [],

                unresolvedProtocolIds:
                    [],

                ambiguousProtocolIds:
                    [],

                unresolvedRelationEvidenceIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        const selected =
            new Map<
                string,
                ScientificExpandedCompositionParticipant
            >();


        for (
            const initial
            of input.initialParticipants
        ) {

            selected.set(
                initial.protocolId,
                {

                    ...initial,

                    expansionBasis:
                        "INITIAL_PARTICIPANT",

                    evidenceIds:
                        []

                }
            );

        }


        const unresolvedProtocolIds =
            new Set<string>();

        const ambiguousProtocolIds =
            new Set<string>();

        const unresolvedRelationEvidenceIds =
            new Set<string>();


        const relations =
            [...input.relations].sort(
                (a, b) =>
                    a.relationEvidenceId.localeCompare(
                        b.relationEvidenceId
                    )
            );


        let changed =
            true;


        while (
            changed
        ) {

            changed =
                false;


            for (
                const relation
                of relations
            ) {

                const subjectProtocolId =
                    relation.subjectProtocolId;


                if (
                    subjectProtocolId ===
                    undefined
                ) {

                    continue;

                }


                const subject =
                    selected.get(
                        subjectProtocolId
                    );


                /*
                 * Relations outside the currently reachable
                 * participant closure do not expand the frame.
                 */
                if (
                    !subject
                ) {

                    continue;

                }


                if (
                    relation.sourceId !==
                        subject.sourceId ||
                    relation.sourceRevision !==
                        subject.sourceRevision
                ) {

                    errors.push(
                        `Relation ${relation.relationEvidenceId} provenance does not match selected subject ${subjectProtocolId}.`
                    );

                    continue;

                }


                if (
                    relation.objectProtocolId ===
                    subjectProtocolId
                ) {

                    continue;

                }


                const alreadySelected =
                    selected.get(
                        relation.objectProtocolId
                    );


                if (
                    alreadySelected
                ) {

                    if (
                        alreadySelected.expansionBasis ===
                        "DOCUMENTARY_RELATION"
                    ) {

                        alreadySelected.evidenceIds =
                            [
                                ...new Set([
                                    ...alreadySelected.evidenceIds,
                                    relation.relationEvidenceId
                                ])
                            ].sort();

                    }


                    continue;

                }


                const availableSources =
                    (
                        availableByProtocolId.get(
                            relation.objectProtocolId
                        ) ?? []
                    );


                if (
                    availableSources.length ===
                    0
                ) {

                    unresolvedProtocolIds.add(
                        relation.objectProtocolId
                    );

                    unresolvedRelationEvidenceIds.add(
                        relation.relationEvidenceId
                    );

                    continue;

                }


                if (
                    availableSources.length >
                    1
                ) {

                    ambiguousProtocolIds.add(
                        relation.objectProtocolId
                    );

                    unresolvedRelationEvidenceIds.add(
                        relation.relationEvidenceId
                    );

                    continue;

                }


                const provider =
                    availableSources[0];


                selected.set(
                    relation.objectProtocolId,
                    {

                        ...provider,

                        expansionBasis:
                            "DOCUMENTARY_RELATION",

                        evidenceIds: [
                            relation.relationEvidenceId
                        ]

                    }
                );


                changed =
                    true;

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                participants:
                    [],

                unresolvedProtocolIds:
                    [],

                ambiguousProtocolIds:
                    [],

                unresolvedRelationEvidenceIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        return {

            participants:
                [...selected.values()]
                    .map(
                        participant => ({

                            ...participant,

                            evidenceIds:
                                [...participant.evidenceIds]
                                    .sort()

                        })
                    )
                    .sort(
                        (a, b) =>
                            a.protocolId.localeCompare(
                                b.protocolId
                            )
                    ),

            unresolvedProtocolIds:
                [...unresolvedProtocolIds].sort(),

            ambiguousProtocolIds:
                [...ambiguousProtocolIds].sort(),

            unresolvedRelationEvidenceIds:
                [...unresolvedRelationEvidenceIds].sort(),

            errors:
                []

        };

    }

}