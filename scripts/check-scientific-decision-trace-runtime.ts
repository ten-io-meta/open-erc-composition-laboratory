import {
    ScientificDecisionTraceEngine
} from "../laboratory/scientific-decision-trace/ScientificDecisionTraceEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (
        condition
    ) {
        pass++;
    }
    else {
        fail++;
    }

}


const observation:
    any = {

        observationId:
            "OBS-README",

        sourceId:
            "GITHUB-SOURCE",

        sourceType:
            "GITHUB",

        sourceRevision:
            "0123456789abcdef0123456789abcdef01234567",

        kind:
            "DOCUMENTATION",

        locator: {

            sourceLocation:
                "https://github.com/example/agent-ercs",

            filePath:
                "ERCs/erc-8301/README.md",

            startLine:
                1,

            endLine:
                10

        },

        rawText:
            "# ERC-8301\nComposes with ERC-8354."

    };


const factObservation:
    any = {

        observationId:
            "OBS-CONTRACT",

        sourceId:
            "GITHUB-SOURCE",

        sourceType:
            "GITHUB",

        sourceRevision:
            "0123456789abcdef0123456789abcdef01234567",

        kind:
            "CONTRACT_SOURCE",

        locator: {

            sourceLocation:
                "https://github.com/example/agent-ercs",

            filePath:
                "src/ERC8301.sol",

            startLine:
                20,

            endLine:
                40

        },

        rawText:
            "function run() external {}"

    };


const fact:
    any = {

        factId:
            "FACT-RUN",

        observationId:
            "OBS-CONTRACT",

        sourceId:
            "GITHUB-SOURCE",

        sourceRevision:
            "0123456789abcdef0123456789abcdef01234567",

        kind:
            "FUNCTION_DECLARATION",

        symbol:
            "run",

        containerKind:
            "CONTRACT",

        containerSymbol:
            "ERC8301",

        locator: {

            sourceLocation:
                "https://github.com/example/agent-ercs",

            filePath:
                "src/ERC8301.sol",

            startLine:
                27,

            endLine:
                27

        },

        rawText:
            "function run() external {}"

    };


const relation:
    any = {

        relationEvidenceId:
            "REL-8301-8354",

        sourceId:
            "GITHUB-SOURCE",

        sourceRevision:
            "0123456789abcdef0123456789abcdef01234567",

        observationId:
            "OBS-README",

        subjectSymbol:
            "ERC-8301",

        subjectProtocolId:
            "ERC-8301",

        relation:
            "COMPOSES_WITH",

        objectProtocolId:
            "ERC-8354",

        evidenceBasis:
            "MARKDOWN_H1_EXPLICIT_COMPOSES_WITH_ERC",

        subjectLocator: {

            sourceLocation:
                "https://github.com/example/agent-ercs",

            filePath:
                "ERCs/erc-8301/README.md",

            startLine:
                1,

            endLine:
                1

        },

        subjectRawText:
            "# ERC-8301",

        locator: {

            sourceLocation:
                "https://github.com/example/agent-ercs",

            filePath:
                "ERCs/erc-8301/README.md",

            startLine:
                2,

            endLine:
                2

        },

        rawText:
            "Composes with ERC-8354."

    };


const profiles:
    any[] = [
        {
            profileId:
                "PROFILE-8301",

            protocolId:
                "ERC-8301",

            sourceId:
                "GITHUB-SOURCE",

            sourceRevision:
                "0123456789abcdef0123456789abcdef01234567",

            attributedContainerSymbols: [
                "ERC8301"
            ],

            contributions: [
                {
                    contributionId:
                        "CONTRIBUTION-RUN",

                    participantId:
                        "ERC-8301",

                    kind:
                        "CAPABILITY",

                    subject:
                        "run",

                    evidenceIds: [
                        "FACT-RUN"
                    ]
                }
            ],

            boundaries:
                [],

            needs:
                []
        },

        {
            profileId:
                "PROFILE-8354",

            protocolId:
                "ERC-8354",

            sourceId:
                "GITHUB-SOURCE",

            sourceRevision:
                "0123456789abcdef0123456789abcdef01234567",

            attributedContainerSymbols:
                [],

            contributions:
                [],

            boundaries:
                [],

            needs:
                []
        }
    ];


