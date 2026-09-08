import {
    ScientificCompositionHarmonyAssessmentEngine
} from "../laboratory/scientific-composition-harmony/ScientificCompositionHarmonyAssessmentEngine.js";


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


const participantIds = [
    "ERC-1001",
    "ERC-1002",
    "ERC-1003"
];


const boundaryOwner =
    new Map([
        [
            "BOUNDARY-ERC-1001",
            "ERC-1001"
        ],
        [
            "BOUNDARY-ERC-1002",
            "ERC-1002"
        ],
        [
            "BOUNDARY-ERC-1003",
            "ERC-1003"
        ]
    ]);


function participant(
    participantId:
        string
): any {

    return {

        participantId,

        profileId:
            `PROFILE-${participantId}`,

        sourceId:
            `SOURCE-${participantId}`,

        contributions:
            [],

        boundaries: [
            {
                boundaryId:
                    `BOUNDARY-${participantId}`,

                participantId,

                kind:
                    "SOURCE_CONSTRAINT",

                subject:
                    `BOUNDARY:${participantId}`,

                evidenceIds: [
                    `BOUNDARY-EVIDENCE-${participantId}`
                ]
            }
        ],

        needs:
            []

    };

}


const envelope:
    any = {

        envelopeId:
            "ENVELOPE-N",

        setId:
            "SET-N",

        candidateGraphId:
            "CANDIDATE-GRAPH-N",

        candidateEvaluationGraphId:
            "CANDIDATE-EVALUATION-GRAPH-N",

        objectiveId:
            "OBJECTIVE-N",

        participants:
            participantIds.map(
                participant
            ),

        participantIds,

        relations: [
            {
                candidateId:
                    "LOCAL-SUPPORT",

                compatibilityPolarity:
                    "SUPPORT"
            },
            {
                candidateId:
                    "LOCAL-CHALLENGE",

                compatibilityPolarity:
                    "CHALLENGE"
            },
            {
                candidateId:
                    "LOCAL-INCONCLUSIVE",

                compatibilityPolarity:
                    "INCONCLUSIVE"
            }
        ],

        boundaryRegions: [
            {
                boundaryId:
                    "BOUNDARY-ERC-1001",

                candidateEvidenceStatus:
                    "PRESERVED_IN_CANDIDATE_EVIDENCE"
            },
            {
                boundaryId:
                    "BOUNDARY-ERC-1002",

                candidateEvidenceStatus:
                    "VIOLATED_IN_CANDIDATE_EVIDENCE"
            },
            {
                boundaryId:
                    "BOUNDARY-ERC-1003",

                candidateEvidenceStatus:
                    "UNEVALUATED_IN_CANDIDATE_EVIDENCE"
            }
        ],

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

        isolatedParticipantIds:
            [],

        errors:
            []

    };


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


