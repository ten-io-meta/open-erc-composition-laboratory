import type {
    ScientificCrossProtocolInteractionHypothesis
} from "../scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesis.js";

import type {
    ScientificCrossProtocolInteractionCallKind,
    ScientificCrossProtocolInteractionObservation
} from "../scientific-joint-contract-harness/ScientificCrossProtocolInteractionObservation.js";

import type {
    ScientificSourceExternalCallForm
} from "../scientific-source-fact/ScientificSourceExternalCall.js";

import type {
    ScientificInteractionShadowCallKindAssessment,
    ScientificInteractionShadowValidation
} from "./ScientificInteractionShadowValidation.js";

import type {
    ScientificInteractionShadowValidationResult
} from "./ScientificInteractionShadowValidationResult.js";


export interface ScientificInteractionShadowValidationInput {

    hypotheses:
        ScientificCrossProtocolInteractionHypothesis[];

    observations:
        ScientificCrossProtocolInteractionObservation[];

}


export class ScientificInteractionShadowValidationEngine {

    validate(
        input:
            ScientificInteractionShadowValidationInput
    ): ScientificInteractionShadowValidationResult {

        const errors =
            this.boundaryErrors(
                input
            );


        if (
            errors.length >
            0
        ) {

            return {

                validations:
                    [],

                unmatchedHypothesisIds:
                    input.hypotheses
                        .map(
                            hypothesis =>
                                hypothesis.hypothesisId
                        )
                        .sort(),

                unmatchedObservationIds:
                    input.observations
                        .map(
                            observation =>
                                observation.observationId
                        )
                        .sort(),

                ambiguousDirectionKeys:
                    [],

                errors

            };

        }


        const hypothesesByDirection =
            new Map<
                string,
                ScientificCrossProtocolInteractionHypothesis[]
            >();

        const observationsByDirection =
            new Map<
                string,
                ScientificCrossProtocolInteractionObservation[]
            >();


        for (
            const hypothesis
            of input.hypotheses
        ) {

            const key =
                this.directionKey(
                    hypothesis.candidateId,
                    hypothesis.sourceSide,
                    hypothesis.targetSide
                );

            const current =
                hypothesesByDirection.get(
                    key
                ) ??
                [];

            current.push(
                hypothesis
            );

            hypothesesByDirection.set(
                key,
                current
            );

        }


        for (
            const observation
            of input.observations
        ) {

            const key =
                this.directionKey(
                    observation.candidateId,
                    observation.sourceSide,
                    observation.targetSide
                );

            const current =
                observationsByDirection.get(
                    key
                ) ??
                [];

            current.push(
                observation
            );

            observationsByDirection.set(
                key,
                current
            );

        }


        for (
            const group
            of hypothesesByDirection.values()
        ) {

            group.sort(
                (
                    left,
                    right
                ) =>
                    left.hypothesisId.localeCompare(
                        right.hypothesisId
                    )
            );

        }


        for (
            const group
            of observationsByDirection.values()
        ) {

            group.sort(
                (
                    left,
                    right
                ) =>
                    left.observationId.localeCompare(
                        right.observationId
                    )
            );

        }


        const directionKeys =
            [
                ...new Set([
                    ...hypothesesByDirection.keys(),
                    ...observationsByDirection.keys()
                ])
            ].sort();


        const validations:
            ScientificInteractionShadowValidation[] =
            [];

        const unmatchedHypothesisIds =
            new Set<string>();

        const unmatchedObservationIds =
            new Set<string>();

        const ambiguousDirectionKeys =
            new Set<string>();


        for (
            const key
            of directionKeys
        ) {

            const hypotheses =
                hypothesesByDirection.get(
                    key
                ) ??
                [];

            const observations =
                observationsByDirection.get(
                    key
                ) ??
                [];


            if (
                hypotheses.length ===
                    0
            ) {

                for (
                    const observation
                    of observations
                ) {

                    unmatchedObservationIds.add(
                        observation.observationId
                    );

                }

                continue;

            }


            if (
                observations.length ===
                    0
            ) {

                for (
                    const hypothesis
                    of hypotheses
                ) {

                    unmatchedHypothesisIds.add(
                        hypothesis.hypothesisId
                    );

                }

                continue;

            }


            /*
             * Runtime observations currently identify candidate and
             * A/B direction, but not a unique source call-site.
             *
             * Therefore a many-to-one or one-to-many group cannot be
             * joined scientifically without inventing correspondence.
             */
            if (
                hypotheses.length !==
                    1 ||
                observations.length !==
                    1
            ) {

                ambiguousDirectionKeys.add(
                    key
                );


                for (
                    const hypothesis
                    of hypotheses
                ) {

                    unmatchedHypothesisIds.add(
                        hypothesis.hypothesisId
                    );

                }


                for (
                    const observation
                    of observations
                ) {

                    unmatchedObservationIds.add(
                        observation.observationId
                    );

                }

                continue;

            }


            const hypothesis =
                hypotheses[0];

            const observation =
                observations[0];

            const predictedCallKind =
                this.predictedCallKind(
                    hypothesis.externalCall.callForm
                );

            const callKindAssessment =
                this.callKindAssessment(
                    predictedCallKind,
                    observation.callKind
                );


            validations.push({

                shadowValidationId:
                    this.shadowValidationId(
                        hypothesis.hypothesisId,
                        observation.observationId,
                        predictedCallKind,
                        observation.callKind
                    ),

                hypothesisId:
                    hypothesis.hypothesisId,

                observationId:
                    observation.observationId,

                candidateId:
                    hypothesis.candidateId,

                sourceSide:
                    hypothesis.sourceSide,

                targetSide:
                    hypothesis.targetSide,

                directionStatus:
                    "OBSERVED",

                ...(
                    predictedCallKind ===
                        undefined
                        ? {}
                        : {
                            predictedCallKind
                        }
                ),

                observedCallKind:
                    observation.callKind,

                callKindAssessment,

                hypothesisEvidenceIds:
                    [
                        ...new Set(
                            hypothesis.behaviorEvidenceIds
                        )
                    ].sort(),

                runtimeEvidence:
                    [
                        ...observation.evidence
                    ]

            });

        }


        validations.sort(
            (
                left,
                right
            ) =>
                left.shadowValidationId.localeCompare(
                    right.shadowValidationId
                )
        );


        return {

            validations,

            unmatchedHypothesisIds:
                [
                    ...unmatchedHypothesisIds
                ].sort(),

            unmatchedObservationIds:
                [
                    ...unmatchedObservationIds
                ].sort(),

            ambiguousDirectionKeys:
                [
                    ...ambiguousDirectionKeys
                ].sort(),

            errors:
                []

        };

    }


