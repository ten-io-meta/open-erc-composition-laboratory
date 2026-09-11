import type {
    ScientificProtocolAttributedCapability
} from "../scientific-protocol-identity/ScientificProtocolAttributedCapability.js";

import type {
    ScientificProtocolConcept
} from "../scientific-protocol-concept-attribution/ScientificProtocolConcept.js";

import type {
    ScientificStructuralProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidence.js";

import type {
    ScientificProtocolAttributedExternalCall
} from "../scientific-protocol-identity/ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificNormativeStatement
} from "../scientific-normative-statement/ScientificNormativeStatement.js";

import type {
    ScientificCompositionContribution
} from "../scientific-composition-frame/ScientificCompositionContribution.js";

import type {
    ScientificCompositionBoundary
} from "../scientific-composition-frame/ScientificCompositionBoundary.js";

import type {
    ScientificCompositionNeed
} from "../scientific-composition-frame/ScientificCompositionNeed.js";

import type {
    ScientificProtocolCompositionProfile
} from "./ScientificProtocolCompositionProfile.js";

import type {
    ScientificProtocolCompositionProfileResult
} from "./ScientificProtocolCompositionProfileResult.js";


export interface ScientificProtocolCompositionProfileEngineInput {

    protocolId: string;

    sourceId: string;

    sourceRevision?: string;

    sourceFacts:
        ScientificSourceFact[];

    normativeStatements?:
        ScientificNormativeStatement[];

    attributedCapabilities:
        ScientificProtocolAttributedCapability[];

    protocolConcepts:
        ScientificProtocolConcept[];

    structuralRelations:
        ScientificStructuralProtocolRelationEvidence[];

    attributedExternalCalls:
        ScientificProtocolAttributedExternalCall[];

}


