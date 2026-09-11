import type {
    ScientificCompositionCandidate
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificProtocolAttributedExternalCall
} from "../scientific-protocol-identity/ScientificProtocolAttributedExternalCall.js";

import type {
    ScientificProtocolBehaviorReachability
} from "../scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachability.js";

import type {
    ScientificSourceExternalCall
} from "../scientific-source-fact/ScientificSourceExternalCall.js";

import type {
    ScientificCrossProtocolInteractionHypothesis,
    ScientificCrossProtocolInteractionHypothesisSide
} from "./ScientificCrossProtocolInteractionHypothesis.js";

import type {
    ScientificCrossProtocolInteractionHypothesisResult
} from "./ScientificCrossProtocolInteractionHypothesisResult.js";


export interface ScientificCrossProtocolInteractionHypothesisInput {

    candidates:
        ScientificCompositionCandidate[];

    protocolAttributedExternalCalls:
        ScientificProtocolAttributedExternalCall[];

    reachableBehaviors:
        ScientificProtocolBehaviorReachability[];

}


export class ScientificCrossProtocolInteractionHypothesisEngine {

    generate(
        input:
            ScientificCrossProtocolInteractionHypothesisInput
    ): ScientificCrossProtocolInteractionHypothesisResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                hypotheses:
                    [],

                candidateIdsWithoutHypotheses:
                    input.candidates
                        .map(
                            candidate =>
                                candidate.candidateId
                        )
                        .sort(),

