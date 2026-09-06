import assert from "node:assert/strict";

import {
    ScientificCompositionEvaluationSpecificationEngine
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationEngine.js";

import type {
    ScientificCrossProtocolCompositionResult
} from "../laboratory/scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";

import type {
    ScientificCompositionCandidate
} from "../laboratory/scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificSourceFact
} from "../laboratory/scientific-source-fact/ScientificSourceFact.js";

import type {
    ScientificProtocolConceptAttributionResult
} from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionResult.js";

import type {
    ScientificProtocolRelationEvidenceResult
} from "../laboratory/scientific-protocol-relation-evidence/ScientificProtocolRelationEvidenceResult.js";


const engine =
    new ScientificCompositionEvaluationSpecificationEngine();


const locator = (
    sourceLocation: string,
    filePath: string,
    line: number
) => ({
    sourceLocation,
    filePath,
    startLine: line,
    endLine: line
});


const functionFact = (
    factId: string,
    sourceId: string,
    sourceRevision: string | undefined,
    observationId: string,
    containerKind: "INTERFACE" | "CONTRACT",
    containerSymbol: string,
    symbol: string,
    line: number
): ScientificSourceFact => ({

    factId,

    observationId,

    sourceId,

    ...(sourceRevision !== undefined
        ? {
            sourceRevision
        }
        : {}),

    kind:
        "FUNCTION_DECLARATION",

    symbol,

    containerKind,

    containerSymbol,

    locator:
        locator(
            `${sourceId}:contracts`,
            `contracts/${containerSymbol}.sol`,
            line
        ),

    rawText:
        `function ${symbol}() external;`

});


const requireFact = (
    factId: string,
    sourceId: string,
    sourceRevision: string | undefined,
    observationId: string,
    containerKind: "INTERFACE" | "CONTRACT",
    containerSymbol: string,
    rawText: string,
    line: number
): ScientificSourceFact => ({

    factId,

    observationId,

    sourceId,

    ...(sourceRevision !== undefined
        ? {
            sourceRevision
        }
        : {}),

    kind:
        "REQUIRE_STATEMENT",

    containerKind,

    containerSymbol,

    locator:
        locator(
            `${sourceId}:contracts`,
            `contracts/${containerSymbol}.sol`,
            line
        ),

    rawText

});


const revertFact = (
    factId: string,
    sourceId: string,
    sourceRevision: string | undefined,
    observationId: string,
    containerKind: "INTERFACE" | "CONTRACT",
    containerSymbol: string,
    rawText: string,
    line: number
): ScientificSourceFact => ({

    factId,

    observationId,

    sourceId,

    ...(sourceRevision !== undefined
        ? {
            sourceRevision
        }
        : {}),

    kind:
        "REVERT_STATEMENT",

    containerKind,

    containerSymbol,

    locator:
        locator(
            `${sourceId}:contracts`,
            `contracts/${containerSymbol}.sol`,
            line
        ),

    rawText

});


const protocolConceptResult = (
    sourceId: string,
    sourceRevision: string | undefined,
    protocolConceptId: string,
    protocolId: string,
    conceptId: string,
    evidenceFactId: string
): ScientificProtocolConceptAttributionResult => ({

    sourceId,

    ...(sourceRevision !== undefined
        ? {
            sourceRevision
        }
        : {}),

    sourceModelId:
        `MODEL-${sourceId}`,

    protocolConcepts: [
        {
            protocolConceptId,

            conceptId,

            label:
                conceptId
                    .replace(
                        /^CONCEPT-/,
                        ""
                    )
                    .toLowerCase(),

            protocolId,

            lexicalCapabilityIds: [
                `LEXICAL-${protocolId}-A`,
                `LEXICAL-${protocolId}-B`
            ],

            protocolAttributionIds: [
                `ATTRIBUTION-${protocolId}-A`,
                `ATTRIBUTION-${protocolId}-B`
            ],

            evidence: [
                evidenceFactId
            ]
        }
    ],

    unattributedConceptIds: [],

    errors: []

});


