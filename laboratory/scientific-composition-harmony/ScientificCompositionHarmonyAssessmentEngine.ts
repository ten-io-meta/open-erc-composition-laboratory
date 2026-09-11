import type {
    ScientificCompositionEnvelope,
    ScientificCompositionEnvelopeResult
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificCompositionGlobalAssessment
} from "../scientific-composition-global-evaluation/ScientificCompositionGlobalAssessment.js";

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
    ScientificCompositionHarmonyConfigurationEvidence,
    ScientificCompositionHarmonyResult,
    ScientificCompositionHarmonySupportedSubset
} from "./ScientificCompositionHarmonyAssessment.js";


export interface ScientificCompositionHarmonyAssessmentEngineInput {

    envelopes:
        ScientificCompositionEnvelopeResult;

    solver:
        ScientificNProtocolCompositionSolverResult;

    globalEvidenceBindings:
        ScientificNProtocolGlobalEvidenceBindingResult;

}


interface ConfigurationRecord {

    configuration:
        ScientificNProtocolCompositionConfiguration;

    solutionId:
        string;

    envelope:
        ScientificCompositionEnvelope;

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


function configurationGraphId(
    configurationId:
        string
): string {

    return encode([
        "SCIENTIFIC-N-PROTOCOL-CONFIGURATION-GRAPH",
        configurationId
    ]);

}


function globalEvaluationTargetId(
    configurationId:
        string,
    graphId:
        string
): string {

    return encode([
        "SCIENTIFIC-N-PROTOCOL-GLOBAL-EVALUATION-TARGET",
        configurationId,
        graphId
    ]);

}


function globalEvidenceBindingId(
    targetId:
        string,
    graphId:
        string
): string {

    return encode([
        "SCIENTIFIC-N-PROTOCOL-GLOBAL-EVIDENCE-BINDING",
        targetId,
        graphId
    ]);

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


        if (
            input.solver.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess harmony from an N-protocol solver result containing errors."
            );

        }


