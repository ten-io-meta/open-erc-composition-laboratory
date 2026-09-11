import {
    existsSync,
    readFileSync
} from "node:fs";


const paths =
    [
        "./laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceEdge.ts",
        "./laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphResult.ts",
        "./laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.ts",
        "./laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachability.ts",
        "./laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachabilityResult.ts",
        "./laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachabilityEngine.ts"
    ];


const sources =
    paths.map(
        path =>
            existsSync(
                path
            )
                ? readFileSync(
                    path,
                    "utf8"
                )
                : ""
    );


const productionSource =
    sources.join(
        "\n"
    );


const forbiddenAnswers =
    [
        "ERC8004",
        "ERC8060",
        "IERC1271",
        "IERC721Receiver",
        "IdentityRegistryUpgradeable",
        "ERC721URIStorage"
    ];


const forbiddenSemanticPatterns =
    [
        /\btargetProtocolId\b\s*[:=]/,
        /\bcandidateId\b\s*[:=]/,
        /\bcompositionCandidate\b\s*[:=]/,
        /\bscientificPolarity\b\s*[:=]/,
        /\bcompatibility\b\s*[:=]/,
        /\binteractionDirection\b\s*[:=]/
    ];


const checks =
    [
        {
            name:
                "ALL REACHABILITY PRODUCTION FILES EXIST",

            passed:
                paths.every(
                    path =>
                        existsSync(
                            path
                        )
                )
        },
        {
            name:
                "INHERITANCE GRAPH PRESERVES SUBJECT AND OBJECT CONTAINERS",

            passed:
                productionSource.includes(
                    "subjectContainerSymbol"
                ) &&
                productionSource.includes(
                    "objectContainerSymbol"
                )
        },
        {
            name:
                "INHERITANCE RESOLUTION IS EXPLICITLY CONSERVATIVE",

            passed:
                productionSource.includes(
                    "UNIQUE_DECLARATION_SYMBOL_IN_INPUT"
                )
        },
        {
            name:
                "REACHABILITY PRESERVES PARTICIPANT PROTOCOL",

            passed:
                productionSource.includes(
                    "participantProtocolId"
                )
        },
        {
            name:
                "REACHABILITY PRESERVES ORIGIN PROTOCOL",

            passed:
                productionSource.includes(
                    "originProtocolId"
                )
        },
        {
            name:
                "REACHABILITY PRESERVES CALL ATTRIBUTION",

            passed:
                productionSource.includes(
                    "protocolCallAttributionId"
                ) &&
                productionSource.includes(
                    "sourceCallFactId"
                )
        },
        {
            name:
                "REACHABILITY PRESERVES EXACT INHERITANCE PATH",

            passed:
                productionSource.includes(
                    "inheritanceEdgeIds"
                ) &&
                productionSource.includes(
                    "containerPath"
                )
        },
        {
            name:
                "REACHABILITY REQUIRES PROTOCOL DEPENDENCY EVIDENCE",

            passed:
                productionSource.includes(
                    "protocolRelationEvidenceIds"
                )
        },
        {
            name:
                "DEPENDENCY SYMBOL MUST MATCH FIRST INHERITANCE EDGE",

            passed:
                productionSource.includes(
                    "path[0].inheritedSymbol"
                ) &&
                productionSource.includes(
                    "relation.inheritedSymbol"
                )
        },
        {
            name:
                "ORIGIN PROTOCOL IS NOT REWRITTEN TO PARTICIPANT",

            passed:
                productionSource.includes(
                    "originProtocolId:"
                ) &&
                productionSource.includes(
                    "call.protocolId"
                )
        },
        {
            name:
                "PRODUCTION HAS NO KNOWN CONTROL ANSWERS",

            passed:
                !forbiddenAnswers.some(
                    answer =>
                        productionSource.includes(
                            answer
                        )
                )
        },
        {
            name:
                "PRODUCTION HAS NO TARGET OR COMPOSITION SEMANTICS",

            passed:
                !forbiddenSemanticPatterns.some(
                    pattern =>
                        pattern.test(
                            productionSource
                        )
                )
        },
        {
            name:
                "REACHABILITY HAS NO CONFIDENCE FIELD",

            passed:
                !/\bconfidence\s*:/.test(
                    productionSource
                )
        }
    ];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL BEHAVIOR REACHABILITY BOUNDARY"
);
console.log(
    "--------------------------------------------------"
);


let passed =
    0;


for (
    const check
    of checks
) {

    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );


    if (
        check.passed
    ) {

        passed++;

    }

}


console.log("");

console.log(
    `PASS: ${passed}`
);

console.log(
    `FAIL: ${checks.length - passed}`
);

console.log(
    `RESULT: ${
        passed ===
            checks.length
            ? "PASS"
            : "FAIL"
    }`
);


if (
    passed !==
    checks.length
) {

    process.exitCode =
        1;

}
