import type {
    ScientificCompositionEnvelopeResult
} from "../scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificNProtocolCompositionConfiguration,
    ScientificNProtocolCompositionSolverRelation,
    ScientificNProtocolCompositionSolverResult
} from "../scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";

import type {
    ScientificCompositionHarmonyAssessment,
    ScientificCompositionHarmonyResult
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificCompositionValueAssessment,
    ScientificCompositionValueAssessmentResult
} from "./ScientificCompositionValueAssessment.js";

import type {
    ScientificCompositionValueFinding
} from "./ScientificCompositionValueFinding.js";

import {
    SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
} from "./ScientificCompositionValueRule.js";


export interface ScientificCompositionValueAssessmentEngineInput {

    envelopes:
        ScientificCompositionEnvelopeResult;

    solver:
        ScientificNProtocolCompositionSolverResult;

    harmony:
        ScientificCompositionHarmonyResult;

}


interface SupportedConfigurationContext {

    configuration:
        ScientificNProtocolCompositionConfiguration;

    supportBasis:
        | "SUPPORTED_FULL_CONFIGURATION"
        | "SUPPORTED_STRICT_SUBSET";

    observationIds:
        string[];

    runIds:
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


function relationCandidateIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.map(
            relation =>
                relation.candidateId
        )
    );

}


function relationNeedIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.map(
            relation =>
                relation.needId
        )
    );

}


function relationContributionIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.map(
            relation =>
                relation.contributionId
        )
    );

}


function relationBoundaryIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.flatMap(
            relation =>
                relation.boundaryIds
        )
    );

}


function relationDiscoveryEvidenceIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.flatMap(
            relation =>
                relation.discoveryEvidenceIds
        )
    );

}


function relationCompatibilityEvidenceIds(
    relations:
        ScientificNProtocolCompositionSolverRelation[]
): string[] {

    return sortedUnique(
        relations.flatMap(
            relation =>
                relation.compatibilityEvidenceIds
        )
    );

}


export class ScientificCompositionValueAssessmentEngine {

    assess(
        input:
            ScientificCompositionValueAssessmentEngineInput
    ): ScientificCompositionValueAssessmentResult {

        const errors:
            string[] = [];


        if (
            input.envelopes.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess composition value from composition envelopes containing errors."
            );

        }


