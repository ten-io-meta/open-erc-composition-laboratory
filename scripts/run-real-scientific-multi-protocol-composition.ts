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
    ScientificStructuralProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificStructuralProtocolRelationEvidenceEngine.js";

import {
    ScientificDocumentationProtocolRelationEvidenceEngine
} from "../laboratory/scientific-protocol-relation-evidence/ScientificDocumentationProtocolRelationEvidenceEngine.js";

import {
    ScientificProtocolExternalCallAttributionEngine
} from "../laboratory/scientific-protocol-identity/ScientificProtocolExternalCallAttributionEngine.js";

import {
    ScientificProtocolCompositionProfileEngine
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfileEngine.js";

import {
    ScientificCompositionParticipantExpansionEngine
} from "../laboratory/scientific-composition-participant-expansion/ScientificCompositionParticipantExpansionEngine.js";

import {
    ScientificDocumentaryCompositionCandidateEngine
} from "../laboratory/scientific-documentary-composition-candidate/ScientificDocumentaryCompositionCandidateEngine.js";

import {
    ScientificCompositionComplementarityEngine
} from "../laboratory/scientific-composition-complementarity/ScientificCompositionComplementarityEngine.js";

import {
    ScientificCompositionCompatibilityEngine
} from "../laboratory/scientific-composition-compatibility/ScientificCompositionCompatibilityEngine.js";

import {
    ScientificCompositionGraphEngine
} from "../laboratory/scientific-composition-graph/ScientificCompositionGraphEngine.js";

import type {
    ScientificProtocolCompositionProfile
} from "../laboratory/scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";


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


interface RealSourceSpec {

    owner:
        string;

    repo:
        string;

    expectedRevision:
        string;

    targetProtocolIds:
        string[];

}


async function buildRealScientificSource(
    spec:
        RealSourceSpec
) {

    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        `REAL SOURCE ${spec.owner}/${spec.repo}`
    );
    console.log(
        "============================================================"
    );


    const github =
        await new GitHubAdapter().run({

            owner:
                spec.owner,

            repo:
                spec.repo,

            forceFresh:
                false

        });


    requireNoErrors(
        `GitHubAdapter ${spec.owner}/${spec.repo}`,
        github.errors
    );


    const sourceId =
        github.sourceId;

    const sourceRevision =
        github.repository.commitSha;


    if (
        sourceRevision !==
        spec.expectedRevision
    ) {

        throw new Error(
            [
                `Pinned revision mismatch for ${spec.owner}/${spec.repo}.`,
                `expected: ${spec.expectedRevision}`,
                `observed: ${sourceRevision ?? "UNVERSIONED"}`
            ].join("\n")
        );

    }


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
        `Protocol concepts ${sourceId}`,
        protocolConcepts.errors
    );


    const structuralRelations =
        new ScientificStructuralProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts,

                protocolAttributedCapabilities:
                    protocolIdentity
                        .protocolAttributedCapabilities

            });


    requireNoErrors(
        `Structural relations ${sourceId}`,
        structuralRelations.errors
    );


    const documentationRelations =
        new ScientificDocumentationProtocolRelationEvidenceEngine()
            .extract({

                sourceId,

                sourceRevision,

                observations:
                    github.sourceObservations

            });


    requireNoErrors(
        `Documentation relations ${sourceId}`,
        documentationRelations.errors
    );


    const externalCalls =
        new ScientificProtocolExternalCallAttributionEngine()
            .attribute({

                sourceId,

                sourceRevision,

                facts:
                    github.sourceFacts,

                observations:
                    github.sourceObservations

            });


    requireNoErrors(
        `External call attribution ${sourceId}`,
        externalCalls.errors
    );


    const detectedProtocolIds =
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
        `sourceId:       ${sourceId}`
    );

    console.log(
        `revision:       ${sourceRevision}`
    );

    console.log(
        `observations:   ${github.sourceObservations.length}`
    );

    console.log(
        `facts:          ${github.sourceFacts.length}`
    );

    console.log(
        `protocol IDs:   ${
            detectedProtocolIds.join(", ") ||
            "NONE"
        }`
    );

    console.log(
        `external calls: ${
            externalCalls
                .protocolAttributedExternalCalls
                .length
        }`
    );

    console.log(
        `documentary relations: ${documentationRelations.relations.length}`
    );


    for (
        const relation
        of documentationRelations.relations
    ) {

        console.log(
            `  DOC RELATION ${
                relation.subjectProtocolId ??
                relation.subjectSymbol
            } ${relation.relation} ${relation.objectProtocolId}`
        );

    }


    return {

        spec,

        github,

        sourceId,

        sourceRevision,

        semantic,

        concepts,

        capabilityAttribution,

        protocolIdentity,

        protocolConcepts,

        structuralRelations,

        documentationRelations,

        externalCalls,

        detectedProtocolIds

    };

}


