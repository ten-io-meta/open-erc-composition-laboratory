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

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


const revisionA =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const revisionB =
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";


function observation(
    sourceId:
        string,
    revision:
        string,
    observationId:
        string,
    repo:
        string
): any {

    return {

        observationId,

        sourceId,

        sourceType:
            "GITHUB",

        sourceRevision:
            revision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                repo,

            filePath:
                "src/Test.sol",

            startLine:
                1,

            endLine:
                20
        },

        rawText:
            "interface Test {}"

    };

}


function fact(
    sourceId:
        string,
    revision:
        string,
    observationId:
        string,
    factId:
        string,
    repo:
        string
): any {

    return {

        factId,

        observationId,

        sourceId,

        sourceRevision:
            revision,

        kind:
            "FUNCTION_DECLARATION",

        locator: {
            sourceLocation:
                repo,

            filePath:
                "src/Test.sol",

            startLine:
                10,

            endLine:
                10
        },

        rawText:
            "function register() external;"

    };

}


const obsA =
    observation(
        "GITHUB-A",
        revisionA,
        "OBS-A",
        "https://github.com/example/a"
    );

const obsB =
    observation(
        "GITHUB-B",
        revisionB,
        "OBS-B",
        "https://github.com/example/b"
    );

const factA =
    fact(
        "GITHUB-A",
        revisionA,
        "OBS-A",
        "FACT-A",
        "https://github.com/example/a"
    );

const factB =
    fact(
        "GITHUB-B",
        revisionB,
        "OBS-B",
        "FACT-B",
        "https://github.com/example/b"
    );


const engine =
    new ScientificEvidenceLineageEngine();


const lineage =
    engine.resolve({

        observations: [
            obsA,
            obsB
        ],

        facts: [
            factA,
            factB
        ],

        protocolRelationEvidence:
            [],

        derivedLinks: [

            {
                evidenceId:
                    "LEXICAL-REGISTER",

                kind:
                    "SEMANTIC_CAPABILITY",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA,

                parentEvidenceIds: [
                    "FACT-A"
                ]
            },

            {
                evidenceId:
                    "ATTR-A",

                kind:
                    "CAPABILITY_ATTRIBUTION",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA,

                parentEvidenceIds: [
                    "LEXICAL-REGISTER",
                    "FACT-A",
                    "OBS-A"
                ]
            },

            {
                evidenceId:
                    "LEXICAL-REGISTER",

                kind:
                    "SEMANTIC_CAPABILITY",

                sourceId:
                    "GITHUB-B",

                sourceRevision:
                    revisionB,

                parentEvidenceIds: [
                    "FACT-B"
                ]
            },

            {
                evidenceId:
                    "ATTR-B",

                kind:
                    "CAPABILITY_ATTRIBUTION",

                sourceId:
                    "GITHUB-B",

                sourceRevision:
                    revisionB,

                parentEvidenceIds: [
                    "LEXICAL-REGISTER",
                    "FACT-B",
                    "OBS-B"
                ]
            }

        ],

        requestedEvidenceRefs: [

            {
                evidenceId:
                    "LEXICAL-REGISTER",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA
            },

            {
                evidenceId:
                    "LEXICAL-REGISTER",

                sourceId:
                    "GITHUB-B",

                sourceRevision:
                    revisionB
            },

            {
                evidenceId:
                    "ATTR-A",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA
            },

            {
                evidenceId:
                    "UNKNOWN",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA
            }

        ]

    });


console.log("");
console.log(
    "SCIENTIFIC SOURCE-SCOPED EVIDENCE LINEAGE"
);
console.log(
    "-----------------------------------------"
);


check(
    "SAME LEXICAL ID IN TWO SOURCES DOES NOT COLLIDE",
    lineage.errors.length ===
        0
);


const lexicalA =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
                "LEXICAL-REGISTER" &&
            resolution.sourceId ===
                "GITHUB-A"
    )!;

const lexicalB =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
                "LEXICAL-REGISTER" &&
            resolution.sourceId ===
                "GITHUB-B"
    )!;


check(
    "SOURCE A LEXICAL CAPABILITY RESOLVES",
    lexicalA.status ===
        "RESOLVED"
);


check(
    "SOURCE B LEXICAL CAPABILITY RESOLVES",
    lexicalB.status ===
        "RESOLVED"
);


check(
    "SOURCE A DOES NOT ABSORB SOURCE B FACT",
    lexicalA.terminalEvidenceIds.includes(
        "FACT-A"
    ) &&
    !lexicalA.terminalEvidenceIds.includes(
        "FACT-B"
    )
);


check(
    "SOURCE B DOES NOT ABSORB SOURCE A FACT",
    lexicalB.terminalEvidenceIds.includes(
        "FACT-B"
    ) &&
    !lexicalB.terminalEvidenceIds.includes(
        "FACT-A"
    )
);


const attributionA =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
                "ATTR-A"
    )!;


check(
    "DERIVED ATTRIBUTION RESOLVES TRANSITIVELY",
    attributionA.status ===
        "RESOLVED" &&
    attributionA.terminalEvidenceIds.includes(
        "FACT-A"
    ) &&
    attributionA.terminalEvidenceIds.includes(
        "OBS-A"
    )
);


const unknown =
    lineage.resolutions.find(
        resolution =>
            resolution.evidenceId ===
                "UNKNOWN"
    )!;


check(
    "UNKNOWN EVIDENCE REMAINS UNRESOLVED",
    unknown.status ===
        "UNRESOLVED"
);


/*
 * Decision Trace artifact scope must control lineage lookup.
 */
const rawTrace:
    any = {

        evidenceCatalog:
            [],

        participantArtifacts: [
            {
                artifactId:
                    "CONTRIBUTION-A",

                artifactKind:
                    "CONTRIBUTION",

                participantId:
                    "ERC-A",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA,

                subject:
                    "register",

                evidenceIds: [
                    "LEXICAL-REGISTER",
                    "ATTR-A"
                ],

                resolvedEvidenceIds:
                    [],

                unresolvedEvidenceIds: [
                    "LEXICAL-REGISTER",
                    "ATTR-A"
                ]
            }
        ],

        candidateTraces:
            [],

        compositionTraces:
            [],

        unresolvedEvidenceIds: [
            "LEXICAL-REGISTER",
            "ATTR-A"
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
    "SOURCE-SCOPED LINEAGE BINDS TO DECISION TRACE",
    bound.errors.length ===
        0 &&
    bound.trace !==
        null
);


check(
    "ARTIFACT DERIVED EVIDENCE BECOMES RESOLVED",
    bound.trace!
        .participantArtifacts[0]
        .unresolvedEvidenceIds
        .length ===
        0
);


check(
    "TRACE HAS NO FALSE UNRESOLVED EVIDENCE",
    bound.trace!
        .unresolvedEvidenceIds
        .length ===
        0
);


/*
 * Same-source cyclic lineage must still fail closed.
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

                sourceRevision:
                    revisionA,

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

                sourceRevision:
                    revisionA,

                parentEvidenceIds: [
                    "A"
                ]
            }
        ],

        requestedEvidenceRefs: [
            {
                evidenceId:
                    "A",

                sourceId:
                    "GITHUB-A",

                sourceRevision:
                    revisionA
            }
        ]

    });


check(
    "CYCLIC LINEAGE STILL FAILS CLOSED",
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