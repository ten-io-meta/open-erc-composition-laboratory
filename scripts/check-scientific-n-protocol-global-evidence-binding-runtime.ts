import {
    ScientificNProtocolGlobalEvidenceBindingEngine
} from "../laboratory/scientific-n-protocol-global-evidence-binding/ScientificNProtocolGlobalEvidenceBindingEngine.js";


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


const graph:
    any = {

        graphId:
            "GRAPH-A-B-C",

        objectiveId:
            "OBJECTIVE-N",

        nodes: [
            {
                participantId:
                    "ERC-A",

                profileId:
                    "PROFILE-A",

                sourceId:
                    "SOURCE-A",

                contributionIds: [
                    "CONTRIBUTION-A"
                ],

                boundaryIds: [
                    "BOUNDARY-A"
                ],

                needIds: [
                    "NEED-A"
                ]
            },

            {
                participantId:
                    "ERC-B",

                profileId:
                    "PROFILE-B",

                sourceId:
                    "SOURCE-B",

                contributionIds: [
                    "CONTRIBUTION-B"
                ],

                boundaryIds: [
                    "BOUNDARY-B"
                ],

                needIds: [
                    "NEED-B"
                ]
            },

            {
                participantId:
                    "ERC-C",

                profileId:
                    "PROFILE-C",

                sourceId:
                    "SOURCE-C",

                contributionIds: [
                    "CONTRIBUTION-C"
                ],

                boundaryIds: [
                    "BOUNDARY-C"
                ],

                needIds:
                    []
            }
        ],

        edges: [
            {
                edgeId:
                    "EDGE-A-B",

                matchId:
                    "MATCH-A-B",

                consumerParticipantId:
                    "ERC-A",

                providerParticipantId:
                    "ERC-B",

                needId:
                    "NEED-A",

                contributionId:
                    "CONTRIBUTION-B",

                compatibilityAssessmentId:
                    "COMPAT-A-B",

                compatibilityPolarity:
                    "SUPPORT",

                boundaryIds: [
                    "BOUNDARY-A",
                    "BOUNDARY-B"
                ],

                evidenceIds: [
                    "EDGE-EVIDENCE-A-B"
                ]
            },

            {
                edgeId:
                    "EDGE-B-C",

                matchId:
                    "MATCH-B-C",

                consumerParticipantId:
                    "ERC-B",

                providerParticipantId:
                    "ERC-C",

                needId:
                    "NEED-B",

                contributionId:
                    "CONTRIBUTION-C",

                compatibilityAssessmentId:
                    "COMPAT-B-C",

                compatibilityPolarity:
                    "SUPPORT",

                boundaryIds: [
                    "BOUNDARY-B",
                    "BOUNDARY-C"
                ],

                evidenceIds: [
                    "EDGE-EVIDENCE-B-C"
                ]
            }
        ],

        unresolvedNeedIds:
            [],

        objectiveCoverage: [
            {
                requiredSubject:
                    "OBJECTIVE-SUBJECT",

                status:
                    "COVERED",

                providerParticipantIds: [
                    "ERC-C"
                ],

                contributionIds: [
                    "CONTRIBUTION-C"
                ]
            }
        ],

        statistics: {

            nodes:
                3,

            edges:
                2,

            supportedEdges:
                2,

            challengedEdges:
                0,

            inconclusiveEdges:
                0,

            unresolvedNeeds:
                0,

            unresolvedObjectiveSubjects:
                0

        },

        scientificPolarity:
            "INCONCLUSIVE"

    };


const target:
    any = {

        targetId:
            "TARGET-A-B-C",

        configurationId:
            "CONFIGURATION-A-B-C",

        envelopeId:
            "ENVELOPE-A-B-C",

        setId:
            "SET-A-B-C",

        objectiveId:
            "OBJECTIVE-N",

        graph,

        status:
            "READY_FOR_GLOBAL_EVALUATION"

    };


const targets:
    any = {

        targets: [
            target
        ],

        blockedConfigurationIds:
            [],

        errors:
            []

    };


function observation(
    observationId:
        string,
    runId:
        string,
    boundaryId:
        string,
    verdict:
        "PRESERVED" |
        "VIOLATED"
): any {

    return {

        observationId,

        graphId:
            "GRAPH-A-B-C",

        runId,

        boundaryId,

        verdict,

        evidenceIds: [
            `EVIDENCE-${observationId}`
        ]

    };

}


const engine =
    new ScientificNProtocolGlobalEvidenceBindingEngine();


console.log(
    "\nSCIENTIFIC N-PROTOCOL GLOBAL EVIDENCE BINDING — RUNTIME"
);
console.log(
    "--------------------------------------------------------"
);


/*
 * ------------------------------------------------------------
 * SAME-RUN COMPLETE PRESERVATION -> SUPPORT
 * ------------------------------------------------------------
 */