function evaluationTargetId(
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


function evidenceBindingId(
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


function knownBoundaryIds(
    participants:
        string[]
): string[] {

    return participants
        .map(
            participantId =>
                `BOUNDARY-${participantId}`
        )
        .sort();

}


function configuration(
    configurationId:
        string,
    kind:
        "FULL_SET" |
        "STRICT_SUBSET",
    participants:
        string[],
    readiness:
        "READY_FOR_GLOBAL_EVALUATION" |
        "BLOCKED" =
        "READY_FOR_GLOBAL_EVALUATION"
): any {

    const ready =
        readiness ===
        "READY_FOR_GLOBAL_EVALUATION";


    return {

        configurationId,

        envelopeId:
            "ENVELOPE-N",

        setId:
            "SET-N",

        objectiveId:
            "OBJECTIVE-N",

        kind,

        participantIds:
            [...participants],

        relations:
            ready
                ? [
                    {
                        candidateId:
                            `FUNCTIONAL-${configurationId}`
                    }
                ]
                : [],

        selectedFunctionalCandidateIds:
            ready
                ? [
                    `FUNCTIONAL-${configurationId}`
                ]
                : [],

        fulfilledNeedIds:
            [],

        unresolvedNeedIds:
            ready
                ? []
                : [
                    `UNRESOLVED-${configurationId}`
                ],

        objectiveCoverage: [
            {
                requiredSubject:
                    "OBJECTIVE-SUBJECT",

                status:
                    ready
                        ? "COVERED"
                        : "UNRESOLVED",

                providerParticipantIds:
                    ready
                        ? [
                            participants[
                                participants.length -
                                1
                            ]
                        ]
                        : [],

                contributionIds:
                    ready
                        ? [
                            `OBJECTIVE-CONTRIBUTION-${configurationId}`
                        ]
                        : []
            }
        ],

        unresolvedObjectiveSubjects:
            ready
                ? []
                : [
                    "OBJECTIVE-SUBJECT"
                ],

        knownBoundaryIds:
            knownBoundaryIds(
                participants
            ),

        blockers:
            ready
                ? []
                : [
                    "UNRESOLVED_NEEDS"
                ],

        readiness,

        globalEvaluationStatus:
            "UNEVALUATED"

    };

}


function solution(
    fullConfigurations:
        any[],
    subsetConfigurations:
        any[]
): any {

    return {

        solutionId:
            "SOLUTION-N",

        envelopeId:
            "ENVELOPE-N",

        setId:
            "SET-N",

        objectiveId:
            "OBJECTIVE-N",

        participantIds:
            [...participantIds],

        fullConfigurations,

        subsetConfigurations,

        supportedFunctionalCandidateIds:
            [],

        documentaryCandidateIds:
            [],

        challengedCandidateIds:
            [],

        inconclusiveCandidateIds:
            [],

        statistics:
            {},

        resolutionStatus:
            fullConfigurations.some(
                item =>
                    item.readiness ===
                    "READY_FOR_GLOBAL_EVALUATION"
            )
                ? "READY_FULL_CONFIGURATION"
                : subsetConfigurations.length >
                    0
                    ? "PARTIAL_CONFIGURATION_ONLY"
                    : "UNRESOLVED_CANDIDATE_TOPOLOGY"

    };

}


function solver(
    fullConfigurations:
        any[],
    subsetConfigurations:
        any[]
): any {

    return {

        solutions: [
            solution(
                fullConfigurations,
                subsetConfigurations
            )
        ],

        errors:
            []

    };

}


function runAssessment(
    configurationValue:
        any,
    runId:
        string,
    polarity:
        "SUPPORT" |
        "CHALLENGE"
): any {

    const boundaries =
        configurationValue.knownBoundaryIds;


    const boundaryEvaluations =
        boundaries.map(
            (
                boundaryId:
                    string,
                index:
                    number
            ) => {

                const violated =
                    polarity ===
                        "CHALLENGE" &&
                    index ===
                        0;


                return {

                    boundaryId,

                    participantId:
                        boundaryOwner.get(
                            boundaryId
                        ),

                    status:
                        violated
                            ? "VIOLATED"
                            : "PRESERVED",

                    observationIds: [
                        `OBS-${runId}-${boundaryId}`
                    ],

                    evidenceIds: [
                        `EVIDENCE-${runId}-${boundaryId}`
                    ]

                };

            }
        );


    return {

        runId,

        boundaryEvaluations,

        preserved:
            boundaryEvaluations.filter(
                (
                    item:
                        any
                ) =>
                    item.status ===
                    "PRESERVED"
            ).length,

        violated:
            boundaryEvaluations.filter(
                (
                    item:
                        any
                ) =>
                    item.status ===
                    "VIOLATED"
            ).length,

        unevaluated:
            0,

        scientificPolarity:
            polarity

    };

}


function binding(
    configurationValue:
        any,
    polarity:
        "SUPPORT" |
        "CHALLENGE" |
        "INCONCLUSIVE"
): any {

    const graphId =
        configurationGraphId(
            configurationValue.configurationId
        );

    const targetId =
        evaluationTargetId(
            configurationValue.configurationId,
            graphId
        );

    const bindingId =
        evidenceBindingId(
            targetId,
            graphId
        );

    const assessmentId =
        `GLOBAL-ASSESSMENT-${configurationValue.configurationId}`;


    if (
        polarity ===
        "INCONCLUSIVE"
    ) {

        return {

            bindingId,

targetId,

            configurationId:
                configurationValue.configurationId,

            envelopeId:
                configurationValue.envelopeId,

            setId:
                configurationValue.setId,

            objectiveId:
                configurationValue.objectiveId,

            graphId,

            observationIds:
                [],

            runIds:
                [],

            evaluation: {

                assessment: {

                    assessmentId,

                    graphId,

                    runAssessments:
                        [],

                    scientificPolarity:
                        "INCONCLUSIVE"

                },

                errors:
                    []

            },

            status:
                "EVALUATED"

        };

    }


    const runId =
        `RUN-${configurationValue.configurationId}`;

    const run =
        runAssessment(
            configurationValue,
            runId,
            polarity
        );


    return {

        bindingId,

targetId,

        configurationId:
            configurationValue.configurationId,

        envelopeId:
            configurationValue.envelopeId,

        setId:
            configurationValue.setId,

        objectiveId:
            configurationValue.objectiveId,

        graphId,

        observationIds:
            run.boundaryEvaluations
                .flatMap(
                    (
                        item:
                            any
                    ) =>
                        item.observationIds
                )
                .sort(),

        runIds: [
            runId
        ],

        evaluation: {

            assessment: {

                assessmentId,

                graphId,

                runAssessments: [
                    run
                ],

                scientificPolarity:
                    polarity,

                ...(
                    polarity ===
                    "SUPPORT"
                        ? {
                            supportingRunId:
                                runId
                        }
                        : {}
                )

            },

            errors:
                []

        },

        status:
            "EVALUATED"

    };

}


function bindings(
    values:
        any[]
): any {

    return {

        bindings:
            values,

        errors:
            []

    };

}


const engine =
    new ScientificCompositionHarmonyAssessmentEngine();


console.log(
    "\nSCIENTIFIC COMPOSITION HARMONY â€” SOLVER-AWARE RUNTIME"
);
console.log(
    "------------------------------------------------------"
);


/*
 * ------------------------------------------------------------
 * FULL
 * ------------------------------------------------------------
 */

const fullConfiguration =
    configuration(
        "CONFIG-FULL-SUPPORT",
        "FULL_SET",
        participantIds
    );


const full =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    fullConfiguration,
                    "SUPPORT"
                )
            ])

    });