        if (
            input.solver.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess composition value from an N-protocol solver result containing errors."
            );

        }


        if (
            input.harmony.errors.length >
            0
        ) {

            errors.push(
                "Cannot assess composition value from Harmony containing errors."
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
                "Duplicate composition envelope identity in value assessment input."
            );

        }


        const solutionsByEnvelopeId =
            new Map(
                input.solver.solutions.map(
                    solution => [
                        solution.envelopeId,
                        solution
                    ] as const
                )
            );


        if (
            solutionsByEnvelopeId.size !==
            input.solver.solutions.length
        ) {

            errors.push(
                "Multiple N-protocol solver solutions reference the same composition envelope."
            );

        }


        const harmonyIds =
            input.harmony.assessments.map(
                assessment =>
                    assessment.harmonyAssessmentId
            );


        if (
            sortedUnique(
                harmonyIds
            ).length !==
            harmonyIds.length
        ) {

            errors.push(
                "Duplicate Harmony assessment identity in value assessment input."
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
                    sortedUnique(
                        errors
                    )

            };

        }


        const assessments:
            ScientificCompositionValueAssessment[] =
            [];


        for (
            const harmonyAssessment
            of [...input.harmony.assessments].sort(
                (a, b) =>
                    a.harmonyAssessmentId.localeCompare(
                        b.harmonyAssessmentId
                    )
            )
        ) {

            const envelope =
                envelopesById.get(
                    harmonyAssessment.envelopeId
                );


            if (
                envelope ===
                undefined
            ) {

                errors.push(
                    `Harmony assessment ${harmonyAssessment.harmonyAssessmentId} references unknown envelope ${harmonyAssessment.envelopeId}.`
                );

                continue;

            }


            const solution =
                solutionsByEnvelopeId.get(
                    harmonyAssessment.envelopeId
                );


            if (
                solution ===
                undefined
            ) {

                errors.push(
                    `Harmony assessment ${harmonyAssessment.harmonyAssessmentId} has no exact N-protocol solver solution.`
                );

                continue;

            }


            if (
                solution.setId !==
                    harmonyAssessment.setId ||
                solution.objectiveId !==
                    harmonyAssessment.objectiveId ||
                !sameStrings(
                    solution.participantIds,
                    harmonyAssessment.participantIds
                )
            ) {

                errors.push(
                    `Harmony assessment ${harmonyAssessment.harmonyAssessmentId} disagrees with its exact solver solution.`
                );

                continue;

            }


            if (
                envelope.setId !==
                    harmonyAssessment.setId ||
                envelope.objectiveId !==
                    harmonyAssessment.objectiveId ||
                !sameStrings(
                    envelope.participantIds,
                    harmonyAssessment.participantIds
                )
            ) {

                errors.push(
                    `Harmony assessment ${harmonyAssessment.harmonyAssessmentId} disagrees with its exact composition envelope.`
                );

                continue;

            }


            const supportedFullConfigurations =
                this.supportedFullConfigurations(
                    harmonyAssessment,
                    solution,
                    errors
                );


            const supportedSubsetConfigurations =
                this.supportedSubsetConfigurations(
                    harmonyAssessment,
                    solution,
                    errors
                );


            let activeConfigurations:
                SupportedConfigurationContext[] =
                [];

            let valueEvaluationStatus:
                ScientificCompositionValueAssessment["valueEvaluationStatus"];


            if (
                harmonyAssessment.harmonyStatus ===
                "FULL"
            ) {

                if (
                    supportedFullConfigurations.length ===
                    0
                ) {

                    errors.push(
                        `FULL Harmony assessment ${harmonyAssessment.harmonyAssessmentId} exposes no globally supported FULL_SET configuration.`
                    );

                }

                activeConfigurations =
                    supportedFullConfigurations;

                valueEvaluationStatus =
                    "ASSESSED";

            }
            else if (
                harmonyAssessment.harmonyStatus ===
                "PARTIAL"
            ) {

                if (
                    supportedSubsetConfigurations.length ===
                    0
                ) {

                    errors.push(
                        `PARTIAL Harmony assessment ${harmonyAssessment.harmonyAssessmentId} exposes no globally supported STRICT_SUBSET configuration.`
                    );

                }

                activeConfigurations =
                    supportedSubsetConfigurations;

                valueEvaluationStatus =
                    "PARTIALLY_ASSESSED";

            }
            else {

                /*
                 * INCONCLUSIVE and CHALLENGED do not authorize
                 * positive composition-value derivation.
                 */
                activeConfigurations =
                    [];

                valueEvaluationStatus =
                    "NOT_ESTABLISHED";

            }


            const findings:
                ScientificCompositionValueFinding[] =
                [];


            for (
                const context
                of activeConfigurations
            ) {

                findings.push(
                    ...this.functionalComplementFindings(
                        context
                    )
                );


                const completeObjectiveCoverage =
                    this.completeObjectiveCoverageFinding(
                        context
                    );


                if (
                    completeObjectiveCoverage !==
                    null
                ) {

                    findings.push(
                        completeObjectiveCoverage
                    );

                }


                const distributedObjectiveCoverage =
                    this.distributedObjectiveCoverageFinding(
                        context
                    );


                if (
                    distributedObjectiveCoverage !==
                    null
                ) {

                    findings.push(
                        distributedObjectiveCoverage
                    );

                }

            }


            if (
                harmonyAssessment.harmonyStatus ===
                "PARTIAL"
            ) {

                findings.push(
                    this.strictSubsetTradeoffFinding(
                        harmonyAssessment,
                        supportedSubsetConfigurations
                    )
                );

            }


            const findingsById =
                new Map<
                    string,
                    ScientificCompositionValueFinding
                >();


            for (
                const finding
                of findings
            ) {

                findingsById.set(
                    finding.findingId,
                    finding
                );

            }


            assessments.push({

                assessmentId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-VALUE-ASSESSMENT",
                        harmonyAssessment.harmonyAssessmentId
                    ]),

                envelopeId:
                    envelope.envelopeId,

                solutionId:
                    solution.solutionId,

                harmonyAssessmentId:
                    harmonyAssessment.harmonyAssessmentId,

                objectiveId:
                    harmonyAssessment.objectiveId,

                participantIds:
                    sortedUnique(
                        harmonyAssessment.participantIds
                    ),

                harmonyStatus:
                    harmonyAssessment.harmonyStatus,

                findings:
                    [...findingsById.values()]
                        .sort(
                            (a, b) =>
                                a.findingId.localeCompare(
                                    b.findingId
                                )
                        ),

                valueEvaluationStatus,

                decisionAuthority:
                    "UPSTREAM_HARMONY_AND_SOLVER_STATE_ONLY"

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
                    sortedUnique(
                        errors
                    )

            };

        }


        assessments.sort(
            (a, b) =>
                a.assessmentId.localeCompare(
                    b.assessmentId
                )
        );


        return {

            assessments,

            errors:
                []

        };

    }


    private supportedFullConfigurations(
        harmony:
            ScientificCompositionHarmonyAssessment,
        solution:
            ScientificNProtocolCompositionSolverResult["solutions"][number],
        errors:
            string[]
    ): SupportedConfigurationContext[] {

        const contexts:
            SupportedConfigurationContext[] =
            [];


        for (
            const evidence
            of harmony.fullConfigurationEvidence
        ) {

            if (
                evidence.scientificPolarity !==
                "SUPPORT"
            ) {

                continue;

            }


            const configuration =
                solution.fullConfigurations.find(
                    item =>
                        item.configurationId ===
                        evidence.configurationId
                );


            if (
                configuration ===
                undefined
            ) {

                errors.push(
                    `Harmony FULL support references unknown FULL_SET configuration ${evidence.configurationId}.`
                );

                continue;

            }


            if (
                configuration.kind !==
                    "FULL_SET" ||
                configuration.readiness !==
                    "READY_FOR_GLOBAL_EVALUATION"
            ) {

                errors.push(
                    `Harmony FULL support references invalid FULL_SET configuration ${configuration.configurationId}.`
                );

                continue;

            }


            if (
                !sameStrings(
                    configuration.participantIds,
                    evidence.participantIds
                )
            ) {

                errors.push(
                    `Harmony evidence for ${configuration.configurationId} disagrees with solver participant identity.`
                );

                continue;

            }


            contexts.push({

                configuration,

                supportBasis:
                    "SUPPORTED_FULL_CONFIGURATION",

                observationIds:
                    sortedUnique(
                        evidence.observationIds
                    ),

                runIds:
                    sortedUnique(
                        evidence.runIds
                    )

            });

        }


        return contexts.sort(
            (a, b) =>
                a.configuration.configurationId.localeCompare(
                    b.configuration.configurationId
                )
        );

    }


    private supportedSubsetConfigurations(
        harmony:
            ScientificCompositionHarmonyAssessment,
        solution:
            ScientificNProtocolCompositionSolverResult["solutions"][number],
        errors:
            string[]
    ): SupportedConfigurationContext[] {

        const contexts:
            SupportedConfigurationContext[] =
            [];


        for (
            const evidence
            of harmony.supportedSubsets
        ) {

            const configuration =
                solution.subsetConfigurations.find(
                    item =>
                        item.configurationId ===
                        evidence.configurationId
                );


            if (
                configuration ===
                undefined
            ) {

                errors.push(
                    `Harmony subset support references unknown STRICT_SUBSET configuration ${evidence.configurationId}.`
                );

                continue;

            }


            if (
                configuration.kind !==
                    "STRICT_SUBSET" ||
                configuration.readiness !==
                    "READY_FOR_GLOBAL_EVALUATION"
            ) {

                errors.push(
                    `Harmony subset support references invalid STRICT_SUBSET configuration ${configuration.configurationId}.`
                );

                continue;

            }


            if (
                !sameStrings(
                    configuration.participantIds,
                    evidence.participantIds
                )
            ) {

                errors.push(
                    `Harmony subset evidence for ${configuration.configurationId} disagrees with solver participant identity.`
                );

                continue;

            }


            contexts.push({

                configuration,

                supportBasis:
                    "SUPPORTED_STRICT_SUBSET",

                observationIds:
                    sortedUnique(
                        evidence.observationIds
                    ),

                runIds:
                    sortedUnique(
                        evidence.runIds
                    )

            });

        }


        return contexts.sort(
            (a, b) =>
                a.configuration.configurationId.localeCompare(
                    b.configuration.configurationId
                )
        );

    }


    private functionalComplementFindings(
        context:
            SupportedConfigurationContext
    ): ScientificCompositionValueFinding[] {

        return context.configuration.relations
            .map(
                relation => ({

                    findingId:
                        encode([
                            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                                .CROSS_PROTOCOL_FUNCTIONAL_COMPLEMENT,
                            context.configuration.configurationId,
                            relation.candidateId,
                            relation.needId,
                            relation.contributionId
                        ]),

                    ruleId:
                        SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                            .CROSS_PROTOCOL_FUNCTIONAL_COMPLEMENT,

                    kind:
                        "FUNCTIONAL_COMPLEMENT" as const,

                    title:
                        "Cross-protocol functional complement",

                    statement:
                        "A need owned by one participant is fulfilled by a supported contribution owned by another participant inside an exact globally supported configuration.",

                    basis:
                        "SUPPORTED_FUNCTIONAL_RELATION" as const,

                    participantIds:
                        sortedUnique([
                            relation.sourceParticipantId,
                            relation.targetParticipantId
                        ]),

                    configurationIds:
                        [
                            context.configuration.configurationId
                        ],

                    candidateIds:
                        [
                            relation.candidateId
                        ],

                    needIds:
                        [
                            relation.needId
                        ],

                    contributionIds:
                        [
                            relation.contributionId
                        ],

                    boundaryIds:
                        sortedUnique(
                            relation.boundaryIds
                        ),

                    discoveryEvidenceIds:
                        sortedUnique(
                            relation.discoveryEvidenceIds
                        ),

                    compatibilityEvidenceIds:
                        sortedUnique(
                            relation.compatibilityEvidenceIds
                        ),

                    observationIds:
                        context.observationIds,

                    runIds:
                        context.runIds

                })
            )
            .sort(
                (a, b) =>
                    a.findingId.localeCompare(
                        b.findingId
                    )
            );

    }


    private completeObjectiveCoverageFinding(
        context:
            SupportedConfigurationContext
    ): ScientificCompositionValueFinding | null {

        const configuration =
            context.configuration;


        if (
            configuration.kind !==
                "FULL_SET" ||
            configuration.objectiveCoverage.length ===
                0 ||
            configuration.unresolvedNeedIds.length !==
                0 ||
            configuration.unresolvedObjectiveSubjects.length !==
                0 ||
            configuration.objectiveCoverage.some(
                coverage =>
                    coverage.status !==
                    "COVERED"
            )
        ) {

            return null;

        }


        const relations =
            configuration.relations;


        return {

            findingId:
                encode([
                    SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                        .COMPLETE_OBJECTIVE_COVERAGE,
                    configuration.configurationId
                ]),

            ruleId:
                SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                    .COMPLETE_OBJECTIVE_COVERAGE,

            kind:
                "ARCHITECTURAL_PROPERTY",

            title:
                "Complete objective coverage",

            statement:
                "Every declared objective subject in the exact supported full-set configuration is covered, with no unresolved needs or objective subjects.",

            basis:
                "SUPPORTED_FULL_CONFIGURATION",

            participantIds:
                sortedUnique(
                    configuration.participantIds
                ),

            configurationIds:
                [
                    configuration.configurationId
                ],

            candidateIds:
                relationCandidateIds(
                    relations
                ),

            needIds:
                relationNeedIds(
                    relations
                ),

            contributionIds:
                sortedUnique([
                    ...relationContributionIds(
                        relations
                    ),
                    ...configuration.objectiveCoverage.flatMap(
                        coverage =>
                            coverage.contributionIds
                    )
                ]),

            boundaryIds:
                relationBoundaryIds(
                    relations
                ),

            discoveryEvidenceIds:
                relationDiscoveryEvidenceIds(
                    relations
                ),

            compatibilityEvidenceIds:
                relationCompatibilityEvidenceIds(
                    relations
                ),

            observationIds:
                context.observationIds,

            runIds:
                context.runIds

        };

    }


    private distributedObjectiveCoverageFinding(
        context:
            SupportedConfigurationContext
    ): ScientificCompositionValueFinding | null {

        const configuration =
            context.configuration;


        if (
            configuration.objectiveCoverage.length ===
                0 ||
            configuration.unresolvedObjectiveSubjects.length !==
                0 ||
            configuration.objectiveCoverage.some(
                coverage =>
                    coverage.status !==
                    "COVERED"
            )
        ) {

            return null;

        }


        const providerParticipantIds =
            sortedUnique(
                configuration.objectiveCoverage.flatMap(
                    coverage =>
                        coverage.providerParticipantIds
                )
            );


        if (
            providerParticipantIds.length <
            2
        ) {

            return null;

        }


        const relations =
            configuration.relations;


        return {

            findingId:
                encode([
                    SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                        .DISTRIBUTED_OBJECTIVE_COVERAGE,
                    configuration.configurationId,
                    ...providerParticipantIds
                ]),

            ruleId:
                SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                    .DISTRIBUTED_OBJECTIVE_COVERAGE,

            kind:
                "ARCHITECTURAL_PROPERTY",

            title:
                "Distributed objective coverage",

            statement:
                "The declared objective is covered through contributions supplied by multiple distinct protocol participants in the same supported configuration.",

            basis:
                "DERIVED_COMPOSITION_RULE",

            participantIds:
                sortedUnique(
                    configuration.participantIds
                ),

            configurationIds:
                [
                    configuration.configurationId
                ],

            candidateIds:
                relationCandidateIds(
                    relations
                ),

            needIds:
                relationNeedIds(
                    relations
                ),

            contributionIds:
                sortedUnique(
                    configuration.objectiveCoverage.flatMap(
                        coverage =>
                            coverage.contributionIds
                    )
                ),

            boundaryIds:
                relationBoundaryIds(
                    relations
                ),

            discoveryEvidenceIds:
                relationDiscoveryEvidenceIds(
                    relations
                ),

            compatibilityEvidenceIds:
                relationCompatibilityEvidenceIds(
                    relations
                ),

            observationIds:
                context.observationIds,

            runIds:
                context.runIds

        };

    }


    private strictSubsetTradeoffFinding(
        harmony:
            ScientificCompositionHarmonyAssessment,
        contexts:
            SupportedConfigurationContext[]
    ): ScientificCompositionValueFinding {

        const relations =
            contexts.flatMap(
                context =>
                    context.configuration.relations
            );


        return {

            findingId:
                encode([
                    SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                        .STRICT_SUBSET_ONLY,
                    harmony.harmonyAssessmentId,
                    ...contexts.map(
                        context =>
                            context.configuration.configurationId
                    )
                ]),

            ruleId:
                SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                    .STRICT_SUBSET_ONLY,

            kind:
                "EVIDENCE_LIMITATION",

            title:
                "Full-set value not established",

            statement:
                "Composition value is demonstrated only for one or more globally supported strict subsets; the complete requested participant set is not established by Harmony.",

            basis:
                "SUPPORTED_STRICT_SUBSET",

            participantIds:
                sortedUnique(
                    harmony.participantIds
                ),

            configurationIds:
                sortedUnique(
                    contexts.map(
                        context =>
                            context.configuration.configurationId
                    )
                ),

            candidateIds:
                relationCandidateIds(
                    relations
                ),

            needIds:
                relationNeedIds(
                    relations
                ),

            contributionIds:
                relationContributionIds(
                    relations
                ),

            boundaryIds:
                relationBoundaryIds(
                    relations
                ),

            discoveryEvidenceIds:
                relationDiscoveryEvidenceIds(
                    relations
                ),

            compatibilityEvidenceIds:
                relationCompatibilityEvidenceIds(
                    relations
                ),

            observationIds:
                sortedUnique(
                    contexts.flatMap(
                        context =>
                            context.observationIds
                    )
                ),

            runIds:
                sortedUnique(
                    contexts.flatMap(
                        context =>
                            context.runIds
                    )
                )

        };

    }

}