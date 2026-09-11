import assert from "node:assert/strict";

import {
    ScientificCompositionConstraintEvaluatorEngine
} from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";

import type {
    ScientificCompositionConstraint
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";

import type {
    ScientificCompositionConstraintObservation
} from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";


const candidateId =
    "CANDIDATE-TEST";


function constraint(
    constraintId: string,
    participantSide: "A" | "B"
): ScientificCompositionConstraint {

    return {

        constraintId,

        candidateId,

        participantSide,

        participantKind:
            "PROTOCOL",

        participantId:
            participantSide ===
                "A"
                ? "ERC-A"
                : "ERC-B",

        sourceId:
            `SOURCE-${participantSide}`,

        sourceRevision:
            "1111111111111111111111111111111111111111",

        factId:
            `FACT-${constraintId}`,

        basis:
            "SOLIDITY_REQUIRE_STATEMENT",

        containerKind:
            "CONTRACT",

        containerSymbol:
            `Contract${participantSide}`,

        locator: {

            sourceLocation:
                "fixture://composition",

            filePath:
                `Contract${participantSide}.sol`,

            startLine:
                1,

            endLine:
                1

        },

        rawText:
            'require(true, "fixture");'

    };

}


function observation(
    observationId: string,
    targetConstraint:
        ScientificCompositionConstraint,
    verdict:
        "PRESERVED" | "VIOLATED"
): ScientificCompositionConstraintObservation {

    return {

        observationId,

        candidateId:
            targetConstraint.candidateId,

        constraintId:
            targetConstraint.constraintId,

        participantSide:
            targetConstraint.participantSide,

        verdict,

        evidence: [
            `EVIDENCE-${observationId}`
        ]

    };

}


const constraints = [
    constraint(
        "CONSTRAINT-A",
        "A"
    ),
    constraint(
        "CONSTRAINT-B",
        "B"
    )
];


const engine =
    new ScientificCompositionConstraintEvaluatorEngine();


console.log("");
console.log(
    "SCIENTIFIC COMPOSITION CONSTRAINT EVALUATOR"
);
console.log(
    "-------------------------------------------"
);


const none =
    engine.evaluate(
        constraints,
        []
    );

assert.equal(
    none.scientificPolarity,
    "INCONCLUSIVE"
);

assert.equal(
    none.statistics.unevaluated,
    2
);

console.log(
    "NO OBSERVATIONS REMAIN INCONCLUSIVE: PASS"
);


const partial =
    engine.evaluate(
        constraints,
        [
            observation(
                "OBS-A-PRESERVED",
                constraints[0],
                "PRESERVED"
            )
        ]
    );

assert.equal(
    partial.scientificPolarity,
    "INCONCLUSIVE"
);

assert.equal(
    partial.statistics.preserved,
    1
);

assert.equal(
    partial.statistics.unevaluated,
    1
);

console.log(
    "PARTIAL PRESERVATION REMAINS INCONCLUSIVE: PASS"
);


const allPreserved =
    engine.evaluate(
        constraints,
        [
            observation(
                "OBS-A-PRESERVED",
                constraints[0],
                "PRESERVED"
            ),
            observation(
                "OBS-B-PRESERVED",
                constraints[1],
                "PRESERVED"
            )
        ]
    );

assert.equal(
    allPreserved.scientificPolarity,
    "SUPPORT"
);

assert.equal(
    allPreserved.statistics.preserved,
    2
);

assert.equal(
    allPreserved.statistics.violated,
    0
);

assert.equal(
    allPreserved.statistics.unevaluated,
    0
);

console.log(
    "ALL CONSTRAINTS PRESERVED SUPPORT COMPOSITION: PASS"
);


const challenged =
    engine.evaluate(
        constraints,
        [
            observation(
                "OBS-A-PRESERVED",
                constraints[0],
                "PRESERVED"
            ),
            observation(
                "OBS-B-VIOLATED",
                constraints[1],
                "VIOLATED"
            )
        ]
    );

assert.equal(
    challenged.scientificPolarity,
    "CHALLENGE"
);

assert.equal(
    challenged.statistics.violated,
    1
);

console.log(
    "ANY CONSTRAINT VIOLATION CHALLENGES COMPOSITION: PASS"
);


const preservedThenViolated =
    engine.evaluate(
        constraints,
        [
            observation(
                "OBS-A-PRESERVED",
                constraints[0],
                "PRESERVED"
            ),
            observation(
                "OBS-A-VIOLATED",
                constraints[0],
                "VIOLATED"
            ),
            observation(
                "OBS-B-PRESERVED",
                constraints[1],
                "PRESERVED"
            )
        ]
    );

assert.equal(
    preservedThenViolated.scientificPolarity,
    "CHALLENGE"
);

assert.equal(
    preservedThenViolated.evaluations[0].status,
    "VIOLATED"
);

console.log(
    "VIOLATION DOMINATES PRESERVATION FOR SAME CONSTRAINT: PASS"
);


const unknownObservation:
    ScientificCompositionConstraintObservation = {

        observationId:
            "OBS-UNKNOWN",

        candidateId,

        constraintId:
            "UNKNOWN-CONSTRAINT",

        participantSide:
            "A",

        verdict:
            "PRESERVED",

        evidence: [
            "UNKNOWN-EVIDENCE"
        ]

    };


const unknown =
    engine.evaluate(
        constraints,
        [
            observation(
                "OBS-A-PRESERVED",
                constraints[0],
                "PRESERVED"
            ),
            observation(
                "OBS-B-PRESERVED",
                constraints[1],
                "PRESERVED"
            ),
            unknownObservation
        ]
    );

assert.equal(
    unknown.scientificPolarity,
    "INCONCLUSIVE"
);

assert.ok(
    unknown.errors.length >
    0
);

console.log(
    "UNKNOWN CONSTRAINT EVIDENCE FAILS CLOSED: PASS"
);


const wrongSide =
    observation(
        "OBS-WRONG-SIDE",
        constraints[0],
        "PRESERVED"
    );

wrongSide.participantSide =
    "B";


const sideMismatch =
    engine.evaluate(
        constraints,
        [
            wrongSide
        ]
    );

assert.equal(
    sideMismatch.scientificPolarity,
    "INCONCLUSIVE"
);

assert.ok(
    sideMismatch.errors.length >
    0
);

console.log(
    "PARTICIPANT SIDE MISMATCH FAILS CLOSED: PASS"
);


const noEvidence =
    observation(
        "OBS-NO-EVIDENCE",
        constraints[0],
        "PRESERVED"
    );

noEvidence.evidence =
    [];


const missingEvidence =
    engine.evaluate(
        constraints,
        [
            noEvidence
        ]
    );

assert.equal(
    missingEvidence.scientificPolarity,
    "INCONCLUSIVE"
);

assert.ok(
    missingEvidence.errors.length >
    0
);

console.log(
    "EMPTY EXECUTION EVIDENCE FAILS CLOSED: PASS"
);


console.log("");
console.log(
    "RESULT: PASS"
);
