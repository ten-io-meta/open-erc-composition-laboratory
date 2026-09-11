import type {
    ScientificCompositionEnvelopeResult
} from "../laboratory/scientific-composition-envelope/ScientificCompositionEnvelope.js";

import type {
    ScientificNProtocolCompositionConfiguration,
    ScientificNProtocolCompositionSolverRelation,
    ScientificNProtocolCompositionSolverResult
} from "../laboratory/scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolver.js";

import type {
    ScientificCompositionHarmonyAssessment,
    ScientificCompositionHarmonyResult
} from "../laboratory/scientific-composition-harmony/ScientificCompositionHarmonyAssessment.js";

import {
    ScientificCompositionValueAssessmentEngine
} from "../laboratory/scientific-composition-value/ScientificCompositionValueAssessmentEngine.js";

import {
    SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
} from "../laboratory/scientific-composition-value/ScientificCompositionValueRule.js";


function assert(
    condition:
        unknown,
    message:
        string
): asserts condition {

    if (
        !condition
    ) {

        throw new Error(
            message
        );

    }

}


const participants =
    [
        "PROTOCOL-A",
        "PROTOCOL-B",
        "PROTOCOL-C"
    ];


const relationAB:
    ScientificNProtocolCompositionSolverRelation = {

        candidateId:
            "CANDIDATE-A-B",

        candidateEvaluationEdgeId:
            "EDGE-A-B",

        functionalMatchId:
            "MATCH-A-B",

        sourceParticipantId:
            "PROTOCOL-A",

        targetParticipantId:
            "PROTOCOL-B",

        needId:
            "NEED-AUTHORITY",

        contributionId:
            "CONTRIBUTION-AUTHORITY",

        compatibilityAssessmentId:
            "COMPAT-A-B",

        boundaryIds:
            [
                "BOUNDARY-A",
                "BOUNDARY-B"
            ],

        discoveryEvidenceIds:
            [
                "DISCOVERY-A-B"
            ],

        compatibilityEvidenceIds:
            [
                "COMPAT-EVIDENCE-A-B"
            ],

        compatibilityPolarity:
            "SUPPORT"

    };


const relationAC:
    ScientificNProtocolCompositionSolverRelation = {

        candidateId:
            "CANDIDATE-A-C",

        candidateEvaluationEdgeId:
            "EDGE-A-C",

        functionalMatchId:
            "MATCH-A-C",

        sourceParticipantId:
            "PROTOCOL-A",

        targetParticipantId:
            "PROTOCOL-C",

        needId:
            "NEED-VALUE",

        contributionId:
            "CONTRIBUTION-VALUE",

        compatibilityAssessmentId:
            "COMPAT-A-C",

        boundaryIds:
            [
                "BOUNDARY-A",
                "BOUNDARY-C"
            ],

        discoveryEvidenceIds:
            [
                "DISCOVERY-A-C"
            ],

        compatibilityEvidenceIds:
            [
                "COMPAT-EVIDENCE-A-C"
            ],

        compatibilityPolarity:
            "SUPPORT"

    };


const fullConfiguration:
    ScientificNProtocolCompositionConfiguration = {

        configurationId:
            "CONFIGURATION-FULL",

        envelopeId:
            "ENVELOPE-1",

        setId:
            "SET-1",

        objectiveId:
            "OBJECTIVE-1",

        kind:
            "FULL_SET",

        participantIds:
            participants,

        relations:
            [
                relationAB,
                relationAC
            ],

        selectedFunctionalCandidateIds:
            [
                "CANDIDATE-A-B",
                "CANDIDATE-A-C"
            ],

        fulfilledNeedIds:
            [
                "NEED-AUTHORITY",
                "NEED-VALUE"
            ],

        unresolvedNeedIds:
            [],

        objectiveCoverage:
            [
                {
                    requiredSubject:
                        "AUTHORITY",

                    status:
                        "COVERED",

                    providerParticipantIds:
                        [
                            "PROTOCOL-B"
                        ],

                    contributionIds:
                        [
                            "CONTRIBUTION-AUTHORITY"
                        ]
                },
                {
                    requiredSubject:
                        "VALUE",

                    status:
                        "COVERED",

                    providerParticipantIds:
                        [
                            "PROTOCOL-C"
                        ],

                    contributionIds:
                        [
                            "CONTRIBUTION-VALUE"
                        ]
                }
            ],

        unresolvedObjectiveSubjects:
            [],

        knownBoundaryIds:
            [
                "BOUNDARY-A",
                "BOUNDARY-B",
                "BOUNDARY-C"
            ],

        blockers:
            [],

        readiness:
            "READY_FOR_GLOBAL_EVALUATION",

        globalEvaluationStatus:
            "UNEVALUATED"

    };


