import type {
    ScientificSourceObservation
} from "../scientific-source-observation/ScientificSourceObservation.js";

import type {
    ScientificSourceFact
} from "../scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolRelationEvidence
} from "../scientific-protocol-relation-evidence/ScientificProtocolRelationEvidence.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificCompositionCandidateEvaluationGraphResult
} from "../scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraph.js";

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
    ScientificCompositionHarmonyResult
} from "../scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import type {
    ScientificDecisionTraceCandidate,
    ScientificDecisionTraceCandidateReason,
    ScientificDecisionTraceComposition,
    ScientificDecisionTraceCompositionReason,
    ScientificDecisionTraceConfiguration,
    ScientificDecisionTraceParticipantArtifact,
    ScientificDecisionTraceResult,
    ScientificDecisionTraceSourceEvidence
} from "./ScientificDecisionTrace.js";


export interface ScientificDecisionTraceEngineInput {

    observations:
        ScientificSourceObservation[];

    facts:
        ScientificSourceFact[];

    protocolRelationEvidence:
        ScientificProtocolRelationEvidence[];

    profiles:
        ScientificProtocolCompositionProfile[];

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


function sameRevision(
    left:
        string | undefined,
    right:
        string | undefined
): boolean {

    return (
        left ??
        ""
    ) ===
        (
            right ??
            ""
        );

}


export class ScientificDecisionTraceEngine {

    trace(
        input:
            ScientificDecisionTraceEngineInput
    ): ScientificDecisionTraceResult {

        const errors:
            string[] =
            [];


        if (
            input.candidateEvaluationGraph.errors.length >
            0
        ) {

            errors.push(
                "Cannot explain candidate evaluation graph containing errors."
            );

        }


        if (
            input.evidenceGaps.errors.length >
            0
        ) {

            errors.push(
                "Cannot explain candidate evidence gaps containing errors."
            );

        }


        if (
            input.solver.errors.length >
            0
        ) {

            errors.push(
                "Cannot explain solver output containing errors."
            );

        }


        if (
            input.globalEvidenceBindings.errors.length >
            0
        ) {

            errors.push(
                "Cannot explain global evidence bindings containing errors."
            );

        }


        if (
            input.harmony.errors.length >
            0
        ) {

            errors.push(
                "Cannot explain harmony output containing errors."
            );

        }


        const evaluationGraph =
            input.candidateEvaluationGraph.graph;


        if (
            evaluationGraph ===
            null
        ) {

            errors.push(
                "Cannot explain a null candidate evaluation graph."
            );

        }


        const observationsById =
            new Map<
                string,
                ScientificSourceObservation
            >();


        for (
            const observation
            of input.observations
        ) {

            if (
                observationsById.has(
                    observation.observationId
                )
            ) {

                errors.push(
                    `Duplicate source observation ${observation.observationId}.`
                );

                continue;

            }


            observationsById.set(
                observation.observationId,
                observation
            );

        }


        const factsById =
            new Map<
                string,
                ScientificSourceFact
            >();


        for (
            const fact
            of input.facts
        ) {

            if (
                factsById.has(
                    fact.factId
                )
            ) {

                errors.push(
                    `Duplicate source fact ${fact.factId}.`
                );

                continue;

            }


            const observation =
                observationsById.get(
                    fact.observationId
                );


            if (
                observation ===
                undefined
            ) {

                errors.push(
                    `Source fact ${fact.factId} references unknown observation ${fact.observationId}.`
                );

                continue;

            }


            if (
                fact.sourceId !==
                    observation.sourceId ||
                !sameRevision(
                    fact.sourceRevision,
                    observation.sourceRevision
                )
            ) {

                errors.push(
                    `Source fact ${fact.factId} disagrees with observation provenance ${fact.observationId}.`
                );

                continue;

            }


            factsById.set(
                fact.factId,
                fact
            );

        }


        const relationsById =
            new Map<
                string,
                ScientificProtocolRelationEvidence
            >();


        for (
            const relation
            of input.protocolRelationEvidence
        ) {

            if (
                relationsById.has(
                    relation.relationEvidenceId
                )
            ) {

                errors.push(
                    `Duplicate protocol relation evidence ${relation.relationEvidenceId}.`
                );

                continue;

            }


            if (
                factsById.has(
                    relation.relationEvidenceId
                )
            ) {

                errors.push(
                    `Evidence identity ${relation.relationEvidenceId} collides between source fact and protocol relation evidence.`
                );

                continue;

            }


            const observation =
                observationsById.get(
                    relation.observationId
                );


            if (
                observation ===
                undefined
            ) {

                errors.push(
                    `Protocol relation evidence ${relation.relationEvidenceId} references unknown observation ${relation.observationId}.`
                );

                continue;

            }


            if (
                relation.sourceId !==
                    observation.sourceId ||
                !sameRevision(
                    relation.sourceRevision,
                    observation.sourceRevision
                )
            ) {

                errors.push(
                    `Protocol relation evidence ${relation.relationEvidenceId} disagrees with observation provenance ${relation.observationId}.`
                );

                continue;

            }


            relationsById.set(
                relation.relationEvidenceId,
                relation
            );

        }


        if (
            errors.length >
            0 ||
            evaluationGraph ===
            null
        ) {

            return this.failed(
                errors
            );

        }


        const diagnosticsByCandidate =
            new Map<
                string,
                ScientificCompositionCandidateEvidenceGapResult["diagnostics"][number]
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


        for (
            const edge
            of evaluationGraph.edges
        ) {

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
                    edge.compatibilityPolarity ||
                !sameStrings(
                    diagnostic.knownBoundaryIds,
                    edge.boundaryIds
                ) ||
                !sameStrings(
                    diagnostic.compatibilityEvidenceIds,
                    edge.compatibilityEvidenceIds
                )
            ) {

                errors.push(
                    `Candidate diagnostic disagrees with evaluation edge ${edge.edgeId}.`
                );

            }

        }


