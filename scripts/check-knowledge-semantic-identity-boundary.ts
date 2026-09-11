import {
    ReasoningKnowledgeAdapter
} from "../laboratory/research-knowledge/ReasoningKnowledgeAdapter.js";

import {
    KnowledgeMergeEngine
} from "../laboratory/research-knowledge/KnowledgeMergeEngine.js";

import {
    IncrementalKnowledgeBuilder
} from "../laboratory/incremental-knowledge/IncrementalKnowledgeBuilder.js";

import {
    KnowledgeConflictDetector
} from "../laboratory/incremental-knowledge/KnowledgeConflictDetector.js";

import {
    ResearchMemoryEngine
} from "../laboratory/research-memory/ResearchMemoryEngine.js";

const timestamp =
    "2026-01-01T00:00:00.000Z";

/*
 * Part 1:
 * prove that machine reasoning must not manufacture
 * protocol identity from semantic capabilities.
 */

const machineReasoning: any = {
    generatedAt:
        timestamp,

    sourceId:
        "SOURCE-REASONING",

    inferences: [
        {
            inferenceId:
                "INF-00001",

            sourceId:
                "SOURCE-REASONING",

            subject:
                "CapabilityA",

            relation:
                "ENABLES",

            object:
                "CapabilityB",

            reason:
                "Controlled inference A",

            confidence:
                80,

            evidence:
                ["EVIDENCE-A"]
        },
        {
            inferenceId:
                "INF-00002",

            sourceId:
                "SOURCE-REASONING",

            subject:
                "CapabilityC",

            relation:
                "ENABLES",

            object:
                "CapabilityD",

            reason:
                "Controlled inference B",

            confidence:
                75,

            evidence:
                ["EVIDENCE-B"]
        }
    ],

    errors:
        []
};

const adapted =
    ReasoningKnowledgeAdapter.toKnowledgeEntries(
        machineReasoning,
        0,
        "SOURCE-REASONING"
    ) as any[];

const adaptedA =
    adapted[0];

const adaptedB =
    adapted[1];

/*
 * Part 2:
 * model the scientifically correct identity shape
 * and prove that downstream engines do not collapse
 * distinct capability relations merely because
 * protocolPair is absent.
 */

const capabilityEntryA: any = {
    entryId:
        "KNOW-CAP-A",

    sourceId:
        "SOURCE-A",

    sources:
        ["SOURCE-A"],

    relation:
        "ENABLES",

    protocolPair:
        undefined,

    capabilityPair:
        "CapabilityA->CapabilityB",

    observations:
        1,

    averageConfidence:
        90,

    confirmed:
        1,

    partial:
        0,

    unsupported:
        0,

    status:
        "SUPPORTED",

    evidence:
        ["EVIDENCE-A"],

    generatedBy:
        "MACHINE_REASONING",

    timestamp
};

const capabilityEntryB: any = {
    entryId:
        "KNOW-CAP-B",

    sourceId:
        "SOURCE-B",

    sources:
        ["SOURCE-B"],

    relation:
        "ENABLES",

    protocolPair:
        undefined,

    capabilityPair:
        "CapabilityC->CapabilityD",

    observations:
        1,

    averageConfidence:
        20,

    confirmed:
        0,

    partial:
        0,

    unsupported:
        1,

    status:
        "REJECTED",

    evidence:
        ["EVIDENCE-B"],

    generatedBy:
        "MACHINE_REASONING",

    timestamp
};

const knowledgeA =
    buildKnowledge(
        "KB-A",
        [capabilityEntryA]
    );

const knowledgeB =
    buildKnowledge(
        "KB-B",
        [capabilityEntryB]
    );

const combinedKnowledge =
    buildKnowledge(
        "KB-COMBINED",
        [
            capabilityEntryA,
            capabilityEntryB
        ]
    );

/*
 * Global merge boundary.
 */

const mergeResult =
    new KnowledgeMergeEngine().merge(
        [
            knowledgeA,
            knowledgeB
        ]
    );

/*
 * Incremental merge boundary.
 */

const incrementalResult =
    new IncrementalKnowledgeBuilder().merge(
        knowledgeA,
        knowledgeB
    );

/*
 * Conflict boundary.
 *
 * Different capability identities must not conflict
 * merely because relation=ENABLES and protocolPair
 * is absent in both.
 */

const conflicts =
    new KnowledgeConflictDetector().detect(
        knowledgeA,
        knowledgeB
    );

/*
 * Research-memory boundary.
 */

const memoryResult =
    new ResearchMemoryEngine().update(
        null,
        combinedKnowledge,
        "CONTROLLED-SOURCE"
    );

const timelines =
    memoryResult.memory.timelines as any[];

