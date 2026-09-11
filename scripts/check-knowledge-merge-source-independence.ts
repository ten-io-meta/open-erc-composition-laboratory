import {
    KnowledgeMergeEngine
} from "../laboratory/research-knowledge/KnowledgeMergeEngine.js";

function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {
        throw new Error(
            `FAIL: ${message}`
        );
    }

    console.log(
        `PASS: ${message}`
    );

}

console.log(
    "\n=== PHASE 10.3J4 — KNOWLEDGE MERGE SOURCE INDEPENDENCE REGRESSION ===\n"
);

/*
 * Three observed source identities support the same relation.
 *
 * There is deliberately NO established scientific
 * independence between them.
 */
const knowledgeBases = [

    {
        knowledgeBaseId:
            "KB-SOURCE-A",

        generatedAt:
            new Date().toISOString(),

        entries: [
            {
                entryId:
                    "ENTRY-A",

                sourceId:
                    "SOURCE-A",

                relation:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                protocolPair:
                    "RESERVATION->ACCOUNTING",

                observations:
                    1,

                averageConfidence:
                    90,

                confirmed:
                    0,

                partial:
                    1,

                unsupported:
                    0,

                status:
                    "EMERGING",

                evidence: [
                    "evidence-a"
                ],

                generatedBy:
                    "LEARNING",

                timestamp:
                    new Date().toISOString()
            }
        ],

        statistics: {
            entries: 1,
            totalObservations: 1,
            emerging: 1,
            supported: 0,
            validated: 0,
            canonical: 0,
            rejected: 0
        },

        processedSources: [
            {
                sourceId:
                    "SOURCE-A",

                processedAt:
                    new Date().toISOString()
            }
        ]
    },

    {
        knowledgeBaseId:
            "KB-SOURCE-B",

        generatedAt:
            new Date().toISOString(),

        entries: [
            {
                entryId:
                    "ENTRY-B",

                sourceId:
                    "SOURCE-B",

                relation:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                protocolPair:
                    "RESERVATION->ACCOUNTING",

                observations:
                    1,

                averageConfidence:
                    90,

                confirmed:
                    0,

                partial:
                    1,

                unsupported:
                    0,

                status:
                    "EMERGING",

                evidence: [
                    "evidence-b"
                ],

                generatedBy:
                    "LEARNING",

                timestamp:
                    new Date().toISOString()
            }
        ],

        statistics: {
            entries: 1,
            totalObservations: 1,
            emerging: 1,
            supported: 0,
            validated: 0,
            canonical: 0,
            rejected: 0
        },

        processedSources: [
            {
                sourceId:
                    "SOURCE-B",

                processedAt:
                    new Date().toISOString()
            }
        ]
    },

    {
        knowledgeBaseId:
            "KB-SOURCE-C",

        generatedAt:
            new Date().toISOString(),

        entries: [
            {
                entryId:
                    "ENTRY-C",

                sourceId:
                    "SOURCE-C",

                relation:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                protocolPair:
                    "RESERVATION->ACCOUNTING",

                observations:
                    1,

                averageConfidence:
                    90,

                confirmed:
                    0,

                partial:
                    1,

                unsupported:
                    0,

                status:
                    "EMERGING",

                evidence: [
                    "evidence-c"
                ],

                generatedBy:
                    "LEARNING",

                timestamp:
                    new Date().toISOString()
            }
        ],

        statistics: {
            entries: 1,
            totalObservations: 1,
            emerging: 1,
            supported: 0,
            validated: 0,
            canonical: 0,
            rejected: 0
        },

        processedSources: [
            {
                sourceId:
                    "SOURCE-C",

                processedAt:
                    new Date().toISOString()
            }
        ]
    }

] as any;

const result =
    new KnowledgeMergeEngine().merge(
        knowledgeBases,
        []
    );

const entry =
    result.knowledge.entries[0];

assert(
    Boolean(entry),
    "merged knowledge entry was created"
);

assert(
    entry.sources?.length === 3,
    "three observed source identities are preserved as provenance"
);

assert(
    entry.observations === 3,
    "observations from all three sources are merged"
);

assert(
    entry.status === "EMERGING",
    "three observed source identities do not become three independent sources"
);

assert(
    result.knowledge.statistics.validated === 0,
    "merge does not falsely validate knowledge from source identity count"
);

assert(
    result.knowledge.statistics.canonical === 0,
    "merge does not falsely canonicalize knowledge from source identity count"
);

console.log(
    "\nPHASE 10.3J4 KNOWLEDGE MERGE SOURCE INDEPENDENCE REGRESSION PASSED\n"
);