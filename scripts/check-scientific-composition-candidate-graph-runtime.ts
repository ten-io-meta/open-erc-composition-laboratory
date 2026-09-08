import {
    ScientificCompositionCandidateGraphEngine
} from "../laboratory/scientific-composition-candidate-graph/ScientificCompositionCandidateGraphEngine.js";

import type {
    ScientificCompositionCandidateSetResult
} from "../laboratory/scientific-composition-candidate-set/ScientificCompositionCandidateSetResult.js";


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


const objective = {

    objectiveId:
        "OBJECTIVE-CANDIDATE-GRAPH",

    description:
        "Discover candidate multi-protocol composition topology.",

    requiredSubjects:
        []

};


const profiles = [

    {
        protocolId:
            "ERC-8004",

        profileId:
            "PROFILE-8004",

        sourceId:
            "SOURCE-8004",

        sourceRevision:
            "REV-8004"
    },

    {
        protocolId:
            "ERC-8301",

        profileId:
            "PROFILE-8301",

        sourceId:
            "SOURCE-AGENTS",

        sourceRevision:
            "REV-AGENTS"
    },

    {
        protocolId:
            "ERC-8354",

        profileId:
            "PROFILE-8354",

        sourceId:
            "SOURCE-AGENTS",

        sourceRevision:
            "REV-AGENTS"
    },

    {
        protocolId:
            "ERC-9000",

        profileId:
            "PROFILE-9000",

        sourceId:
            "SOURCE-9000",

        sourceRevision:
            "REV-9000"
    }

];


const candidateSet:
    ScientificCompositionCandidateSetResult = {

        candidates: [

            {
                candidateId:
                    "CANDIDATE-FUNCTIONAL",

                kind:
                    "FUNCTIONAL_COMPLEMENTARITY",

                sourceParticipantId:
                    "ERC-8004",

                targetParticipantId:
                    "ERC-9000",

                functionalMatchId:
                    "MATCH-1",

                needId:
                    "NEED-1",

                needSubject:
                    "INTERFACE_MEMBER:ITest.verify",

                contributionId:
                    "CONTRIBUTION-1",

                contributionKind:
                    "CAPABILITY",

                contributionSubject:
                    "INTERFACE_MEMBER:ITest.verify",

                evidenceBasis:
                    "EXACT_NORMALIZED_SUBJECT_MATCH",

                evidenceIds: [
                    "EVIDENCE-FUNCTIONAL"
                ],

                evaluationStatus:
                    "UNEVALUATED"
            },

            {
                candidateId:
                    "CANDIDATE-DOCUMENTARY",

                kind:
                    "DOCUMENTARY_COMPOSITION",

                sourceParticipantId:
                    "ERC-8301",

                targetParticipantId:
                    "ERC-8354",

                documentaryCandidateId:
                    "DOCUMENTARY-1",

                relation:
                    "COMPOSES_WITH",

                evidenceIds: [
                    "EVIDENCE-DOC-2",
                    "EVIDENCE-DOC-1"
                ],

                evaluationStatus:
                    "UNEVALUATED"
            }

        ],

        errors:
            []

    };


const engine =
    new ScientificCompositionCandidateGraphEngine();


const primary =
    engine.build({

        objective,

        profiles,

        candidateSet

    });


console.log(
    "\nSCIENTIFIC COMPOSITION CANDIDATE GRAPH — RUNTIME"
);
console.log(
    "-----------------------------------------------"
);


check(
    "VALID CANDIDATE GRAPH HAS NO ERRORS",
    primary.errors.length ===
        0
);


check(
    "VALID CANDIDATE GRAPH EXISTS",
    primary.graph !==
        null
);


check(
    "ALL PARTICIPANTS BECOME GRAPH NODES",
    primary.graph?.nodes.length ===
        4
);


check(
    "BOTH CANDIDATE PATHS BECOME GRAPH EDGES",
    primary.graph?.edges.length ===
        2
);


