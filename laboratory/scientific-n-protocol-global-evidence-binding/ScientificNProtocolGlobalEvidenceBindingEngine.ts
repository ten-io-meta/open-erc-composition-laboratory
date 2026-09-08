import type {
    ScientificCompositionGlobalBoundaryObservation
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalBoundaryObservation.js";

import {
    ScientificCompositionGlobalEvaluationEngine
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalEvaluationEngine.js";

import type {
    ScientificNProtocolGlobalEvaluationBridgeResult,
    ScientificNProtocolGlobalEvaluationTarget
} from "../scientific-n-protocol-global-evaluation-bridge/ScientificNProtocolGlobalEvaluationBridge.js";

import type {
    ScientificNProtocolGlobalEvidenceBinding,
    ScientificNProtocolGlobalEvidenceBindingResult
} from "./ScientificNProtocolGlobalEvidenceBinding.js";


export interface ScientificNProtocolGlobalEvidenceBindingEngineInput {

    targets:
        ScientificNProtocolGlobalEvaluationBridgeResult;

    observations:
        ScientificCompositionGlobalBoundaryObservation[];

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


function sortedUnique(
    values:
        string[]
): string[] {

    return [
        ...new Set(
            values
        )
    ].sort();

}


export class ScientificNProtocolGlobalEvidenceBindingEngine {

    private readonly globalEvaluator =
        new ScientificCompositionGlobalEvaluationEngine();


    bindAndEvaluate(
        input:
            ScientificNProtocolGlobalEvidenceBindingEngineInput
    ): ScientificNProtocolGlobalEvidenceBindingResult {

        const errors:
            string[] = [];


        if (
            input.targets.errors.length >
            0
        ) {

            errors.push(
                "Cannot bind global evidence to evaluation targets containing errors."
            );

        }


        const targetsByGraphId =
            new Map<
                string,
                ScientificNProtocolGlobalEvaluationTarget
            >();

        const targetIds =
            new Set<string>();


        for (
            const target
            of input.targets.targets
        ) {

            if (
                targetIds.has(
                    target.targetId
                )
            ) {

                errors.push(
                    `Duplicate global evaluation target ${target.targetId}.`
                );

            }


            targetIds.add(
                target.targetId
            );


            if (
                targetsByGraphId.has(
                    target.graph.graphId
                )
            ) {

                errors.push(
                    `Multiple global evaluation targets reference graph ${target.graph.graphId}.`
                );

                continue;

            }


            if (
                target.status !==
                "READY_FOR_GLOBAL_EVALUATION"
            ) {

                errors.push(
                    `Global evaluation target ${target.targetId} is not ready.`
                );

            }


            if (
                target.graph.scientificPolarity !==
                "INCONCLUSIVE"
            ) {

                errors.push(
                    `Global evaluation target ${target.targetId} entered evidence binding with a pre-existing global claim.`
                );

            }


            targetsByGraphId.set(
                target.graph.graphId,
                target
            );

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
                    "Global boundary observation has an empty observationId."
                );

            }


            if (
                observation.graphId.trim().length ===
                0
            ) {

                errors.push(
                    `Global boundary observation ${observation.observationId} has an empty graphId.`
                );

            }


            if (
                observation.runId.trim().length ===
                0
            ) {

                errors.push(
                    `Global boundary observation ${observation.observationId} has an empty runId.`
                );

            }


            if (
                observation.boundaryId.trim().length ===
                0
            ) {

                errors.push(
                    `Global boundary observation ${observation.observationId} has an empty boundaryId.`
                );

            }


            if (
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate global boundary observation ${observation.observationId}.`
                );

                continue;

            }


            observationIds.add(
                observation.observationId
            );


            const target =
                targetsByGraphId.get(
                    observation.graphId
                );


            if (
                target ===
                undefined
            ) {

                errors.push(
                    `Global boundary observation ${observation.observationId} references graph ${observation.graphId} with no exact evaluation target.`
                );

                continue;

            }


            const knownBoundaryIds =
                new Set(
                    target.graph.nodes.flatMap(
                        node =>
                            node.boundaryIds
                    )
                );


            if (
                !knownBoundaryIds.has(
                    observation.boundaryId
                )
            ) {

                errors.push(
                    `Global boundary observation ${observation.observationId} references unknown boundary ${observation.boundaryId} for graph ${observation.graphId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                bindings:
                    [],

                errors:
                    errors.sort()

            };

        }


        const bindings:
            ScientificNProtocolGlobalEvidenceBinding[] =
            [];


        for (
            const target
            of [...input.targets.targets].sort(
                (a, b) =>
                    a.targetId.localeCompare(
                        b.targetId
                    )
            )
        ) {

            /*
             * Exact graph identity is the only binding rule.
             *
             * A runId scopes evidence inside that graph; it never
             * selects or discovers a target.
             */
            const observations =
                input.observations
                    .filter(
                        observation =>
                            observation.graphId ===
                            target.graph.graphId
                    )
                    .map(
                        observation => ({

                            ...observation,

                            evidenceIds:
                                sortedUnique(
                                    observation.evidenceIds
                                )

                        })
                    )
                    .sort(
                        (a, b) => {

                            const runComparison =
                                a.runId.localeCompare(
                                    b.runId
                                );


                            if (
                                runComparison !==
                                0
                            ) {

                                return runComparison;

                            }


                            const boundaryComparison =
                                a.boundaryId.localeCompare(
                                    b.boundaryId
                                );


                            if (
                                boundaryComparison !==
                                0
                            ) {

                                return boundaryComparison;

                            }


                            return a.observationId.localeCompare(
                                b.observationId
                            );

                        }
                    );


            const evaluation =
                this.globalEvaluator
                    .evaluate({

                        graph:
                            target.graph,

                        observations

                    });


            if (
                evaluation.errors.length >
                0
            ) {

                errors.push(
                    ...evaluation.errors.map(
                        error =>
                            `Target ${target.targetId}: ${error}`
                    )
                );

                continue;

            }


            if (
                evaluation.assessment ===
                null
            ) {

                errors.push(
                    `Target ${target.targetId} produced no global assessment.`
                );

                continue;

            }


            if (
                evaluation.assessment.graphId !==
                target.graph.graphId
            ) {

                errors.push(
                    `Target ${target.targetId} global assessment graph identity changed during evaluation.`
                );

                continue;

            }


            bindings.push({

                bindingId:
                    encode([
                        "SCIENTIFIC-N-PROTOCOL-GLOBAL-EVIDENCE-BINDING",
                        target.targetId,
                        target.graph.graphId
                    ]),

                targetId:
                    target.targetId,

                configurationId:
                    target.configurationId,

                envelopeId:
                    target.envelopeId,

                setId:
                    target.setId,

                objectiveId:
                    target.objectiveId,

                graphId:
                    target.graph.graphId,

                observationIds:
                    observations
                        .map(
                            observation =>
                                observation.observationId
                        )
                        .sort(),

                runIds:
                    sortedUnique(
                        observations.map(
                            observation =>
                                observation.runId
                        )
                    ),

                evaluation,

                status:
                    "EVALUATED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                bindings:
                    [],

                errors:
                    errors.sort()

            };

        }


        bindings.sort(
            (a, b) =>
                a.bindingId.localeCompare(
                    b.bindingId
                )
        );


        return {

            bindings,

            errors:
                []

        };

    }

}