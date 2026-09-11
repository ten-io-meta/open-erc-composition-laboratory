import assert from "node:assert/strict";

import {
    ScientificNormativeStatementEngine
} from "../laboratory/scientific-normative-statement/ScientificNormativeStatementEngine.js";


const engine =
    new ScientificNormativeStatementEngine();


const result =
    engine.extract({

        observations: [

            {

                observationId:
                    "OBS-8301",

                sourceId:
                    "SOURCE-A",

                sourceRevision:
                    "REV-1",

                locator: {

                    sourceLocation:
                        "memory://ERC8301/README.md",

                    filePath:
                        "ERC8301/README.md",

                    startLine:
                        1,

                    endLine:
                        30

                },

                rawText: [
                    "# ERC-8301: Test",
                    "",
                    "A workflow must preserve the trusted policy domain.",
                    "`actionNonce` must equal",
                    "`nextActionNonce(agentId)` at settlement.",
                    "A verdict must not gate an unrelated reply.",
                    "For a step that must prove refusal, evidence is anchored.",
                    "One verdict cannot span several replies.",
                    "The profile requires exact authorization.",
                    "A client should expose diagnostics.",
                    "",
                    "> quoted text must not count",
                    "",
                    "| rule | meaning |",
                    "|---|---|",
                    "| nonce | must increase |",
                    "",
                    "```solidity",
                    'require(example, "must not count");',
                    "```",
                    "",
                    "This co-mention must not transfer ownership to ERC-8354."
                ].join(
                    "\n"
                )

            }

        ]

    });


assert.equal(
    result.errors.length,
    0
);


assert.equal(
    result.statements.length,
    4,
    "Expected four high-confidence normative statements."
);


assert.ok(
    result.statements.every(
        statement =>
            statement.protocolId ===
            "ERC-8301"
    )
);


const wrapped =
    result.statements.find(
        statement =>
            statement.normalizedText.includes(
                "actionNonce"
            )
    );


assert.equal(
    wrapped?.normalizedText,
    "`actionNonce` must equal `nextActionNonce(agentId)` at settlement."
);


assert.equal(
    result.statements.some(
        statement =>
            statement.normalizedText.includes(
                "cannot span"
            )
    ),
    false
);


assert.equal(
    result.statements.some(
        statement =>
            statement.normalizedText.includes(
                "requires exact"
            )
    ),
    false
);


assert.equal(
    result.statements.some(
        statement =>
            statement.normalizedText.includes(
                "that must prove"
            )
    ),
    false
);


assert.equal(
    result.statements.some(
        statement =>
            statement.normalizedText.includes(
                "quoted text"
            )
    ),
    false
);


assert.equal(
    result.statements.some(
        statement =>
            statement.normalizedText.includes(
                "must increase"
            )
    ),
    false
);


console.log(
    "SCIENTIFIC NORMATIVE STATEMENT HIGH-CONFIDENCE V1: PASS"
);

console.log(
    `STATEMENTS: ${result.statements.length}`
);


for (
    const statement
    of result.statements
) {

    console.log(
        `${statement.basis} | line=${statement.sourceLine}`
    );

    console.log(
        `  ${statement.normalizedText}`
    );

}


console.log(
    "CANNOT EXCLUDED: PASS"
);

console.log(
    "REQUIRES EXCLUDED: PASS"
);

console.log(
    "RELATIVE-CLAUSE MUST EXCLUDED: PASS"
);

console.log(
    "WRAPPED MARKDOWN RECOVERED: PASS"
);

console.log(
    "NO COMPATIBILITY CLAIM: PASS"
);