const subsetConfiguration:
    ScientificNProtocolCompositionConfiguration = {

        configurationId:
            "CONFIGURATION-SUBSET",

        envelopeId:
            "ENVELOPE-1",

        setId:
            "SET-1",

        objectiveId:
            "OBJECTIVE-1",

        kind:
            "STRICT_SUBSET",

        participantIds:
            [
                "PROTOCOL-A",
                "PROTOCOL-B"
            ],

        relations:
            [
                relationAB
            ],

        selectedFunctionalCandidateIds:
            [
                "CANDIDATE-A-B"
            ],

        fulfilledNeedIds:
            [
                "NEED-AUTHORITY"
            ],

        unresolvedNeedIds:
            [],

        objectiveCoverage:
            [
                {
                    requiredSubject:
                        "AUTHORITY",

                    status:
                        "COVERED",

                    providerParticipantIds:
                        [
                            "PROTOCOL-B"
                        ],

                    contributionIds:
                        [
                            "CONTRIBUTION-AUTHORITY"
                        ]
                }
            ],

        unresolvedObjectiveSubjects:
            [],

        knownBoundaryIds:
            [
                "BOUNDARY-A",
                "BOUNDARY-B"
            ],

        blockers:
            [],

        readiness:
            "READY_FOR_GLOBAL_EVALUATION",

        globalEvaluationStatus:
            "UNEVALUATED"

    };


const envelopes =
    {

        envelopes:
            [
                {
                    envelopeId:
                        "ENVELOPE-1",

                    setId:
                        "SET-1",

                    objectiveId:
                        "OBJECTIVE-1",

                    participantIds:
                        participants
                }
            ],

        errors:
            []

    } as unknown as ScientificCompositionEnvelopeResult;


const solver:
    ScientificNProtocolCompositionSolverResult = {

        solutions:
            [
                {
                    solutionId:
                        "SOLUTION-1",

                    envelopeId:
                        "ENVELOPE-1",

                    setId:
                        "SET-1",

                    objectiveId:
                        "OBJECTIVE-1",

                    participantIds:
                        participants,

                    fullConfigurations:
                        [
                            fullConfiguration
                        ],

                    subsetConfigurations:
                        [
                            subsetConfiguration
                        ],

                    supportedFunctionalCandidateIds:
                        [
                            "CANDIDATE-A-B",
                            "CANDIDATE-A-C"
                        ],

                    documentaryCandidateIds:
                        [],

                    challengedCandidateIds:
                        [],

                    inconclusiveCandidateIds:
                        [],

                    statistics:
                        {
                            participants:
                                3,

                            supportedFunctionalCandidates:
                                2,

                            documentaryCandidates:
                                0,

                            challengedCandidates:
                                0,

                            inconclusiveCandidates:
                                0,

                            fullConfigurations:
                                1,

                            subsetConfigurations:
                                1,

                            readyConfigurations:
                                2,

                            blockedConfigurations:
                                0
                        },

                    resolutionStatus:
                        "READY_FULL_CONFIGURATION"
                }
            ],

        errors:
            []

    };


