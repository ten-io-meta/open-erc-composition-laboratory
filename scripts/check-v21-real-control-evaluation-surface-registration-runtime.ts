import {
    buildErc8004Erc8060ControlRegistration,
    ERC8004_ERC8060_CONTROL_REGISTRATION_ID
} from "../laboratory/scientific-joint-contract-harness/controls/ScientificErc8004Erc8060ControlRegistration.js";


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
    "V2.1 REAL CONTROL EVALUATION SURFACE REGISTRATION"
);
console.log(
    "================================================="
);


const registration =
    buildErc8004Erc8060ControlRegistration();


const surface =
    registration.evaluationSurface;


check(
    "REAL CONTROL DECLARES EVALUATION SURFACE",
    surface !== undefined
);


if (surface === undefined) {
    throw new Error(
        "Real control evaluation surface missing."
    );
}


check(
    "SURFACE HAS EXACTLY TWO PARTICIPANTS",
    surface.participantSurfaces.length ===
        2
);


const participantA =
    surface.participantSurfaces.find(
        participant =>
            participant.participantSide ===
            "A"
    );


const participantB =
    surface.participantSurfaces.find(
        participant =>
            participant.participantSide ===
            "B"
    );


check(
    "PARTICIPANT A SURFACE MATCHES REGISTRATION",
    participantA?.participantId ===
        registration.applicability.participantA.participantId &&
    participantA?.participantKind ===
        registration.applicability.participantA.participantKind
);


check(
    "PARTICIPANT B SURFACE MATCHES REGISTRATION",
    participantB?.participantId ===
        registration.applicability.participantB.participantId &&
    participantB?.participantKind ===
        registration.applicability.participantB.participantKind
);


check(
    "ERC8004 SURFACE IS COMPLETE FOR THIS EVALUATION",
    participantA?.completeness ===
        "COMPLETE_FOR_CANDIDATE_EVALUATION"
);


check(
    "ERC8004 SURFACE IS IDENTITY REGISTRY ONLY",
    JSON.stringify(
        participantA?.includedContainerSymbols
    ) ===
    JSON.stringify([
        "IdentityRegistryUpgradeable"
    ])
);


check(
    "ERC8004 SURFACE DOES NOT INCLUDE REPUTATION OR VALIDATION",
    !participantA?.includedContainerSymbols.includes(
        "ReputationRegistryUpgradeable"
    ) &&
    !participantA?.includedContainerSymbols.includes(
        "ValidationRegistryUpgradeable"
    )
);


check(
    "ERC8060 SURFACE IS COMPLETE AND EXACT",
    participantB?.completeness ===
        "COMPLETE_FOR_CANDIDATE_EVALUATION" &&
    JSON.stringify(
        participantB?.includedContainerSymbols
    ) ===
    JSON.stringify([
        "ERC8060Reference"
    ])
);


check(
    "SURFACE DECLARATIONS HAVE EXPLICIT EVIDENCE IDENTITIES",
    surface.participantSurfaces.every(
        participant =>
            participant.evidenceIds.length >
                0 &&
            participant.evidenceIds.every(
                evidenceId =>
                    evidenceId.startsWith(
                        ERC8004_ERC8060_CONTROL_REGISTRATION_ID
                    )
            )
    )
);


const serialized =
    JSON.stringify(
        registration.evaluationSurface
    );


check(
    "SURFACE DECLARATION CONTAINS NO SCIENTIFIC POLARITY",
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