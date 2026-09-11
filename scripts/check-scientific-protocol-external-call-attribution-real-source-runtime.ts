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
    ScientificProtocolExternalCallAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionEngine.js";


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


function gitHashObject(
    filePath:
        string
): string {

    return execFileSync(
        "git",
        [
            "hash-object",
            filePath
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
    "SCIENTIFIC PROTOCOL EXTERNAL CALL ATTRIBUTION — REAL PINNED SOURCES"
);
console.log(
    "------------------------------------------------------------------"
);


/*
 * Real participant A.
 */
const erc8004Root =
    resolve(
        "external/github/erc-8004/erc-8004-contracts"
    );

const erc8004Revision =
    "b9e466c250744a7e06b13dff9d3c2844ed64f825";

const identityRegistryRelativePath =
    "contracts/IdentityRegistryUpgradeable.sol";

const identityRegistryPath =
    resolve(
        erc8004Root,
        identityRegistryRelativePath
    );


/*
 * Real participant B workspace.
 *
 * The call source tested below belongs to the exact OpenZeppelin
 * dependency selected by this pinned ERC8060 workspace. It is not
 * represented as ERC8060-authored source.
 */
const erc8060Root =
    resolve(
        "external/github/ten-io-meta/erc8060-native-eth-value"
    );

const erc8060Revision =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";

const erc8060ReferenceRelativePath =
    "contracts/ERC8060Reference.sol";

const erc8060ReferencePath =
    resolve(
        erc8060Root,
        erc8060ReferenceRelativePath
    );

const packageLockPath =
    resolve(
        erc8060Root,
        "package-lock.json"
    );

const openZeppelinPackagePath =
    resolve(
        erc8060Root,
        "node_modules/@openzeppelin/contracts/package.json"
    );

const erc721RelativeDependencyPath =
    "node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

const erc721Path =
    resolve(
        erc8060Root,
        erc721RelativeDependencyPath
    );


const identityRegistrySource =
    await readFile(
        identityRegistryPath,
        "utf8"
    );

const erc8060ReferenceSource =
    await readFile(
        erc8060ReferencePath,
        "utf8"
    );

const packageLock =
    JSON.parse(
        await readFile(
            packageLockPath,
            "utf8"
        )
    ) as any;

const openZeppelinPackage =
    JSON.parse(
        await readFile(
            openZeppelinPackagePath,
            "utf8"
        )
    ) as any;

const erc721Source =
    await readFile(
        erc721Path,
        "utf8"
    );


const openZeppelinLockEntry =
    packageLock.packages?.[
        "node_modules/@openzeppelin/contracts"
    ];


check(
    "ERC8004 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            git(
                erc8004Root,
                [
                    "rev-parse",
                    "HEAD"
                ]
            ),
            erc8004Revision
        );

    }
);


check(
    "ERC8060 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            git(
                erc8060Root,
                [
                    "rev-parse",
                    "HEAD"
                ]
            ),
            erc8060Revision
        );

    }
);


check(
    "ERC8060 REAL SOURCE USES OPENZEPPELIN ERC721 STORAGE",
    () => {

        assert.equal(
            erc8060ReferenceSource.includes(
                '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol'
            ),
            true
        );

    }
);


check(
    "ERC8060 LOCK SELECTS OPENZEPPELIN CONTRACTS 4.9.6",
    () => {

        assert.ok(
            openZeppelinLockEntry
        );

        assert.equal(
            openZeppelinLockEntry.version,
            "4.9.6"
        );

        assert.equal(
            openZeppelinLockEntry.resolved,
            "https://registry.npmjs.org/@openzeppelin/contracts/-/contracts-4.9.6.tgz"
        );

        assert.equal(
            openZeppelinLockEntry.integrity,
            "sha512-xSmezSupL+y9VkHZJGDoCBpmnB2ogM13ccaYDWqJTfS3dbuHkgjuwDFUmaFauBCboQMGB/S5UqUl2y54X99BmA=="
        );

    }
);


