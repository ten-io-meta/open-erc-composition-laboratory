import {
    existsSync,
    readFileSync
} from "node:fs";


const modelPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolAttributedExternalCall.ts";

const resultPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionResult.ts";

const enginePath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionEngine.ts";

const basisPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolIdentityBasis.ts";

const resolverPath =
    "./laboratory/scientific-protocol-identity/ScientificProtocolStructuralIdentityResolver.ts";


const modelExists =
    existsSync(
        modelPath
    );

const resultExists =
    existsSync(
        resultPath
    );

const engineExists =
    existsSync(
        enginePath
    );

const basisExists =
    existsSync(
        basisPath
    );

const resolverExists =
    existsSync(
        resolverPath
    );


const modelSource =
    modelExists
        ? readFileSync(
            modelPath,
            "utf8"
        )
        : "";

const resultSource =
    resultExists
        ? readFileSync(
            resultPath,
            "utf8"
        )
        : "";

const engineSource =
    engineExists
        ? readFileSync(
            enginePath,
            "utf8"
        )
        : "";

const basisSource =
    basisExists
        ? readFileSync(
            basisPath,
            "utf8"
        )
        : "";

const resolverSource =
    resolverExists
        ? readFileSync(
            resolverPath,
            "utf8"
        )
        : "";


const productionSource =
    [
        modelSource,
        resultSource,
        engineSource,
        basisSource,
        resolverSource
    ].join(
        "\n"
    );


const forbiddenAnswers =
    [
        "ERC8004",
        "ERC8060",
        "IERC1271",
        "IERC721Receiver",
        "IdentityRegistryUpgradeable"
    ];


const forbiddenSemanticPatterns =
    [
        /\btargetProtocolId\b\s*[:=]/,
        /\.\s*targetProtocolId\b/,

        /\bcandidateId\b\s*[:=]/,
        /\.\s*candidateId\b/,

        /\bcompositionCandidate\b\s*[:=]/,
        /\.\s*compositionCandidate\b/,

        /\bscientificPolarity\b\s*[:=]/,
        /\.\s*scientificPolarity\b/,

        /\bcompatibility\b\s*[:=]/,
        /\.\s*compatibility\b/,

        /\binteractionDirection\b\s*[:=]/,
        /\.\s*interactionDirection\b/
    ];


const checks = [
    {
        name:
            "PROTOCOL ATTRIBUTED EXTERNAL CALL MODEL EXISTS",

        passed:
            modelExists
    },
    {
        name:
            "EXTERNAL CALL ATTRIBUTION RESULT EXISTS",

        passed:
            resultExists
    },
    {
        name:
            "EXTERNAL CALL ATTRIBUTION ENGINE EXISTS",

        passed:
            engineExists
    },
    {
        name:
            "SHARED PROTOCOL IDENTITY BASIS EXISTS",

        passed:
            basisExists
    },
    {
        name:
            "SHARED STRUCTURAL RESOLVER EXISTS",

        passed:
            resolverExists
    },
    {
        name:
            "ATTRIBUTED CALL HAS DETERMINISTIC ID",

        passed:
            modelSource.includes(
                "protocolCallAttributionId"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES PROTOCOL ID",

        passed:
            modelSource.includes(
                "protocolId:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES IDENTITY BASIS",

        passed:
            modelSource.includes(
                "identityBasis:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES SOURCE FACT ID",

        passed:
            modelSource.includes(
                "sourceFactId:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES OBSERVATION ID",

        passed:
            modelSource.includes(
                "observationId:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES CONTAINER KIND",

        passed:
            modelSource.includes(
                "containerKind:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES CONTAINER SYMBOL",

        passed:
            modelSource.includes(
                "containerSymbol:"
            )
    },
    {
        name:
            "ATTRIBUTED CALL PRESERVES STRUCTURED EXTERNAL CALL",

        passed:
            modelSource.includes(
                "ScientificSourceExternalCall"
            ) &&
            modelSource.includes(
                "externalCall:"
            )
    },
    {
        name:
            "RESULT PRESERVES SOURCE ID",

        passed:
            resultSource.includes(
                "sourceId:"
            )
    },
    {
        name:
            "RESULT PRESERVES SOURCE REVISION",

        passed:
            resultSource.includes(
                "sourceRevision?"
            )
    },
    {
        name:
            "RESULT EXPOSES PROTOCOL ATTRIBUTED EXTERNAL CALLS",

        passed:
            resultSource.includes(
                "protocolAttributedExternalCalls"
            )
    },
    {
        name:
            "RESULT EXPOSES UNRESOLVED EXTERNAL CALL FACT IDS",

        passed:
            resultSource.includes(
                "unresolvedExternalCallFactIds"
            )
    },
    {
        name:
            "RESULT EXPOSES FAIL CLOSED ERRORS",

        passed:
            resultSource.includes(
                "errors:"
            )
    },
    {
        name:
            "ENGINE CONSUMES EXTERNAL CALL EXPRESSION FACTS",

        passed:
            engineSource.includes(
                '"EXTERNAL_CALL_EXPRESSION"'
            )
    },
    {
        name:
            "ENGINE REQUIRES STRUCTURAL CONTAINER",

        passed:
            engineSource.includes(
                "fact.containerKind"
            ) &&
            engineSource.includes(
                "fact.containerSymbol"
            )
    },
    {
        name:
            "ENGINE USES SHARED STRUCTURAL IDENTITY RESOLVER",

        passed:
            engineSource.includes(
                "ScientificProtocolStructuralIdentityResolver"
            ) &&
            engineSource.includes(
                "structuralIdentityResolver.resolve"
            )
    },
    {
        name:
            "ENGINE DOES NOT REIMPLEMENT ERC IDENTITY REGEX",

        passed:
            !engineSource.includes(
                "^(?:I)?ERC([1-9][0-9]*)$"
            ) &&
            !engineSource.includes(
                "^ERC([1-9][0-9]*)Reference$"
            )
    },
    {
        name:
            "SHARED IDENTITY BASIS IS CAPABILITY INDEPENDENT",

        passed:
            !basisSource.includes(
                "Capability"
            ) &&
            !basisSource.includes(
                "ExternalCall"
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
            "ATTRIBUTED CALL HAS NO CONFIDENCE",

        passed:
            !/\bconfidence\b/.test(
                modelSource
            )
    },
    {
        name:
            "ATTRIBUTED CALL HAS NO RELATIONSHIP FIELD",

        passed:
            !/\brelationships?\s*:/.test(
                modelSource
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC PROTOCOL EXTERNAL CALL ATTRIBUTION BOUNDARY"
);
console.log(
    "------------------------------------------------------"
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
    `RESULT: ${
        passed ===
            checks.length
            ? "PASS"
            : `FAIL (${checks.length - passed}/${checks.length})`
    }`
);


if (
    passed !==
    checks.length
) {

    process.exitCode =
        1;

}