function encode(
    parts: string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


function normalize(
    value: string
): string {

    return value
        .replace(/\s+/g, " ")
        .trim();

}


function containerKey(
    kind: string,
    symbol: string
): string {

    return `${kind}:${symbol}`;

}


function callSubject(
    attribution:
        ScientificProtocolAttributedExternalCall
): string {

    const call =
        attribution.externalCall;


    if (
        call.castTypeSymbol &&
        call.memberSymbol
    ) {

        return (
            `INTERFACE_MEMBER:` +
            `${call.castTypeSymbol}.` +
            `${call.memberSymbol}`
        );

    }


    if (
        call.encodedCallTypeSymbol &&
        call.encodedCallMemberSymbol
    ) {

        return (
            `INTERFACE_MEMBER:` +
            `${call.encodedCallTypeSymbol}.` +
            `${call.encodedCallMemberSymbol}`
        );

    }


    return (
        `EXTERNAL_CALL:` +
        `${call.callForm}:` +
        normalize(call.targetExpression)
    );

}


export class ScientificProtocolCompositionProfileEngine {

    build(
        input:
            ScientificProtocolCompositionProfileEngineInput
    ): ScientificProtocolCompositionProfileResult {

        const errors:
            string[] = [];


        if (!input.protocolId.trim()) {

            errors.push(
                "Protocol composition profile requires protocolId."
            );

        }


        if (!input.sourceId.trim()) {

            errors.push(
                "Protocol composition profile requires sourceId."
            );

        }


        for (
            const capability
            of input.attributedCapabilities
        ) {

            if (
                capability.protocolId !==
                input.protocolId
            ) {

                errors.push(
                    `Capability ${capability.protocolAttributionId} belongs to ${capability.protocolId}.`
                );

            }

        }


        for (
            const concept
            of input.protocolConcepts
        ) {

            if (
                concept.protocolId !==
                input.protocolId
            ) {

                errors.push(
                    `Concept ${concept.protocolConceptId} belongs to ${concept.protocolId}.`
                );

            }

        }


        for (
            const relation
            of input.structuralRelations
        ) {

            if (
                relation.subjectProtocolId !==
                input.protocolId
            ) {

                errors.push(
                    `Relation ${relation.relationEvidenceId} belongs to ${relation.subjectProtocolId}.`
                );

            }


            if (
                relation.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Relation ${relation.relationEvidenceId} belongs to another source.`
                );

            }


            if (
                input.sourceRevision &&
                relation.sourceRevision !==
                    input.sourceRevision
            ) {

                errors.push(
                    `Relation ${relation.relationEvidenceId} belongs to another revision.`
                );

            }

        }


        for (
            const call
            of input.attributedExternalCalls
        ) {

            if (
                call.protocolId !==
                input.protocolId
            ) {

                errors.push(
                    `Call ${call.protocolCallAttributionId} belongs to ${call.protocolId}.`
                );

            }

        }


        for (
            const fact
            of input.sourceFacts
        ) {

            if (
                fact.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Fact ${fact.factId} belongs to another source.`
                );

            }


            if (
                input.sourceRevision &&
                fact.sourceRevision !==
                    input.sourceRevision
            ) {

                errors.push(
                    `Fact ${fact.factId} belongs to another revision.`
                );

            }

        }


        for (
            const statement
            of input.normativeStatements ?? []
        ) {

            if (
                statement.protocolId !==
                input.protocolId
            ) {

                errors.push(
                    `Normative statement ${statement.statementId} belongs to ${statement.protocolId}.`
                );

            }


            if (
                statement.sourceId !==
                input.sourceId
            ) {

                errors.push(
                    `Normative statement ${statement.statementId} belongs to another source.`
                );

            }


            if (
                input.sourceRevision &&
                statement.sourceRevision !==
                    input.sourceRevision
            ) {

                errors.push(
                    `Normative statement ${statement.statementId} belongs to another revision.`
                );

            }

        }


        if (errors.length > 0) {

            return {
                profile: null,
                errors
            };

        }


        /*
         * Containers structurally attributed to this protocol.
         */
        const containers =
            new Set<string>();


        for (
            const capability
            of input.attributedCapabilities
        ) {

            containers.add(
                containerKey(
                    capability.containerKind,
                    capability.containerSymbol
                )
            );

        }


        for (
            const relation
            of input.structuralRelations
        ) {

            containers.add(
                containerKey(
                    relation.subjectContainerKind,
                    relation.subjectContainerSymbol
                )
            );

        }


        for (
            const call
            of input.attributedExternalCalls
        ) {

            containers.add(
                containerKey(
                    call.containerKind,
                    call.containerSymbol
                )
            );

        }


        const contributions:
            ScientificCompositionContribution[] = [];


        /*
         * Direct protocol-attributed capabilities.
         */
        for (
            const capability
            of input.attributedCapabilities
        ) {

            contributions.push({

                contributionId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-CONTRIBUTION",
                        input.protocolId,
                        "CAPABILITY",
                        capability.protocolAttributionId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "CAPABILITY",

                subject:
                    normalize(
                        capability.label
                    ),

                evidenceIds: [
                    capability.protocolAttributionId,
                    capability.capabilityAttributionId,
                    capability.capabilityId,
                    capability.observationId,
                    ...capability.evidence
                ]

            });

        }


        /*
         * Recurrently observed protocol concepts.
         */
        for (
            const concept
            of input.protocolConcepts
        ) {

            contributions.push({

                contributionId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-CONTRIBUTION",
                        input.protocolId,
                        "CONCEPT",
                        concept.protocolConceptId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "CONCEPT",

                subject:
                    normalize(
                        concept.label
                    ),

                evidenceIds: [
                    concept.protocolConceptId,
                    ...concept.protocolAttributionIds,
                    ...concept.lexicalCapabilityIds,
                    ...concept.evidence
                ]

            });

        }


        /*
         * Structural dependencies are part of the protocol's
         * composition surface.
         */
        for (
            const relation
            of input.structuralRelations
        ) {

            contributions.push({

                contributionId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-CONTRIBUTION",
                        input.protocolId,
                        "PROTOCOL_DEPENDENCY",
                        relation.relationEvidenceId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "PROTOCOL_DEPENDENCY",

                subject:
                    `${relation.relation}:${relation.objectProtocolId}`,

                evidenceIds: [
                    relation.relationEvidenceId,
                    relation.factId,
                    relation.observationId
                ]

            });

        }


        const needs:
            ScientificCompositionNeed[] = [];


        /*
         * External calls expose behavior crossing the protocol
         * boundary.
         *
         * At this stage the provider is deliberately unresolved.
         */
        for (
            const call
            of input.attributedExternalCalls
        ) {

            const subject =
                callSubject(call);


            contributions.push({

                contributionId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-CONTRIBUTION",
                        input.protocolId,
                        "EXTERNAL_BEHAVIOR",
                        call.protocolCallAttributionId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "EXTERNAL_BEHAVIOR",

                subject,

                evidenceIds: [
                    call.protocolCallAttributionId,
                    call.sourceFactId,
                    call.observationId
                ]

            });


            needs.push({

                needId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-NEED",
                        input.protocolId,
                        call.protocolCallAttributionId
                    ]),

                participantId:
                    input.protocolId,

                subject,

                evidenceIds: [
                    call.protocolCallAttributionId,
                    call.sourceFactId,
                    call.observationId
                ],

                status:
                    "UNRESOLVED",

                candidateProviderParticipantIds:
                    []

            });

        }


        const boundaries:
            ScientificCompositionBoundary[] = [];


        /*
         * REQUIRE statements only become protocol boundaries when
         * their containing Solidity container has already been
         * structurally attributed to this protocol.
         *
         * No pair-specific ScientificCompositionConstraint is used.
         */
        for (
            const fact
            of input.sourceFacts
        ) {

            if (
                fact.kind !==
                "REQUIRE_STATEMENT"
            ) {
                continue;
            }


            if (
                !fact.containerKind ||
                !fact.containerSymbol
            ) {
                continue;
            }


            if (
                !containers.has(
                    containerKey(
                        fact.containerKind,
                        fact.containerSymbol
                    )
                )
            ) {
                continue;
            }


            boundaries.push({

                boundaryId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-BOUNDARY",
                        input.protocolId,
                        fact.factId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "SOURCE_CONSTRAINT",

                subject:
                    normalize(
                        fact.rawText
                    ),

                evidenceIds: [
                    fact.factId,
                    fact.observationId
                ]

            });

        }


        /*
         * Normative documentary statements are distinct from
         * executable Solidity REQUIRE statements.
         *
         * They establish what this participant documents as
         * required to remain true. They do not establish
         * candidate compatibility or runtime preservation.
         */
        for (
            const statement
            of input.normativeStatements ?? []
        ) {

            boundaries.push({

                boundaryId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-NORMATIVE-BOUNDARY",
                        input.protocolId,
                        statement.statementId
                    ]),

                participantId:
                    input.protocolId,

                kind:
                    "NORMATIVE_SOURCE_CONSTRAINT",

                subject:
                    statement.normalizedText,

                evidenceIds: [
                    statement.statementId,
                    statement.observationId
                ]

            });

        }


        contributions.sort(
            (a, b) =>
                a.contributionId.localeCompare(
                    b.contributionId
                )
        );

        boundaries.sort(
            (a, b) =>
                a.boundaryId.localeCompare(
                    b.boundaryId
                )
        );

        needs.sort(
            (a, b) =>
                a.needId.localeCompare(
                    b.needId
                )
        );


        const profile:
            ScientificProtocolCompositionProfile = {

                profileId:
                    encode([
                        "SCIENTIFIC-PROTOCOL-COMPOSITION-PROFILE",
                        input.protocolId,
                        input.sourceId,
                        input.sourceRevision ??
                            "NO-REVISION"
                    ]),

                protocolId:
                    input.protocolId,

                sourceId:
                    input.sourceId,

                sourceRevision:
                    input.sourceRevision,

                attributedContainerSymbols:
                    [...containers].sort(),

                contributions,

                boundaries,

                needs

            };


        return {
            profile,
            errors: []
        };

    }

}
