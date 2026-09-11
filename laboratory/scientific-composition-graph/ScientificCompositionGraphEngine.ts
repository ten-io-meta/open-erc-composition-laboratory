import type {
    ScientificCompositionFrameObjective
} from "../scientific-composition-frame/ScientificCompositionFrame.js";

import type {
    ScientificProtocolCompositionProfile
} from "../scientific-protocol-composition-profile/ScientificProtocolCompositionProfile.js";

import type {
    ScientificCompositionComplementarityResult
} from "../scientific-composition-complementarity/ScientificCompositionComplementarityResult.js";

import type {
    ScientificCompositionCompatibilityResult
} from "../scientific-composition-compatibility/ScientificCompositionCompatibilityAssessment.js";

import type {
    ScientificCompositionGraph,
    ScientificCompositionGraphEdge,
    ScientificCompositionGraphNode,
    ScientificCompositionGraphResult
} from "./ScientificCompositionGraph.js";


export interface ScientificCompositionGraphEngineInput {

    objective:
        ScientificCompositionFrameObjective;

    profiles:
        ScientificProtocolCompositionProfile[];

    complementarity:
        ScientificCompositionComplementarityResult;

    compatibility:
        ScientificCompositionCompatibilityResult;

}


function encode(
    parts:
        string[]
): string {

    return parts
        .map(
            part =>
                `${part.length}:${part}`
        )
        .join("|");

}


export class ScientificCompositionGraphEngine {

    build(
        input:
            ScientificCompositionGraphEngineInput
    ): ScientificCompositionGraphResult {

        const errors:
            string[] = [];


        if (
            input.complementarity.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition graph from complementarity result containing errors."
            );

        }


        if (
            input.compatibility.errors.length >
            0
        ) {

            errors.push(
                "Cannot build composition graph from compatibility result containing errors."
            );

        }


        const profilesByProtocol =
            new Map<
                string,
                ScientificProtocolCompositionProfile
            >();


