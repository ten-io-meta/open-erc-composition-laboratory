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
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";

import {
    ScientificSolidityInheritanceGraphEngine
} from "../laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.js";

import {
    ScientificProtocolBehaviorReachabilityEngine
} from "../laboratory/scientific-protocol-behavior-reachability/ScientificProtocolBehaviorReachabilityEngine.js";

import {
    ScientificCrossProtocolInteractionHypothesisEngine
} from "../laboratory/scientific-cross-protocol-interaction-hypothesis/ScientificCrossProtocolInteractionHypothesisEngine.js";


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


function observation(
    observationId:
        string,
    sourceId:
        string,
    sourceRevision:
        string,
    sourceType:
        string,
    sourcePath:
        string,
    relativePath:
        string,
    rawText:
        string
): ScientificSourceObservation {

    return {

        observationId,

        sourceId,

        sourceType,

        sourceRevision,

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
                    rawText
                )

        },

        rawText

    };

}


console.log("");
console.log(
    "SCIENTIFIC CROSS-PROTOCOL INTERACTION HYPOTHESIS — REAL PINNED CONTROL"
);
console.log(
    "-----------------------------------------------------------------------"
);


/*
 * ============================================================
 * REAL PINNED PARTICIPANT A
 * ============================================================
 */

const rootA =
    resolve(
        "external/github/erc-8004/erc-8004-contracts"
    );

const revisionA =
    "b9e466c250744a7e06b13dff9d3c2844ed64f825";

const sourceIdA =
    "GITHUB-ERC-8004-ERC-8004-CONTRACTS";

const relativePathA =
    "contracts/IdentityRegistryUpgradeable.sol";

const pathA =
    resolve(
        rootA,
        relativePathA
    );


/*
 * ============================================================
 * REAL PINNED PARTICIPANT B
 * ============================================================
 */

const rootB =
    resolve(
        "external/github/ten-io-meta/erc8060-native-eth-value"
    );

const revisionB =
    "c7eed906835ab39fbc8439eb0493e5a5371b23a2";

const sourceIdB =
    "GITHUB-TEN-IO-META-ERC8060-NATIVE-ETH-VALUE";

const relativePathB =
    "contracts/ERC8060Reference.sol";

const pathB =
    resolve(
        rootB,
        relativePathB
    );


/*
 * Effective dependency selected by the pinned B workspace.
 */
const dependencySourceId =
    "NPM-OPENZEPPELIN-CONTRACTS";

const dependencyRevision =
    "4.9.6";

const uriStorageRelativePath =
    "node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

const uriStoragePath =
    resolve(
        rootB,
        uriStorageRelativePath
    );

const erc721RelativePath =
    "node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

const erc721Path =
    resolve(
        rootB,
        erc721RelativePath
    );

const lockPath =
    resolve(
        rootB,
        "package-lock.json"
    );

const dependencyPackagePath =
    resolve(
        rootB,
        "node_modules/@openzeppelin/contracts/package.json"
    );


const sourceA =
    await readFile(
        pathA,
        "utf8"
    );

const sourceB =
    await readFile(
        pathB,
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

const lock =
    JSON.parse(
        await readFile(
            lockPath,
            "utf8"
        )
    ) as any;

const dependencyPackage =
    JSON.parse(
        await readFile(
            dependencyPackagePath,
            "utf8"
        )
    ) as any;

const dependencyLockEntry =
    lock.packages?.[
        "node_modules/@openzeppelin/contracts"
    ];


/*
 * ============================================================
 * PINNED PROVENANCE
 * ============================================================
 */

check(
    "ERC8004 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            git(
                rootA,
                [
                    "rev-parse",
                    "HEAD"
                ]
            ),
            revisionA
        );

    }
);


check(
    "ERC8060 WORKTREE IS AT THE PINNED REVISION",
    () => {

        assert.equal(
            git(
                rootB,
                [
                    "rev-parse",
                    "HEAD"
                ]
            ),
            revisionB
        );

    }
);


check(
    "ERC8060 EFFECTIVE OPENZEPPELIN DEPENDENCY IS 4.9.6",
    () => {

        assert.ok(
            dependencyLockEntry
        );

        assert.equal(
            dependencyLockEntry.version,
            dependencyRevision
        );

        assert.equal(
            dependencyPackage.version,
            dependencyRevision
        );

    }
);


