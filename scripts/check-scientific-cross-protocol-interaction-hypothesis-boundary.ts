import {
    existsSync,
    readFileSync
} from "node:fs";


const paths =
    [
        "./laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesis.ts",
        "./laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesisResult.ts",
        "./laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesisEngine.ts"
    ];


const productionSource =
    paths
        .map(
            path =>
                existsSync(path)
                    ? readFileSync(path, "utf8")
                    : ""
        )
        .join("\n");


const knownControlAnswers =
    [
        "ERC8004",
        "ERC8060",
        "IERC1271",
        "IERC721Receiver",
        "IdentityRegistryUpgradeable",
        "ERC721URIStorage"
    ];


const forbiddenConclusionPatterns =
    [
        /\bscientificPolarity\b\s*[:=]/,
        /\bcompatibility\b\s*[:=]/,
        /\bruntimeStatus\b\s*[:=]/,
        /\bexecutionStatus\b\s*[:=]/,
        /\bconfidence\b\s*[:=]/
    ];


const checks =
    [
        [
            "ALL HYPOTHESIS PRODUCTION FILES EXIST",
            paths.every(existsSync)
        ],
        [
            "HYPOTHESIS PRESERVES CANDIDATE IDENTITY",
            productionSource.includes("candidateId")
        ],
        [
            "HYPOTHESIS PRESERVES A/B DIRECTION",
            productionSource.includes("sourceSide") &&
            productionSource.includes("targetSide")
        ],
        [
            "HYPOTHESIS DISTINGUISHES SOURCE PARTICIPANT FROM CALL ORIGIN",
            productionSource.includes("sourceParticipantProtocolId") &&
            productionSource.includes("originProtocolId")
        ],
        [
            "TARGET IS EXPLICITLY HYPOTHESIZED",
            productionSource.includes("hypothesizedTargetParticipantProtocolId")
        ],
        [
            "DIRECT AND INHERITED EVIDENCE ARE DISTINCT",
            productionSource.includes("DIRECT_PROTOCOL_CALL") &&
            productionSource.includes("INHERITED_PROTOCOL_BEHAVIOR")
        ],
        [
            "CALL PROVENANCE IS PRESERVED",
            productionSource.includes("protocolCallAttributionId") &&
            productionSource.includes("sourceCallFactId")
        ],
        [
            "REACHABILITY PROVENANCE CAN BE PRESERVED",
            productionSource.includes("behaviorReachabilityId")
        ],
        [
            "HYPOTHESIS REMAINS UNEVALUATED",
            productionSource.includes('"UNEVALUATED"')
        ],
        [
            "PRODUCTION HAS NO KNOWN CONTROL ANSWERS",
            !knownControlAnswers.some(
                answer =>
                    productionSource.includes(answer)
            )
        ],
        [
            "PRODUCTION DOES NOT INVENT SCIENTIFIC CONCLUSIONS",
            !forbiddenConclusionPatterns.some(
                pattern =>
                    pattern.test(productionSource)
            )
        ]
    ] as const;


console.log("");
console.log(
    "SCIENTIFIC CROSS-PROTOCOL INTERACTION HYPOTHESIS BOUNDARY"
);
console.log(
    "---------------------------------------------------------"
);


let passed =
    0;


for (
    const [
        name,
        condition
    ]
    of checks
) {

    console.log(
        `${name}: ${
            condition
                ? "PASS"
                : "FAIL"
        }`
    );

    if (
        condition
    ) {
        passed++;
    }

}


console.log("");
console.log(`PASS: ${passed}`);
console.log(`FAIL: ${checks.length - passed}`);
console.log(
    `RESULT: ${
        passed === checks.length
            ? "PASS"
            : "FAIL"
    }`
);


if (
    passed !== checks.length
) {
    process.exitCode = 1;
}
