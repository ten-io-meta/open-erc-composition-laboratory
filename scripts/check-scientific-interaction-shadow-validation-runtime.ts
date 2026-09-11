import assert from "node:assert/strict";

import type {
    ScientificCrossProtocolInteractionHypothesis
} from "../laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesis.js";

import type {
    ScientificCrossProtocolInteractionObservation
} from "../laboratory/scientific-joint-contract-harness/ScientificCrossProtocolInteractionObservation.js";

import {
    ScientificInteractionShadowValidationEngine
} from "../laboratory/scientific-interaction-shadow-validation/ScientificInteractionShadowValidationEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name: string,
    fn: () => void
): void {

    try {

        fn();

        console.log(
            `${name}: PASS`
        );

        pass++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        fail++;

    }

}


function hypothesis(
    hypothesisId: string,
    sourceSide: "A" | "B",
    targetSide: "A" | "B",
    callForm:
        | "LOW_LEVEL_CALL"
        | "LOW_LEVEL_STATICCALL"
        | "LOW_LEVEL_DELEGATECALL"
        | "CAST_MEMBER_CALL"
): ScientificCrossProtocolInteractionHypothesis {

    return {

        hypothesisId,

        candidateId:
            "CANDIDATE-1",

        sourceSide,

        targetSide,

        sourceParticipantProtocolId:
            sourceSide === "A"
                ? "ERC-1111"
                : "ERC-2222",

        hypothesizedTargetParticipantProtocolId:
            targetSide === "A"
                ? "ERC-1111"
                : "ERC-2222",

        originProtocolId:
            sourceSide === "A"
                ? "ERC-1111"
                : "ERC-3333",

        behaviorEvidenceKind:
            sourceSide === "A"
                ? "DIRECT_PROTOCOL_CALL"
                : "INHERITED_PROTOCOL_BEHAVIOR",

        hypothesisBasis:
            sourceSide === "A"
                ? "DIRECT_CALL_SITE_WITH_CANDIDATE_PEER"
                : "INHERITED_CALL_SITE_WITH_CANDIDATE_PEER",

        protocolCallAttributionId:
            `CALL-${hypothesisId}`,

        sourceCallFactId:
            `FACT-${hypothesisId}`,

        ...(
            sourceSide === "B"
                ? {
                    behaviorReachabilityId:
                        `REACH-${hypothesisId}`
                }
                : {}
        ),

        externalCall: {
            callForm,

            targetExpression:
                sourceSide === "A"
                    ? "peer"
                    : "receiver",

            ...(
                callForm ===
                    "CAST_MEMBER_CALL"
                    ? {
                        castTypeSymbol:
                            "ReceiverType",

                        memberSymbol:
                            "onReceive"
                    }
                    : {}
            )
        },

        candidateProvenanceEvidenceIds: [
            "CANDIDATE-EVIDENCE"
        ],

        behaviorEvidenceIds: [
            `BEHAVIOR-${hypothesisId}`
        ],

        evaluationStatus:
            "UNEVALUATED"

    };

}


function observation(
    observationId: string,
    sourceSide: "A" | "B",
    targetSide: "A" | "B",
    callKind: "CALL" | "STATICCALL" | "DELEGATECALL"
): ScientificCrossProtocolInteractionObservation {

    return {

        observationId,

        candidateId:
            "CANDIDATE-1",

        sourceSide,

        targetSide,

        callKind,

        sourceAddress:
            "0x1111111111111111111111111111111111111111",

        targetAddress:
            "0x2222222222222222222222222222222222222222",

        status:
            "OBSERVED",

        evidence: [
            `RUNTIME-${observationId}`
        ]

    };

}


const direct =
    hypothesis(
        "HYP-A-B",
        "A",
        "B",
        "LOW_LEVEL_STATICCALL"
    );

const inherited =
    hypothesis(
        "HYP-B-A",
        "B",
        "A",
        "CAST_MEMBER_CALL"
    );

const runtimeAB =
    observation(
        "OBS-A-B",
        "A",
        "B",
        "STATICCALL"
    );

const runtimeBA =
    observation(
        "OBS-B-A",
        "B",
        "A",
        "CALL"
    );


const engine =
    new ScientificInteractionShadowValidationEngine();


const result =
    engine.validate({

        hypotheses: [
            inherited,
            direct
        ],

        observations: [
            runtimeBA,
            runtimeAB
        ]

    });


check(
    "SHADOW VALIDATION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            result.errors,
            []
        );

    }
);


check(
    "EXACTLY TWO RUNTIME DIRECTION VALIDATIONS ARE PRODUCED",
    () => {

        assert.equal(
            result.validations.length,
            2
        );

    }
);