/*
 * ============================================================
 * SOURCE OBSERVATIONS + FACTS
 * ============================================================
 */

const observationA =
    observation(
        "REAL-HYPOTHESIS-ERC8004",
        sourceIdA,
        revisionA,
        "GITHUB",
        pathA,
        relativePathA,
        sourceA
    );

const observationB =
    observation(
        "REAL-HYPOTHESIS-ERC8060",
        sourceIdB,
        revisionB,
        "GITHUB",
        pathB,
        relativePathB,
        sourceB
    );

const uriStorageObservation =
    observation(
        "REAL-HYPOTHESIS-OZ-ERC721-URI-STORAGE",
        dependencySourceId,
        dependencyRevision,
        "NPM_PACKAGE",
        uriStoragePath,
        uriStorageRelativePath,
        uriStorageSource
    );

const erc721Observation =
    observation(
        "REAL-HYPOTHESIS-OZ-ERC721",
        dependencySourceId,
        dependencyRevision,
        "NPM_PACKAGE",
        erc721Path,
        erc721RelativePath,
        erc721Source
    );


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

const uriStorageFacts =
    extractor.extract(
        uriStorageObservation
    );

const erc721Facts =
    extractor.extract(
        erc721Observation
    );


check(
    "REAL ERC8004 SOURCE FACTS ARE OBSERVED",
    () => {

        assert.equal(
            factsA.length >
                0,
            true
        );

    }
);


