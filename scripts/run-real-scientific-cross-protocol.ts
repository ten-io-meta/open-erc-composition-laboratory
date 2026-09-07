import {
    GitHubAdapter
} from "../laboratory/github-adapter/GitHubAdapter.js";

import {
    ScientificSemanticDerivationEngine
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationEngine.js";

import {
    ScientificConceptAbstractionEngine
} from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.js";

import {
    ScientificCapabilityAttributionEngine
} from "../laboratory/scientific-capability-attribution/ScientificCapabilityAttributionEngine.js";

import {
    ScientificProtocolIdentityAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolIdentityAttributionEngine.js";

import {
    ScientificProtocolConceptAttributionEngine
} from "../laboratory/scientific-protocol-concept-attribution/ScientificProtocolConceptAttributionEngine.js";

import {
    ScientificDocumentationProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificDocumentationProtocolRelationEvidenceEngine.js";

import {
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";

import {
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";

import {
    ScientificCompositionEvaluationSpecificationEngine
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationEngine.js";

import {
    ScientificCompositionExperimentAdapter
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExperimentAdapter.js";


function requireNoErrors(
    stage: string,
    errors: string[]
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
            ...errors.map(
                error =>
                    `  - ${error}`
            )
        ].join("\n")
    );

}


async function buildScientificSource(
    owner: string,
    repo: string
) {

    console.log("");
    console.log(
        `LOADING REAL SOURCE ${owner}/${repo}`
    );
    console.log(
        "-".repeat(
            60
        )
    );


    const github =
        await new GitHubAdapter().run({

            owner,

            repo,

            forceFresh:
                false

        });


    requireNoErrors(
        `GitHubAdapter ${owner}/${repo}`,
        github.errors
    );


    const sourceId =
        github.sourceId;

    const sourceRevision =
        github.repository.commitSha;


    const semantic =
        new ScientificSemanticDerivationEngine()
            .derive({

                sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts

            });


    requireNoErrors(
        `Semantic derivation ${sourceId}`,
        semantic.errors
    );


    const concepts =
        new ScientificConceptAbstractionEngine()
            .abstract(
                semantic
            );


    requireNoErrors(
        `Concept abstraction ${sourceId}`,
        concepts.errors
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
        `Capability attribution ${sourceId}`,
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
        `Protocol identity ${sourceId}`,
        protocolIdentity.errors
    );


    const protocolConcepts =
        new ScientificProtocolConceptAttributionEngine()
            .attribute({

                concepts,

                protocols:
                    protocolIdentity

            });


    requireNoErrors(
        `Protocol concept attribution ${sourceId}`,
        protocolConcepts.errors
    );


    const relations =
        new ScientificDocumentationProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                observations:
                    github.sourceObservations

            });


    requireNoErrors(
        `Protocol relation evidence ${sourceId}`,
        relations.errors
    );


    const structuralRelations =
        new ScientificStructuralProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts,

                protocolAttributedCapabilities:
                    protocolIdentity.protocolAttributedCapabilities

            });


    requireNoErrors(
        `Structural protocol relation evidence ${sourceId}`,
        structuralRelations.errors
    );


    const protocolIds =
        [
            ...new Set(
                protocolIdentity
                    .protocolAttributedCapabilities
                    .map(
                        attribution =>
                            attribution.protocolId
                    )
            )
        ].sort();


    console.log(
        `sourceId:             ${sourceId}`
    );

    console.log(
        `revision:             ${sourceRevision ?? "UNVERSIONED"}`
    );

    console.log(
        `observations:         ${github.sourceObservations.length}`
    );

    console.log(
        `facts:                ${github.sourceFacts.length}`
    );

    console.log(
        `semantic capabilities:${semantic.model.capabilities.length}`
    );

    console.log(
        `concepts:             ${concepts.concepts.length}`
    );

    console.log(
        `protocol identities:  ${protocolIdentity.protocolAttributedCapabilities.length}`
    );

    console.log(
        `protocols:            ${protocolIds.join(", ") || "NONE"}`
    );

    console.log(
        `protocol concepts:    ${protocolConcepts.protocolConcepts.length}`
    );

    console.log(
        `relations:            ${relations.relations.length}`
    );

    console.log(
        `structural relations: ${structuralRelations.relations.length}`
    );


    console.log("");
    console.log(
        "PROTOCOL CONCEPTS"
    );


    for (
        const concept
        of protocolConcepts.protocolConcepts
    ) {

        console.log(
            `  ${concept.protocolId} -> ${concept.conceptId}`
        );

    }


    return {

        github,

        sourceId,

        sourceRevision,

        semantic,

        concepts,

        capabilityAttribution,

        protocolIdentity,

        protocolConcepts,

        relations,

        structuralRelations

    };

}


async function main(): Promise<void> {

    console.log("");
    console.log(
        "OECL REAL CROSS-PROTOCOL SCIENTIFIC DISCOVERY"
    );
    console.log(
        "============================================="
    );


    /*
     * ---------------------------------------------------------
     * SOURCE A: REAL ERC-8004
     * ---------------------------------------------------------
     */

    const sourceA =
        await buildScientificSource(
            "erc-8004",
            "erc-8004-contracts"
        );


    /*
     * ---------------------------------------------------------
     * SOURCE B: REAL ERC-8060
     * ---------------------------------------------------------
     */

    const sourceB =
        await buildScientificSource(
            "ten-io-meta",
            "erc8060-native-eth-value"
        );


    /*
     * ---------------------------------------------------------
     * OBSERVED SHARED RECURRENT CONCEPTS
     *
     * This is diagnostic output only.
     * It does not manufacture composition candidates.
     * ---------------------------------------------------------
     */

    const sourceAConceptIds =
        new Set(
            sourceA.protocolConcepts
                .protocolConcepts
                .map(
                    concept =>
                        concept.conceptId
                )
        );


    const sourceBConceptIds =
        new Set(
            sourceB.protocolConcepts
                .protocolConcepts
                .map(
                    concept =>
                        concept.conceptId
                )
        );


    const sharedConceptIds =
        [
            ...sourceAConceptIds
        ]
            .filter(
                conceptId =>
                    sourceBConceptIds.has(
                        conceptId
                    )
            )
            .sort();


    console.log("");
    console.log(
        "OBSERVED CROSS-PROTOCOL CONCEPT INTERSECTION"
    );
    console.log(
        "--------------------------------------------"
    );

    console.log(
        `shared concepts: ${sharedConceptIds.length}`
    );


    for (
        const conceptId
        of sharedConceptIds
    ) {

        console.log(
            `  ${conceptId}`
        );

    }


    /*
     * ---------------------------------------------------------
     * SCIENTIFIC CROSS-PROTOCOL DISCOVERY
     * ---------------------------------------------------------
     */

    const discovery =
        new CrossProtocolCompositionEngine()
            .discover({

                protocolConceptResults: [
                    sourceA.protocolConcepts,
                    sourceB.protocolConcepts
                ],

                protocolRelationEvidenceResults: [
                    sourceA.relations,
                    sourceB.relations
                ],

                structuralProtocolRelationEvidenceResults: [
                    sourceA.structuralRelations,
                    sourceB.structuralRelations
                ]

            });


    requireNoErrors(
        "Cross-protocol discovery",
        discovery.errors
    );


    console.log("");
    console.log(
        "SCIENTIFIC COMPOSITION CANDIDATES"
    );
    console.log(
        "---------------------------------"
    );

    console.log(
        `candidates: ${discovery.candidates.length}`
    );


    for (
        const candidate
        of discovery.candidates
    ) {

        console.log("");
        console.log(
            `CANDIDATE ${candidate.candidateId}`
        );

        console.log(
            `  mechanism: ${candidate.mechanism}`
        );

        console.log(
            `  A: ${candidate.participantA.kind}:${candidate.participantA.id}`
        );

        console.log(
            `  B: ${candidate.participantB.kind}:${candidate.participantB.id}`
        );

        console.log(
            `  concept: ${candidate.conceptId ?? "NONE"}`
        );

        console.log(
            `  provenance: ${candidate.provenance.length}`
        );

    }


    /*
     * ---------------------------------------------------------
     * SCIENTIFIC EVALUATION SPECIFICATIONS
     * ---------------------------------------------------------
     */

    const specifications =
        new ScientificCompositionEvaluationSpecificationEngine()
            .build({

                discovery,

                facts: [
                    ...sourceA.github.sourceFacts,
                    ...sourceB.github.sourceFacts
                ],

                protocolConceptResults: [
                    sourceA.protocolConcepts,
                    sourceB.protocolConcepts
                ],

                protocolRelationEvidenceResults: [
                    sourceA.relations,
                    sourceB.relations
                ],

                structuralProtocolRelationEvidenceResults: [
                    sourceA.structuralRelations,
                    sourceB.structuralRelations
                ]

            });


    requireNoErrors(
        "Composition evaluation specification",
        specifications.errors
    );


    console.log("");
    console.log(
        "SCIENTIFIC EVALUATION SPECIFICATIONS"
    );
    console.log(
        "------------------------------------"
    );

    console.log(
        `specifications: ${specifications.specifications.length}`
    );


    for (
        const specification
        of specifications.specifications
    ) {

        console.log("");
        console.log(
            `SPECIFICATION ${specification.specificationId}`
        );

        console.log(
            `  candidate: ${specification.candidateId}`
        );

        console.log(
            `  status: ${specification.status}`
        );

        console.log(
            `  constraints: ${specification.constraints.length}`
        );

        console.log(
            `  participant A constraints: ${specification.participantAConstraintIds.length}`
        );

        console.log(
            `  participant B constraints: ${specification.participantBConstraintIds.length}`
        );

        console.log(
            `  unresolved guards: ${specification.unresolvedGuardFactIds.length}`
        );

    }


    /*
     * ---------------------------------------------------------
     * SCIENTIFIC EXPERIMENT ADAPTER
     * ---------------------------------------------------------
     */

    const experiments =
        new ScientificCompositionExperimentAdapter()
            .build(
                specifications,
                [
                    {
                        sourceId:
                            sourceA.sourceId,

                        repository:
                            `${sourceA.github.repository.owner}/${sourceA.github.repository.repo}`
                    },
                    {
                        sourceId:
                            sourceB.sourceId,

                        repository:
                            `${sourceB.github.repository.owner}/${sourceB.github.repository.repo}`
                    }
                ]
            );


    requireNoErrors(
        "Composition experiment adapter",
        experiments.errors
    );


    console.log("");
    console.log(
        "SCIENTIFIC COMPOSITION EXPERIMENTS"
    );
    console.log(
        "----------------------------------"
    );

    console.log(
        `experiments: ${experiments.experiments.length}`
    );


    for (
        const experiment
        of experiments.experiments
    ) {

        console.log("");
        console.log(
            `EXPERIMENT ${experiment.experimentId}`
        );

        console.log(
            `  targetType: ${experiment.targetType}`
        );

        console.log(
            `  targetId: ${experiment.targetId}`
        );

        console.log(
            `  repositories: ${experiment.recommendedRepositories.join(", ")}`
        );

    }


    /*
     * ---------------------------------------------------------
     * FINAL SUMMARY
     * ---------------------------------------------------------
     */

    const ready =
        specifications.specifications.filter(
            specification =>
                specification.status ===
                "READY"
        ).length;


    const insufficient =
        specifications.specifications.filter(
            specification =>
                specification.status ===
                "INSUFFICIENT_EVIDENCE"
        ).length;


    console.log("");
    console.log(
        "REAL CROSS-PROTOCOL SUMMARY"
    );
    console.log(
        "---------------------------"
    );

    console.log(
        `source A:             ${sourceA.sourceId}`
    );

    console.log(
        `source A protocols:   ${
            [
                ...new Set(
                    sourceA.protocolIdentity
                        .protocolAttributedCapabilities
                        .map(
                            attribution =>
                                attribution.protocolId
                        )
                )
            ].join(", ")
        }`
    );

    console.log(
        `source A concepts:    ${sourceA.protocolConcepts.protocolConcepts.length}`
    );


    console.log(
        `source B:             ${sourceB.sourceId}`
    );

    console.log(
        `source B protocols:   ${
            [
                ...new Set(
                    sourceB.protocolIdentity
                        .protocolAttributedCapabilities
                        .map(
                            attribution =>
                                attribution.protocolId
                        )
                )
            ].join(", ")
        }`
    );

    console.log(
        `source B concepts:    ${sourceB.protocolConcepts.protocolConcepts.length}`
    );

    console.log(
        `shared concepts:      ${sharedConceptIds.length}`
    );

    console.log(
        `candidates:           ${discovery.candidates.length}`
    );

    console.log(
        `READY specs:          ${ready}`
    );

    console.log(
        `INSUFFICIENT specs:   ${insufficient}`
    );

    console.log(
        `experiments:          ${experiments.experiments.length}`
    );

    console.log("");

}


main().catch(
    error => {

        console.error("");
        console.error(
            "REAL CROSS-PROTOCOL FATAL ERROR:"
        );

        console.error(
            error
        );

        process.exitCode =
            1;

    }
);
