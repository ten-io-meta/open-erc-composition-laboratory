import assert from "node:assert/strict";

import {
    execFileSync
} from "node:child_process";

import {
    readFile
} from "node:fs/promises";

import {
    resolve
} from "node:path";

import type {
    ScientificSourceObservation
} from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";

import {
    SolidityScientificSourceFactExtractor
} from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";

import {
    ScientificSemanticDerivationEngine
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";

import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import {
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";


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


function git(
    repository:
        string,
    args:
        string[]
): string {

    return execFileSync(
        "git",
        [
            "-C",
            repository,
            ...args
        ],
        {
            encoding:
                "utf8"
        }
    )
        .trim();

}


function lineCount(
    value:
        string
): number {

    return value
        .replace(
            /\r\n/g,
            "\n"
        )
        .split(
            "\n"
        )
        .length;

}


console.log("");
console.log(
    "SCIENTIFIC STRUCTURAL PROTOCOL RELATION — REAL PINNED ERC8060"
);
console.log(
    "-------------------------------------------------------------"
);


const root =
    resolve(
        "external/github/ten-io-meta/erc8060-native-eth-value"
    );

const revision =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";

const relativePath =
    "contracts/ERC8060Reference.sol";

const sourcePath =
    resolve(
        root,
        relativePath
    );

const sourceId =
    "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE";


const actualRevision =
    git(
        root,
        [
            "rev-parse",
            "HEAD"
        ]
    );


const source =
    await readFile(
        sourcePath,
        "utf8"
    );


check(
    "ERC8060 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            actualRevision,
            revision
        );

    }
);


check(
    "REAL ERC8060 SOURCE CARRIES ERC721 STORAGE INHERITANCE",
    () => {

        assert.equal(
            source.includes(
                "ERC721URIStorage"
            ),
            true
        );

    }
);


const observation:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-ERC8060-REFERENCE-STRUCTURAL-RELATION",

        sourceId,

        sourceType:
            "GITHUB",

        sourceRevision:
            revision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                sourcePath,

            filePath:
                relativePath,

            startLine:
                1,

            endLine:
                lineCount(
                    source
                )
        },

        rawText:
            source
    };


const extractor =
    new SolidityScientificSourceFactExtractor();


const facts =
    extractor.extract(
        observation
    );


const declaration =
    facts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "ERC8060Reference"
    );


check(
    "REAL ERC8060 CONTRACT DECLARATION FACT IS OBSERVED",
    () => {

        assert.ok(
            declaration
        );

    }
);


check(
    "REAL ERC8060 DECLARATION PRESERVES ERC721 INHERITANCE SOURCE",
    () => {

        assert.equal(
            declaration?.rawText.includes(
                "ERC721URIStorage"
            ),
            true
        );

    }
);


const semantic =
    new ScientificSemanticDerivationEngine()
        .derive({

            sourceId,

            sourceRevision:
                revision,

            facts

        });


check(
    "REAL ERC8060 SEMANTIC DERIVATION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            semantic.errors,
            []
        );

    }
);


const capabilityAttribution =
    new ScientificCapabilityAttributionEngine()
        .attribute({

            derivation:
                semantic,

            facts

        });


check(
    "REAL ERC8060 CAPABILITY ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            capabilityAttribution.errors,
            []
        );

    }
);


const protocolIdentity =
    new ScientificProtocolIdentityAttributionEngine()
        .attribute({

            attribution:
                capabilityAttribution,

            observations: [
                observation
            ]

        });


check(
    "REAL ERC8060 PROTOCOL IDENTITY HAS NO ERRORS",
    () => {

        assert.deepEqual(
            protocolIdentity.errors,
            []
        );

    }
);


const erc8060Attributions =
    protocolIdentity
        .protocolAttributedCapabilities
        .filter(
            attribution =>
                attribution.protocolId ===
                    "ERC-8060" &&
                attribution.containerSymbol ===
                    "ERC8060Reference"
        );


check(
    "REAL ERC8060 CONTAINER IS STRUCTURALLY ATTRIBUTED TO ERC-8060",
    () => {

        assert.equal(
            erc8060Attributions.length >
                0,
            true
        );

    }
);


check(
    "REAL ERC8060 IDENTITY USES EXACT REFERENCE CONTAINER BASIS",
    () => {

        assert.equal(
            erc8060Attributions.every(
                attribution =>
                    attribution.identityBasis ===
                        "EXACT_ERC_REFERENCE_CONTAINER_SYMBOL"
            ),
            true
        );

    }
);


const relationEngine =
    new ScientificStructuralProtocolRelationEvidenceEngine();


const relations =
    relationEngine.extract({

        sourceId,

        sourceRevision:
            revision,

        facts,

        protocolAttributedCapabilities:
            protocolIdentity.protocolAttributedCapabilities

    });


check(
    "REAL ERC8060 STRUCTURAL RELATION EXTRACTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            relations.errors,
            []
        );

    }
);


const erc721Relations =
    relations.relations
        .filter(
            relation =>
                relation.subjectProtocolId ===
                    "ERC-8060" &&
                relation.relation ===
                    "DEPENDS_ON" &&
                relation.objectProtocolId ===
                    "ERC-721"
        );


check(
    "REAL ERC8060 DEPENDS ON ERC-721",
    () => {

        assert.equal(
            erc721Relations.length >
                0,
            true
        );

    }
);


const storageRelation =
    erc721Relations.find(
        relation =>
            relation.inheritedSymbol ===
                "ERC721URIStorage"
    );


check(
    "REAL ERC721 URI STORAGE INHERITANCE IS EXACT DEPENDENCY EVIDENCE",
    () => {

        assert.ok(
            storageRelation
        );

    }
);


check(
    "REAL DEPENDENCY PRESERVES SOLIDITY INHERITANCE BASIS",
    () => {

        assert.equal(
            storageRelation?.evidenceBasis,
            "SOLIDITY_INHERITANCE_ERC_FAMILY"
        );

    }
);


check(
    "REAL DEPENDENCY PRESERVES ERC8060 DECLARATION FACT",
    () => {

        assert.equal(
            storageRelation?.factId,
            declaration?.factId
        );

    }
);


check(
    "REAL ERC8060 DOES NOT CREATE SELF DEPENDENCY",
    () => {

        assert.equal(
            relations.relations.some(
                relation =>
                    relation.subjectProtocolId ===
                        "ERC-8060" &&
                    relation.objectProtocolId ===
                        "ERC-8060"
            ),
            false
        );

    }
);


const repeated =
    relationEngine.extract({

        sourceId,

        sourceRevision:
            revision,

        facts,

        protocolAttributedCapabilities:
            protocolIdentity.protocolAttributedCapabilities

    });


check(
    "REAL STRUCTURAL DEPENDENCY EXTRACTION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            relations
        );

    }
);


console.log("");

console.log(
    `RELATIONS: ${relations.relations.length}`
);

for (
    const relation
    of relations.relations
) {

    console.log(
        `${relation.subjectProtocolId} ${relation.relation} ${relation.objectProtocolId} via ${relation.inheritedSymbol}`
    );

}


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
