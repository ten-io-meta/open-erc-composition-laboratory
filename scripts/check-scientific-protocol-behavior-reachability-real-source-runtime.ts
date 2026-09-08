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
    ScientificProtocolExternalCallAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionEngine.js";

import {
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";

import {
    ScientificSolidityInheritanceGraphEngine
} from "../laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.js";

import {
    ScientificProtocolBehaviorReachabilityEngine
} from "../laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachabilityEngine.js";


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
    "SCIENTIFIC PROTOCOL BEHAVIOR REACHABILITY — REAL PINNED ERC8060"
);
console.log(
    "----------------------------------------------------------------"
);


/*
 * Participant protocol checkout.
 */
const erc8060Root =
    resolve(
        "external/github/ten-io-meta/erc8060-native-eth-value"
    );

const erc8060Revision =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";

const erc8060SourceId =
    "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE";

const erc8060RelativePath =
    "contracts/ERC8060Reference.sol";

const erc8060Path =
    resolve(
        erc8060Root,
        erc8060RelativePath
    );


/*
 * Effective OpenZeppelin dependency selected by the pinned
 * participant workspace.
 */
const dependencySourceId =
    "NPM-OPENZEPPELIN-CONTRACTS";

const dependencyRevision =
    "4.9.6";

const uriStorageRelativePath =
    "node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

const uriStoragePath =
    resolve(
        erc8060Root,
        uriStorageRelativePath
    );

const erc721RelativePath =
    "node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

const erc721Path =
    resolve(
        erc8060Root,
        erc721RelativePath
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


const erc8060Source =
    await readFile(
        erc8060Path,
        "utf8"
    );

const uriStorageSource =
    await readFile(
        uriStoragePath,
        "utf8"
    );

const erc721Source =
    await readFile(
        erc721Path,
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

const openZeppelinLockEntry =
    packageLock.packages?.[
        "node_modules/@openzeppelin/contracts"
    ];


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
    "ERC8060 LOCK SELECTS OPENZEPPELIN CONTRACTS 4.9.6",
    () => {

        assert.ok(
            openZeppelinLockEntry
        );

        assert.equal(
            openZeppelinLockEntry.version,
            dependencyRevision
        );

        assert.equal(
            openZeppelinPackage.version,
            dependencyRevision
        );

    }
);


const participantObservation:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-REACHABILITY-ERC8060-REFERENCE",

        sourceId:
            erc8060SourceId,

        sourceType:
            "GITHUB",

        sourceRevision:
            erc8060Revision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                erc8060Path,

            filePath:
                erc8060RelativePath,

            startLine:
                1,

            endLine:
                lineCount(
                    erc8060Source
                )
        },

        rawText:
            erc8060Source
    };


const uriStorageObservation:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-REACHABILITY-OZ-ERC721-URI-STORAGE",

        sourceId:
            dependencySourceId,

        sourceType:
            "NPM_PACKAGE",

        sourceRevision:
            dependencyRevision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                uriStoragePath,

            filePath:
                uriStorageRelativePath,

            startLine:
                1,

            endLine:
                lineCount(
                    uriStorageSource
                )
        },

        rawText:
            uriStorageSource
    };


const erc721Observation:
    ScientificSourceObservation =
    {
        observationId:
            "REAL-REACHABILITY-OZ-ERC721",

        sourceId:
            dependencySourceId,

        sourceType:
            "NPM_PACKAGE",

        sourceRevision:
            dependencyRevision,

        kind:
            "CONTRACT_SOURCE",

        locator: {
            sourceLocation:
                erc721Path,

            filePath:
                erc721RelativePath,

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


const participantFacts =
    extractor.extract(
        participantObservation
    );

const uriStorageFacts =
    extractor.extract(
        uriStorageObservation
    );

const erc721Facts =
    extractor.extract(
        erc721Observation
    );


const participantDeclaration =
    participantFacts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "ERC8060Reference"
    );

const uriStorageDeclaration =
    uriStorageFacts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "ERC721URIStorage"
    );

const erc721Declaration =
    erc721Facts.find(
        fact =>
            fact.kind ===
                "CONTRACT_DECLARATION" &&
            fact.symbol ===
                "ERC721"
    );


check(
    "REAL ERC8060 DECLARATION IS OBSERVED",
    () => {

        assert.ok(
            participantDeclaration
        );

    }
);


check(
    "REAL ERC721 URI STORAGE DECLARATION IS OBSERVED",
    () => {

        assert.ok(
            uriStorageDeclaration
        );

    }
);


check(
    "REAL ERC721 DECLARATION IS OBSERVED",
    () => {

        assert.ok(
            erc721Declaration
        );

    }
);


check(
    "ERC8060 DIRECTLY INHERITS ERC721 URI STORAGE",
    () => {

        assert.equal(
            participantDeclaration?.rawText.includes(
                "ERC721URIStorage"
            ),
            true
        );

    }
);


