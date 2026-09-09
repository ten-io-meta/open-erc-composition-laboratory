import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";

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

import {
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";


let pass =
    0;

let fail =
    0;


function check(
    name:
        string,
    condition:
        boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    if (condition) {
        pass++;
    }
    else {
        fail++;
    }

}


function requireNoErrors(
    stage:
        string,
    errors:
        string[]
): void {

    if (
        errors.length ===
        0
    ) {
        return;
    }


    throw new Error(
        [
            `${stage} failed:`,
            ...errors
        ].join(
            "\n"
        )
    );

}


interface RealSourceSpec {

    owner:
        string;

    repo:
        string;

    expectedRevision:
        string;

    protocolId:
        string;

}


async function structuralSource(
    spec:
        RealSourceSpec
) {

    const github =
        await new GitHubAdapter()
            .run({

                owner:
                    spec.owner,

                repo:
                    spec.repo,

                forceFresh:
                    false

            });


    requireNoErrors(
        `${spec.protocolId} GitHub source`,
        github.errors
    );


    const sourceRevision =
        github.repository.commitSha;


    if (
        sourceRevision ===
        undefined
    ) {

        throw new Error(
            `${spec.protocolId} source has no revision.`
        );

    }


    if (
        sourceRevision !==
        spec.expectedRevision
    ) {

        throw new Error(
            [
                `${spec.protocolId} revision mismatch.`,
                `expected=${spec.expectedRevision}`,
                `observed=${sourceRevision}`
            ].join(
                "\n"
            )
        );

    }


    const semantic =
        new ScientificSemanticDerivationEngine()
            .derive({

                sourceId:
                    github.sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts

            });


    requireNoErrors(
        `${spec.protocolId} semantic derivation`,
        semantic.errors
    );


    const capabilityAttribution =
        new ScientificCapabilityAttributionEngine()
            .attribute({

                derivation:
                    semantic,

                facts:
                    github.sourceFacts

            });


    requireNoErrors(
        `${spec.protocolId} capability attribution`,
        capabilityAttribution.errors
    );


    const protocolIdentity =
        new ScientificProtocolIdentityAttributionEngine()
            .attribute({

                attribution:
                    capabilityAttribution,

                observations:
                    github.sourceObservations

            });


    requireNoErrors(
        `${spec.protocolId} protocol identity`,
        protocolIdentity.errors
    );


    const structural =
        new ScientificStructuralProtocolRelationEvidenceEngine()
            .extract({

                sourceId:
                    github.sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts,

                protocolAttributedCapabilities:
                    protocolIdentity
                        .protocolAttributedCapabilities

            });


    requireNoErrors(
        `${spec.protocolId} structural relations`,
        structural.errors
    );


    return {

        spec,

        github,

        sourceRevision,

        protocolIdentity,

        structural

    };

}


async function main(): Promise<void> {

    console.log("");
    console.log(
        "V2.1 REAL STRUCTURAL FOUNDATION CONTROL"
    );

    console.log(
        "======================================="
    );


    const erc8004 =
        await structuralSource({

            owner:
                "erc-8004",

            repo:
                "erc-8004-contracts",

            expectedRevision:
                "b9e466c250744a7e06b13dff9d3c2844ed64f825",

            protocolId:
                "ERC-8004"

        });


    const erc8060 =
        await structuralSource({

            owner:
                "ten-io-meta",

            repo:
                "erc8060-native-eth-value",

            expectedRevision:
                "c7eed906835ab39fbc8439eb0493e5a5371b23a2",

            protocolId:
                "ERC-8060"

        });


    const relation8004 =
        erc8004.structural.relations
            .find(
                relation =>
                    relation.subjectProtocolId ===
                        "ERC-8004" &&
                    relation.relation ===
                        "DEPENDS_ON" &&
                    relation.objectProtocolId ===
                        "ERC-721"
            );


    const relation8060 =
        erc8060.structural.relations
            .find(
                relation =>
                    relation.subjectProtocolId ===
                        "ERC-8060" &&
                    relation.relation ===
                        "DEPENDS_ON" &&
                    relation.objectProtocolId ===
                        "ERC-721"
            );


    check(
        "ERC-8004 STRUCTURAL IDENTITY EXISTS",
        erc8004.protocolIdentity
            .protocolAttributedCapabilities
            .some(
                attribution =>
                    attribution.protocolId ===
                    "ERC-8004"
            )
    );


    check(
        "ERC-8060 STRUCTURAL IDENTITY EXISTS",
        erc8060.protocolIdentity
            .protocolAttributedCapabilities
            .some(
                attribution =>
                    attribution.protocolId ===
                    "ERC-8060"
            )
    );


    check(
        "ERC-8004 DEPENDS ON ERC-721",
        relation8004 !==
        undefined
    );


    check(
        "ERC-8060 DEPENDS ON ERC-721",
        relation8060 !==
        undefined
    );


    check(
        "ERC-8004 FOUNDATION EVIDENCE IS SOLIDITY INHERITANCE",
        relation8004
            ?.evidenceBasis ===
        "SOLIDITY_INHERITANCE_ERC_FAMILY"
    );


    check(
        "ERC-8060 FOUNDATION EVIDENCE IS SOLIDITY INHERITANCE",
        relation8060
            ?.evidenceBasis ===
        "SOLIDITY_INHERITANCE_ERC_FAMILY"
    );


    check(
        "FOUNDATION EVIDENCE PRESERVES SOURCE REVISIONS",
        relation8004
            ?.sourceRevision ===
                erc8004.sourceRevision &&
        relation8060
            ?.sourceRevision ===
                erc8060.sourceRevision
    );


    const discovery =
        new CrossProtocolCompositionEngine()
            .discover({

                protocolConceptResults:
                    [],

                protocolRelationEvidenceResults:
                    [],

                structuralProtocolRelationEvidenceResults:
                    [
                        erc8004.structural,
                        erc8060.structural
                    ]

            });


    requireNoErrors(
        "Cross-protocol structural discovery",
        discovery.errors
    );


    const foundationCandidate =
        discovery.candidates
            .find(
                candidate => {

                    const participants =
                        [
                            candidate.participantA.id,
                            candidate.participantB.id
                        ].sort();


                    return (
                        participants[0] ===
                            "ERC-8004" &&
                        participants[1] ===
                            "ERC-8060" &&
                        candidate.mechanism ===
                            "SHARED_PROTOCOL_FOUNDATION" &&
                        candidate.foundationProtocolId ===
                            "ERC-721"
                    );

                }
            );


    check(
        "SHARED ERC-721 FOUNDATION OPENS 8004 × 8060 CANDIDATE",
        foundationCandidate !==
        undefined
    );


    check(
        "FOUNDATION CANDIDATE REMAINS UNEVALUATED",
        foundationCandidate
            ?.evaluationStatus ===
        "UNEVALUATED"
    );


    check(
        "FOUNDATION CANDIDATE HAS BOTH SOURCE PROVENANCES",
        (
            foundationCandidate
                ?.provenance.length ??
            0
        ) >=
        2 &&
        foundationCandidate
            ?.provenance
            .every(
                provenance =>
                    provenance.kind ===
                    "STRUCTURAL_PROTOCOL_RELATION"
            ) ===
        true
    );


    const repeated =
        new CrossProtocolCompositionEngine()
            .discover({

                protocolConceptResults:
                    [],

                protocolRelationEvidenceResults:
                    [],

                structuralProtocolRelationEvidenceResults:
                    [
                        erc8004.structural,
                        erc8060.structural
                    ]

            });


    check(
        "STRUCTURAL FOUNDATION DISCOVERY IS DETERMINISTIC",
        JSON.stringify(
            discovery
        ) ===
        JSON.stringify(
            repeated
        )
    );


    const serialized =
        JSON.stringify(
            discovery
        );


    check(
        "STRUCTURAL FOUNDATION DISCOVERY CONTAINS NO SCIENTIFIC POLARITY",
        !serialized.includes(
            '"SUPPORT"'
        ) &&
        !serialized.includes(
            '"CHALLENGE"'
        ) &&
        !serialized.includes(
            '"FULL"'
        ) &&
        !serialized.includes(
            '"PARTIAL"'
        )
    );


    console.log("");
    console.log(
        "FOUNDATION DETAILS"
    );

    console.log(
        "------------------"
    );


    if (
        relation8004 !==
        undefined
    ) {

        console.log(
            `ERC-8004 inherited: ${relation8004.inheritedSymbol}`
        );

        console.log(
            `ERC-8004 evidence:  ${relation8004.relationEvidenceId}`
        );

    }


    if (
        relation8060 !==
        undefined
    ) {

        console.log(
            `ERC-8060 inherited: ${relation8060.inheritedSymbol}`
        );

        console.log(
            `ERC-8060 evidence:  ${relation8060.relationEvidenceId}`
        );

    }


    if (
        foundationCandidate !==
        undefined
    ) {

        console.log(
            `candidate:   ${foundationCandidate.candidateId}`
        );

        console.log(
            `mechanism:   ${foundationCandidate.mechanism}`
        );

        console.log(
            `foundation:  ${foundationCandidate.foundationProtocolId}`
        );

        console.log(
            `provenance:  ${foundationCandidate.provenance.length}`
        );

        console.log(
            `evaluation:  ${foundationCandidate.evaluationStatus}`
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
        `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
    );


    if (
        fail >
        0
    ) {

        process.exitCode =
            1;

    }

}


main()
    .catch(
        error => {

            console.error(
                error
            );

            process.exitCode =
                1;

        }
    );