const relationEvidenceResult = (
    sourceId: string,
    sourceRevision: string | undefined,
    relationEvidenceId: string,
    subjectSymbol: string,
    objectProtocolId: string
): ScientificProtocolRelationEvidenceResult => ({

    sourceId,

    ...(sourceRevision !== undefined
        ? {
            sourceRevision
        }
        : {}),

    relations: [
        {
            relationEvidenceId,

            sourceId,

            ...(sourceRevision !== undefined
                ? {
                    sourceRevision
                }
                : {}),

            observationId:
                `OBSERVATION-${relationEvidenceId}`,

            subjectSymbol,

            relation:
                "EXTENSION_FOR",

            objectProtocolId,

            evidenceBasis:
                "MARKDOWN_H1_EXPLICIT_EXTENSION_FOR_ERC",

            subjectLocator:
                locator(
                    `${sourceId}:README`,
                    "README.md",
                    1
                ),

            subjectRawText:
                `# ${subjectSymbol}`,

            locator:
                locator(
                    `${sourceId}:README`,
                    "README.md",
                    3
                ),

            rawText:
                `${subjectSymbol} is an extension for ${objectProtocolId}.`
        }
    ],

    unresolvedObservationIds: [],

    errors: []

});


const sharedCandidate = (
    provenance = [
        {
            kind:
                "PROTOCOL_CONCEPT" as const,

            sourceId:
                "SOURCE-A",

            sourceRevision:
                "REV-A",

            evidenceId:
                "PC-A"
        },
        {
            kind:
                "PROTOCOL_CONCEPT" as const,

            sourceId:
                "SOURCE-B",

            sourceRevision:
                "REV-B",

            evidenceId:
                "PC-B"
        }
    ]
): ScientificCompositionCandidate => ({

    candidateId:
        "CANDIDATE-SHARED-BALANCE",

    participantA: {
        kind:
            "PROTOCOL",

        id:
            "ERC-101"
    },

    participantB: {
        kind:
            "PROTOCOL",

        id:
            "ERC-202"
    },

    mechanism:
        "SHARED_RECURRENT_CONCEPT",

    conceptId:
        "CONCEPT-BALANCE",

    supportingCapabilityIdsA: [
        "LEXICAL-ERC-101-A",
        "LEXICAL-ERC-101-B"
    ],

    supportingCapabilityIdsB: [
        "LEXICAL-ERC-202-A",
        "LEXICAL-ERC-202-B"
    ],

    provenance,

    evaluationStatus:
        "UNEVALUATED"

});


const extensionCandidate = (
    sourceRevision:
        string | undefined =
            "REV-EXT"
): ScientificCompositionCandidate => ({

    candidateId:
        "CANDIDATE-EXTENSION-505",

    participantA: {
        kind:
            "SYMBOLIC_SUBJECT",

        id:
            "IExampleExtension"
    },

    participantB: {
        kind:
            "PROTOCOL",

        id:
            "ERC-505"
    },

    mechanism:
        "EXPLICIT_EXTENSION_FOR",

    supportingCapabilityIdsA: [],

    supportingCapabilityIdsB: [],

    provenance: [
        {
            kind:
                "PROTOCOL_RELATION",

            sourceId:
                "SOURCE-EXT",

            ...(sourceRevision !== undefined
                ? {
                    sourceRevision
                }
                : {}),

            evidenceId:
                "REL-EXT-505"
        }
    ],

    evaluationStatus:
        "UNEVALUATED"

});


