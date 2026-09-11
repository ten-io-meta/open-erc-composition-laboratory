import {
    ScientificEvidenceFeedbackEngine
} from "../laboratory/scientific-evidence-feedback/ScientificEvidenceFeedbackEngine.js";

import {
    ScientificKnowledgeEvidenceMatcherEngine
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatcherEngine.js";

import type {
    ScientificExecutionEvidenceResult
} from "../laboratory/scientific-execution-evidence/ScientificExecutionEvidenceResult.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ResearchTheoryResult
} from "../laboratory/theory-engine/ResearchTheoryResult.js";

import type {
    EvidenceGraphResult
} from "../laboratory/evidence-graph/EvidenceGraphResult.js";


function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {
        throw new Error(
            `FAIL: ${message}`
        );
    }

    console.log(
        `PASS: ${message}`
    );

}


const campaignId =
    "CONTROLLED-SOURCE-PROVENANCE-CAMPAIGN";


const sourceIds = [
    "GITHUB-TEST-0001",
    "GITHUB-TEN-IO-META-ERC8060-RESERVABLE"
];


const executionEvidence: ScientificExecutionEvidenceResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    evidence: [
        {

            evidenceId:
                "CONTROLLED-EVIDENCE-00001",

            campaignId,

            observationId:
                "CONTROLLED-OBSERVATION-00001",

            outcomeId:
                "CONTROLLED-OUTCOME-00001",

            executionPlanId:
                "CONTROLLED-PLAN-00001",

            executionTaskId:
                "CONTROLLED-TASK-00001",

            experimentId:
                "CONTROLLED-EXPERIMENT-00001",

            targetType:
                "THEORY_VALIDATION",

            targetId:
                "CONTROLLED-KNOWLEDGE-00001",

            sourceConclusionId:
                "CONTROLLED-CONCLUSION-00001",

            sourceIds:
                [...sourceIds],

            targetEvidenceIds:
                [
                    "CONTROLLED-EDGE-00001"
                ],

            stepId:
                "CONTROLLED-STEP-00001",

            stepType:
                "TEST_EXECUTION",

            repository:
                "ten-io-meta/erc8060-reservable",

            status:
                "SUPPORTING",

            statement:
                "Reservation appears to constrain accounting",

            sourceEvidence:
                [
                    "CONTROLLED-EVIDENCE-SOURCE"
                ],

            sourceObservations:
                [
                    "CONTROLLED-OBSERVATION-SOURCE"
                ],

            generatedAt:
                new Date().toISOString(),

            explanation:
                "Controlled source provenance propagation fixture."

        }
    ],

    statistics: {

        total: 1,

        supporting: 1,

        challenging: 0,

        inconclusive: 0

    },

    errors: []

};


const knowledgeEvolution: ScientificKnowledgeEvolutionResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    states: [
        {

            knowledgeId:
                "CONTROLLED-KNOWLEDGE-00001",

            sourceConclusionId:
                "CONTROLLED-CONCLUSION-00001",

            sourcePatternId:
                "CONTROLLED-PATTERN-00001",

            sourcePatternRelation:
                "RESERVATION:CONSTRAINS:ACCOUNTING",

            originTargetId:
                "CONTROLLED-TARGET-00001",

            statement:
                "Reservation appears to constrain accounting",

            status:
                "SUPPORTED",

            confidence:
                78,

            independentSources:
                1,

            campaignsObserved:
                1,

            consecutiveStableCampaigns:
                0,

            contradictionCount:
                0,

            supportingEvidenceIds:
                [],

            contradictoryEvidenceIds:
                [],

            supportingEvidenceIdentities:
                [],

            contradictoryEvidenceIdentities:
                [],

            supportingEvidenceRepositories:
                [],

            contradictoryEvidenceRepositories:
                [],

            validationStatus:
                "VALIDATED",

            maturityLevel:
                "GROWING",

            confidenceTrend:
                "STABLE",

            evolutionVelocity:
                0,

            confidenceHistory:
                [
                    78
                ],

            sourceHistory:
                [
                    1
                ],

            statusHistory:
                [
                    "SUPPORTED"
                ],

            trajectory:
                [],

            firstObservedAt:
                new Date().toISOString(),

            lastObservedAt:
                new Date().toISOString(),

            lastStatusChangeAt:
                new Date().toISOString(),

            lastPromotionAt:
                null,

            lastDegradationAt:
                null

        }
    ],

    evolutions: [],

    statistics: {

        totalStates: 1,

        newStates: 0,

        promoted: 0,

        degraded: 0,

        challenged: 0,

        rejected: 0,

        archived: 0,

        stabilized: 0,

        unchanged: 1

    },

    errors: []

};


