import {
    buildErc8004Erc8060ControlRegistration
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";

import {
    ScientificCandidateEvaluationSurfaceProjectionEngine
} from "../laboratory/scientific-candidate-boundary-relevance/ScientificCandidateEvaluationSurfaceProjectionEngine.js";


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


console.log("");
console.log(
    "V2.1 CANDIDATE EVALUATION SURFACE PROJECTION"
);
console.log(
    "============================================"
);


const engine =
    new ScientificCandidateEvaluationSurfaceProjectionEngine();


const registration =
    buildErc8004Erc8060ControlRegistration();


const candidate = {

    candidateId:
        "GENERIC-ERC8004-ERC8060",

    sourceParticipantId:
        "ERC-8004",

    targetParticipantId:
        "ERC-8060"

};


const result =
    engine.project(
        registration,
        candidate
    );


check(
    "REAL CONTROL SURFACE PROJECTS WITHOUT ERRORS",
    result.errors.length === 0
);


check(
    "EXACTLY TWO GENERIC SURFACES ARE PRODUCED",
    result.surfaces.length === 2
);


const erc8004 =
    result.surfaces.find(
        surface =>
            surface.participantId ===
            "ERC-8004"
    );


const erc8060 =
    result.surfaces.find(
        surface =>
            surface.participantId ===
            "ERC-8060"
    );


check(
    "ERC8004 SURFACE PRESERVES COMPLETE STATUS",
    erc8004?.completeness ===
        "COMPLETE_FOR_CANDIDATE_EVALUATION"
);


check(
    "ERC8004 SURFACE PRESERVES IDENTITY REGISTRY",
    JSON.stringify(
        erc8004?.includedContainerSymbols
    ) ===
    JSON.stringify([
        "IdentityRegistryUpgradeable"
    ])
);


check(
    "ERC8060 SURFACE PRESERVES REFERENCE CONTRACT",
    JSON.stringify(
        erc8060?.includedContainerSymbols
    ) ===
    JSON.stringify([
        "ERC8060Reference"
    ])
);


check(
    "GENERIC SURFACES PRESERVE CANDIDATE IDENTITY",
    result.surfaces.every(
        surface =>
            surface.candidateId ===
            candidate.candidateId
    )
);


check(
    "GENERIC SURFACES PRESERVE EXPLICIT EVIDENCE",
    result.surfaces.every(
        surface =>
            surface.evidenceIds.length >
            0
    )
);


const reversed =
    engine.project(
        registration,
        {
            candidateId:
                candidate.candidateId,

            sourceParticipantId:
                "ERC-8060",

            targetParticipantId:
                "ERC-8004"
        }
    );


check(
    "UNDIRECTED PARTICIPANT ORDER DOES NOT CHANGE SURFACE",
    reversed.errors.length === 0 &&
    JSON.stringify(
        reversed.surfaces
    ) ===
    JSON.stringify(
        result.surfaces
    )
);


const wrongParticipant =
    engine.project(
        registration,
        {
            candidateId:
                "WRONG",

            sourceParticipantId:
                "ERC-8004",

            targetParticipantId:
                "ERC-9999"
        }
    );


check(
    "WRONG CANDIDATE PARTICIPANT FAILS CLOSED",
    wrongParticipant.surfaces.length === 0 &&
    wrongParticipant.errors.length > 0
);


const noSurfaceRegistration = {
    ...registration,
    evaluationSurface:
        undefined
};


const noSurface =
    engine.project(
        noSurfaceRegistration,
        candidate
    );


check(
    "REGISTRATION WITHOUT SURFACE FAILS CLOSED",
    noSurface.surfaces.length === 0 &&
    noSurface.errors.length > 0
);


const serialized =
    JSON.stringify(
        result
    );


check(
    "PROJECTION CONTAINS NO SCIENTIFIC POLARITY",
    !serialized.includes('"SUPPORT"') &&
    !serialized.includes('"CHALLENGE"') &&
    !serialized.includes('"INCONCLUSIVE"') &&
    !serialized.includes('"PRESERVED"') &&
    !serialized.includes('"VIOLATED"')
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