import {
    ScientificExecutionTargetResolverEngine
} from "../laboratory/scientific-execution-target-resolution/ScientificExecutionTargetResolverEngine.js";

import type {
    ScientificExecutionOutcomeResult
} from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import {
    ScientificExecutionResultEvaluatorEngine
} from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";

import {
    ScientificExecutionObservationEngine
} from "../laboratory/scientific-execution-observation/ScientificExecutionObservationEngine.js";

import {
    ScientificExecutionEvidenceEngine
} from "../laboratory/scientific-execution-evidence/ScientificExecutionEvidenceEngine.js";

import {
    ScientificEvidenceFeedbackEngine
} from "../laboratory/scientific-evidence-feedback/ScientificEvidenceFeedbackEngine.js";

import {
    ScientificKnowledgeEvidenceMatcherEngine
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatcherEngine.js";

import {
    ScientificEvidenceAssimilationEngine
} from "../laboratory/scientific-evidence-assimilation/ScientificEvidenceAssimilationEngine.js";

import type {
    ScientificKnowledgeEvolutionResult
} from "../laboratory/scientific-knowledge-evolution/ScientificKnowledgeEvolutionResult.js";

import type {
    ResearchTheoryResult
} from "../laboratory/theory-engine/ResearchTheoryResult.js";

import type {
    EvidenceGraphResult
} from "../laboratory/evidence-graph/EvidenceGraphResult.js";

/*
 * Controlled negative scientific fixture
 * --------------------------------------
 *
 * This fixture is intentionally synthetic.
 *
 * It does NOT represent evidence extracted from any
 * real repository and MUST NOT be interpreted as a
 * discovered repository contradiction.
 *
 * Its only purpose is to verify that OECL can carry a
 * scientifically classified CHALLENGE through the real
 * target-resolution and result-evaluation mechanisms.
 */


const campaignId =
    "CONTROLLED-CHALLENGE-CAMPAIGN";


const repository =
    "controlled/negative-fixture";


/*
 * The execution task describes a hypothetical relation:
 *
 * ACCESS:CONSTRAINS:TRANSFER
 *
 * The controlled executable target explicitly demonstrates
 * that access can be bypassed for a transfer.
 *
 * "bypass" is therefore directional CHALLENGE evidence for
 * CONSTRAINS.
 */


const execution =
    {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        tasks: [

            {

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                executionTaskId:
                    "CONTROLLED-EXECUTION-TASK-00001",

                targetType:
                    "TEST",

                targetId:
    "ACCESS-TRANSFER-BYPASS",

title:
    "Access transfer bypass",

objective:
    (
        "Determine whether access constraints " +
        "can be bypassed during transfer."
    ),

hypothesis:
    (
        "Access constrains transfer and a successful " +
        "bypass would challenge that relation."
    ),

recommendedRepositories: [
    repository
],

                supportCondition:
                    "",

                challengeCondition:
                    "",

                sourcePatternRelation:
                    "ACCESS:CONSTRAINS:TRANSFER"

            }

        ],

        statistics: {

            total:
                1

        },

        errors:
            []

    } as any;


/*
 * Synthetic repository intelligence.
 *
 * The target deliberately contains:
 *
 *   subject: ACCESS
 *   object: TRANSFER
 *   challenge cue: BYPASS
 *   executable assertion: expect(...)
 *
 * No real repository is involved.
 */


const repositoryIntelligence =
    {

        [repository]: {

            repository,

            executableTargets: [

                {

                    type:
                        "TEST",

                    filePath:
                        "controlled/access-transfer-bypass.test.ts",

                    selector:
                        "bypass access transfer",

                    framework:
                        "CONTROLLED",

                    semanticContext:
                        `
                            const accessGranted =
                                false;

                            const transferExecuted =
                                true;

                            const bypassSucceeded =
                                transferExecuted &&
                                !accessGranted;

                            expect(
                                bypassSucceeded
                            ).to.equal(
                                true
                            );
                        `

                }

            ]

        }

    } as any;


const resolver =
    new ScientificExecutionTargetResolverEngine();


const resolutionResult =
    resolver.build(
        campaignId,
        execution,
        repositoryIntelligence
    );


const resolution =
    resolutionResult.resolutions[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE RESOLUTION ==="
);

console.dir(
    resolution,
    {
        depth:
            null
    }
);


/*
 * Resolution assertions
 */


if (!resolution) {

    throw new Error(
        "Controlled fixture produced no target resolution."
    );

}


if (
    resolution.resolutionStatus !==
        "RESOLVED"
) {

    throw new Error(
        "Controlled fixture was not RESOLVED."
    );

}


if (
    resolution.scientificPolarity !==
        "CHALLENGE"
) {

    throw new Error(
        (
            "Expected controlled fixture polarity CHALLENGE, " +
            `received ${resolution.scientificPolarity}.`
        )
    );

}


if (
    !resolution.polarityTrace
) {

    throw new Error(
        "Controlled CHALLENGE has no polarity trace."
    );

}


if (
    resolution.polarityTrace.decisionSource !==
        "RELATION_EVIDENCE"
) {

    throw new Error(
        (
            "Expected RELATION_EVIDENCE decision source, " +
            `received ${resolution.polarityTrace.decisionSource}.`
        )
    );

}


if (
    resolution.polarityTrace.subjectMatched !==
        true
) {

    throw new Error(
        "Controlled CHALLENGE did not match relation subject."
    );

}


if (
    resolution.polarityTrace.objectMatched !==
        true
) {

    throw new Error(
        "Controlled CHALLENGE did not match relation object."
    );

}


if (
    resolution.polarityTrace.hasExecutableAssertion !==
        true
) {

    throw new Error(
        "Controlled CHALLENGE has no executable assertion."
    );

}


if (
    !resolution.polarityTrace.matchedChallengeCues.includes(
        "bypass"
    )
) {

    throw new Error(
        "Controlled CHALLENGE did not match the bypass cue."
    );

}


if (
    resolution.polarityTrace.matchedSupportCues.length !==
        0
) {

    throw new Error(
        (
            "Controlled CHALLENGE unexpectedly contains " +
            "active support cues."
        )
    );

}


if (
    resolution.polarityConfidence !==
        1
) {

    throw new Error(
        (
            "Expected controlled CHALLENGE polarity confidence 1, " +
            `received ${resolution.polarityConfidence}.`
        )
    );

}


/*
 * Runtime-equivalent outcome
 * --------------------------
 *
 * ScientificExecutionRuntimeEngine serializes resolved
 * specification polarity using:
 *
 * SCIENTIFIC_POLARITY:<value>
 *
 * We reproduce exactly that evidence contract here.
 *
 * This does NOT manually inject CHALLENGES.
 *
 * The evaluator must independently interpret
 * SCIENTIFIC_POLARITY:CHALLENGE.
 */


const outcomeResult:
    ScientificExecutionOutcomeResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        outcomes: [

            {

                outcomeId:
                    "CONTROLLED-OUTCOME-00001",

                executionPlanId:
                    "CONTROLLED-EXECUTION-PLAN-00001",

                executionTaskId:
                    "CONTROLLED-EXECUTION-TASK-00001",

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                targetType:
                    "TEST",

                targetId:
                    "ACCESS-TRANSFER-BYPASS",

                targetEvidenceIds:
                    [],

                successCriteria:
                    [],

                failureCriteria:
                    [],

                stepId:
                    "CONTROLLED-STEP-00001",

                stepType:
                    "TEST_EXECUTION",

                status:
                    "SUCCESS",

                scientificResult:
                    "NOT_EVALUATED",

                executedAt:
                    new Date().toISOString(),

                evidence: [

                    `REPOSITORY:${repository}`,

                    `SCIENTIFIC_POLARITY:${resolution.scientificPolarity}`

                ],

                observations: [
                    "Controlled executable test completed successfully."
                ],

                errors:
                    [],

                explanation:
                    (
                        "Controlled runtime-equivalent execution outcome " +
                        "constructed to validate scientific CHALLENGE propagation."
                    )

            }

        ],

        statistics: {

            total:
                1,

            notExecuted:
                0,

            success:
                1,

            failure:
                0,

            inconclusive:
                0,

            blocked:
                0,

            executed:
                1

        },

        errors:
            []

    };


