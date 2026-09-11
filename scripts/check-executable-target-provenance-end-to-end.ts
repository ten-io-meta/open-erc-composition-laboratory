import assert from "node:assert/strict";

import { ScientificExecutionSpecificationEngine }
from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationEngine.js";

import { ScientificRuntimeOutcomeAdapter }
from "../laboratory/scientific-runtime-outcome-adapter/ScientificRuntimeOutcomeAdapter.js";

import { ScientificExecutionObservationEngine }
from "../laboratory/scientific-execution-observation/ScientificExecutionObservationEngine.js";

import { ScientificExecutionEvidenceEngine }
from "../laboratory/scientific-execution-evidence/ScientificExecutionEvidenceEngine.js";

import type { ScientificExecutableTargetIdentity }
from "../laboratory/scientific-execution-target-resolution/ScientificExecutableTargetIdentity.js";

import type { ScientificExecutionTargetResolutionResult }
from "../laboratory/scientific-execution-target-resolution/ScientificExecutionTargetResolutionResult.js";

import type { ScientificExecutionPlanResult }
from "../laboratory/scientific-execution-plan/ScientificExecutionPlanResult.js";

import type { ScientificExecutionOutcomeResult }
from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type { ScientificRuntimeExecutionResult }
from "../laboratory/scientific-execution-runtime/ScientificRuntimeExecutionResult.js";


const campaignId =
    "CONTROLLED-EXECUTABLE-TARGET-PROVENANCE";

const repositoryA =
    "controlled/repository-a";

const repositoryB =
    "controlled/repository-b";

const selectedTarget:
    ScientificExecutableTargetIdentity = {

        repository:
            repositoryA,

        filePath:
            "test/ReservationAccounting.t.sol",

        selector:
            "testReservationAccounting",

        type:
            "TEST",

        framework:
            "FOUNDRY"

    };


/*
 * The plan deliberately advertises repository B through the
 * legacy SOURCE_REINGESTION path.
 *
 * The resolved executable target belongs to repository A.
 *
 * Therefore this fixture specifically proves that the
 * structured resolved target is authoritative and prevents:
 *
 * repository B + selector from repository A
 */

const plans =
    {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        plans: [
            {

                executionPlanId:
                    "CONTROLLED-PLAN-00001",

                executionTaskId:
                    "CONTROLLED-TASK-00001",

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                targetType:
                    "VALIDATION",

                targetId:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                sourceConclusionId:
                    "CONTROLLED-CONCLUSION-00001",

                sourceIds:
                    [
                        "CONTROLLED-SOURCE-00001"
                    ],

                targetEvidenceIds:
                    [
                        "CONTROLLED-GRAPH-EDGE-00001"
                    ],

                title:
                    "Controlled executable target provenance",

                objective:
                    "Verify executable target provenance",

                hypothesis:
                    "Reservation constrains accounting",

                procedure:
                    [
                        "Execute controlled test"
                    ],

                requiredEvidence:
                    [
                        "Controlled execution result"
                    ],

                successCriteria:
                    [
                        "Controlled test succeeds"
                    ],

                failureCriteria:
                    [
                        "Controlled test fails"
                    ],

                supportCondition:
                    "Controlled support condition",

                challengeCondition:
                    "Controlled challenge condition",

                scientificCriteria:
                    undefined,

                steps: [
                    {

                        stepId:
                            "CONTROLLED-STEP-SOURCE",

                        stepType:
                            "SOURCE_REINGESTION",

                        title:
                            "Controlled legacy repository candidate",

                        description:
                            "Deliberately points to repository B.",

                        requiredInputs:
                            [
                                repositoryB
                            ],

                        expectedOutputs:
                            [],

                        status:
                            "READY"

                    },
                    {

                        stepId:
                            "CONTROLLED-STEP-TEST",

                        stepType:
                            "TEST_EXECUTION",

                        title:
                            "Controlled executable test",

                        description:
                            "Execute the resolved target.",

                        requiredInputs:
                            [
                                "TEST:legacyWrongSelector"
                            ],

                        expectedOutputs:
                            [],

                        status:
                            "READY"

                    }

                ]

            }

        ],

        statistics: {
            total: 1,
            ready: 1,
            blocked: 0
        },

        errors: []

    } as unknown as ScientificExecutionPlanResult;