check(
    "REAL ERC8060 SOURCE FACTS ARE OBSERVED",
    () => {

        assert.equal(
            factsB.length >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * PARTICIPANT PROTOCOL IDENTITY + STRUCTURAL RELATIONS
 * ============================================================
 */

function participantPipeline(
    sourceId:
        string,
    sourceRevision:
        string,
    sourceFacts:
        typeof factsA,
    sourceObservation:
        ScientificSourceObservation
) {

    const semantic =
        new ScientificSemanticDerivationEngine()
            .derive({

                sourceId,

                sourceRevision,

                facts:
                    sourceFacts

            });


    const capabilityAttribution =
        new ScientificCapabilityAttributionEngine()
            .attribute({

                derivation:
                    semantic,

                facts:
                    sourceFacts

            });


    const protocolIdentity =
        new ScientificProtocolIdentityAttributionEngine()
            .attribute({

                attribution:
                    capabilityAttribution,

                observations: [
                    sourceObservation
                ]

            });


    const structuralRelations =
        new ScientificStructuralProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                facts:
                    sourceFacts,

                protocolAttributedCapabilities:
                    protocolIdentity.protocolAttributedCapabilities

            });


    return {

        semantic,

        capabilityAttribution,

        protocolIdentity,

        structuralRelations

    };

}


const participantA =
    participantPipeline(
        sourceIdA,
        revisionA,
        factsA,
        observationA
    );

const participantB =
    participantPipeline(
        sourceIdB,
        revisionB,
        factsB,
        observationB
    );


check(
    "REAL PARTICIPANT A PIPELINE HAS NO ERRORS",
    () => {

        assert.deepEqual(
            participantA.semantic.errors,
            []
        );

        assert.deepEqual(
            participantA.capabilityAttribution.errors,
            []
        );

        assert.deepEqual(
            participantA.protocolIdentity.errors,
            []
        );

        assert.deepEqual(
            participantA.structuralRelations.errors,
            []
        );

    }
);


check(
    "REAL PARTICIPANT B PIPELINE HAS NO ERRORS",
    () => {

        assert.deepEqual(
            participantB.semantic.errors,
            []
        );

        assert.deepEqual(
            participantB.capabilityAttribution.errors,
            []
        );

        assert.deepEqual(
            participantB.protocolIdentity.errors,
            []
        );

        assert.deepEqual(
            participantB.structuralRelations.errors,
            []
        );

    }
);


check(
    "REAL PARTICIPANT A IS ATTRIBUTED TO ERC-8004",
    () => {

        assert.equal(
            participantA
                .protocolIdentity
                .protocolAttributedCapabilities
                .some(
                    attribution =>
                        attribution.protocolId ===
                            "ERC-8004"
                ),
            true
        );

    }
);


check(
    "REAL PARTICIPANT B IS ATTRIBUTED TO ERC-8060",
    () => {

        assert.equal(
            participantB
                .protocolIdentity
                .protocolAttributedCapabilities
                .some(
                    attribution =>
                        attribution.protocolId ===
                            "ERC-8060"
                ),
            true
        );

    }
);


check(
    "REAL ERC8004 STRUCTURALLY DEPENDS ON ERC-721",
    () => {

        assert.equal(
            participantA
                .structuralRelations
                .relations
                .some(
                    relation =>
                        relation.subjectProtocolId ===
                            "ERC-8004" &&
                        relation.relation ===
                            "DEPENDS_ON" &&
                        relation.objectProtocolId ===
                            "ERC-721"
                ),
            true
        );

    }
);


check(
    "REAL ERC8060 STRUCTURALLY DEPENDS ON ERC-721",
    () => {

        assert.equal(
            participantB
                .structuralRelations
                .relations
                .some(
                    relation =>
                        relation.subjectProtocolId ===
                            "ERC-8060" &&
                        relation.relation ===
                            "DEPENDS_ON" &&
                        relation.objectProtocolId ===
                            "ERC-721"
                ),
            true
        );

    }
);


/*
 * ============================================================
 * AUTONOMOUS CROSS-PROTOCOL DISCOVERY
 *
 * No ERC8004×ERC8060 candidate is manually constructed here.
 * ============================================================
 */

const discovery =
    new CrossProtocolCompositionEngine()
        .discover({

            protocolConceptResults:
                [],

            protocolRelationEvidenceResults:
                [],

            structuralProtocolRelationEvidenceResults: [
                participantA.structuralRelations,
                participantB.structuralRelations
            ]

        });


check(
    "REAL CROSS-PROTOCOL DISCOVERY HAS NO ERRORS",
    () => {

        assert.deepEqual(
            discovery.errors,
            []
        );

    }
);


const discoveredCandidate =
    discovery.candidates.find(
        candidate => {

            if (
                candidate.participantA.kind !==
                    "PROTOCOL" ||
                candidate.participantB.kind !==
                    "PROTOCOL"
            ) {

                return false;

            }


            return [
                candidate.participantA.id,
                candidate.participantB.id
            ]
                .sort()
                .join("|") ===
                [
                    "ERC-8004",
                    "ERC-8060"
                ]
                    .sort()
                    .join("|");

        }
    );


check(
    "OECL AUTONOMOUSLY DISCOVERS ERC8004 × ERC8060",
    () => {

        assert.ok(
            discoveredCandidate
        );

    }
);


check(
    "REAL CANDIDATE IS OPENED BY SHARED PROTOCOL FOUNDATION",
    () => {

        assert.equal(
            discoveredCandidate?.mechanism,
            "SHARED_PROTOCOL_FOUNDATION"
        );

        assert.equal(
            discoveredCandidate?.foundationProtocolId,
            "ERC-721"
        );

    }
);


check(
    "REAL DISCOVERED CANDIDATE REMAINS UNEVALUATED",
    () => {

        assert.equal(
            discoveredCandidate?.evaluationStatus,
            "UNEVALUATED"
        );

    }
);


check(
    "REAL DISCOVERED CANDIDATE PRESERVES STRUCTURAL PROVENANCE",
    () => {

        assert.equal(
            (
                discoveredCandidate
                    ?.provenance
                    .filter(
                        provenance =>
                            provenance.kind ===
                                "STRUCTURAL_PROTOCOL_RELATION"
                    )
                    .length ??
                0
            ) >=
                2,
            true
        );

    }
);


/*
 * ============================================================
 * ALL REAL DIRECT CALL-SITES FROM PARTICIPANT A
 * ============================================================
 */

const callsA =
    new ScientificProtocolExternalCallAttributionEngine()
        .attribute({

            sourceId:
                sourceIdA,

            sourceRevision:
                revisionA,

            facts:
                factsA,

            observations: [
                observationA
            ]

        });


check(
    "REAL ERC8004 EXTERNAL CALL ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            callsA.errors,
            []
        );

    }
);


check(
    "REAL ERC8004 HAS PROTOCOL-ATTRIBUTED EXTERNAL CALLS",
    () => {

        assert.equal(
            callsA.protocolAttributedExternalCalls.length >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * ALL REAL ERC721 CALL-SITES FROM EFFECTIVE DEPENDENCY
 * ============================================================
 */

const dependencyCalls =
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
    "REAL ERC721 EXTERNAL CALL ATTRIBUTION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            dependencyCalls.errors,
            []
        );

    }
);


