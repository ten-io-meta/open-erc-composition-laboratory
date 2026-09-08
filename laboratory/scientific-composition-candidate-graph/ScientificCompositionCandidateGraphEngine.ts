import type {
    ScientificCompositionFrameObjective
} from "../scientific-composition-frame/ScientificCompositionFrame.js";

import type {
    ScientificCompositionCandidateSetResult
} from "../scientific-composition-candidate-set/ScientificCompositionCandidateSetResult.js";

import type {
    ScientificCompositionCandidateGraph,
    ScientificCompositionCandidateGraphEdge,
    ScientificCompositionCandidateGraphNode,
    ScientificCompositionCandidateGraphResult
} from "./ScientificCompositionCandidateGraph.js";


export interface ScientificCompositionCandidateGraphParticipantProfile {

    protocolId:
        string;

    profileId:
        string;

    sourceId:
        string;

    sourceRevision?:
        string;

}


export interface ScientificCompositionCandidateGraphEngineInput {

    objective:
        ScientificCompositionFrameObjective;

    profiles:
        ScientificCompositionCandidateGraphParticipantProfile[];

    candidateSet:
        ScientificCompositionCandidateSetResult;

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


export class ScientificCompositionCandidateGraphEngine {

    build(
        input:
            ScientificCompositionCandidateGraphEngineInput
    ): ScientificCompositionCandidateGraphResult {

        const errors:
            string[] = [];


        if (
            input.candidateSet.errors.length >
            0
        ) {

            errors.push(
                "Cannot build candidate graph from candidate set containing errors."
            );

        }


        if (
            input.objective.objectiveId.trim().length ===
            0
        ) {

            errors.push(
                "Candidate graph objective identity is empty."
            );

        }


        const profilesByProtocol =
            new Map<
                string,
                ScientificCompositionCandidateGraphParticipantProfile
            >();


        const profileIds =
            new Set<string>();


        for (
            const profile
            of input.profiles
        ) {

            if (
                profile.protocolId.trim().length ===
                0
            ) {

                errors.push(
                    "Candidate graph received a profile with empty participant identity."
                );

                continue;

            }


            if (
                profile.profileId.trim().length ===
                0
            ) {

                errors.push(
                    `Candidate graph participant ${profile.protocolId} has an empty profile identity.`
                );

            }


            if (
                profile.sourceId.trim().length ===
                0
            ) {

                errors.push(
                    `Candidate graph participant ${profile.protocolId} has an empty source identity.`
                );

            }


            if (
                profilesByProtocol.has(
                    profile.protocolId
                )
            ) {

                errors.push(
                    `Duplicate candidate graph participant ${profile.protocolId}.`
                );

            }


            if (
                profileIds.has(
                    profile.profileId
                )
            ) {

                errors.push(
                    `Duplicate candidate graph profile identity ${profile.profileId}.`
                );

            }


            profilesByProtocol.set(
                profile.protocolId,
                profile
            );


            profileIds.add(
                profile.profileId
            );

        }


        const candidateIds =
            new Set<string>();


        for (
            const candidate
            of input.candidateSet.candidates
        ) {

            if (
                !candidate.candidateId.trim()
            ) {

                errors.push(
                    "Candidate graph received an empty candidate identity."
                );

                continue;

            }


            if (
                candidateIds.has(
                    candidate.candidateId
                )
            ) {

                errors.push(
                    `Duplicate candidate graph candidate ${candidate.candidateId}.`
                );

            }


            candidateIds.add(
                candidate.candidateId
            );


            if (
                !profilesByProtocol.has(
                    candidate.sourceParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} references unknown source participant ${candidate.sourceParticipantId}.`
                );

            }


            if (
                !profilesByProtocol.has(
                    candidate.targetParticipantId
                )
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} references unknown target participant ${candidate.targetParticipantId}.`
                );

            }


            if (
                candidate.sourceParticipantId ===
                    candidate.targetParticipantId
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} is not cross-protocol.`
                );

            }


            if (
                candidate.evaluationStatus !==
                    "UNEVALUATED"
            ) {

                errors.push(
                    `Candidate ${candidate.candidateId} is not unevaluated.`
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

                errors:
                    errors.sort()

            };

        }


        const nodes:
            ScientificCompositionCandidateGraphNode[] =
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
                );


        const edges:
            ScientificCompositionCandidateGraphEdge[] =
            [];


        for (
            const candidate
            of [...input.candidateSet.candidates].sort(
                (a, b) =>
                    a.candidateId.localeCompare(
                        b.candidateId
                    )
            )
        ) {

            if (
                candidate.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
            ) {

                edges.push({

                    edgeId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-GRAPH-EDGE",
                            candidate.candidateId
                        ]),

                    candidateId:
                        candidate.candidateId,

                    kind:
                        candidate.kind,

                    sourceParticipantId:
                        candidate.sourceParticipantId,

                    targetParticipantId:
                        candidate.targetParticipantId,

                    functionalMatchId:
                        candidate.functionalMatchId,

                    needId:
                        candidate.needId,

                    needSubject:
                        candidate.needSubject,

                    contributionId:
                        candidate.contributionId,

                    contributionKind:
                        candidate.contributionKind,

                    contributionSubject:
                        candidate.contributionSubject,

                    evidenceIds:
                        [...candidate.evidenceIds].sort(),

                    evaluationStatus:
                        "UNEVALUATED"

                });

            }
            else {

                edges.push({

                    edgeId:
                        encode([
                            "SCIENTIFIC-COMPOSITION-CANDIDATE-GRAPH-EDGE",
                            candidate.candidateId
                        ]),

                    candidateId:
                        candidate.candidateId,

                    kind:
                        candidate.kind,

                    sourceParticipantId:
                        candidate.sourceParticipantId,

                    targetParticipantId:
                        candidate.targetParticipantId,

                    documentaryCandidateId:
                        candidate.documentaryCandidateId,

                    relation:
                        candidate.relation,

                    evidenceIds:
                        [...candidate.evidenceIds].sort(),

                    evaluationStatus:
                        "UNEVALUATED"

                });

            }

        }


        const functionalCandidateEdges =
            edges.filter(
                edge =>
                    edge.kind ===
                    "FUNCTIONAL_COMPLEMENTARITY"
            ).length;


        const documentaryCandidateEdges =
            edges.filter(
                edge =>
                    edge.kind ===
                    "DOCUMENTARY_COMPOSITION"
            ).length;


        const graph:
            ScientificCompositionCandidateGraph = {

                graphId:
                    encode([
                        "SCIENTIFIC-COMPOSITION-CANDIDATE-GRAPH",
                        input.objective.objectiveId,
                        ...nodes.map(
                            node =>
                                node.participantId
                        ),
                        ...edges.map(
                            edge =>
                                edge.candidateId
                        )
                    ]),

                objectiveId:
                    input.objective.objectiveId,

                nodes,

                edges,

                statistics: {

                    nodes:
                        nodes.length,

                    candidateEdges:
                        edges.length,

                    functionalCandidateEdges,

                    documentaryCandidateEdges

                }

            };


        return {

            graph,

            errors:
                []

        };

    }

}