const targetResolution:
    ScientificExecutionTargetResolutionResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        resolutions: [
            {

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                executionTaskId:
                    "CONTROLLED-TASK-00001",

                targetType:
                    "VALIDATION",

                targetId:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                repository:
                    repositoryA,

                selectedExecutableTarget:
                    selectedTarget,

                executionKind:
                    "TEST",

                testSelector:
                    selectedTarget.selector,

                invariantSelector:
                    null,

                staticAnalysisSelector:
                    null,

                confidence:
                    100,

                resolutionStatus:
                    "RESOLVED",

                scientificPolarity:
                    "SUPPORT",

                polarityTrace:
                    null,

                polarityConfidence:
                    null,

                resolutionReasons: [
                    "Controlled executable target selected."
                ]

            }

        ],

        statistics: {
            total: 1,
            resolved: 1,
            unresolved: 0
        },

        errors: []

    } as unknown as ScientificExecutionTargetResolutionResult;


const specifications =
    new ScientificExecutionSpecificationEngine().build(
        campaignId,
        plans,
        targetResolution,
        {
            [repositoryA]:
                "FOUNDRY",

            [repositoryB]:
                "HARDHAT"
        },
        {
            [repositoryA]:
                ".",

            [repositoryB]:
                "."
        }
    );


const specification =
    specifications.specifications.find(
        item =>
            item.stepId ===
            "CONTROLLED-STEP-TEST"
    );

assert.ok(
    specification,
    "TEST_EXECUTION specification was not generated."
);

assert.equal(
    specification.resolutionStatus,
    "EXECUTABLE"
);

assert.equal(
    specification.repository,
    repositoryA,
    "Resolved target repository must override legacy repository B."
);

assert.deepEqual(
    specification.selectedExecutableTarget,
    selectedTarget
);

assert.equal(
    specification.testSelector,
    selectedTarget.selector
);

assert.notEqual(
    specification.repository,
    repositoryB
);


/*
 * Controlled typed runtime-equivalent execution.
 *
 * No external Forge/Hardhat process is required for this
 * provenance regression. The purpose here is to verify that
 * the exact physical target selected for execution survives
 * the post-specification scientific execution chain.
 */

const runtime:
    ScientificRuntimeExecutionResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        executions: [
            {

                runtimeExecutionId:
                    "CONTROLLED-RUNTIME-00001",

                executionPlanId:
                    "CONTROLLED-PLAN-00001",

                executionTaskId:
                    "CONTROLLED-TASK-00001",

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                targetId:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                sourceConclusionId:
                    "CONTROLLED-CONCLUSION-00001",

                sourceIds:
                    [
                        "CONTROLLED-SOURCE-00001"
                    ],

                targetEvidenceIds:
                    [
                        "CONTROLLED-GRAPH-EDGE-00001"
                    ],

                stepId:
                    "CONTROLLED-STEP-TEST",

                stepType:
                    "TEST_EXECUTION",

                status:
                    "SUCCESS",

                runtime:
                    "CONTROLLED_TYPED_RUNTIME_EQUIVALENT",

                repository:
                    specification.repository,

                selectedExecutableTarget:
                    specification.selectedExecutableTarget,

                startedAt:
                    new Date().toISOString(),

                finishedAt:
                    new Date().toISOString(),

                evidence: [
                    "Controlled execution succeeded."
                ],

                observations: [
                    "Executable target provenance preserved."
                ],

                errors: [],

                explanation:
                    "Controlled typed runtime-equivalent execution."

            }

        ],

        statistics: {
            total: 1,
            success: 1,
            failure: 0,
            inconclusive: 0,
            unsupported: 0,
            skipped: 0
        },

        errors: []

    } as unknown as ScientificRuntimeExecutionResult;


