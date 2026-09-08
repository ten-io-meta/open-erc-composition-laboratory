import {
    ScientificNProtocolCompositionSetEngine
} from "../laboratory/scientific-n-protocol-composition-set/ScientificNProtocolCompositionSetEngine.js";

import type {
    ScientificCompositionCandidateGraphResult
} from "../laboratory/scientific-composition-candidate-graph/ScientificCompositionCandidateGraph.js";


let failures =
    0;


function check(
    label:
        string,
    condition:
        boolean
): void {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );


    if (
        !condition
    ) {

        failures++;

    }

}


const candidateGraph:
    ScientificCompositionCandidateGraphResult = {

        graph: {

            graphId:
                "CANDIDATE-GRAPH-N",

            objectiveId:
                "OBJECTIVE-N",

            nodes: [

                {
                    participantId:
                        "ERC-1001",

                    profileId:
                        "PROFILE-1001",

                    sourceId:
                        "SOURCE-A"
                },

                {
                    participantId:
                        "ERC-1002",

                    profileId:
                        "PROFILE-1002",

                    sourceId:
                        "SOURCE-B"
                },

                {
                    participantId:
                        "ERC-1003",

                    profileId:
                        "PROFILE-1003",

                    sourceId:
                        "SOURCE-C"
                },

                {
                    participantId:
                        "ERC-2001",

                    profileId:
                        "PROFILE-2001",

                    sourceId:
                        "SOURCE-D"
                },

                {
                    participantId:
                        "ERC-2002",

                    profileId:
                        "PROFILE-2002",

                    sourceId:
                        "SOURCE-E"
                },

                {
                    participantId:
                        "ERC-3001",

                    profileId:
                        "PROFILE-3001",

                    sourceId:
                        "SOURCE-F"
                }

            ],

            edges: [

                {
                    edgeId:
                        "EDGE-A-B",

                    candidateId:
                        "CANDIDATE-A-B",

                    kind:
                        "FUNCTIONAL_COMPLEMENTARITY",

                    sourceParticipantId:
                        "ERC-1001",

                    targetParticipantId:
                        "ERC-1002",

                    functionalMatchId:
                        "MATCH-A-B",

                    needId:
                        "NEED-A-B",

                    needSubject:
                        "INTERFACE_MEMBER:IA.a",

                    contributionId:
                        "CONTRIBUTION-A-B",

                    contributionKind:
                        "CAPABILITY",

                    contributionSubject:
                        "INTERFACE_MEMBER:IA.a",

                    evidenceIds: [
                        "EVIDENCE-2",
                        "EVIDENCE-1"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                },

                {
                    edgeId:
                        "EDGE-B-C",

                    candidateId:
                        "CANDIDATE-B-C",

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    sourceParticipantId:
                        "ERC-1002",

                    targetParticipantId:
                        "ERC-1003",

                    documentaryCandidateId:
                        "DOCUMENTARY-B-C",

                    relation:
                        "COMPOSES_WITH",

                    evidenceIds: [
                        "EVIDENCE-BC"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                },

                {
                    edgeId:
                        "EDGE-D-E",

                    candidateId:
                        "CANDIDATE-D-E",

                    kind:
                        "DOCUMENTARY_COMPOSITION",

                    sourceParticipantId:
                        "ERC-2001",

                    targetParticipantId:
                        "ERC-2002",

                    documentaryCandidateId:
                        "DOCUMENTARY-D-E",

                    relation:
                        "COMPOSES_WITH",

                    evidenceIds: [
                        "EVIDENCE-DE"
                    ],

                    evaluationStatus:
                        "UNEVALUATED"
                }

            ],

            statistics: {

                nodes:
                    6,

                candidateEdges:
                    3,

                functionalCandidateEdges:
                    1,

                documentaryCandidateEdges:
                    2

            }

        },

        errors:
            []

    };


const engine =
    new ScientificNProtocolCompositionSetEngine();


const primary =
    engine.build({

        candidateGraph

    });


console.log(
    "\nSCIENTIFIC N-PROTOCOL COMPOSITION SET — RUNTIME"
);
console.log(
    "------------------------------------------------"
);


check(
    "VALID N-PROTOCOL SET BUILD HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "CONNECTED CANDIDATES FORM TWO COMPOSITION SETS",
    primary.sets.length ===
        2
);


const threeProtocolSet =
    primary.sets.find(
        set =>
            set.participantIds.length ===
            3
    );


check(
    "A-B-C CHAIN FORMS ONE THREE-PROTOCOL SET",
    JSON.stringify(
        threeProtocolSet?.participantIds
    ) ===
        JSON.stringify([
            "ERC-1001",
            "ERC-1002",
            "ERC-1003"
        ])
);


check(
    "THREE-PROTOCOL SET PRESERVES BOTH CANDIDATE RELATIONS",
    threeProtocolSet?.relations.length ===
        2
);


check(
    "RELATION DIRECTION IS PRESERVED",
    threeProtocolSet
        ?.relations
        .some(
            relation =>
                relation.candidateId ===
                    "CANDIDATE-B-C" &&
                relation.sourceParticipantId ===
                    "ERC-1002" &&
                relation.targetParticipantId ===
                    "ERC-1003"
        ) ===
        true
);


check(
    "DISCOVERY EVIDENCE IS PRESERVED DETERMINISTICALLY",
    JSON.stringify(
        threeProtocolSet
            ?.relations
            .find(
                relation =>
                    relation.candidateId ===
                    "CANDIDATE-A-B"
            )
            ?.evidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-1",
            "EVIDENCE-2"
        ])
);


check(
    "ISOLATED PARTICIPANT IS NOT FORCED INTO A COMPOSITION SET",
    JSON.stringify(
        primary.isolatedParticipantIds
    ) ===
        JSON.stringify([
            "ERC-3001"
        ])
);


check(
    "STATISTICS PRESERVE N-PROTOCOL TOPOLOGY",
    primary.statistics.candidateGraphParticipants ===
        6 &&
    primary.statistics.candidateGraphRelations ===
        3 &&
    primary.statistics.compositionSets ===
        2 &&
    primary.statistics.participantsInCompositionSets ===
        5 &&
    primary.statistics.isolatedParticipants ===
        1 &&
    primary.statistics.largestCompositionSet ===
        3
);


check(
    "COMPOSITION SET MAKES NO HARMONY OR COMPATIBILITY CLAIM",
    primary.sets.every(
        set =>
            set.status ===
                "DISCOVERED" &&
            !(
                "scientificPolarity" in
                set
            ) &&
            !(
                "harmony" in
                set
            ) &&
            !(
                "compatible" in
                set
            )
    )
);


const unknownParticipantGraph:
    ScientificCompositionCandidateGraphResult = {

        graph:
            candidateGraph.graph ===
                null
                ? null
                : {

                    ...candidateGraph.graph,

                    edges: [

                        ...candidateGraph.graph.edges,

                        {
                            ...candidateGraph.graph.edges[0],

                            edgeId:
                                "EDGE-UNKNOWN",

                            candidateId:
                                "CANDIDATE-UNKNOWN",

                            targetParticipantId:
                                "ERC-9999"
                        }

                    ]

                },

        errors:
            []

    };


const unknownParticipant =
    engine.build({

        candidateGraph:
            unknownParticipantGraph

    });


check(
    "UNKNOWN EDGE PARTICIPANT IS DETECTED",
    unknownParticipant.errors.length >
        0
);


check(
    "UNKNOWN EDGE PARTICIPANT FAILS CLOSED",
    unknownParticipant.sets.length ===
        0
);


const selfRelationGraph:
    ScientificCompositionCandidateGraphResult = {

        graph:
            candidateGraph.graph ===
                null
                ? null
                : {

                    ...candidateGraph.graph,

                    edges: [

                        {
                            ...candidateGraph.graph.edges[0],

                            edgeId:
                                "EDGE-SELF",

                            candidateId:
                                "CANDIDATE-SELF",

                            sourceParticipantId:
                                "ERC-1001",

                            targetParticipantId:
                                "ERC-1001"
                        }

                    ]

                },

        errors:
            []

    };


const selfRelation =
    engine.build({

        candidateGraph:
            selfRelationGraph

    });


check(
    "SELF CANDIDATE RELATION IS DETECTED",
    selfRelation.errors.length >
        0
);


check(
    "SELF CANDIDATE RELATION FAILS CLOSED",
    selfRelation.sets.length ===
        0
);


const isolatedOnly:
    ScientificCompositionCandidateGraphResult = {

        graph: {

            graphId:
                "ISOLATED-GRAPH",

            objectiveId:
                "ISOLATED-OBJECTIVE",

            nodes: [

                {
                    participantId:
                        "ERC-4001",

                    profileId:
                        "PROFILE-4001",

                    sourceId:
                        "SOURCE-4001"
                },

                {
                    participantId:
                        "ERC-4002",

                    profileId:
                        "PROFILE-4002",

                    sourceId:
                        "SOURCE-4002"
                }

            ],

            edges:
                [],

            statistics: {

                nodes:
                    2,

                candidateEdges:
                    0,

                functionalCandidateEdges:
                    0,

                documentaryCandidateEdges:
                    0

            }

        },

        errors:
            []

    };


const isolatedResult =
    engine.build({

        candidateGraph:
            isolatedOnly

    });


check(
    "NO CANDIDATE RELATION PRODUCES NO FALSE COMPOSITION SET",
    isolatedResult.errors.length ===
        0 &&
    isolatedResult.sets.length ===
        0
);


check(
    "NO CANDIDATE RELATION PRESERVES ISOLATED PARTICIPANTS",
    JSON.stringify(
        isolatedResult.isolatedParticipantIds
    ) ===
        JSON.stringify([
            "ERC-4001",
            "ERC-4002"
        ])
);


const reverse =
    engine.build({

        candidateGraph:
            candidateGraph.graph ===
                null
                ? candidateGraph
                : {

                    graph: {

                        ...candidateGraph.graph,

                        nodes:
                            [...candidateGraph.graph.nodes]
                                .reverse(),

                        edges:
                            [...candidateGraph.graph.edges]
                                .reverse()
                                .map(
                                    edge => ({

                                        ...edge,

                                        evidenceIds:
                                            [...edge.evidenceIds]
                                                .reverse()

                                    })
                                )

                    },

                    errors:
                        []

                }

    });


check(
    "N-PROTOCOL COMPOSITION SET BUILD IS DETERMINISTIC",
    JSON.stringify(
        primary
    ) ===
        JSON.stringify(
            reverse
        )
);


if (
    failures >
    0
) {

    console.log(
        `\nRESULT: FAIL (${failures})`
    );

    process.exitCode =
        1;

}
else {

    console.log(
        "\nRESULT: PASS"
    );

}