check(
    "VALID SOLVER-AWARE HARMONY BUILD HAS NO ERRORS",
    full.errors.length ===
        0
);


check(
    "EXACT SOLVER FULL CONFIGURATION WITH GLOBAL SUPPORT PRODUCES FULL",
    full.assessments[0]
        .harmonyStatus ===
        "FULL"
);


check(
    "FULL PRESERVES EXACT CONFIGURATION ID",
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .configurationId ===
        "CONFIG-FULL-SUPPORT"
);


check(
    "FULL PRESERVES EXACT BINDING GRAPH AND SUPPORTING RUN",
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .graphId ===
        configurationGraphId(
            "CONFIG-FULL-SUPPORT"
        ) &&
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .targetId ===
        evaluationTargetId(
            "CONFIG-FULL-SUPPORT",
            configurationGraphId(
                "CONFIG-FULL-SUPPORT"
            )
        ) &&
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .bindingId ===
        evidenceBindingId(
            evaluationTargetId(
                "CONFIG-FULL-SUPPORT",
                configurationGraphId(
                    "CONFIG-FULL-SUPPORT"
                )
            ),
            configurationGraphId(
                "CONFIG-FULL-SUPPORT"
            )
        ) &&
    full.assessments[0]
        .fullConfigurationEvidence[0]
        .supportingRunId ===
        "RUN-CONFIG-FULL-SUPPORT"
);


/*
 * ------------------------------------------------------------
 * ALTERNATIVE FULL ROUTES
 * ------------------------------------------------------------
 */

const challengedAlternative =
    configuration(
        "CONFIG-FULL-CHALLENGE",
        "FULL_SET",
        participantIds
    );


const alternatives =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    challengedAlternative,
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    challengedAlternative,
                    "CHALLENGE"
                ),
                binding(
                    fullConfiguration,
                    "SUPPORT"
                )
            ])

    });


check(
    "SUPPORTED FULL ROUTE WINS OVER CHALLENGED ALTERNATIVE",
    alternatives.errors.length ===
        0 &&
    alternatives.assessments[0]
        .harmonyStatus ===
        "FULL"
);