    private boundaryErrors(
        input:
            ScientificInteractionShadowValidationInput
    ): string[] {

        const errors:
            string[] =
            [];

        const hypothesisIds =
            new Set<string>();


        for (
            const hypothesis
            of input.hypotheses
        ) {

            if (
                hypothesis.hypothesisId.trim().length ===
                    0
            ) {

                errors.push(
                    "Interaction shadow validation received an empty hypothesis identity."
                );

                continue;

            }


            if (
                hypothesisIds.has(
                    hypothesis.hypothesisId
                )
            ) {

                errors.push(
                    `Duplicate interaction hypothesis identity ${hypothesis.hypothesisId}.`
                );

            }

            hypothesisIds.add(
                hypothesis.hypothesisId
            );


            if (
                hypothesis.candidateId.trim().length ===
                    0
            ) {

                errors.push(
                    `Interaction hypothesis ${hypothesis.hypothesisId} has an empty candidate identity.`
                );

            }


            if (
                hypothesis.sourceSide ===
                    hypothesis.targetSide
            ) {

                errors.push(
                    `Interaction hypothesis ${hypothesis.hypothesisId} has identical source and target sides.`
                );

            }


            if (
                hypothesis.evaluationStatus !==
                    "UNEVALUATED"
            ) {

                errors.push(
                    `Interaction hypothesis ${hypothesis.hypothesisId} is not unevaluated at the shadow-validation boundary.`
                );

            }

        }


        const observationIds =
            new Set<string>();


        for (
            const observation
            of input.observations
        ) {

            if (
                observation.observationId.trim().length ===
                    0
            ) {

                errors.push(
                    "Interaction shadow validation received an empty runtime observation identity."
                );

                continue;

            }


            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate runtime interaction observation identity ${observation.observationId}.`
                );

            }

            observationIds.add(
                observation.observationId
            );


            if (
                observation.candidateId.trim().length ===
                    0
            ) {

                errors.push(
                    `Runtime interaction observation ${observation.observationId} has an empty candidate identity.`
                );

            }


            if (
                observation.sourceSide ===
                    observation.targetSide
            ) {

                errors.push(
                    `Runtime interaction observation ${observation.observationId} has identical source and target sides.`
                );

            }


            if (
                observation.status !==
                    "OBSERVED"
            ) {

                errors.push(
                    `Runtime interaction observation ${observation.observationId} is not physically observed.`
                );

            }


            if (
                observation.evidence.length ===
                    0
            ) {

                errors.push(
                    `Runtime interaction observation ${observation.observationId} has no evidence.`
                );

            }

        }


        return errors.sort();

    }


    private predictedCallKind(
        callForm:
            ScientificSourceExternalCallForm
    ): ScientificCrossProtocolInteractionCallKind | undefined {

        switch (
            callForm
        ) {

            case "LOW_LEVEL_CALL":
                return "CALL";

            case "LOW_LEVEL_STATICCALL":
                return "STATICCALL";

            case "LOW_LEVEL_DELEGATECALL":
                return "DELEGATECALL";

            case "CAST_MEMBER_CALL":
                return undefined;

        }

    }


    private callKindAssessment(
        predictedCallKind:
            ScientificCrossProtocolInteractionCallKind | undefined,
        observedCallKind:
            ScientificCrossProtocolInteractionCallKind
    ): ScientificInteractionShadowCallKindAssessment {

        if (
            predictedCallKind ===
                undefined
        ) {

            return "SOURCE_CALL_KIND_NOT_DETERMINED";

        }


        return predictedCallKind ===
            observedCallKind
            ? "CONFIRMED"
            : "CONTRADICTED";

    }


    private directionKey(
        candidateId:
            string,
        sourceSide:
            string,
        targetSide:
            string
    ): string {

        return this.tupleId([
            "INTERACTION-DIRECTION",
            candidateId,
            sourceSide,
            targetSide
        ]);

    }


    private shadowValidationId(
        hypothesisId:
            string,
        observationId:
            string,
        predictedCallKind:
            ScientificCrossProtocolInteractionCallKind | undefined,
        observedCallKind:
            ScientificCrossProtocolInteractionCallKind
    ): string {

        return this.tupleId([
            "SCIENTIFIC-INTERACTION-SHADOW-VALIDATION",
            hypothesisId,
            observationId,
            predictedCallKind ??
                "SOURCE-CALL-KIND-NOT-DETERMINED",
            observedCallKind
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
