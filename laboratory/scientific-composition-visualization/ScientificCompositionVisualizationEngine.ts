import type {
    ScientificCompositionEnvelope,
    ScientificCompositionEnvelopeResult
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionCandidateEvaluationGraphEdge,
    ScientificCompositionCandidateEvaluationGraphResult
} from "../scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

import type {
    ScientificCompositionCandidateEvidenceDiagnostic
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGap.js";

import type {
    ScientificCompositionCandidateEvidenceGapResult
} from "../scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapResult.js";

import type {
    ScientificNProtocolCompositionConfiguration,
    ScientificNProtocolCompositionSolverResult
} from "../scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";

import type {
    ScientificNProtocolGlobalEvidenceBinding,
    ScientificNProtocolGlobalEvidenceBindingResult
} from "../scientific-n-protocol-global-evidence-binding/ScientificNProtocolGlobalEvidenceBinding.js";

import type {
    ScientificCompositionHarmonyAssessment,
    ScientificCompositionHarmonyResult
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificCompositionVisualizationConfiguration,
    ScientificCompositionVisualizationEnvelope,
    ScientificCompositionVisualizationNode,
    ScientificCompositionVisualizationRelation,
    ScientificCompositionVisualizationResult
} from "./ScientificCompositionVisualizationModel.js";


export interface ScientificCompositionVisualizationEngineInput {

    envelopes:
        ScientificCompositionEnvelopeResult;

    candidateEvaluationGraph:
        ScientificCompositionCandidateEvaluationGraphResult;

    evidenceGaps:
        ScientificCompositionCandidateEvidenceGapResult;

    solver:
        ScientificNProtocolCompositionSolverResult;

    globalEvidenceBindings:
        ScientificNProtocolGlobalEvidenceBindingResult;

    harmony:
        ScientificCompositionHarmonyResult;

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
    left:
        string[],
    right:
        string[]
): boolean {

    return JSON.stringify(
        sortedUnique(
            left
        )
    ) ===
        JSON.stringify(
            sortedUnique(
                right
            )
        );

}


export class ScientificCompositionVisualizationEngine {

    project(
        input:
            ScientificCompositionVisualizationEngineInput
    ): ScientificCompositionVisualizationResult {

        const errors:
            string[] = [];


        if (
            input.envelopes.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from envelopes containing errors."
            );

        }


        if (
            input.candidateEvaluationGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from a candidate evaluation graph containing errors."
            );

        }


        if (
            input.evidenceGaps.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from evidence gaps containing errors."
            );

        }


        if (
            input.solver.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from solver output containing errors."
            );

        }


        if (
            input.globalEvidenceBindings.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from global evidence bindings containing errors."
            );

        }


        if (
            input.harmony.errors.length >
            0
        ) {

            errors.push(
                "Cannot project visualization from harmony output containing errors."
            );

        }


        const evaluationGraph =
            input.candidateEvaluationGraph.graph;


        if (
            evaluationGraph ===
            null
        ) {

            errors.push(
                "Cannot project visualization from a null candidate evaluation graph."
            );

        }


        if (
            errors.length >
            0 ||
            evaluationGraph ===
            null
        ) {

            return {

                visualizations:
                    [],

                isolatedParticipantIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        const harmonyByEnvelope =
            new Map<
                string,
                ScientificCompositionHarmonyAssessment
            >();

        for (
            const assessment
            of input.harmony.assessments
        ) {

            if (
                harmonyByEnvelope.has(
                    assessment.envelopeId
                )
            ) {

                errors.push(
                    `Duplicate harmony assessment for envelope ${assessment.envelopeId}.`
                );

                continue;

            }


            harmonyByEnvelope.set(
                assessment.envelopeId,
                assessment
            );

        }


        const solutionsByEnvelope =
            new Map<
                string,
                ScientificNProtocolCompositionSolverResult["solutions"][number]
            >();

        const configurationsById =
            new Map<
                string,
                ScientificNProtocolCompositionConfiguration
            >();


        for (
            const solution
            of input.solver.solutions
        ) {

            if (
                solutionsByEnvelope.has(
                    solution.envelopeId
                )
            ) {

                errors.push(
                    `Duplicate solver solution for envelope ${solution.envelopeId}.`
                );

                continue;

            }


            solutionsByEnvelope.set(
                solution.envelopeId,
                solution
            );


            for (
                const configuration
                of [
                    ...solution.fullConfigurations,
                    ...solution.subsetConfigurations
                ]
            ) {

                if (
                    configurationsById.has(
                        configuration.configurationId
                    )
                ) {

                    errors.push(
                        `Duplicate solver configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                configurationsById.set(
                    configuration.configurationId,
                    configuration
                );

            }

        }


        const bindingsByConfiguration =
            new Map<
                string,
                ScientificNProtocolGlobalEvidenceBinding
            >();


        for (
            const binding
            of input.globalEvidenceBindings.bindings
        ) {

            if (
                bindingsByConfiguration.has(
                    binding.configurationId
                )
            ) {

                errors.push(
                    `Duplicate global evidence binding for configuration ${binding.configurationId}.`
                );

                continue;

            }


            if (
                !configurationsById.has(
                    binding.configurationId
                )
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} references unknown solver configuration ${binding.configurationId}.`
                );

                continue;

            }


            bindingsByConfiguration.set(
                binding.configurationId,
                binding
            );

        }


        const diagnosticsByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateEvidenceDiagnostic
            >();


        for (
            const diagnostic
            of input.evidenceGaps.diagnostics
        ) {

            if (
                diagnosticsByCandidate.has(
                    diagnostic.candidateId
                )
            ) {

                errors.push(
                    `Duplicate evidence-gap diagnostic for candidate ${diagnostic.candidateId}.`
                );

                continue;

            }


            diagnosticsByCandidate.set(
                diagnostic.candidateId,
                diagnostic
            );

        }


        const evaluationEdgesByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateEvaluationGraphEdge
            >();


        for (
            const edge
            of evaluationGraph.edges
        ) {

            if (
                evaluationEdgesByCandidate.has(
                    edge.candidateId
                )
            ) {

                errors.push(
                    `Duplicate candidate evaluation edge for candidate ${edge.candidateId}.`
                );

                continue;

            }


            evaluationEdgesByCandidate.set(
                edge.candidateId,
                edge
            );


            const diagnostic =
                diagnosticsByCandidate.get(
                    edge.candidateId
                );


            if (
                diagnostic ===
                undefined
            ) {

                errors.push(
                    `Candidate ${edge.candidateId} has no evidence-gap diagnostic.`
                );

                continue;

            }


            if (
                diagnostic.candidateKind !==
                    edge.kind ||
                diagnostic.sourceParticipantId !==
                    edge.sourceParticipantId ||
                diagnostic.targetParticipantId !==
                    edge.targetParticipantId ||
                diagnostic.compatibilityAssessmentId !==
                    edge.compatibilityAssessmentId ||
                diagnostic.compatibilityPolarity !==
                    edge.compatibilityPolarity
            ) {

                errors.push(
                    `Evidence-gap diagnostic disagrees with candidate evaluation edge ${edge.edgeId}.`
                );

            }


            if (
                !sameStrings(
                    diagnostic.knownBoundaryIds,
                    edge.boundaryIds
                )
            ) {

                errors.push(
                    `Evidence-gap boundaries disagree with candidate evaluation edge ${edge.edgeId}.`
                );

            }


            if (
                !sameStrings(
                    diagnostic.compatibilityEvidenceIds,
                    edge.compatibilityEvidenceIds
                )
            ) {

                errors.push(
                    `Evidence-gap compatibility evidence disagrees with candidate evaluation edge ${edge.edgeId}.`
                );

            }

        }


        for (
            const diagnostic
            of input.evidenceGaps.diagnostics
        ) {

            if (
                !evaluationEdgesByCandidate.has(
                    diagnostic.candidateId
                )
            ) {

                errors.push(
                    `Evidence-gap diagnostic ${diagnostic.diagnosticId} references candidate absent from the evaluation graph.`
                );

            }

        }


        for (
            const envelope
            of input.envelopes.envelopes
        ) {

            if (
                envelope.assemblyStatus !==
                "ASSEMBLED"
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} is not assembled.`
                );

            }


            if (
                envelope.candidateEvaluationGraphId !==
                evaluationGraph.graphId
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} does not reference the supplied candidate evaluation graph.`
                );

            }


            if (
                envelope.objectiveId !==
                evaluationGraph.objectiveId
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} objective disagrees with the candidate evaluation graph.`
                );

            }


            const harmony =
                harmonyByEnvelope.get(
                    envelope.envelopeId
                );


            if (
                harmony ===
                undefined
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} has no harmony assessment.`
                );

            }
            else {

                if (
                    harmony.setId !==
                        envelope.setId ||
                    harmony.objectiveId !==
                        envelope.objectiveId ||
                    !sameStrings(
                        harmony.participantIds,
                        envelope.participantIds
                    )
                ) {

                    errors.push(
                        `Harmony assessment ${harmony.harmonyAssessmentId} disagrees with envelope ${envelope.envelopeId}.`
                    );

                }


                if (
                    harmony.evidenceBasis !==
                    "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"
                ) {

                    errors.push(
                        `Harmony assessment ${harmony.harmonyAssessmentId} does not carry solver-aware global evidence basis.`
                    );

                }

            }


            const solution =
                solutionsByEnvelope.get(
                    envelope.envelopeId
                );


            if (
                solution ===
                undefined
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} has no solver solution.`
                );

            }
            else if (
                solution.setId !==
                    envelope.setId ||
                solution.objectiveId !==
                    envelope.objectiveId ||
                !sameStrings(
                    solution.participantIds,
                    envelope.participantIds
                )
            ) {

                errors.push(
                    `Solver solution ${solution.solutionId} disagrees with envelope ${envelope.envelopeId}.`
                );

            }


            const participantSet =
                new Set(
                    envelope.participantIds
                );


            const envelopeCandidateIds =
                envelope.relations
                    .map(
                        relation =>
                            relation.candidateId
                    );


            if (
                sortedUnique(
                    envelopeCandidateIds
                ).length !==
                envelopeCandidateIds.length
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} contains duplicate candidate relations.`
                );

            }


            for (
                const candidateId
                of envelopeCandidateIds
            ) {

                const edge =
                    evaluationEdgesByCandidate.get(
                        candidateId
                    );


                if (
                    edge ===
                    undefined
                ) {

                    errors.push(
                        `Envelope ${envelope.envelopeId} references candidate ${candidateId} absent from the candidate evaluation graph.`
                    );

                    continue;

                }


                if (
                    !participantSet.has(
                        edge.sourceParticipantId
                    ) ||
                    !participantSet.has(
                        edge.targetParticipantId
                    )
                ) {

                    errors.push(
                        `Envelope ${envelope.envelopeId} candidate ${candidateId} leaves the envelope participant set.`
                    );

                }

            }

        }


        /*
         * READY configurations must already have passed through
         * Hito 20 + Hito 21.
         *
         * BLOCKED configurations must not carry a global binding.
         */
        for (
            const [
                configurationId,
                configuration
            ]
            of configurationsById
        ) {

            const binding =
                bindingsByConfiguration.get(
                    configurationId
                );


            if (
                configuration.readiness ===
                    "READY_FOR_GLOBAL_EVALUATION" &&
                binding ===
                    undefined
            ) {

                errors.push(
                    `Ready solver configuration ${configurationId} has no global evidence binding.`
                );

            }


            if (
                configuration.readiness ===
                    "BLOCKED" &&
                binding !==
                    undefined
            ) {

                errors.push(
                    `Blocked solver configuration ${configurationId} unexpectedly has a global evidence binding.`
                );

            }

        }


        /*
         * Validate Harmony evidence references against Hito 21.
         */
        for (
            const harmony
            of input.harmony.assessments
        ) {

            for (
                const evidence
                of harmony.fullConfigurationEvidence
            ) {

                const binding =
                    bindingsByConfiguration.get(
                        evidence.configurationId
                    );


                if (
                    binding ===
                    undefined
                ) {

                    errors.push(
                        `Harmony full configuration evidence ${evidence.configurationId} has no exact global binding.`
                    );

                    continue;

                }


                if (
                    evidence.bindingId !==
                        binding.bindingId ||
                    evidence.targetId !==
                        binding.targetId ||
                    evidence.graphId !==
                        binding.graphId ||
                    evidence.scientificPolarity !==
                        binding.evaluation.assessment?.scientificPolarity
                ) {

                    errors.push(
                        `Harmony full configuration evidence ${evidence.configurationId} disagrees with its global binding.`
                    );

                }

            }


            for (
                const subset
                of harmony.supportedSubsets
            ) {

                const binding =
                    bindingsByConfiguration.get(
                        subset.configurationId
                    );


                if (
                    binding ===
                    undefined
                ) {

                    errors.push(
                        `Harmony supported subset ${subset.configurationId} has no exact global binding.`
                    );

                    continue;

                }


                if (
                    subset.bindingId !==
                        binding.bindingId ||
                    subset.targetId !==
                        binding.targetId ||
                    subset.graphId !==
                        binding.graphId ||
                    binding.evaluation.assessment?.scientificPolarity !==
                        "SUPPORT"
                ) {

                    errors.push(
                        `Harmony supported subset ${subset.configurationId} disagrees with its global SUPPORT binding.`
                    );

                }

            }

        }


        if (
            errors.length >
            0
        ) {

            return {

                visualizations:
                    [],

                isolatedParticipantIds:
                    [],

                errors:
                    errors.sort()

            };

        }


        const visualizations:
            ScientificCompositionVisualizationEnvelope[] =
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

            const harmony =
                harmonyByEnvelope.get(
                    envelope.envelopeId
                )!;

            const solution =
                solutionsByEnvelope.get(
                    envelope.envelopeId
                )!;


            const nodes:
                ScientificCompositionVisualizationNode[] =
                envelope.participants
                    .map(
                        participant => ({

                            participantId:
                                participant.participantId,

                            profileId:
                                participant.profileId,

                            sourceId:
                                participant.sourceId,

                            ...(
                                participant.sourceRevision !==
                                undefined
                                    ? {
                                        sourceRevision:
                                            participant.sourceRevision
                                    }
                                    : {}
                            ),

                            contributionIds:
                                participant.contributions
                                    .map(
                                        contribution =>
                                            contribution.contributionId
                                    )
                                    .sort(),

                            boundaryIds:
                                participant.boundaries
                                    .map(
                                        boundary =>
                                            boundary.boundaryId
                                    )
                                    .sort(),

                            needIds:
                                participant.needs
                                    .map(
                                        need =>
                                            need.needId
                                    )
                                    .sort()

                        })
                    )
                    .sort(
                        (a, b) =>
                            a.participantId.localeCompare(
                                b.participantId
                            )
                    );


            const relations:
                ScientificCompositionVisualizationRelation[] =
                envelope.relations
                    .map(
                        envelopeRelation => {

                            const edge =
                                evaluationEdgesByCandidate.get(
                                    envelopeRelation.candidateId
                                )!;

                            const diagnostic =
                                diagnosticsByCandidate.get(
                                    edge.candidateId
                                )!;


                            return {

                                candidateId:
                                    edge.candidateId,

                                kind:
                                    edge.kind,

                                sourceParticipantId:
                                    edge.sourceParticipantId,

                                targetParticipantId:
                                    edge.targetParticipantId,

                                compatibilityPolarity:
                                    edge.compatibilityPolarity,

                                boundaryIds:
                                    [...edge.boundaryIds].sort(),

                                discoveryEvidenceIds:
                                    [...edge.discoveryEvidenceIds].sort(),

                                compatibilityEvidenceIds:
                                    [...edge.compatibilityEvidenceIds].sort(),

                                compatibilityObservationIds:
                                    [...diagnostic.compatibilityObservationIds].sort(),

                                gapIds:
                                    diagnostic.gaps
                                        .map(
                                            gap =>
                                                gap.gapId
                                        )
                                        .sort(),

                                gapKinds:
                                    diagnostic.gaps
                                        .map(
                                            gap =>
                                                gap.kind
                                        )
                                        .sort(),

                                evidenceResolution:
                                    diagnostic.resolution,

                                ...(
                                    edge.kind ===
                                    "FUNCTIONAL_COMPLEMENTARITY"
                                        ? {
                                            functionalMatchId:
                                                edge.functionalMatchId,

                                            needId:
                                                edge.needId,

                                            contributionId:
                                                edge.contributionId
                                        }
                                        : {
                                            documentaryCandidateId:
                                                edge.documentaryCandidateId,

                                            documentaryRelation:
                                                edge.relation
                                        }
                                )

                            };

                        }
                    )
                    .sort(
                        (a, b) =>
                            a.candidateId.localeCompare(
                                b.candidateId
                            )
                    );


            const configurations:
                ScientificCompositionVisualizationConfiguration[] =
                [
                    ...solution.fullConfigurations,
                    ...solution.subsetConfigurations
                ]
                    .map(
                        configuration =>
                            this.configurationView(
                                configuration,
                                bindingsByConfiguration.get(
                                    configuration.configurationId
                                )
                            )
                    )
                    .sort(
                        (a, b) =>
                            a.configurationId.localeCompare(
                                b.configurationId
                            )
                    );


            const supportedFullConfigurationIds =
                harmony.fullConfigurationEvidence
                    .filter(
                        evidence =>
                            evidence.scientificPolarity ===
                            "SUPPORT"
                    )
                    .map(
                        evidence =>
                            evidence.configurationId
                    )
                    .sort();


            const challengedFullConfigurationIds =
                harmony.fullConfigurationEvidence
                    .filter(
                        evidence =>
                            evidence.scientificPolarity ===
                            "CHALLENGE"
                    )
                    .map(
                        evidence =>
                            evidence.configurationId
                    )
                    .sort();


            const inconclusiveFullConfigurationIds =
                harmony.fullConfigurationEvidence
                    .filter(
                        evidence =>
                            evidence.scientificPolarity ===
                            "INCONCLUSIVE"
                    )
                    .map(
                        evidence =>
                            evidence.configurationId
                    )
                    .sort();


            visualizations.push({

                visualizationId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-VISUALIZATION",
                        envelope.envelopeId,
                        harmony.harmonyAssessmentId
                    ]),

                envelopeId:
                    envelope.envelopeId,

                setId:
                    envelope.setId,

                objectiveId:
                    envelope.objectiveId,

                harmonyAssessmentId:
                    harmony.harmonyAssessmentId,

                harmonyStatus:
                    harmony.harmonyStatus,

                nodes,

                relations,

                configurations,

                unresolvedNeedIds:
                    [...envelope.unresolvedNeedIds].sort(),

                supportedFullConfigurationIds,

                challengedFullConfigurationIds,

                inconclusiveFullConfigurationIds,

                supportedSubsetConfigurationIds:
                    harmony.supportedSubsets
                        .map(
                            subset =>
                                subset.configurationId
                        )
                        .sort(),

                blockedFullConfigurationIds:
                    [...harmony.blockedFullConfigurationIds].sort(),

                blockedSubsetConfigurationIds:
                    [...harmony.blockedSubsetConfigurationIds].sort(),

                modelBasis:
                    "SCIENTIFIC_STATE_PROJECTION",

                projectionStatus:
                    "PROJECTED"

            });

        }


        return {

            visualizations,

            isolatedParticipantIds:
                [...input.envelopes.isolatedParticipantIds].sort(),

            errors:
                []

        };

    }


    private configurationView(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        binding:
            ScientificNProtocolGlobalEvidenceBinding | undefined
    ): ScientificCompositionVisualizationConfiguration {

        const assessment =
            binding?.evaluation.assessment;


        return {

            configurationId:
                configuration.configurationId,

            kind:
                configuration.kind,

            participantIds:
                [...configuration.participantIds].sort(),

            selectedFunctionalCandidateIds:
                [...configuration.selectedFunctionalCandidateIds].sort(),

            knownBoundaryIds:
                [...configuration.knownBoundaryIds].sort(),

            blockers:
                [...configuration.blockers].sort(),

            readiness:
                configuration.readiness,

            globalStatus:
                assessment?.scientificPolarity ??
                "NOT_EVALUATED",

            ...(
                binding !==
                undefined
                    ? {
                        bindingId:
                            binding.bindingId,

                        targetId:
                            binding.targetId,

                        graphId:
                            binding.graphId
                    }
                    : {}
            ),

            observationIds:
                binding !==
                undefined
                    ? [...binding.observationIds].sort()
                    : [],

            runIds:
                binding !==
                undefined
                    ? [...binding.runIds].sort()
                    : [],

            ...(
                assessment?.supportingRunId !==
                undefined
                    ? {
                        supportingRunId:
                            assessment.supportingRunId
                    }
                    : {}
            )

        };

    }

}