const initialOutcomes:
    ScientificExecutionOutcomeResult = {

        generatedAt:
            new Date().toISOString(),

        campaignId,

        outcomes: [
            {

                outcomeId:
                    "CONTROLLED-OUTCOME-00001",

                campaignId,

                executionPlanId:
                    "CONTROLLED-PLAN-00001",

                executionTaskId:
                    "CONTROLLED-TASK-00001",

                experimentId:
                    "CONTROLLED-EXPERIMENT-00001",

                targetType:
                    "VALIDATION",

                targetId:
                    "RESERVATION:CONSTRAINS:ACCOUNTING",

                sourceConclusionId:
                    "CONTROLLED-CONCLUSION-00001",

                sourceIds:
                    [
                        "CONTROLLED-SOURCE-00001"
                    ],

                targetEvidenceIds:
                    [
                        "CONTROLLED-GRAPH-EDGE-00001"
                    ],

                stepId:
                    "CONTROLLED-STEP-TEST",

                stepType:
                    "TEST_EXECUTION",

                repository:
                    null,

                selectedExecutableTarget:
                    null,

                status:
                    "NOT_EXECUTED",

                scientificResult:
                    "NOT_EVALUATED",

                executedAt:
                    null,

                evidence: [],

                observations: [],

                errors: [],

                successCriteria:
                    [
                        "Controlled test succeeds"
                    ],

                failureCriteria:
                    [
                        "Controlled test fails"
                    ],

                explanation:
                    "Controlled initial outcome."

            }

        ],

        statistics: {
            total: 1,
            notExecuted: 1,
            success: 0,
            failure: 0,
            inconclusive: 0,
            blocked: 0,
            executed: 0
        },

        errors: []

    } as unknown as ScientificExecutionOutcomeResult;


const adapted =
    new ScientificRuntimeOutcomeAdapter().build(
        campaignId,
        initialOutcomes,
        runtime
    );

const outcome =
    adapted.updatedOutcomes.outcomes[0];

assert.ok(
    outcome,
    "Runtime adapter produced no outcome."
);

assert.equal(
    outcome.repository,
    repositoryA
);

assert.deepEqual(
    outcome.selectedExecutableTarget,
    selectedTarget,
    "Runtime -> Outcome lost executable target provenance."
);


const observationResult =
    new ScientificExecutionObservationEngine().build(
        campaignId,
        adapted.updatedOutcomes
    );

const observation =
    observationResult.observations[0];

assert.ok(
    observation,
    "Outcome -> Observation produced no observation."
);

assert.equal(
    observation.repository,
    repositoryA
);

assert.deepEqual(
    observation.selectedExecutableTarget,
    selectedTarget,
    "Outcome -> Observation lost executable target provenance."
);


const evidenceResult =
    new ScientificExecutionEvidenceEngine().build(
        campaignId,
        observationResult
    );

const evidence =
    evidenceResult.evidence[0];

assert.ok(
    evidence,
    "Observation -> Evidence produced no evidence."
);

assert.equal(
    evidence.repository,
    repositoryA
);

assert.deepEqual(
    evidence.selectedExecutableTarget,
    selectedTarget,
    "Observation -> Evidence lost executable target provenance."
);


/*
 * Final anti-divergence assertions.
 */

const chain = [
    specification.selectedExecutableTarget,
    runtime.executions[0]
        ?.selectedExecutableTarget,
    outcome.selectedExecutableTarget,
    observation.selectedExecutableTarget,
    evidence.selectedExecutableTarget
];

for (
    const target
    of chain
) {

    assert.ok(
        target,
        "A provenance stage lost the executable target."
    );

    assert.equal(
        target.repository,
        repositoryA
    );

    assert.equal(
        target.filePath,
        "test/ReservationAccounting.t.sol"
    );

    assert.equal(
        target.selector,
        "testReservationAccounting"
    );

    assert.equal(
        target.type,
        "TEST"
    );

    assert.equal(
        target.framework,
        "FOUNDRY"
    );

}


console.log(
    "\nPASS — executable target provenance end-to-end"
);

console.log(
    "Repository:",
    evidence.selectedExecutableTarget?.repository
);

console.log(
    "File:",
    evidence.selectedExecutableTarget?.filePath
);

console.log(
    "Selector:",
    evidence.selectedExecutableTarget?.selector
);

console.log(
    "Type:",
    evidence.selectedExecutableTarget?.type
);

console.log(
    "Framework:",
    evidence.selectedExecutableTarget?.framework
);

console.log(
    "Legacy conflicting repository rejected:",
    repositoryB
);
