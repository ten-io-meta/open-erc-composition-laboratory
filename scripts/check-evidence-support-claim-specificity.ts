import {
    EvidenceSupportIntegrator
} from "../laboratory/evidence-support/EvidenceSupportIntegrator.js";

import type {
    ComposabilityEvidenceClaim
} from "../laboratory/composability-evidence/ComposabilityEvidenceClaim.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;

}

const claim: ComposabilityEvidenceClaim = {
    claimId:
        "CONTROLLED-CLAIM-00001",

    protocolA:
        "ERC1000",

    protocolB:
        "ERC1001",

    capabilityA:
        "Reservation",

    capabilityB:
        "Accounting",

    relation:
        "CONSTRAINS",

    reason:
        "Controlled claim-specific evidence regression.",

    evidence:
        [],

    semanticConfidence:
        0,

    experimentalSupport:
        0,

    statisticalSupport:
        0,

    emergentPatternSupport:
        0,

    overallConfidence:
        0,

    status:
        "INCONCLUSIVE"
};

/*
 * NEGATIVE CONTROL
 *
 * Same protocol pair, but no capability/relation
 * identity proving that this matrix row supports
 * the controlled claim.
 */

const unrelatedPairLevelMatrix = [
    {
        protocolA:
            "ERC1000",

        protocolB:
            "ERC1001",

        evidence:
            1,

        successfulCompositions:
            1,

        compatibility:
            100,

        safetyScore:
            100,

        stabilityScore:
            100
    }
];

/*
 * Mentions Reservation, but belongs to a different
 * protocol pair and semantic relation.
 */

const unrelatedPatterns = [
    {
        protocolPair:
            "ERC2000->ERC2001",

        capabilityA:
            "Reservation",

        capabilityB:
            "Settlement",

        relation:
            "ENABLES",

        status:
            "SUPPORTED"
    }
];

const negativeResult =
    new EvidenceSupportIntegrator().integrate(
        [claim],
        {},
        unrelatedPairLevelMatrix,
        unrelatedPatterns
    );

const negative =
    negativeResult[0];

console.log("");
console.log(
    "EVIDENCE SUPPORT CLAIM SPECIFICITY — NEGATIVE"
);
console.log(
    "---------------------------------------------"
);

const negativeChecks = [
    check(
        negative !== undefined,
        "CONTROLLED CLAIM INTEGRATED"
    ),

    check(
        negative?.experimentalSupport === 0,
        "PAIR-LEVEL MATRIX CANNOT CREATE CLAIM-SPECIFIC EXPERIMENTAL SUPPORT"
    ),

    check(
        negative?.statisticalSupport === 0,
        "PAIR-LEVEL MATRIX CANNOT CREATE CLAIM-SPECIFIC STATISTICAL SUPPORT"
    ),

    check(
        negative?.emergentPatternSupport === 0,
        "UNRELATED CAPABILITY MENTION CANNOT CREATE EMERGENT SUPPORT"
    ),

    check(
        negative?.evidence.length === 0,
        "UNQUALIFIED GLOBAL EVIDENCE IS NOT ATTACHED TO CLAIM"
    ),

    check(
        negative?.overallConfidence === 0,
        "UNQUALIFIED GLOBAL EVIDENCE CANNOT INFLATE CONFIDENCE"
    ),

    check(
        negative?.status === "INCONCLUSIVE",
        "UNQUALIFIED GLOBAL EVIDENCE CANNOT PROMOTE CLAIM"
    )
];

/*
 * POSITIVE CONTROL
 *
 * These artifacts explicitly identify the complete
 * directed claim:
 *
 * ERC1000 / Reservation
 *     CONSTRAINS
 * ERC1001 / Accounting
 */

const claimSpecificMatrix = [
    {
        protocolA:
            "ERC1000",

        protocolB:
            "ERC1001",

        capabilityA:
            "Reservation",

        capabilityB:
            "Accounting",

        relation:
            "CONSTRAINS",

        evidence:
            2,

        successfulCompositions:
            2,

        compatibility:
            90,

        safetyScore:
            80,

        stabilityScore:
            70
    }
];

const claimSpecificPatterns = [
    {
        protocolA:
            "ERC1000",

        protocolB:
            "ERC1001",

        capabilityA:
            "Reservation",

        capabilityB:
            "Accounting",

        relation:
            "CONSTRAINS",

        status:
            "SUPPORTED"
    }
];

const positiveResult =
    new EvidenceSupportIntegrator().integrate(
        [claim],
        {},
        claimSpecificMatrix,
        claimSpecificPatterns
    );

const positive =
    positiveResult[0];

console.log("");
console.log(
    "EVIDENCE SUPPORT CLAIM SPECIFICITY — POSITIVE"
);
console.log(
    "---------------------------------------------"
);

const positiveChecks = [
    check(
        positive !== undefined,
        "CLAIM-SPECIFIC EVIDENCE INTEGRATED"
    ),

    check(
        positive?.experimentalSupport === 100,
        "EXACT CLAIM IDENTITY ENABLES EXPERIMENTAL SUPPORT"
    ),

    check(
        positive?.statisticalSupport === 80,
        "EXACT CLAIM IDENTITY ENABLES STATISTICAL SUPPORT"
    ),

    check(
        positive?.emergentPatternSupport === 75,
        "EXACT CLAIM IDENTITY ENABLES EMERGENT SUPPORT"
    ),

    check(
        positive?.evidence.includes(
            "matrix:ERC1000+ERC1001"
        ) === true,
        "QUALIFIED MATRIX EVIDENCE ATTACHED"
    ),

    check(
        positive?.evidence.includes(
            "emergent-patterns"
        ) === true,
        "QUALIFIED PATTERN EVIDENCE ATTACHED"
    ),

    check(
        (positive?.overallConfidence ?? 0) > 0,
        "QUALIFIED EVIDENCE CAN INCREASE CONFIDENCE"
    ),

    check(
        positive?.status === "CANDIDATE",
        "QUALIFIED EVIDENCE CAN PROMOTE CLAIM CONSERVATIVELY"
    )
];

const pass =
    [
        ...negativeChecks,
        ...positiveChecks
    ].every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}