check(
    "ERC721 URI STORAGE DIRECTLY INHERITS ERC721",
    () => {

        assert.equal(
            uriStorageDeclaration?.rawText.includes(
                "ERC721"
            ),
            true
        );

    }
);


/*
 * Identify participant protocol from its own pinned source.
 */
const semantic =
    new ScientificSemanticDerivationEngine()
        .derive({

            sourceId:
                erc8060SourceId,

            sourceRevision:
                erc8060Revision,

            facts:
                participantFacts

        });


const capabilityAttribution =
    new ScientificCapabilityAttributionEngine()
        .attribute({

            derivation:
                semantic,

            facts:
                participantFacts

        });


const participantIdentity =
    new ScientificProtocolIdentityAttributionEngine()
        .attribute({

            attribution:
                capabilityAttribution,

            observations: [
                participantObservation
            ]

        });


check(
    "REAL ERC8060 PIPELINE HAS NO IDENTITY ERRORS",
    () => {

        assert.deepEqual(
            semantic.errors,
            []
        );

        assert.deepEqual(
            capabilityAttribution.errors,
            []
        );

        assert.deepEqual(
            participantIdentity.errors,
            []
        );

    }
);


check(
    "PARTICIPANT CONTAINER IS IDENTIFIED AS ERC-8060",
    () => {

        assert.equal(
            participantIdentity
                .protocolAttributedCapabilities
                .some(
                    attribution =>
                        attribution.protocolId ===
                            "ERC-8060" &&
                        attribution.containerSymbol ===
                            "ERC8060Reference"
                ),
            true
        );

    }
);


/*
 * Existing structural protocol relation evidence.
 */
const structuralRelations =
    new ScientificStructuralProtocolRelationEvidenceEngine()
        .extract({

            sourceId:
                erc8060SourceId,

            sourceRevision:
                erc8060Revision,

            facts:
                participantFacts,

            protocolAttributedCapabilities:
                participantIdentity.protocolAttributedCapabilities

        });


check(
    "REAL ERC8060 STRUCTURAL RELATIONS HAVE NO ERRORS",
    () => {

        assert.deepEqual(
            structuralRelations.errors,
            []
        );

    }
);


const uriStorageRelation =
    structuralRelations.relations.find(
        relation =>
            relation.subjectProtocolId ===
                "ERC-8060" &&
            relation.relation ===
                "DEPENDS_ON" &&
            relation.objectProtocolId ===
                "ERC-721" &&
            relation.inheritedSymbol ===
                "ERC721URIStorage"
    );


check(
    "EXACT ERC8060 TO ERC721 URI STORAGE DEPENDENCY EVIDENCE EXISTS",
    () => {

        assert.ok(
            uriStorageRelation
        );

    }
);


/*
 * Attribute the real source call to its true origin protocol.
 */
const callAttribution =
    new ScientificProtocolExternalCallAttributionEngine()
        .attribute({

            sourceId:
                dependencySourceId,

            sourceRevision:
                dependencyRevision,

            facts:
                erc721Facts,

            observations: [
                erc721Observation
            ]

        });


check(
    "REAL ERC721 CALL ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            callAttribution.errors,
            []
        );

    }
);


const sourceCall =
    erc721Facts.find(
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
    "REAL ERC721 RECEIVER CALL FACT IS OBSERVED",
    () => {

        assert.ok(
            sourceCall
        );

    }
);


const attributedCall =
    sourceCall ===
        undefined
        ? undefined
        : callAttribution
            .protocolAttributedExternalCalls
            .find(
                attribution =>
                    attribution.sourceFactId ===
                        sourceCall.factId
            );


check(
    "REAL RECEIVER CALL ORIGIN REMAINS ERC-721",
    () => {

        assert.ok(
            attributedCall
        );

        assert.equal(
            attributedCall.protocolId,
            "ERC-721"
        );

    }
);


/*
 * Build one concrete inheritance graph across participant source and
 * the exact effective dependency source selected by its lockfile.
 */
const inheritanceGraph =
    new ScientificSolidityInheritanceGraphEngine()
        .build({

            facts: [
                ...participantFacts,
                ...uriStorageFacts,
                ...erc721Facts
            ]

        });


check(
    "REAL CROSS-SOURCE INHERITANCE GRAPH HAS NO ERRORS",
    () => {

        assert.deepEqual(
            inheritanceGraph.errors,
            []
        );

    }
);


check(
    "GRAPH RESOLVES ERC8060 REFERENCE TO ERC721 URI STORAGE",
    () => {

        assert.equal(
            inheritanceGraph.edges.some(
                edge =>
                    edge.subjectContainerSymbol ===
                        "ERC8060Reference" &&
                    edge.inheritedSymbol ===
                        "ERC721URIStorage" &&
                    edge.objectContainerSymbol ===
                        "ERC721URIStorage"
            ),
            true
        );

    }
);


