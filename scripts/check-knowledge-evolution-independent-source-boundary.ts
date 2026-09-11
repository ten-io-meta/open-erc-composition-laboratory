import {
    ScientificKnowledgeEvolutionEngine
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionEngine.js";

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
    "\n=== PHASE 10.3I4 — KNOWLEDGE EVOLUTION INDEPENDENCE BOUNDARY ===\n"
);

/*
 * The consolidation deliberately contains an absurd
 * evidence quantity while scientific independence is zero.
 *
 * Evolution must consume independentSources explicitly
 * and must never reconstruct it from evidenceAfter.
 */
const consolidation = {

    generatedAt:
        new Date().toISOString(),

    consolidations: [
        {
            consolidationId:
                "CONSOLIDATION-CONTROLLED-00001",

            knowledgeId:
                "KNOWLEDGE-CONTROLLED-00001",

            sourceConclusionId:
                "CONCLUSION-CONTROLLED-00001",

            sourcePatternId:
                "PATTERN-CONTROLLED-00001",

            sourcePatternRelation:
                "RESERVATION:CONSTRAINS:ACCOUNTING",

            statement:
                "Reservation appears to constrain accounting",

            previousStatus:
                "EMERGING",

            newStatus:
                "SUPPORTED",

            confidenceBefore:
                0,

            confidenceAfter:
                80,

            confidenceDelta:
                80,

            evidenceBefore:
                0,

            /*
             * Poison value.
             */
            evidenceAfter:
                999,

            evidenceDelta:
                999,

            /*
             * Scientific value.
             */
            independentSources:
                0,

            campaignsObserved:
                1,

            action:
                "PROMOTED",

            explanation:
                "Controlled source-independence boundary fixture."
        }
    ],

    statistics: {
        promoted: 1,
        retained: 0,
        degraded: 0,
        archived: 0,
        canonical: 0
    },

    errors: []

} as any;

const validations = {

    generatedAt:
        new Date().toISOString(),

    validations: [],

    statistics: {
        validated: 0,
        challenged: 0,
        rejected: 0,
        inconclusive: 0
    },

    errors: []

} as any;

const consensus = {

    generatedAt:
        new Date().toISOString(),

    consensus: [],

    statistics: {
        total: 0
    },

    errors: []

} as any;

const result =
    new ScientificKnowledgeEvolutionEngine().build(
        "CAMPAIGN-CONTROLLED-10.3I4",
        consolidation,
        validations,
        consensus,
        null,
        new Set()
    );

const state =
    result.states[0];

assert(
    Boolean(state),
    "scientific knowledge state was created"
);

assert(
    state.independentSources === 0,
    "evidenceAfter = 999 does not become independentSources"
);

assert(
    state.sourceHistory.at(-1) === 0,
    "source history records explicit scientific independence"
);

assert(
    state.independentSources !==
        consolidation.consolidations[0].evidenceAfter,
    "evidence quantity and source independence remain separated"
);

/*
 * Second controlled case:
 * explicit established independence must propagate.
 */
consolidation.consolidations[0].evidenceAfter =
    999;

consolidation.consolidations[0].evidenceDelta =
    999;

consolidation.consolidations[0].independentSources =
    3;

const independentResult =
    new ScientificKnowledgeEvolutionEngine().build(
        "CAMPAIGN-CONTROLLED-10.3I4-B",
        consolidation,
        validations,
        consensus,
        null,
        new Set()
    );

const independentState =
    independentResult.states[0];

assert(
    Boolean(independentState),
    "second scientific knowledge state was created"
);

assert(
    independentState.independentSources === 3,
    "explicit independentSources = 3 propagates into evolution"
);

assert(
    independentState.sourceHistory.at(-1) === 3,
    "source history preserves explicitly established independence"
);

assert(
    independentState.independentSources !== 999,
    "poisoned evidence quantity cannot override established independence"
);

console.log(
    "\nPHASE 10.3I4 KNOWLEDGE EVOLUTION INDEPENDENCE BOUNDARY PASSED\n"
);