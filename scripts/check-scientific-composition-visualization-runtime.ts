import {
    ScientificCompositionVisualizationEngine
} from "../laboratory/scientific-composition-visualization/ScientificCompositionVisualizationEngine.js";


let passed =
    0;

let failed =
    0;


function check(
    label:
        string,
    condition:
        boolean
): void {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    if (
        condition
    ) {

        passed++;

    }
    else {

        failed++;

    }

}


function participant(
    id:
        string
): any {

    return {

        participantId:
            id,

        profileId:
            `PROFILE-${id}`,

        sourceId:
            `SOURCE-${id}`,

        contributions: [
            {
                contributionId:
                    `CONTRIBUTION-${id}`
            }
        ],

        boundaries: [
            {
                boundaryId:
                    `BOUNDARY-${id}`
            }
        ],

        needs: [
            {
                needId:
                    `NEED-${id}`
            }
        ]

    };

}


const envelope:
    any = {

        envelopeId:
            "ENVELOPE-ABC",

        setId:
            "SET-ABC",

        candidateGraphId:
            "CANDIDATE-GRAPH",

        candidateEvaluationGraphId:
            "CANDIDATE-EVALUATION-GRAPH",

        objectiveId:
            "OBJECTIVE",

        participants: [
            participant("ERC-A"),
            participant("ERC-B"),
            participant("ERC-C")
        ],

        participantIds: [
            "ERC-A",
            "ERC-B",
            "ERC-C"
        ],

        relations: [
            {
                candidateId:
                    "CANDIDATE-A-B"
            },
            {
                candidateId:
                    "CANDIDATE-B-C"
            },
            {
                candidateId:
                    "CANDIDATE-A-C-DOC"
            }
        ],

        boundaryRegions:
            [],

        unresolvedNeedIds:
            [],

        statistics:
            {},

        assemblyStatus:
            "ASSEMBLED"

    };


const envelopes:
    any = {

        envelopes: [
            envelope
        ],

        isolatedParticipantIds: [
            "ERC-X"
        ],

        errors:
            []

    };


function functionalEdge(
    candidateId:
        string,
    source:
        string,
    target:
        string
): any {

    return {

        edgeId:
            `EDGE-${candidateId}`,

        candidateGraphEdgeId:
            `GRAPH-EDGE-${candidateId}`,

        candidateId,

        kind:
            "FUNCTIONAL_COMPLEMENTARITY",

        sourceParticipantId:
            source,

        targetParticipantId:
            target,

        discoveryEvidenceIds: [
            `DISCOVERY-${candidateId}`
        ],

        compatibilityAssessmentId:
            `COMPAT-${candidateId}`,

        compatibilityAssessmentBasis:
            "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

        boundaryIds: [
            `BOUNDARY-${source}`,
            `BOUNDARY-${target}`
        ],

        compatibilityEvidenceIds: [
            `COMPAT-EVIDENCE-${candidateId}`
        ],

        compatibilityPolarity:
            "SUPPORT",

        evaluationStatus:
            "EVALUATED",

        functionalMatchId:
            `MATCH-${candidateId}`,

        needId:
            `NEED-${source}`,

        contributionId:
            `CONTRIBUTION-${target}`,

        contributionKind:
            "CAPABILITY"

    };

}


const documentaryEdge:
    any = {

        edgeId:
            "EDGE-DOC",

        candidateGraphEdgeId:
            "GRAPH-EDGE-DOC",

        candidateId:
            "CANDIDATE-A-C-DOC",

        kind:
            "DOCUMENTARY_COMPOSITION",

        sourceParticipantId:
            "ERC-A",

        targetParticipantId:
            "ERC-C",

        discoveryEvidenceIds: [
            "DOC-EVIDENCE"
        ],

        compatibilityAssessmentId:
            "COMPAT-DOC",

        compatibilityAssessmentBasis:
            "KNOWN_PARTICIPANT_BOUNDARY_OBSERVATIONS",

        boundaryIds:
            [],

        compatibilityEvidenceIds:
            [],

        compatibilityPolarity:
            "INCONCLUSIVE",

        evaluationStatus:
            "EVALUATED",

        documentaryCandidateId:
            "DOCUMENTARY-A-C",

        relation:
            "COMPOSES_WITH"

    };