const evaluator =
    new ScientificExecutionResultEvaluatorEngine();


const evaluationResult =
    evaluator.build(
        campaignId,
        outcomeResult
    );


const evaluation =
    evaluationResult.evaluations[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE EVALUATION ==="
);

console.dir(
    evaluation,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE STATISTICS ==="
);

console.dir(
    evaluationResult.statistics,
    {
        depth:
            null
    }
);


/*
 * Evaluation assertions
 */


if (!evaluation) {

    throw new Error(
        "Controlled fixture produced no scientific evaluation."
    );

}


if (
    evaluation.scientificResult !==
        "CHALLENGES"
) {

    throw new Error(
        (
            "Expected evaluator result CHALLENGES, " +
            `received ${evaluation.scientificResult}.`
        )
    );

}


if (
    evaluationResult.statistics.challenges !==
        1
) {

    throw new Error(
        (
            "Expected exactly one CHALLENGES evaluation, " +
            `received ${evaluationResult.statistics.challenges}.`
        )
    );

}


if (
    evaluationResult.statistics.supports !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${evaluationResult.statistics.supports} SUPPORTS result(s).`
        )
    );

}


if (
    evaluationResult.statistics.inconclusive !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${evaluationResult.statistics.inconclusive} ` +
            "INCONCLUSIVE result(s)."
        )
    );

}


