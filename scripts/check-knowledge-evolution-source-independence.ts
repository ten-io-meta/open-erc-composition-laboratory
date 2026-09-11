import {
    KnowledgeConsolidationEngine
} from "../laboratory/knowledge-consolidation/KnowledgeConsolidationEngine.js";

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
    "\n=== PHASE 10.3I3 — KNOWLEDGE EVOLUTION SOURCE INDEPENDENCE REGRESSION ===\n"
);

/*
 * Controlled confidence result.
 *
 * Two observed/provenance identities may exist upstream,
 * but only the already-established independentSources
 * value is allowed to enter consolidation.
 */
const confidenceResult = {

    generatedAt:
        new Date().toISOString(),

    assessments: [
        {
            assessmentId:
                "CONFIDENCE-CONTROLLED-00001",

            sourceConclusionId:
                "CONCLUSION-CONTROLLED-00001",

            sourcePatternId:
                "PATTERN-CONTROLLED-00001",

            sourcePatternRelation:
                "RESERVATION:CONSTRAINS:ACCOUNTING",

            statement:
                "Reservation appears to constrain accounting",

            baseConfidence:
                80,

            calculatedConfidence:
                80,

            independentSources:
                0,

            maturity:
                "PRELIMINARY",

            reasons: [
                "No scientifically independent source set was established."
            ]
        }
    ],

    statistics: {
        averageConfidence: 80,
        highConfidence: 0,
        mediumConfidence: 1,
        lowConfidence: 0
    },

    errors: []

} as any;

const consolidation =
    new KnowledgeConsolidationEngine().build(
        confidenceResult
    );

const item =
    consolidation.consolidations[0];

assert(
    Boolean(item),
    "controlled consolidation was created"
);

assert(
    item.independentSources === 0,
    "zero established independent sources are preserved explicitly"
);

assert(
    item.evidenceAfter === 0,
    "independent sources are not written into evidenceAfter"
);

assert(
    item.evidenceDelta === 0,
    "independent sources are not written into evidenceDelta"
);

/*
 * Deliberately poison evidence quantity.
 *
 * This is the critical regression fixture:
 * evidence quantity must not be capable of becoming
 * scientific source independence.
 */
item.evidenceAfter = 999;
item.evidenceDelta = 999;

assert(
    item.independentSources === 0,
    "evidenceAfter = 999 does not alter explicit independentSources"
);

console.log(
    "\nPHASE 10.3I3 KNOWLEDGE EVOLUTION SOURCE INDEPENDENCE REGRESSION PASSED\n"
);