check(
    "NO REALISTIC SYNTHETIC DIRECTION REMAINS UNMATCHED",
    () => {

        assert.deepEqual(
            result.unmatchedHypothesisIds,
            []
        );

        assert.deepEqual(
            result.unmatchedObservationIds,
            []
        );

        assert.deepEqual(
            result.ambiguousDirectionKeys,
            []
        );

    }
);


const validatedAB =
    result.validations.find(
        validation =>
            validation.sourceSide === "A" &&
            validation.targetSide === "B"
    );

const validatedBA =
    result.validations.find(
        validation =>
            validation.sourceSide === "B" &&
            validation.targetSide === "A"
    );


check(
    "A TO B RUNTIME DIRECTION IS OBSERVED",
    () => {

        assert.equal(
            validatedAB?.directionStatus,
            "OBSERVED"
        );

    }
);


check(
    "LOW LEVEL STATICCALL IS CONFIRMED BY RUNTIME",
    () => {

        assert.equal(
            validatedAB?.predictedCallKind,
            "STATICCALL"
        );

        assert.equal(
            validatedAB?.observedCallKind,
            "STATICCALL"
        );

        assert.equal(
            validatedAB?.callKindAssessment,
            "CONFIRMED"
        );

    }
);


check(
    "B TO A RUNTIME DIRECTION IS OBSERVED",
    () => {

        assert.equal(
            validatedBA?.directionStatus,
            "OBSERVED"
        );

    }
);


check(
    "CAST MEMBER SOURCE CALL DOES NOT INVENT EVM CALL KIND",
    () => {

        assert.equal(
            validatedBA?.predictedCallKind,
            undefined
        );

        assert.equal(
            validatedBA?.observedCallKind,
            "CALL"
        );

        assert.equal(
            validatedBA?.callKindAssessment,
            "SOURCE_CALL_KIND_NOT_DETERMINED"
        );

    }
);


const contradiction =
    engine.validate({

        hypotheses: [
            hypothesis(
                "HYP-CONTRADICTION",
                "A",
                "B",
                "LOW_LEVEL_STATICCALL"
            )
        ],

        observations: [
            observation(
                "OBS-CONTRADICTION",
                "A",
                "B",
                "CALL"
            )
        ]

    });


check(
    "LOW LEVEL CALL KIND CONTRADICTION IS PRESERVED AS EVIDENCE",
    () => {

        assert.equal(
            contradiction.validations.length,
            1
        );

        assert.equal(
            contradiction.validations[0]
                ?.callKindAssessment,
            "CONTRADICTED"
        );

    }
);


const ambiguous =
    engine.validate({

        hypotheses: [
            direct
        ],

        observations: [
            runtimeAB,
            observation(
                "OBS-A-B-SECOND",
                "A",
                "B",
                "STATICCALL"
            )
        ]

    });


check(
    "AMBIGUOUS RUNTIME DIRECTION GROUP FAILS CLOSED",
    () => {

        assert.equal(
            ambiguous.validations.length,
            0
        );

        assert.equal(
            ambiguous.ambiguousDirectionKeys.length,
            1
        );

        assert.deepEqual(
            ambiguous.unmatchedHypothesisIds,
            [
                direct.hypothesisId
            ]
        );

    }
);


const unmatched =
    engine.validate({

        hypotheses: [
            direct
        ],

        observations: [
            runtimeBA
        ]

    });


check(
    "NONMATCHING DIRECTION IS NOT INVENTED",
    () => {

        assert.deepEqual(
            unmatched.validations,
            []
        );

        assert.deepEqual(
            unmatched.unmatchedHypothesisIds,
            [
                direct.hypothesisId
            ]
        );

        assert.deepEqual(
            unmatched.unmatchedObservationIds,
            [
                runtimeBA.observationId
            ]
        );

    }
);


const repeated =
    engine.validate({

        hypotheses: [
            direct,
            inherited
        ],

        observations: [
            runtimeAB,
            runtimeBA
        ]

    });


check(
    "SHADOW VALIDATION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            result
        );

    }
);


check(
    "SHADOW VALIDATION DOES NOT CLAIM COMPOSITION COMPATIBILITY",
    () => {

        for (
            const validation
            of result.validations
        ) {

            for (
                const field
                of [
                    "compatibility",
                    "scientificPolarity",
                    "compositionStatus",
                    "confidence"
                ]
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        validation,
                        field
                    ),
                    false
                );

            }

        }

    }
);


console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(
    `RESULT: ${
        fail === 0
            ? "PASS"
            : "FAIL"
    }`
);


if (
    fail >
    0
) {
    process.exitCode = 1;
}