console.log(
    ""
);

console.log(
    "CONTROLLED CHALLENGE PROPAGATION: PASS"
);

console.log(
    (
        "RESOLVED -> CHALLENGE -> " +
        "SCIENTIFIC_POLARITY:CHALLENGE -> CHALLENGES"
    )
);

console.log(
    ""
);

console.log(
    (
        "NOTE: This is a synthetic controlled negative fixture. " +
        "It is not repository-derived evidence."
    )
);
/*
 * Scientific execution observation propagation
 * --------------------------------------------
 *
 * The evaluator returns updated outcomes carrying the
 * derived scientificResult.
 *
 * The real observation engine must therefore translate:
 *
 * CHALLENGES -> CHALLENGED
 */


const observationEngine =
    new ScientificExecutionObservationEngine();


const observationResult =
    observationEngine.build(
        campaignId,
        evaluationResult.updatedOutcomes
    );


const observation =
    observationResult.observations[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE OBSERVATION ==="
);

console.dir(
    observation,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE OBSERVATION STATISTICS ==="
);

console.dir(
    observationResult.statistics,
    {
        depth:
            null
    }
);


if (!observation) {

    throw new Error(
        "Controlled fixture produced no scientific observation."
    );

}


if (
    observation.status !==
        "CHALLENGED"
) {

    throw new Error(
        (
            "Expected observation status CHALLENGED, " +
            `received ${observation.status}.`
        )
    );

}


if (
    observationResult.statistics.challenged !==
        1
) {

    throw new Error(
        (
            "Expected exactly one CHALLENGED observation, " +
            `received ${observationResult.statistics.challenged}.`
        )
    );

}


if (
    observationResult.statistics.supported !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${observationResult.statistics.supported} ` +
            "SUPPORTED observation(s)."
        )
    );

}


if (
    observationResult.statistics.inconclusive !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${observationResult.statistics.inconclusive} ` +
            "INCONCLUSIVE observation(s)."
        )
    );

}


console.log(
    ""
);

console.log(
    "CONTROLLED CHALLENGE OBSERVATION PROPAGATION: PASS"
);

console.log(
    (
        "RESOLVED -> CHALLENGE -> " +
        "SCIENTIFIC_POLARITY:CHALLENGE -> " +
        "CHALLENGES -> CHALLENGED"
    )
);/*
 * Scientific execution evidence propagation
 * -----------------------------------------
 *
 * The real evidence engine consumes the complete
 * ScientificExecutionObservationResult.
 *
 * It must translate:
 *
 * CHALLENGED -> CHALLENGING
 */


const evidenceEngine =
    new ScientificExecutionEvidenceEngine();


const evidenceResult =
    evidenceEngine.build(
        campaignId,
        observationResult
    );


const scientificEvidence =
    evidenceResult.evidence[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE EVIDENCE ==="
);

console.dir(
    scientificEvidence,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE EVIDENCE STATISTICS ==="
);

console.dir(
    evidenceResult.statistics,
    {
        depth:
            null
    }
);


if (!scientificEvidence) {

    throw new Error(
        "Controlled fixture produced no scientific execution evidence."
    );

}


if (
    scientificEvidence.status !==
        "CHALLENGING"
) {

    throw new Error(
        (
            "Expected execution evidence status CHALLENGING, " +
            `received ${scientificEvidence.status}.`
        )
    );

}


