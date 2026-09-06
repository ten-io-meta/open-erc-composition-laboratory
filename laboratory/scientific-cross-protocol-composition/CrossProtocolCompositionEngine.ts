import type {
    ScientificProtocolConcept
} from "../scientific-protocol-concept-attribution/ScientificProtocolConcept.js";

import type {
    ScientificProtocolConceptAttributionResult
} from "../scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.js";

import type {
    ScientificProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificProtocolRelationEvidenceResult
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidenceResult.js";

import type {
    ScientificCompositionCandidate,
    ScientificCompositionParticipant,
    ScientificCompositionProvenance
} from "./ScientificCompositionCandidate.js";

import type {
    ScientificCrossProtocolCompositionResult
} from "./ScientificCrossProtocolCompositionResult.js";


export interface CrossProtocolCompositionInput {

    /*
     * May contain independently derived protocol concepts from
     * multiple scientific sources or revisions.
     */
    protocolConceptResults:
        ScientificProtocolConceptAttributionResult[];

    /*
     * May contain explicit documentary relations from multiple
     * scientific sources or revisions.
     */
    protocolRelationEvidenceResults:
        ScientificProtocolRelationEvidenceResult[];

}


interface SourcedProtocolConcept {

    sourceId:
        string;

    sourceRevision?:
        string;

    concept:
        ScientificProtocolConcept;

}


interface SourcedProtocolRelation {

    sourceId:
        string;

    sourceRevision?:
        string;

    relation:
        ScientificProtocolRelationEvidence;

}


interface CandidateAccumulator {

    candidateId:
        string;

    participantA:
        ScientificCompositionParticipant;

    participantB:
        ScientificCompositionParticipant;

    mechanism:
        "EXPLICIT_EXTENSION_FOR"
        | "SHARED_RECURRENT_CONCEPT";

    conceptId?:
        string;

    supportingCapabilityIdsA:
        Set<string>;

    supportingCapabilityIdsB:
        Set<string>;

    provenance:
        Map<
            string,
            ScientificCompositionProvenance
        >;

}


interface ProtocolConceptAggregate {

    protocolId:
        string;

    conceptId:
        string;

    lexicalCapabilityIds:
        Set<string>;

    provenance:
        Map<
            string,
            ScientificCompositionProvenance
        >;

}


export class CrossProtocolCompositionEngine {

    discover(
        input:
            CrossProtocolCompositionInput
    ): ScientificCrossProtocolCompositionResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                errors

            };

        }


        const candidateAccumulators =
            new Map<
                string,
                CandidateAccumulator
            >();


        const sourcedRelations =
            this.sourcedRelations(
                input.protocolRelationEvidenceResults
            );


        for (
            const sourcedRelation
            of sourcedRelations
        ) {

            const relation =
                sourcedRelation.relation;


            if (
                relation.relation !==
                "EXTENSION_FOR"
            ) {

                continue;

            }


            const participantA:
                ScientificCompositionParticipant = {

                kind:
                    "SYMBOLIC_SUBJECT",

                id:
                    relation.subjectSymbol

            };


            const participantB:
                ScientificCompositionParticipant = {

                kind:
                    "PROTOCOL",

                id:
                    relation.objectProtocolId

            };


            const candidateId =
                this.candidateId(
                    "EXPLICIT_EXTENSION_FOR",
                    participantA,
                    participantB,
                    undefined
                );


            let accumulator =
                candidateAccumulators.get(
                    candidateId
                );


            if (
                !accumulator
            ) {

                accumulator = {

                    candidateId,

                    participantA,

                    participantB,

                    mechanism:
                        "EXPLICIT_EXTENSION_FOR",

                    supportingCapabilityIdsA:
                        new Set<string>(),

                    supportingCapabilityIdsB:
                        new Set<string>(),

                    provenance:
                        new Map<
                            string,
                            ScientificCompositionProvenance
                        >()

                };


                candidateAccumulators.set(
                    candidateId,
                    accumulator
                );

            }


            const provenance:
                ScientificCompositionProvenance = {

                kind:
                    "PROTOCOL_RELATION",

                sourceId:
                    sourcedRelation.sourceId,

                sourceRevision:
                    sourcedRelation.sourceRevision,

                evidenceId:
                    relation.relationEvidenceId

            };


            accumulator.provenance.set(
                this.provenanceKey(
                    provenance
                ),
                provenance
            );

        }


        const sourcedConcepts =
            this.sourcedConcepts(
                input.protocolConceptResults
            );


        const conceptsByConceptId =
            new Map<
                string,
                SourcedProtocolConcept[]
            >();


        for (
            const sourcedConcept
            of sourcedConcepts
        ) {

            const concept =
                sourcedConcept.concept;


            const existing =
                conceptsByConceptId.get(
                    concept.conceptId
                ) ??
                [];


            existing.push(
                sourcedConcept
            );


            conceptsByConceptId.set(
                concept.conceptId,
                existing
            );

        }


        for (
            const [
                conceptId,
                conceptEntries
            ]
            of conceptsByConceptId
        ) {

            const byProtocol =
                new Map<
                    string,
                    ProtocolConceptAggregate
                >();


            for (
                const sourcedConcept
                of conceptEntries
            ) {

                const concept =
                    sourcedConcept.concept;


                let aggregate =
                    byProtocol.get(
                        concept.protocolId
                    );


                if (
                    !aggregate
                ) {

                    aggregate = {

                        protocolId:
                            concept.protocolId,

                        conceptId:
                            concept.conceptId,

                        lexicalCapabilityIds:
                            new Set<string>(),

                        provenance:
                            new Map<
                                string,
                                ScientificCompositionProvenance
                            >()

                    };


                    byProtocol.set(
                        concept.protocolId,
                        aggregate
                    );

                }


                for (
                    const capabilityId
                    of concept.lexicalCapabilityIds
                ) {

                    aggregate
                        .lexicalCapabilityIds
                        .add(
                            capabilityId
                        );

                }


                const provenance:
                    ScientificCompositionProvenance = {

                    kind:
                        "PROTOCOL_CONCEPT",

                    sourceId:
                        sourcedConcept.sourceId,

                    sourceRevision:
                        sourcedConcept.sourceRevision,

                    evidenceId:
                        concept.protocolConceptId

                };


                aggregate.provenance.set(
                    this.provenanceKey(
                        provenance
                    ),
                    provenance
                );

            }


            const protocolAggregates =
                [
                    ...byProtocol.values()
                ].sort(
                    (
                        a,
                        b
                    ) =>
                        a.protocolId.localeCompare(
                            b.protocolId
                        )
                );


            for (
                let i =
                    0;
                i <
                    protocolAggregates.length;
                i++
            ) {

                for (
                    let j =
                        i + 1;
                    j <
                        protocolAggregates.length;
                    j++
                ) {

                    const first =
                        protocolAggregates[i];

                    const second =
                        protocolAggregates[j];


                    /*
                     * Shared recurrent semantic structure only
                     * opens a cross-protocol candidate when the
                     * two independently attributed concepts belong
                     * to distinct protocols.
                     */
                    if (
                        first.protocolId ===
                        second.protocolId
                    ) {

                        continue;

                    }


                    const participantA:
                        ScientificCompositionParticipant = {

                        kind:
                            "PROTOCOL",

                        id:
                            first.protocolId

                    };


                    const participantB:
                        ScientificCompositionParticipant = {

                        kind:
                            "PROTOCOL",

                        id:
                            second.protocolId

                    };


                    const candidateId =
                        this.candidateId(
                            "SHARED_RECURRENT_CONCEPT",
                            participantA,
                            participantB,
                            conceptId
                        );


                    let accumulator =
                        candidateAccumulators.get(
                            candidateId
                        );


                    if (
                        !accumulator
                    ) {

                        accumulator = {

                            candidateId,

                            participantA,

                            participantB,

                            mechanism:
                                "SHARED_RECURRENT_CONCEPT",

                            conceptId,

                            supportingCapabilityIdsA:
                                new Set<string>(),

                            supportingCapabilityIdsB:
                                new Set<string>(),

                            provenance:
                                new Map<
                                    string,
                                    ScientificCompositionProvenance
                                >()

                        };


                        candidateAccumulators.set(
                            candidateId,
                            accumulator
                        );

                    }


                    for (
                        const capabilityId
                        of first.lexicalCapabilityIds
                    ) {

                        accumulator
                            .supportingCapabilityIdsA
                            .add(
                                capabilityId
                            );

                    }


                    for (
                        const capabilityId
                        of second.lexicalCapabilityIds
                    ) {

                        accumulator
                            .supportingCapabilityIdsB
                            .add(
                                capabilityId
                            );

                    }


                    for (
                        const provenance
                        of first.provenance.values()
                    ) {

                        accumulator.provenance.set(
                            this.provenanceKey(
                                provenance
                            ),
                            provenance
                        );

                    }


                    for (
                        const provenance
                        of second.provenance.values()
                    ) {

                        accumulator.provenance.set(
                            this.provenanceKey(
                                provenance
                            ),
                            provenance
                        );

                    }

                }

            }

        }


        const candidates:
            ScientificCompositionCandidate[] =
            [
                ...candidateAccumulators.values()
            ].map(
                accumulator => {

                    const provenance =
                        [
                            ...accumulator
                                .provenance
                                .values()
                        ].sort(
                            (
                                a,
                                b
                            ) =>
                                this
                                    .provenanceKey(
                                        a
                                    )
                                    .localeCompare(
                                        this.provenanceKey(
                                            b
                                        )
                                    )
                        );


                    const base = {

                        candidateId:
                            accumulator.candidateId,

                        participantA:
                            accumulator.participantA,

                        participantB:
                            accumulator.participantB,

                        mechanism:
                            accumulator.mechanism,

                        supportingCapabilityIdsA:
                            [
                                ...accumulator
                                    .supportingCapabilityIdsA
                            ].sort(),

                        supportingCapabilityIdsB:
                            [
                                ...accumulator
                                    .supportingCapabilityIdsB
                            ].sort(),

                        provenance,

                        evaluationStatus:
                            "UNEVALUATED" as const

                    };


                    if (
                        accumulator.conceptId !==
                        undefined
                    ) {

                        return {

                            ...base,

                            conceptId:
                                accumulator.conceptId

                        };

                    }


                    return base;

                }
            );


        candidates.sort(
            (
                a,
                b
            ) =>
                a.candidateId.localeCompare(
                    b.candidateId
                )
        );


        return {

            candidates,

            errors:
                []

        };

    }


    private sourcedConcepts(
        results:
            ScientificProtocolConceptAttributionResult[]
    ): SourcedProtocolConcept[] {

        const sourced:
            SourcedProtocolConcept[] =
            [];


        for (
            const result
            of results
        ) {

            for (
                const concept
                of result.protocolConcepts
            ) {

                sourced.push({

                    sourceId:
                        result.sourceId,

                    sourceRevision:
                        result.sourceRevision,

                    concept

                });

            }

        }


        sourced.sort(
            (
                a,
                b
            ) => {

                const conceptComparison =
                    a.concept.conceptId.localeCompare(
                        b.concept.conceptId
                    );


                if (
                    conceptComparison !==
                    0
                ) {

                    return conceptComparison;

                }


                const protocolComparison =
                    a.concept.protocolId.localeCompare(
                        b.concept.protocolId
                    );


                if (
                    protocolComparison !==
                    0
                ) {

                    return protocolComparison;

                }


                return a.concept.protocolConceptId.localeCompare(
                    b.concept.protocolConceptId
                );

            }
        );


        return sourced;

    }


    private sourcedRelations(
        results:
            ScientificProtocolRelationEvidenceResult[]
    ): SourcedProtocolRelation[] {

        const sourced:
            SourcedProtocolRelation[] =
            [];


        for (
            const result
            of results
        ) {

            for (
                const relation
                of result.relations
            ) {

                sourced.push({

                    sourceId:
                        result.sourceId,

                    sourceRevision:
                        result.sourceRevision,

                    relation

                });

            }

        }


        sourced.sort(
            (
                a,
                b
            ) =>
                a.relation.relationEvidenceId.localeCompare(
                    b.relation.relationEvidenceId
                )
        );


        return sourced;

    }


    private boundaryErrors(
        input:
            CrossProtocolCompositionInput
    ): string[] {

        const errors:
            string[] =
            [];


        const protocolConceptIds =
            new Set<string>();


        for (
            const result
            of input.protocolConceptResults
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    ...result.errors
                );

            }


            if (
                result.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    "Cross-protocol discovery received a protocol concept result with an empty source identity."
                );

            }


            if (
                result.sourceModelId.trim().length ===
                0
            ) {

                errors.push(
                    `Protocol concept source ${result.sourceId} has an empty source model identity.`
                );

            }


            for (
                const concept
                of result.protocolConcepts
            ) {

                if (
                    protocolConceptIds.has(
                        concept.protocolConceptId
                    )
                ) {

                    errors.push(
                        `Duplicate protocol concept evidence identity ${concept.protocolConceptId}.`
                    );

                    continue;

                }


                protocolConceptIds.add(
                    concept.protocolConceptId
                );


                if (
                    concept.protocolConceptId.trim().length ===
                    0
                ) {

                    errors.push(
                        "Cross-protocol discovery received an empty protocol concept identity."
                    );

                }


                if (
                    concept.conceptId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Protocol concept ${concept.protocolConceptId} has an empty concept identity.`
                    );

                }


                if (
                    concept.protocolId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Protocol concept ${concept.protocolConceptId} has an empty protocol identity.`
                    );

                }


                if (
                    concept.lexicalCapabilityIds.length <
                    2
                ) {

                    errors.push(
                        `Protocol concept ${concept.protocolConceptId} does not preserve recurrent protocol-local capabilities.`
                    );

                }


                const lexicalCapabilityIds =
                    new Set<string>();


                for (
                    const capabilityId
                    of concept.lexicalCapabilityIds
                ) {

                    if (
                        capabilityId.trim().length ===
                        0
                    ) {

                        errors.push(
                            `Protocol concept ${concept.protocolConceptId} contains an empty lexical capability identity.`
                        );

                        continue;

                    }


                    if (
                        lexicalCapabilityIds.has(
                            capabilityId
                        )
                    ) {

                        errors.push(
                            `Protocol concept ${concept.protocolConceptId} contains duplicate lexical capability ${capabilityId}.`
                        );

                        continue;

                    }


                    lexicalCapabilityIds.add(
                        capabilityId
                    );

                }


                if (
                    concept.protocolAttributionIds.length ===
                    0
                ) {

                    errors.push(
                        `Protocol concept ${concept.protocolConceptId} has no protocol attribution provenance.`
                    );

                }


                if (
                    concept.evidence.length ===
                    0
                ) {

                    errors.push(
                        `Protocol concept ${concept.protocolConceptId} has no fact evidence.`
                    );

                }

            }

        }


        const relationEvidenceIds =
            new Set<string>();


        for (
            const result
            of input.protocolRelationEvidenceResults
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    ...result.errors
                );

            }


            if (
                result.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    "Cross-protocol discovery received a relation evidence result with an empty source identity."
                );

            }


            for (
                const relation
                of result.relations
            ) {

                if (
                    relationEvidenceIds.has(
                        relation.relationEvidenceId
                    )
                ) {

                    errors.push(
                        `Duplicate protocol relation evidence identity ${relation.relationEvidenceId}.`
                    );

                    continue;

                }


                relationEvidenceIds.add(
                    relation.relationEvidenceId
                );


                if (
                    relation.sourceId !==
                    result.sourceId
                ) {

                    errors.push(
                        `Protocol relation evidence ${relation.relationEvidenceId} source does not match its result source.`
                    );

                }


                if (
                    relation.sourceRevision !==
                    result.sourceRevision
                ) {

                    errors.push(
                        `Protocol relation evidence ${relation.relationEvidenceId} revision does not match its result revision.`
                    );

                }


                if (
                    relation.relationEvidenceId.trim().length ===
                    0
                ) {

                    errors.push(
                        "Cross-protocol discovery received an empty protocol relation evidence identity."
                    );

                }


                if (
                    relation.subjectSymbol.trim().length ===
                    0
                ) {

                    errors.push(
                        `Protocol relation evidence ${relation.relationEvidenceId} has an empty subject symbol.`
                    );

                }


                if (
                    relation.objectProtocolId.trim().length ===
                    0
                ) {

                    errors.push(
                        `Protocol relation evidence ${relation.relationEvidenceId} has an empty object protocol identity.`
                    );

                }


                if (
                    relation.relation !==
                    "EXTENSION_FOR"
                ) {

                    errors.push(
                        `Unsupported protocol relation ${relation.relation} in evidence ${relation.relationEvidenceId}.`
                    );

                }

            }

        }


        return errors;

    }


    private candidateId(
        mechanism:
            "EXPLICIT_EXTENSION_FOR"
            | "SHARED_RECURRENT_CONCEPT",
        participantA:
            ScientificCompositionParticipant,
        participantB:
            ScientificCompositionParticipant,
        conceptId:
            string
            | undefined
    ): string {

        const identityComponents =
            [
                "SCIENTIFIC-COMPOSITION-CANDIDATE",
                mechanism,
                participantA.kind,
                participantA.id,
                participantB.kind,
                participantB.id,
                conceptId ===
                    undefined
                    ? "CONCEPT-ABSENT"
                    : "CONCEPT-PRESENT",
                conceptId ??
                    ""
            ];


        return identityComponents
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }


    private provenanceKey(
        provenance:
            ScientificCompositionProvenance
    ): string {

        const revisionPresence =
            provenance.sourceRevision ===
                undefined
                ? "REVISION-ABSENT"
                : "REVISION-PRESENT";

        const revisionValue =
            provenance.sourceRevision ??
            "";


        const components =
            [
                provenance.kind,
                provenance.sourceId,
                revisionPresence,
                revisionValue,
                provenance.evidenceId
            ];


        return components
            .map(
                component =>
                    `${component.length}:${component}`
            )
            .join(
                "|"
            );

    }

}