check(
    "REAL ERC721 HAS PROTOCOL-ATTRIBUTED EXTERNAL CALLS",
    () => {

        assert.equal(
            dependencyCalls.protocolAttributedExternalCalls.length >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * ALL REAL B→ERC721 REACHABLE BEHAVIORS
 * ============================================================
 */

const inheritanceGraph =
    new ScientificSolidityInheritanceGraphEngine()
        .build({

            facts: [
                ...factsB,
                ...uriStorageFacts,
                ...erc721Facts
            ]

        });


check(
    "REAL ERC8060 DEPENDENCY INHERITANCE GRAPH HAS NO ERRORS",
    () => {

        assert.deepEqual(
            inheritanceGraph.errors,
            []
        );

    }
);


const uriStorageRelations =
    participantB
        .structuralRelations
        .relations
        .filter(
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
    "REAL ERC8060 HAS EXACT ERC721 URI STORAGE DEPENDENCY EVIDENCE",
    () => {

        assert.equal(
            uriStorageRelations.length >
                0,
            true
        );

    }
);


const reachableB =
    new ScientificProtocolBehaviorReachabilityEngine()
        .evaluate({

            inheritanceGraph,

            structuralRelations:
                uriStorageRelations,

            protocolAttributedExternalCalls:
                dependencyCalls.protocolAttributedExternalCalls

        });


check(
    "REAL ERC8060 BEHAVIOR REACHABILITY HAS NO ERRORS",
    () => {

        assert.deepEqual(
            reachableB.errors,
            []
        );

    }
);


check(
    "REAL ERC8060 HAS REACHABLE ERC721 CALL BEHAVIOR",
    () => {

        assert.equal(
            reachableB.reachableBehaviors.length >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * GENERATE HYPOTHESES FROM THE DISCOVERED CANDIDATE
 *
 * Feed all attributed A call-sites and all reachable B call-sites.
 * The desired two routes are not preselected.
 * ============================================================
 */

const hypotheses =
    new ScientificCrossProtocolInteractionHypothesisEngine()
        .generate({

            candidates:
                discoveredCandidate ===
                    undefined
                    ? []
                    : [
                        discoveredCandidate
                    ],

            protocolAttributedExternalCalls: [
                ...callsA.protocolAttributedExternalCalls,
                ...dependencyCalls.protocolAttributedExternalCalls
            ],

            reachableBehaviors:
                reachableB.reachableBehaviors

        });


check(
    "REAL INTERACTION HYPOTHESIS GENERATION HAS NO ERRORS",
    () => {

        assert.deepEqual(
            hypotheses.errors,
            []
        );

    }
);


check(
    "REAL DISCOVERED CANDIDATE PRODUCES INTERACTION HYPOTHESES",
    () => {

        assert.equal(
            hypotheses.hypotheses.length >
                0,
            true
        );

        assert.equal(
            hypotheses
                .candidateIdsWithoutHypotheses
                .includes(
                    discoveredCandidate?.candidateId ??
                        ""
                ),
            false
        );

    }
);


/*
 * ============================================================
 * REDISCOVER THE REAL A→B ROUTE FROM SOURCE SEMANTICS
 * ============================================================
 */

const erc8004ToErc8060 =
    hypotheses.hypotheses.find(
        hypothesis =>
            hypothesis.sourceParticipantProtocolId ===
                "ERC-8004" &&
            hypothesis.hypothesizedTargetParticipantProtocolId ===
                "ERC-8060" &&
            hypothesis.behaviorEvidenceKind ===
                "DIRECT_PROTOCOL_CALL" &&
            hypothesis.originProtocolId ===
                "ERC-8004" &&
            hypothesis.externalCall.callForm ===
                "LOW_LEVEL_STATICCALL" &&
            hypothesis.externalCall.targetExpression ===
                "newWallet" &&
            hypothesis.externalCall.encodedCallTypeSymbol ===
                "IERC1271" &&
            hypothesis.externalCall.encodedCallMemberSymbol ===
                "isValidSignature"
    );


check(
    "OECL REDISCOVERS REAL ERC8004 TO ERC8060 INTERACTION HYPOTHESIS",
    () => {

        assert.ok(
            erc8004ToErc8060
        );

    }
);


check(
    "REAL ERC8004 TO ERC8060 HYPOTHESIS PRESERVES DIRECT CALL PROVENANCE",
    () => {

        assert.ok(
            erc8004ToErc8060
        );

        assert.equal(
            erc8004ToErc8060.behaviorReachabilityId,
            undefined
        );

        assert.equal(
            erc8004ToErc8060.sourceCallFactId.trim().length >
                0,
            true
        );

        assert.equal(
            erc8004ToErc8060.protocolCallAttributionId.trim().length >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * REDISCOVER THE REAL B→A ROUTE FROM INHERITED SOURCE SEMANTICS
 * ============================================================
 */

const erc8060ToErc8004 =
    hypotheses.hypotheses.find(
        hypothesis =>
            hypothesis.sourceParticipantProtocolId ===
                "ERC-8060" &&
            hypothesis.hypothesizedTargetParticipantProtocolId ===
                "ERC-8004" &&
            hypothesis.behaviorEvidenceKind ===
                "INHERITED_PROTOCOL_BEHAVIOR" &&
            hypothesis.originProtocolId ===
                "ERC-721" &&
            hypothesis.externalCall.callForm ===
                "CAST_MEMBER_CALL" &&
            hypothesis.externalCall.targetExpression ===
                "to" &&
            hypothesis.externalCall.castTypeSymbol ===
                "IERC721Receiver" &&
            hypothesis.externalCall.memberSymbol ===
                "onERC721Received"
    );


check(
    "OECL REDISCOVERS REAL ERC8060 TO ERC8004 INTERACTION HYPOTHESIS",
    () => {

        assert.ok(
            erc8060ToErc8004
        );

    }
);


check(
    "REAL ERC8060 TO ERC8004 HYPOTHESIS PRESERVES ERC721 ORIGIN",
    () => {

        assert.ok(
            erc8060ToErc8004
        );

        assert.equal(
            erc8060ToErc8004.originProtocolId,
            "ERC-721"
        );

        assert.equal(
            erc8060ToErc8004.sourceParticipantProtocolId,
            "ERC-8060"
        );

        assert.equal(
            erc8060ToErc8004.behaviorReachabilityId?.trim().length >
                0,
            true
        );

    }
);


const realReachability =
    reachableB.reachableBehaviors.find(
        reachable =>
            reachable.behaviorReachabilityId ===
                erc8060ToErc8004?.behaviorReachabilityId
    );


check(
    "REAL ERC8060 TO ERC8004 HYPOTHESIS PRESERVES EXACT INHERITANCE PATH",
    () => {

        assert.ok(
            realReachability
        );

        assert.deepEqual(
            realReachability.containerPath,
            [
                "ERC8060Reference",
                "ERC721URIStorage",
                "ERC721"
            ]
        );

    }
);


/*
 * ============================================================
 * CANDIDATE SIDE DIRECTION IS PRESERVED, WHATEVER DETERMINISTIC
 * A/B ORDER DISCOVERY CHOSE.
 * ============================================================
 */

function candidateSide(
    protocolId:
        string
): "A" | "B" | undefined {

    if (
        discoveredCandidate?.participantA.kind ===
            "PROTOCOL" &&
        discoveredCandidate.participantA.id ===
            protocolId
    ) {

        return "A";

    }


    if (
        discoveredCandidate?.participantB.kind ===
            "PROTOCOL" &&
        discoveredCandidate.participantB.id ===
            protocolId
    ) {

        return "B";

    }


    return undefined;

}


check(
    "ERC8004 TO ERC8060 HYPOTHESIS PRESERVES DISCOVERED CANDIDATE SIDES",
    () => {

        assert.equal(
            erc8004ToErc8060?.sourceSide,
            candidateSide(
                "ERC-8004"
            )
        );

        assert.equal(
            erc8004ToErc8060?.targetSide,
            candidateSide(
                "ERC-8060"
            )
        );

        assert.notEqual(
            erc8004ToErc8060?.sourceSide,
            erc8004ToErc8060?.targetSide
        );

    }
);


check(
    "ERC8060 TO ERC8004 HYPOTHESIS PRESERVES DISCOVERED CANDIDATE SIDES",
    () => {

        assert.equal(
            erc8060ToErc8004?.sourceSide,
            candidateSide(
                "ERC-8060"
            )
        );

        assert.equal(
            erc8060ToErc8004?.targetSide,
            candidateSide(
                "ERC-8004"
            )
        );

        assert.notEqual(
            erc8060ToErc8004?.sourceSide,
            erc8060ToErc8004?.targetSide
        );

    }
);


/*
 * ============================================================
 * SCIENTIFIC BOUNDARY
 * ============================================================
 */

check(
    "BOTH REDISCOVERED REAL INTERACTION HYPOTHESES REMAIN UNEVALUATED",
    () => {

        assert.equal(
            erc8004ToErc8060?.evaluationStatus,
            "UNEVALUATED"
        );

        assert.equal(
            erc8060ToErc8004?.evaluationStatus,
            "UNEVALUATED"
        );

    }
);


check(
    "REAL HYPOTHESES DO NOT CLAIM RUNTIME SUCCESS",
    () => {

        for (
            const hypothesis
            of [
                erc8004ToErc8060,
                erc8060ToErc8004
            ]
        ) {

            assert.ok(
                hypothesis
            );


            for (
                const field
                of [
                    "runtimeStatus",
                    "executionStatus",
                    "observedTargetAddress",
                    "scientificPolarity",
                    "compatibility",
                    "confidence"
                ]
            ) {

                assert.equal(
                    Object.prototype.hasOwnProperty.call(
                        hypothesis,
                        field
                    ),
                    false
                );

            }

        }

    }
);


check(
    "REAL HYPOTHESES PRESERVE DISCOVERED CANDIDATE IDENTITY",
    () => {

        assert.equal(
            erc8004ToErc8060?.candidateId,
            discoveredCandidate?.candidateId
        );

        assert.equal(
            erc8060ToErc8004?.candidateId,
            discoveredCandidate?.candidateId
        );

    }
);


check(
    "REAL HYPOTHESES PRESERVE CANDIDATE DISCOVERY PROVENANCE",
    () => {

        assert.deepEqual(
            erc8004ToErc8060?.candidateProvenanceEvidenceIds,
            erc8060ToErc8004?.candidateProvenanceEvidenceIds
        );

        assert.equal(
            (
                erc8004ToErc8060
                    ?.candidateProvenanceEvidenceIds
                    .length ??
                0
            ) >
                0,
            true
        );

    }
);


/*
 * ============================================================
 * DETERMINISM
 * ============================================================
 */

const repeatedDiscovery =
    new CrossProtocolCompositionEngine()
        .discover({

            protocolConceptResults:
                [],

            protocolRelationEvidenceResults:
                [],

            structuralProtocolRelationEvidenceResults: [
                participantA.structuralRelations,
                participantB.structuralRelations
            ]

        });


check(
    "REAL AUTONOMOUS CANDIDATE DISCOVERY IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeatedDiscovery,
            discovery
        );

    }
);


const repeatedHypotheses =
    new ScientificCrossProtocolInteractionHypothesisEngine()
        .generate({

            candidates:
                discoveredCandidate ===
                    undefined
                    ? []
                    : [
                        discoveredCandidate
                    ],

            protocolAttributedExternalCalls: [
                ...dependencyCalls.protocolAttributedExternalCalls,
                ...callsA.protocolAttributedExternalCalls
            ],

            reachableBehaviors: [
                ...reachableB.reachableBehaviors
            ].reverse()

        });


check(
    "REAL INTERACTION HYPOTHESIS GENERATION IS DETERMINISTIC",
    () => {

        assert.deepEqual(
            repeatedHypotheses,
            hypotheses
        );

    }
);


console.log("");

console.log(
    `DISCOVERED CANDIDATES: ${discovery.candidates.length}`
);

console.log(
    `ERC8004 ATTRIBUTED CALLS: ${callsA.protocolAttributedExternalCalls.length}`
);

console.log(
    `ERC721 ATTRIBUTED CALLS: ${dependencyCalls.protocolAttributedExternalCalls.length}`
);

console.log(
    `ERC8060 REACHABLE BEHAVIORS: ${reachableB.reachableBehaviors.length}`
);

console.log(
    `GENERATED HYPOTHESES: ${hypotheses.hypotheses.length}`
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