                errors

            };

        }


        const hypotheses =
            new Map<
                string,
                ScientificCrossProtocolInteractionHypothesis
            >();

        const candidateIdsWithoutHypotheses =
            new Set<string>();


        const calls =
            [
                ...input.protocolAttributedExternalCalls
            ].sort(
                (
                    left,
                    right
                ) =>
                    left.protocolCallAttributionId.localeCompare(
                        right.protocolCallAttributionId
                    )
            );


        const reachableBehaviors =
            [
                ...input.reachableBehaviors
            ].sort(
                (
                    left,
                    right
                ) =>
                    left.behaviorReachabilityId.localeCompare(
                        right.behaviorReachabilityId
                    )
            );


        const candidates =
            [
                ...input.candidates
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
            of candidates
        ) {

            if (
                candidate.participantA.kind !==
                    "PROTOCOL" ||
                candidate.participantB.kind !==
                    "PROTOCOL"
            ) {

                candidateIdsWithoutHypotheses.add(
                    candidate.candidateId
                );

                continue;

            }


            const participantA =
                candidate.participantA.id;

            const participantB =
                candidate.participantB.id;

            let emitted =
                false;


            /*
             * Direct call-sites are eligible only when their actual
             * origin protocol is itself one of the candidate
             * participants.
             */
            for (
                const call
                of calls
            ) {

                const side =
                    this.sideForProtocol(
                        call.protocolId,
                        participantA,
                        participantB
                    );


                if (
                    !side
                ) {

                    continue;

                }


                const targetSide =
                    this.oppositeSide(
                        side
                    );

                const targetProtocolId =
                    targetSide ===
                        "A"
                        ? participantA
                        : participantB;

                const candidateProvenanceEvidenceIds =
                    this.candidateProvenanceEvidenceIds(
                        candidate
                    );

                const behaviorEvidenceIds =
                    [
                        call.protocolCallAttributionId,
                        call.sourceFactId
                    ].sort();

                const hypothesisId =
                    this.hypothesisId(
                        candidate.candidateId,
                        side,
                        targetSide,
                        call.protocolId,
                        targetProtocolId,
                        call.protocolCallAttributionId,
                        undefined,
                        "DIRECT_CALL_SITE_WITH_CANDIDATE_PEER"
                    );


                hypotheses.set(
                    hypothesisId,
                    {

                        hypothesisId,

                        candidateId:
                            candidate.candidateId,

                        sourceSide:
                            side,

                        targetSide,

                        sourceParticipantProtocolId:
                            call.protocolId,

                        hypothesizedTargetParticipantProtocolId:
                            targetProtocolId,

                        originProtocolId:
                            call.protocolId,

                        behaviorEvidenceKind:
                            "DIRECT_PROTOCOL_CALL",

                        hypothesisBasis:
                            "DIRECT_CALL_SITE_WITH_CANDIDATE_PEER",

                        protocolCallAttributionId:
                            call.protocolCallAttributionId,

                        sourceCallFactId:
                            call.sourceFactId,

                        externalCall:
                            this.copyExternalCall(
                                call.externalCall
                            ),

                        candidateProvenanceEvidenceIds,

                        behaviorEvidenceIds,

                        evaluationStatus:
                            "UNEVALUATED"

                    }
                );

                emitted =
                    true;

            }


            /*
             * Inherited behavior is joined by the participant protocol,
             * while retaining the independently observed origin protocol.
             */
            for (
                const reachable
                of reachableBehaviors
            ) {

                const side =
                    this.sideForProtocol(
                        reachable.participantProtocolId,
                        participantA,
                        participantB
                    );


                if (
                    !side
                ) {

                    continue;

                }


                const targetSide =
                    this.oppositeSide(
                        side
                    );

                const targetProtocolId =
                    targetSide ===
                        "A"
                        ? participantA
                        : participantB;

                const candidateProvenanceEvidenceIds =
                    this.candidateProvenanceEvidenceIds(
                        candidate
                    );

                const behaviorEvidenceIds =
                    [
                        reachable.behaviorReachabilityId,
                        reachable.protocolCallAttributionId,
                        reachable.sourceCallFactId,
                        ...reachable.protocolRelationEvidenceIds,
                        ...reachable.inheritanceEdgeIds
                    ].sort();

                const hypothesisId =
                    this.hypothesisId(
                        candidate.candidateId,
                        side,
                        targetSide,
                        reachable.originProtocolId,
                        targetProtocolId,
                        reachable.protocolCallAttributionId,
                        reachable.behaviorReachabilityId,
                        "INHERITED_CALL_SITE_WITH_CANDIDATE_PEER"
                    );


                hypotheses.set(
                    hypothesisId,
                    {

                        hypothesisId,

                        candidateId:
                            candidate.candidateId,

                        sourceSide:
                            side,

                        targetSide,

                        sourceParticipantProtocolId:
                            reachable.participantProtocolId,

                        hypothesizedTargetParticipantProtocolId:
                            targetProtocolId,

                        originProtocolId:
                            reachable.originProtocolId,

                        behaviorEvidenceKind:
                            "INHERITED_PROTOCOL_BEHAVIOR",

                        hypothesisBasis:
                            "INHERITED_CALL_SITE_WITH_CANDIDATE_PEER",

                        protocolCallAttributionId:
                            reachable.protocolCallAttributionId,

                        sourceCallFactId:
                            reachable.sourceCallFactId,

                        behaviorReachabilityId:
                            reachable.behaviorReachabilityId,

                        externalCall:
                            this.copyExternalCall(
                                reachable.externalCall
                            ),

                        candidateProvenanceEvidenceIds,

                        behaviorEvidenceIds,

                        evaluationStatus:
                            "UNEVALUATED"

                    }
                );

                emitted =
                    true;

            }


            if (
                !emitted
            ) {

                candidateIdsWithoutHypotheses.add(
                    candidate.candidateId
                );

            }

        }


        const result =
            [
                ...hypotheses.values()
            ].sort(
                (
                    left,
                    right
                ) =>
                    left.hypothesisId.localeCompare(
                        right.hypothesisId
                    )
            );


        return {

            hypotheses:
                result,

            candidateIdsWithoutHypotheses:
                [
                    ...candidateIdsWithoutHypotheses
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificCrossProtocolInteractionHypothesisInput
    ): string[] {

        const errors:
            string[] =
            [];


        const candidateIds =
            new Set<string>();


        for (
            const candidate
            of input.candidates
        ) {

            if (
                candidate.candidateId.trim().length ===
                    0
            ) {

                errors.push(
                    "Interaction hypothesis generation received an empty candidate identity."
                );

                continue;

            }


            if (
                candidateIds.has(
                    candidate.candidateId
                )
            ) {

                errors.push(
                    `Duplicate scientific composition candidate identity ${candidate.candidateId}.`
                );

            }

            candidateIds.add(
                candidate.candidateId
            );


            if (
                candidate.participantA.id.trim().length ===
                    0 ||
                candidate.participantB.id.trim().length ===
                    0
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} contains an empty participant identity.`
                );

            }


            if (
                candidate.participantA.kind ===
                    "PROTOCOL" &&
                !this.isProtocolId(
                    candidate.participantA.id
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} contains an unsupported protocol participant identity ${candidate.participantA.id}.`
                );

            }


            if (
                candidate.participantB.kind ===
                    "PROTOCOL" &&
                !this.isProtocolId(
                    candidate.participantB.id
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} contains an unsupported protocol participant identity ${candidate.participantB.id}.`
                );

            }


            if (
                candidate.participantA.kind ===
                    "PROTOCOL" &&
                candidate.participantB.kind ===
                    "PROTOCOL" &&
                candidate.participantA.id ===
                    candidate.participantB.id
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} contains the same protocol on both sides.`
                );

            }

        }


        const callsById =
            new Map<
                string,
                ScientificProtocolAttributedExternalCall
            >();


        for (
            const call
            of input.protocolAttributedExternalCalls
        ) {

            if (
                call.protocolCallAttributionId.trim().length ===
                    0
            ) {

                errors.push(
                    "Interaction hypothesis generation received an empty protocol call attribution identity."
                );

                continue;

            }


            if (
                callsById.has(
                    call.protocolCallAttributionId
                )
            ) {

                errors.push(
                    `Duplicate protocol call attribution identity ${call.protocolCallAttributionId}.`
                );

                continue;

            }


            callsById.set(
                call.protocolCallAttributionId,
                call
            );


            if (
                !this.isProtocolId(
                    call.protocolId
                )
            ) {

                errors.push(
                    `Protocol call attribution ${call.protocolCallAttributionId} contains an unsupported protocol identity ${call.protocolId}.`
                );

            }


            if (
                call.sourceFactId.trim().length ===
                    0
            ) {

                errors.push(
                    `Protocol call attribution ${call.protocolCallAttributionId} contains an empty source fact identity.`
                );

            }


            if (
                call.externalCall.targetExpression.trim().length ===
                    0
            ) {

                errors.push(
                    `Protocol call attribution ${call.protocolCallAttributionId} contains an empty target expression.`
                );

            }

        }


        const reachabilityIds =
            new Set<string>();


        for (
            const reachable
            of input.reachableBehaviors
        ) {

            if (
                reachable.behaviorReachabilityId.trim().length ===
                    0
            ) {

                errors.push(
                    "Interaction hypothesis generation received an empty behavior reachability identity."
                );

                continue;

            }


            if (
                reachabilityIds.has(
                    reachable.behaviorReachabilityId
                )
            ) {

                errors.push(
                    `Duplicate behavior reachability identity ${reachable.behaviorReachabilityId}.`
                );

            }

            reachabilityIds.add(
                reachable.behaviorReachabilityId
            );


            if (
                !this.isProtocolId(
                    reachable.participantProtocolId
                ) ||
                !this.isProtocolId(
                    reachable.originProtocolId
                )
            ) {

                errors.push(
                    `Behavior reachability ${reachable.behaviorReachabilityId} contains an unsupported protocol identity.`
                );

            }


            const sourceCall =
                callsById.get(
                    reachable.protocolCallAttributionId
                );


            if (
                !sourceCall
            ) {

                errors.push(
                    `Behavior reachability ${reachable.behaviorReachabilityId} does not reference an available protocol-attributed external call.`
                );

                continue;

            }


            if (
                sourceCall.protocolId !==
                    reachable.originProtocolId
            ) {

                errors.push(
                    `Behavior reachability ${reachable.behaviorReachabilityId} does not preserve the origin protocol of its source call.`
                );

            }


            if (
                sourceCall.sourceFactId !==
                    reachable.sourceCallFactId
            ) {

                errors.push(
                    `Behavior reachability ${reachable.behaviorReachabilityId} does not preserve the source fact of its call attribution.`
                );

            }


            if (
                !this.sameExternalCall(
                    sourceCall.externalCall,
                    reachable.externalCall
                )
            ) {

                errors.push(
                    `Behavior reachability ${reachable.behaviorReachabilityId} does not preserve its source external-call syntax.`
                );

            }

        }


        return errors.sort();

    }


    private sideForProtocol(
        protocolId:
            string,
        participantA:
            string,
        participantB:
            string
    ): ScientificCrossProtocolInteractionHypothesisSide | undefined {

        if (
            protocolId ===
                participantA
        ) {

            return "A";

        }


        if (
            protocolId ===
                participantB
        ) {

            return "B";

        }


        return undefined;

    }


    private oppositeSide(
        side:
            ScientificCrossProtocolInteractionHypothesisSide
    ): ScientificCrossProtocolInteractionHypothesisSide {

        return side ===
            "A"
            ? "B"
            : "A";

    }


    private candidateProvenanceEvidenceIds(
        candidate:
            ScientificCompositionCandidate
    ): string[] {

        return [
            ...new Set(
                candidate.provenance.map(
                    provenance =>
                        provenance.evidenceId
                )
            )
        ].sort();

    }


    private isProtocolId(
        value:
            string
    ): boolean {

        return /^ERC-[1-9][0-9]*$/.test(
            value
        );

    }


    private sameExternalCall(
        left:
            ScientificSourceExternalCall,
        right:
            ScientificSourceExternalCall
    ): boolean {

        return (
            left.callForm ===
                right.callForm &&
            left.targetExpression ===
                right.targetExpression &&
            left.castTypeSymbol ===
                right.castTypeSymbol &&
            left.memberSymbol ===
                right.memberSymbol &&
            left.encodedCallTypeSymbol ===
                right.encodedCallTypeSymbol &&
            left.encodedCallMemberSymbol ===
                right.encodedCallMemberSymbol
        );

    }


    private copyExternalCall(
        call:
            ScientificSourceExternalCall
    ): ScientificSourceExternalCall {

        return {
            ...call
        };

    }


    private hypothesisId(
        candidateId:
            string,
        sourceSide:
            ScientificCrossProtocolInteractionHypothesisSide,
        targetSide:
            ScientificCrossProtocolInteractionHypothesisSide,
        originProtocolId:
            string,
        hypothesizedTargetProtocolId:
            string,
        protocolCallAttributionId:
            string,
        behaviorReachabilityId:
            string | undefined,
        basis:
            string
    ): string {

        return this.tupleId([
            "SCIENTIFIC-CROSS-PROTOCOL-INTERACTION-HYPOTHESIS",
            candidateId,
            sourceSide,
            targetSide,
            originProtocolId,
            hypothesizedTargetProtocolId,
            protocolCallAttributionId,
            behaviorReachabilityId ===
                undefined
                ? "REACHABILITY-ABSENT"
                : behaviorReachabilityId,
            basis
        ]);

    }


    private tupleId(
        components:
            string[]
    ): string {

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
