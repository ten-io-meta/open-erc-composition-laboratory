import type {
    ScientificProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificDocumentaryCompositionCandidate
} from "./ScientificDocumentaryCompositionCandidate.js";

import type {
    ScientificDocumentaryCompositionCandidateResult
} from "./ScientificDocumentaryCompositionCandidateResult.js";


/*
 * Deliberately minimal participant surface.
 *
 * The engine needs protocol identity and source provenance only.
 * It does not consume capabilities, contributions, needs,
 * boundaries, compatibility or runtime evidence.
 *
 * ScientificProtocolCompositionProfile is structurally compatible
 * with this surface without coupling this evidence layer to the
 * full profile model.
 */
export interface ScientificDocumentaryCompositionParticipantProfile {

    protocolId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


export interface ScientificDocumentaryCompositionCandidateEngineInput {

    profiles:
        ScientificDocumentaryCompositionParticipantProfile[];

    relations:
        ScientificProtocolRelationEvidence[];

}


interface CandidateAccumulator {

    subjectParticipantId:
        string;

    objectParticipantId:
        string;

    relation:
        ScientificProtocolRelationEvidence["relation"];

    evidenceIds:
        Set<string>;

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


export class ScientificDocumentaryCompositionCandidateEngine {

    discover(
        input:
            ScientificDocumentaryCompositionCandidateEngineInput
    ): ScientificDocumentaryCompositionCandidateResult {

        const errors:
            string[] = [];


        const profilesByProtocolId =
            new Map<
                string,
                ScientificDocumentaryCompositionParticipantProfile
            >();


        for (
            const profile
            of input.profiles
        ) {

            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Documentary composition participant has unsupported protocol identity ${profile.protocolId}.`
                );

                continue;

            }


            if (
                profile.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    `Documentary composition participant ${profile.protocolId} has an empty source identity.`
                );

            }


            if (
                profilesByProtocolId.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate documentary composition participant ${profile.protocolId}.`
                );

                continue;

            }


            profilesByProtocolId.set(
                profile.protocolId,
                profile
            );

        }


        const relationEvidenceIds =
            new Set<string>();


        for (
            const relation
            of input.relations
        ) {

            if (
                relation.relationEvidenceId.trim().length ===
                0
            ) {

                errors.push(
                    "Documentary composition candidate received an empty relation evidence identity."
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
                relation.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} has an empty source identity.`
                );

            }


            if (
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.objectProtocolId
                )
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} has unsupported object protocol identity ${relation.objectProtocolId}.`
                );

            }


            if (
                relation.subjectProtocolId !==
                    undefined &&
                !/^ERC-[1-9][0-9]*$/.test(
                    relation.subjectProtocolId
                )
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} has unsupported subject protocol identity ${relation.subjectProtocolId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                unresolvedObjectProtocolIds:
                    [],

                unresolvedRelationEvidenceIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        /*
         * Provenance is checked only after basic identity validation
         * succeeds, so malformed input fails closed before discovery.
         */
        for (
            const relation
            of input.relations
        ) {

            if (
                relation.subjectProtocolId ===
                undefined
            ) {

                continue;

            }


            const subjectProfile =
                profilesByProtocolId.get(
                    relation.subjectProtocolId
                );


            if (
                !subjectProfile
            ) {

                continue;

            }


            if (
                relation.sourceId !==
                    subjectProfile.sourceId
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} source does not match subject participant ${relation.subjectProtocolId}.`
                );

            }


            if (
                relation.sourceRevision !==
                    subjectProfile.sourceRevision
            ) {

                errors.push(
                    `Documentary relation ${relation.relationEvidenceId} revision does not match subject participant ${relation.subjectProtocolId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                candidates:
                    [],

                unresolvedObjectProtocolIds:
                    [],

                unresolvedRelationEvidenceIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        const unresolvedObjectProtocolIds =
            new Set<string>();

        const unresolvedRelationEvidenceIds =
            new Set<string>();

        const accumulators =
            new Map<
                string,
                CandidateAccumulator
            >();


        for (
            const relation
            of [...input.relations].sort(
                (a, b) =>
                    a.relationEvidenceId.localeCompare(
                        b.relationEvidenceId
                    )
            )
        ) {

            const subjectProtocolId =
                relation.subjectProtocolId;


            /*
             * A documentary symbol alone is not promoted to protocol
             * ownership here. Canonical subject identity must already
             * have been established upstream.
             */
            if (
                subjectProtocolId ===
                undefined
            ) {

                unresolvedRelationEvidenceIds.add(
                    relation.relationEvidenceId
                );

                continue;

            }


            const subjectProfile =
                profilesByProtocolId.get(
                    subjectProtocolId
                );


            if (
                !subjectProfile
            ) {

                unresolvedRelationEvidenceIds.add(
                    relation.relationEvidenceId
                );

                continue;

            }


            const objectProfile =
                profilesByProtocolId.get(
                    relation.objectProtocolId
                );


            if (
                !objectProfile
            ) {

                unresolvedObjectProtocolIds.add(
                    relation.objectProtocolId
                );

                unresolvedRelationEvidenceIds.add(
                    relation.relationEvidenceId
                );

                continue;

            }


            /*
             * Self-relations are preserved as documentary evidence
             * upstream but are not cross-protocol composition
             * candidates.
             */
            if (
                subjectProtocolId ===
                    relation.objectProtocolId
            ) {

                unresolvedRelationEvidenceIds.add(
                    relation.relationEvidenceId
                );

                continue;

            }


            const key =
                encode([
                    subjectProtocolId,
                    relation.relation,
                    relation.objectProtocolId
                ]);


            let accumulator =
                accumulators.get(
                    key
                );


            if (
                !accumulator
            ) {

                accumulator = {

                    subjectParticipantId:
                        subjectProtocolId,

                    objectParticipantId:
                        relation.objectProtocolId,

                    relation:
                        relation.relation,

                    evidenceIds:
                        new Set<string>()

                };


                accumulators.set(
                    key,
                    accumulator
                );

            }


            accumulator.evidenceIds.add(
                relation.relationEvidenceId
            );

        }


        const candidates:
            ScientificDocumentaryCompositionCandidate[] =
            [
                ...accumulators.values()
            ]
                .map(
                    accumulator => ({

                        candidateId:
                            encode([
                                "SCIENTIFIC-DOCUMENTARY-COMPOSITION-CANDIDATE",
                                accumulator.subjectParticipantId,
                                accumulator.relation,
                                accumulator.objectParticipantId
                            ]),

                        subjectParticipantId:
                            accumulator.subjectParticipantId,

                        objectParticipantId:
                            accumulator.objectParticipantId,

                        relation:
                            accumulator.relation,

                        evidenceIds:
                            [
                                ...accumulator.evidenceIds
                            ].sort(),

                        evaluationStatus:
                            "UNEVALUATED" as const

                    })
                )
                .sort(
                    (a, b) =>
                        a.candidateId.localeCompare(
                            b.candidateId
                        )
                );


        return {

            candidates,

            unresolvedObjectProtocolIds:
                [
                    ...unresolvedObjectProtocolIds
                ].sort(),

            unresolvedRelationEvidenceIds:
                [
                    ...unresolvedRelationEvidenceIds
                ].sort(),

            errors:
                []

        };

    }

}