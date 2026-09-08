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
    ScientificCompositionCandidateCompatibilityEngine
} from "../laboratory/scientific-composition-candidate-compatibility/ScientificCompositionCandidateCompatibilityEngine.js";

import {
    ScientificCompositionCandidateEvidenceSpecificationEngine
} from "../laboratory/scientific-composition-candidate-evidence-specification/ScientificCompositionCandidateEvidenceSpecificationEngine.js";

import {
    ScientificCompositionCandidateEvidenceRequirementEngine
} from "../laboratory/scientific-composition-candidate-evidence-requirement/ScientificCompositionCandidateEvidenceRequirementEngine.js";

import {
    ScientificCompositionCandidateEvidenceGapEngine
} from "../laboratory/scientific-composition-candidate-evidence-gap/ScientificCompositionCandidateEvidenceGapEngine.js";

import {
    ScientificNProtocolGlobalEvidenceBindingEngine
} from "../laboratory/scientific-n-protocol-global-evidence-binding/ScientificNProtocolGlobalEvidenceBindingEngine.js";

import {
    ScientificNProtocolGlobalEvaluationBridgeEngine
} from "../laboratory/scientific-n-protocol-global-evaluation-bridge/ScientificNProtocolGlobalEvaluationBridgeEngine.js";

import {
    ScientificNProtocolCompositionSolverEngine
} from "../laboratory/scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolverEngine.js";

import {
    ScientificDecisionTraceEngine
} from "../laboratory/scientific-decision-trace/ScientificDecisionTraceEngine.js";

import {
    ScientificDecisionTraceLineageBindingEngine
} from "../laboratory/scientific-decision-trace/ScientificDecisionTraceLineageBindingEngine.js";

import {
    ScientificEvidenceLineageEngine
} from "../laboratory/scientific-evidence-lineage/ScientificEvidenceLineageEngine.js";

import type {
    ScientificEvidenceLineageDerivedLink
} from "../laboratory/scientific-evidence-lineage/ScientificEvidenceLineage.js";

import {
    ScientificCompositionVisualizationEngine
} from "../laboratory/scientific-composition-visualization/ScientificCompositionVisualizationEngine.js";

import {
    ScientificCompositionHarmonyAssessmentEngine
} from "../laboratory/scientific-composition-harmony/ScientificCompositionHarmonyAssessmentEngine.js";

import {
    ScientificCompositionEnvelopeEngine
} from "../laboratory/scientific-composition-envelope/ScientificCompositionEnvelopeEngine.js";

import {
    ScientificCompositionCandidateEvaluationGraphEngine
} from "../laboratory/scientific-composition-candidate-evaluation-graph/ScientificCompositionCandidateEvaluationGraphEngine.js";

import {
    ScientificNProtocolCompositionSetEngine
} from "../laboratory/scientific-n-protocol-composition-set/ScientificNProtocolCompositionSetEngine.js";

import {
    ScientificCompositionCandidateGraphEngine
} from "../laboratory/scientific-composition-candidate-graph/ScientificCompositionCandidateGraphEngine.js";