        const configurationsById =
            new Map<
                string,
                ScientificNProtocolCompositionConfiguration
            >();

        const solutionsByEnvelope =
            new Map<
                string,
                ScientificNProtocolCompositionSolverResult["solutions"][number]
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


            const configuration =
                configurationsById.get(
                    binding.configurationId
                );


            if (
                configuration ===
                undefined
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} references unknown configuration ${binding.configurationId}.`
                );

                continue;

            }


            if (
                configuration.readiness !==
                "READY_FOR_GLOBAL_EVALUATION"
            ) {

                errors.push(
                    `Global evidence binding ${binding.bindingId} is attached to blocked configuration ${binding.configurationId}.`
                );

                continue;

            }


            bindingsByConfiguration.set(
                binding.configurationId,
                binding
            );

        }


        for (
            const configuration
            of configurationsById.values()
        ) {

            if (
                configuration.readiness ===
                    "READY_FOR_GLOBAL_EVALUATION" &&
                !bindingsByConfiguration.has(
                    configuration.configurationId
                )
            ) {

                errors.push(
                    `Ready configuration ${configuration.configurationId} has no global evidence binding.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return this.failed(
                errors
            );

        }


        const requestedEvidenceIds =
            new Set<string>();


        for (
            const profile
            of input.profiles
        ) {

            for (
                const artifact
                of [
                    ...profile.contributions,
                    ...profile.boundaries,
                    ...profile.needs
                ]
            ) {

                for (
                    const evidenceId
                    of artifact.evidenceIds
                ) {

                    requestedEvidenceIds.add(
                        evidenceId
                    );

                }

            }

        }


        for (
            const edge
            of evaluationGraph.edges
        ) {

            for (
                const evidenceId
                of [
                    ...edge.discoveryEvidenceIds,
                    ...edge.compatibilityEvidenceIds
                ]
            ) {

                requestedEvidenceIds.add(
                    evidenceId
                );

            }

        }


        for (
            const binding
            of input.globalEvidenceBindings.bindings
        ) {

            const assessment =
                binding.evaluation.assessment;


            if (
                assessment ===
                null
            ) {

                continue;

            }


            for (
                const run
                of assessment.runAssessments
            ) {

                for (
                    const boundary
                    of run.boundaryEvaluations
                ) {

                    for (
                        const evidenceId
                        of boundary.evidenceIds
                    ) {

                        requestedEvidenceIds.add(
                            evidenceId
                        );

                    }

                }

            }

        }


        const evidenceCatalog:
            ScientificDecisionTraceSourceEvidence[] =
            [];

        const resolvedEvidenceIds =
            new Set<string>();

        const unresolvedEvidenceIds =
            new Set<string>();