        for (
            const profile
            of input.profiles
        ) {

            if (
                profilesByProtocol.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate protocol profile ${profile.protocolId}.`
                );

                continue;

            }


            profilesByProtocol.set(
                profile.protocolId,
                profile
            );

        }


        const matchesById =
            new Map(
                input.complementarity.matches.map(
                    match => [
                        match.matchId,
                        match
                    ] as const
                )
            );


        if (
            matchesById.size !==
            input.complementarity.matches.length
        ) {

            errors.push(
                "Duplicate complementarity match identity."
            );

        }


        const assessmentsByMatch =
            new Map<
                string,
                typeof input.compatibility.assessments
            >();


        for (
            const assessment
            of input.compatibility.assessments
        ) {

            const existing =
                assessmentsByMatch.get(
                    assessment.matchId
                ) ?? [];


            existing.push(
                assessment
            );


            assessmentsByMatch.set(
                assessment.matchId,
                existing
            );


            if (
                !matchesById.has(
                    assessment.matchId
                )
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} references unknown match ${assessment.matchId}.`
                );

            }

        }


        for (
            const match
            of input.complementarity.matches
        ) {

            if (
                !profilesByProtocol.has(
                    match.consumerParticipantId
                )
            ) {

                errors.push(
                    `Match ${match.matchId} references unknown consumer ${match.consumerParticipantId}.`
                );

            }


            if (
                !profilesByProtocol.has(
                    match.providerParticipantId
                )
            ) {

                errors.push(
                    `Match ${match.matchId} references unknown provider ${match.providerParticipantId}.`
                );

            }


            const assessments =
                assessmentsByMatch.get(
                    match.matchId
                ) ?? [];


            if (
                assessments.length !==
                1
            ) {

                errors.push(
                    `Match ${match.matchId} requires exactly one compatibility assessment.`
                );

                continue;

            }


            const assessment =
                assessments[0];


            if (
                assessment.consumerParticipantId !==
                    match.consumerParticipantId ||
                assessment.providerParticipantId !==
                    match.providerParticipantId
            ) {

                errors.push(
                    `Compatibility assessment ${assessment.assessmentId} participant identities do not match ${match.matchId}.`
                );

            }

        }


        if (
            errors.length >
            0
        ) {

            return {
                graph:
                    null,
                errors
            };

        }


        const nodes:
            ScientificCompositionGraphNode[] =
            [...input.profiles]
                .sort(
                    (a, b) =>
                        a.protocolId.localeCompare(
                            b.protocolId
                        )
                )
                .map(
                    profile => ({

                        participantId:
                            profile.protocolId,

                        profileId:
                            profile.profileId,

                        sourceId:
                            profile.sourceId,

                        sourceRevision:
                            profile.sourceRevision,

                        contributionIds:
                            profile.contributions
                                .map(
                                    contribution =>
                                        contribution.contributionId
                                )
                                .sort(),

                        boundaryIds:
                            profile.boundaries
                                .map(
                                    boundary =>
                                        boundary.boundaryId
                                )
                                .sort(),

                        needIds:
                            profile.needs
                                .map(
                                    need =>
                                        need.needId
                                )
                                .sort()

                    })
                );


        const edges:
            ScientificCompositionGraphEdge[] =
            input.complementarity.matches
                .map(
                    match => {

                        const assessment =
                            assessmentsByMatch.get(
                                match.matchId
                            )![0];


                        return {

                            edgeId:
                                encode([
                                    "SCIENTIFIC-COMPOSITION-GRAPH-EDGE",
                                    match.matchId
                                ]),

                            matchId:
                                match.matchId,

                            consumerParticipantId:
                                match.consumerParticipantId,

                            providerParticipantId:
                                match.providerParticipantId,

                            needId:
                                match.needId,

                            contributionId:
                                match.contributionId,

                            compatibilityAssessmentId:
                                assessment.assessmentId,

                            compatibilityPolarity:
                                assessment.scientificPolarity,

                            boundaryIds:
                                assessment
                                    .boundaryEvaluations
                                    .map(
                                        evaluation =>
                                            evaluation.boundaryId
                                    )
                                    .sort(),

                            evidenceIds:
                                [
                                    ...match.evidenceIds,
                                    ...assessment
                                        .boundaryEvaluations
                                        .flatMap(
                                            evaluation =>
                                                evaluation.evidenceIds
                                        )
                                ]
                                .sort()

                        };

                    }
                )
                .sort(
                    (a, b) =>
                        a.edgeId.localeCompare(
                            b.edgeId
                        )
                );


        const supportedEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "SUPPORT"
            ).length;


        const challengedEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "CHALLENGE"
            ).length;


        const inconclusiveEdges =
            edges.filter(
                edge =>
                    edge.compatibilityPolarity ===
                    "INCONCLUSIVE"
            ).length;


        const objectiveCoverage =
            [...input.complementarity.objectiveCoverage]
                .sort(
                    (a, b) =>
                        a.requiredSubject.localeCompare(
                            b.requiredSubject
                        )
                )
                .map(
                    coverage => ({

                        ...coverage,

                        providerParticipantIds:
                            [
                                ...coverage.providerParticipantIds
                            ].sort(),

                        contributionIds:
                            [
                                ...coverage.contributionIds
                            ].sort()

                    })
                );


        const unresolvedObjectiveSubjects =
            objectiveCoverage.filter(
                coverage =>
                    coverage.status ===
                    "UNRESOLVED"
            ).length;


        const unresolvedNeedIds =
            [
                ...input.complementarity.unresolvedNeedIds
            ].sort();


        /*
         * A challenged edge is sufficient to challenge the graph.
         *
         * Otherwise the graph remains INCONCLUSIVE because
         * whole-frame simultaneous boundary preservation has not
         * yet been evaluated.
         */
        const scientificPolarity =
            challengedEdges >
            0
                ? "CHALLENGE" as const
                : "INCONCLUSIVE" as const;


        const graph:
            ScientificCompositionGraph = {

                graphId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-GRAPH",
                        input.objective.objectiveId,
                        ...nodes.map(
                            node =>
                                node.participantId
                        ),
                        ...edges.map(
                            edge =>
                                edge.matchId
                        )
                    ]),

                objectiveId:
                    input.objective.objectiveId,

                nodes,

                edges,

                unresolvedNeedIds,

                objectiveCoverage,

                statistics: {

                    nodes:
                        nodes.length,

                    edges:
                        edges.length,

                    supportedEdges,

                    challengedEdges,

                    inconclusiveEdges,

                    unresolvedNeeds:
                        unresolvedNeedIds.length,

                    unresolvedObjectiveSubjects

                },

                scientificPolarity

            };


        return {
            graph,
            errors: []
        };

    }

}
