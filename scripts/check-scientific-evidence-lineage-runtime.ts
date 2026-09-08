import {
    ScientificEvidenceLineageEngine
} from "../laboratory/scientific-evidence-lineage/ScientificEvidenceLineageEngine.js";

import {
    ScientificDecisionTraceLineageBindingEngine
} from "../laboratory/scientific-decision-trace/ScientificDecisionTraceLineageBindingEngine.js";


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


const revision =
    "0123456789abcdef0123456789abcdef01234567";


const observation:
    any = {

        observationId:
            "OBS-1",

        sourceId:
            "GITHUB-A",

        sourceType:
            "GITHUB",

        sourceRevision:
            revision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                "https://github.com/example/a",

            filePath:
                "src/A.sol",

            startLine:
                10,

            endLine:
                20
        },

        rawText:
            "contract A {}"

    };


const fact:
    any = {

        factId:
            "FACT-1",

        observationId:
            "OBS-1",

        sourceId:
            "GITHUB-A",

        sourceRevision:
            revision,

        kind:
            "FUNCTION_DECLARATION",

        locator: {
            sourceLocation:
                "https://github.com/example/a",

            filePath:
                "src/A.sol",

            startLine:
                15,

            endLine:
                15
        },

        rawText:
            "function run() external {}"

    };


const derivedLinks:
    any[] = [

        {
            evidenceId:
                "CAP-1",

            kind:
                "SEMANTIC_CAPABILITY",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "FACT-1"
            ]
        },

        {
            evidenceId:
                "ATTR-1",

            kind:
                "CAPABILITY_ATTRIBUTION",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "CAP-1",
                "FACT-1",
                "OBS-1"
            ]
        },

        {
            evidenceId:
                "PATTR-1",

            kind:
                "PROTOCOL_ATTRIBUTION",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "ATTR-1",
                "OBS-1"
            ]
        },

        {
            evidenceId:
                "PCONCEPT-1",

            kind:
                "PROTOCOL_CONCEPT",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "PATTR-1",
                "CAP-1",
                "FACT-1"
            ]
        },

        {
            evidenceId:
                "STRUCTURAL-REL-1",

            kind:
                "STRUCTURAL_PROTOCOL_RELATION",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "FACT-1",
                "OBS-1"
            ]
        },

        {
            evidenceId:
                "CALL-ATTR-1",

            kind:
                "PROTOCOL_EXTERNAL_CALL_ATTRIBUTION",

            sourceId:
                "GITHUB-A",

            sourceRevision:
                revision,

            parentEvidenceIds: [
                "FACT-1",
                "OBS-1"
            ]
        }

    ];


const engine =
    new ScientificEvidenceLineageEngine();


const lineage =
    engine.resolve({

        observations: [
            observation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence:
            [],

        derivedLinks,

        requestedEvidenceIds: [
            "OBS-1",
            "FACT-1",
            "CAP-1",
            "ATTR-1",
            "PATTR-1",
            "PCONCEPT-1",
            "STRUCTURAL-REL-1",
            "CALL-ATTR-1",
            "MISSING-1"
        ]

    });


console.log("");
console.log(
    "SCIENTIFIC EVIDENCE LINEAGE — RUNTIME"
);
console.log(
    "-------------------------------------"
);


check(
    "VALID LINEAGE HAS NO ERRORS",
    lineage.errors.length ===
        0
);


check(
    "SOURCE OBSERVATION IS TERMINAL EVIDENCE",
    lineage.terminalEvidenceCatalog.some(
        evidence =>
            evidence.evidenceId ===
                "OBS-1" &&
            evidence.kind ===
                "SOURCE_OBSERVATION"
    )
);


check(
    "SOURCE FACT IS TERMINAL EVIDENCE",
    lineage.terminalEvidenceCatalog.some(
        evidence =>
            evidence.evidenceId ===
                "FACT-1" &&
            evidence.kind ===
                "SOURCE_FACT"
    )
);


const protocolAttribution =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
            "PATTR-1"
    )!;


check(
    "PROTOCOL ATTRIBUTION RESOLVES TRANSITIVELY",
    protocolAttribution.status ===
        "RESOLVED"
);


check(
    "PROTOCOL ATTRIBUTION REACHES REAL SOURCE FACT",
    protocolAttribution.terminalEvidenceIds.includes(
        "FACT-1"
    )
);


check(
    "PROTOCOL ATTRIBUTION REACHES SOURCE OBSERVATION",
    protocolAttribution.terminalEvidenceIds.includes(
        "OBS-1"
    )
);


const concept =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
            "PCONCEPT-1"
    )!;