const evaluationGraph:
    any = {

        graph: {

            graphId:
                "CANDIDATE-EVALUATION-GRAPH",

            candidateGraphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE",

            nodes: [
                {
                    participantId:
                        "ERC-A"
                },
                {
                    participantId:
                        "ERC-B"
                },
                {
                    participantId:
                        "ERC-C"
                }
            ],

            edges: [
                functionalEdge(
                    "CANDIDATE-A-B",
                    "ERC-A",
                    "ERC-B"
                ),
                functionalEdge(
                    "CANDIDATE-B-C",
                    "ERC-B",
                    "ERC-C"
                ),
                documentaryEdge
            ],

            statistics:
                {}

        },

        errors:
            []

    };


function diagnostic(
    candidateId:
        string,
    source:
        string,
    target:
        string,
    kind:
        string,
    polarity:
        string,
    boundaries:
        string[]
): any {

    const inconclusive =
        polarity ===
        "INCONCLUSIVE";


    return {

        diagnosticId:
            `DIAGNOSTIC-${candidateId}`,

        candidateId,

        candidateKind:
            kind,

        sourceParticipantId:
            source,

        targetParticipantId:
            target,

        compatibilityAssessmentId:
            kind ===
                "DOCUMENTARY_COMPOSITION"
                ? "COMPAT-DOC"
                : `COMPAT-${candidateId}`,

        compatibilityPolarity:
            polarity,

        knownBoundaryIds:
            [...boundaries],

        observedBoundaryIds:
            inconclusive
                ? []
                : [...boundaries],

        unevaluatedBoundaryIds:
            [],

        compatibilityObservationIds:
            inconclusive
                ? []
                : [
                    `OBS-${candidateId}`
                ],

        compatibilityEvidenceIds:
            inconclusive
                ? []
                : [
                    `COMPAT-EVIDENCE-${candidateId}`
                ],

        gaps:
            inconclusive
                ? [
                    {
                        gapId:
                            `GAP-BOUNDARY-${candidateId}`,

                        kind:
                            "NO_KNOWN_BOUNDARIES",

                        candidateId,

                        boundaryIds:
                            []
                    },
                    {
                        gapId:
                            `GAP-OBS-${candidateId}`,

                        kind:
                            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",

                        candidateId,

                        boundaryIds:
                            []
                    }
                ]
                : [],

        resolution:
            inconclusive
                ? "REQUIRES_ADDITIONAL_EVIDENCE"
                : "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"

    };

}


const evidenceGaps:
    any = {

        diagnostics: [
            diagnostic(
                "CANDIDATE-A-B",
                "ERC-A",
                "ERC-B",
                "FUNCTIONAL_COMPLEMENTARITY",
                "SUPPORT",
                [
                    "BOUNDARY-ERC-A",
                    "BOUNDARY-ERC-B"
                ]
            ),

            diagnostic(
                "CANDIDATE-B-C",
                "ERC-B",
                "ERC-C",
                "FUNCTIONAL_COMPLEMENTARITY",
                "SUPPORT",
                [
                    "BOUNDARY-ERC-B",
                    "BOUNDARY-ERC-C"
                ]
            ),

            diagnostic(
                "CANDIDATE-A-C-DOC",
                "ERC-A",
                "ERC-C",
                "DOCUMENTARY_COMPOSITION",
                "INCONCLUSIVE",
                []
            )
        ],

        errors:
            []

    };