check(
    "INSTALLED OPENZEPPELIN PACKAGE MATCHES LOCKED VERSION",
    () => {

        assert.equal(
            openZeppelinPackage.version,
            "4.9.6"
        );

    }
);


check(
    "EFFECTIVE ERC721 SOURCE MATCHES THE OBSERVED BLOB",
    () => {

        assert.equal(
            gitHashObject(
                erc721Path
            ),
            "7942e6fe49ead042cbe6efc361f5a6ca92b8e567"
        );

    }
);


const observationA:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-CONTROL-ERC8004-IDENTITY-REGISTRY-ATTRIBUTION",

        sourceId:
            "GITHUB-ERC-8004-ERC-8004-CONTRACTS",

        sourceType:
            "GITHUB",

        sourceRevision:
            erc8004Revision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                identityRegistryPath,

            filePath:
                identityRegistryRelativePath,

            startLine:
                1,

            endLine:
                lineCount(
                    identityRegistrySource
                )
        },

        rawText:
            identityRegistrySource
    };


const observationB:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-CONTROL-ERC8060-EFFECTIVE-OZ-ERC721-ATTRIBUTION",

        sourceId:
            "NPM-OPENZEPPELIN-CONTRACTS",

        sourceType:
            "NPM_PACKAGE",

        sourceRevision:
            "4.9.6",

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                erc721Path,

            filePath:
                erc721RelativeDependencyPath,

            startLine:
                1,

            endLine:
                lineCount(
                    erc721Source
                )
        },

        rawText:
            erc721Source
    };


const extractor =
    new SolidityScientificSourceFactExtractor();


const factsA =
    extractor.extract(
        observationA
    );

const factsB =
    extractor.extract(
        observationB
    );


const sourceCallA =
    factsA.find(
        fact =>
            fact.kind ===
                "EXTERNAL_CALL_EXPRESSION" &&
            fact.externalCall?.callForm ===
                "LOW_LEVEL_STATICCALL" &&
            fact.externalCall?.targetExpression ===
                "newWallet" &&
            fact.externalCall?.encodedCallTypeSymbol ===
                "IERC1271" &&
            fact.externalCall?.encodedCallMemberSymbol ===
                "isValidSignature"
    );


const sourceCallB =
    factsB.find(
        fact =>
            fact.kind ===
                "EXTERNAL_CALL_EXPRESSION" &&
            fact.externalCall?.callForm ===
                "CAST_MEMBER_CALL" &&
            fact.externalCall?.castTypeSymbol ===
                "IERC721Receiver" &&
            fact.externalCall?.targetExpression ===
                "to" &&
            fact.externalCall?.memberSymbol ===
                "onERC721Received"
    );


check(
    "REAL ERC8004 SOURCE CALL FACT IS OBSERVED",
    () => {

        assert.ok(
            sourceCallA
        );

    }
);


check(
    "REAL ERC721 DEPENDENCY CALL FACT IS OBSERVED",
    () => {

        assert.ok(
            sourceCallB
        );

    }
);


const attributionEngine =
    new ScientificProtocolExternalCallAttributionEngine();


const resultA =
    attributionEngine.attribute({
        sourceId:
            observationA.sourceId,

        sourceRevision:
            observationA.sourceRevision,

        facts:
            factsA,

        observations: [
            observationA
        ]
    });


const resultB =
    attributionEngine.attribute({
        sourceId:
            observationB.sourceId,

        sourceRevision:
            observationB.sourceRevision,

        facts:
            factsB,

        observations: [
            observationB
        ]
    });


const attributedCallA =
    sourceCallA ===
        undefined
        ? undefined
        : resultA.protocolAttributedExternalCalls.find(
            attribution =>
                attribution.sourceFactId ===
                    sourceCallA.factId
        );


const attributedCallB =
    sourceCallB ===
        undefined
        ? undefined
        : resultB.protocolAttributedExternalCalls.find(
            attribution =>
                attribution.sourceFactId ===
                    sourceCallB.factId
        );


