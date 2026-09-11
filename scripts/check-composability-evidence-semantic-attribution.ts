import {
    ComposabilityEvidenceEngine
} from "../laboratory/composability-evidence/ComposabilityEvidenceEngine.js";


async function main(): Promise<void> {

    const semantics: any = {
        sourceId: "TEST-SEMANTIC-ATTRIBUTION",
        extractedAt: "2026-09-04T00:00:00.000Z",
        semantics: [
            {
                protocolId: "IERC8060Reservable",
                capabilities: [
                    "Reservation",
                    "Accounting"
                ],
                role: "Reservable accounting layer",
                evidence: ["TEST"],
                confidence: 100
            },
            {
                protocolId: "ERC8004",
                capabilities: [
                    "AgentIdentity"
                ],
                role: "Agent identity binding",
                evidence: ["TEST"],
                confidence: 100
            },
            {
                protocolId: "ERC8060",
                capabilities: [
                    "EmbeddedValue"
                ],
                role: "Embedded native value",
                evidence: ["TEST"],
                confidence: 100
            }
        ],
        errors: []
    };

    const reasoning: any = {
        sourceId: "TEST-SEMANTIC-ATTRIBUTION",
        generatedAt: "2026-09-04T00:00:00.000Z",
        relations: [
            {
                fromCapability: "EmbeddedValue",
                toCapability: "Reservation",
                relation: "ENABLES",
                reason:
                    "Embedded value enables reservation accounting.",
                evidence: ["TEST"],
                confidence: 90
            }
        ],
        errors: []
    };

    const extraction: any = {
        sourceId: "TEST-SEMANTIC-ATTRIBUTION",
        protocols: [
            "IERC8060Reservable",
            "ERC8004",
            "ERC8060"
        ],
        claims: [
            {
                text:
                    "Reservation CONSTRAINS Settlement: synthetic regression probe."
            }
        ]
    };

    const result =
        new ComposabilityEvidenceEngine().build(
            semantics,
            reasoning,
            extraction
        );

    const validCrossProtocol =
        result.claims.some(
            claim =>
                claim.protocolA === "ERC8060" &&
                claim.protocolB === "IERC8060Reservable" &&
                claim.capabilityA === "EmbeddedValue" &&
                claim.capabilityB === "Reservation" &&
                claim.relation === "ENABLES"
        );

    const falseERC8004Attribution =
        result.claims.some(
            claim =>
                claim.protocolA === "IERC8060Reservable" &&
                claim.protocolB === "ERC8004" &&
                claim.capabilityA === "Reservation" &&
                claim.capabilityB.startsWith("Settlement") &&
                claim.relation === "CONSTRAINS"
        );

    const pass =
        validCrossProtocol &&
        !falseERC8004Attribution;

    console.log("");
    console.log(
        "COMPOSABILITY EVIDENCE SEMANTIC ATTRIBUTION"
    );
    console.log(
        "------------------------------------------"
    );

    console.log(
        `VALID CROSS-PROTOCOL CLAIM: ${validCrossProtocol}`
    );

    console.log(
        `FALSE ERC8004 ATTRIBUTION: ${falseERC8004Attribution}`
    );

    console.log(
        `TOTAL CLAIMS: ${result.claims.length}`
    );

    console.log(
        `RESULT: ${pass ? "PASS" : "FAIL"}`
    );

    if (!pass) {
        process.exitCode = 1;
    }
}


main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});