const fullConfiguration:
    any = {

        configurationId:
            "CONFIG-FULL",

        envelopeId:
            "ENVELOPE-ABC",

        setId:
            "SET-ABC",

        objectiveId:
            "OBJECTIVE",

        kind:
            "FULL_SET",

        participantIds: [
            "ERC-A",
            "ERC-B",
            "ERC-C"
        ],

        relations:
            [],

        selectedFunctionalCandidateIds: [
            "CANDIDATE-A-B",
            "CANDIDATE-B-C"
        ],

        fulfilledNeedIds:
            [],

        unresolvedNeedIds:
            [],

        objectiveCoverage:
            [],

        unresolvedObjectiveSubjects:
            [],

        knownBoundaryIds: [
            "BOUNDARY-ERC-A",
            "BOUNDARY-ERC-B",
            "BOUNDARY-ERC-C"
        ],

        blockers:
            [],

        readiness:
            "READY_FOR_GLOBAL_EVALUATION",

        globalEvaluationStatus:
            "UNEVALUATED"

    };


const blockedSubset:
    any = {

        ...fullConfiguration,

        configurationId:
            "CONFIG-SUBSET-BLOCKED",

        kind:
            "STRICT_SUBSET",

        participantIds: [
            "ERC-A",
            "ERC-B"
        ],

        selectedFunctionalCandidateIds: [
            "CANDIDATE-A-B"
        ],

        knownBoundaryIds: [
            "BOUNDARY-ERC-A",
            "BOUNDARY-ERC-B"
        ],

        blockers: [
            "UNRESOLVED_NEEDS"
        ],

        readiness:
            "BLOCKED"

    };


const solver:
    any = {

        solutions: [
            {
                solutionId:
                    "SOLUTION-ABC",

                envelopeId:
                    "ENVELOPE-ABC",

                setId:
                    "SET-ABC",

                objectiveId:
                    "OBJECTIVE",

                participantIds: [
                    "ERC-A",
                    "ERC-B",
                    "ERC-C"
                ],

                fullConfigurations: [
                    fullConfiguration
                ],

                subsetConfigurations: [
                    blockedSubset
                ],

                supportedFunctionalCandidateIds: [
                    "CANDIDATE-A-B",
                    "CANDIDATE-B-C"
                ],

                documentaryCandidateIds: [
                    "CANDIDATE-A-C-DOC"
                ],

                challengedCandidateIds:
                    [],

                inconclusiveCandidateIds: [
                    "CANDIDATE-A-C-DOC"
                ],

                statistics:
                    {},

                resolutionStatus:
                    "READY_FULL_CONFIGURATION"
            }
        ],

        errors:
            []

    };


const binding:
    any = {

        bindingId:
            "BINDING-FULL",

        targetId:
            "TARGET-FULL",

        configurationId:
            "CONFIG-FULL",

        envelopeId:
            "ENVELOPE-ABC",

        setId:
            "SET-ABC",

        objectiveId:
            "OBJECTIVE",

        graphId:
            "GRAPH-FULL",

        observationIds: [
            "GLOBAL-OBS-A",
            "GLOBAL-OBS-B",
            "GLOBAL-OBS-C"
        ],

        runIds: [
            "RUN-FULL"
        ],

        evaluation: {

            assessment: {

                assessmentId:
                    "GLOBAL-ASSESSMENT-FULL",

                graphId:
                    "GRAPH-FULL",

                runAssessments:
                    [],

                scientificPolarity:
                    "SUPPORT",

                supportingRunId:
                    "RUN-FULL"

            },

            errors:
                []

        },

        status:
            "EVALUATED"

    };


const globalEvidenceBindings:
    any = {

        bindings: [
            binding
        ],

        errors:
            []

    };