const baseFacts:
    ScientificSourceFact[] = [

        functionFact(
            "FACT-A-FUNCTION",
            "SOURCE-A",
            "REV-A",
            "OBS-A",
            "INTERFACE",
            "IERC101",
            "balanceOf",
            10
        ),

        requireFact(
            "FACT-A-REQUIRE",
            "SOURCE-A",
            "REV-A",
            "OBS-A",
            "INTERFACE",
            "IERC101",
            "require(balance >= amount);",
            20
        ),

        revertFact(
            "FACT-A-REVERT",
            "SOURCE-A",
            "REV-A",
            "OBS-A",
            "INTERFACE",
            "IERC101",
            "revert BalanceTooLow();",
            21
        ),

        requireFact(
            "FACT-A-UNRELATED",
            "SOURCE-A",
            "REV-A",
            "OBS-A-OTHER",
            "CONTRACT",
            "UnrelatedContainer",
            "require(unrelated == true);",
            30
        ),

        requireFact(
            "FACT-A-WRONG-REVISION",
            "SOURCE-A",
            "REV-OTHER",
            "OBS-A",
            "INTERFACE",
            "IERC101",
            "require(wrongRevision == false);",
            31
        ),

        functionFact(
            "FACT-B-FUNCTION",
            "SOURCE-B",
            "REV-B",
            "OBS-B",
            "CONTRACT",
            "ERC202",
            "totalBalance",
            10
        ),

        requireFact(
            "FACT-B-REQUIRE",
            "SOURCE-B",
            "REV-B",
            "OBS-B",
            "CONTRACT",
            "ERC202",
            "require(total <= limit);",
            20
        )

    ];


const conceptA =
    protocolConceptResult(
        "SOURCE-A",
        "REV-A",
        "PC-A",
        "ERC-101",
        "CONCEPT-BALANCE",
        "FACT-A-FUNCTION"
    );


const conceptB =
    protocolConceptResult(
        "SOURCE-B",
        "REV-B",
        "PC-B",
        "ERC-202",
        "CONCEPT-BALANCE",
        "FACT-B-FUNCTION"
    );


const baseDiscovery:
    ScientificCrossProtocolCompositionResult = {

        candidates: [
            sharedCandidate()
        ],

        errors: []

    };


const buildShared = (
    facts:
        ScientificSourceFact[] =
            baseFacts,

    discovery:
        ScientificCrossProtocolCompositionResult =
            baseDiscovery,

    concepts:
        ScientificProtocolConceptAttributionResult[] =
            [
                conceptA,
                conceptB
            ]
) =>
    engine.build({

        discovery,

        facts,

        protocolConceptResults:
            concepts,

        protocolRelationEvidenceResults: []

    });


