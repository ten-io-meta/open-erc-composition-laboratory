import assert from "node:assert/strict";

import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    fn:
        () => void
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
    "SCIENTIFIC SOURCE FACT EXTERNAL CALL EXTRACTION"
);
console.log(
    "-----------------------------------------------"
);


const source =
`contract Fixture {

    function lowLevel(
        address newWallet,
        bytes memory signature
    ) external {

        (bool ok, bytes memory result) = newWallet.staticcall(
            abi.encodeCall(
                IERC1271.isValidSignature,
                (bytes32(0), signature)
            )
        );

        ok;
        result;
    }

    function typed(
        address to,
        uint256 tokenId
    ) external {

        try IERC721Receiver(to).onERC721Received(
            msg.sender,
            address(this),
            tokenId,
            ""
        ) returns (bytes4 retval) {
            retval;
        } catch {}
    }

    function lexicalNoise() external {

        string memory fakeLow =
            "newWallet.staticcall(payload)";

        string memory fakeTyped =
            "IERC721Receiver(to).onERC721Received(...)";

        // ignored.staticcall(payload);

        /*
         * IERC721Receiver(fake).onERC721Received(
         *     a,
         *     b,
         *     c,
         *     d
         * );
         */
    }
}`;


const observation =
    {
        observationId:
            "OBS-EXTERNAL-CALL",

        sourceId:
            "SOURCE-EXTERNAL-CALL",

        sourceType:
            "FIXTURE",

        sourceRevision:
            "2222222222222222222222222222222222222222",

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                "fixture://external-call",

            filePath:
                "Fixture.sol",

            startLine:
                200,

            endLine:
                247
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


const calls =
    facts.filter(
        fact =>
            fact.kind ===
            "EXTERNAL_CALL_EXPRESSION"
    );


check(
    "EXACTLY TWO REAL EXTERNAL CALL EXPRESSIONS ARE OBSERVED",
    () => {

        assert.equal(
            calls.length,
            2
        );

    }
);


const lowLevel =
    calls.find(
        fact =>
            fact.externalCall?.callForm ===
            "LOW_LEVEL_STATICCALL"
    );


const typed =
    calls.find(
        fact =>
            fact.externalCall?.callForm ===
            "CAST_MEMBER_CALL"
    );


check(
    "LOW LEVEL STATICCALL PRESERVES TARGET EXPRESSION",
    () => {

        assert.ok(
            lowLevel
        );

        assert.equal(
            lowLevel.externalCall?.targetExpression,
            "newWallet"
        );

    }
);


check(
    "LOW LEVEL STATICCALL PRESERVES ENCODED CALL SYMBOLS",
    () => {

        assert.ok(
            lowLevel
        );

        assert.equal(
            lowLevel.externalCall?.encodedCallTypeSymbol,
            "IERC1271"
        );

        assert.equal(
            lowLevel.externalCall?.encodedCallMemberSymbol,
            "isValidSignature"
        );

    }
);


check(
    "LOW LEVEL STATICCALL PRESERVES COMPLETE MULTILINE SOURCE",
    () => {

        assert.ok(
            lowLevel
        );

        assert.equal(
            lowLevel.locator.startLine <
                lowLevel.locator.endLine,
            true
        );

        assert.equal(
            lowLevel.rawText.includes(
                "abi.encodeCall("
            ),
            true
        );

        assert.equal(
            lowLevel.rawText.includes(
                "IERC1271.isValidSignature"
            ),
            true
        );

    }
);


check(
    "CAST MEMBER CALL PRESERVES SOURCE TYPE TARGET AND MEMBER",
    () => {

        assert.ok(
            typed
        );

        assert.equal(
            typed.externalCall?.castTypeSymbol,
            "IERC721Receiver"
        );

        assert.equal(
            typed.externalCall?.targetExpression,
            "to"
        );

        assert.equal(
            typed.externalCall?.memberSymbol,
            "onERC721Received"
        );

    }
);


check(
    "CAST MEMBER CALL DOES NOT PRETEND TO KNOW EVM OPCODE",
    () => {

        assert.ok(
            typed
        );

        assert.equal(
            typed.externalCall?.callForm,
            "CAST_MEMBER_CALL"
        );

        assert.notEqual(
            typed.externalCall?.callForm,
            "LOW_LEVEL_CALL"
        );

    }
);


check(
    "EXTERNAL CALL FACTS PRESERVE STRUCTURAL CONTRACT CONTAINER",
    () => {

        assert.equal(
            calls.every(
                fact =>
                    fact.containerKind ===
                        "CONTRACT" &&
                    fact.containerSymbol ===
                        "Fixture"
            ),
            true
        );

    }
);


check(
    "COMMENTS AND STRINGS DO NOT PRODUCE EXTERNAL CALL FACTS",
    () => {

        assert.equal(
            calls.some(
                fact =>
                    fact.rawText.includes(
                        "ignored.staticcall"
                    ) ||
                    fact.rawText.includes(
                        "IERC721Receiver(fake)"
                    ) ||
                    fact.rawText.includes(
                        "fakeLow"
                    ) ||
                    fact.rawText.includes(
                        "fakeTyped"
                    )
            ),
            false
        );

    }
);


check(
    "EXTERNAL CALL FACTS PRESERVE EXACT SOURCE PROVENANCE",
    () => {

        assert.equal(
            calls.every(
                fact =>
                    fact.observationId ===
                        "OBS-EXTERNAL-CALL" &&
                    fact.sourceId ===
                        "SOURCE-EXTERNAL-CALL" &&
                    fact.sourceRevision ===
                        "2222222222222222222222222222222222222222" &&
                    fact.locator.filePath ===
                        "Fixture.sol"
            ),
            true
        );

    }
);


check(
    "EXTERNAL CALL FACTS DO NOT PRECOMPUTE COMPOSITION SEMANTICS",
    () => {

        const forbidden =
            [
                "protocolPair",
                "capabilityPair",
                "relation",
                "confidence",
                "compositionCandidate",
                "scientificPolarity"
            ];


        assert.equal(
            calls.every(
                fact =>
                    forbidden.every(
                        field =>
                            !Object.prototype
                                .hasOwnProperty
                                .call(
                                    fact,
                                    field
                                )
                    )
            ),
            true
        );


        assert.equal(
            calls.every(
                fact =>
                    forbidden.every(
                        field =>
                            !Object.prototype
                                .hasOwnProperty
                                .call(
                                    fact.externalCall ?? {},
                                    field
                                )
                    )
            ),
            true
        );

    }
);


check(
    "EXTERNAL CALL EXTRACTION IS DETERMINISTIC",
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
    fail >
    0
) {

    process.exitCode =
        1;

}