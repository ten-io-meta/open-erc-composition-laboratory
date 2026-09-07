import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";


let passed =
    0;

let failed =
    0;


function check(
    name: string,
    condition: boolean
): void {

    if (
        condition
    ) {

        console.log(
            `PASS: ${name}`
        );

        passed++;

        return;

    }


    console.log(
        `FAIL: ${name}`
    );

    failed++;

}


const observation: any = {

    observationId:
        "OBS-DECLARATION-HEADER",

    sourceId:
        "SOURCE-A",

    sourceType:
        "GITHUB",

    sourceRevision:
        "REVISION-A",

    kind:
        "CONTRACT_SOURCE",

    locator: {

        sourceLocation:
            "https://github.com/example/example",

        filePath:
            "contracts/Example.sol",

        startLine:
            100,

        endLine:
            130

    },

    rawText: [
        "pragma solidity ^0.8.20;",
        "",
        "contract ERC8060Reference is",
        "    ERC721URIStorage,",
        "    Ownable,",
        "    IERC721Value",
        "{",
        "    function valueOf(uint256 id) public view returns (uint256) {",
        "        return id;",
        "    }",
        "}",
        "",
        "interface IComposite is",
        "    IERC721,",
        "    IERC165",
        "{",
        "    function supportsInterface(bytes4 id) external view returns (bool);",
        "}",
        "",
        'contract SameLine is ERC721, Base("{") {',
        "}"
    ].join("\n")

};


const facts =
    new SolidityScientificSourceFactExtractor()
        .extract(
            observation
        );


const contractFact =
    facts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "ERC8060Reference"
    );


const interfaceFact =
    facts.find(
        fact =>
            fact.kind ===
                "INTERFACE_DECLARATION" &&
            fact.symbol ===
                "IComposite"
    );


const sameLineFact =
    facts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "SameLine"
    );


console.log("");
console.log(
    "SCIENTIFIC SOURCE FACT - COMPLETE DECLARATION HEADER"
);
console.log(
    "----------------------------------------------------"
);


check(
    "MULTILINE CONTRACT DECLARATION EXISTS",
    contractFact !==
        undefined
);


check(
    "MULTILINE CONTRACT PRESERVES COMPLETE HEADER",
    contractFact?.rawText ===
        [
            "contract ERC8060Reference is",
            "    ERC721URIStorage,",
            "    Ownable,",
            "    IERC721Value",
            "{"
        ].join("\n")
);


check(
    "MULTILINE CONTRACT START LINE IS PRESERVED",
    contractFact?.locator.startLine ===
        102
);


check(
    "MULTILINE CONTRACT END LINE REACHES OPENING BRACE",
    contractFact?.locator.endLine ===
        106
);


check(
    "CONTRACT DECLARATION DOES NOT INCLUDE BODY",
    contractFact?.rawText.includes(
        "function valueOf"
    ) ===
        false
);


check(
    "MULTILINE INTERFACE DECLARATION EXISTS",
    interfaceFact !==
        undefined
);


check(
    "MULTILINE INTERFACE PRESERVES COMPLETE HEADER",
    interfaceFact?.rawText ===
        [
            "interface IComposite is",
            "    IERC721,",
            "    IERC165",
            "{"
        ].join("\n")
);


check(
    "MULTILINE INTERFACE END LINE REACHES OPENING BRACE",
    interfaceFact?.locator.endLine ===
        115
);


check(
    "SAME-LINE DECLARATION STOPS AT STRUCTURAL OPENING BRACE",
    sameLineFact?.rawText ===
        'contract SameLine is ERC721, Base("{") {'
);


check(
    "SAME-LINE DECLARATION KEEPS SINGLE-LINE LOCATOR",
    sameLineFact?.locator.startLine ===
        119 &&
    sameLineFact?.locator.endLine ===
        119
);


console.log("");
console.log(
    `PASS: ${passed}`
);

console.log(
    `FAIL: ${failed}`
);

console.log(
    failed ===
        0
        ? "RESULT: PASS"
        : "RESULT: FAIL"
);


if (
    failed >
    0
) {

    process.exitCode =
        1;

}
