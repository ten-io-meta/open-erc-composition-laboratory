import {
    ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine
} from "../laboratory/scientific-candidate-runtime-evidence-bridge/ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine.js";

import type {
    ScientificStructuralFoundationCompositionCandidateRecord
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionExecutionRequirement
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificCompositionConstraintObservation
} from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

import type {
    ScientificProtocolCompositionProfile
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";


let pass = 0;
let fail = 0;


function check(
    name: string,
    condition: boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    condition
        ? pass++
        : fail++;

}


const candidate:
    ScientificStructuralFoundationCompositionCandidateRecord = {

        candidateId:
            "GENERIC-STRUCTURAL-8004-8060",

        kind:
            "STRUCTURAL_FOUNDATION",

        sourceParticipantId:
            "ERC-8004",

        targetParticipantId:
            "ERC-8060",

        evidenceIds: [
            "DISCOVERY-8004",
            "DISCOVERY-8060"
        ],

        structuralFoundationCandidateId:
            "NORMALIZED-8004-8060",

        sourceCrossProtocolCandidateId:
            "SOURCE-CANDIDATE-8004-8060",

        directionality:
            "UNDIRECTED",

        foundationProtocolId:
            "ERC-721",

        provenance:
            [],

        evaluationStatus:
            "UNEVALUATED"

    };


const requirement:
    ScientificCompositionExecutionRequirement = {

        requirementId:
            "REQ",

        evaluationSpecificationId:
            "SPEC",

        candidate: {

            candidateId:
                "SOURCE-CANDIDATE-8004-8060",

            participantA: {
                kind:
                    "PROTOCOL",

                id:
                    "ERC-8004"
            },

            participantB: {
                kind:
                    "PROTOCOL",

                id:
                    "ERC-8060"
            },

            mechanism:
                "SHARED_PROTOCOL_FOUNDATION",

            foundationProtocolId:
                "ERC-721",

            supportingCapabilityIdsA:
                [],

            supportingCapabilityIdsB:
                [],

            provenance:
                [],

            evaluationStatus:
                "UNEVALUATED"

        },

        constraints: [
            {
                constraintId:
                    "CONSTRAINT-8004",

                candidateId:
                    "SOURCE-CANDIDATE-8004-8060",

                participantSide:
                    "A",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8004",

                sourceId:
                    "SOURCE-8004",

                sourceRevision:
                    "aaaaaaaa",

                factId:
                    "FACT-8004",

                basis:
                    "SOLIDITY_REQUIRE_STATEMENT",

                containerKind:
                    "CONTRACT",

                containerSymbol:
                    "AgentRegistry",

                locator: {
                    sourceLocation:
                        "https://example.test/8004",

                    filePath:
                        "AgentRegistry.sol",

                    startLine:
                        1,

                    endLine:
                        1
                },

                rawText:
                    "require(agentOwner != address(0));"
            },
            {
                constraintId:
                    "CONSTRAINT-8060",

                candidateId:
                    "SOURCE-CANDIDATE-8004-8060",

                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8060",

                sourceId:
                    "SOURCE-8060",

                sourceRevision:
                    "bbbbbbbb",

                factId:
                    "FACT-8060",

                basis:
                    "SOLIDITY_REQUIRE_STATEMENT",

                containerKind:
                    "CONTRACT",

                containerSymbol:
                    "ERC721Value",

                locator: {
                    sourceLocation:
                        "https://example.test/8060",

                    filePath:
                        "ERC721Value.sol",

                    startLine:
                        1,

                    endLine:
                        1
                },

                rawText:
                    "require(value > 0);"
            }
        ],

        participantAConstraintIds: [
            "CONSTRAINT-8004"
        ],

        participantBConstraintIds: [
            "CONSTRAINT-8060"
        ],

        unresolvedGuardFactIds:
            [],

        participantSources: [
            {
                participantSide:
                    "A",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8004",

                sourceId:
                    "SOURCE-8004",

                sourceRevision:
                    "aaaaaaaa",

                repository:
                    "repo-8004"
            },
            {
                participantSide:
                    "B",

                participantKind:
                    "PROTOCOL",

                participantId:
                    "ERC-8060",

                sourceId:
                    "SOURCE-8060",

                sourceRevision:
                    "bbbbbbbb",

                repository:
                    "repo-8060"
            }
        ]

    };


const profiles:
    ScientificProtocolCompositionProfile[] = [
        {
            profileId:
                "PROFILE-8004",

            protocolId:
                "ERC-8004",

            sourceId:
                "SOURCE-8004",

            sourceRevision:
                "aaaaaaaa",

            attributedContainerSymbols:
                [],

            contributions:
                [],

            boundaries: [
                {
                    boundaryId:
                        "BOUNDARY-8004",

                    participantId:
                        "ERC-8004",

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject:
                        "require(agentOwner != address(0));",

                    evidenceIds: [
                        "FACT-8004",
                        "SOURCE-OBS-8004"
                    ]
                }
            ],

            needs:
                []
        },
        {
            profileId:
                "PROFILE-8060",

            protocolId:
                "ERC-8060",

            sourceId:
                "SOURCE-8060",

            sourceRevision:
                "bbbbbbbb",

            attributedContainerSymbols:
                [],

            contributions:
                [],

            boundaries: [
                {
                    boundaryId:
                        "BOUNDARY-8060",

                    participantId:
                        "ERC-8060",

                    kind:
                        "SOURCE_CONSTRAINT",

                    subject:
                        "require(value > 0);",

                    evidenceIds: [
                        "FACT-8060",
                        "SOURCE-OBS-8060"
                    ]
                }
            ],

            needs:
                []
        }
    ];


const observations:
    ScientificCompositionConstraintObservation[] = [
        {
            observationId:
                "RUNTIME-OBS-8004",

            candidateId:
                "SOURCE-CANDIDATE-8004-8060",

            constraintId:
                "CONSTRAINT-8004",

            participantSide:
                "A",

            verdict:
                "PRESERVED",

            evidence: [
                "EXECUTION-EVIDENCE-8004"
            ]
        },
        {
            observationId:
                "RUNTIME-OBS-8060",

            candidateId:
                "SOURCE-CANDIDATE-8004-8060",

            constraintId:
                "CONSTRAINT-8060",

            participantSide:
                "B",

            verdict:
                "PRESERVED",

            evidence: [
                "EXECUTION-EVIDENCE-8060"
            ]
        }
    ];


console.log("");
console.log(
    "V2.1 RUNTIME BOUNDARY EVIDENCE BRIDGE"
);
console.log(
    "====================================="
);


const engine =
    new ScientificCandidateRuntimeBoundaryEvidenceBridgeEngine();


const result =
    engine.bridge(
        candidate,
        requirement,
        observations,
        profiles
    );


check(
    "EXACT SOURCE CANDIDATE BRIDGES WITHOUT ERRORS",
    result.errors.length === 0
);


check(
    "TWO RUNTIME OBSERVATIONS BECOME TWO GENERIC BOUNDARY OBSERVATIONS",
    result.observations.length === 2
);


check(
    "TARGET CANDIDATE IDENTITY IS USED",
    result.observations.every(
        observation =>
            observation.candidateId ===
            candidate.candidateId
    )
);


check(
    "EXACT FACT-BASED BOUNDARIES ARE USED",
    result.observations.some(
        observation =>
            observation.boundaryId ===
            "BOUNDARY-8004"
    ) &&
    result.observations.some(
        observation =>
            observation.boundaryId ===
            "BOUNDARY-8060"
    )
);


check(
    "RUNTIME VERDICTS ARE PRESERVED",
    result.observations.every(
        observation =>
            observation.verdict ===
            "PRESERVED"
    )
);


check(
    "BRIDGE PRESERVES AUDIT BINDINGS",
    result.bindings.length === 2 &&
    result.bindings.every(
        binding =>
            binding.sourceFactId.startsWith(
                "FACT-"
            )
    )
);


const wrongCandidate =
    {
        ...candidate,

        sourceCrossProtocolCandidateId:
            "WRONG-SOURCE-CANDIDATE"
    };


const wrongCandidateResult =
    engine.bridge(
        wrongCandidate,
        requirement,
        observations,
        profiles
    );


check(
    "WRONG SOURCE CANDIDATE FAILS CLOSED",
    wrongCandidateResult.observations.length === 0 &&
    wrongCandidateResult.errors.length > 0
);


const wrongProfile:
    ScientificProtocolCompositionProfile[] =
    structuredClone(
        profiles
    );


wrongProfile[0].boundaries[0].evidenceIds = [
    "OTHER-FACT"
];


const wrongBoundaryResult =
    engine.bridge(
        candidate,
        requirement,
        observations,
        wrongProfile
    );


check(
    "MISSING EXACT FACT BOUNDARY FAILS CLOSED",
    wrongBoundaryResult.observations.length === 0 &&
    wrongBoundaryResult.errors.length > 0
);


const violationObservations =
    structuredClone(
        observations
    );


violationObservations[1].verdict =
    "VIOLATED";


const violationResult =
    engine.bridge(
        candidate,
        requirement,
        violationObservations,
        profiles
    );


check(
    "VIOLATION VERDICT IS NOT SANITIZED",
    violationResult.errors.length === 0 &&
    violationResult.observations.some(
        observation =>
            observation.verdict ===
            "VIOLATED"
    )
);


console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}