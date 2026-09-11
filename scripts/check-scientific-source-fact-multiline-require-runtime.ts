import assert from "node:assert/strict";

import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";


let pass =
    0;

let fail =
    0;


function check(
    name: string,
    fn: () => void
): void {

    try {

        fn();

        console.log(
            `${name}: PASS`
        );

        pass++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        fail++;

    }

}


console.log("");
console.log(
    "SCIENTIFIC SOURCE FACT MULTILINE REQUIRE"
);
console.log(
    "----------------------------------------"
);


const source = `contract Fixture {

    address owner;

    function update(
        uint256 tokenId
    ) external {

        require(
            msg.sender == owner ||
            msg.sender == address(1),
            "Not authorized"
        );

        require(tokenId > 0, "bad token");

    }

}`;


const observation = {

    observationId:
        "OBS-MULTILINE-REQUIRE",

    sourceId:
        "SOURCE-MULTILINE-REQUIRE",

    sourceType:
        "FIXTURE",

    sourceRevision:
        "1111111111111111111111111111111111111111",

    kind:
        "CONTRACT_SOURCE",

    locator: {

        sourceLocation:
            "fixture://multiline-require",

        filePath:
            "Fixture.sol",

        startLine:
            100,

        endLine:
            119

    },

    rawText:
        source

} as any;


const extractor =
    new SolidityScientificSourceFactExtractor();


const facts =
    extractor.extract(
        observation
    );


const requireFacts =
    facts.filter(
        fact =>
            fact.kind ===
            "REQUIRE_STATEMENT"
    );


check(
    "BOTH REQUIRE STATEMENTS ARE OBSERVED",
    () => {

        assert.equal(
            requireFacts.length,
            2
        );

    }
);


const multiline =
    requireFacts.find(
        fact =>
            fact.locator.startLine ===
            108
    );


const singleLine =
    requireFacts.find(
        fact =>
            fact.rawText.includes(
                "bad token"
            )
    );


check(
    "MULTILINE REQUIRE PRESERVES COMPLETE SOURCE TEXT",
    () => {

        assert.ok(
            multiline
        );

        assert.ok(
            multiline.rawText.includes(
                "msg.sender == owner"
            )
        );

        assert.ok(
            multiline.rawText.includes(
                "msg.sender == address(1)"
            )
        );

        assert.ok(
            multiline.rawText.includes(
                '"Not authorized"'
            )
        );

        assert.equal(
            multiline.rawText
                .trim()
                .endsWith(
                    ");"
                ),
            true
        );

    }
);


check(
    "MULTILINE REQUIRE PRESERVES COMPLETE LINE RANGE",
    () => {

        assert.ok(
            multiline
        );

        assert.equal(
            multiline.locator.startLine,
            108
        );

        assert.equal(
            multiline.locator.endLine,
            112
        );

    }
);


check(
    "SINGLE LINE REQUIRE REMAINS SINGLE LINE",
    () => {

        assert.ok(
            singleLine
        );

        assert.equal(
            singleLine.rawText.trim(),
            'require(tokenId > 0, "bad token");'
        );

        assert.equal(
            singleLine.locator.startLine,
            singleLine.locator.endLine
        );

    }
);


check(
    "MULTILINE REQUIRE EXTRACTION IS DETERMINISTIC",
    () => {

        const second =
            extractor.extract(
                observation
            );

        assert.deepEqual(
            facts,
            second
        );

    }
);


console.log("");
console.log(
    `PASS: ${pass}`
);

console.log(
    `FAIL: ${fail}`
);

console.log(
    `RESULT: ${
        fail === 0
            ? "PASS"
            : "FAIL"
    }`
);


if (
    fail > 0
) {

    process.exitCode =
        1;

}