function harmonyAssessment(
    harmonyStatus:
        ScientificCompositionHarmonyAssessment["harmonyStatus"]
): ScientificCompositionHarmonyAssessment {

    const fullConfigurationEvidence =
        harmonyStatus ===
            "FULL"
            ? [
                {
                    configurationId:
                        "CONFIGURATION-FULL",

                    bindingId:
                        "BINDING-FULL",

                    targetId:
                        "TARGET-FULL",

                    graphId:
                        "GRAPH-FULL",

                    globalAssessmentId:
                        "GLOBAL-FULL",

                    participantIds:
                        participants,

                    scientificPolarity:
                        "SUPPORT" as const,

                    observationIds:
                        [
                            "OBSERVATION-FULL"
                        ],

                    runIds:
                        [
                            "RUN-FULL"
                        ],

                    supportingRunId:
                        "RUN-FULL"
                }
            ]
            : [];


    const supportedSubsets =
        harmonyStatus ===
            "PARTIAL"
            ? [
                {
                    configurationId:
                        "CONFIGURATION-SUBSET",

                    bindingId:
                        "BINDING-SUBSET",

                    targetId:
                        "TARGET-SUBSET",

                    graphId:
                        "GRAPH-SUBSET",

                    globalAssessmentId:
                        "GLOBAL-SUBSET",

                    participantIds:
                        [
                            "PROTOCOL-A",
                            "PROTOCOL-B"
                        ],

                    observationIds:
                        [
                            "OBSERVATION-SUBSET"
                        ],

                    runIds:
                        [
                            "RUN-SUBSET"
                        ],

                    supportingRunId:
                        "RUN-SUBSET"
                }
            ]
            : [];


    return {

        harmonyAssessmentId:
            `HARMONY-${harmonyStatus}`,

        envelopeId:
            "ENVELOPE-1",

        setId:
            "SET-1",

        objectiveId:
            "OBJECTIVE-1",

        participantIds:
            participants,

        harmonyStatus,

        fullConfigurationEvidence,

        supportedSubsets,

        blockedFullConfigurationIds:
            [],

        blockedSubsetConfigurationIds:
            [],

        supportedCandidateIds:
            harmonyStatus ===
                "FULL"
                ? [
                    "CANDIDATE-A-B",
                    "CANDIDATE-A-C"
                ]
                : harmonyStatus ===
                    "PARTIAL"
                    ? [
                        "CANDIDATE-A-B"
                    ]
                    : [],

        challengedCandidateIds:
            harmonyStatus ===
                "CHALLENGED"
                ? [
                    "CANDIDATE-A-B"
                ]
                : [],

        inconclusiveCandidateIds:
            harmonyStatus ===
                "INCONCLUSIVE"
                ? [
                    "CANDIDATE-A-B"
                ]
                : [],

        preservedBoundaryRegionIds:
            harmonyStatus ===
                "FULL"
                ? [
                    "BOUNDARY-A",
                    "BOUNDARY-B",
                    "BOUNDARY-C"
                ]
                : harmonyStatus ===
                    "PARTIAL"
                    ? [
                        "BOUNDARY-A",
                        "BOUNDARY-B"
                    ]
                    : [],

        violatedBoundaryRegionIds:
            harmonyStatus ===
                "CHALLENGED"
                ? [
                    "BOUNDARY-A"
                ]
                : [],

        unevaluatedBoundaryRegionIds:
            harmonyStatus ===
                "INCONCLUSIVE"
                ? [
                    "BOUNDARY-A"
                ]
                : [],

        evidenceBasis:
            "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"

    };

}


function harmonyResult(
    status:
        ScientificCompositionHarmonyAssessment["harmonyStatus"]
): ScientificCompositionHarmonyResult {

    return {

        assessments:
            [
                harmonyAssessment(
                    status
                )
            ],

        errors:
            []

    };

}


const engine =
    new ScientificCompositionValueAssessmentEngine();


const full =
    engine.assess({

        envelopes,

        solver,

        harmony:
            harmonyResult(
                "FULL"
            )

    });


assert(
    full.errors.length ===
        0,
    `FULL assessment returned errors: ${full.errors.join(" | ")}`
);

assert(
    full.assessments.length ===
        1,
    "FULL assessment must produce exactly one value assessment."
);

assert(
    full.assessments[0].valueEvaluationStatus ===
        "ASSESSED",
    "FULL Harmony must produce ASSESSED value status."
);

assert(
    full.assessments[0].findings.filter(
        finding =>
            finding.ruleId ===
            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                .CROSS_PROTOCOL_FUNCTIONAL_COMPLEMENT
    ).length ===
        2,
    "FULL assessment must preserve two supported functional complements."
);

assert(
    full.assessments[0].findings.some(
        finding =>
            finding.ruleId ===
            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                .COMPLETE_OBJECTIVE_COVERAGE
    ),
    "FULL assessment must derive complete objective coverage."
);

assert(
    full.assessments[0].findings.some(
        finding =>
            finding.ruleId ===
            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                .DISTRIBUTED_OBJECTIVE_COVERAGE
    ),
    "FULL assessment must derive distributed objective coverage."
);

assert(
    !full.assessments[0].findings.some(
        finding =>
            finding.kind ===
            "ADVANTAGE"
    ),
    "Hito 1 must not manufacture ADVANTAGE findings."
);

