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
    "SCIENTIFIC SOURCE FACT — REAL PINNED EXTERNAL CALL OBSERVATION"
);
console.log(
    "--------------------------------------------------------------"
);


/*
 * Known-control source A:
 *
 * authoritative ERC-8004 Git checkout pinned to the revision already
 * carried by the scientific control.
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
 * Known-control source B:
 *
 * ERC-8060 Git checkout plus the exact OpenZeppelin dependency
 * installed by its package lock.
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


const actual8004Revision =
    git(
        erc8004Root,
        [
            "rev-parse",
            "HEAD"
        ]
    );

const actual8060Revision =
    git(
        erc8060Root,
        [
            "rev-parse",
            "HEAD"
        ]
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
            actual8004Revision,
            erc8004Revision
        );

    }
);


check(
    "ERC8060 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            actual8060Revision,
            erc8060Revision
        );

    }
);


check(
    "ERC8060 REAL SOURCE IMPORTS OPENZEPPELIN ERC721 STORAGE",
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
    "ERC8060 LOCK PINS OPENZEPPELIN CONTRACTS 4.9.6",
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
    "EFFECTIVE ERC721 SOURCE HAS THE OBSERVED LOCAL BLOB",
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
            "REAL-CONTROL-ERC8004-IDENTITY-REGISTRY",

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
            "REAL-CONTROL-ERC8060-EFFECTIVE-OPENZEPPELIN-ERC721",

        /*
         * This observation is intentionally identified as dependency
         * source material rather than pretending ERC721.sol was
         * authored by ERC8060.
         *
         * The surrounding checks establish why this exact dependency
         * belongs to the pinned ERC8060 workspace.
         */
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


const callA =
    factsA.find(
        fact =>
            fact.kind ===
                "EXTERNAL_CALL_EXPRESSION" &&
            fact.externalCall?.callForm ===
                "LOW_LEVEL_STATICCALL" &&
            fact.externalCall.targetExpression ===
                "newWallet" &&
            fact.externalCall.encodedCallTypeSymbol ===
                "IERC1271" &&
            fact.externalCall.encodedCallMemberSymbol ===
                "isValidSignature"
    );


const callB =
    factsB.find(
        fact =>
            fact.kind ===
                "EXTERNAL_CALL_EXPRESSION" &&
            fact.externalCall?.callForm ===
                "CAST_MEMBER_CALL" &&
            fact.externalCall.castTypeSymbol ===
                "IERC721Receiver" &&
            fact.externalCall.targetExpression ===
                "to" &&
            fact.externalCall.memberSymbol ===
                "onERC721Received"
    );


check(
    "REAL ERC8004 SOURCE OBSERVES THE STATICCALL FACT",
    () => {

        assert.ok(
            callA
        );

    }
);


check(
    "REAL ERC8004 CALL PRESERVES STRUCTURAL CONTAINER",
    () => {

        assert.equal(
            callA?.containerKind,
            "CONTRACT"
        );

        assert.equal(
            callA?.containerSymbol,
            "IdentityRegistryUpgradeable"
        );

    }
);


check(
    "REAL ERC8004 CALL PRESERVES PINNED PROVENANCE",
    () => {

        assert.equal(
            callA?.sourceId,
            "GITHUB-ERC-8004-ERC-8004-CONTRACTS"
        );

        assert.equal(
            callA?.sourceRevision,
            erc8004Revision
        );

        assert.equal(
            callA?.locator.filePath,
            identityRegistryRelativePath
        );

    }
);


check(
    "REAL ERC8004 STATICCALL IS OBSERVED AT THE PINNED SOURCE LOCATION",
    () => {

        assert.equal(
            callA?.locator.startLine,
            156
        );

        assert.equal(
            callA?.rawText.includes(
                "newWallet.staticcall("
            ),
            true
        );

    }
);


check(
    "REAL ERC8060 EFFECTIVE ERC721 SOURCE OBSERVES THE CAST MEMBER CALL FACT",
    () => {

        assert.ok(
            callB
        );

    }
);


check(
    "REAL ERC721 CALL PRESERVES STRUCTURAL CONTAINER",
    () => {

        assert.equal(
            callB?.containerKind,
            "CONTRACT"
        );

        assert.equal(
            callB?.containerSymbol,
            "ERC721"
        );

    }
);


check(
    "REAL ERC721 CALL PRESERVES DEPENDENCY PROVENANCE",
    () => {

        assert.equal(
            callB?.sourceId,
            "NPM-OPENZEPPELIN-CONTRACTS"
        );

        assert.equal(
            callB?.sourceRevision,
            "4.9.6"
        );

        assert.equal(
            callB?.locator.filePath,
            erc721RelativeDependencyPath
        );

    }
);


check(
    "REAL ERC721 RECEIVER CALL IS OBSERVED AT THE EFFECTIVE SOURCE LOCATION",
    () => {

        assert.equal(
            callB?.locator.startLine,
            406
        );

        assert.equal(
            callB?.rawText.includes(
                "IERC721Receiver(to).onERC721Received("
            ),
            true
        );

    }
);


check(
    "REAL SOURCE CALL FACTS DO NOT PRECOMPUTE CROSS-PROTOCOL SEMANTICS",
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

        for (
            const fact
            of [
                callA,
                callB
            ]
        ) {

            assert.ok(
                fact
            );

            for (
                const field
                of forbidden
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        fact,
                        field
                    ),
                    false
                );

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        fact.externalCall ?? {},
                        field
                    ),
                    false
                );

            }

        }

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