const supportObservations =
    [
        observation(
            "OBS-A",
            "RUN-COMPLETE",
            "BOUNDARY-A",
            "PRESERVED"
        ),

        observation(
            "OBS-B",
            "RUN-COMPLETE",
            "BOUNDARY-B",
            "PRESERVED"
        ),

        observation(
            "OBS-C",
            "RUN-COMPLETE",
            "BOUNDARY-C",
            "PRESERVED"
        )
    ];


const supported =
    engine.bindAndEvaluate({

        targets,

        observations:
            supportObservations

    });


check(
    "VALID GLOBAL EVIDENCE BINDING HAS NO ERRORS",
    supported.errors.length ===
        0
);


check(
    "ONE TARGET PRODUCES ONE BINDING",
    supported.bindings.length ===
        1
);


const supportBinding =
    supported.bindings[0];


check(
    "BINDING PRESERVES EXACT TARGET AND GRAPH",
    supportBinding.targetId ===
        "TARGET-A-B-C" &&
    supportBinding.configurationId ===
        "CONFIGURATION-A-B-C" &&
    supportBinding.graphId ===
        "GRAPH-A-B-C"
);


check(
    "ALL OBSERVATIONS ARE BOUND TO EXACT GRAPH",
    JSON.stringify(
        supportBinding.observationIds
    ) ===
        JSON.stringify([
            "OBS-A",
            "OBS-B",
            "OBS-C"
        ])
);


check(
    "OBSERVED RUN ID IS PRESERVED",
    JSON.stringify(
        supportBinding.runIds
    ) ===
        JSON.stringify([
            "RUN-COMPLETE"
        ])
);


check(
    "COMPLETE SAME-RUN PRESERVATION PRODUCES GLOBAL SUPPORT",
    supportBinding
        .evaluation
        .assessment
        ?.scientificPolarity ===
        "SUPPORT"
);


check(
    "GLOBAL SUPPORT PRESERVES EXACT SUPPORTING RUN",
    supportBinding
        .evaluation
        .assessment
        ?.supportingRunId ===
        "RUN-COMPLETE"
);


check(
    "ALL THREE BOUNDARIES ARE PRESERVED IN SUPPORTING RUN",
    supportBinding
        .evaluation
        .assessment
        ?.runAssessments[0]
        .preserved ===
        3 &&
    supportBinding
        .evaluation
        .assessment
        ?.runAssessments[0]
        .violated ===
        0 &&
    supportBinding
        .evaluation
        .assessment
        ?.runAssessments[0]
        .unevaluated ===
        0
);


/*
 * ------------------------------------------------------------
 * SPLIT RUNS MUST NEVER MERGE
 * ------------------------------------------------------------
 */

const splitRuns =
    engine.bindAndEvaluate({

        targets,

        observations: [
            observation(
                "OBS-SPLIT-A",
                "RUN-ONE",
                "BOUNDARY-A",
                "PRESERVED"
            ),

            observation(
                "OBS-SPLIT-B",
                "RUN-ONE",
                "BOUNDARY-B",
                "PRESERVED"
            ),

            observation(
                "OBS-SPLIT-C",
                "RUN-TWO",
                "BOUNDARY-C",
                "PRESERVED"
            )
        ]

    });


check(
    "SPLIT RUN EVIDENCE HAS NO BINDING ERRORS",
    splitRuns.errors.length ===
        0
);


check(
    "SPLIT INCOMPLETE RUNS REMAIN GLOBALLY INCONCLUSIVE",
    splitRuns.bindings[0]
        .evaluation
        .assessment
        ?.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "SPLIT RUNS REMAIN DISTINCT",
    JSON.stringify(
        splitRuns.bindings[0]
            .runIds
    ) ===
        JSON.stringify([
            "RUN-ONE",
            "RUN-TWO"
        ]) &&
    splitRuns.bindings[0]
        .evaluation
        .assessment
        ?.runAssessments
        .length ===
        2
);


check(
    "INCOMPLETE RUNS DO NOT CREATE SUPPORTING RUN",
    splitRuns.bindings[0]
        .evaluation
        .assessment
        ?.supportingRunId ===
        undefined
);


/*
 * ------------------------------------------------------------
 * VIOLATION -> CHALLENGE
 * ------------------------------------------------------------
 */

const challenged =
    engine.bindAndEvaluate({

        targets,

        observations: [
            observation(
                "OBS-CHALLENGE-A",
                "RUN-CHALLENGE",
                "BOUNDARY-A",
                "PRESERVED"
            ),

            observation(
                "OBS-CHALLENGE-B",
                "RUN-CHALLENGE",
                "BOUNDARY-B",
                "VIOLATED"
            ),

            observation(
                "OBS-CHALLENGE-C",
                "RUN-CHALLENGE",
                "BOUNDARY-C",
                "PRESERVED"
            )
        ]

    });