check(
    "ALTERNATIVE FULL CONFIGURATIONS REMAIN INDEPENDENT EVIDENCE",
    alternatives.assessments[0]
        .fullConfigurationEvidence
        .length ===
        2
);


/*
 * ------------------------------------------------------------
 * PARTIAL
 * ------------------------------------------------------------
 */

const blockedFull =
    configuration(
        "CONFIG-FULL-BLOCKED",
        "FULL_SET",
        participantIds,
        "BLOCKED"
    );


const supportedSubset =
    configuration(
        "CONFIG-SUBSET-SUPPORT",
        "STRICT_SUBSET",
        [
            "ERC-1001",
            "ERC-1002"
        ]
    );


const partial =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    blockedFull
                ],
                [
                    supportedSubset
                ]
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    supportedSubset,
                    "SUPPORT"
                )
            ])

    });


check(
    "SUPPORTED STRICT SOLVER SUBSET PRODUCES PARTIAL",
    partial.errors.length ===
        0 &&
    partial.assessments[0]
        .harmonyStatus ===
        "PARTIAL"
);


check(
    "PARTIAL PRESERVES EXACT SUPPORTED SUBSET CONFIGURATION",
    partial.assessments[0]
        .supportedSubsets[0]
        .configurationId ===
        "CONFIG-SUBSET-SUPPORT" &&
    JSON.stringify(
        partial.assessments[0]
            .supportedSubsets[0]
            .participantIds
    ) ===
        JSON.stringify([
            "ERC-1001",
            "ERC-1002"
        ])
);


check(
    "BLOCKED FULL CONFIGURATION REMAINS EXPLICIT",
    JSON.stringify(
        partial.assessments[0]
            .blockedFullConfigurationIds
    ) ===
        JSON.stringify([
            "CONFIG-FULL-BLOCKED"
        ])
);


/*
 * ------------------------------------------------------------
 * CHALLENGED
 * ------------------------------------------------------------
 */

const challengedFullOne =
    configuration(
        "CONFIG-CHALLENGE-ONE",
        "FULL_SET",
        participantIds
    );

const challengedFullTwo =
    configuration(
        "CONFIG-CHALLENGE-TWO",
        "FULL_SET",
        participantIds
    );


const challenged =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    challengedFullOne,
                    challengedFullTwo
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    challengedFullOne,
                    "CHALLENGE"
                ),
                binding(
                    challengedFullTwo,
                    "CHALLENGE"
                )
            ])

    });


check(
    "ALL EXACT FULL SOLVER CONFIGURATIONS CHALLENGED PRODUCES CHALLENGED",
    challenged.errors.length ===
        0 &&
    challenged.assessments[0]
        .harmonyStatus ===
        "CHALLENGED"
);


/*
 * A blocked alternative prevents the stronger CHALLENGED claim.
 */

const challengeWithBlockedAlternative =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    challengedFullOne,
                    blockedFull
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    challengedFullOne,
                    "CHALLENGE"
                )
            ])

    });


check(
    "BLOCKED FULL ALTERNATIVE PREVENTS GLOBAL CHALLENGED OVERCLAIM",
    challengeWithBlockedAlternative.errors.length ===
        0 &&
    challengeWithBlockedAlternative
        .assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


/*
 * ------------------------------------------------------------
 * INCONCLUSIVE WITH REAL EMPTY EVIDENCE BINDING
 * ------------------------------------------------------------
 */

const inconclusiveFull =
    configuration(
        "CONFIG-FULL-INCONCLUSIVE",
        "FULL_SET",
        participantIds
    );


const inconclusive =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    inconclusiveFull
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                binding(
                    inconclusiveFull,
                    "INCONCLUSIVE"
                )
            ])

    });