const evaluationGraph:
    any = {

        graph: {

            graphId:
                "EVALUATION-GRAPH",

            candidateGraphId:
                "CANDIDATE-GRAPH",

            objectiveId:
                "OBJECTIVE",

            nodes:
                [],

            edges: [
                {
                    edgeId:
                        "EDGE-8301-8354",

                    candidateGraphEdgeId:
                        "CANDIDATE-GRAPH-EDGE",

                    candidateId:
                        "CANDIDATE-8301-8354",

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    sourceParticipantId:
                        "ERC-8301",

                    targetParticipantId:
                        "ERC-8354",

                    discoveryEvidenceIds: [
                        "REL-8301-8354"
                    ],

                    compatibilityAssessmentId:
                        "COMPAT-8301-8354",

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
                        "DOC-CANDIDATE",

                    relation:
                        "COMPOSES_WITH"
                }
            ],

            statistics:
                {}

        },

        errors:
            []

    };


const evidenceGaps:
    any = {

        diagnostics: [
            {
                diagnosticId:
                    "DIAGNOSTIC-8301-8354",

                candidateId:
                    "CANDIDATE-8301-8354",

                candidateKind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-8301",

                targetParticipantId:
                    "ERC-8354",

                compatibilityAssessmentId:
                    "COMPAT-8301-8354",

                compatibilityPolarity:
                    "INCONCLUSIVE",

                knownBoundaryIds:
                    [],

                observedBoundaryIds:
                    [],

                unevaluatedBoundaryIds:
                    [],

                compatibilityObservationIds:
                    [],

                compatibilityEvidenceIds:
                    [],

                gaps: [
                    {
                        gapId:
                            "GAP-NO-BOUNDARIES",

                        kind:
                            "NO_KNOWN_BOUNDARIES",

                        candidateId:
                            "CANDIDATE-8301-8354",

                        boundaryIds:
                            []
                    },
                    {
                        gapId:
                            "GAP-NO-OBS",

                        kind:
                            "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS",

                        candidateId:
                            "CANDIDATE-8301-8354",

                        boundaryIds:
                            []
                    }
                ],

                resolution:
                    "REQUIRES_ADDITIONAL_EVIDENCE"
            }
        ],

        errors:
            []

    };


const solver:
    any = {

        solutions: [
            {
                solutionId:
                    "SOLUTION-8301-8354",

                envelopeId:
                    "ENVELOPE-8301-8354",

                setId:
                    "SET-8301-8354",

                objectiveId:
                    "OBJECTIVE",

                participantIds: [
                    "ERC-8301",
                    "ERC-8354"
                ],

                fullConfigurations:
                    [],

                subsetConfigurations:
                    [],

                supportedFunctionalCandidateIds:
                    [],

                documentaryCandidateIds: [
                    "CANDIDATE-8301-8354"
                ],

                challengedCandidateIds:
                    [],

                inconclusiveCandidateIds: [
                    "CANDIDATE-8301-8354"
                ],

                statistics:
                    {},

                resolutionStatus:
                    "UNRESOLVED_CANDIDATE_TOPOLOGY"
            }
        ],

        errors:
            []

    };


const bindings:
    any = {

        bindings:
            [],

        errors:
            []

    };


const harmony:
    any = {

        assessments: [
            {
                harmonyAssessmentId:
                    "HARMONY-8301-8354",

                envelopeId:
                    "ENVELOPE-8301-8354",

                setId:
                    "SET-8301-8354",

                objectiveId:
                    "OBJECTIVE",

                participantIds: [
                    "ERC-8301",
                    "ERC-8354"
                ],

                harmonyStatus:
                    "INCONCLUSIVE",

                fullConfigurationEvidence:
                    [],

                supportedSubsets:
                    [],

                blockedFullConfigurationIds:
                    [],

                blockedSubsetConfigurationIds:
                    [],

                supportedCandidateIds:
                    [],

                challengedCandidateIds:
                    [],

                inconclusiveCandidateIds: [
                    "CANDIDATE-8301-8354"
                ],

                preservedBoundaryRegionIds:
                    [],

                violatedBoundaryRegionIds:
                    [],

                unevaluatedBoundaryRegionIds:
                    [],

                evidenceBasis:
                    "EXACT_SOLVER_CONFIGURATION_GLOBAL_EVIDENCE"
            }
        ],

        errors:
            []

    };


const engine =
    new ScientificDecisionTraceEngine();