check(
    "FUNCTIONAL CANDIDATE EDGE IS PRESERVED",
    primary.graph?.edges.some(
        edge =>
            edge.kind ===
                "FUNCTIONAL_COMPLEMENTARITY" &&
            edge.sourceParticipantId ===
                "ERC-8004" &&
            edge.targetParticipantId ===
                "ERC-9000" &&
            edge.functionalMatchId ===
                "MATCH-1"
    ) ===
        true
);


check(
    "DOCUMENTARY CANDIDATE EDGE IS PRESERVED",
    primary.graph?.edges.some(
        edge =>
            edge.kind ===
                "DOCUMENTARY_COMPOSITION" &&
            edge.sourceParticipantId ===
                "ERC-8301" &&
            edge.targetParticipantId ===
                "ERC-8354" &&
            edge.relation ===
                "COMPOSES_WITH"
    ) ===
        true
);


check(
    "DOCUMENTARY EVIDENCE IS SORTED",
    JSON.stringify(
        primary.graph
            ?.edges
            .find(
                edge =>
                    edge.kind ===
                    "DOCUMENTARY_COMPOSITION"
            )
            ?.evidenceIds
    ) ===
        JSON.stringify([
            "EVIDENCE-DOC-1",
            "EVIDENCE-DOC-2"
        ])
);


check(
    "ALL CANDIDATE GRAPH EDGES REMAIN UNEVALUATED",
    primary.graph?.edges.every(
        edge =>
            edge.evaluationStatus ===
                "UNEVALUATED"
    ) ===
        true
);


check(
    "CANDIDATE GRAPH HAS NO SCIENTIFIC POLARITY",
    primary.graph !==
        null &&
    !(
        "scientificPolarity" in
        primary.graph
    )
);


check(
    "CANDIDATE GRAPH EDGES HAVE NO COMPATIBILITY ASSESSMENT",
    primary.graph?.edges.every(
        edge =>
            !(
                "compatibilityAssessmentId" in
                edge
            ) &&
            !(
                "compatibilityPolarity" in
                edge
            )
    ) ===
        true
);


check(
    "GRAPH STATISTICS DISTINGUISH CANDIDATE KINDS",
    primary.graph?.statistics.candidateEdges ===
        2 &&
    primary.graph.statistics.functionalCandidateEdges ===
        1 &&
    primary.graph.statistics.documentaryCandidateEdges ===
        1
);


const unknownParticipant =
    engine.build({

        objective,

        profiles:
            profiles.slice(
                0,
                3
            ),

        candidateSet

    });


check(
    "UNKNOWN CANDIDATE PARTICIPANT IS DETECTED",
    unknownParticipant.errors.length >
        0
);


check(
    "UNKNOWN CANDIDATE PARTICIPANT FAILS CLOSED",
    unknownParticipant.graph ===
        null
);


const contaminatedCandidateSet =
    engine.build({

        objective,

        profiles,

        candidateSet: {

            candidates:
                candidateSet.candidates,

            errors: [
                "UPSTREAM CONTAMINATION"
            ]

        }

    });


check(
    "UPSTREAM CANDIDATE SET ERROR IS DETECTED",
    contaminatedCandidateSet.errors.length >
        0
);


check(
    "UPSTREAM CANDIDATE SET ERROR FAILS CLOSED",
    contaminatedCandidateSet.graph ===
        null
);


const emptyCandidates =
    engine.build({

        objective,

        profiles,

        candidateSet: {

            candidates:
                [],

            errors:
                []

        }

    });


check(
    "EMPTY CANDIDATE SET STILL PRESERVES PARTICIPANT GRAPH",
    emptyCandidates.graph?.nodes.length ===
        4 &&
    emptyCandidates.graph.edges.length ===
        0
);


const reverse =
    engine.build({

        objective,

        profiles:
            [...profiles].reverse(),

        candidateSet: {

            candidates:
                [...candidateSet.candidates].reverse(),

            errors:
                []

        }

    });


check(
    "CANDIDATE GRAPH IS DETERMINISTIC ACROSS INPUT ORDER",
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