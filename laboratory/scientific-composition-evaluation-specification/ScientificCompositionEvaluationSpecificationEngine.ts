import type {
    ScientificCompositionCandidate,
    ScientificCompositionParticipant
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificCrossProtocolCompositionResult
} from "../scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolConceptAttributionResult
} from "../scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.js";

import type {
    ScientificProtocolRelationEvidenceResult
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidenceResult.js";

import type {
    ScientificStructuralProtocolRelationEvidenceResult
} from "../scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceResult.js";

import type {
    ScientificCompositionConstraint
} from "./ScientificCompositionConstraint.js";

import type {
    ScientificCompositionEvaluationSpecification
} from "./ScientificCompositionEvaluationSpecification.js";

import type {
    ScientificCompositionEvaluationSpecificationResult
} from "./ScientificCompositionEvaluationSpecificationResult.js";


export interface ScientificCompositionEvaluationSpecificationInput {

    discovery:
        ScientificCrossProtocolCompositionResult;

    facts:
        ScientificSourceFact[];

    protocolConceptResults:
        ScientificProtocolConceptAttributionResult[];

    protocolRelationEvidenceResults:
        ScientificProtocolRelationEvidenceResult[];

    /*
     * Independently observed Solidity structural protocol
     * dependencies.
     *
     * Optional so existing evaluation callers remain valid.
     */
    structuralProtocolRelationEvidenceResults?:
        ScientificStructuralProtocolRelationEvidenceResult[];

}


type ParticipantSide =
    | "A"
    | "B";


interface ParticipantFactScope {

    side:
        ParticipantSide;

    participant:
        ScientificCompositionParticipant;

    factIds:
        Set<string>;

    containerSymbols:
        Set<string>;

    sourceScopes:
        Array<{
            sourceId: string;
            sourceRevision?: string;
        }>;

}


export class ScientificCompositionEvaluationSpecificationEngine {

    build(
        input:
            ScientificCompositionEvaluationSpecificationInput
    ): ScientificCompositionEvaluationSpecificationResult {

        const errors:
            string[] = [];

        const discovery =
            input.discovery;

        if (
            discovery.errors.length >
            0
        ) {

            return {
                specifications: [],
                errors: [
                    ...discovery.errors.map(
                        error =>
                            `Cross-protocol discovery error: ${error}`
                    )
                ]
            };

        }


        for (
            const result
            of input.protocolConceptResults
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    ...result.errors.map(
                        error =>
                            `Protocol concept attribution error for ${result.sourceId}: ${error}`
                    )
                );

            }

        }


        for (
            const result
            of input.protocolRelationEvidenceResults
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    ...result.errors.map(
                        error =>
                            `Protocol relation evidence error for ${result.sourceId}: ${error}`
                    )
                );

            }

        }


        for (
            const result
            of input.structuralProtocolRelationEvidenceResults ??
                []
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    ...result.errors.map(
                        error =>
                            `Structural protocol relation evidence error for ${result.sourceId}: ${error}`
                    )
                );

            }

        }

        const factById =
            new Map<
                string,
                ScientificSourceFact
            >();


        for (
            const fact
            of input.facts
        ) {

            if (
                factById.has(
                    fact.factId
                )
            ) {

                errors.push(
                    `Duplicate scientific fact id: ${fact.factId}.`
                );

                continue;

            }

            factById.set(
                fact.factId,
                fact
            );

        }


        const conceptByEvidenceId =
            new Map<
                string,
                {
                    result:
                        ScientificProtocolConceptAttributionResult;

                    concept:
                        ScientificProtocolConceptAttributionResult[
                            "protocolConcepts"
                        ][number];
                }
            >();


        for (
            const result
            of input.protocolConceptResults
        ) {

            for (
                const concept
                of result.protocolConcepts
            ) {

                if (
                    conceptByEvidenceId.has(
                        concept.protocolConceptId
                    )
                ) {

                    errors.push(
                        `Duplicate protocol concept id: ${concept.protocolConceptId}.`
                    );

                    continue;

                }

                conceptByEvidenceId.set(
                    concept.protocolConceptId,
                    {
                        result,
                        concept
                    }
                );

            }

        }


        const relationByEvidenceId =
            new Map<
                string,
                {
                    result:
                        ScientificProtocolRelationEvidenceResult;

                    relation:
                        ScientificProtocolRelationEvidenceResult[
                            "relations"
                        ][number];
                }
            >();


        for (
            const result
            of input.protocolRelationEvidenceResults
        ) {

            for (
                const relation
                of result.relations
            ) {

                if (
                    relationByEvidenceId.has(
                        relation.relationEvidenceId
                    )
                ) {

                    errors.push(
                        `Duplicate protocol relation evidence id: ${relation.relationEvidenceId}.`
                    );

                    continue;

                }

                relationByEvidenceId.set(
                    relation.relationEvidenceId,
                    {
                        result,
                        relation
                    }
                );

            }

        }


        const structuralRelationByEvidenceId =
            new Map<
                string,
                {
                    result:
                        ScientificStructuralProtocolRelationEvidenceResult;

                    relation:
                        ScientificStructuralProtocolRelationEvidenceResult[
                            "relations"
                        ][number];
                }
            >();


        for (
            const result
            of input.structuralProtocolRelationEvidenceResults ??
                []
        ) {

            for (
                const relation
                of result.relations
            ) {

                if (
                    structuralRelationByEvidenceId.has(
                        relation.relationEvidenceId
                    )
                ) {

                    errors.push(
                        `Duplicate structural protocol relation evidence id: ${relation.relationEvidenceId}.`
                    );

                    continue;

                }


                if (
                    relation.sourceId !==
                    result.sourceId
                ) {

                    errors.push(
                        `Structural protocol relation ${relation.relationEvidenceId} source does not match its result source.`
                    );

                }


                if (
                    !this.sameRevision(
                        relation.sourceRevision,
                        result.sourceRevision
                    )
                ) {

                    errors.push(
                        `Structural protocol relation ${relation.relationEvidenceId} revision does not match its result revision.`
                    );

                }


                const declarationFact =
                    factById.get(
                        relation.factId
                    );


                if (
                    declarationFact ===
                    undefined
                ) {

                    errors.push(
                        `Structural protocol relation ${relation.relationEvidenceId} references missing declaration fact ${relation.factId}.`
                    );

                } else {

                    if (
                        declarationFact.sourceId !==
                        result.sourceId
                    ) {

                        errors.push(
                            `Structural protocol relation ${relation.relationEvidenceId} declaration fact source mismatch.`
                        );

                    }


                    if (
                        !this.sameRevision(
                            declarationFact.sourceRevision,
                            result.sourceRevision
                        )
                    ) {

                        errors.push(
                            `Structural protocol relation ${relation.relationEvidenceId} declaration fact revision mismatch.`
                        );

                    }


                    if (
                        declarationFact.observationId !==
                        relation.observationId
                    ) {

                        errors.push(
                            `Structural protocol relation ${relation.relationEvidenceId} declaration observation mismatch.`
                        );

                    }


                    if (
                        declarationFact.kind !==
                            "CONTRACT_DECLARATION" &&
                        declarationFact.kind !==
                            "INTERFACE_DECLARATION"
                    ) {

                        errors.push(
                            `Structural protocol relation ${relation.relationEvidenceId} does not reference a declaration fact.`
                        );

                    }


                    if (
                        declarationFact.symbol !==
                        relation.subjectContainerSymbol
                    ) {

                        errors.push(
                            `Structural protocol relation ${relation.relationEvidenceId} subject container does not match its declaration fact.`
                        );

                    }

                }


                structuralRelationByEvidenceId.set(
                    relation.relationEvidenceId,
                    {
                        result,
                        relation
                    }
                );

            }

        }

        const candidateIds =
            new Set<string>();


        for (
            const candidate
            of discovery.candidates
        ) {

            if (
                candidateIds.has(
                    candidate.candidateId
                )
            ) {

                errors.push(
                    `Duplicate composition candidate id: ${candidate.candidateId}.`
                );

            }

            candidateIds.add(
                candidate.candidateId
            );

        }


        for (
            const candidate
            of discovery.candidates
        ) {

            if (
                candidate.evaluationStatus !==
                "UNEVALUATED"
            ) {

                errors.push(
                    `Composition candidate ${candidate.candidateId} is not UNEVALUATED.`
                );

                continue;

            }


            for (
                const provenance
                of candidate.provenance
            ) {

                if (
                    provenance.kind ===
                    "PROTOCOL_CONCEPT"
                ) {

                    const resolved =
                        conceptByEvidenceId.get(
                            provenance.evidenceId
                        );

                    if (
                        resolved ===
                        undefined
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} references missing protocol concept ${provenance.evidenceId}.`
                        );

                        continue;

                    }

                    if (
                        resolved.result.sourceId !==
                        provenance.sourceId
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} protocol concept ${provenance.evidenceId} source mismatch.`
                        );

                    }

                    if (
                        !this.sameRevision(
                            resolved.result.sourceRevision,
                            provenance.sourceRevision
                        )
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} protocol concept ${provenance.evidenceId} revision mismatch.`
                        );

                    }

                } else if (
                    provenance.kind ===
                    "PROTOCOL_RELATION"
                ) {

                    const resolved =
                        relationByEvidenceId.get(
                            provenance.evidenceId
                        );

                    if (
                        resolved ===
                        undefined
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} references missing protocol relation ${provenance.evidenceId}.`
                        );

                        continue;

                    }

                    if (
                        resolved.result.sourceId !==
                            provenance.sourceId ||
                        resolved.relation.sourceId !==
                            provenance.sourceId
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} protocol relation ${provenance.evidenceId} source mismatch.`
                        );

                    }

                    if (
                        !this.sameRevision(
                            resolved.result.sourceRevision,
                            provenance.sourceRevision
                        ) ||
                        !this.sameRevision(
                            resolved.relation.sourceRevision,
                            provenance.sourceRevision
                        )
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} protocol relation ${provenance.evidenceId} revision mismatch.`
                        );

                    }

                } else if (
                    provenance.kind ===
                    "STRUCTURAL_PROTOCOL_RELATION"
                ) {

                    const resolved =
                        structuralRelationByEvidenceId.get(
                            provenance.evidenceId
                        );


                    if (
                        resolved ===
                        undefined
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} references missing structural protocol relation ${provenance.evidenceId}.`
                        );

                        continue;

                    }


                    if (
                        candidate.mechanism !==
                        "SHARED_PROTOCOL_FOUNDATION"
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} uses structural protocol relation provenance without SHARED_PROTOCOL_FOUNDATION mechanism.`
                        );

                    }


                    if (
                        candidate.foundationProtocolId ===
                        undefined
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} has no shared foundation protocol identity.`
                        );

                    } else if (
                        resolved.relation.objectProtocolId !==
                        candidate.foundationProtocolId
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} foundation ${candidate.foundationProtocolId} does not match structural relation object ${resolved.relation.objectProtocolId}.`
                        );

                    }


                    if (
                        resolved.result.sourceId !==
                            provenance.sourceId ||
                        resolved.relation.sourceId !==
                            provenance.sourceId
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} structural protocol relation ${provenance.evidenceId} source mismatch.`
                        );

                    }


                    if (
                        !this.sameRevision(
                            resolved.result.sourceRevision,
                            provenance.sourceRevision
                        ) ||
                        !this.sameRevision(
                            resolved.relation.sourceRevision,
                            provenance.sourceRevision
                        )
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} structural protocol relation ${provenance.evidenceId} revision mismatch.`
                        );

                    }


                    const subjectMatchesParticipant =
                        (
                            candidate.participantA.kind ===
                                "PROTOCOL" &&
                            candidate.participantA.id ===
                                resolved.relation.subjectProtocolId
                        ) ||
                        (
                            candidate.participantB.kind ===
                                "PROTOCOL" &&
                            candidate.participantB.id ===
                                resolved.relation.subjectProtocolId
                        );


                    if (
                        !subjectMatchesParticipant
                    ) {

                        errors.push(
                            `Candidate ${candidate.candidateId} structural relation subject ${resolved.relation.subjectProtocolId} is not a candidate participant.`
                        );

                    }

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                specifications: [],
                errors
            };

        }


        const specifications:
            ScientificCompositionEvaluationSpecification[] = [];


        const orderedCandidates =
            [
                ...discovery.candidates
            ].sort(
                (
                    left,
                    right
                ) =>
                    left.candidateId.localeCompare(
                        right.candidateId
                    )
            );


        for (
            const candidate
            of orderedCandidates
        ) {

            const participantA:
                ParticipantFactScope = {

                    side:
                        "A",

                    participant:
                        candidate.participantA,

                    factIds:
                        new Set<string>(),

                    containerSymbols:
                        new Set<string>(),

                    sourceScopes: []

                };


            const participantB:
                ParticipantFactScope = {

                    side:
                        "B",

                    participant:
                        candidate.participantB,

                    factIds:
                        new Set<string>(),

                    containerSymbols:
                        new Set<string>(),

                    sourceScopes: []

                };


            for (
                const provenance
                of candidate.provenance
            ) {

                if (
                    provenance.kind ===
                    "PROTOCOL_CONCEPT"
                ) {

                    const resolved =
                        conceptByEvidenceId.get(
                            provenance.evidenceId
                        );

                    if (
                        resolved ===
                        undefined
                    ) {

                        continue;

                    }


                    this.applyProtocolConceptScope(
                        candidate,
                        participantA,
                        resolved.result,
                        resolved.concept,
                        factById,
                        errors
                    );


                    this.applyProtocolConceptScope(
                        candidate,
                        participantB,
                        resolved.result,
                        resolved.concept,
                        factById,
                        errors
                    );

                } else if (
                    provenance.kind ===
                    "PROTOCOL_RELATION"
                ) {

                    const resolved =
                        relationByEvidenceId.get(
                            provenance.evidenceId
                        );

                    if (
                        resolved ===
                        undefined
                    ) {

                        continue;

                    }


                    this.applyProtocolRelationScope(
                        candidate,
                        participantA,
                        resolved.result,
                        resolved.relation,
                        input.facts,
                        errors
                    );


                    this.applyProtocolRelationScope(
                        candidate,
                        participantB,
                        resolved.result,
                        resolved.relation,
                        input.facts,
                        errors
                    );

                } else if (
                    provenance.kind ===
                    "STRUCTURAL_PROTOCOL_RELATION"
                ) {

                    const resolved =
                        structuralRelationByEvidenceId.get(
                            provenance.evidenceId
                        );


                    if (
                        resolved ===
                        undefined
                    ) {

                        continue;

                    }


                    this.applyStructuralProtocolRelationScope(
                        candidate,
                        participantA,
                        resolved.result,
                        resolved.relation,
                        input.facts,
                        errors
                    );


                    this.applyStructuralProtocolRelationScope(
                        candidate,
                        participantB,
                        resolved.result,
                        resolved.relation,
                        input.facts,
                        errors
                    );

                }

            }


            if (
                errors.length >
                0
            ) {

                return {
                    specifications: [],
                    errors
                };

            }


            const constraints:
                ScientificCompositionConstraint[] = [];

            const unresolvedGuardFactIds =
                new Set<string>();


            this.collectParticipantConstraints(
                candidate,
                participantA,
                input.facts,
                constraints,
                unresolvedGuardFactIds
            );


            this.collectParticipantConstraints(
                candidate,
                participantB,
                input.facts,
                constraints,
                unresolvedGuardFactIds
            );


            constraints.sort(
                (
                    left,
                    right
                ) =>
                    left.constraintId.localeCompare(
                        right.constraintId
                    )
            );


            const participantAConstraintIds =
                constraints
                    .filter(
                        constraint =>
                            constraint.participantSide ===
                            "A"
                    )
                    .map(
                        constraint =>
                            constraint.constraintId
                    )
                    .sort();


            const participantBConstraintIds =
                constraints
                    .filter(
                        constraint =>
                            constraint.participantSide ===
                            "B"
                    )
                    .map(
                        constraint =>
                            constraint.constraintId
                    )
                    .sort();


            const orderedUnresolvedGuardFactIds =
                [
                    ...unresolvedGuardFactIds
                ].sort();


            const sourceIds =
                [
                    ...new Set(
                        candidate.provenance.map(
                            provenance =>
                                provenance.sourceId
                        )
                    )
                ].sort();


            const targetEvidenceIds =
                [
                    ...new Set(
                        candidate.provenance.map(
                            provenance =>
                                provenance.evidenceId
                        )
                    )
                ].sort();


            const status:
                ScientificCompositionEvaluationSpecification[
                    "status"
                ] =
                    participantAConstraintIds.length > 0 &&
                    participantBConstraintIds.length > 0
                        ? "READY"
                        : "INSUFFICIENT_EVIDENCE";


            const scientificCriteria:
                ScientificCompositionEvaluationSpecification[
                    "scientificCriteria"
                ] =
                    status ===
                    "READY"
                        ? {
                            relation:
                                "PRESERVES_OBSERVED_CONSTRAINTS",

                            support: {
                                expectedPolarity:
                                    "SUPPORT",

                                condition:
                                    "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"
                            },

                            challenge: {
                                expectedPolarity:
                                    "CHALLENGE",

                                condition:
                                    "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"
                            },

                            inconclusive: {
                                whenNoScientificPolarity:
                                    true
                            }
                        }
                        : null;


            specifications.push({

                specificationId:
                    this.specificationIdFor(
                        candidate,
                        constraints,
                        orderedUnresolvedGuardFactIds
                    ),

                candidateId:
                    candidate.candidateId,

                mechanism:
                    candidate.mechanism,

                /*
                 * Preserve the complete candidate identity at the
                 * evaluation boundary.
                 *
                 * Mutable nested structures are cloned and
                 * set-like evidence collections are canonicalized so
                 * input ordering cannot alter the resulting
                 * scientific specification.
                 */
                candidateSnapshot: {

                    candidateId:
                        candidate.candidateId,

                    participantA: {
                        ...candidate.participantA
                    },

                    participantB: {
                        ...candidate.participantB
                    },

                    mechanism:
                        candidate.mechanism,

                    ...(
                        candidate.conceptId !==
                        undefined
                            ? {
                                conceptId:
                                    candidate.conceptId
                            }
                            : {}
                    ),

                    ...(
                        candidate.foundationProtocolId !==
                        undefined
                            ? {
                                foundationProtocolId:
                                    candidate.foundationProtocolId
                            }
                            : {}
                    ),

                    supportingCapabilityIdsA:
                        [
                            ...candidate.supportingCapabilityIdsA
                        ].sort(),

                    supportingCapabilityIdsB:
                        [
                            ...candidate.supportingCapabilityIdsB
                        ].sort(),

                    provenance:
                        candidate.provenance
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
                            ),

                    evaluationStatus:
                        candidate.evaluationStatus

                },

                status,

                sourceIds,

                targetEvidenceIds,

                constraints,

                participantAConstraintIds,

                participantBConstraintIds,

                unresolvedGuardFactIds:
                    orderedUnresolvedGuardFactIds,

                scientificCriteria

            });

        }


        return {
            specifications,
            errors: []
        };

    }


    private applyProtocolConceptScope(
        candidate:
            ScientificCompositionCandidate,

        scope:
            ParticipantFactScope,

        result:
            ScientificProtocolConceptAttributionResult,

        concept:
            ScientificProtocolConceptAttributionResult[
                "protocolConcepts"
            ][number],

        factById:
            Map<
                string,
                ScientificSourceFact
            >,

        errors:
            string[]
    ): void {

        if (
            scope.participant.kind !==
            "PROTOCOL"
        ) {

            return;

        }


        if (
            scope.participant.id !==
            concept.protocolId
        ) {

            return;

        }


        if (
            candidate.mechanism ===
                "SHARED_RECURRENT_CONCEPT" &&
            candidate.conceptId !==
                concept.conceptId
        ) {

            errors.push(
                `Candidate ${candidate.candidateId} concept ${candidate.conceptId ?? "ABSENT"} does not match protocol concept ${concept.conceptId}.`
            );

            return;

        }


        this.addSourceScope(
            scope,
            result.sourceId,
            result.sourceRevision
        );


        for (
            const factId
            of concept.evidence
        ) {

            const fact =
                factById.get(
                    factId
                );

            if (
                fact ===
                undefined
            ) {

                errors.push(
                    `Protocol concept ${concept.protocolConceptId} references missing fact ${factId}.`
                );

                continue;

            }


            if (
                fact.sourceId !==
                result.sourceId
            ) {

                errors.push(
                    `Protocol concept ${concept.protocolConceptId} fact ${factId} source mismatch.`
                );

                continue;

            }


            if (
                !this.sameRevision(
                    fact.sourceRevision,
                    result.sourceRevision
                )
            ) {

                errors.push(
                    `Protocol concept ${concept.protocolConceptId} fact ${factId} revision mismatch.`
                );

                continue;

            }


            scope.factIds.add(
                fact.factId
            );


            if (
                fact.containerSymbol !==
                undefined
            ) {

                scope.containerSymbols.add(
                    fact.containerSymbol
                );

            }

        }

    }


    private applyStructuralProtocolRelationScope(
        candidate:
            ScientificCompositionCandidate,
        scope:
            ParticipantFactScope,
        result:
            ScientificStructuralProtocolRelationEvidenceResult,
        relation:
            ScientificStructuralProtocolRelationEvidenceResult[
                "relations"
            ][number],
        facts:
            ScientificSourceFact[],
        errors:
            string[]
    ): void {

        if (
            candidate.mechanism !==
            "SHARED_PROTOCOL_FOUNDATION"
        ) {

            return;

        }


        if (
            candidate.foundationProtocolId ===
            undefined
        ) {

            errors.push(
                `Candidate ${candidate.candidateId} has no foundation protocol identity during structural scope evaluation.`
            );

            return;

        }


        if (
            relation.objectProtocolId !==
            candidate.foundationProtocolId
        ) {

            errors.push(
                `Candidate ${candidate.candidateId} foundation protocol does not match structural evidence ${relation.relationEvidenceId}.`
            );

            return;

        }


        if (
            scope.participant.kind !==
            "PROTOCOL"
        ) {

            return;

        }


        /*
         * The same provenance set is applied to both participant
         * scopes. A relation only scopes the participant whose
         * independently established protocol identity is its
         * structural subject.
         */
        if (
            scope.participant.id !==
            relation.subjectProtocolId
        ) {

            return;

        }


        this.addSourceScope(
            scope,
            result.sourceId,
            result.sourceRevision
        );


        for (
            const fact
            of facts
        ) {

            if (
                fact.sourceId !==
                result.sourceId
            ) {

                continue;

            }


            if (
                !this.sameRevision(
                    fact.sourceRevision,
                    result.sourceRevision
                )
            ) {

                continue;

            }


            if (
                fact.containerSymbol !==
                relation.subjectContainerSymbol
            ) {

                continue;

            }


            scope.factIds.add(
                fact.factId
            );

            scope.containerSymbols.add(
                relation.subjectContainerSymbol
            );

        }

    }

    private applyProtocolRelationScope(
        candidate:
            ScientificCompositionCandidate,

        scope:
            ParticipantFactScope,

        result:
            ScientificProtocolRelationEvidenceResult,

        relation:
            ScientificProtocolRelationEvidenceResult[
                "relations"
            ][number],

        facts:
            ScientificSourceFact[],

        errors:
            string[]
    ): void {

        if (
            candidate.mechanism !==
            "EXPLICIT_EXTENSION_FOR"
        ) {

            return;

        }


        if (
            scope.participant.kind ===
            "SYMBOLIC_SUBJECT"
        ) {

            if (
                scope.participant.id !==
                relation.subjectSymbol
            ) {

                return;

            }


            this.addSourceScope(
                scope,
                result.sourceId,
                result.sourceRevision
            );


            for (
                const fact
                of facts
            ) {

                if (
                    fact.sourceId !==
                    result.sourceId
                ) {

                    continue;

                }


                if (
                    !this.sameRevision(
                        fact.sourceRevision,
                        result.sourceRevision
                    )
                ) {

                    continue;

                }


                if (
                    fact.containerSymbol !==
                    relation.subjectSymbol
                ) {

                    continue;

                }


                scope.factIds.add(
                    fact.factId
                );

                scope.containerSymbols.add(
                    relation.subjectSymbol
                );

            }


            return;

        }


        if (
            scope.participant.kind ===
            "PROTOCOL"
        ) {

            if (
                scope.participant.id !==
                relation.objectProtocolId
            ) {

                return;

            }


            this.addSourceScope(
                scope,
                result.sourceId,
                result.sourceRevision
            );


            for (
                const fact
                of facts
            ) {

                if (
                    fact.sourceId !==
                    result.sourceId
                ) {

                    continue;

                }


                if (
                    !this.sameRevision(
                        fact.sourceRevision,
                        result.sourceRevision
                    )
                ) {

                    continue;

                }


                if (
                    fact.containerSymbol ===
                    undefined
                ) {

                    continue;

                }


                if (
                    !this.matchesProtocolContainer(
                        scope.participant.id,
                        fact.containerSymbol
                    )
                ) {

                    continue;

                }


                scope.factIds.add(
                    fact.factId
                );

                scope.containerSymbols.add(
                    fact.containerSymbol
                );

            }


            return;

        }


        errors.push(
            `Candidate ${candidate.candidateId} contains unsupported participant kind.`
        );

    }


    private collectParticipantConstraints(
        candidate:
            ScientificCompositionCandidate,

        scope:
            ParticipantFactScope,

        facts:
            ScientificSourceFact[],

        constraints:
            ScientificCompositionConstraint[],

        unresolvedGuardFactIds:
            Set<string>
    ): void {

        const sourceScopeKeys =
            new Set(
                scope.sourceScopes.map(
                    source =>
                        this.sourceScopeKey(
                            source.sourceId,
                            source.sourceRevision
                        )
                )
            );


        for (
            const fact
            of facts
        ) {

            const sourceKey =
                this.sourceScopeKey(
                    fact.sourceId,
                    fact.sourceRevision
                );


            if (
                !sourceScopeKeys.has(
                    sourceKey
                )
            ) {

                continue;

            }


            if (
                fact.containerSymbol ===
                undefined
            ) {

                continue;

            }


            if (
                !scope.containerSymbols.has(
                    fact.containerSymbol
                )
            ) {

                continue;

            }


            if (
                fact.kind ===
                "REVERT_STATEMENT"
            ) {

                unresolvedGuardFactIds.add(
                    fact.factId
                );

                continue;

            }


            if (
                fact.kind !==
                "REQUIRE_STATEMENT"
            ) {

                continue;

            }


            if (
                fact.containerKind ===
                    undefined ||
                fact.containerSymbol ===
                    undefined
            ) {

                continue;

            }


            constraints.push({

                constraintId:
                    this.constraintIdFor(
                        candidate,
                        scope,
                        fact
                    ),

                candidateId:
                    candidate.candidateId,

                participantSide:
                    scope.side,

                participantKind:
                    scope.participant.kind,

                participantId:
                    scope.participant.id,

                sourceId:
                    fact.sourceId,

                ...(fact.sourceRevision !==
                    undefined
                    ? {
                        sourceRevision:
                            fact.sourceRevision
                    }
                    : {}),

                factId:
                    fact.factId,

                basis:
                    "SOLIDITY_REQUIRE_STATEMENT",

                containerKind:
                    fact.containerKind,

                containerSymbol:
                    fact.containerSymbol,

                locator:
                    fact.locator,

                rawText:
                    fact.rawText

            });

        }

    }


    private addSourceScope(
        scope:
            ParticipantFactScope,

        sourceId:
            string,

        sourceRevision:
            string | undefined
    ): void {

        const key =
            this.sourceScopeKey(
                sourceId,
                sourceRevision
            );


        const exists =
            scope.sourceScopes.some(
                source =>
                    this.sourceScopeKey(
                        source.sourceId,
                        source.sourceRevision
                    ) ===
                    key
            );


        if (
            exists
        ) {

            return;

        }


        scope.sourceScopes.push({

            sourceId,

            ...(sourceRevision !==
                undefined
                ? {
                    sourceRevision
                }
                : {})

        });

    }


    private matchesProtocolContainer(
        protocolId:
            string,

        containerSymbol:
            string
    ): boolean {

        const match =
            /^ERC-([1-9][0-9]*)$/.exec(
                protocolId
            );


        if (
            match ===
            null
        ) {

            return false;

        }


        const number =
            match[1];


        return (
            containerSymbol ===
                `ERC${number}` ||
            containerSymbol ===
                `IERC${number}`
        );

    }


    private constraintIdFor(
        candidate:
            ScientificCompositionCandidate,

        scope:
            ParticipantFactScope,

        fact:
            ScientificSourceFact
    ): string {

        return (
            "SCIENTIFIC-COMPOSITION-CONSTRAINT-" +
            this.encodeIdentity(
                [
                    candidate.candidateId,
                    scope.side,
                    scope.participant.kind,
                    scope.participant.id,
                    fact.sourceId,
                    this.revisionIdentity(
                        fact.sourceRevision
                    ),
                    fact.factId
                ]
            )
        );

    }


    private specificationIdFor(
        candidate:
            ScientificCompositionCandidate,

        constraints:
            ScientificCompositionConstraint[],

        unresolvedGuardFactIds:
            string[]
    ): string {

        return (
            "SCIENTIFIC-COMPOSITION-EVALUATION-SPECIFICATION-" +
            this.encodeIdentity(
                [
                    candidate.candidateId,
                    candidate.mechanism,
                    ...constraints.map(
                        constraint =>
                            constraint.constraintId
                    ),
                    ...unresolvedGuardFactIds.map(
                        factId =>
                            `GUARD:${factId}`
                    )
                ]
            )
        );

    }


    private sourceScopeKey(
        sourceId:
            string,

        sourceRevision:
            string | undefined
    ): string {

        return this.encodeIdentity(
            [
                sourceId,
                this.revisionIdentity(
                    sourceRevision
                )
            ]
        );

    }


    private revisionIdentity(
        sourceRevision:
            string | undefined
    ): string {

        return sourceRevision ===
            undefined
                ? "REVISION-ABSENT"
                : `REVISION-PRESENT:${sourceRevision}`;

    }


    private sameRevision(
        left:
            string | undefined,

        right:
            string | undefined
    ): boolean {

        return (
            left ===
                undefined &&
            right ===
                undefined
        ) || (
            left !==
                undefined &&
            right !==
                undefined &&
            left ===
                right
        );

    }


    private encodeIdentity(
        parts:
            string[]
    ): string {

        return parts
            .map(
                part =>
                    `${part.length}:${part}`
            )
            .join(
                "|"
            );

    }

}