const checks: Array<{
    name: string;
    run: () => void;
}> = [

    {
        name:
            "SHARED CONCEPT BUILDS ONE SPECIFICATION",

        run: () => {

            const result =
                buildShared();

            assert.equal(
                result.errors.length,
                0
            );

            assert.equal(
                result.specifications.length,
                1
            );

        }
    },

    {
        name:
            "BILATERAL EXPLICIT REQUIRE EVIDENCE MAKES SPECIFICATION READY",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.equal(
                specification.status,
                "READY"
            );

            assert.notEqual(
                specification.scientificCriteria,
                null
            );

        }
    },

    {
        name:
            "READY SPECIFICATION USES OBSERVED CONSTRAINT PRESERVATION CRITERIA",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.deepEqual(
                specification.scientificCriteria,
                {
                    relation:
                        "PRESERVES_OBSERVED_CONSTRAINTS",

                    support: {
                        expectedPolarity:
                            "SUPPORT",

                        condition:
                            "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"
                    },

                    challenge: {
                        expectedPolarity:
                            "CHALLENGE",

                        condition:
                            "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"
                    },

                    inconclusive: {
                        whenNoScientificPolarity:
                            true
                    }
                }
            );

        }
    },

    {
        name:
            "PARTICIPANT A RECEIVES ONLY ITS EXACT REQUIRE CONSTRAINT",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            const constraints =
                specification.constraints.filter(
                    item =>
                        item.participantSide ===
                        "A"
                );

            assert.equal(
                constraints.length,
                1
            );

            assert.equal(
                constraints[0].factId,
                "FACT-A-REQUIRE"
            );

            assert.equal(
                constraints[0].participantId,
                "ERC-101"
            );

            assert.equal(
                constraints[0].containerSymbol,
                "IERC101"
            );

        }
    },

    {
        name:
            "PARTICIPANT B RECEIVES ONLY ITS EXACT REQUIRE CONSTRAINT",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            const constraints =
                specification.constraints.filter(
                    item =>
                        item.participantSide ===
                        "B"
                );

            assert.equal(
                constraints.length,
                1
            );

            assert.equal(
                constraints[0].factId,
                "FACT-B-REQUIRE"
            );

            assert.equal(
                constraints[0].participantId,
                "ERC-202"
            );

            assert.equal(
                constraints[0].containerSymbol,
                "ERC202"
            );

        }
    },

    {
        name:
            "UNRELATED CONTAINER REQUIRE DOES NOT LEAK",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.equal(
                specification.constraints.some(
                    item =>
                        item.factId ===
                        "FACT-A-UNRELATED"
                ),
                false
            );

        }
    },

    {
        name:
            "WRONG REVISION REQUIRE DOES NOT LEAK",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.equal(
                specification.constraints.some(
                    item =>
                        item.factId ===
                        "FACT-A-WRONG-REVISION"
                ),
                false
            );

        }
    },

    {
        name:
            "REVERT IS PRESERVED AS UNRESOLVED GUARD NOT CONSTRAINT",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.deepEqual(
                specification.unresolvedGuardFactIds,
                [
                    "FACT-A-REVERT"
                ]
            );

            assert.equal(
                specification.constraints.some(
                    item =>
                        item.factId ===
                        "FACT-A-REVERT"
                ),
                false
            );

        }
    },

    {
        name:
            "CONSTRAINT PRESERVES RAW REQUIRE TEXT",

        run: () => {

            const constraint =
                buildShared()
                    .specifications[0]
                    .constraints
                    .find(
                        item =>
                            item.factId ===
                            "FACT-A-REQUIRE"
                    );

            assert.ok(
                constraint
            );

            assert.equal(
                constraint.rawText,
                "require(balance >= amount);"
            );

        }
    },

    {
        name:
            "CONSTRAINT PRESERVES STRUCTURED FACT LOCATOR",

        run: () => {

            const constraint =
                buildShared()
                    .specifications[0]
                    .constraints
                    .find(
                        item =>
                            item.factId ===
                            "FACT-A-REQUIRE"
                    );

            assert.ok(
                constraint
            );

            assert.equal(
                constraint.locator.filePath,
                "contracts/IERC101.sol"
            );

            assert.equal(
                constraint.locator.startLine,
                20
            );

            assert.equal(
                constraint.locator.endLine,
                20
            );

        }
    },

    {
        name:
            "SPECIFICATION PRESERVES SORTED SOURCE IDS",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.deepEqual(
                specification.sourceIds,
                [
                    "SOURCE-A",
                    "SOURCE-B"
                ]
            );

        }
    },

    {
        name:
            "SPECIFICATION PRESERVES SORTED CANDIDATE EVIDENCE IDS",

        run: () => {

            const specification =
                buildShared()
                    .specifications[0];

            assert.deepEqual(
                specification.targetEvidenceIds,
                [
                    "PC-A",
                    "PC-B"
                ]
            );

        }
    },

    {
        name:
            "MISSING PARTICIPANT B REQUIRE IS INSUFFICIENT EVIDENCE",

        run: () => {

            const facts =
                baseFacts.filter(
                    fact =>
                        fact.factId !==
                        "FACT-B-REQUIRE"
                );

            const specification =
                buildShared(
                    facts
                )
                    .specifications[0];

            assert.equal(
                specification.status,
                "INSUFFICIENT_EVIDENCE"
            );

            assert.equal(
                specification.participantBConstraintIds.length,
                0
            );

            assert.equal(
                specification.scientificCriteria,
                null
            );

        }
    },

    {
        name:
            "REVERT ONLY DOES NOT MAKE PARTICIPANT READY",

        run: () => {

            const facts =
                baseFacts
                    .filter(
                        fact =>
                            fact.factId !==
                            "FACT-B-REQUIRE"
                    )
                    .concat(
                        revertFact(
                            "FACT-B-REVERT",
                            "SOURCE-B",
                            "REV-B",
                            "OBS-B",
                            "CONTRACT",
                            "ERC202",
                            "revert LimitExceeded();",
                            22
                        )
                    );

            const specification =
                buildShared(
                    facts
                )
                    .specifications[0];

            assert.equal(
                specification.status,
                "INSUFFICIENT_EVIDENCE"
            );

            assert.equal(
                specification.participantBConstraintIds.length,
                0
            );

            assert.equal(
                specification.unresolvedGuardFactIds.includes(
                    "FACT-B-REVERT"
                ),
                true
            );

        }
    },

    {
        name:
            "INPUT ORDER DOES NOT CHANGE SCIENTIFIC SPECIFICATION",

        run: () => {

            const baseline =
                buildShared();

            const reversedCandidate =
                sharedCandidate(
                    [
                        ...sharedCandidate()
                            .provenance
                    ].reverse()
                );

            const shuffledDiscovery:
                ScientificCrossProtocolCompositionResult = {

                    candidates: [
                        reversedCandidate
                    ],

                    errors: []

                };

            const shuffled =
                buildShared(
                    [
                        ...baseFacts
                    ].reverse(),

                    shuffledDiscovery,

                    [
                        conceptB,
                        conceptA
                    ]
                );

            assert.deepEqual(
                shuffled,
                baseline
            );

        }
    },

    {
        name:
            "UNRELATED FACT DOES NOT CHANGE SPECIFICATION ID",

        run: () => {

            const baseline =
                buildShared()
                    .specifications[0];

            const withUnrelated =
                buildShared(
                    [
                        ...baseFacts,

                        requireFact(
                            "FACT-UNRELATED-SOURCE",
                            "SOURCE-C",
                            "REV-C",
                            "OBS-C",
                            "CONTRACT",
                            "ERC999",
                            "require(unrelatedSource);",
                            5
                        )
                    ]
                )
                    .specifications[0];

            assert.equal(
                withUnrelated.specificationId,
                baseline.specificationId
            );

        }
    },

    {
        name:
            "EXTENSION RELATION MATCHES SYMBOLIC SUBJECT EXACTLY",

        run: () => {

            const facts:
                ScientificSourceFact[] = [

                    functionFact(
                        "FACT-EXT-FUNCTION",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-EXT",
                        "INTERFACE",
                        "IExampleExtension",
                        "reserve",
                        10
                    ),

                    requireFact(
                        "FACT-EXT-REQUIRE",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-EXT",
                        "INTERFACE",
                        "IExampleExtension",
                        "require(locked <= value);",
                        20
                    ),

                    requireFact(
                        "FACT-EXT-NEAR-MISS",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-EXT-OTHER",
                        "INTERFACE",
                        "IExampleExtensionExtra",
                        "require(shouldNotLeak);",
                        21
                    ),

                    functionFact(
                        "FACT-505-FUNCTION",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-505",
                        "INTERFACE",
                        "IERC505",
                        "valueOf",
                        10
                    ),

                    requireFact(
                        "FACT-505-REQUIRE",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-505",
                        "INTERFACE",
                        "IERC505",
                        "require(value > 0);",
                        20
                    ),

                    requireFact(
                        "FACT-505-SUFFIX",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-505-SUFFIX",
                        "INTERFACE",
                        "IERC505Extension",
                        "require(suffixShouldNotLeak);",
                        22
                    )

                ];

            const relation =
                relationEvidenceResult(
                    "SOURCE-EXT",
                    "REV-EXT",
                    "REL-EXT-505",
                    "IExampleExtension",
                    "ERC-505"
                );

            const result =
                engine.build({

                    discovery: {
                        candidates: [
                            extensionCandidate()
                        ],
                        errors: []
                    },

                    facts,

                    protocolConceptResults: [],

                    protocolRelationEvidenceResults: [
                        relation
                    ]

                });

            assert.equal(
                result.errors.length,
                0
            );

            const specification =
                result.specifications[0];

            assert.equal(
                specification.status,
                "READY"
            );

            assert.deepEqual(
                specification.constraints
                    .map(
                        item =>
                            item.factId
                    )
                    .sort(),
                [
                    "FACT-505-REQUIRE",
                    "FACT-EXT-REQUIRE"
                ].sort()
            );

            assert.equal(
                specification.constraints.some(
                    item =>
                        item.factId ===
                        "FACT-EXT-NEAR-MISS"
                ),
                false
            );

            assert.equal(
                specification.constraints.some(
                    item =>
                        item.factId ===
                        "FACT-505-SUFFIX"
                ),
                false
            );

        }
    },

    {
        name:
            "EXTENSION OBJECT PROTOCOL DOES NOT ALIAS SUFFIXED CONTAINER",

        run: () => {

            const facts:
                ScientificSourceFact[] = [

                    functionFact(
                        "FACT-EXT2-FUNCTION",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-EXT2",
                        "INTERFACE",
                        "IExampleExtension",
                        "reserve",
                        10
                    ),

                    requireFact(
                        "FACT-EXT2-REQUIRE",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-EXT2",
                        "INTERFACE",
                        "IExampleExtension",
                        "require(locked <= value);",
                        20
                    ),

                    requireFact(
                        "FACT-505-ONLY-SUFFIX",
                        "SOURCE-EXT",
                        "REV-EXT",
                        "OBS-505-SUFFIX",
                        "INTERFACE",
                        "IERC505Extension",
                        "require(value > 0);",
                        20
                    )

                ];

            const result =
                engine.build({

                    discovery: {
                        candidates: [
                            extensionCandidate()
                        ],
                        errors: []
                    },

                    facts,

                    protocolConceptResults: [],

                    protocolRelationEvidenceResults: [
                        relationEvidenceResult(
                            "SOURCE-EXT",
                            "REV-EXT",
                            "REL-EXT-505",
                            "IExampleExtension",
                            "ERC-505"
                        )
                    ]

                });

            const specification =
                result.specifications[0];

            assert.equal(
                specification.status,
                "INSUFFICIENT_EVIDENCE"
            );

            assert.equal(
                specification.participantBConstraintIds.length,
                0
            );

        }
    },

    {
        name:
            "DISCOVERY ERROR FAILS CLOSED",

        run: () => {

            const result =
                buildShared(
                    baseFacts,
                    {
                        candidates: [
                            sharedCandidate()
                        ],
                        errors: [
                            "synthetic upstream failure"
                        ]
                    }
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.length,
                1
            );

        }
    },

    {
        name:
            "MISSING PROTOCOL CONCEPT PROVENANCE FAILS CLOSED",

        run: () => {

            const candidate =
                sharedCandidate(
                    [
                        {
                            kind:
                                "PROTOCOL_CONCEPT",

                            sourceId:
                                "SOURCE-A",

                            sourceRevision:
                                "REV-A",

                            evidenceId:
                                "PC-MISSING"
                        }
                    ]
                );

            const result =
                buildShared(
                    baseFacts,
                    {
                        candidates: [
                            candidate
                        ],
                        errors: []
                    }
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "references missing protocol concept PC-MISSING"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "PROVENANCE SOURCE MISMATCH FAILS CLOSED",

        run: () => {

            const candidate =
                sharedCandidate(
                    [
                        {
                            kind:
                                "PROTOCOL_CONCEPT",

                            sourceId:
                                "SOURCE-WRONG",

                            sourceRevision:
                                "REV-A",

                            evidenceId:
                                "PC-A"
                        },
                        {
                            kind:
                                "PROTOCOL_CONCEPT",

                            sourceId:
                                "SOURCE-B",

                            sourceRevision:
                                "REV-B",

                            evidenceId:
                                "PC-B"
                        }
                    ]
                );

            const result =
                buildShared(
                    baseFacts,
                    {
                        candidates: [
                            candidate
                        ],
                        errors: []
                    }
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "source mismatch"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "PROVENANCE REVISION MISMATCH FAILS CLOSED",

        run: () => {

            const candidate =
                sharedCandidate(
                    [
                        {
                            kind:
                                "PROTOCOL_CONCEPT",

                            sourceId:
                                "SOURCE-A",

                            sourceRevision:
                                "REV-WRONG",

                            evidenceId:
                                "PC-A"
                        },
                        {
                            kind:
                                "PROTOCOL_CONCEPT",

                            sourceId:
                                "SOURCE-B",

                            sourceRevision:
                                "REV-B",

                            evidenceId:
                                "PC-B"
                        }
                    ]
                );

            const result =
                buildShared(
                    baseFacts,
                    {
                        candidates: [
                            candidate
                        ],
                        errors: []
                    }
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "revision mismatch"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "DUPLICATE SCIENTIFIC FACT ID FAILS CLOSED",

        run: () => {

            const duplicated =
                [
                    ...baseFacts,
                    {
                        ...baseFacts[0]
                    }
                ];

            const result =
                buildShared(
                    duplicated
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "Duplicate scientific fact id"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "DUPLICATE COMPOSITION CANDIDATE ID FAILS CLOSED",

        run: () => {

            const result =
                buildShared(
                    baseFacts,
                    {
                        candidates: [
                            sharedCandidate(),
                            sharedCandidate()
                        ],
                        errors: []
                    }
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "Duplicate composition candidate id"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "UPSTREAM PROTOCOL CONCEPT ERROR FAILS CLOSED",

        run: () => {

            const brokenConcept:
                ScientificProtocolConceptAttributionResult = {

                    ...conceptA,

                    errors: [
                        "synthetic concept failure"
                    ]

                };

            const result =
                buildShared(
                    baseFacts,
                    baseDiscovery,
                    [
                        brokenConcept,
                        conceptB
                    ]
                );

            assert.equal(
                result.specifications.length,
                0
            );

            assert.equal(
                result.errors.some(
                    error =>
                        error.includes(
                            "Protocol concept attribution error"
                        )
                ),
                true
            );

        }
    },

    {
        name:
            "ABSENT REVISION AND LITERAL UNVERSIONED PRODUCE DISTINCT IDENTITIES",

        run: () => {

            const absentFacts:
                ScientificSourceFact[] = [

                    functionFact(
                        "FACT-ABSENT-A-FUNCTION",
                        "SOURCE-ABSENT-A",
                        undefined,
                        "OBS-ABSENT-A",
                        "INTERFACE",
                        "IERC601",
                        "alpha",
                        10
                    ),

                    requireFact(
                        "FACT-ABSENT-A-REQUIRE",
                        "SOURCE-ABSENT-A",
                        undefined,
                        "OBS-ABSENT-A",
                        "INTERFACE",
                        "IERC601",
                        "require(alpha > 0);",
                        20
                    ),

                    functionFact(
                        "FACT-ABSENT-B-FUNCTION",
                        "SOURCE-ABSENT-B",
                        undefined,
                        "OBS-ABSENT-B",
                        "INTERFACE",
                        "IERC602",
                        "beta",
                        10
                    ),

                    requireFact(
                        "FACT-ABSENT-B-REQUIRE",
                        "SOURCE-ABSENT-B",
                        undefined,
                        "OBS-ABSENT-B",
                        "INTERFACE",
                        "IERC602",
                        "require(beta > 0);",
                        20
                    )

                ];

            const absentCandidate:
                ScientificCompositionCandidate = {

                    candidateId:
                        "CANDIDATE-REVISION-IDENTITY",

                    participantA: {
                        kind:
                            "PROTOCOL",
                        id:
                            "ERC-601"
                    },

                    participantB: {
                        kind:
                            "PROTOCOL",
                        id:
                            "ERC-602"
                    },

                    mechanism:
                        "SHARED_RECURRENT_CONCEPT",

                    conceptId:
                        "CONCEPT-REVISION",

                    supportingCapabilityIdsA: [
                        "LEXICAL-A1",
                        "LEXICAL-A2"
                    ],

                    supportingCapabilityIdsB: [
                        "LEXICAL-B1",
                        "LEXICAL-B2"
                    ],

                    provenance: [
                        {
                            kind:
                                "PROTOCOL_CONCEPT",
                            sourceId:
                                "SOURCE-ABSENT-A",
                            evidenceId:
                                "PC-ABSENT-A"
                        },
                        {
                            kind:
                                "PROTOCOL_CONCEPT",
                            sourceId:
                                "SOURCE-ABSENT-B",
                            evidenceId:
                                "PC-ABSENT-B"
                        }
                    ],

                    evaluationStatus:
                        "UNEVALUATED"

                };

            const absentResult =
                engine.build({

                    discovery: {
                        candidates: [
                            absentCandidate
                        ],
                        errors: []
                    },

                    facts:
                        absentFacts,

                    protocolConceptResults: [
                        protocolConceptResult(
                            "SOURCE-ABSENT-A",
                            undefined,
                            "PC-ABSENT-A",
                            "ERC-601",
                            "CONCEPT-REVISION",
                            "FACT-ABSENT-A-FUNCTION"
                        ),
                        protocolConceptResult(
                            "SOURCE-ABSENT-B",
                            undefined,
                            "PC-ABSENT-B",
                            "ERC-602",
                            "CONCEPT-REVISION",
                            "FACT-ABSENT-B-FUNCTION"
                        )
                    ],

                    protocolRelationEvidenceResults: []

                });


            const literalFacts =
                absentFacts.map(
                    fact => ({
                        ...fact,
                        sourceRevision:
                            "UNVERSIONED"
                    })
                );


            const literalCandidate:
                ScientificCompositionCandidate = {

                    ...absentCandidate,

                    provenance:
                        absentCandidate.provenance.map(
                            provenance => ({
                                ...provenance,
                                sourceRevision:
                                    "UNVERSIONED"
                            })
                        )

                };


            const literalResult =
                engine.build({

                    discovery: {
                        candidates: [
                            literalCandidate
                        ],
                        errors: []
                    },

                    facts:
                        literalFacts,

                    protocolConceptResults: [
                        protocolConceptResult(
                            "SOURCE-ABSENT-A",
                            "UNVERSIONED",
                            "PC-ABSENT-A",
                            "ERC-601",
                            "CONCEPT-REVISION",
                            "FACT-ABSENT-A-FUNCTION"
                        ),
                        protocolConceptResult(
                            "SOURCE-ABSENT-B",
                            "UNVERSIONED",
                            "PC-ABSENT-B",
                            "ERC-602",
                            "CONCEPT-REVISION",
                            "FACT-ABSENT-B-FUNCTION"
                        )
                    ],

                    protocolRelationEvidenceResults: []

                });


            assert.equal(
                absentResult.errors.length,
                0
            );

            assert.equal(
                literalResult.errors.length,
                0
            );

            assert.equal(
                absentResult.specifications[0].status,
                "READY"
            );

            assert.equal(
                literalResult.specifications[0].status,
                "READY"
            );

            assert.notEqual(
                absentResult.specifications[0].specificationId,
                literalResult.specifications[0].specificationId
            );

        }
    }

];


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION EVALUATION SPECIFICATION - RUNTIME"
);
console.log(
    "--------------------------------------------------------"
);


let passed =
    0;

let failed =
    0;


for (
    const check
    of checks
) {

    try {

        check.run();

        passed +=
            1;

        console.log(
            `${check.name}: PASS`
        );

    } catch (
        error
    ) {

        failed +=
            1;

        console.log(
            `${check.name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

    }

}


console.log("");
console.log(
    `PASS: ${passed}`
);
console.log(
    `FAIL: ${failed}`
);


if (
    failed ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        "RESULT: FAIL"
    );

    process.exitCode =
        1;

}