const theories: ResearchTheoryResult = {

    generatedAt:
        new Date().toISOString(),

    theories: [],

    statistics: {

        total: 0,

        strong: 0,

        moderate: 0,

        weak: 0

    },

    errors: []

};


const evidenceGraph: EvidenceGraphResult = {

    generatedAt:
        new Date().toISOString(),

    nodes: [],

    edges: [],

    statistics: {

        totalNodes: 0,

        totalEdges: 0,

        sourceNodes: 0,

        claimNodes: 0,

        protocolNodes: 0,

        capabilityNodes: 0

    },

    errors: []

};


const feedbackResult =
    new ScientificEvidenceFeedbackEngine().build(
        campaignId,
        executionEvidence
    );


assert(
    feedbackResult.feedback.length === 1,
    "ONE FEEDBACK RECORD CREATED"
);


const feedback =
    feedbackResult.feedback[0];


assert(
    feedback.sourceIds.length === 2,
    "BOTH SOURCE IDS REACH FEEDBACK"
);


assert(
    feedback.sourceIds.includes(
        "GITHUB-TEST-0001"
    ),
    "FIRST SOURCE ID PRESERVED"
);


assert(
    feedback.sourceIds.includes(
        "GITHUB-TEN-IO-META-ERC8060-RESERVABLE"
    ),
    "SECOND SOURCE ID PRESERVED"
);


assert(
    feedback.repository ===
        "ten-io-meta/erc8060-reservable",
    "REPOSITORY PROVENANCE PRESERVED"
);


assert(
    feedback.sourceIds.length === 2 &&
    feedback.repository ===
        "ten-io-meta/erc8060-reservable",
    "MULTIPLE SOURCE IDS MAY COEXIST WITH ONE REPOSITORY"
);


const matchResult =
    new ScientificKnowledgeEvidenceMatcherEngine().build(
        campaignId,
        feedbackResult,
        knowledgeEvolution,
        theories,
        evidenceGraph
    );


assert(
    matchResult.matches.length === 1,
    "ONE KNOWLEDGE EVIDENCE MATCH CREATED"
);


const match =
    matchResult.matches[0];


assert(
    match.matchStatus === "MATCHED",
    "CONTROLLED EVIDENCE MATCHES KNOWLEDGE"
);


assert(
    match.matchMethod ===
        "SOURCE_CONCLUSION_ID",
    "MATCH USES DETERMINISTIC SOURCE CONCLUSION PROVENANCE"
);


assert(
    match.sourceIds.length === 2,
    "BOTH SOURCE IDS REACH KNOWLEDGE EVIDENCE MATCH"
);


assert(
    match.sourceIds[0] === sourceIds[0] &&
    match.sourceIds[1] === sourceIds[1],
    "SOURCE IDENTITY AND ORDER ARE PRESERVED"
);


assert(
    match.repository ===
        "ten-io-meta/erc8060-reservable",
    "EXECUTION REPOSITORY REACHES KNOWLEDGE EVIDENCE MATCH"
);


assert(
    knowledgeEvolution.states[0]
        .independentSources === 1,
    "TWO SOURCE IDS DO NOT AUTOMATICALLY BECOME TWO INDEPENDENT SOURCES"
);


assert(
    knowledgeEvolution.states[0]
        .confidence === 78,
    "SOURCE PROVENANCE DOES NOT AUTOMATICALLY CHANGE CONFIDENCE"
);


assert(
    knowledgeEvolution.states[0]
        .status === "SUPPORTED",
    "SOURCE PROVENANCE DOES NOT AUTOMATICALLY CHANGE STATUS"
);


console.log(
    "\nPHASE 10.2D CONTROLLED SOURCE PROVENANCE REGRESSION PASSED"
);