const harmonyAssessment:
    any = {

        harmonyAssessmentId:
            "HARMONY-ABC",

        envelopeId:
            "ENVELOPE-ABC",

        setId:
            "SET-ABC",

        objectiveId:
            "OBJECTIVE",

        participantIds: [
            "ERC-A",
            "ERC-B",
            "ERC-C"
        ],

        harmonyStatus:
            "FULL",

        fullConfigurationEvidence: [
            {
                configurationId:
                    "CONFIG-FULL",

                bindingId:
                    "BINDING-FULL",

                targetId:
                    "TARGET-FULL",

                graphId:
                    "GRAPH-FULL",

                globalAssessmentId:
                    "GLOBAL-ASSESSMENT-FULL",

                participantIds: [
                    "ERC-A",
                    "ERC-B",
                    "ERC-C"
                ],

                scientificPolarity:
                    "SUPPORT",

                observationIds: [
                    "GLOBAL-OBS-A",
                    "GLOBAL-OBS-B",
                    "GLOBAL-OBS-C"
                ],

                runIds: [
                    "RUN-FULL"
                ],

                supportingRunId:
                    "RUN-FULL"
            }
        ],

        supportedSubsets:
            [],

        blockedFullConfigurationIds:
            [],

        blockedSubsetConfigurationIds: [
            "CONFIG-SUBSET-BLOCKED"
        ],

        supportedCandidateIds: [
            "CANDIDATE-A-B",
            "CANDIDATE-B-C"
        ],

        challengedCandidateIds:
            [],

        inconclusiveCandidateIds: [
            "CANDIDATE-A-C-DOC"
        ],

        preservedBoundaryRegionIds:
            [],

        violatedBoundaryRegionIds:
            [],

        unevaluatedBoundaryRegionIds:
            [],

        evidenceBasis:
            "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"

    };