        if (
            input.globalEvidenceBindings.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess harmony from global evidence bindings containing errors."
            );

        }


        const envelopesById =
            new Map(
                input.envelopes.envelopes.map(
                    envelope => [
                        envelope.envelopeId,
                        envelope
                    ] as const
                )
            );


        if (
            envelopesById.size !==
            input.envelopes.envelopes.length
        ) {

            errors.push(
                "Duplicate composition envelope identity."
            );

        }


        const solutionsByEnvelope =
            new Map<
                string,
                ScientificNProtocolCompositionSolverResult["solutions"][number]
            >();

        const configurationRecords =
            new Map<
                string,
                ConfigurationRecord
            >();


        for (
            const solution
            of input.solver.solutions
        ) {

            const envelope =
                envelopesById.get(
                    solution.envelopeId
                );


            if (
                envelope ===
                undefined
            ) {

                errors.push(
                    `Solver solution ${solution.solutionId} references unknown envelope ${solution.envelopeId}.`
                );

                continue;

            }


            if (
                solutionsByEnvelope.has(
                    solution.envelopeId
                )
            ) {

                errors.push(
                    `Multiple solver solutions reference envelope ${solution.envelopeId}.`
                );

                continue;

            }


            solutionsByEnvelope.set(
                solution.envelopeId,
                solution
            );


            if (
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


            const configurations = [
                ...solution.fullConfigurations,
                ...solution.subsetConfigurations
            ];


            for (
                const configuration
                of configurations
            ) {

                if (
                    configurationRecords.has(
                        configuration.configurationId
                    )
                ) {

                    errors.push(
                        `Duplicate solver configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                const configurationErrors =
                    this.validateConfiguration(
                        configuration,
                        solution,
                        envelope
                    );


                errors.push(
                    ...configurationErrors
                );


                configurationRecords.set(
                    configuration.configurationId,
                    {

                        configuration,

                        solutionId:
                            solution.solutionId,

                        envelope

                    }
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
                !solutionsByEnvelope.has(
                    envelope.envelopeId
                )
            ) {

                errors.push(
                    `Composition envelope ${envelope.envelopeId} has no exact solver solution.`
                );

            }

        }


        const bindingsByConfiguration =
            new Map<
                string,
                ScientificNProtocolGlobalEvidenceBinding
            >();

        const bindingIds =
            new Set<string>();

        const targetIds =
            new Set<string>();


        for (
            const binding
            of input.globalEvidenceBindings.bindings
        ) {

            if (
                bindingIds.has(
                    binding.bindingId
                )
            ) {

                errors.push(
                    `Duplicate global evidence binding ${binding.bindingId}.`
                );

            }


            bindingIds.add(
                binding.bindingId
            );


            if (
                targetIds.has(
                    binding.targetId
                )
            ) {

                errors.push(
                    `Duplicate global evaluation target identity ${binding.targetId} in harmony input.`
                );

            }


            targetIds.add(
                binding.targetId
            );


            const record =
                configurationRecords.get(
                    binding.configurationId
                );


            if (
                record ===
                undefined
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} references unknown solver configuration ${binding.configurationId}.`
                );

                continue;

            }


            if (
                bindingsByConfiguration.has(
                    binding.configurationId
                )
            ) {

                errors.push(
                    `Multiple global evidence bindings reference solver configuration ${binding.configurationId}.`
                );

                continue;

            }


            const expectedGraphId =
                configurationGraphId(
                    binding.configurationId
                );

            const expectedTargetId =
                globalEvaluationTargetId(
                    binding.configurationId,
                    expectedGraphId
                );

            const expectedBindingId =
                globalEvidenceBindingId(
                    expectedTargetId,
                    expectedGraphId
                );


            if (
                binding.graphId !==
                expectedGraphId
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} graph identity is not the exact Hito 20 graph for solver configuration ${binding.configurationId}.`
                );

            }


            if (
                binding.targetId !==
                expectedTargetId
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} target identity is not the exact Hito 20 target for solver configuration ${binding.configurationId}.`
                );

            }


            if (
                binding.bindingId !==
                expectedBindingId
            ) {

                errors.push(
                    `Global evidence binding identity ${binding.bindingId} is not the exact Hito 21 binding identity for solver configuration ${binding.configurationId}.`
                );

            }


            if (
                record.configuration.readiness !==
                "READY_FOR_GLOBAL_EVALUATION"
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} references blocked solver configuration ${binding.configurationId}.`
                );

            }


            if (
                binding.status !==
                "EVALUATED"
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} is not evaluated.`
                );

            }


            if (
                binding.envelopeId !==
                    record.configuration.envelopeId ||
                binding.setId !==
                    record.configuration.setId ||
                binding.objectiveId !==
                    record.configuration.objectiveId
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} disagrees with solver configuration ${binding.configurationId}.`
                );

            }


            if (
                binding.evaluation.errors.length >
                0
            ) {

                errors.push(
                    ...binding.evaluation.errors.map(
                        error =>
                            `Binding ${binding.bindingId}: ${error}`
                    )
                );

                continue;

            }


            const assessment =
                binding.evaluation.assessment;


            if (
                assessment ===
                null
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} has no global assessment.`
                );

                continue;

            }


            if (
                assessment.graphId !==
                    binding.graphId
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} graph identity disagrees with its global assessment.`
                );

            }


            errors.push(
                ...this.validateGlobalAssessment(
                    record.configuration,
                    record.envelope,
                    binding,
                    assessment
                )
            );


            bindingsByConfiguration.set(
                binding.configurationId,
                binding
            );

        }


        /*
         * Every READY configuration must have passed through Hito 20
         * and Hito 21, even when the observation list is empty.
         *
         * Empty evidence is represented by an INCONCLUSIVE binding,
         * not by silently omitting the binding.
         */
        for (
            const [
                configurationId,
                record
            ]
            of configurationRecords
        ) {

            if (
                record.configuration.readiness ===
                    "READY_FOR_GLOBAL_EVALUATION" &&
                !bindingsByConfiguration.has(
                    configurationId
                )
            ) {

                errors.push(
                    `Ready solver configuration ${configurationId} has no exact global evidence binding.`
                );

            }

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

            const solution =
                solutionsByEnvelope.get(
                    envelope.envelopeId
                )!;


            const participantIds =
                sortedUnique(
                    envelope.participantIds
                );


            const fullConfigurationEvidence:
                ScientificCompositionHarmonyConfigurationEvidence[] =
                solution.fullConfigurations
                    .filter(
                        configuration =>
                            configuration.readiness ===
                            "READY_FOR_GLOBAL_EVALUATION"
                    )
                    .map(
                        configuration =>
                            this.configurationEvidence(
                                configuration,
                                bindingsByConfiguration.get(
                                    configuration.configurationId
                                )!
                            )
                    )
                    .sort(
                        (a, b) =>
                            a.configurationId.localeCompare(
                                b.configurationId
                            )
                    );


            const supportedSubsets:
                ScientificCompositionHarmonySupportedSubset[] =
                solution.subsetConfigurations
                    .filter(
                        configuration =>
                            configuration.readiness ===
                            "READY_FOR_GLOBAL_EVALUATION"
                    )
                    .map(
                        configuration => ({

                            configuration,

                            binding:
                                bindingsByConfiguration.get(
                                    configuration.configurationId
                                )!

                        })
                    )
                    .filter(
                        record =>
                            record.binding.evaluation.assessment
                                ?.scientificPolarity ===
                            "SUPPORT"
                    )
                    .map(
                        record => {

                            const assessment =
                                record.binding.evaluation.assessment!;

                            const supportingRunId =
                                assessment.supportingRunId!;


                            return {

                                configurationId:
                                    record.configuration.configurationId,

                                bindingId:
                                    record.binding.bindingId,

                                targetId:
                                    record.binding.targetId,

                                graphId:
                                    record.binding.graphId,

                                globalAssessmentId:
                                    assessment.assessmentId,

                                participantIds:
                                    sortedUnique(
                                        record.configuration.participantIds
                                    ),

                                observationIds:
                                    sortedUnique(
                                        record.binding.observationIds
                                    ),

                                runIds:
                                    sortedUnique(
                                        record.binding.runIds
                                    ),

                                supportingRunId

                            };

                        }
                    )
                    .sort(
                        (a, b) =>
                            a.configurationId.localeCompare(
                                b.configurationId
                            )
                    );


            const fullSupportingConfigurations =
                fullConfigurationEvidence.filter(
                    evidence =>
                        evidence.scientificPolarity ===
                        "SUPPORT"
                );


            /*
             * CHALLENGED is deliberately stronger than:
             *
             * "all evaluated full configurations challenged".
             *
             * Every discovered full solver configuration must itself
             * be globally evaluable and challenged. A blocked full
             * alternative means the full-space conclusion remains open.
             */
            const everyFullConfigurationChallenged =
                solution.fullConfigurations.length >
                    0 &&
                solution.fullConfigurations.every(
                    configuration => {

                        if (
                            configuration.readiness !==
                            "READY_FOR_GLOBAL_EVALUATION"
                        ) {

                            return false;

                        }


                        const binding =
                            bindingsByConfiguration.get(
                                configuration.configurationId
                            );


                        return binding?.evaluation.assessment
                            ?.scientificPolarity ===
                            "CHALLENGE";

                    }
                );


            let harmonyStatus:
                ScientificCompositionHarmonyAssessment["harmonyStatus"];


            /*
             * One demonstrated complete route is enough for FULL,
             * regardless of a challenged alternative route.
             */
            if (
                fullSupportingConfigurations.length >
                0
            ) {

                harmonyStatus =
                    "FULL";

            }
            else if (
                everyFullConfigurationChallenged
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

                blockedFullConfigurationIds:
                    solution.fullConfigurations
                        .filter(
                            configuration =>
                                configuration.readiness ===
                                "BLOCKED"
                        )
                        .map(
                            configuration =>
                                configuration.configurationId
                        )
                        .sort(),

                blockedSubsetConfigurationIds:
                    solution.subsetConfigurations
                        .filter(
                            configuration =>
                                configuration.readiness ===
                                "BLOCKED"
                        )
                        .map(
                            configuration =>
                                configuration.configurationId
                        )
                        .sort(),

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
                    this.boundaryRegionIdsByStatus(
                        envelope,
                        "PRESERVED_IN_CANDIDATE_EVIDENCE"
                    ),

                violatedBoundaryRegionIds:
                    this.boundaryRegionIdsByStatus(
                        envelope,
                        "VIOLATED_IN_CANDIDATE_EVIDENCE"
                    ),

                unevaluatedBoundaryRegionIds:
                    this.boundaryRegionIdsByStatus(
                        envelope,
                        "UNEVALUATED_IN_CANDIDATE_EVIDENCE"
                    ),

                evidenceBasis:
                    "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"

            });

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


    private validateConfiguration(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        solution:
            ScientificNProtocolCompositionSolverResult["solutions"][number],
        envelope:
            ScientificCompositionEnvelope
    ): string[] {

        const errors:
            string[] = [];


        if (
            configuration.envelopeId !==
                envelope.envelopeId ||
            configuration.setId !==
                envelope.setId ||
            configuration.objectiveId !==
                envelope.objectiveId
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} disagrees with envelope provenance.`
            );

        }


        const participantIds =
            sortedUnique(
                configuration.participantIds
            );


        if (
            participantIds.length !==
            configuration.participantIds.length
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} contains duplicate participants.`
            );

        }


        if (
            participantIds.length <
            2
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} contains fewer than two participants.`
            );

        }


        const envelopeParticipantSet =
            new Set(
                envelope.participantIds
            );


        if (
            !isSubset(
                participantIds,
                envelopeParticipantSet
            )
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} references participants outside its envelope.`
            );

        }


        if (
            configuration.kind ===
                "FULL_SET" &&
            !sameStrings(
                participantIds,
                envelope.participantIds
            )
        ) {

            errors.push(
                `FULL_SET solver configuration ${configuration.configurationId} does not equal its envelope participant set.`
            );

        }


        if (
            configuration.kind ===
                "STRICT_SUBSET" &&
            (
                sameStrings(
                    participantIds,
                    envelope.participantIds
                ) ||
                participantIds.length >=
                    envelope.participantIds.length
            )
        ) {

            errors.push(
                `STRICT_SUBSET solver configuration ${configuration.configurationId} is not a strict participant subset.`
            );

        }


        const expectedBoundaryIds =
            sortedUnique(
                envelope.participants
                    .filter(
                        participant =>
                            participantIds.includes(
                                participant.participantId
                            )
                    )
                    .flatMap(
                        participant =>
                            participant.boundaries.map(
                                boundary =>
                                    boundary.boundaryId
                            )
                    )
            );


        if (
            !sameStrings(
                expectedBoundaryIds,
                configuration.knownBoundaryIds
            )
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} known boundaries disagree with its exact participants.`
            );

        }


        if (
            configuration.readiness ===
            "READY_FOR_GLOBAL_EVALUATION"
        ) {

            if (
                configuration.blockers.length >
                    0 ||
                configuration.unresolvedNeedIds.length >
                    0 ||
                configuration.unresolvedObjectiveSubjects.length >
                    0
            ) {

                errors.push(
                    `Ready solver configuration ${configuration.configurationId} still contains unresolved prerequisites.`
                );

            }


            if (
                configuration.objectiveCoverage.some(
                    coverage =>
                        coverage.status !==
                        "COVERED"
                )
            ) {

                errors.push(
                    `Ready solver configuration ${configuration.configurationId} contains unresolved objective coverage.`
                );

            }


            if (
                configuration.relations.length ===
                0
            ) {

                errors.push(
                    `Ready solver configuration ${configuration.configurationId} contains no functional relations.`
                );

            }


            if (
                configuration.globalEvaluationStatus !==
                "UNEVALUATED"
            ) {

                errors.push(
                    `Ready solver configuration ${configuration.configurationId} entered Harmony with a pre-existing global evaluation state.`
                );

            }

        }


        const solutionConfigurationIds = [
            ...solution.fullConfigurations,
            ...solution.subsetConfigurations
        ].map(
            item =>
                item.configurationId
        );


        if (
            !solutionConfigurationIds.includes(
                configuration.configurationId
            )
        ) {

            errors.push(
                `Solver configuration ${configuration.configurationId} is not owned by solution ${solution.solutionId}.`
            );

        }


        return errors;

    }


    private validateGlobalAssessment(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        envelope:
            ScientificCompositionEnvelope,
        binding:
            ScientificNProtocolGlobalEvidenceBinding,
        assessment:
            ScientificCompositionGlobalAssessment
    ): string[] {

        const errors:
            string[] = [];


        const participantIds =
            new Set(
                configuration.participantIds
            );


        const boundaryOwners =
            new Map<
                string,
                string
            >();


        for (
            const participant
            of envelope.participants
        ) {

            if (
                !participantIds.has(
                    participant.participantId
                )
            ) {

                continue;

            }


            for (
                const boundary
                of participant.boundaries
            ) {

                if (
                    boundaryOwners.has(
                        boundary.boundaryId
                    )
                ) {

                    errors.push(
                        `Duplicate boundary ${boundary.boundaryId} in Harmony configuration ${configuration.configurationId}.`
                    );

                    continue;

                }


                boundaryOwners.set(
                    boundary.boundaryId,
                    participant.participantId
                );

            }

        }


        if (
            !sameStrings(
                [...boundaryOwners.keys()],
                configuration.knownBoundaryIds
            )
        ) {

            errors.push(
                `Harmony configuration ${configuration.configurationId} boundary ownership disagrees with solver boundary identity.`
            );

        }


        const assessmentRunIds =
            assessment.runAssessments.map(
                run =>
                    run.runId
            );


        if (
            sortedUnique(
                assessmentRunIds
            ).length !==
            assessmentRunIds.length
        ) {

            errors.push(
                `Global assessment ${assessment.assessmentId} contains duplicate run identities.`
            );

        }


        if (
            !sameStrings(
                assessmentRunIds,
                binding.runIds
            )
        ) {

            errors.push(
                `Global evidence binding ${binding.bindingId} run identities disagree with its global assessment.`
            );

        }


        const assessmentObservationIds:
            string[] = [];


        for (
            const run
            of assessment.runAssessments
        ) {

            const boundaryIds =
                run.boundaryEvaluations.map(
                    boundary =>
                        boundary.boundaryId
                );


            if (
                sortedUnique(
                    boundaryIds
                ).length !==
                boundaryIds.length
            ) {

                errors.push(
                    `Global run ${run.runId} contains duplicate boundary evaluations.`
                );

            }


            if (
                !sameStrings(
                    boundaryIds,
                    configuration.knownBoundaryIds
                )
            ) {

                errors.push(
                    `Global run ${run.runId} does not evaluate the exact solver configuration boundary set.`
                );

            }


            for (
                const boundary
                of run.boundaryEvaluations
            ) {

                if (
                    boundaryOwners.get(
                        boundary.boundaryId
                    ) !==
                    boundary.participantId
                ) {

                    errors.push(
                        `Global run ${run.runId} boundary ${boundary.boundaryId} has incorrect participant ownership.`
                    );

                }


                assessmentObservationIds.push(
                    ...boundary.observationIds
                );

            }


            const preserved =
                run.boundaryEvaluations.filter(
                    boundary =>
                        boundary.status ===
                        "PRESERVED"
                ).length;

            const violated =
                run.boundaryEvaluations.filter(
                    boundary =>
                        boundary.status ===
                        "VIOLATED"
                ).length;

            const unevaluated =
                run.boundaryEvaluations.filter(
                    boundary =>
                        boundary.status ===
                        "UNEVALUATED"
                ).length;


            if (
                preserved !==
                    run.preserved ||
                violated !==
                    run.violated ||
                unevaluated !==
                    run.unevaluated
            ) {

                errors.push(
                    `Global run ${run.runId} boundary statistics are inconsistent.`
                );

            }


            if (
                run.scientificPolarity ===
                    "SUPPORT" &&
                (
                    run.boundaryEvaluations.length ===
                        0 ||
                    run.violated !==
                        0 ||
                    run.unevaluated !==
                        0 ||
                    run.preserved !==
                        run.boundaryEvaluations.length
                )
            ) {

                errors.push(
                    `Global run ${run.runId} claims SUPPORT without complete boundary preservation.`
                );

            }


            if (
                run.scientificPolarity ===
                    "CHALLENGE" &&
                run.violated ===
                    0
            ) {

                errors.push(
                    `Global run ${run.runId} claims CHALLENGE without a violated boundary.`
                );

            }

        }


        if (
            sortedUnique(
                assessmentObservationIds
            ).length !==
            assessmentObservationIds.length
        ) {

            errors.push(
                `Global assessment ${assessment.assessmentId} reuses an observation across boundary evaluations.`
            );

        }


        if (
            !sameStrings(
                assessmentObservationIds,
                binding.observationIds
            )
        ) {

            errors.push(
                `Global evidence binding ${binding.bindingId} observation identities disagree with its global assessment.`
            );

        }


        const supportingRuns =
            assessment.runAssessments.filter(
                run =>
                    run.scientificPolarity ===
                    "SUPPORT"
            );

        const challengedRuns =
            assessment.runAssessments.filter(
                run =>
                    run.scientificPolarity ===
                    "CHALLENGE"
            );


        if (
            assessment.scientificPolarity ===
            "SUPPORT"
        ) {

            if (
                assessment.supportingRunId ===
                undefined
            ) {

                errors.push(
                    `Global assessment ${assessment.assessmentId} claims SUPPORT without supportingRunId.`
                );

            }
            else {

                const supportingRun =
                    assessment.runAssessments.find(
                        run =>
                            run.runId ===
                            assessment.supportingRunId
                    );


                if (
                    supportingRun?.scientificPolarity !==
                    "SUPPORT"
                ) {

                    errors.push(
                        `Global assessment ${assessment.assessmentId} supportingRunId does not identify a SUPPORT run.`
                    );

                }

            }


            if (
                supportingRuns.length ===
                    0 ||
                challengedRuns.length >
                    0
            ) {

                errors.push(
                    `Global assessment ${assessment.assessmentId} has inconsistent SUPPORT run evidence.`
                );

            }

        }
        else {

            if (
                assessment.supportingRunId !==
                undefined
            ) {

                errors.push(
                    `Non-SUPPORT global assessment ${assessment.assessmentId} exposes supportingRunId.`
                );

            }

        }


        if (
            assessment.scientificPolarity ===
                "CHALLENGE" &&
            challengedRuns.length ===
                0
        ) {

            errors.push(
                `Global assessment ${assessment.assessmentId} claims CHALLENGE without a challenged run.`
            );

        }


        if (
            assessment.scientificPolarity ===
                "INCONCLUSIVE" &&
            (
                supportingRuns.length >
                    0 ||
                challengedRuns.length >
                    0
            )
        ) {

            errors.push(
                `Global assessment ${assessment.assessmentId} claims INCONCLUSIVE despite decisive run evidence.`
            );

        }


        return errors;

    }


    private configurationEvidence(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        binding:
            ScientificNProtocolGlobalEvidenceBinding
    ): ScientificCompositionHarmonyConfigurationEvidence {

        const assessment =
            binding.evaluation.assessment!;


        return {

            configurationId:
                configuration.configurationId,

            bindingId:
                binding.bindingId,

            targetId:
                binding.targetId,

            graphId:
                binding.graphId,

            globalAssessmentId:
                assessment.assessmentId,

            participantIds:
                sortedUnique(
                    configuration.participantIds
                ),

            scientificPolarity:
                assessment.scientificPolarity,

            observationIds:
                sortedUnique(
                    binding.observationIds
                ),

            runIds:
                sortedUnique(
                    binding.runIds
                ),

            ...(
                assessment.supportingRunId !==
                undefined
                    ? {
                        supportingRunId:
                            assessment.supportingRunId
                    }
                    : {}
            )

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

        return envelope.relations
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


    private boundaryRegionIdsByStatus(
        envelope:
            ScientificCompositionEnvelope,
        status:
            string
    ): string[] {

        return envelope.boundaryRegions
            .filter(
                region =>
                    String(
                        region.candidateEvidenceStatus
                    ) ===
                    status
            )
            .map(
                region =>
                    region.boundaryId
            )
            .sort();

    }

}