check(
    "READY FULL CONFIGURATION WITH NO OBSERVED RUN REMAINS INCONCLUSIVE",
    inconclusive.errors.length ===
        0 &&
    inconclusive.assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


check(
    "INCONCLUSIVE BINDING DOES NOT INVENT RUN OR SUPPORT",
    inconclusive.assessments[0]
        .fullConfigurationEvidence[0]
        .runIds
        .length ===
        0 &&
    inconclusive.assessments[0]
        .fullConfigurationEvidence[0]
        .scientificPolarity ===
        "INCONCLUSIVE"
);


/*
 * ------------------------------------------------------------
 * REAL-LIKE DOCUMENTARY-ONLY SOLVER STATE
 * ------------------------------------------------------------
 */

const noFunctionalConfiguration =
    engine.assess({

        envelopes,

        solver:
            solver(
                [],
                []
            ),

        globalEvidenceBindings:
            bindings(
                []
            )

    });


check(
    "NO SOLVER CONFIGURATION REMAINS INCONCLUSIVE",
    noFunctionalConfiguration.errors.length ===
        0 &&
    noFunctionalConfiguration
        .assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


check(
    "LOCAL CANDIDATE POLARITY NEVER BECOMES GLOBAL HARMONY",
    noFunctionalConfiguration
        .assessments[0]
        .supportedCandidateIds
        .includes(
            "LOCAL-SUPPORT"
        ) &&
    noFunctionalConfiguration
        .assessments[0]
        .harmonyStatus ===
        "INCONCLUSIVE"
);


/*
 * ------------------------------------------------------------
 * READY CONFIGURATION MUST HAVE HITO 21 BINDING
 * ------------------------------------------------------------
 */

const missingBinding =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings(
                []
            )

    });


check(
    "READY SOLVER CONFIGURATION WITHOUT GLOBAL BINDING FAILS CLOSED",
    missingBinding.errors.length >
        0 &&
    missingBinding.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * FAKE SUPPORT FAILS CLOSED
 * ------------------------------------------------------------
 */

const fakeSupportBinding =
    binding(
        fullConfiguration,
        "SUPPORT"
    );


delete fakeSupportBinding
    .evaluation
    .assessment
    .supportingRunId;


const fakeSupport =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                fakeSupportBinding
            ])

    });


check(
    "GLOBAL SUPPORT WITHOUT SUPPORTING RUN FAILS CLOSED",
    fakeSupport.errors.length >
        0 &&
    fakeSupport.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * FOREIGN CONFIGURATION FAILS CLOSED
 * ------------------------------------------------------------
 */

const foreignBinding =
    binding(
        fullConfiguration,
        "SUPPORT"
    );


foreignBinding.configurationId =
    "CONFIG-NOT-IN-SOLVER";


const foreign =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                foreignBinding
            ])

    });


check(
    "BINDING FOR UNKNOWN SOLVER CONFIGURATION FAILS CLOSED",
    foreign.errors.length >
        0 &&
    foreign.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * GRAPH IDENTITY FAILS CLOSED
 * ------------------------------------------------------------
 */

const wrongGraphBinding =
    binding(
        fullConfiguration,
        "SUPPORT"
    );


wrongGraphBinding
    .evaluation
    .assessment
    .graphId =
    "OTHER-GRAPH";


const wrongGraph =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                wrongGraphBinding
            ])

    });


check(
    "BINDING GRAPH AND GLOBAL ASSESSMENT GRAPH MUST MATCH EXACTLY",
    wrongGraph.errors.length >
        0 &&
    wrongGraph.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * CONFIGURATION -> GRAPH PROVENANCE MUST BE EXACT
 * ------------------------------------------------------------
 */

const foreignGraphBinding =
    binding(
        fullConfiguration,
        "SUPPORT"
    );


const foreignButConsistentGraphId =
    "FOREIGN-GRAPH-ID";

const foreignButConsistentTargetId =
    evaluationTargetId(
        fullConfiguration.configurationId,
        foreignButConsistentGraphId
    );

const foreignButConsistentBindingId =
    evidenceBindingId(
        foreignButConsistentTargetId,
        foreignButConsistentGraphId
    );


foreignGraphBinding.graphId =
    foreignButConsistentGraphId;

foreignGraphBinding.targetId =
    foreignButConsistentTargetId;

foreignGraphBinding.bindingId =
    foreignButConsistentBindingId;

foreignGraphBinding
    .evaluation
    .assessment
    .graphId =
    foreignButConsistentGraphId;


const foreignGraphProvenance =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                foreignGraphBinding
            ])

    });