console.log("");
console.log(
    "SCIENTIFIC DECISION TRACE — RUNTIME"
);
console.log(
    "-----------------------------------"
);


const result =
    engine.trace({

        observations: [
            observation,
            factObservation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence: [
            relation
        ],

        profiles,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony

    });


check(
    "VALID DECISION TRACE HAS NO ERRORS",
    result.errors.length ===
        0
);


check(
    "GITHUB SOURCE FACT IS RESOLVED",
    result.evidenceCatalog.some(
        evidence =>
            evidence.evidenceId ===
                "FACT-RUN" &&
            evidence.evidenceKind ===
                "SOURCE_FACT"
    )
);


check(
    "GITHUB DOCUMENTARY RELATION IS RESOLVED",
    result.evidenceCatalog.some(
        evidence =>
            evidence.evidenceId ===
                "REL-8301-8354" &&
            evidence.evidenceKind ===
                "DOCUMENTARY_RELATION"
    )
);


const relationTrace =
    result.evidenceCatalog.find(
        evidence =>
            evidence.evidenceId ===
            "REL-8301-8354"
    )!;


check(
    "SOURCE REVISION IS EXACTLY PRESERVED",
    relationTrace.sourceRevision ===
        "0123456789abcdef0123456789abcdef01234567"
);


check(
    "SOURCE REPOSITORY LOCATION IS PRESERVED",
    relationTrace.sourceLocation ===
        "https://github.com/example/agent-ercs"
);


check(
    "SOURCE FILE AND LINE LOCATOR ARE PRESERVED",
    relationTrace.filePath ===
        "ERCs/erc-8301/README.md" &&
    relationTrace.startLine ===
        2 &&
    relationTrace.endLine ===
        2
);


check(
    "RAW SOURCE FRAGMENT IS PRESERVED",
    relationTrace.rawText ===
        "Composes with ERC-8354."
);


const artifact =
    result.participantArtifacts.find(
        item =>
            item.artifactId ===
            "CONTRIBUTION-RUN"
    )!;


check(
    "PARTICIPANT ARTIFACT LINKS BACK TO SOURCE FACT",
    artifact.resolvedEvidenceIds.includes(
        "FACT-RUN"
    )
);


const candidate =
    result.candidateTraces[0];


check(
    "DOCUMENTARY DISCOVERY REMAINS DOCUMENTARY",
    candidate.candidateKind ===
        "DOCUMENTARY_COMPOSITION" &&
    candidate.reasonCodes.includes(
        "DOCUMENTARY_RELATION_OPENED_CANDIDATE"
    )
);


check(
    "DOCUMENTARY CANDIDATE REMAINS INCONCLUSIVE",
    candidate.compatibilityPolarity ===
        "INCONCLUSIVE"
);


check(
    "NO KNOWN BOUNDARIES IS EXPLAINED",
    candidate.reasonCodes.includes(
        "NO_KNOWN_BOUNDARIES"
    )
);


check(
    "NO COMPATIBILITY OBSERVATIONS IS EXPLAINED",
    candidate.reasonCodes.includes(
        "NO_CANDIDATE_COMPATIBILITY_OBSERVATIONS"
    )
);


check(
    "DISCOVERY EVIDENCE IS EXACTLY TRACEABLE",
    candidate.resolvedEvidenceIds.includes(
        "REL-8301-8354"
    )
);


const composition =
    result.compositionTraces[0];


check(
    "HARMONY VERDICT IS PRESERVED NOT RECOMPUTED",
    composition.harmonyStatus ===
        "INCONCLUSIVE"
);


check(
    "NO SOLVER CONFIGURATION IS EXPLICIT",
    composition.reasonCodes.includes(
        "NO_SOLVER_CONFIGURATION"
    )
);


check(
    "UNRESOLVED CANDIDATE TOPOLOGY IS EXPLICIT",
    composition.reasonCodes.includes(
        "CANDIDATE_TOPOLOGY_UNRESOLVED"
    )
);


check(
    "CANDIDATE EVIDENCE GAPS PROPAGATE TO COMPOSITION EXPLANATION",
    composition.reasonCodes.includes(
        "CANDIDATE_EVIDENCE_GAPS_PRESENT"
    )
);


check(
    "INCONCLUSIVE DOES NOT INVENT GLOBAL CONFIGURATION",
    composition.configurations.length ===
        0
);


check(
    "TRACE BASIS DECLARES UPSTREAM EXPLANATION ONLY",
    composition.decisionBasis ===
        "UPSTREAM_SCIENTIFIC_DECISION_EXPLANATION" &&
    composition.traceStatus ===
        "EXPLAINED"
);


/*
 * Runtime-provider evidence that is not yet represented by a
 * provenance adapter must remain visible as unresolved.
 */
const unknownRuntimeEvidence =
    JSON.parse(
        JSON.stringify(
            evaluationGraph
        )
    );

unknownRuntimeEvidence.graph.edges[0]
    .compatibilityEvidenceIds = [
        "RUNTIME-EVIDENCE-NOT-YET-BOUND"
    ];

const unknownRuntimeGaps =
    JSON.parse(
        JSON.stringify(
            evidenceGaps
        )
    );

unknownRuntimeGaps.diagnostics[0]
    .compatibilityEvidenceIds = [
        "RUNTIME-EVIDENCE-NOT-YET-BOUND"
    ];


const unresolvedResult =
    engine.trace({

        observations: [
            observation,
            factObservation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence: [
            relation
        ],

        profiles,

        candidateEvaluationGraph:
            unknownRuntimeEvidence,

        evidenceGaps:
            unknownRuntimeGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony

    });


check(
    "UNKNOWN PROVIDER EVIDENCE IS NOT SILENTLY DISCARDED",
    unresolvedResult.errors.length ===
        0 &&
    unresolvedResult.unresolvedEvidenceIds.includes(
        "RUNTIME-EVIDENCE-NOT-YET-BOUND"
    )
);


check(
    "UNKNOWN PROVIDER EVIDENCE IS EXPLICIT ON CANDIDATE TRACE",
    unresolvedResult.candidateTraces[0]
        .unresolvedEvidenceIds
        .includes(
            "RUNTIME-EVIDENCE-NOT-YET-BOUND"
        )
);


/*
 * Provenance mismatch must fail closed.
 */
const badFact =
    {
        ...fact,

        sourceRevision:
            "ffffffffffffffffffffffffffffffffffffffff"
    };


const badProvenance =
    engine.trace({

        observations: [
            observation,
            factObservation
        ],

        facts: [
            badFact
        ],

        protocolRelationEvidence: [
            relation
        ],

        profiles,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony

    });


check(
    "SOURCE REVISION MISMATCH FAILS CLOSED",
    badProvenance.errors.length >
        0 &&
    badProvenance.compositionTraces.length ===
        0
);


/*
 * Evidence identity collision must fail closed.
 */
const collidingRelation =
    {
        ...relation,

        relationEvidenceId:
            "FACT-RUN"
    };


const collision =
    engine.trace({

        observations: [
            observation,
            factObservation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence: [
            relation,
            collidingRelation
        ],

        profiles,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony

    });


check(
    "EVIDENCE IDENTITY COLLISION FAILS CLOSED",
    collision.errors.length >
        0
);


/*
 * Decision Trace must never manufacture FULL.
 */
const invalidFull =
    engine.trace({

        observations: [
            observation,
            factObservation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence: [
            relation
        ],

        profiles,

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony: {

            assessments: [
                {
                    ...harmony.assessments[0],

                    harmonyStatus:
                        "FULL"
                }
            ],

            errors:
                []

        }

    });


check(
    "FULL WITHOUT GLOBAL SUPPORT EVIDENCE FAILS CLOSED",
    invalidFull.errors.length >
        0
);


/*
 * Determinism.
 */
const reversed =
    engine.trace({

        observations: [
            factObservation,
            observation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence: [
            relation
        ],

        profiles:
            [...profiles].reverse(),

        candidateEvaluationGraph:
            evaluationGraph,

        evidenceGaps,

        solver,

        globalEvidenceBindings:
            bindings,

        harmony

    });


check(
    "DECISION TRACE IS DETERMINISTIC",
    JSON.stringify(
        result
    ) ===
        JSON.stringify(
            reversed
        )
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "DECISION TRACE CONTAINS NO RENDERER OR GEOMETRY SEMANTICS",
    !serialized.includes(
        '"geometry"'
    ) &&
    !serialized.includes(
        '"position"'
    ) &&
    !serialized.includes(
        '"color"'
    )
);


console.log("");
console.log(
    `PASS: ${pass}`
);
console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (
    fail >
    0
) {

    process.exitCode =
        1;

}