        for (
            const evidenceId
            of [...requestedEvidenceIds].sort()
        ) {

            const fact =
                factsById.get(
                    evidenceId
                );

            const relation =
                relationsById.get(
                    evidenceId
                );


            if (
                fact !==
                undefined
            ) {

                const observation =
                    observationsById.get(
                        fact.observationId
                    )!;


                evidenceCatalog.push({

                    evidenceId,

                    evidenceKind:
                        "SOURCE_FACT",

                    sourceId:
                        fact.sourceId,

                    sourceType:
                        observation.sourceType,

                    ...(
                        fact.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    fact.sourceRevision
                            }
                            : {}
                    ),

                    observationId:
                        fact.observationId,

                    sourceLocation:
                        fact.locator.sourceLocation,

                    ...(
                        fact.locator.filePath !==
                        undefined
                            ? {
                                filePath:
                                    fact.locator.filePath
                            }
                            : {}
                    ),

                    ...(
                        fact.locator.startLine !==
                        undefined
                            ? {
                                startLine:
                                    fact.locator.startLine
                            }
                            : {}
                    ),

                    ...(
                        fact.locator.endLine !==
                        undefined
                            ? {
                                endLine:
                                    fact.locator.endLine
                            }
                            : {}
                    ),

                    rawText:
                        fact.rawText,

                    factKind:
                        fact.kind

                });


                resolvedEvidenceIds.add(
                    evidenceId
                );

                continue;

            }


            if (
                relation !==
                undefined
            ) {

                const observation =
                    observationsById.get(
                        relation.observationId
                    )!;


                evidenceCatalog.push({

                    evidenceId,

                    evidenceKind:
                        "DOCUMENTARY_RELATION",

                    sourceId:
                        relation.sourceId,

                    sourceType:
                        observation.sourceType,

                    ...(
                        relation.sourceRevision !==
                        undefined
                            ? {
                                sourceRevision:
                                    relation.sourceRevision
                            }
                            : {}
                    ),

                    observationId:
                        relation.observationId,

                    sourceLocation:
                        relation.locator.sourceLocation,

                    ...(
                        relation.locator.filePath !==
                        undefined
                            ? {
                                filePath:
                                    relation.locator.filePath
                            }
                            : {}
                    ),

                    ...(
                        relation.locator.startLine !==
                        undefined
                            ? {
                                startLine:
                                    relation.locator.startLine
                            }
                            : {}
                    ),

                    ...(
                        relation.locator.endLine !==
                        undefined
                            ? {
                                endLine:
                                    relation.locator.endLine
                            }
                            : {}
                    ),

                    rawText:
                        relation.rawText,

                    relation:
                        relation.relation,

                    relationEvidenceBasis:
                        relation.evidenceBasis,

                    subjectLocator: {
                        ...relation.subjectLocator
                    }

                });


                resolvedEvidenceIds.add(
                    evidenceId
                );

                continue;

            }