const harmony:
    any = {

        assessments: [
            harmonyAssessment
        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionVisualizationEngine();


console.log(
    "\nSCIENTIFIC COMPOSITION VISUALIZATION MODEL — RUNTIME"
);
console.log(
    "-----------------------------------------------------"
);


const result =
    engine.project({

        envelopes,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings,

        harmony

    });


check(
    "VALID VISUALIZATION PROJECTION HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "ONE ENVELOPE PRODUCES ONE VISUALIZATION",
    result.visualizations.length ===
        1
);


const visualization =
    result.visualizations[0];


check(
    "VISUALIZATION PRESERVES HARMONY WITHOUT RECOMPUTING IT",
    visualization.harmonyStatus ===
        "FULL" &&
    visualization.harmonyAssessmentId ===
        "HARMONY-ABC"
);


check(
    "THREE ERC PARTICIPANTS BECOME THREE VISUAL NODES",
    visualization.nodes.length ===
        3
);


check(
    "NODE PRESERVES CONTRIBUTIONS BOUNDARIES AND NEEDS",
    visualization.nodes[0]
        .contributionIds.length ===
        1 &&
    visualization.nodes[0]
        .boundaryIds.length ===
        1 &&
    visualization.nodes[0]
        .needIds.length ===
        1
);


check(
    "ALL ENVELOPE CANDIDATES BECOME VISUAL RELATIONS",
    visualization.relations.length ===
        3
);


const documentary =
    visualization.relations.find(
        relation =>
            relation.candidateId ===
            "CANDIDATE-A-C-DOC"
    )!;


check(
    "DOCUMENTARY RELATION REMAINS DOCUMENTARY",
    documentary.kind ===
        "DOCUMENTARY_COMPOSITION" &&
    documentary.documentaryRelation ===
        "COMPOSES_WITH"
);


check(
    "INCONCLUSIVE DOCUMENTARY RELATION REMAINS INCONCLUSIVE",
    documentary.compatibilityPolarity ===
        "INCONCLUSIVE"
);


check(
    "EVIDENCE GAPS ARE EXPOSED TO THE RENDERER",
    documentary.gapIds.length ===
        2 &&
    documentary.gapKinds.includes(
        "NO_KNOWN_BOUNDARIES"
    ) &&
    documentary.gapKinds.includes(
        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    )
);


const functional =
    visualization.relations.find(
        relation =>
            relation.candidateId ===
            "CANDIDATE-A-B"
    )!;


check(
    "FUNCTIONAL RELATION PRESERVES NEED TO CONTRIBUTION DIRECTION",
    functional.sourceParticipantId ===
        "ERC-A" &&
    functional.targetParticipantId ===
        "ERC-B" &&
    functional.needId ===
        "NEED-ERC-A" &&
    functional.contributionId ===
        "CONTRIBUTION-ERC-B"
);


check(
    "DISCOVERY AND COMPATIBILITY EVIDENCE REMAIN SEPARATE",
    functional.discoveryEvidenceIds[0] ===
        "DISCOVERY-CANDIDATE-A-B" &&
    functional.compatibilityEvidenceIds[0] ===
        "COMPAT-EVIDENCE-CANDIDATE-A-B"
);


const fullView =
    visualization.configurations.find(
        configuration =>
            configuration.configurationId ===
            "CONFIG-FULL"
    )!;


check(
    "READY SOLVER CONFIGURATION PRESERVES GLOBAL SUPPORT",
    fullView.readiness ===
        "READY_FOR_GLOBAL_EVALUATION" &&
    fullView.globalStatus ===
        "SUPPORT"
);


check(
    "GLOBAL CONFIGURATION PRESERVES BINDING GRAPH AND RUN",
    fullView.bindingId ===
        "BINDING-FULL" &&
    fullView.graphId ===
        "GRAPH-FULL" &&
    fullView.supportingRunId ===
        "RUN-FULL"
);


const blockedView =
    visualization.configurations.find(
        configuration =>
            configuration.configurationId ===
            "CONFIG-SUBSET-BLOCKED"
    )!;


check(
    "BLOCKED CONFIGURATION IS VISUALLY EXPLICIT",
    blockedView.readiness ===
        "BLOCKED" &&
    blockedView.globalStatus ===
        "NOT_EVALUATED"
);


check(
    "BLOCKED CONFIGURATION DOES NOT INVENT GLOBAL GRAPH OR RUN",
    blockedView.graphId ===
        undefined &&
    blockedView.runIds.length ===
        0 &&
    blockedView.observationIds.length ===
        0
);


check(
    "SUPPORTED FULL CONFIGURATION IS EXPLICIT",
    JSON.stringify(
        visualization.supportedFullConfigurationIds
    ) ===
        JSON.stringify([
            "CONFIG-FULL"
        ])
);


check(
    "BLOCKED SUBSET IS EXPLICIT",
    JSON.stringify(
        visualization.blockedSubsetConfigurationIds
    ) ===
        JSON.stringify([
            "CONFIG-SUBSET-BLOCKED"
        ])
);


check(
    "ISOLATED PARTICIPANTS REMAIN VISIBLE OUTSIDE ENVELOPES",
    JSON.stringify(
        result.isolatedParticipantIds
    ) ===
        JSON.stringify([
            "ERC-X"
        ])
);


check(
    "VISUALIZATION IS DECLARED AS A STATE PROJECTION ONLY",
    visualization.modelBasis ===
        "SCIENTIFIC_STATE_PROJECTION" &&
    visualization.projectionStatus ===
        "PROJECTED"
);


/*
 * Local candidate SUPPORT may coexist with global INCONCLUSIVE.
 * Visualization must preserve the upstream Harmony verdict.
 */
const inconclusiveHarmony =
    engine.project({

        envelopes,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver: {

            ...solver,

            solutions: [
                {
                    ...solver.solutions[0],

                    fullConfigurations:
                        [],

                    subsetConfigurations:
                        [],

                    resolutionStatus:
                        "UNRESOLVED_CANDIDATE_TOPOLOGY"
                }
            ]

        },

        globalEvidenceBindings: {

            bindings:
                [],

            errors:
                []

        },

        harmony: {

            assessments: [
                {
                    ...harmonyAssessment,

                    harmonyStatus:
                        "INCONCLUSIVE",

                    fullConfigurationEvidence:
                        [],

                    blockedSubsetConfigurationIds:
                        []
                }
            ],

            errors:
                []

        }

    });


check(
    "LOCAL CANDIDATE SUPPORT DOES NOT BECOME GLOBAL HARMONY",
    inconclusiveHarmony.errors.length ===
        0 &&
    inconclusiveHarmony.visualizations[0]
        .harmonyStatus ===
        "INCONCLUSIVE" &&
    inconclusiveHarmony.visualizations[0]
        .relations.some(
            relation =>
                relation.compatibilityPolarity ===
                "SUPPORT"
        )
);


/*
 * Foreign evidence-gap diagnostic.
 */
const foreignGap =
    engine.project({

        envelopes,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps: {

            diagnostics: [
                ...evidenceGaps.diagnostics,
                {
                    ...evidenceGaps.diagnostics[0],

                    diagnosticId:
                        "FOREIGN-DIAGNOSTIC",

                    candidateId:
                        "FOREIGN-CANDIDATE"
                }
            ],

            errors:
                []

        },

        solver,

        globalEvidenceBindings,

        harmony

    });


check(
    "FOREIGN EVIDENCE GAP FAILS CLOSED",
    foreignGap.errors.length >
        0 &&
    foreignGap.visualizations.length ===
        0
);


/*
 * Wrong candidate evaluation graph provenance.
 */
const wrongGraph =
    engine.project({

        envelopes,

        candidateEvaluationGraph: {

            ...evaluationGraph,

            graph: {

                ...evaluationGraph.graph,

                graphId:
                    "OTHER-EVALUATION-GRAPH"
            }

        },

        evidenceGaps,

        solver,

        globalEvidenceBindings,

        harmony

    });


check(
    "ENVELOPE TO CANDIDATE GRAPH PROVENANCE FAILS CLOSED",
    wrongGraph.errors.length >
        0 &&
    wrongGraph.visualizations.length ===
        0
);


/*
 * Ready configuration without binding.
 */
const missingBinding =
    engine.project({

        envelopes,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings: {

            bindings:
                [],

            errors:
                []

        },

        harmony

    });


check(
    "READY CONFIGURATION WITHOUT GLOBAL BINDING FAILS CLOSED",
    missingBinding.errors.length >
        0 &&
    missingBinding.visualizations.length ===
        0
);


/*
 * Determinism.
 */
const reversed =
    engine.project({

        envelopes: {

            ...envelopes,

            envelopes:
                [...envelopes.envelopes]
                    .reverse(),

            isolatedParticipantIds:
                [...envelopes.isolatedParticipantIds]
                    .reverse()

        },

        candidateEvaluationGraph: {

            ...evaluationGraph,

            graph: {

                ...evaluationGraph.graph,

                nodes:
                    [...evaluationGraph.graph.nodes]
                        .reverse(),

                edges:
                    [...evaluationGraph.graph.edges]
                        .reverse()

            }

        },

        evidenceGaps: {

            ...evidenceGaps,

            diagnostics:
                [...evidenceGaps.diagnostics]
                    .reverse()

        },

        solver: {

            ...solver,

            solutions:
                [...solver.solutions]
                    .reverse()

        },

        globalEvidenceBindings: {

            ...globalEvidenceBindings,

            bindings:
                [...globalEvidenceBindings.bindings]
                    .reverse()

        },

        harmony: {

            ...harmony,

            assessments:
                [...harmony.assessments]
                    .reverse()

        }

    });


check(
    "VISUALIZATION PROJECTION IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
        JSON.stringify(
            reversed
        )
);


const serialized =
    JSON.stringify(
        visualization
    );


check(
    "SCIENTIFIC VISUALIZATION MODEL CONTAINS NO RENDERER GEOMETRY",
    !serialized.includes(
        '"position"'
    ) &&
    !serialized.includes(
        '"coordinates"'
    ) &&
    !serialized.includes(
        '"geometry"'
    ) &&
    !serialized.includes(
        '"color"'
    )
);


console.log("");
console.log(
    `PASS: ${passed}`
);
console.log(
    `FAIL: ${failed}`
);


if (
    failed >
    0
) {

    console.log(
        "\nRESULT: FAIL"
    );

    process.exitCode =
        1;

}
else {

    console.log(
        "\nRESULT: PASS"
    );

}