const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "TWO MACHINE REASONING ENTRIES CREATED",
        passed:
            adapted.length === 2
    },
    {
        name:
            "MACHINE REASONING PRESERVES SEMANTIC RELATION",
        passed:
            adaptedA?.relation === "ENABLES" &&
            adaptedB?.relation === "ENABLES"
    },
    {
        name:
            "MACHINE REASONING DOES NOT INVENT PROTOCOL PAIR",
        passed:
            adaptedA?.protocolPair === undefined &&
            adaptedB?.protocolPair === undefined
    },
    {
        name:
            "FIRST CAPABILITY PAIR PRESERVED",
        passed:
            adaptedA?.capabilityPair ===
                "CapabilityA->CapabilityB"
    },
    {
        name:
            "SECOND CAPABILITY PAIR PRESERVED",
        passed:
            adaptedB?.capabilityPair ===
                "CapabilityC->CapabilityD"
    },
    {
        name:
            "CAPABILITY IDENTITIES REMAIN DISTINCT",
        passed:
            adaptedA?.capabilityPair !==
                adaptedB?.capabilityPair
    },
    {
        name:
            "GLOBAL KNOWLEDGE MERGE DOES NOT COLLAPSE DISTINCT CAPABILITY PAIRS",
        passed:
            mergeResult.knowledge.entries.length ===
                2
    },
    {
        name:
            "GLOBAL KNOWLEDGE MERGE PRESERVES BOTH CAPABILITY PAIRS",
        passed:
            hasCapabilityPairs(
                mergeResult.knowledge.entries as any[],
                [
                    "CapabilityA->CapabilityB",
                    "CapabilityC->CapabilityD"
                ]
            )
    },
    {
        name:
            "INCREMENTAL KNOWLEDGE DOES NOT COLLAPSE DISTINCT CAPABILITY PAIRS",
        passed:
            incrementalResult.knowledge.entries.length ===
                2
    },
    {
        name:
            "INCREMENTAL KNOWLEDGE PRESERVES BOTH CAPABILITY PAIRS",
        passed:
            hasCapabilityPairs(
                incrementalResult.knowledge.entries as any[],
                [
                    "CapabilityA->CapabilityB",
                    "CapabilityC->CapabilityD"
                ]
            )
    },
    {
        name:
            "DISTINCT CAPABILITY PAIRS DO NOT CREATE FALSE KNOWLEDGE CONFLICT",
        passed:
            conflicts.length === 0
    },
    {
        name:
            "RESEARCH MEMORY CREATES TWO DISTINCT TIMELINES",
        passed:
            timelines.length === 2
    },
    {
        name:
            "RESEARCH MEMORY PRESERVES FIRST CAPABILITY PAIR",
        passed:
            timelines.some(
                timeline =>
                    timeline.capabilityPair ===
                    "CapabilityA->CapabilityB"
            )
    },
    {
        name:
            "RESEARCH MEMORY PRESERVES SECOND CAPABILITY PAIR",
        passed:
            timelines.some(
                timeline =>
                    timeline.capabilityPair ===
                    "CapabilityC->CapabilityD"
            )
    },
    {
        name:
            "RESEARCH MEMORY DOES NOT MATERIALIZE UNDEFINED AS PROTOCOL IDENTITY",
        passed:
            !timelines.some(
                timeline =>
                    timeline.protocolPair ===
                    "undefined"
            )
    }
];

console.log("");
console.log(
    "KNOWLEDGE SEMANTIC IDENTITY BOUNDARY"
);
console.log(
    "------------------------------------"
);

for (const check of checks) {
    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );
}

const failures =
    checks.filter(
        check =>
            !check.passed
    );

console.log("");

if (failures.length === 0) {
    console.log(
        "RESULT: PASS"
    );
} else {
    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode = 1;
}

function buildKnowledge(
    knowledgeBaseId: string,
    entries: any[]
): any {
    return {
        knowledgeBaseId,

        generatedAt:
            timestamp,

        entries,

        statistics: {
            entries:
                entries.length,

            totalObservations:
                entries.reduce(
                    (
                        total: number,
                        entry: any
                    ) =>
                        total +
                        entry.observations,
                    0
                ),

            emerging:
                entries.filter(
                    entry =>
                        entry.status ===
                        "EMERGING"
                ).length,

            supported:
                entries.filter(
                    entry =>
                        entry.status ===
                        "SUPPORTED"
                ).length,

            validated:
                entries.filter(
                    entry =>
                        entry.status ===
                        "VALIDATED"
                ).length,

            canonical:
                entries.filter(
                    entry =>
                        entry.status ===
                        "CANONICAL"
                ).length,

            rejected:
                entries.filter(
                    entry =>
                        entry.status ===
                        "REJECTED"
                ).length
        }
    };
}

function hasCapabilityPairs(
    entries: any[],
    expected: string[]
): boolean {
    const actual =
        new Set(
            entries.map(
                entry =>
                    entry.capabilityPair
            )
        );

    return expected.every(
        capabilityPair =>
            actual.has(
                capabilityPair
            )
    );
}