import {
    ScientificCompositionCandidateSetEngine
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetEngine.js";

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


    const compositionCandidateSet =
        new ScientificCompositionCandidateSetEngine()
            .build({

                participantIds:
                    profiles
                        .map(
                            profile =>
                                profile.protocolId
                        ),

                functionalMatches:
                    complementarity.matches,

                documentaryCandidates:
                    documentaryCandidates.candidates

            });


    requireNoErrors(
        "Real scientific composition candidate set",
        compositionCandidateSet.errors
    );


    const candidateCompatibility =
        new ScientificCompositionCandidateCompatibilityEngine()
            .evaluate({

                profiles:
                    profiles.map(
                        profile => ({

                            protocolId:
                                profile.protocolId,

                            boundaries:
                                profile.boundaries.map(
                                    boundary => ({

                                        boundaryId:
                                            boundary.boundaryId,

                                        participantId:
                                            boundary.participantId

                                    })
                                )

                        })
                    ),

                candidateSet:
                    compositionCandidateSet,

                /*
                 * Real candidate discovered from source evidence,
                 * but no candidate-specific boundary observations
                 * have been executed yet.
                 *
                 * Absence of observations must therefore remain
                 * INCONCLUSIVE.
                 */
                observations:
                    []

            });


    requireNoErrors(
        "Real scientific candidate compatibility",
        candidateCompatibility.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC CANDIDATE BOUNDARY COMPATIBILITY"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `assessments: ${candidateCompatibility.assessments.length}`
    );


    for (
        const assessment
        of candidateCompatibility.assessments
    ) {

        console.log(
            `  CANDIDATE ${assessment.sourceParticipantId} -> ${assessment.targetParticipantId}`
        );

        console.log(
            `    kind:        ${assessment.candidateKind}`
        );

        console.log(
            `    boundaries:  ${assessment.statistics.total}`
        );

        console.log(
            `    preserved:   ${assessment.statistics.preserved}`
        );

        console.log(
            `    violated:    ${assessment.statistics.violated}`
        );

        console.log(
            `    unevaluated: ${assessment.statistics.unevaluated}`
        );

        console.log(
            `    polarity:    ${assessment.scientificPolarity}`
        );

        console.log(
            `    basis:       ${assessment.assessmentBasis}`
        );

    }


    const compositionCandidateGraph =
        new ScientificCompositionCandidateGraphEngine()
            .build({

                objective,

                profiles:
                    profiles.map(
                        profile => ({

                            protocolId:
                                profile.protocolId,

                            profileId:
                                profile.profileId,

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

                candidateSet:
                    compositionCandidateSet

            });


    requireNoErrors(
        "Real scientific composition candidate graph",
        compositionCandidateGraph.errors
    );


    if (
        compositionCandidateGraph.graph ===
        null
    ) {

        throw new Error(
            "Real scientific composition candidate graph unexpectedly returned null."
        );

    }


    const nProtocolCompositionSets =
        new ScientificNProtocolCompositionSetEngine()
            .build({

                candidateGraph:
                    compositionCandidateGraph

            });


    requireNoErrors(
        "Real scientific N-protocol composition sets",
        nProtocolCompositionSets.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL COMPOSITION SETS"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `candidate graph participants: ${nProtocolCompositionSets.statistics.candidateGraphParticipants}`
    );

    console.log(
        `candidate graph relations:    ${nProtocolCompositionSets.statistics.candidateGraphRelations}`
    );

    console.log(
        `composition sets:             ${nProtocolCompositionSets.statistics.compositionSets}`
    );

    console.log(
        `participants in sets:         ${nProtocolCompositionSets.statistics.participantsInCompositionSets}`
    );

    console.log(
        `isolated participants:        ${nProtocolCompositionSets.statistics.isolatedParticipants}`
    );

    console.log(
        `largest composition set:      ${nProtocolCompositionSets.statistics.largestCompositionSet}`
    );


    for (
        const set
        of nProtocolCompositionSets.sets
    ) {

        console.log(
            `  SET participants=${set.participantIds.length} relations=${set.relations.length} status=${set.status}`
        );

        console.log(
            `    participants: ${set.participantIds.join(", ")}`
        );


        for (
            const relation
            of set.relations
        ) {

            console.log(
                `    RELATION ${relation.sourceParticipantId} -> ${relation.targetParticipantId} kind=${relation.kind} evidence=${relation.evidenceIds.length}`
            );

        }

    }


    if (
        nProtocolCompositionSets.isolatedParticipantIds.length >
        0
    ) {

        console.log(
            `  ISOLATED: ${nProtocolCompositionSets.isolatedParticipantIds.join(", ")}`
        );

    }


    const candidateEvaluationGraph =
        new ScientificCompositionCandidateEvaluationGraphEngine()
            .build({

                candidateGraph:
                    compositionCandidateGraph,

                compatibility:
                    candidateCompatibility

            });


    requireNoErrors(
        "Real scientific candidate evaluation graph",
        candidateEvaluationGraph.errors
    );


    if (
        candidateEvaluationGraph.graph ===
        null
    ) {

        throw new Error(
            "Real scientific candidate evaluation graph unexpectedly returned null."
        );

    }


    const compositionEnvelopes =
        new ScientificCompositionEnvelopeEngine()
            .build({

                compositionSets:
                    nProtocolCompositionSets,

                profiles,

                candidateCompatibility,

                candidateEvaluationGraph,

                complementarity

            });


    requireNoErrors(
        "Real scientific composition envelopes",
        compositionEnvelopes.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL COMPOSITION ENVELOPES"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `envelopes:             ${compositionEnvelopes.envelopes.length}`
    );

    console.log(
        `isolated participants: ${compositionEnvelopes.isolatedParticipantIds.length}`
    );


    for (
        const envelope
        of compositionEnvelopes.envelopes
    ) {

        console.log(
            `  ENVELOPE participants=${envelope.statistics.participants} relations=${envelope.statistics.relations} status=${envelope.assemblyStatus}`
        );

        console.log(
            `    participants:             ${envelope.participantIds.join(", ")}`
        );

        console.log(
            `    contributions:            ${envelope.statistics.contributions}`
        );

        console.log(
            `    known boundaries:         ${envelope.statistics.knownBoundaries}`
        );

        console.log(
            `    needs:                    ${envelope.statistics.needs}`
        );

        console.log(
            `    unresolved needs:         ${envelope.statistics.unresolvedNeeds}`
        );

        console.log(
            `    preserved boundary regions:   ${envelope.statistics.preservedBoundaryRegions}`
        );

        console.log(
            `    violated boundary regions:    ${envelope.statistics.violatedBoundaryRegions}`
        );

        console.log(
            `    unevaluated boundary regions: ${envelope.statistics.unevaluatedBoundaryRegions}`
        );

        console.log(
            `    supported relations:      ${envelope.statistics.supportedRelations}`
        );

        console.log(
            `    challenged relations:     ${envelope.statistics.challengedRelations}`
        );

        console.log(
            `    inconclusive relations:   ${envelope.statistics.inconclusiveRelations}`
        );

        console.log(
            `    relations without known boundaries: ${envelope.statistics.relationsWithoutKnownBoundaries}`
        );


        for (
            const relation
            of envelope.relations
        ) {

            console.log(
                `    RELATION ${relation.sourceParticipantId} -> ${relation.targetParticipantId} kind=${relation.candidateKind} compatibility=${relation.compatibilityPolarity} boundaryCoverage=${relation.boundaryCoverage}`
            );

        }

    }


    if (
        compositionEnvelopes.isolatedParticipantIds.length >
        0
    ) {

        console.log(
            `  ISOLATED: ${compositionEnvelopes.isolatedParticipantIds.join(", ")}`
        );

    }

    const nProtocolCompositionSolutions =
        new ScientificNProtocolCompositionSolverEngine()
            .solve({

                objective,

                envelopes:
                    compositionEnvelopes,

                candidateEvaluationGraph,

                complementarity

            });


    requireNoErrors(
        "Real scientific N-protocol composition solver",
        nProtocolCompositionSolutions.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL COMPOSITION SOLVER"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `solutions: ${nProtocolCompositionSolutions.solutions.length}`
    );


    for (
        const solution
        of nProtocolCompositionSolutions.solutions
    ) {

        console.log(
            `  SOLUTION ${solution.resolutionStatus}`
        );

        console.log(
            `    participants: ${solution.participantIds.join(", ")}`
        );

        console.log(
            `    supported functional candidates: ${solution.supportedFunctionalCandidateIds.length}`
        );

        console.log(
            `    documentary candidates:          ${solution.documentaryCandidateIds.length}`
        );

        console.log(
            `    challenged candidates:           ${solution.challengedCandidateIds.length}`
        );

        console.log(
            `    inconclusive candidates:         ${solution.inconclusiveCandidateIds.length}`
        );

        console.log(
            `    full configurations:             ${solution.fullConfigurations.length}`
        );

        console.log(
            `    subset configurations:           ${solution.subsetConfigurations.length}`
        );

        console.log(
            `    ready configurations:            ${solution.statistics.readyConfigurations}`
        );

        console.log(
            `    blocked configurations:          ${solution.statistics.blockedConfigurations}`
        );


        for (
            const configuration
            of [
                ...solution.fullConfigurations,
                ...solution.subsetConfigurations
            ]
        ) {

            console.log(
                `    CONFIGURATION ${configuration.kind} readiness=${configuration.readiness}`
            );

            console.log(
                `      participants: ${configuration.participantIds.join(", ")}`
            );

            console.log(
                `      functional candidates: ${configuration.selectedFunctionalCandidateIds.length}`
            );

            console.log(
                `      unresolved needs: ${configuration.unresolvedNeedIds.length}`
            );

            console.log(
                `      unresolved objective subjects: ${configuration.unresolvedObjectiveSubjects.length}`
            );

            console.log(
                `      global evaluation: ${configuration.globalEvaluationStatus}`
            );

        }

    }

    const globalEvaluationTargets =
        new ScientificNProtocolGlobalEvaluationBridgeEngine()
            .build({

                solver:
                    nProtocolCompositionSolutions,

                envelopes:
                    compositionEnvelopes

            });


    requireNoErrors(
        "Real scientific N-protocol global evaluation bridge",
        globalEvaluationTargets.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL GLOBAL EVALUATION BRIDGE"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `targets:                ${globalEvaluationTargets.targets.length}`
    );

    console.log(
        `blocked configurations: ${globalEvaluationTargets.blockedConfigurationIds.length}`
    );


    for (
        const target
        of globalEvaluationTargets.targets
    ) {

        console.log(
            `  TARGET ${target.status}`
        );

        console.log(
            `    configuration: ${target.configurationId}`
        );

        console.log(
            `    participants:  ${target.graph.nodes.map(node => node.participantId).join(", ")}`
        );

        console.log(
            `    edges:         ${target.graph.edges.length}`
        );

        console.log(
            `    unresolved needs: ${target.graph.unresolvedNeedIds.length}`
        );

        console.log(
            `    unresolved objective subjects: ${target.graph.statistics.unresolvedObjectiveSubjects}`
        );

        console.log(
            `    graph polarity: ${target.graph.scientificPolarity}`
        );

    }


    for (
        const configurationId
        of globalEvaluationTargets.blockedConfigurationIds
    ) {

        console.log(
            `  BLOCKED ${configurationId}`
        );

    }

    /*
     * This discovery run manufactures no global observations.
     *
     * Real observations must originate independently and preserve
     * exact graphId + runId + boundaryId provenance.
     */
    const globalEvidenceBindings =
        new ScientificNProtocolGlobalEvidenceBindingEngine()
            .bindAndEvaluate({

                targets:
                    globalEvaluationTargets,

                observations:
                    []

            });


    requireNoErrors(
        "Real scientific N-protocol global evidence binding",
        globalEvidenceBindings.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL GLOBAL EVIDENCE BINDING"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `bindings: ${globalEvidenceBindings.bindings.length}`
    );


    for (
        const binding
        of globalEvidenceBindings.bindings
    ) {

        console.log(
            `  BINDING ${binding.status}`
        );

        console.log(
            `    configuration: ${binding.configurationId}`
        );

        console.log(
            `    graph:         ${binding.graphId}`
        );

        console.log(
            `    observations:  ${binding.observationIds.length}`
        );

        console.log(
            `    runs:          ${binding.runIds.length}`
        );

        console.log(
            `    global polarity: ${binding.evaluation.assessment?.scientificPolarity ?? "NONE"}`
        );

        if (
            binding.evaluation.assessment?.supportingRunId !==
            undefined
        ) {

            console.log(
                `    supporting run: ${binding.evaluation.assessment.supportingRunId}`
            );

        }

    }

    const compositionHarmony =
        new ScientificCompositionHarmonyAssessmentEngine()
            .assess({

                envelopes:
                    compositionEnvelopes,

                solver:
                    nProtocolCompositionSolutions,

                globalEvidenceBindings

            });

    requireNoErrors(
        "Real scientific composition harmony",
        compositionHarmony.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC N-PROTOCOL COMPOSITION HARMONY"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `assessments: ${compositionHarmony.assessments.length}`
    );


    for (
        const assessment
        of compositionHarmony.assessments
    ) {

        console.log(
            `  HARMONY ${assessment.harmonyStatus}`
        );

        console.log(
            `    participants: ${assessment.participantIds.join(", ")}`
        );

        console.log(
            `    full configuration evidence: ${assessment.fullConfigurationEvidence.length}`
        );

        console.log(
            `    supported subsets:           ${assessment.supportedSubsets.length}`
        );

        console.log(
            `    supported candidates:        ${assessment.supportedCandidateIds.length}`
        );

        console.log(
            `    challenged candidates:       ${assessment.challengedCandidateIds.length}`
        );

        console.log(
            `    inconclusive candidates:     ${assessment.inconclusiveCandidateIds.length}`
        );

        console.log(
            `    preserved boundary regions:  ${assessment.preservedBoundaryRegionIds.length}`
        );

        console.log(
            `    violated boundary regions:   ${assessment.violatedBoundaryRegionIds.length}`
        );

        console.log(
            `    unevaluated boundary regions:${assessment.unevaluatedBoundaryRegionIds.length}`
        );

        console.log(
            `    evidence basis: ${assessment.evidenceBasis}`
        );

    }

    const candidateEvidenceGaps =
        new ScientificCompositionCandidateEvidenceGapEngine()
            .diagnose({

                evaluationGraph:
                    candidateEvaluationGraph,

                compatibility:
                    candidateCompatibility

            });


    requireNoErrors(
        "Real scientific candidate evidence gap diagnosis",
        candidateEvidenceGaps.errors
    );


    const compositionVisualization =
        new ScientificCompositionVisualizationEngine()
            .project({

                envelopes:
                    compositionEnvelopes,

                candidateEvaluationGraph:
                    candidateEvaluationGraph,

                evidenceGaps:
                    candidateEvidenceGaps,

                solver:
                    nProtocolCompositionSolutions,

                globalEvidenceBindings,

                harmony:
                    compositionHarmony

            });


    requireNoErrors(
        "Real scientific composition visualization",
        compositionVisualization.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION VISUALIZATION MODEL"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `visualizations:        ${compositionVisualization.visualizations.length}`
    );

    console.log(
        `isolated participants: ${compositionVisualization.isolatedParticipantIds.length}`
    );


    for (
        const visualization
        of compositionVisualization.visualizations
    ) {

        console.log(
            `  VISUALIZATION ${visualization.projectionStatus}`
        );

        console.log(
            `    harmony:        ${visualization.harmonyStatus}`
        );

        console.log(
            `    participants:   ${visualization.nodes.map(node => node.participantId).join(", ")}`
        );

        console.log(
            `    nodes:          ${visualization.nodes.length}`
        );

        console.log(
            `    relations:      ${visualization.relations.length}`
        );

        console.log(
            `    configurations: ${visualization.configurations.length}`
        );

        console.log(
            `    unresolved needs: ${visualization.unresolvedNeedIds.length}`
        );

        console.log(
            `    model basis: ${visualization.modelBasis}`
        );


        for (
            const relation
            of visualization.relations
        ) {

            console.log(
                `    RELATION ${relation.sourceParticipantId} -> ${relation.targetParticipantId}`
            );

            console.log(
                `      kind:          ${relation.kind}`
            );

            console.log(
                `      compatibility: ${relation.compatibilityPolarity}`
            );

            console.log(
                `      gaps:          ${relation.gapIds.length}`
            );

            console.log(
                `      resolution:    ${relation.evidenceResolution}`
            );

        }


        for (
            const configuration
            of visualization.configurations
        ) {

            console.log(
                `    CONFIGURATION ${configuration.configurationId}`
            );

            console.log(
                `      kind:       ${configuration.kind}`
            );

            console.log(
                `      readiness:  ${configuration.readiness}`
            );

            console.log(
                `      global:     ${configuration.globalStatus}`
            );

        }

    }


    if (
        compositionVisualization.isolatedParticipantIds.length >
        0
    ) {

        console.log(
            `  ISOLATED: ${compositionVisualization.isolatedParticipantIds.join(", ")}`
        );

    }

    const scientificDecisionTrace =
        new ScientificDecisionTraceEngine()
            .trace({

                observations:
                    sources.flatMap(
                        source =>
                            source.github.sourceObservations
                    ),

                facts:
                    sources.flatMap(
                        source =>
                            source.github.sourceFacts
                    ),

                protocolRelationEvidence:
                    documentaryRelations,

                profiles,

                candidateEvaluationGraph,

                evidenceGaps:
                    candidateEvidenceGaps,

                solver:
                    nProtocolCompositionSolutions,

                globalEvidenceBindings,

                harmony:
                    compositionHarmony

            });


    requireNoErrors(
        "Real scientific decision trace",
        scientificDecisionTrace.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC DECISION TRACE"
    );
    console.log(
        "============================================================"
    );


    const githubTraceEvidence =
        scientificDecisionTrace.evidenceCatalog
            .filter(
                evidence =>
                    evidence.sourceType
                        .toUpperCase()
                        .includes(
                            "GITHUB"
                        )
            );


    console.log(
        `source evidence catalog: ${scientificDecisionTrace.evidenceCatalog.length}`
    );

    console.log(
        `GitHub provenance:       ${githubTraceEvidence.length}`
    );

    console.log(
        `participant artifacts:   ${scientificDecisionTrace.participantArtifacts.length}`
    );

    console.log(
        `candidate traces:        ${scientificDecisionTrace.candidateTraces.length}`
    );

    console.log(
        `composition traces:      ${scientificDecisionTrace.compositionTraces.length}`
    );

    console.log(
        `unresolved evidence:     ${scientificDecisionTrace.unresolvedEvidenceIds.length}`
    );


    for (
        const candidateTrace
        of scientificDecisionTrace.candidateTraces
    ) {

        console.log("");
        console.log(
            `  CANDIDATE ${candidateTrace.sourceParticipantId} -> ${candidateTrace.targetParticipantId}`
        );

        console.log(
            `    kind:          ${candidateTrace.candidateKind}`
        );

        console.log(
            `    compatibility: ${candidateTrace.compatibilityPolarity}`
        );

        console.log(
            `    known boundaries: ${candidateTrace.knownBoundaryIds.length}`
        );

        console.log(
            `    observed boundaries: ${candidateTrace.observedBoundaryIds.length}`
        );

        console.log(
            `    gaps: ${candidateTrace.gapIds.length}`
        );

        console.log(
            `    resolved evidence: ${candidateTrace.resolvedEvidenceIds.length}`
        );

        console.log(
            `    unresolved evidence: ${candidateTrace.unresolvedEvidenceIds.length}`
        );

        console.log(
            `    why: ${candidateTrace.reasonCodes.join(", ")}`
        );


        const discoveryEvidence =
            candidateTrace.discoveryEvidenceIds
                .map(
                    evidenceId =>
                        scientificDecisionTrace.evidenceCatalog
                            .find(
                                evidence =>
                                    evidence.evidenceId ===
                                    evidenceId
                            )
                )
                .filter(
                    evidence =>
                        evidence !==
                        undefined
                );


        for (
            const evidence
            of discoveryEvidence
        ) {

            console.log(
                `    SOURCE ${evidence!.sourceType}`
            );

            console.log(
                `      source:   ${evidence!.sourceLocation}`
            );

            console.log(
                `      revision: ${evidence!.sourceRevision ?? "NONE"}`
            );

            console.log(
                `      file:     ${evidence!.filePath ?? "NONE"}`
            );

            console.log(
                `      lines:    ${
                    evidence!.startLine !== undefined
                        ? `${evidence!.startLine}-${evidence!.endLine ?? evidence!.startLine}`
                        : "NONE"
                }`
            );

            console.log(
                `      evidence: ${evidence!.evidenceId}`
            );

        }

    }


    for (
        const compositionTrace
        of scientificDecisionTrace.compositionTraces
    ) {

        console.log("");
        console.log(
            `  COMPOSITION ${compositionTrace.harmonyStatus}`
        );

        console.log(
            `    participants: ${compositionTrace.participantIds.join(", ")}`
        );

        console.log(
            `    solver: ${compositionTrace.solverResolutionStatus}`
        );

        console.log(
            `    configurations: ${compositionTrace.configurations.length}`
        );

        console.log(
            `    why: ${compositionTrace.reasonCodes.join(", ")}`
        );

        console.log(
            `    basis: ${compositionTrace.decisionBasis}`
        );

    }


    if (
        scientificDecisionTrace.unresolvedEvidenceIds.length >
        0
    ) {

        console.log("");
        console.log(
            "  UNRESOLVED PROVENANCE"
        );

        for (
            const evidenceId
            of scientificDecisionTrace.unresolvedEvidenceIds
                .slice(
                    0,
                    20
                )
        ) {

            console.log(
                `    ${evidenceId}`
            );

        }


        if (
            scientificDecisionTrace.unresolvedEvidenceIds.length >
            20
        ) {

            console.log(
                `    ... ${scientificDecisionTrace.unresolvedEvidenceIds.length - 20} more`
            );

        }

    }

    /*
     * ---------------------------------------------------------
     * REAL STRUCTURED EVIDENCE LINEAGE
     * ---------------------------------------------------------
     *
     * This layer does not derive scientific polarity.
     * It resolves derivation identities back to source evidence
     * using explicit structured parent references only.
     */

    const derivedEvidenceLinks:
        ScientificEvidenceLineageDerivedLink[] =
        sources.flatMap(
            source => [

                ...source.semantic.model.capabilities
                    .map(
                        capability => ({

                            evidenceId:
                                capability.capabilityId,

                            kind:
                                "SEMANTIC_CAPABILITY" as const,

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
                            ),

                            parentEvidenceIds:
                                [...capability.evidence]

                        })
                    ),

                ...source.capabilityAttribution
                    .attributedCapabilities
                    .map(
                        attribution => ({

                            evidenceId:
                                attribution.attributionId,

                            kind:
                                "CAPABILITY_ATTRIBUTION" as const,

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
                            ),

                            parentEvidenceIds: [
                                attribution.capabilityId,
                                attribution.observationId,
                                ...attribution.evidence
                            ]

                        })
                    ),

                ...source.protocolIdentity
                    .protocolAttributedCapabilities
                    .map(
                        attribution => ({

                            evidenceId:
                                attribution.protocolAttributionId,

                            kind:
                                "PROTOCOL_ATTRIBUTION" as const,

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
                            ),

                            parentEvidenceIds: [
                                attribution.capabilityAttributionId,
                                attribution.capabilityId,
                                attribution.observationId,
                                ...attribution.evidence
                            ]

                        })
                    ),

                ...source.protocolConcepts
                    .protocolConcepts
                    .map(
                        concept => ({

                            evidenceId:
                                concept.protocolConceptId,

                            kind:
                                "PROTOCOL_CONCEPT" as const,

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
                            ),

                            parentEvidenceIds: [
                                ...concept.protocolAttributionIds,
                                ...concept.lexicalCapabilityIds,
                                ...concept.evidence
                            ]

                        })
                    ),

                ...source.structuralRelations
                    .relations
                    .map(
                        relation => ({

                            evidenceId:
                                relation.relationEvidenceId,

                            kind:
                                "STRUCTURAL_PROTOCOL_RELATION" as const,

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
                            ),

                            parentEvidenceIds: [
                                relation.factId,
                                relation.observationId
                            ]

                        })
                    ),

                ...source.externalCalls
                    .protocolAttributedExternalCalls
                    .map(
                        call => ({

                            evidenceId:
                                call.protocolCallAttributionId,

                            kind:
                                "PROTOCOL_EXTERNAL_CALL_ATTRIBUTION" as const,

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
                            ),

                            parentEvidenceIds: [
                                call.sourceFactId,
                                call.observationId
                            ]

                        })
                    )

            ]
        );


    const realEvidenceLineage =
        new ScientificEvidenceLineageEngine()
            .resolve({

                observations:
                    sources.flatMap(
                        source =>
                            source.github.sourceObservations
                    ),

                facts:
                    sources.flatMap(
                        source =>
                            source.github.sourceFacts
                    ),

                protocolRelationEvidence:
                    documentaryRelations,

                derivedLinks:
                    derivedEvidenceLinks,

                requestedEvidenceRefs:
                    scientificDecisionTrace
                        .participantArtifacts
                        .flatMap(
                            artifact =>
                                artifact.unresolvedEvidenceIds
                                    .map(
                                        evidenceId => ({

                                            evidenceId,

                                            sourceId:
                                                artifact.sourceId,

                                            ...(
                                                artifact.sourceRevision !==
                                                undefined
                                                    ? {
                                                        sourceRevision:
                                                            artifact.sourceRevision
                                                    }
                                                    : {}
                                            )

                                        })
                                    )
                        )

            });


    requireNoErrors(
        "Real scientific evidence lineage",
        realEvidenceLineage.errors
    );


    const realDecisionTraceLineageBinding =
        new ScientificDecisionTraceLineageBindingEngine()
            .bind(
                scientificDecisionTrace,
                realEvidenceLineage
            );


    requireNoErrors(
        "Real scientific Decision Trace lineage binding",
        realDecisionTraceLineageBinding.errors
    );


    if (
        realDecisionTraceLineageBinding.trace ===
        null
    ) {

        throw new Error(
            "Real scientific Decision Trace lineage binding returned null trace."
        );

    }


    const scientificDecisionTraceWithLineage =
        realDecisionTraceLineageBinding.trace;


    const resolvedLineageCount =
        realEvidenceLineage.resolutions
            .filter(
                resolution =>
                    resolution.status ===
                    "RESOLVED"
            )
            .length;


    const unresolvedLineageCount =
        realEvidenceLineage.resolutions
            .filter(
                resolution =>
                    resolution.status ===
                    "UNRESOLVED"
            )
            .length;


    const unresolvedLineageLeaves =
        [
            ...new Set(
                realEvidenceLineage.resolutions
                    .flatMap(
                        resolution =>
                            resolution.unresolvedLeafIds
                                .map(
                                    evidenceId =>
                                        `${resolution.sourceId}@${resolution.sourceRevision ?? "UNVERSIONED"} :: ${evidenceId}`
                                )
                    )
            )
        ].sort();


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC EVIDENCE LINEAGE"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `raw unresolved evidence:      ${scientificDecisionTrace.unresolvedEvidenceIds.length}`
    );

    console.log(
        `structured derived links:     ${derivedEvidenceLinks.length}`
    );

    console.log(
        `lineage requests:             ${realEvidenceLineage.resolutions.length}`
    );

    console.log(
        `resolved through lineage:     ${resolvedLineageCount}`
    );

    console.log(
        `unresolved through lineage:   ${unresolvedLineageCount}`
    );

    console.log(
        `source terminals reached:     ${realEvidenceLineage.terminalEvidenceCatalog.length}`
    );

    console.log(
        `trace unresolved after bind:  ${scientificDecisionTraceWithLineage.unresolvedEvidenceIds.length}`
    );

    console.log(
        `unresolved terminal leaves:   ${unresolvedLineageLeaves.length}`
    );


    if (
        unresolvedLineageLeaves.length >
        0
    ) {

        console.log("");
        console.log(
            "  REMAINING UNRESOLVED LEAVES"
        );


        for (
            const evidenceId
            of unresolvedLineageLeaves.slice(
                0,
                30
            )
        ) {

            console.log(
                `    ${evidenceId}`
            );

        }


        if (
            unresolvedLineageLeaves.length >
            30
        ) {

            console.log(
                `    ... ${unresolvedLineageLeaves.length - 30} more`
            );

        }

    }

    const candidateEvidenceRequirements =
        new ScientificCompositionCandidateEvidenceRequirementEngine()
            .derive({

                diagnosis:
                    candidateEvidenceGaps

            });


    requireNoErrors(
        "Real scientific candidate evidence requirements",
        candidateEvidenceRequirements.errors
    );


    const candidateEvidenceSpecifications =
        new ScientificCompositionCandidateEvidenceSpecificationEngine()
            .build({

                requirements:
                    candidateEvidenceRequirements

            });


    requireNoErrors(
        "Real scientific candidate evidence specifications",
        candidateEvidenceSpecifications.errors
    );


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE EVIDENCE GAPS"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `diagnostics: ${candidateEvidenceGaps.diagnostics.length}`
    );


    for (
        const diagnostic
        of candidateEvidenceGaps.diagnostics
    ) {

        console.log(
            `  CANDIDATE ${diagnostic.sourceParticipantId} -> ${diagnostic.targetParticipantId}`
        );

        console.log(
            `    kind:                  ${diagnostic.candidateKind}`
        );

        console.log(
            `    compatibility:         ${diagnostic.compatibilityPolarity}`
        );

        console.log(
            `    known boundaries:      ${diagnostic.knownBoundaryIds.length}`
        );

        console.log(
            `    observed boundaries:   ${diagnostic.observedBoundaryIds.length}`
        );

        console.log(
            `    unevaluated boundaries:${diagnostic.unevaluatedBoundaryIds.length}`
        );

        console.log(
            `    observations:          ${diagnostic.compatibilityObservationIds.length}`
        );

        console.log(
            `    compatibility evidence:${diagnostic.compatibilityEvidenceIds.length}`
        );

        console.log(
            `    resolution:            ${diagnostic.resolution}`
        );


        if (
            diagnostic.gaps.length ===
            0
        ) {

            console.log(
                "    gaps:                  NONE"
            );

        }
        else {

            console.log(
                "    gaps:"
            );

            for (
                const gap
                of diagnostic.gaps
            ) {

                console.log(
                    `      ${gap.kind} boundaries=${gap.boundaryIds.length}`
                );

            }

        }

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE EVIDENCE REQUIREMENTS"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `plans: ${candidateEvidenceRequirements.plans.length}`
    );


    for (
        const plan
        of candidateEvidenceRequirements.plans
    ) {

        console.log(
            `  CANDIDATE ${plan.sourceParticipantId} -> ${plan.targetParticipantId}`
        );

        console.log(
            `    kind:       ${plan.candidateKind}`
        );

        console.log(
            `    resolution: ${plan.evidenceResolution}`
        );

        console.log(
            `    status:     ${plan.status}`
        );

        console.log(
            `    requirements: ${plan.requirements.length}`
        );


        for (
            const requirement
            of plan.requirements
        ) {

            console.log(
                `      ${requirement.kind}`
            );

            console.log(
                `        readiness: ${requirement.readiness}`
            );

            console.log(
                `        target boundaries: ${requirement.targetBoundaryIds.length}`
            );

            console.log(
                `        triggering gaps: ${requirement.triggeringGapIds.length}`
            );

            console.log(
                `        blocking gaps: ${requirement.blockingGapIds.length}`
            );

        }

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE EVIDENCE SPECIFICATIONS"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `plans: ${candidateEvidenceSpecifications.statistics.plans}`
    );

    console.log(
        `specifications: ${candidateEvidenceSpecifications.statistics.specifications}`
    );

    console.log(
        `blocked requirements: ${candidateEvidenceSpecifications.statistics.blockedRequirements}`
    );

    console.log(
        `boundary acquisition specifications: ${candidateEvidenceSpecifications.statistics.boundaryEvidenceAcquisitionSpecifications}`
    );

    console.log(
        `boundary observation specifications: ${candidateEvidenceSpecifications.statistics.candidateBoundaryObservationSpecifications}`
    );


    for (
        const specification
        of candidateEvidenceSpecifications.specifications
    ) {

        console.log(
            `  SPECIFICATION ${specification.sourceParticipantId} -> ${specification.targetParticipantId}`
        );

        console.log(
            `    candidate kind:    ${specification.candidateKind}`
        );

        console.log(
            `    requirement kind:  ${specification.requirementKind}`
        );

        console.log(
            `    specification kind:${specification.specificationKind}`
        );

        console.log(
            `    target boundaries: ${specification.targetBoundaryIds.length}`
        );

        console.log(
            `    triggering gaps:   ${specification.triggeringGapIds.length}`
        );

        console.log(
            `    status:            ${specification.status}`
        );

    }


    for (
        const blocked
        of candidateEvidenceSpecifications.blockedRequirements
    ) {

        console.log(
            `  BLOCKED ${blocked.sourceParticipantId} -> ${blocked.targetParticipantId}`
        );

        console.log(
            `    requirement kind:  ${blocked.requirementKind}`
        );

        console.log(
            `    target boundaries: ${blocked.targetBoundaryIds.length}`
        );

        console.log(
            `    blocking gaps:     ${blocked.blockingGapIds.length}`
        );

        console.log(
            `    status:            ${blocked.status}`
        );

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE EVALUATION GRAPH"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `nodes:                        ${candidateEvaluationGraph.graph.statistics.nodes}`
    );

    console.log(
        `evaluated candidate edges:    ${candidateEvaluationGraph.graph.statistics.evaluatedCandidateEdges}`
    );

    console.log(
        `supported candidate edges:    ${candidateEvaluationGraph.graph.statistics.supportedCandidateEdges}`
    );

    console.log(
        `challenged candidate edges:   ${candidateEvaluationGraph.graph.statistics.challengedCandidateEdges}`
    );

    console.log(
        `inconclusive candidate edges: ${candidateEvaluationGraph.graph.statistics.inconclusiveCandidateEdges}`
    );

    console.log(
        `functional candidate edges:   ${candidateEvaluationGraph.graph.statistics.functionalCandidateEdges}`
    );

    console.log(
        `documentary candidate edges:  ${candidateEvaluationGraph.graph.statistics.documentaryCandidateEdges}`
    );


    for (
        const edge
        of candidateEvaluationGraph.graph.edges
    ) {

        if (
            edge.kind ===
            "FUNCTIONAL_COMPLEMENTARITY"
        ) {

            console.log(
                `  EDGE ${edge.sourceParticipantId} -> ${edge.targetParticipantId} kind=${edge.kind} compatibility=${edge.compatibilityPolarity} discoveryEvidence=${edge.discoveryEvidenceIds.length} compatibilityEvidence=${edge.compatibilityEvidenceIds.length} status=${edge.evaluationStatus}`
            );

        }
        else {

            console.log(
                `  EDGE ${edge.sourceParticipantId} -> ${edge.targetParticipantId} kind=${edge.kind} relation=${edge.relation} compatibility=${edge.compatibilityPolarity} discoveryEvidence=${edge.discoveryEvidenceIds.length} compatibilityEvidence=${edge.compatibilityEvidenceIds.length} status=${edge.evaluationStatus}`
            );

        }

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE GRAPH"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `graphId:                     ${compositionCandidateGraph.graph.graphId}`
    );

    console.log(
        `nodes:                       ${compositionCandidateGraph.graph.statistics.nodes}`
    );

    console.log(
        `candidate edges:             ${compositionCandidateGraph.graph.statistics.candidateEdges}`
    );

    console.log(
        `functional candidate edges:  ${compositionCandidateGraph.graph.statistics.functionalCandidateEdges}`
    );

    console.log(
        `documentary candidate edges: ${compositionCandidateGraph.graph.statistics.documentaryCandidateEdges}`
    );


    for (
        const edge
        of compositionCandidateGraph.graph.edges
    ) {

        if (
            edge.kind ===
            "FUNCTIONAL_COMPLEMENTARITY"
        ) {

            console.log(
                `  EDGE ${edge.sourceParticipantId} -> ${edge.targetParticipantId} kind=${edge.kind} need=${edge.needId} contribution=${edge.contributionId} evidence=${edge.evidenceIds.length} status=${edge.evaluationStatus}`
            );

        }
        else {

            console.log(
                `  EDGE ${edge.sourceParticipantId} -> ${edge.targetParticipantId} kind=${edge.kind} relation=${edge.relation} evidence=${edge.evidenceIds.length} status=${edge.evaluationStatus}`
            );

        }

    }


    console.log("");
    console.log(
        "============================================================"
    );
    console.log(
        "REAL SCIENTIFIC COMPOSITION CANDIDATE SET"
    );
    console.log(
        "============================================================"
    );

    console.log(
        `participants:             ${profiles.length}`
    );

    console.log(
        `functional candidates:    ${
            compositionCandidateSet.candidates.filter(
                candidate =>
                    candidate.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
            ).length
        }`
    );

    console.log(
        `documentary candidates:   ${
            compositionCandidateSet.candidates.filter(
                candidate =>
                    candidate.kind ===
                    "DOCUMENTARY_COMPOSITION"
            ).length
        }`
    );

    console.log(
        `total candidates:         ${compositionCandidateSet.candidates.length}`
    );


    for (
        const candidate
        of compositionCandidateSet.candidates
    ) {

        if (
            candidate.kind ===
            "FUNCTIONAL_COMPLEMENTARITY"
        ) {

            console.log(
                `  CANDIDATE ${candidate.sourceParticipantId} -> ${candidate.targetParticipantId} kind=${candidate.kind} need=${candidate.needId} contribution=${candidate.contributionId} evidence=${candidate.evidenceIds.length} status=${candidate.evaluationStatus}`
            );

        }
        else {

            console.log(
                `  CANDIDATE ${candidate.sourceParticipantId} -> ${candidate.targetParticipantId} kind=${candidate.kind} relation=${candidate.relation} evidence=${candidate.evidenceIds.length} status=${candidate.evaluationStatus}`
            );

        }

    }


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
