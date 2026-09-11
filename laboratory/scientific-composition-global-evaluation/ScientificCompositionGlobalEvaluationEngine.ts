import type {
    ScientificCompositionGraph
} from "../scientific-composition-graph/ScientificCompositionGraph.js";

import type {
    ScientificCompositionGlobalBoundaryObservation
} from "./ScientificCompositionGlobalBoundaryObservation.js";

import type {
    ScientificCompositionGlobalAssessment,
    ScientificCompositionGlobalBoundaryEvaluation,
    ScientificCompositionGlobalEvaluationResult,
    ScientificCompositionGlobalPolarity,
    ScientificCompositionGlobalRunAssessment
} from "./ScientificCompositionGlobalAssessment.js";


export interface ScientificCompositionGlobalEvaluationEngineInput {

    graph:
        ScientificCompositionGraph;

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


export class ScientificCompositionGlobalEvaluationEngine {

    evaluate(
        input:
            ScientificCompositionGlobalEvaluationEngineInput
    ): ScientificCompositionGlobalEvaluationResult {

        const errors:
            string[] = [];


        const boundaryOwners =
            new Map<
                string,
                string
            >();


        for (
            const node
            of input.graph.nodes
        ) {

            for (
                const boundaryId
                of node.boundaryIds
            ) {

                if (
                    boundaryOwners.has(
                        boundaryId
                    )
                ) {

                    errors.push(
                        `Duplicate graph boundary ${boundaryId}.`
                    );

                    continue;

                }


                boundaryOwners.set(
                    boundaryId,
                    node.participantId
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
                observationIds.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate global observation ${observation.observationId}.`
                );

            }


            observationIds.add(
                observation.observationId
            );


            if (
                observation.graphId !==
                input.graph.graphId
            ) {

                errors.push(
                    `Observation ${observation.observationId} belongs to graph ${observation.graphId}, not ${input.graph.graphId}.`
                );

            }


            if (
                !boundaryOwners.has(
                    observation.boundaryId
                )
            ) {

                errors.push(
                    `Observation ${observation.observationId} references unknown graph boundary ${observation.boundaryId}.`
                );

            }


            if (
                observation.runId.trim().length ===
                0
            ) {

                errors.push(
                    `Observation ${observation.observationId} has no run identity.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                assessment:
                    null,
                errors
            };

        }


        const observationsByRun =
            new Map<
                string,
                ScientificCompositionGlobalBoundaryObservation[]
            >();


        for (
            const observation
            of input.observations
        ) {

            const existing =
                observationsByRun.get(
                    observation.runId
                ) ?? [];


            existing.push(
                observation
            );


            observationsByRun.set(
                observation.runId,
                existing
            );

        }


        const allEdgesSupported =
            input.graph.edges.length >
                0 &&
            input.graph.edges.every(
                edge =>
                    edge.compatibilityPolarity ===
                    "SUPPORT"
            );


        const graphFunctionallyComplete =
            input.graph.unresolvedNeedIds.length ===
                0 &&
            input.graph.objectiveCoverage.every(
                coverage =>
                    coverage.status ===
                    "COVERED"
            );


        const graphPrerequisitesSatisfied =
            allEdgesSupported &&
            graphFunctionallyComplete;


        const runAssessments:
            ScientificCompositionGlobalRunAssessment[] = [];


        for (
            const runId
            of [...observationsByRun.keys()].sort()
        ) {

            const runObservations =
                observationsByRun.get(
                    runId
                )!;


            const boundaryEvaluations:
                ScientificCompositionGlobalBoundaryEvaluation[] = [];


            for (
                const [
                    boundaryId,
                    participantId
                ]
                of [...boundaryOwners.entries()].sort(
                    (a, b) =>
                        a[0].localeCompare(
                            b[0]
                        )
                )
            ) {

                const observations =
                    runObservations
                        .filter(
                            observation =>
                                observation.boundaryId ===
                                boundaryId
                        )
                        .sort(
                            (a, b) =>
                                a.observationId.localeCompare(
                                    b.observationId
                                )
                        );


                const hasViolation =
                    observations.some(
                        observation =>
                            observation.verdict ===
                            "VIOLATED"
                    );


                const hasPreservation =
                    observations.some(
                        observation =>
                            observation.verdict ===
                            "PRESERVED"
                    );


                const status =
                    hasViolation
                        ? "VIOLATED" as const
                        : hasPreservation
                            ? "PRESERVED" as const
                            : "UNEVALUATED" as const;


                boundaryEvaluations.push({

                    boundaryId,

                    participantId,

                    status,

                    observationIds:
                        observations.map(
                            observation =>
                                observation.observationId
                        ),

                    evidenceIds:
                        observations
                            .flatMap(
                                observation =>
                                    observation.evidenceIds
                            )
                            .sort()

                });

            }


            const preserved =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "PRESERVED"
                ).length;


            const violated =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "VIOLATED"
                ).length;


            const unevaluated =
                boundaryEvaluations.filter(
                    evaluation =>
                        evaluation.status ===
                        "UNEVALUATED"
                ).length;


            let scientificPolarity:
                ScientificCompositionGlobalPolarity;


            if (
                violated >
                0
            ) {

                scientificPolarity =
                    "CHALLENGE";

            }
            else if (
                boundaryEvaluations.length ===
                    0 ||
                unevaluated >
                    0 ||
                !graphPrerequisitesSatisfied
            ) {

                scientificPolarity =
                    "INCONCLUSIVE";

            }
            else {

                scientificPolarity =
                    "SUPPORT";

            }


            runAssessments.push({

                runId,

                boundaryEvaluations,

                preserved,

                violated,

                unevaluated,

                scientificPolarity

            });

        }


        /*
         * A real violation challenges the composition.
         *
         * Otherwise SUPPORT requires one complete experimental run.
         * Evidence from separate incomplete runs is never merged.
         */
        const challenged =
            runAssessments.some(
                run =>
                    run.scientificPolarity ===
                    "CHALLENGE"
            ) ||
            input.graph.edges.some(
                edge =>
                    edge.compatibilityPolarity ===
                    "CHALLENGE"
            );


        const supportingRun =
            runAssessments.find(
                run =>
                    run.scientificPolarity ===
                    "SUPPORT"
            );


        let scientificPolarity:
            ScientificCompositionGlobalPolarity;


        if (
            challenged
        ) {

            scientificPolarity =
                "CHALLENGE";

        }
        else if (
            supportingRun
        ) {

            scientificPolarity =
                "SUPPORT";

        }
        else {

            scientificPolarity =
                "INCONCLUSIVE";

        }


        const assessment:
            ScientificCompositionGlobalAssessment = {

                assessmentId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-GLOBAL-ASSESSMENT",
                        input.graph.graphId
                    ]),

                graphId:
                    input.graph.graphId,

                runAssessments,

                scientificPolarity,

                supportingRunId:
                    scientificPolarity ===
                        "SUPPORT"
                        ? supportingRun?.runId
                        : undefined

            };


        return {
            assessment,
            errors: []
        };

    }

}