check(
    "PROTOCOL CONCEPT RESOLVES THROUGH ATTRIBUTION CHAIN",
    concept.status ===
        "RESOLVED" &&
    concept.terminalEvidenceIds.includes(
        "FACT-1"
    )
);


const missing =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
            "MISSING-1"
    )!;


check(
    "UNKNOWN EVIDENCE REMAINS UNRESOLVED",
    missing.status ===
        "UNRESOLVED" &&
    missing.unresolvedLeafIds.includes(
        "MISSING-1"
    )
);


/*
 * Bind the structured lineage back to the existing Decision Trace.
 */
const rawTrace:
    any = {

        evidenceCatalog: [
            {
                evidenceId:
                    "FACT-1",

                evidenceKind:
                    "SOURCE_FACT",

                sourceId:
                    "GITHUB-A",

                sourceType:
                    "GITHUB",

                sourceRevision:
                    revision,

                observationId:
                    "OBS-1",

                sourceLocation:
                    "https://github.com/example/a",

                filePath:
                    "src/A.sol",

                startLine:
                    15,

                endLine:
                    15,

                rawText:
                    "function run() external {}",

                factKind:
                    "FUNCTION_DECLARATION"
            }
        ],

        participantArtifacts: [
            {
                artifactId:
                    "CONTRIBUTION-1",

                artifactKind:
                    "CONTRIBUTION",

                participantId:
                    "ERC-1",

                subject:
                    "run",

                evidenceIds: [
                    "PATTR-1",
                    "ATTR-1",
                    "CAP-1",
                    "OBS-1",
                    "FACT-1",
                    "MISSING-1"
                ],

                resolvedEvidenceIds: [
                    "FACT-1"
                ],

                unresolvedEvidenceIds: [
                    "PATTR-1",
                    "ATTR-1",
                    "CAP-1",
                    "OBS-1",
                    "MISSING-1"
                ]
            }
        ],

        candidateTraces:
            [],

        compositionTraces:
            [],

        unresolvedEvidenceIds: [
            "PATTR-1",
            "ATTR-1",
            "CAP-1",
            "OBS-1",
            "MISSING-1"
        ],

        errors:
            []

    };


const bound =
    new ScientificDecisionTraceLineageBindingEngine()
        .bind(
            rawTrace,
            lineage
        );


check(
    "LINEAGE BINDS TO DECISION TRACE",
    bound.errors.length ===
        0 &&
    bound.trace !==
        null
);


check(
    "DERIVED PROFILE EVIDENCE BECOMES RESOLVED",
    bound.trace!
        .participantArtifacts[0]
        .resolvedEvidenceIds
        .includes(
            "PATTR-1"
        )
);


check(
    "SOURCE OBSERVATION REFERENCE BECOMES RESOLVED",
    bound.trace!
        .participantArtifacts[0]
        .resolvedEvidenceIds
        .includes(
            "OBS-1"
        )
);


check(
    "TRULY UNKNOWN EVIDENCE STAYS UNRESOLVED",
    JSON.stringify(
        bound.trace!
            .unresolvedEvidenceIds
    ) ===
        JSON.stringify([
            "MISSING-1"
        ])
);


/*
 * Cross-source lineage must fail closed.
 */
const crossSource =
    engine.resolve({

        observations: [
            observation
        ],

        facts: [
            fact
        ],

        protocolRelationEvidence:
            [],

        derivedLinks: [
            {
                evidenceId:
                    "BAD-DERIVED",

                kind:
                    "CAPABILITY_ATTRIBUTION",

                sourceId:
                    "GITHUB-B",

                sourceRevision:
                    revision,

                parentEvidenceIds: [
                    "FACT-1"
                ]
            }
        ],

        requestedEvidenceIds: [
            "BAD-DERIVED"
        ]

    });


check(
    "CROSS SOURCE LINEAGE FAILS CLOSED",
    crossSource.errors.length >
        0
);


/*
 * Cyclic lineage must fail closed.
 */
const cycle =
    engine.resolve({

        observations:
            [],

        facts:
            [],

        protocolRelationEvidence:
            [],

        derivedLinks: [
            {
                evidenceId:
                    "A",

                kind:
                    "CAPABILITY_ATTRIBUTION",

                sourceId:
                    "GITHUB-A",

                parentEvidenceIds: [
                    "B"
                ]
            },
            {
                evidenceId:
                    "B",

                kind:
                    "PROTOCOL_ATTRIBUTION",

                sourceId:
                    "GITHUB-A",

                parentEvidenceIds: [
                    "A"
                ]
            }
        ],

        requestedEvidenceIds: [
            "A"
        ]

    });


check(
    "CYCLIC LINEAGE FAILS CLOSED",
    cycle.errors.length >
        0
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