import {
    ScientificCandidateFunctionalConfigurationEvidenceEngine
} from "../laboratory/scientific-candidate-functional-configuration/ScientificCandidateFunctionalConfigurationEvidenceEngine.js";


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


const engine =
    new ScientificCandidateFunctionalConfigurationEvidenceEngine();


const baseInput = {

    candidateId:
        "GENERIC-CANDIDATE",

    participantIds: [
        "ERC-A",
        "ERC-B"
    ],

    runtimeBinding: {

        genericCandidateId:
            "GENERIC-CANDIDATE",

        runtimeCandidateId:
            "RUNTIME-CANDIDATE",

        evidenceIds: [
            "EXACT-CANDIDATE-BINDING"
        ]

    },

    chainId:
        31337,

    sharedRuntime:
        true,

    participants: [
        {
            participantId:
                "ERC-A",

            executed:
                true,

            contractAddresses: [
                "0x00000000000000000000000000000000000000a1"
            ]
        },
        {
            participantId:
                "ERC-B",

            executed:
                true,

            contractAddresses: [
                "0x00000000000000000000000000000000000000b1"
            ]
        }
    ],

    interactions: [
        {
            observationId:
                "INTERACTION-1",

            runtimeCandidateId:
                "RUNTIME-CANDIDATE",

            sourceParticipantId:
                "ERC-A",

            targetParticipantId:
                "ERC-B",

            callKind:
                "STATICCALL" as const,

            sourceAddress:
                "0x00000000000000000000000000000000000000a1",

            targetAddress:
                "0x00000000000000000000000000000000000000b1",

            evidenceIds: [
                "PHYSICAL-CALL-EVIDENCE"
            ]
        }
    ],

    compatibility: {

        candidateId:
            "GENERIC-CANDIDATE",

        scientificPolarity:
            "SUPPORT" as const,

        total:
            2,

        preserved:
            2,

        violated:
            0,

        unevaluated:
            0,

        unresolvedRelevance:
            0

    }

};


console.log("");
console.log(
    "V2.1 OBSERVED FUNCTIONAL CONFIGURATION EVIDENCE"
);
console.log(
    "================================================"
);


const valid =
    engine.evaluate(
        baseInput
    );


check(
    "SUPPORTED SHARED RUNTIME CONFIGURATION IS EVIDENCED",
    valid.errors.length === 0 &&
    valid.evidence?.status ===
        "EVIDENCED"
);


check(
    "CONFIGURATION KIND IS OBSERVED RUNTIME ONLY",
    valid.evidence?.kind ===
        "OBSERVED_RUNTIME_CONFIGURATION"
);


check(
    "PARTICIPANT AND ADDRESS BINDINGS ARE PRESERVED",
    valid.evidence
        ?.participantContractAddresses
        .length ===
        2
);


check(
    "PHYSICAL CROSS-PROTOCOL INTERACTION IS PRESERVED",
    valid.evidence
        ?.interactionObservationIds
        .includes(
            "INTERACTION-1"
        ) ===
        true
);


const noSupport =
    engine.evaluate({
        ...baseInput,

        compatibility: {
            ...baseInput.compatibility,

            scientificPolarity:
                "INCONCLUSIVE" as const
        }
    });


check(
    "INCONCLUSIVE COMPATIBILITY CANNOT PRODUCE FUNCTIONAL CONFIGURATION EVIDENCE",
    noSupport.evidence ===
        null &&
    noSupport.errors.length >
        0
);


const unresolved =
    engine.evaluate({
        ...baseInput,

        compatibility: {
            ...baseInput.compatibility,

            unresolvedRelevance:
                1
        }
    });


check(
    "UNRESOLVED RELEVANCE FAILS CLOSED",
    unresolved.evidence ===
        null &&
    unresolved.errors.length >
        0
);


const noSharedRuntime =
    engine.evaluate({
        ...baseInput,

        sharedRuntime:
            false
    });


check(
    "NO SHARED RUNTIME FAILS CLOSED",
    noSharedRuntime.evidence ===
        null &&
    noSharedRuntime.errors.length >
        0
);


const noInteraction =
    engine.evaluate({
        ...baseInput,

        interactions:
            []
    });


check(
    "COEXISTENCE WITHOUT CROSS-PROTOCOL INTERACTION FAILS CLOSED",
    noInteraction.evidence ===
        null &&
    noInteraction.errors.length >
        0
);


const wrongRuntimeCandidate =
    engine.evaluate({
        ...baseInput,

        interactions: [
            {
                ...baseInput.interactions[0],

                runtimeCandidateId:
                    "OTHER-RUNTIME-CANDIDATE"
            }
        ]
    });


check(
    "CROSS-CANDIDATE INTERACTION FAILS CLOSED",
    wrongRuntimeCandidate.evidence ===
        null &&
    wrongRuntimeCandidate.errors.length >
        0
);


const wrongTargetAddress =
    engine.evaluate({
        ...baseInput,

        interactions: [
            {
                ...baseInput.interactions[0],

                targetAddress:
                    "0x00000000000000000000000000000000000000ff"
            }
        ]
    });


check(
    "UNBOUND TARGET ADDRESS FAILS CLOSED",
    wrongTargetAddress.evidence ===
        null &&
    wrongTargetAddress.errors.length >
        0
);


const participantNotExecuted =
    engine.evaluate({
        ...baseInput,

        participants: [
            baseInput.participants[0],
            {
                ...baseInput.participants[1],

                executed:
                    false
            }
        ]
    });


check(
    "NONEXECUTED PARTICIPANT FAILS CLOSED",
    participantNotExecuted.evidence ===
        null &&
    participantNotExecuted.errors.length >
        0
);


const serialized =
    JSON.stringify(
        valid
    );


check(
    "FUNCTIONAL CONFIGURATION EVIDENCE DOES NOT CREATE SCIENTIFIC POLARITY",
    !serialized.includes(
        '"GLOBAL_COMPOSITION"'
    ) &&
    !serialized.includes(
        '"FUNCTIONAL_COMPLEMENTARITY"'
    ) &&
    !serialized.includes(
        '"SOLVER_CONFIGURATION"'
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