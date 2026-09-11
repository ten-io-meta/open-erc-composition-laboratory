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
    CrossProtocolCompositionEngine
} from "../laboratory/scientific-cross-protocol-composition/CrossProtocolCompositionEngine.js";

import {
    ScientificCompositionEvaluationSpecificationEngine
} from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationEngine.js";

import {
    ScientificCompositionExperimentAdapter
} from "../laboratory/scientific-composition-experiment/ScientificCompositionExperimentAdapter.js";


async function main(): Promise<void> {

    const owner =
        process.argv[2] ??
        "ten-io-meta";

    const repo =
        process.argv[3] ??
        "erc8060-reservable";

    console.log("");
    console.log(
        "OECL REAL SCIENTIFIC COMPOSITION VERTICAL"
    );
    console.log(
        "========================================"
    );
    console.log("");


    /*
     * ---------------------------------------------------------
     * 1. REAL GITHUB SOURCE
     * ---------------------------------------------------------
     */

    const github =
        await new GitHubAdapter().run({

            owner,

            repo,

            forceFresh:
                false

        });


    if (
        github.errors.length >
        0
    ) {

        console.error(
            "GITHUB ADAPTER ERRORS:"
        );

        for (
            const error
            of github.errors
        ) {

            console.error(
                `  - ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    const sourceId =
        github.sourceId;

    const sourceRevision =
        github.repository.commitSha;


    console.log(
        "REAL SOURCE"
    );

    console.log(
        `sourceId:    ${sourceId}`
    );

    console.log(
        `repository:  ${github.repository.owner}/${github.repository.repo}`
    );

    console.log(
        `revision:    ${sourceRevision ?? "UNVERSIONED"}`
    );

    console.log(
        `localPath:   ${github.repository.localPath}`
    );

    console.log(
        `observations:${github.sourceObservations.length}`
    );

    console.log(
        `facts:       ${github.sourceFacts.length}`
    );

    console.log("");


    /*
     * ---------------------------------------------------------
     * 2. SCIENTIFIC SEMANTIC DERIVATION
     * ---------------------------------------------------------
     */

    const semantic =
        new ScientificSemanticDerivationEngine()
            .derive({

                sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts

            });


    console.log(
        "SCIENTIFIC SEMANTIC DERIVATION"
    );

    console.log(
        `capabilities: ${semantic.model.capabilities.length}`
    );

    console.log(
        `relationships:${semantic.model.relationships.length}`
    );

    console.log(
        `errors:       ${semantic.errors.length}`
    );

    console.log("");


    if (
        semantic.errors.length >
        0
    ) {

        for (
            const error
            of semantic.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 3. SCIENTIFIC CONCEPT ABSTRACTION
     * ---------------------------------------------------------
     */

    const concepts =
        new ScientificConceptAbstractionEngine()
            .abstract(
                semantic
            );


    console.log(
        "SCIENTIFIC CONCEPTS"
    );

    console.log(
        `concepts: ${concepts.concepts.length}`
    );

    for (
        const concept
        of concepts.concepts
    ) {

        console.log(
            `  ${concept.conceptId}`
        );

        console.log(
            `    label: ${concept.label}`
        );

        console.log(
            `    lexical capabilities: ${concept.lexicalCapabilityIds.join(", ")}`
        );

    }

    console.log("");


    if (
        concepts.errors.length >
        0
    ) {

        console.log(
            "CONCEPT ERRORS:"
        );

        for (
            const error
            of concepts.errors
        ) {

            console.log(
                `  - ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 4. STRUCTURAL CAPABILITY ATTRIBUTION
     * ---------------------------------------------------------
     */

    const capabilityAttribution =
        new ScientificCapabilityAttributionEngine()
            .attribute({

                derivation:
                    semantic,

                facts:
                    github.sourceFacts

            });


    console.log(
        "STRUCTURAL CAPABILITY ATTRIBUTION"
    );

    console.log(
        `attributed:   ${capabilityAttribution.attributedCapabilities.length}`
    );

    console.log(
        `unattributed: ${capabilityAttribution.unattributedCapabilityIds.length}`
    );

    console.log(
        `errors:       ${capabilityAttribution.errors.length}`
    );

    console.log("");


    if (
        capabilityAttribution.errors.length >
        0
    ) {

        for (
            const error
            of capabilityAttribution.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 5. EXACT PROTOCOL IDENTITY ATTRIBUTION
     * ---------------------------------------------------------
     */

    const protocolIdentity =
        new ScientificProtocolIdentityAttributionEngine()
            .attribute({

                attribution:
                    capabilityAttribution,

                observations:
                    github.sourceObservations

            });


    console.log(
        "PROTOCOL IDENTITIES"
    );

    console.log(
        `attributed: ${protocolIdentity.protocolAttributedCapabilities.length}`
    );

    for (
        const attribution
        of protocolIdentity.protocolAttributedCapabilities
    ) {

        console.log(
            `  ${attribution.protocolId}`
        );

        console.log(
            `    container: ${attribution.containerSymbol}`
        );

        console.log(
            `    capability: ${attribution.capabilityId}`
        );

    }

    console.log(
        `unresolved: ${protocolIdentity.unresolvedAttributionIds.length}`
    );

    console.log(
        `errors:     ${protocolIdentity.errors.length}`
    );

    console.log("");


    if (
        protocolIdentity.errors.length >
        0
    ) {

        for (
            const error
            of protocolIdentity.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 6. PROTOCOL-LOCAL CONCEPT ATTRIBUTION
     * ---------------------------------------------------------
     */

    const protocolConcepts =
        new ScientificProtocolConceptAttributionEngine()
            .attribute({

                concepts,

                protocols:
                    protocolIdentity

            });


    console.log(
        "PROTOCOL CONCEPTS"
    );

    console.log(
        `attributed:   ${protocolConcepts.protocolConcepts.length}`
    );

    console.log(
        `unattributed: ${protocolConcepts.unattributedConceptIds.length}`
    );

    for (
        const concept
        of protocolConcepts.protocolConcepts
    ) {

        console.log(
            `  ${concept.protocolId} -> ${concept.conceptId}`
        );

        console.log(
            `    lexical capabilities: ${concept.lexicalCapabilityIds.join(", ")}`
        );

    }

    console.log(
        `errors:       ${protocolConcepts.errors.length}`
    );

    console.log("");


    if (
        protocolConcepts.errors.length >
        0
    ) {

        for (
            const error
            of protocolConcepts.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 7. DOCUMENTARY PROTOCOL RELATION EVIDENCE
     * ---------------------------------------------------------
     */

    const relations =
        new ScientificDocumentationProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                observations:
                    github.sourceObservations

            });


    console.log(
        "DOCUMENTARY PROTOCOL RELATIONS"
    );

    console.log(
        `relations: ${relations.relations.length}`
    );

    for (
        const relation
        of relations.relations
    ) {

        console.log(
            `  ${relation.subjectSymbol} --${relation.relation}--> ${relation.objectProtocolId}`
        );

        console.log(
            `    observation: ${relation.observationId}`
        );

        console.log(
            `    evidence: ${relation.rawText}`
        );

    }

    console.log(
        `unresolved observations: ${relations.unresolvedObservationIds.length}`
    );

    console.log(
        `errors: ${relations.errors.length}`
    );

    console.log("");


    if (
        relations.errors.length >
        0
    ) {

        for (
            const error
            of relations.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 8. CROSS-PROTOCOL SCIENTIFIC DISCOVERY
     *
     * Even with one repository this can legitimately discover
     * an EXPLICIT_EXTENSION_FOR relation. Shared recurrent
     * concepts need distinct protocol identities.
     * ---------------------------------------------------------
     */

    const discovery =
        new CrossProtocolCompositionEngine()
            .discover({

                protocolConceptResults: [
                    protocolConcepts
                ],

                protocolRelationEvidenceResults: [
                    relations
                ]

            });


    console.log(
        "SCIENTIFIC COMPOSITION CANDIDATES"
    );

    console.log(
        `candidates: ${discovery.candidates.length}`
    );

    console.log(
        `errors:     ${discovery.errors.length}`
    );

    console.log("");


    for (
        const candidate
        of discovery.candidates
    ) {

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
            `  status: ${candidate.evaluationStatus}`
        );

        console.log(
            `  provenance: ${candidate.provenance.length}`
        );

        console.log("");

    }


    if (
        discovery.errors.length >
        0
    ) {

        for (
            const error
            of discovery.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 9. REAL EVALUATION SPECIFICATION
     * ---------------------------------------------------------
     */

    const specifications =
        new ScientificCompositionEvaluationSpecificationEngine()
            .build({

                discovery,

                facts:
                    github.sourceFacts,

                protocolConceptResults: [
                    protocolConcepts
                ],

                protocolRelationEvidenceResults: [
                    relations
                ]

            });


    console.log(
        "REAL EVALUATION SPECIFICATIONS"
    );

    console.log(
        `specifications: ${specifications.specifications.length}`
    );

    console.log(
        `errors:         ${specifications.errors.length}`
    );

    console.log("");


    for (
        const specification
        of specifications.specifications
    ) {

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

        for (
            const constraint
            of specification.constraints
        ) {

            console.log(
                `    [${constraint.participantSide}] ${constraint.containerSymbol}`
            );

            console.log(
                `      ${constraint.rawText}`
            );

        }

        console.log("");

    }


    if (
        specifications.errors.length >
        0
    ) {

        for (
            const error
            of specifications.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * 10. COMPOSITION EXPERIMENT ADAPTER
     * ---------------------------------------------------------
     */

    const experiments =
        new ScientificCompositionExperimentAdapter()
            .build(
                specifications,
                [
                    {
                        sourceId,

                        repository:
                            `${github.repository.owner}/${github.repository.repo}`
                    }
                ]
            );


    console.log(
        "SCIENTIFIC COMPOSITION EXPERIMENTS"
    );

    console.log(
        `experiments: ${experiments.experiments.length}`
    );

    console.log(
        `errors:      ${experiments.errors.length}`
    );

    console.log("");


    for (
        const experiment
        of experiments.experiments
    ) {

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

        console.log(
            `  support: ${experiment.supportCondition}`
        );

        console.log(
            `  challenge: ${experiment.challengeCondition}`
        );

        console.log("");

    }


    if (
        experiments.errors.length >
        0
    ) {

        for (
            const error
            of experiments.errors
        ) {

            console.log(
                `  ERROR: ${error}`
            );

        }

        process.exitCode =
            1;

        return;

    }


    /*
     * ---------------------------------------------------------
     * FINAL REAL VERTICAL SUMMARY
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


    console.log(
        "REAL VERTICAL SUMMARY"
    );

    console.log(
        "---------------------"
    );

    console.log(
        `source:              ${sourceId}`
    );

    console.log(
        `revision:            ${sourceRevision ?? "UNVERSIONED"}`
    );

    console.log(
        `observations:        ${github.sourceObservations.length}`
    );

    console.log(
        `facts:               ${github.sourceFacts.length}`
    );

    console.log(
        `semantic capabilities:${semantic.model.capabilities.length}`
    );

    console.log(
        `concepts:            ${concepts.concepts.length}`
    );

    console.log(
        `protocol identities: ${protocolIdentity.protocolAttributedCapabilities.length}`
    );

    console.log(
        `protocol concepts:   ${protocolConcepts.protocolConcepts.length}`
    );

    console.log(
        `document relations:  ${relations.relations.length}`
    );

    console.log(
        `candidates:          ${discovery.candidates.length}`
    );

    console.log(
        `READY specs:         ${ready}`
    );

    console.log(
        `INSUFFICIENT specs:  ${insufficient}`
    );

    console.log(
        `experiments:         ${experiments.experiments.length}`
    );

    console.log("");

}


main().catch(
    error => {

        console.error(
            "REAL VERTICAL FATAL ERROR:"
        );

        console.error(
            error
        );

        process.exitCode =
            1;

    }
);