assert(
    !full.assessments[0].findings.some(
        finding =>
            finding.kind ===
            "EMERGENT_PROPERTY"
    ),
    "Hito 1 must not manufacture EMERGENT_PROPERTY findings."
);


const complementAB =
    full.assessments[0].findings.find(
        finding =>
            finding.candidateIds.includes(
                "CANDIDATE-A-B"
            ) &&
            finding.kind ===
                "FUNCTIONAL_COMPLEMENT"
    );


assert(
    complementAB !==
        undefined,
    "Expected supported A-B functional complement."
);

assert(
    complementAB.discoveryEvidenceIds.includes(
        "DISCOVERY-A-B"
    ),
    "Functional complement must preserve discovery evidence identity."
);

assert(
    complementAB.compatibilityEvidenceIds.includes(
        "COMPAT-EVIDENCE-A-B"
    ),
    "Functional complement must preserve compatibility evidence identity."
);

assert(
    complementAB.observationIds.includes(
        "OBSERVATION-FULL"
    ),
    "Functional complement must preserve global observation identity."
);

assert(
    complementAB.runIds.includes(
        "RUN-FULL"
    ),
    "Functional complement must preserve global run identity."
);


const partial =
    engine.assess({

        envelopes,

        solver,

        harmony:
            harmonyResult(
                "PARTIAL"
            )

    });


assert(
    partial.errors.length ===
        0,
    `PARTIAL assessment returned errors: ${partial.errors.join(" | ")}`
);

assert(
    partial.assessments[0].valueEvaluationStatus ===
        "PARTIALLY_ASSESSED",
    "PARTIAL Harmony must produce PARTIALLY_ASSESSED value status."
);

assert(
    partial.assessments[0].findings.some(
        finding =>
            finding.ruleId ===
            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                .STRICT_SUBSET_ONLY &&
            finding.kind ===
                "EVIDENCE_LIMITATION"
    ),
    "PARTIAL assessment must expose strict-subset limitation."
);

assert(
    !partial.assessments[0].findings.some(
        finding =>
            finding.ruleId ===
            SCIENTIFIC_COMPOSITION_VALUE_RULE_IDS
                .COMPLETE_OBJECTIVE_COVERAGE
    ),
    "STRICT_SUBSET support must not be promoted to full objective coverage."
);

assert(
    !partial.assessments[0].findings.some(
        finding =>
            finding.kind ===
                "EMERGENT_PROPERTY"
    ),
    "PARTIAL Hito 1 must not manufacture emergent properties."
);


for (
    const status
    of [
        "INCONCLUSIVE",
        "CHALLENGED"
    ] as const
) {

    const result =
        engine.assess({

            envelopes,

            solver,

            harmony:
                harmonyResult(
                    status
                )

        });


    assert(
        result.errors.length ===
            0,
        `${status} assessment returned unexpected errors.`
    );

    assert(
        result.assessments.length ===
            1,
        `${status} must preserve one assessment projection.`
    );

    assert(
        result.assessments[0].valueEvaluationStatus ===
            "NOT_ESTABLISHED",
        `${status} must produce NOT_ESTABLISHED value status.`
    );

    assert(
        result.assessments[0].findings.length ===
            0,
        `${status} must not manufacture composition-value findings.`
    );

}


const upstreamError =
    engine.assess({

        envelopes,

        solver:
            {
                solutions:
                    [],

                errors:
                    [
                        "synthetic upstream error"
                    ]
            },

        harmony:
            harmonyResult(
                "FULL"
            )

    });


assert(
    upstreamError.assessments.length ===
        0,
    "Upstream scientific error must block value assessments."
);

assert(
    upstreamError.errors.length >
        0,
    "Upstream scientific error must remain explicit."
);


console.log("");
console.log("SCIENTIFIC COMPOSITION VALUE HITO 1: PASS");
console.log("");
console.log("FULL:");
console.log(
    JSON.stringify(
        full.assessments[0],
        null,
        2
    )
);
console.log("");
console.log("PARTIAL:");
console.log(
    JSON.stringify(
        partial.assessments[0],
        null,
        2
    )
);
console.log("");
console.log(
    "INCONCLUSIVE / CHALLENGED correctly produced NOT_ESTABLISHED with zero findings."
);
console.log(
    "No ADVANTAGE or EMERGENT_PROPERTY is generated in Hito 1."
);