if (
    evidenceResult.statistics.challenging !==
        1
) {

    throw new Error(
        (
            "Expected exactly one CHALLENGING evidence item, " +
            `received ${evidenceResult.statistics.challenging}.`
        )
    );

}


if (
    evidenceResult.statistics.supporting !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${evidenceResult.statistics.supporting} ` +
            "SUPPORTING evidence item(s)."
        )
    );

}


if (
    evidenceResult.statistics.inconclusive !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${evidenceResult.statistics.inconclusive} ` +
            "INCONCLUSIVE evidence item(s)."
        )
    );

}


if (
    !scientificEvidence.sourceEvidence.includes(
        "SCIENTIFIC_POLARITY:CHALLENGE"
    )
) {

    throw new Error(
        (
            "Controlled CHALLENGING evidence lost the original " +
            "SCIENTIFIC_POLARITY:CHALLENGE provenance."
        )
    );

}


console.log(
    ""
);

console.log(
    "CONTROLLED CHALLENGE EVIDENCE PROPAGATION: PASS"
);

console.log(
    (
        "RESOLVED -> CHALLENGE -> " +
        "SCIENTIFIC_POLARITY:CHALLENGE -> " +
        "CHALLENGES -> CHALLENGED -> CHALLENGING"
    )
);/*
 * Scientific evidence feedback propagation
 * ----------------------------------------
 *
 * The real feedback engine consumes the complete
 * ScientificExecutionEvidenceResult.
 *
 * It must translate:
 *
 * CHALLENGING -> CHALLENGE
 */


const feedbackEngine =
    new ScientificEvidenceFeedbackEngine();


const feedbackResult =
    feedbackEngine.build(
        campaignId,
        evidenceResult
    );


const scientificFeedback =
    feedbackResult.feedback[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE FEEDBACK ==="
);

console.dir(
    scientificFeedback,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE FEEDBACK STATISTICS ==="
);

console.dir(
    feedbackResult.statistics,
    {
        depth:
            null
    }
);


if (!scientificFeedback) {

    throw new Error(
        "Controlled fixture produced no scientific evidence feedback."
    );

}


if (
    scientificFeedback.action !==
        "CHALLENGE"
) {

    throw new Error(
        (
            "Expected scientific feedback action CHALLENGE, " +
            `received ${scientificFeedback.action}.`
        )
    );

}


if (
    feedbackResult.statistics.challenge !==
        1
) {

    throw new Error(
        (
            "Expected exactly one CHALLENGE feedback item, " +
            `received ${feedbackResult.statistics.challenge}.`
        )
    );

}


