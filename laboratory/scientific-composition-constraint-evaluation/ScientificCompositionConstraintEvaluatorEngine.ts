import type {
    ScientificCompositionConstraint
} from "../scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";

import type {
    ScientificCompositionConstraintObservation
} from "./ScientificCompositionConstraintObservation.js";

import type {
    ScientificCompositionConstraintEvaluation
} from "./ScientificCompositionConstraintEvaluation.js";

import type {
    ScientificCompositionConstraintEvaluationResult,
    ScientificCompositionConstraintScientificPolarity
} from "./ScientificCompositionConstraintEvaluationResult.js";


export class ScientificCompositionConstraintEvaluatorEngine {

    evaluate(
        constraints:
            ScientificCompositionConstraint[],
        observations:
            ScientificCompositionConstraintObservation[]
    ): ScientificCompositionConstraintEvaluationResult {

        const errors:
            string[] = [];

        const constraintById =
            new Map<
                string,
                ScientificCompositionConstraint
            >();

        const candidateIds =
            new Set<string>();


        for (
            const constraint
            of constraints
        ) {

            candidateIds.add(
                constraint.candidateId
            );


            if (
                constraintById.has(
                    constraint.constraintId
                )
            ) {

                errors.push(
                    `Duplicate composition constraint ${constraint.constraintId}.`
                );

                continue;

            }


            constraintById.set(
                constraint.constraintId,
                constraint
            );

        }


        if (
            constraints.length ===
            0
        ) {

            errors.push(
                "No composition constraints were supplied for evaluation."
            );

        }


        if (
            candidateIds.size >
            1
        ) {

            errors.push(
                "Composition constraint evaluation contains multiple candidate identities."
            );

        }


        const candidateId =
            candidateIds.size ===
                1
                ? [...candidateIds][0]
                : null;


        const observationIds =
            new Set<string>();

        const observationsByConstraint =
            new Map<
                string,
                ScientificCompositionConstraintObservation[]
            >();


        for (
            const observation
            of observations
        ) {

            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate composition constraint observation ${observation.observationId}.`
                );

                continue;

            }


            observationIds.add(
                observation.observationId
            );


            const constraint =
                constraintById.get(
                    observation.constraintId
                );


            if (
                !constraint
            ) {

                errors.push(
                    `Composition constraint observation ${observation.observationId} references unknown constraint ${observation.constraintId}.`
                );

                continue;

            }


            if (
                observation.candidateId !==
                constraint.candidateId
            ) {

                errors.push(
                    `Composition constraint observation ${observation.observationId} candidate identity does not match constraint ${constraint.constraintId}.`
                );

                continue;

            }


            if (
                observation.participantSide !==
                constraint.participantSide
            ) {

                errors.push(
                    `Composition constraint observation ${observation.observationId} participant side does not match constraint ${constraint.constraintId}.`
                );

                continue;

            }


            const evidence =
                observation.evidence
                    .map(
                        entry =>
                            entry.trim()
                    )
                    .filter(
                        entry =>
                            entry.length >
                            0
                    );


            if (
                evidence.length ===
                0
            ) {

                errors.push(
                    `Composition constraint observation ${observation.observationId} contains no concrete execution evidence.`
                );

                continue;

            }


            const existing =
                observationsByConstraint.get(
                    observation.constraintId
                ) ??
                [];


            existing.push({
                ...observation,
                evidence
            });


            observationsByConstraint.set(
                observation.constraintId,
                existing
            );

        }


        const evaluations:
            ScientificCompositionConstraintEvaluation[] =
            constraints.map(
                constraint =>
                    this.evaluateConstraint(
                        constraint,
                        observationsByConstraint.get(
                            constraint.constraintId
                        ) ??
                        []
                    )
            );


        const statistics = {

            total:
                evaluations.length,

            preserved:
                this.countStatus(
                    evaluations,
                    "PRESERVED"
                ),

            violated:
                this.countStatus(
                    evaluations,
                    "VIOLATED"
                ),

            unevaluated:
                this.countStatus(
                    evaluations,
                    "UNEVALUATED"
                )

        };


        return {

            candidateId,

            evaluations,

            scientificPolarity:
                this.scientificPolarityFor(
                    statistics,
                    errors
                ),

            statistics,

            errors

        };

    }


    private evaluateConstraint(
        constraint:
            ScientificCompositionConstraint,
        observations:
            ScientificCompositionConstraintObservation[]
    ): ScientificCompositionConstraintEvaluation {

        const violated =
            observations.filter(
                observation =>
                    observation.verdict ===
                    "VIOLATED"
            );

        const preserved =
            observations.filter(
                observation =>
                    observation.verdict ===
                    "PRESERVED"
            );


        const status:
            ScientificCompositionConstraintEvaluation["status"] =
            violated.length >
                0
                ? "VIOLATED"
                : preserved.length >
                    0
                    ? "PRESERVED"
                    : "UNEVALUATED";


        const relevantObservations =
            status ===
                "VIOLATED"
                ? violated
                : status ===
                    "PRESERVED"
                    ? preserved
                    : [];


        return {

            constraintId:
                constraint.constraintId,

            candidateId:
                constraint.candidateId,

            participantSide:
                constraint.participantSide,

            status,

            observationIds:
                relevantObservations.map(
                    observation =>
                        observation.observationId
                ),

            evidence:
                relevantObservations.flatMap(
                    observation =>
                        observation.evidence
                )

        };

    }


    private scientificPolarityFor(
        statistics: {
            total: number;
            preserved: number;
            violated: number;
            unevaluated: number;
        },
        errors:
            string[]
    ): ScientificCompositionConstraintScientificPolarity {

        /*
         * Referential-integrity or evidence errors fail closed.
         * No SUPPORT or CHALLENGE claim is emitted from malformed
         * constraint evidence.
         */
        if (
            errors.length >
            0
        ) {

            return "INCONCLUSIVE";

        }


        /*
         * One observed constraint violation is sufficient to
         * challenge preservation of the composition constraints.
         */
        if (
            statistics.violated >
            0
        ) {

            return "CHALLENGE";

        }


        /*
         * SUPPORT requires complete coverage. A merely successful
         * bilateral execution is not enough.
         */
        if (
            statistics.total >
                0 &&
            statistics.preserved ===
                statistics.total &&
            statistics.unevaluated ===
                0
        ) {

            return "SUPPORT";

        }


        return "INCONCLUSIVE";

    }


    private countStatus(
        evaluations:
            ScientificCompositionConstraintEvaluation[],
        status:
            ScientificCompositionConstraintEvaluation["status"]
    ): number {

        return evaluations.filter(
            evaluation =>
                evaluation.status ===
                status
        ).length;

    }

}
