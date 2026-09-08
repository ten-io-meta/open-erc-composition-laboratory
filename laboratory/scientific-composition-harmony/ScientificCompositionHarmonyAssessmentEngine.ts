import type {
    ScientificCompositionEnvelopeResult,
    ScientificCompositionEnvelope
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionGraph,
    ScientificCompositionGraphResult
} from "../scientific-composition-graph/ScientificCompositionGraph.js";

import type {
    ScientificCompositionGlobalAssessment,
    ScientificCompositionGlobalEvaluationResult
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";

import type {
    ScientificCompositionHarmonyAssessment,
    ScientificCompositionHarmonyConfigurationEvidence,
    ScientificCompositionHarmonyResult,
    ScientificCompositionHarmonySupportedSubset
} from "./ScientificCompositionHarmonyAssessment.js";


export interface ScientificCompositionHarmonyAssessmentEngineInput {

    envelopes:
        ScientificCompositionEnvelopeResult;

    /*
     * These may later be configuration/subset graphs produced by
     * the N-protocol solver.
     */
    compositionGraphs:
        ScientificCompositionGraphResult[];

    globalEvaluations:
        ScientificCompositionGlobalEvaluationResult[];

}


interface GlobalConfigurationRecord {

    graph:
        ScientificCompositionGraph;

    assessment:
        ScientificCompositionGlobalAssessment;

    participantIds:
        string[];

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


function sameStrings(
    a:
        string[],
    b:
        string[]
): boolean {

    return JSON.stringify(
        sortedUnique(
            a
        )
    ) ===
        JSON.stringify(
            sortedUnique(
                b
            )
        );

}


function isSubset(
    candidate:
        string[],
    universe:
        Set<string>
): boolean {

    return candidate.every(
        participantId =>
            universe.has(
                participantId
            )
    );

}


export class ScientificCompositionHarmonyAssessmentEngine {

    assess(
        input:
            ScientificCompositionHarmonyAssessmentEngineInput
    ): ScientificCompositionHarmonyResult {

        const errors:
            string[] = [];


        if (
            input.envelopes.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess harmony from composition envelopes containing errors."
            );

        }


        const graphsById =
            new Map<
                string,
                ScientificCompositionGraph
            >();


        for (
            const result
            of input.compositionGraphs
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    "Cannot assess harmony from composition graphs containing errors."
                );

                continue;

            }


            if (
                result.graph ===
                null
            ) {

                errors.push(
                    "Cannot assess harmony from a null composition graph."
                );

                continue;

            }


            if (
                graphsById.has(
                    result.graph.graphId
                )
            ) {

                errors.push(
                    `Duplicate composition graph ${result.graph.graphId}.`
                );

                continue;

            }


            const participantIds =
                result.graph.nodes.map(
                    node =>
                        node.participantId
                );


            if (
                sortedUnique(
                    participantIds
                ).length !==
                participantIds.length
            ) {

                errors.push(
                    `Composition graph ${result.graph.graphId} contains duplicate participants.`
                );

            }


            graphsById.set(
                result.graph.graphId,
                result.graph
            );

        }


        const assessmentsByGraph =
            new Map<
                string,
                ScientificCompositionGlobalAssessment
            >();


        for (
            const result
            of input.globalEvaluations
        ) {

            if (
                result.errors.length >
                0
            ) {

                errors.push(
                    "Cannot assess harmony from global evaluations containing errors."
                );

                continue;

            }


            if (
                result.assessment ===
                null
            ) {

                errors.push(
                    "Cannot assess harmony from a null global assessment."
                );

                continue;

            }


            const assessment =
                result.assessment;


            if (
                assessmentsByGraph.has(
                    assessment.graphId
                )
            ) {

                errors.push(
                    `Duplicate global assessment for graph ${assessment.graphId}.`
                );

                continue;

            }


            const graph =
                graphsById.get(
                    assessment.graphId
                );


            if (
                graph ===
                undefined
            ) {

                errors.push(
                    `Global assessment ${assessment.assessmentId} references unknown graph ${assessment.graphId}.`
                );

                continue;

            }


            if (
                assessment.scientificPolarity ===
                "SUPPORT"
            ) {

                if (
                    assessment.supportingRunId ===
                    undefined
                ) {

                    errors.push(
                        `Supporting global assessment ${assessment.assessmentId} has no supporting run.`
                    );

                    continue;

                }


                const supportingRun =
                    assessment.runAssessments.find(
                        run =>
                            run.runId ===
                            assessment.supportingRunId
                    );


                if (
                    supportingRun ===
                    undefined ||
                    supportingRun.scientificPolarity !==
                    "SUPPORT"
                ) {

                    errors.push(
                        `Supporting global assessment ${assessment.assessmentId} has no matching SUPPORT run.`
                    );

                    continue;

                }


                /*
                 * Revalidate only the integrity of the upstream
                 * SUPPORT result. This does not recompute harmony.
                 */
                if (
                    graph.edges.length ===
                        0 ||
                    !graph.edges.every(
                        edge =>
                            edge.compatibilityPolarity ===
                            "SUPPORT"
                    ) ||
                    graph.unresolvedNeedIds.length >
                        0 ||
                    !graph.objectiveCoverage.every(
                        coverage =>
                            coverage.status ===
                            "COVERED"
                    )
                ) {

                    errors.push(
                        `Global SUPPORT assessment ${assessment.assessmentId} contradicts graph prerequisites.`
                    );

                    continue;

                }


                const requiredBoundaryIds =
                    sortedUnique(
                        graph.nodes.flatMap(
                            node =>
                                node.boundaryIds
                        )
                    );


                const observedBoundaryIds =
                    sortedUnique(
                        supportingRun
                            .boundaryEvaluations
                            .map(
                                evaluation =>
                                    evaluation.boundaryId
                            )
                    );


                if (
                    requiredBoundaryIds.length ===
                        0 ||
                    !sameStrings(
                        requiredBoundaryIds,
                        observedBoundaryIds
                    ) ||
                    !supportingRun
                        .boundaryEvaluations
                        .every(
                            evaluation =>
                                evaluation.status ===
                                "PRESERVED"
                        ) ||
                    supportingRun.violated !==
                        0 ||
                    supportingRun.unevaluated !==
                        0 ||
                    supportingRun.preserved !==
                        requiredBoundaryIds.length
                ) {

                    errors.push(
                        `Global SUPPORT assessment ${assessment.assessmentId} does not preserve every graph boundary in one run.`
                    );

                    continue;

                }

            }
            else if (
                assessment.supportingRunId !==
                undefined
            ) {

                errors.push(
                    `Non-supporting global assessment ${assessment.assessmentId} incorrectly exposes a supporting run.`
                );

                continue;

            }


            assessmentsByGraph.set(
                assessment.graphId,
                assessment
            );

        }


        if (
            errors.length >
            0
        ) {

            return {

                assessments:
                    [],

                errors:
                    errors.sort()

            };

        }


        const globalConfigurations:
            GlobalConfigurationRecord[] =
            [];


        for (
            const [
                graphId,
                assessment
            ]
            of assessmentsByGraph
        ) {

            const graph =
                graphsById.get(
                    graphId
                )!;


            globalConfigurations.push({

                graph,

                assessment,

                participantIds:
                    sortedUnique(
                        graph.nodes.map(
                            node =>
                                node.participantId
                        )
                    )

            });

        }


        globalConfigurations.sort(
            (a, b) =>
                a.graph.graphId.localeCompare(
                    b.graph.graphId
                )
        );


        const assessments:
            ScientificCompositionHarmonyAssessment[] =
            [];


        for (
            const envelope
            of [...input.envelopes.envelopes].sort(
                (a, b) =>
                    a.envelopeId.localeCompare(
                        b.envelopeId
                    )
            )
        ) {

            if (
                envelope.assemblyStatus !==
                "ASSEMBLED"
            ) {

                errors.push(
                    `Envelope ${envelope.envelopeId} is not assembled.`
                );

                continue;

            }


            const participantIds =
                sortedUnique(
                    envelope.participantIds
                );


            if (
                participantIds.length !==
                envelope.participantIds.length
            ) {

                errors.push(
                    `Envelope ${envelope.envelopeId} contains duplicate participants.`
                );

                continue;

            }


            const participantIdSet =
                new Set(
                    participantIds
                );


            const relevantConfigurations =
                globalConfigurations.filter(
                    configuration =>
                        configuration.graph.objectiveId ===
                            envelope.objectiveId &&
                        configuration.participantIds.length >=
                            2 &&
                        isSubset(
                            configuration.participantIds,
                            participantIdSet
                        )
                );


            const exactFullConfigurations =
                relevantConfigurations.filter(
                    configuration =>
                        sameStrings(
                            configuration.participantIds,
                            participantIds
                        )
                );


            const properSubsetConfigurations =
                relevantConfigurations.filter(
                    configuration =>
                        configuration.participantIds.length <
                        participantIds.length
                );


            const fullConfigurationEvidence:
                ScientificCompositionHarmonyConfigurationEvidence[] =
                exactFullConfigurations
                    .map(
                        configuration => ({

                            graphId:
                                configuration.graph.graphId,

                            globalAssessmentId:
                                configuration.assessment.assessmentId,

                            participantIds:
                                [...configuration.participantIds],

                            scientificPolarity:
                                configuration.assessment.scientificPolarity,

                            ...(
                                configuration.assessment.supportingRunId !==
                                    undefined
                                    ? {
                                        supportingRunId:
                                            configuration.assessment.supportingRunId
                                    }
                                    : {}
                            )

                        })
                    )
                    .sort(
                        (a, b) =>
                            a.graphId.localeCompare(
                                b.graphId
                            )
                    );


            const fullSupportingConfigurations =
                exactFullConfigurations.filter(
                    configuration =>
                        configuration.assessment.scientificPolarity ===
                        "SUPPORT"
                );


            const supportedSubsets:
                ScientificCompositionHarmonySupportedSubset[] =
                properSubsetConfigurations
                    .filter(
                        configuration =>
                            configuration.assessment.scientificPolarity ===
                            "SUPPORT" &&
                            configuration.assessment.supportingRunId !==
                            undefined
                    )
                    .map(
                        configuration => ({

                            graphId:
                                configuration.graph.graphId,

                            globalAssessmentId:
                                configuration.assessment.assessmentId,

                            participantIds:
                                [...configuration.participantIds],

                            supportingRunId:
                                configuration.assessment.supportingRunId!

                        })
                    )
                    .sort(
                        (a, b) => {

                            if (
                                a.participantIds.length !==
                                b.participantIds.length
                            ) {

                                return (
                                    b.participantIds.length -
                                    a.participantIds.length
                                );

                            }


                            return a.graphId.localeCompare(
                                b.graphId
                            );

                        }
                    );


            const everyExactFullConfigurationChallenged =
                exactFullConfigurations.length >
                    0 &&
                exactFullConfigurations.every(
                    configuration =>
                        configuration.assessment.scientificPolarity ===
                        "CHALLENGE"
                );


            let harmonyStatus:
                ScientificCompositionHarmonyAssessment["harmonyStatus"];


            /*
             * A supported complete configuration wins over a
             * challenged alternative route.
             */
            if (
                fullSupportingConfigurations.length >
                0
            ) {

                harmonyStatus =
                    "FULL";

            }
            else if (
                everyExactFullConfigurationChallenged
            ) {

                harmonyStatus =
                    "CHALLENGED";

            }
            else if (
                supportedSubsets.length >
                0
            ) {

                harmonyStatus =
                    "PARTIAL";

            }
            else {

                harmonyStatus =
                    "INCONCLUSIVE";

            }


            assessments.push({

                harmonyAssessmentId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-HARMONY-ASSESSMENT",
                        envelope.envelopeId
                    ]),

                envelopeId:
                    envelope.envelopeId,

                setId:
                    envelope.setId,

                objectiveId:
                    envelope.objectiveId,

                participantIds,

                harmonyStatus,

                fullConfigurationEvidence,

                supportedSubsets,

                supportedCandidateIds:
                    this.relationIdsByPolarity(
                        envelope,
                        "SUPPORT"
                    ),

                challengedCandidateIds:
                    this.relationIdsByPolarity(
                        envelope,
                        "CHALLENGE"
                    ),

                inconclusiveCandidateIds:
                    this.relationIdsByPolarity(
                        envelope,
                        "INCONCLUSIVE"
                    ),

                preservedBoundaryRegionIds:
                    envelope
                        .boundaryRegions
                        .filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "PRESERVED_IN_CANDIDATE_EVIDENCE"
                        )
                        .map(
                            region =>
                                region.boundaryId
                        )
                        .sort(),

                violatedBoundaryRegionIds:
                    envelope
                        .boundaryRegions
                        .filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "VIOLATED_IN_CANDIDATE_EVIDENCE"
                        )
                        .map(
                            region =>
                                region.boundaryId
                        )
                        .sort(),

                unevaluatedBoundaryRegionIds:
                    envelope
                        .boundaryRegions
                        .filter(
                            region =>
                                region.candidateEvidenceStatus ===
                                "UNEVALUATED_IN_CANDIDATE_EVIDENCE"
                        )
                        .map(
                            region =>
                                region.boundaryId
                        )
                        .sort(),

                evidenceBasis:
                    "EXACT_GLOBAL_CONFIGURATION_EVIDENCE"

            });

        }


        if (
            errors.length >
            0
        ) {

            return {

                assessments:
                    [],

                errors:
                    errors.sort()

            };

        }


        assessments.sort(
            (a, b) =>
                a.harmonyAssessmentId.localeCompare(
                    b.harmonyAssessmentId
                )
        );


        return {

            assessments,

            errors:
                []

        };

    }


    private relationIdsByPolarity(
        envelope:
            ScientificCompositionEnvelope,
        polarity:
            "SUPPORT" |
            "CHALLENGE" |
            "INCONCLUSIVE"
    ): string[] {

        return envelope
            .relations
            .filter(
                relation =>
                    relation.compatibilityPolarity ===
                    polarity
            )
            .map(
                relation =>
                    relation.candidateId
            )
            .sort();

    }

}