async function main(): Promise<void> {

    console.log("");
    console.log(
        "OECL REAL N-PROTOCOL COMPOSITION DISCOVERY"
    );
    console.log(
        "=========================================="
    );


    /*
     * Experiment participant selection only.
     *
     * No functional meaning is assigned to these IDs here.
     */
    const sourceSpecs:
        RealSourceSpec[] = [

            {
                owner:
                    "erc-8004",

                repo:
                    "erc-8004-contracts",

                expectedRevision:
                    "b9e466c250744a7e06b13dff9d3c2844ed64f825",

                targetProtocolIds: [
                    "ERC-8004"
                ]
            },

            {
                owner:
                    "ten-io-meta",

                repo:
                    "erc8060-native-eth-value",

                expectedRevision:
                    "c7eed906835ab39fbc8439eb0493e5a5371b23a2",

                targetProtocolIds: [
                    "ERC-8060"
                ]
            },

            {
                owner:
                    "trustless-ai",

                repo:
                    "agent-ercs",

                expectedRevision:
                    "01283ca57305f915afb560d23359a27fd748eb5a",

                targetProtocolIds: [
                    "ERC-8263",
                    "ERC-8274",
                    "ERC-8275",
                    "ERC-8301",
                    "ERC-8312"
                ]
            }

        ];


    const sources = [];


    for (
        const spec
        of sourceSpecs
    ) {

        sources.push(
            await buildRealScientificSource(
                spec
            )
        );

    }


    /*
     * ---------------------------------------------------------
     * BUILD CANDIDATE-INDEPENDENT PROTOCOL PROFILES
     * ---------------------------------------------------------
     */

    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL PROTOCOL COMPOSITION PROFILES"
    );
    console.log(
        "============================================================"
    );


    const profileEngine =
        new ScientificProtocolCompositionProfileEngine();


    const profiles:
        ScientificProtocolCompositionProfile[] = [];


    const missingProtocolIds:
        string[] = [];


    for (
        const source
        of sources
    ) {

        for (
            const protocolId
            of source.spec.targetProtocolIds
        ) {

            const attributedCapabilities =
                source.protocolIdentity
                    .protocolAttributedCapabilities
                    .filter(
                        attribution =>
                            attribution.protocolId ===
                            protocolId
                    );


            /*
             * Do not manufacture a profile merely because the
             * experiment requested an ERC number.
             *
             * The current scientific identity layer must first
             * establish that protocol from source evidence.
             */
            if (
                attributedCapabilities.length ===
                0
            ) {

                missingProtocolIds.push(
                    protocolId
                );

                console.log("");
                console.log(
                    `${protocolId}: MISSING_STRUCTURAL_IDENTITY`
                );

                continue;

            }


            const protocolConcepts =
                source.protocolConcepts
                    .protocolConcepts
                    .filter(
                        concept =>
                            concept.protocolId ===
                            protocolId
                    );


            const structuralRelations =
                source.structuralRelations
                    .relations
                    .filter(
                        relation =>
                            relation.subjectProtocolId ===
                            protocolId
                    );


            const attributedExternalCalls =
                source.externalCalls
                    .protocolAttributedExternalCalls
                    .filter(
                        attribution =>
                            attribution.protocolId ===
                            protocolId
                    );


            const result =
                profileEngine.build({

                    protocolId,

                    sourceId:
                        source.sourceId,

                    sourceRevision:
                        source.sourceRevision,

                    sourceFacts:
                        source.github.sourceFacts,

                    attributedCapabilities,

                    protocolConcepts,

                    structuralRelations,

                    attributedExternalCalls

                });


            requireNoErrors(
                `Protocol profile ${protocolId}`,
                result.errors
            );


            if (
                result.profile ===
                null
            ) {

                throw new Error(
                    `Protocol profile ${protocolId} unexpectedly returned null.`
                );

            }


            profiles.push(
                result.profile
            );


            console.log("");
            console.log(
                `${protocolId}: PROFILE`
            );

            console.log(
                `  source:        ${result.profile.sourceId}`
            );

            console.log(
                `  contributions:${result.profile.contributions.length}`
            );

            console.log(
                `  boundaries:   ${result.profile.boundaries.length}`
            );

            console.log(
                `  needs:        ${result.profile.needs.length}`
            );


            for (
                const contribution
                of result.profile.contributions
                    .slice(
                        0,
                        12
                    )
            ) {

                console.log(
                    `    CONTRIBUTION ${contribution.kind}: ${contribution.subject}`
                );

            }


            for (
                const need
                of result.profile.needs
                    .slice(
                        0,
                        12
                    )
            ) {

                console.log(
                    `    NEED: ${need.subject}`
                );

            }


            for (
                const boundary
                of result.profile.boundaries
                    .slice(
                        0,
                        8
                    )
            ) {

                console.log(
                    `    BOUNDARY: ${boundary.subject}`
                );

            }

        }

    }


    /*
     * ---------------------------------------------------------
     * N-PROTOCOL COMPLEMENTARITY DISCOVERY
     * ---------------------------------------------------------
     *
     * Objective intentionally contains no manually supplied
     * semantic subjects. This run asks what the source evidence
     * itself exposes before we impose a higher-level objective.
     */

    const objective = {

        objectiveId:
            "REAL-OPEN-N-PROTOCOL-DISCOVERY",

        description:
            "Evidence-backed open discovery across real protocol sources.",

        requiredSubjects:
            []

    };


    const documentaryRelations =
        sources
            .flatMap(
                source =>
                    source
                        .documentationRelations
                        .relations
            );


    const initialProfileCount =
        profiles.length;


    const availableProtocolSources =
        sources
            .flatMap(
                source =>
                    source.detectedProtocolIds
                        .map(
                            protocolId => ({

                                protocolId,

                                sourceId:
                                    source.sourceId,

                                ...(
                                    source.sourceRevision !==
                                        undefined
                                        ? {
                                            sourceRevision:
                                                source.sourceRevision
                                        }
                                        : {}
                                )

                            })
                        )
            );


    const participantExpansion =
        new ScientificCompositionParticipantExpansionEngine()
            .expand({

                initialParticipants:
                    profiles.map(
                        profile => ({

                            protocolId:
                                profile.protocolId,

                            sourceId:
                                profile.sourceId,

                            ...(
                                profile.sourceRevision !==
                                    undefined
                                    ? {
                                        sourceRevision:
                                            profile.sourceRevision
                                    }
                                    : {}
                            )

                        })
                    ),

                availableProtocolSources,

                relations:
                    documentaryRelations

            });


    requireNoErrors(
        "Real composition participant expansion",
        participantExpansion.errors
    );


    const automaticallyExpandedParticipants =
        participantExpansion.participants
            .filter(
                participant =>
                    !profiles.some(
                        profile =>
                            profile.protocolId ===
                            participant.protocolId
                    )
            );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL PARTICIPANT EXPANSION"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `initial participants:          ${initialProfileCount}`
    );

    console.log(
        `available source occurrences: ${availableProtocolSources.length}`
    );

    console.log(
        `expanded closure:              ${participantExpansion.participants.length}`
    );

    console.log(
        `documentary additions:         ${automaticallyExpandedParticipants.length}`
    );

    console.log(
        `unresolved protocols:          ${participantExpansion.unresolvedProtocolIds.length}`
    );

    console.log(
        `ambiguous protocols:           ${participantExpansion.ambiguousProtocolIds.length}`
    );

    console.log(
        `unresolved relation evidence:  ${participantExpansion.unresolvedRelationEvidenceIds.length}`
    );


    for (
        const participant
        of automaticallyExpandedParticipants
    ) {

        console.log(
            `  EXPANDED ${participant.protocolId} basis=${participant.expansionBasis} evidence=${participant.evidenceIds.length}`
        );

    }


    for (
        const protocolId
        of participantExpansion.unresolvedProtocolIds
    ) {

        console.log(
            `  UNRESOLVED ${protocolId}`
        );

    }


    for (
        const protocolId
        of participantExpansion.ambiguousProtocolIds
    ) {

        console.log(
            `  AMBIGUOUS ${protocolId}`
        );

    }


    /*
     * Build profiles for documentary additions only after the
     * expansion engine has selected an exact source occurrence.
     *
     * No protocol number is manufactured here. The source and
     * revision come directly from the expansion result.
     */
    for (
        const participant
        of automaticallyExpandedParticipants
    ) {

        const source =
            sources.find(
                candidate =>
                    candidate.sourceId ===
                        participant.sourceId &&
                    candidate.sourceRevision ===
                        participant.sourceRevision
            );


        if (
            !source
        ) {

            throw new Error(
                `Expanded participant ${participant.protocolId} source occurrence is unavailable.`
            );

        }


        const protocolId =
            participant.protocolId;


        const attributedCapabilities =
            source.protocolIdentity
                .protocolAttributedCapabilities
                .filter(
                    attribution =>
                        attribution.protocolId ===
                        protocolId
                );


        if (
            attributedCapabilities.length ===
            0
        ) {

            throw new Error(
                `Expanded participant ${protocolId} has no protocol-attributed capabilities in its selected source.`
            );

        }


        const protocolConcepts =
            source.protocolConcepts
                .protocolConcepts
                .filter(
                    concept =>
                        concept.protocolId ===
                        protocolId
                );


        const structuralRelations =
            source.structuralRelations
                .relations
                .filter(
                    relation =>
                        relation.subjectProtocolId ===
                        protocolId
                );


        const attributedExternalCalls =
            source.externalCalls
                .protocolAttributedExternalCalls
                .filter(
                    attribution =>
                        attribution.protocolId ===
                        protocolId
                );


        const result =
            profileEngine.build({

                protocolId,

                sourceId:
                    source.sourceId,

                sourceRevision:
                    source.sourceRevision,

                sourceFacts:
                    source.github.sourceFacts,

                attributedCapabilities,

                protocolConcepts,

                structuralRelations,

                attributedExternalCalls

            });


        requireNoErrors(
            `Expanded protocol profile ${protocolId}`,
            result.errors
        );


        if (
            result.profile ===
            null
        ) {

            throw new Error(
                `Expanded protocol profile ${protocolId} unexpectedly returned null.`
            );

        }


        profiles.push(
            result.profile
        );


        console.log(
            `  PROFILE ${protocolId} contributions=${result.profile.contributions.length} boundaries=${result.profile.boundaries.length} needs=${result.profile.needs.length}`
        );

    }


    profiles.sort(
        (a, b) =>
            a.protocolId.localeCompare(
                b.protocolId
            )
    );


    const documentaryCandidates =
        new ScientificDocumentaryCompositionCandidateEngine()
            .discover({

                profiles,

                relations:
                    documentaryRelations

            });


    requireNoErrors(
        "Real documentary composition candidates",
        documentaryCandidates.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL DOCUMENTARY COMPOSITION CANDIDATES"
    );
    console.log(
        "============================================================"
    );


    console.log(
        `relations:                    ${documentaryRelations.length}`
    );

    console.log(
        `candidates:                   ${documentaryCandidates.candidates.length}`
    );

    console.log(
        `unresolved object protocols:  ${documentaryCandidates.unresolvedObjectProtocolIds.length}`
    );

    console.log(
        `unresolved relation evidence: ${documentaryCandidates.unresolvedRelationEvidenceIds.length}`
    );


    for (
        const candidate
        of documentaryCandidates.candidates
    ) {

        console.log(
            `  CANDIDATE ${candidate.subjectParticipantId} ${candidate.relation} ${candidate.objectParticipantId} evidence=${candidate.evidenceIds.length} status=${candidate.evaluationStatus}`
        );

    }


    for (
        const protocolId
        of documentaryCandidates.unresolvedObjectProtocolIds
    ) {

        console.log(
            `  UNRESOLVED OBJECT ${protocolId}`
        );

    }


    const complementarity =
        new ScientificCompositionComplementarityEngine()
            .discover({

                objective,

                profiles

            });


    requireNoErrors(
        "Real N-protocol complementarity",
        complementarity.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL CROSS-PROTOCOL COMPLEMENTARITY"
    );
    console.log(
        "============================================================"
    );


    console.log(
        `profiles:          ${profiles.length}`
    );

    console.log(
        `missing identity:  ${missingProtocolIds.length}`
    );

    console.log(
        `matches:           ${complementarity.matches.length}`
    );

    console.log(
        `unresolved needs:  ${complementarity.unresolvedNeedIds.length}`
    );


    for (
        const protocolId
        of missingProtocolIds.sort()
    ) {

        console.log(
            `  MISSING ${protocolId}`
        );

    }


    for (
        const match
        of complementarity.matches
    ) {

        console.log("");
        console.log(
            `MATCH ${match.matchId}`
        );

        console.log(
            `  consumer: ${match.consumerParticipantId}`
        );

        console.log(
            `  provider: ${match.providerParticipantId}`
        );

        console.log(
            `  need:     ${match.needSubject}`
        );

        console.log(
            `  provides: ${match.contributionSubject}`
        );

        console.log(
            `  basis:    ${match.evidenceBasis}`
        );

    }


    /*
     * No physical multi-protocol observations exist yet.
     *
     * Therefore compatibility is evaluated with zero invented
     * observations and must remain fail-closed.
     */
    const compatibility =
        new ScientificCompositionCompatibilityEngine()
            .evaluate({

                profiles,

                matches:
                    complementarity.matches,

                observations:
                    []

            });


    requireNoErrors(
        "Real N-protocol compatibility",
        compatibility.errors
    );


    const graphResult =
        new ScientificCompositionGraphEngine()
            .build({

                objective,

                profiles,

                complementarity,

                compatibility

            });


    requireNoErrors(
        "Real N-protocol graph",
        graphResult.errors
    );


    if (
        graphResult.graph ===
        null
    ) {

        throw new Error(
            "Real N-protocol graph unexpectedly returned null."
        );

    }


    const graph =
        graphResult.graph;


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL N-PROTOCOL GRAPH"
    );
    console.log(
        "============================================================"
    );


    console.log(
        `graphId:             ${graph.graphId}`
    );

    console.log(
        `nodes:               ${graph.statistics.nodes}`
    );

    console.log(
        `edges:               ${graph.statistics.edges}`
    );

    console.log(
        `supported edges:     ${graph.statistics.supportedEdges}`
    );

    console.log(
        `challenged edges:    ${graph.statistics.challengedEdges}`
    );

    console.log(
        `inconclusive edges:  ${graph.statistics.inconclusiveEdges}`
    );

    console.log(
        `unresolved needs:    ${graph.statistics.unresolvedNeeds}`
    );

    console.log(
        `global polarity:     ${graph.scientificPolarity}`
    );


    console.log("");
    console.log(
        "GRAPH NODES"
    );


    for (
        const node
        of graph.nodes
    ) {

        console.log(
            `  ${node.participantId}` +
            ` contributions=${node.contributionIds.length}` +
            ` boundaries=${node.boundaryIds.length}` +
            ` needs=${node.needIds.length}`
        );

    }


    console.log("");
    console.log(
        "GRAPH EDGES"
    );


    if (
        graph.edges.length ===
        0
    ) {

        console.log(
            "  NONE"
        );

    }


    for (
        const edge
        of graph.edges
    ) {

        console.log(
            `  ${edge.consumerParticipantId}` +
            ` -> ${edge.providerParticipantId}` +
            ` : ${edge.compatibilityPolarity}`
        );

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "SCIENTIFIC INTERPRETATION"
    );
    console.log(
        "============================================================"
    );


    if (
        missingProtocolIds.length >
        0
    ) {

        console.log(
            "Some requested ERCs were not structurally identified by the current identity engine."
        );

    }


    if (
        complementarity.matches.length ===
        0
    ) {

        console.log(
            "No cross-protocol complementarity was established by the current exact-subject evidence rules."
        );

    }


    console.log(
        "No missing identity, unresolved need, or inconclusive edge is converted into compatibility."
    );

    console.log(
        "This run makes no global composition claim."
    );

}


main().catch(
    error => {

        console.error("");
        console.error(
            "REAL N-PROTOCOL DISCOVERY FATAL ERROR:"
        );

        console.error(
            error
        );

        process.exitCode =
            1;

    }
);