check(
    "REAL BOUNDARY VIOLATION PRODUCES GLOBAL CHALLENGE",
    challenged.errors.length ===
        0 &&
    challenged.bindings[0]
        .evaluation
        .assessment
        ?.scientificPolarity ===
        "CHALLENGE"
);


/*
 * ------------------------------------------------------------
 * NO EVIDENCE -> INCONCLUSIVE
 * ------------------------------------------------------------
 */

const absentEvidence =
    engine.bindAndEvaluate({

        targets,

        observations:
            []

    });


check(
    "ABSENCE OF GLOBAL EVIDENCE IS VALID INPUT",
    absentEvidence.errors.length ===
        0
);


check(
    "ABSENCE OF GLOBAL EVIDENCE REMAINS INCONCLUSIVE",
    absentEvidence.bindings[0]
        .evaluation
        .assessment
        ?.scientificPolarity ===
        "INCONCLUSIVE"
);


check(
    "BINDING DOES NOT INVENT RUN IDS",
    absentEvidence.bindings[0]
        .runIds
        .length ===
        0 &&
    absentEvidence.bindings[0]
        .evaluation
        .assessment
        ?.runAssessments
        .length ===
        0
);


/*
 * ------------------------------------------------------------
 * FOREIGN GRAPH FAIL CLOSED
 * ------------------------------------------------------------
 */

const foreignGraph =
    engine.bindAndEvaluate({

        targets,

        observations: [
            {
                ...observation(
                    "OBS-FOREIGN",
                    "RUN-FOREIGN",
                    "BOUNDARY-A",
                    "PRESERVED"
                ),

                graphId:
                    "GRAPH-OTHER"
            }
        ]

    });


check(
    "OBSERVATION FOR UNKNOWN GRAPH FAILS CLOSED",
    foreignGraph.errors.length >
        0 &&
    foreignGraph.bindings.length ===
        0
);


/*
 * ------------------------------------------------------------
 * UNKNOWN BOUNDARY FAIL CLOSED
 * ------------------------------------------------------------
 */

const unknownBoundary =
    engine.bindAndEvaluate({

        targets,

        observations: [
            observation(
                "OBS-UNKNOWN-BOUNDARY",
                "RUN-UNKNOWN",
                "BOUNDARY-NOT-IN-GRAPH",
                "PRESERVED"
            )
        ]

    });


check(
    "OBSERVATION FOR UNKNOWN GRAPH BOUNDARY FAILS CLOSED",
    unknownBoundary.errors.length >
        0 &&
    unknownBoundary.bindings.length ===
        0
);


/*
 * ------------------------------------------------------------
 * DUPLICATE OBSERVATION FAIL CLOSED
 * ------------------------------------------------------------
 */

const duplicateObservation =
    engine.bindAndEvaluate({

        targets,

        observations: [
            observation(
                "OBS-DUPLICATE",
                "RUN-DUPLICATE",
                "BOUNDARY-A",
                "PRESERVED"
            ),

            observation(
                "OBS-DUPLICATE",
                "RUN-DUPLICATE",
                "BOUNDARY-B",
                "PRESERVED"
            )
        ]

    });


check(
    "DUPLICATE OBSERVATION ID FAILS CLOSED",
    duplicateObservation.errors.length >
        0 &&
    duplicateObservation.bindings.length ===
        0
);


/*
 * ------------------------------------------------------------
 * EMPTY RUN ID FAIL CLOSED
 * ------------------------------------------------------------
 */

const emptyRun =
    engine.bindAndEvaluate({

        targets,

        observations: [
            observation(
                "OBS-EMPTY-RUN",
                "",
                "BOUNDARY-A",
                "PRESERVED"
            )
        ]

    });


check(
    "EMPTY RUN ID IS NEVER MANUFACTURED OR ACCEPTED",
    emptyRun.errors.length >
        0 &&
    emptyRun.bindings.length ===
        0
);


/*
 * ------------------------------------------------------------
 * DETERMINISM
 * ------------------------------------------------------------
 */

const reversed =
    engine.bindAndEvaluate({

        targets: {

            ...targets,

            targets:
                [...targets.targets]
                    .reverse()

        },

        observations:
            [...supportObservations]
                .reverse()
                .map(
                    item => ({

                        ...item,

                        evidenceIds:
                            [...item.evidenceIds]
                                .reverse()

                    })
                )

    });


check(
    "GLOBAL EVIDENCE BINDING IS DETERMINISTIC",
    JSON.stringify(
        supported
    ) ===
        JSON.stringify(
            reversed
        )
);


check(
    "BINDING DOES NOT EXPOSE ITS OWN SCIENTIFIC OR HARMONY VERDICT",
    !(
        "scientificPolarity" in
        supportBinding
    ) &&
    !(
        "harmonyStatus" in
        supportBinding
    ) &&
    supportBinding.status ===
        "EVALUATED"
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