if (
    feedbackResult.statistics.strengthen !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${feedbackResult.statistics.strengthen} ` +
            "STRENGTHEN feedback item(s)."
        )
    );

}


if (
    feedbackResult.statistics.hold !==
        0
) {

    throw new Error(
        (
            "Controlled negative fixture unexpectedly produced " +
            `${feedbackResult.statistics.hold} ` +
            "HOLD feedback item(s)."
        )
    );

}


if (
    scientificFeedback.evidenceId !==
        scientificEvidence.evidenceId
) {

    throw new Error(
        "Scientific feedback lost execution evidence provenance."
    );

}


if (
    !scientificFeedback.sourceEvidence.includes(
        "SCIENTIFIC_POLARITY:CHALLENGE"
    )
) {

    throw new Error(
        (
            "Scientific CHALLENGE feedback lost the original " +
            "SCIENTIFIC_POLARITY:CHALLENGE provenance."
        )
    );

}


console.log(
    ""
);

console.log(
    "CONTROLLED CHALLENGE FEEDBACK PROPAGATION: PASS"
);

console.log(
    (
        "RESOLVED -> CHALLENGE -> " +
        "SCIENTIFIC_POLARITY:CHALLENGE -> " +
        "CHALLENGES -> CHALLENGED -> " +
        "CHALLENGING -> CHALLENGE"
    )
);
/*
 * Controlled scientific knowledge target
 * --------------------------------------
 *
 * This fixture introduces one deterministic scientific
 * knowledge state whose knowledgeId matches the execution
 * feedback targetId.
 *
 * The purpose is not to fabricate repository evidence.
 * It is to verify the actual matcher + assimilation
 * contracts for challenging execution evidence.
 */


const controlledKnowledgeId =
    "ACCESS-TRANSFER-BYPASS";


const controlledKnowledgeEvolution:
    ScientificKnowledgeEvolutionResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        evolutions: [],

        states: [

            {

                knowledgeId:
                    controlledKnowledgeId,

                sourceConclusionId:
                    "CONTROLLED-CONCLUSION-00001",

                sourcePatternId:
                    "CONTROLLED-PATTERN-00001",

                sourcePatternRelation:
                    "ACCESS:CONSTRAINS:TRANSFER",

                originTargetId:
                    "CONTROLLED:ACCESS-TRANSFER-BYPASS",

                statement:
                    "Access constrains transfer.",

                status:
                    "SUPPORTED",

                confidence:
                    0.8,

                independentSources:
                    1,

                campaignsObserved:
                    1,

                consecutiveStableCampaigns:
                    1,

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

                validationStatus:
                    "VALIDATED",

                maturityLevel:
                    "EARLY",

                confidenceTrend:
                    "INSUFFICIENT_DATA",

                evolutionVelocity:
                    "INSUFFICIENT_DATA",

                confidenceHistory:
                    [
                        0.8
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
                    [
                        "Controlled knowledge state created for deterministic challenge-path validation."
                    ],

                firstObservedAt:
                    new Date().toISOString(),

                lastObservedAt:
                    new Date().toISOString(),

                lastStatusChangeAt:
                    null,

                lastPromotionAt:
                    null,

                lastDegradationAt:
                    null

            }

        ],

        statistics: {

            totalKnowledge:
                1,

            evolutions:
                0,

            discovered:
                0,

            promoted:
                0,

            degraded:
                0,

            stabilized:
                0,

            challenged:
                0,

            refuted:
                0,

            recovered:
                0,

            unchanged:
                1,

            archived:
                0,

            averageConfidence:
                0.8

        },

        errors:
            []

    };


const controlledTheories:
    ResearchTheoryResult = {

        generatedAt:
            new Date().toISOString(),

        theories:
            [],

        statistics: {

            theories:
                0,

            emerging:
                0,

            supported:
                0,

            established:
                0

        },

        errors:
            []

    };


const controlledEvidenceGraph:
    EvidenceGraphResult = {

        generatedAt:
            new Date().toISOString(),

        nodes:
            [],

        edges:
            [],

        statistics: {

            nodes:
                0,

            edges:
                0,

            protocols:
                0,

            capabilities:
                0,

            conclusions:
                0

        },

        errors:
            []

    };


const knowledgeEvidenceMatcher =
    new ScientificKnowledgeEvidenceMatcherEngine();


const knowledgeEvidenceMatches =
    knowledgeEvidenceMatcher.build(
        campaignId,
        feedbackResult,
        controlledKnowledgeEvolution,
        controlledTheories,
        controlledEvidenceGraph
    );


const knowledgeEvidenceMatch =
    knowledgeEvidenceMatches.matches[0];


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE KNOWLEDGE MATCH ==="
);

console.dir(
    knowledgeEvidenceMatch,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE KNOWLEDGE MATCH STATISTICS ==="
);

console.dir(
    knowledgeEvidenceMatches.statistics,
    {
        depth:
            null
    }
);


if (!knowledgeEvidenceMatch) {

    throw new Error(
        "Controlled CHALLENGE feedback produced no knowledge evidence match."
    );

}


if (
    knowledgeEvidenceMatch.matchStatus !==
        "MATCHED"
) {

    throw new Error(
        (
            "Expected deterministic knowledge match MATCHED, " +
            `received ${knowledgeEvidenceMatch.matchStatus}.`
        )
    );

}


if (
    knowledgeEvidenceMatch.matchMethod !==
        "EXPLICIT_KNOWLEDGE_ID"
) {

    throw new Error(
        (
            "Expected knowledge match method EXPLICIT_KNOWLEDGE_ID, " +
            `received ${knowledgeEvidenceMatch.matchMethod}.`
        )
    );

}


if (
    knowledgeEvidenceMatch.knowledgeId !==
        controlledKnowledgeId
) {

    throw new Error(
        (
            "Controlled CHALLENGE feedback matched the wrong " +
            `knowledge state: ${knowledgeEvidenceMatch.knowledgeId}.`
        )
    );

}


if (
    knowledgeEvidenceMatch.feedbackAction !==
        "CHALLENGE"
) {

    throw new Error(
        (
            "Expected matched feedback action CHALLENGE, " +
            `received ${knowledgeEvidenceMatch.feedbackAction}.`
        )
    );

}


if (
    knowledgeEvidenceMatches.statistics.challengeMatched !==
        1
) {

    throw new Error(
        (
            "Expected exactly one matched CHALLENGE, " +
            `received ${knowledgeEvidenceMatches.statistics.challengeMatched}.`
        )
    );

}


/*
 * Scientific evidence assimilation
 * --------------------------------
 *
 * MATCHED + CHALLENGE must register contradictory
 * execution evidence and increase contradictionCount.
 *
 * It must NOT independently recalculate confidence,
 * maturity or scientific status.
 */


const evidenceAssimilationEngine =
    new ScientificEvidenceAssimilationEngine();


const evidenceAssimilation =
    evidenceAssimilationEngine.build(
        campaignId,
        controlledKnowledgeEvolution,
        knowledgeEvidenceMatches
    );


const assimilation =
    evidenceAssimilation.assimilations[0];


const assimilatedKnowledgeState =
    evidenceAssimilation.states.find(
        state =>
            state.knowledgeId ===
            controlledKnowledgeId
    );


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE ASSIMILATION ==="
);

console.dir(
    assimilation,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE ASSIMILATED KNOWLEDGE STATE ==="
);

console.dir(
    assimilatedKnowledgeState,
    {
        depth:
            null
    }
);


console.log(
    ""
);

console.log(
    "=== CONTROLLED CHALLENGE ASSIMILATION STATISTICS ==="
);

console.dir(
    evidenceAssimilation.statistics,
    {
        depth:
            null
    }
);


if (!assimilation) {

    throw new Error(
        "Controlled knowledge match produced no assimilation result."
    );

}


if (!assimilation.assimilated) {

    throw new Error(
        "Controlled CHALLENGE evidence was not assimilated."
    );

}


if (
    assimilation.action !==
        "CHALLENGE"
) {

    throw new Error(
        (
            "Expected assimilation action CHALLENGE, " +
            `received ${assimilation.action}.`
        )
    );

}


if (!assimilatedKnowledgeState) {

    throw new Error(
        "Assimilation lost the controlled scientific knowledge state."
    );

}


if (
    assimilatedKnowledgeState.contradictionCount !==
        1
) {

    throw new Error(
        (
            "Expected contradictionCount to increase from 0 to 1, " +
            `received ${assimilatedKnowledgeState.contradictionCount}.`
        )
    );

}


if (
    !assimilatedKnowledgeState
        .contradictoryEvidenceIds
        .includes(
            scientificEvidence.evidenceId
        )
) {

    throw new Error(
        (
            "Assimilated knowledge state does not contain " +
            "the challenging execution evidence ID."
        )
    );

}


if (
    evidenceAssimilation.statistics
        .contradictoryEvidenceAdded !==
        1
) {

    throw new Error(
        (
            "Expected exactly one contradictory evidence addition, " +
            `received ${
                evidenceAssimilation.statistics
                    .contradictoryEvidenceAdded
            }.`
        )
    );

}


if (
    evidenceAssimilation.statistics.assimilated !==
        1
) {

    throw new Error(
        (
            "Expected exactly one successful assimilation, " +
            `received ${evidenceAssimilation.statistics.assimilated}.`
        )
    );

}


/*
 * Assimilation deliberately does not recalculate
 * confidence or scientific lifecycle status.
 */


if (
    assimilatedKnowledgeState.confidence !==
        0.8
) {

    throw new Error(
        "CHALLENGE assimilation unexpectedly changed scientific confidence."
    );

}


if (
    assimilatedKnowledgeState.status !==
        "SUPPORTED"
) {

    throw new Error(
        (
            "CHALLENGE assimilation unexpectedly changed " +
            `scientific status to ${assimilatedKnowledgeState.status}.`
        )
    );

}


console.log(
    ""
);

console.log(
    "CONTROLLED CHALLENGE KNOWLEDGE ASSIMILATION: PASS"
);

console.log(
    (
        "RESOLVED -> CHALLENGE -> " +
        "SCIENTIFIC_POLARITY:CHALLENGE -> " +
        "CHALLENGES -> CHALLENGED -> " +
        "CHALLENGING -> CHALLENGE -> " +
        "MATCHED -> EXPLICIT_KNOWLEDGE_ID -> " +
        "CONTRADICTORY_EVIDENCE -> CONTRADICTION_COUNT+1"
    )
);