check(
    "REAL ERC8004 ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            resultA.errors,
            []
        );

    }
);


check(
    "REAL ERC8004 CALL ORIGIN IS ATTRIBUTED TO ERC-8004",
    () => {

        assert.ok(
            attributedCallA
        );

        assert.equal(
            attributedCallA.protocolId,
            "ERC-8004"
        );

    }
);


check(
    "REAL ERC8004 CALL USES EXPLICIT STORAGE NAMESPACE IDENTITY",
    () => {

        assert.equal(
            attributedCallA?.identityBasis,
            "EXPLICIT_ERC_STORAGE_NAMESPACE"
        );

    }
);


check(
    "REAL ERC8004 CALL PRESERVES STATICCALL SYNTAX",
    () => {

        assert.deepEqual(
            attributedCallA?.externalCall,
            sourceCallA?.externalCall
        );

    }
);


check(
    "REAL ERC8004 CALL PRESERVES SOURCE FACT ID",
    () => {

        assert.equal(
            attributedCallA?.sourceFactId,
            sourceCallA?.factId
        );

    }
);


check(
    "REAL ERC721 DEPENDENCY ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            resultB.errors,
            []
        );

    }
);


check(
    "REAL ERC721 CALL ORIGIN IS ATTRIBUTED TO ERC-721",
    () => {

        assert.ok(
            attributedCallB
        );

        assert.equal(
            attributedCallB.protocolId,
            "ERC-721"
        );

    }
);


check(
    "REAL ERC721 CALL USES EXACT CONTAINER IDENTITY",
    () => {

        assert.equal(
            attributedCallB?.identityBasis,
            "EXACT_ERC_CONTAINER_SYMBOL"
        );

    }
);


check(
    "REAL ERC721 CALL PRESERVES CAST MEMBER SYNTAX",
    () => {

        assert.deepEqual(
            attributedCallB?.externalCall,
            sourceCallB?.externalCall
        );

    }
);


check(
    "DEPENDENCY CALL IS NOT MISATTRIBUTED AS ERC-8060",
    () => {

        assert.equal(
            attributedCallB?.protocolId ===
                "ERC-8060",
            false
        );

    }
);


check(
    "REAL ATTRIBUTIONS DO NOT INVENT TARGET PROTOCOL",
    () => {

        for (
            const attribution
            of [
                attributedCallA,
                attributedCallB
            ]
        ) {

            assert.ok(
                attribution
            );

            assert.equal(
                Object.prototype.hasOwnProperty.call(
                    attribution,
                    "targetProtocolId"
                ),
                false
            );

        }

    }
);


check(
    "REAL ATTRIBUTIONS DO NOT INVENT COMPOSITION SEMANTICS",
    () => {

        const forbidden =
            [
                "candidateId",
                "compositionCandidate",
                "scientificPolarity",
                "compatibility",
                "interactionDirection",
                "confidence",
                "relationships"
            ];


        for (
            const attribution
            of [
                attributedCallA,
                attributedCallB
            ]
        ) {

            assert.ok(
                attribution
            );


            for (
                const field
                of forbidden
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        attribution,
                        field
                    ),
                    false
                );

            }

        }

    }
);


const repeatedA =
    attributionEngine.attribute({
        sourceId:
            observationA.sourceId,

        sourceRevision:
            observationA.sourceRevision,

        facts:
            factsA,

        observations: [
            observationA
        ]
    });


const repeatedB =
    attributionEngine.attribute({
        sourceId:
            observationB.sourceId,

        sourceRevision:
            observationB.sourceRevision,

        facts:
            factsB,

        observations: [
            observationB
        ]
    });


check(
    "REAL ERC8004 ATTRIBUTION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeatedA,
            resultA
        );

    }
);


check(
    "REAL ERC721 ATTRIBUTION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeatedB,
            resultB
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