check(
    "INTERNALLY CONSISTENT FOREIGN GRAPH CANNOT MASQUERADE AS SOLVER CONFIGURATION",
    foreignGraphProvenance.errors.length >
        0 &&
    foreignGraphProvenance.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * SPLIT / INCOMPLETE GLOBAL RUN CANNOT BE FORGED INTO SUPPORT
 * ------------------------------------------------------------
 */

const malformedIncomplete =
    binding(
        fullConfiguration,
        "SUPPORT"
    );


malformedIncomplete
    .evaluation
    .assessment
    .runAssessments[0]
    .boundaryEvaluations
    .pop();

malformedIncomplete
    .evaluation
    .assessment
    .runAssessments[0]
    .preserved =
    2;

malformedIncomplete.observationIds =
    malformedIncomplete
        .evaluation
        .assessment
        .runAssessments[0]
        .boundaryEvaluations
        .flatMap(
            (
                item:
                    any
            ) =>
                item.observationIds
        );


const incompleteSupport =
    engine.assess({

        envelopes,

        solver:
            solver(
                [
                    fullConfiguration
                ],
                []
            ),

        globalEvidenceBindings:
            bindings([
                malformedIncomplete
            ])

    });


check(
    "INCOMPLETE GLOBAL BOUNDARY SET CANNOT CLAIM SUPPORT",
    incompleteSupport.errors.length >
        0 &&
    incompleteSupport.assessments.length ===
        0
);


/*
 * ------------------------------------------------------------
 * VISUALIZATION CONTEXT REMAINS LOCAL ONLY
 * ------------------------------------------------------------
 */

check(
    "LOCAL ENVELOPE CANDIDATE STATES ARE PRESERVED FOR VISUALIZATION",
    JSON.stringify(
        full.assessments[0]
            .supportedCandidateIds
    ) ===
        JSON.stringify([
            "LOCAL-SUPPORT"
        ]) &&
    JSON.stringify(
        full.assessments[0]
            .challengedCandidateIds
    ) ===
        JSON.stringify([
            "LOCAL-CHALLENGE"
        ]) &&
    JSON.stringify(
        full.assessments[0]
            .inconclusiveCandidateIds
    ) ===
        JSON.stringify([
            "LOCAL-INCONCLUSIVE"
        ])
);


check(
    "BOUNDARY REGIONS REMAIN VISUALIZATION CONTEXT",
    JSON.stringify(
        full.assessments[0]
            .preservedBoundaryRegionIds
    ) ===
        JSON.stringify([
            "BOUNDARY-ERC-1001"
        ]) &&
    JSON.stringify(
        full.assessments[0]
            .violatedBoundaryRegionIds
    ) ===
        JSON.stringify([
            "BOUNDARY-ERC-1002"
        ]) &&
    JSON.stringify(
        full.assessments[0]
            .unevaluatedBoundaryRegionIds
    ) ===
        JSON.stringify([
            "BOUNDARY-ERC-1003"
        ])
);


/*
 * ------------------------------------------------------------
 * DETERMINISM
 * ------------------------------------------------------------
 */

const reverse =
    engine.assess({

        envelopes: {

            ...envelopes,

            envelopes:
                [...envelopes.envelopes]
                    .reverse()

        },

        solver: {

            ...solver(
                [
                    fullConfiguration
                ],
                []
            ),

            solutions:
                [...solver(
                    [
                        fullConfiguration
                    ],
                    []
                ).solutions]
                    .reverse()

        },

        globalEvidenceBindings: {

            ...bindings([
                binding(
                    fullConfiguration,
                    "SUPPORT"
                )
            ]),

            bindings:
                [...bindings([
                    binding(
                        fullConfiguration,
                        "SUPPORT"
                    )
                ]).bindings]
                    .reverse()

        }

    });


check(
    "SOLVER-AWARE HARMONY IS DETERMINISTIC",
    JSON.stringify(
        full
    ) ===
        JSON.stringify(
            reverse
        )
);


check(
    "HARMONY DOES NOT EXPOSE SCIENTIFIC POLARITY AS ITS OWN VERDICT",
    !(
        "scientificPolarity" in
        full.assessments[0]
    ) &&
    full.assessments[0]
        .evidenceBasis ===
        "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"
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