check(
    "GRAPH RESOLVES ERC721 URI STORAGE TO ERC721",
    () => {

        assert.equal(
            inheritanceGraph.edges.some(
                edge =>
                    edge.subjectContainerSymbol ===
                        "ERC721URIStorage" &&
                    edge.inheritedSymbol ===
                        "ERC721" &&
                    edge.objectContainerSymbol ===
                        "ERC721"
            ),
            true
        );

    }
);


/*
 * Evaluate reachability only for the known real call-site and the
 * exact structural dependency evidence that anchors the first path
 * edge.
 */
const reachability =
    new ScientificProtocolBehaviorReachabilityEngine()
        .evaluate({

            inheritanceGraph,

            structuralRelations:
                uriStorageRelation ===
                    undefined
                    ? []
                    : [
                        uriStorageRelation
                    ],

            protocolAttributedExternalCalls:
                attributedCall ===
                    undefined
                    ? []
                    : [
                        attributedCall
                    ]

        });


check(
    "REAL BEHAVIOR REACHABILITY HAS NO ERRORS",
    () => {

        assert.deepEqual(
            reachability.errors,
            []
        );

    }
);


check(
    "REAL ERC721 RECEIVER BEHAVIOR IS REACHABLE BY ERC8060",
    () => {

        assert.equal(
            reachability.reachableBehaviors.length,
            1
        );

    }
);


const reachable =
    reachability.reachableBehaviors[0];


check(
    "REACHABILITY PARTICIPANT IS ERC-8060",
    () => {

        assert.equal(
            reachable?.participantProtocolId,
            "ERC-8060"
        );

    }
);


check(
    "REACHABILITY ORIGIN REMAINS ERC-721",
    () => {

        assert.equal(
            reachable?.originProtocolId,
            "ERC-721"
        );

    }
);


check(
    "REAL EXACT CONTAINER PATH IS PRESERVED",
    () => {

        assert.deepEqual(
            reachable?.containerPath,
            [
                "ERC8060Reference",
                "ERC721URIStorage",
                "ERC721"
            ]
        );

    }
);


check(
    "REAL REACHABILITY USES EXACTLY TWO INHERITANCE EDGES",
    () => {

        assert.equal(
            reachable?.inheritanceEdgeIds.length,
            2
        );

    }
);


check(
    "REAL ERC8060 DEPENDENCY EVIDENCE IS PRESERVED",
    () => {

        assert.deepEqual(
            reachable?.protocolRelationEvidenceIds,
            uriStorageRelation ===
                undefined
                ? []
                : [
                    uriStorageRelation.relationEvidenceId
                ]
        );

    }
);


check(
    "REAL ERC721 CALL FACT IS PRESERVED THROUGH REACHABILITY",
    () => {

        assert.equal(
            reachable?.sourceCallFactId,
            sourceCall?.factId
        );

        assert.equal(
            reachable?.protocolCallAttributionId,
            attributedCall?.protocolCallAttributionId
        );

    }
);


check(
    "REAL RECEIVER CALL SYNTAX IS PRESERVED THROUGH REACHABILITY",
    () => {

        assert.deepEqual(
            reachable?.externalCall,
            attributedCall?.externalCall
        );

    }
);


check(
    "REACHABILITY DOES NOT REWRITE ORIGIN AS ERC-8060",
    () => {

        assert.equal(
            reachable?.originProtocolId ===
                "ERC-8060",
            false
        );

    }
);


check(
    "REACHABILITY DOES NOT INVENT TARGET PROTOCOL",
    () => {

        assert.equal(
            Object.prototype.hasOwnProperty.call(
                reachable ?? {},
                "targetProtocolId"
            ),
            false
        );

    }
);


check(
    "REACHABILITY DOES NOT INVENT COMPOSITION SEMANTICS",
    () => {

        for (
            const field
            of [
                "candidateId",
                "compositionCandidate",
                "scientificPolarity",
                "compatibility",
                "interactionDirection",
                "confidence",
                "relationships"
            ]
        ) {

            assert.equal(
                Object.prototype.hasOwnProperty.call(
                    reachable ?? {},
                    field
                ),
                false
            );

        }

    }
);


const repeated =
    new ScientificProtocolBehaviorReachabilityEngine()
        .evaluate({

            inheritanceGraph,

            structuralRelations:
                uriStorageRelation ===
                    undefined
                    ? []
                    : [
                        uriStorageRelation
                    ],

            protocolAttributedExternalCalls:
                attributedCall ===
                    undefined
                    ? []
                    : [
                        attributedCall
                    ]

        });


check(
    "REAL BEHAVIOR REACHABILITY IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeated,
            reachability
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
