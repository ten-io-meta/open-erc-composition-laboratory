import {
    existsSync,
    readFileSync
} from "node:fs";


const paths =
    [
        "./laboratory/scientific-interaction-shadow-validation/ScientificInteractionShadowValidation.ts",
        "./laboratory/scientific-interaction-shadow-validation/ScientificInteractionShadowValidationResult.ts",
        "./laboratory/scientific-interaction-shadow-validation/ScientificInteractionShadowValidationEngine.ts"
    ];


const source =
    paths
        .map(
            path =>
                existsSync(path)
                    ? readFileSync(path, "utf8")
                    : ""
        )
        .join("\n");


const forbiddenAnswers =
    [
        "ERC8004",
        "ERC8060",
        "IERC1271",
        "IERC721Receiver",
        "IdentityRegistryUpgradeable",
        "ERC721URIStorage"
    ];


const forbiddenConclusions =
    [
        /\bcompatibility\b\s*[:=]/,
        /\bscientificPolarity\b\s*[:=]/,
        /\bcompositionStatus\b\s*[:=]/,
        /\bconfidence\b\s*[:=]/
    ];


const checks =
    [
        [
            "ALL SHADOW VALIDATION PRODUCTION FILES EXIST",
            paths.every(existsSync)
        ],
        [
            "SHADOW VALIDATION PRESERVES HYPOTHESIS ID",
            source.includes("hypothesisId")
        ],
        [
            "SHADOW VALIDATION PRESERVES RUNTIME OBSERVATION ID",
            source.includes("observationId")
        ],
        [
            "SHADOW VALIDATION REQUIRES EXACT CANDIDATE AND DIRECTION",
            source.includes("candidateId") &&
            source.includes("sourceSide") &&
            source.includes("targetSide")
        ],
        [
            "LOW LEVEL SOURCE CALL FORMS MAP TO EVM CALL KINDS",
            source.includes('"LOW_LEVEL_CALL"') &&
            source.includes('"LOW_LEVEL_STATICCALL"') &&
            source.includes('"LOW_LEVEL_DELEGATECALL"')
        ],
        [
            "CAST MEMBER CALL DOES NOT PRETEND TO DETERMINE EVM CALL KIND",
            source.includes('"CAST_MEMBER_CALL"') &&
            source.includes('"SOURCE_CALL_KIND_NOT_DETERMINED"')
        ],
        [
            "CALL KIND CONTRADICTION IS REPRESENTABLE",
            source.includes('"CONTRADICTED"')
        ],
        [
            "AMBIGUOUS DIRECTION GROUPS FAIL CLOSED",
            source.includes("ambiguousDirectionKeys")
        ],
        [
            "PRODUCTION HAS NO KNOWN CONTROL ANSWERS",
            !forbiddenAnswers.some(
                answer =>
                    source.includes(answer)
            )
        ],
        [
            "PRODUCTION DOES NOT INVENT COMPOSITION CONCLUSIONS",
            !forbiddenConclusions.some(
                pattern =>
                    pattern.test(source)
            )
        ]
    ] as const;


console.log("");
console.log(
    "SCIENTIFIC INTERACTION SHADOW VALIDATION BOUNDARY"
);
console.log(
    "------------------------------------------------"
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