            unresolvedEvidenceIds.add(
                evidenceId
            );

        }


        const participantArtifacts:
            ScientificDecisionTraceParticipantArtifact[] =
            [];


        for (
            const profile
            of [...input.profiles].sort(
                (a, b) =>
                    a.protocolId.localeCompare(
                        b.protocolId
                    )
            )
        ) {

            for (
                const contribution
                of profile.contributions
            ) {

                participantArtifacts.push(
                    this.artifact(
                        contribution.contributionId,
                        "CONTRIBUTION",
                        contribution.participantId,
                        profile.sourceId,
                        profile.sourceRevision,
                        contribution.subject,
                        contribution.evidenceIds,
                        resolvedEvidenceIds
                    )
                );

            }


            for (
                const boundary
                of profile.boundaries
            ) {

                participantArtifacts.push(
                    this.artifact(
                        boundary.boundaryId,
                        "BOUNDARY",
                        boundary.participantId,
                        profile.sourceId,
                        profile.sourceRevision,
                        boundary.subject,
                        boundary.evidenceIds,
                        resolvedEvidenceIds
                    )
                );

            }


            for (
                const need
                of profile.needs
            ) {

                participantArtifacts.push(
                    this.artifact(
                        need.needId,
                        "NEED",
                        need.participantId,
                        profile.sourceId,
                        profile.sourceRevision,
                        need.subject,
                        need.evidenceIds,
                        resolvedEvidenceIds
                    )
                );

            }

        }


        participantArtifacts.sort(
            (a, b) =>
                a.artifactId.localeCompare(
                    b.artifactId
                )
        );


        const candidateTraces:
            ScientificDecisionTraceCandidate[] =
            [];


        for (
            const edge
            of [...evaluationGraph.edges].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            const diagnostic =
                diagnosticsByCandidate.get(
                    edge.candidateId
                )!;


            const reasonCodes:
                ScientificDecisionTraceCandidateReason[] =
                [];


            reasonCodes.push(
                edge.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
                    ? "FUNCTIONAL_MATCH_OPENED_CANDIDATE"
                    : "DOCUMENTARY_RELATION_OPENED_CANDIDATE"
            );


            if (
                edge.compatibilityPolarity ===
                "SUPPORT"
            ) {

                reasonCodes.push(
                    "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
                );

            }
            else if (
                edge.compatibilityPolarity ===
                "CHALLENGE"
            ) {

                reasonCodes.push(
                    "BOUNDARY_CHALLENGED"
                );

            }
            else {

                reasonCodes.push(
                    "CANDIDATE_COMPATIBILITY_INCONCLUSIVE"
                );

            }


            for (
                const gap
                of diagnostic.gaps
            ) {

                if (
                    gap.kind ===
                    "NO_KNOWN_BOUNDARIES"
                ) {

                    reasonCodes.push(
                        "NO_KNOWN_BOUNDARIES"
                    );

                }
                else if (
                    gap.kind ===
                    "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
                ) {

                    reasonCodes.push(
                        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
                    );

                }
                else if (
                    gap.kind ===
                    "UNEVALUATED_KNOWN_BOUNDARIES"
                ) {

                    reasonCodes.push(
                        "UNEVALUATED_KNOWN_BOUNDARIES"
                    );

                }

            }


            const evidenceIds =
                sortedUnique([
                    ...edge.discoveryEvidenceIds,
                    ...edge.compatibilityEvidenceIds
                ]);


            candidateTraces.push({

                traceId:
                    encode([
                        "SCIENTIFIC-DECISION-TRACE-CANDIDATE",
                        edge.candidateId,
                        edge.compatibilityAssessmentId
                    ]),

                candidateId:
                    edge.candidateId,

                candidateKind:
                    edge.kind,

                sourceParticipantId:
                    edge.sourceParticipantId,

                targetParticipantId:
                    edge.targetParticipantId,

                compatibilityAssessmentId:
                    edge.compatibilityAssessmentId,

                compatibilityPolarity:
                    edge.compatibilityPolarity,

                discoveryEvidenceIds:
                    [...edge.discoveryEvidenceIds].sort(),

                compatibilityEvidenceIds:
                    [...edge.compatibilityEvidenceIds].sort(),

                knownBoundaryIds:
                    [...diagnostic.knownBoundaryIds].sort(),

                observedBoundaryIds:
                    [...diagnostic.observedBoundaryIds].sort(),

                unevaluatedBoundaryIds:
                    [...diagnostic.unevaluatedBoundaryIds].sort(),

                gapIds:
                    diagnostic.gaps
                        .map(
                            gap =>
                                gap.gapId
                        )
                        .sort(),

                reasonCodes:
                    sortedUnique(
                        reasonCodes
                    ) as ScientificDecisionTraceCandidateReason[],

                resolvedEvidenceIds:
                    evidenceIds
                        .filter(
                            evidenceId =>
                                resolvedEvidenceIds.has(
                                    evidenceId
                                )
                        ),

                unresolvedEvidenceIds:
                    evidenceIds
                        .filter(
                            evidenceId =>
                                !resolvedEvidenceIds.has(
                                    evidenceId
                                )
                        ),

                traceBasis:
                    "UPSTREAM_CANDIDATE_EVIDENCE_EXPLANATION"

            });

        }


        const candidateTraceByCandidateId =
            new Map(
                candidateTraces.map(
                    trace => [
                        trace.candidateId,
                        trace
                    ]
                )
            );


        const compositionTraces:
            ScientificDecisionTraceComposition[] =
            [];


        for (
            const harmony
            of [...input.harmony.assessments].sort(
                (a, b) =>
                    a.harmonyAssessmentId.localeCompare(
                        b.harmonyAssessmentId
                    )
            )
        ) {

            const solution =
                solutionsByEnvelope.get(
                    harmony.envelopeId
                );


            if (
                solution ===
                undefined
            ) {

                errors.push(
                    `Harmony assessment ${harmony.harmonyAssessmentId} has no solver solution for envelope ${harmony.envelopeId}.`
                );

                continue;

            }


            if (
                solution.setId !==
                    harmony.setId ||
                solution.objectiveId !==
                    harmony.objectiveId ||
                !sameStrings(
                    solution.participantIds,
                    harmony.participantIds
                )
            ) {

                errors.push(
                    `Harmony assessment ${harmony.harmonyAssessmentId} disagrees with solver solution ${solution.solutionId}.`
                );

                continue;

            }


            if (
                harmony.evidenceBasis !==
                "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"
            ) {

                errors.push(
                    `Harmony assessment ${harmony.harmonyAssessmentId} does not carry solver-aware evidence basis.`
                );

                continue;

            }


            const candidateIds =
                sortedUnique([
                    ...harmony.supportedCandidateIds,
                    ...harmony.challengedCandidateIds,
                    ...harmony.inconclusiveCandidateIds
                ]);


            const missingCandidate =
                candidateIds.find(
                    candidateId =>
                        !candidateTraceByCandidateId.has(
                            candidateId
                        )
                );


            if (
                missingCandidate !==
                undefined
            ) {

                errors.push(
                    `Harmony assessment ${harmony.harmonyAssessmentId} references candidate without decision trace ${missingCandidate}.`
                );

                continue;

            }


            const configurations =
                [
                    ...solution.fullConfigurations,
                    ...solution.subsetConfigurations
                ]
                    .map(
                        configuration =>
                            this.configuration(
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


            const supportedFull =
                harmony.fullConfigurationEvidence.some(
                    evidence =>
                        evidence.scientificPolarity ===
                        "SUPPORT"
                );


            const challengedFull =
                harmony.fullConfigurationEvidence.some(
                    evidence =>
                        evidence.scientificPolarity ===
                        "CHALLENGE"
                );


            if (
                harmony.harmonyStatus ===
                    "FULL" &&
                !supportedFull
            ) {

                errors.push(
                    `FULL harmony assessment ${harmony.harmonyAssessmentId} has no globally supported full configuration evidence.`
                );

                continue;

            }


            if (
                harmony.harmonyStatus ===
                    "PARTIAL" &&
                harmony.supportedSubsets.length ===
                    0
            ) {

                errors.push(
                    `PARTIAL harmony assessment ${harmony.harmonyAssessmentId} has no globally supported strict subset.`
                );

                continue;

            }


            if (
                harmony.harmonyStatus ===
                    "CHALLENGED" &&
                !challengedFull
            ) {

                errors.push(
                    `CHALLENGED harmony assessment ${harmony.harmonyAssessmentId} has no challenged full configuration evidence.`
                );

                continue;

            }


            const reasonCodes:
                ScientificDecisionTraceCompositionReason[] =
                [];


            if (
                harmony.harmonyStatus ===
                "FULL"
            ) {

                reasonCodes.push(
                    "EXACT_FULL_CONFIGURATION_HAS_GLOBAL_SUPPORT"
                );

            }
            else if (
                harmony.harmonyStatus ===
                "PARTIAL"
            ) {

                reasonCodes.push(
                    "STRICT_SUBSET_HAS_GLOBAL_SUPPORT"
                );

            }
            else if (
                harmony.harmonyStatus ===
                "CHALLENGED"
            ) {

                reasonCodes.push(
                    "FULL_CONFIGURATION_GLOBALLY_CHALLENGED"
                );

            }
            else {

                reasonCodes.push(
                    "GLOBAL_COMPOSITION_NOT_ESTABLISHED"
                );

            }


            if (
                solution.fullConfigurations.length ===
                    0 &&
                solution.subsetConfigurations.length ===
                    0
            ) {

                reasonCodes.push(
                    "NO_SOLVER_CONFIGURATION"
                );

            }


            if (
                solution.resolutionStatus ===
                "UNRESOLVED_CANDIDATE_TOPOLOGY"
            ) {

                reasonCodes.push(
                    "CANDIDATE_TOPOLOGY_UNRESOLVED"
                );

            }


            if (
                configurations.some(
                    configuration =>
                        configuration.readiness ===
                        "BLOCKED"
                )
            ) {

                reasonCodes.push(
                    "BLOCKED_CONFIGURATION_PRESENT"
                );

            }


            if (
                configurations.some(
                    configuration =>
                        configuration.globalStatus ===
                        "INCONCLUSIVE"
                )
            ) {

                reasonCodes.push(
                    "INCONCLUSIVE_GLOBAL_EVIDENCE_PRESENT"
                );

            }


            if (
                candidateIds.some(
                    candidateId =>
                        candidateTraceByCandidateId
                            .get(
                                candidateId
                            )!
                            .gapIds
                            .length >
                        0
                )
            ) {

                reasonCodes.push(
                    "CANDIDATE_EVIDENCE_GAPS_PRESENT"
                );

            }


            compositionTraces.push({

                traceId:
                    encode([
                        "SCIENTIFIC-DECISION-TRACE-COMPOSITION",
                        harmony.harmonyAssessmentId,
                        solution.solutionId
                    ]),

                envelopeId:
                    harmony.envelopeId,

                setId:
                    harmony.setId,

                objectiveId:
                    harmony.objectiveId,

                participantIds:
                    [...harmony.participantIds].sort(),

                harmonyAssessmentId:
                    harmony.harmonyAssessmentId,

                harmonyStatus:
                    harmony.harmonyStatus,

                harmonyEvidenceBasis:
                    harmony.evidenceBasis,

                solverSolutionId:
                    solution.solutionId,

                solverResolutionStatus:
                    solution.resolutionStatus,

                candidateTraceIds:
                    candidateIds
                        .map(
                            candidateId =>
                                candidateTraceByCandidateId
                                    .get(
                                        candidateId
                                    )!
                                    .traceId
                        )
                        .sort(),

                configurations,

                reasonCodes:
                    sortedUnique(
                        reasonCodes
                    ) as ScientificDecisionTraceCompositionReason[],

                decisionBasis:
                    "UPSTREAM_SCIENTIFIC_DECISION_EXPLANATION",

                traceStatus:
                    "EXPLAINED"

            });

        }


        if (
            errors.length >
            0
        ) {

            return this.failed(
                errors
            );

        }


        evidenceCatalog.sort(
            (a, b) =>
                a.evidenceId.localeCompare(
                    b.evidenceId
                )
        );


        compositionTraces.sort(
            (a, b) =>
                a.traceId.localeCompare(
                    b.traceId
                )
        );


        return {

            evidenceCatalog,

            participantArtifacts,

            candidateTraces,

            compositionTraces,

            unresolvedEvidenceIds:
                [...unresolvedEvidenceIds].sort(),

            errors:
                []

        };

    }


    private artifact(
        artifactId:
            string,
        artifactKind:
            ScientificDecisionTraceParticipantArtifact["artifactKind"],
        participantId:
            string,
        sourceId:
            string,
        sourceRevision:
            string | undefined,
        subject:
            string,
        evidenceIds:
            string[],
        resolved:
            Set<string>
    ): ScientificDecisionTraceParticipantArtifact {

        const ids =
            sortedUnique(
                evidenceIds
            );


        return {

            artifactId,

            artifactKind,

            participantId,

            sourceId,

            ...(
                sourceRevision !==
                undefined
                    ? {
                        sourceRevision
                    }
                    : {}
            ),

            subject,

            evidenceIds:
                ids,

            resolvedEvidenceIds:
                ids.filter(
                    evidenceId =>
                        resolved.has(
                            evidenceId
                        )
                ),

            unresolvedEvidenceIds:
                ids.filter(
                    evidenceId =>
                        !resolved.has(
                            evidenceId
                        )
                )

        };

    }


    private configuration(
        configuration:
            ScientificNProtocolCompositionConfiguration,
        binding:
            ScientificNProtocolGlobalEvidenceBinding | undefined
    ): ScientificDecisionTraceConfiguration {

        const assessment =
            binding?.evaluation.assessment;


        return {

            configurationId:
                configuration.configurationId,

            kind:
                configuration.kind,

            participantIds:
                [...configuration.participantIds].sort(),

            readiness:
                configuration.readiness,

            selectedFunctionalCandidateIds:
                [...configuration.selectedFunctionalCandidateIds].sort(),

            knownBoundaryIds:
                [...configuration.knownBoundaryIds].sort(),

            blockerIds:
                [...configuration.blockers].sort(),

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

            ...(
                assessment !==
                null &&
                assessment !==
                undefined
                    ? {
                        globalAssessmentId:
                            assessment.assessmentId
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


    private failed(
        errors:
            string[]
    ): ScientificDecisionTraceResult {

        return {

            evidenceCatalog:
                [],

            participantArtifacts:
                [],

            candidateTraces:
                [],

            compositionTraces:
                [],

            unresolvedEvidenceIds:
                [],

            errors:
                sortedUnique(
                    errors
                )

        };

    }

}