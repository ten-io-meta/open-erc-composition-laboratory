import {
    ScientificExecutionReferentialIntegrityEngine
} from "../laboratory/scientific-execution-referential-integrity/ScientificExecutionReferentialIntegrityEngine.js";

import type {
    ScientificExperimentQueueResult
} from "../laboratory/scientific-experiment-queue/ScientificExperimentQueueResult.js";

import type {
    ScientificExperimentExecutionResult
} from "../laboratory/scientific-experiment-execution/ScientificExperimentExecutionResult.js";

import type {
    ScientificExecutionPlanResult
} from "../laboratory/scientific-execution-plan/ScientificExecutionPlanResult.js";

import type {
    ScientificExecutionSpecificationResult
} from "../laboratory/scientific-execution-specification/ScientificExecutionSpecificationResult.js";

import type {
    ScientificRuntimeExecutionResult
} from "../laboratory/scientific-execution-runtime/ScientificRuntimeExecutionResult.js";

import type {
    ScientificExecutionOutcomeResult
} from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

import type {
    ScientificExecutionObservationResult
} from "../laboratory/scientific-execution-observation/ScientificExecutionObservationResult.js";

import type {
    ScientificExecutionEvidenceResult
} from "../laboratory/scientific-execution-evidence/ScientificExecutionEvidenceResult.js";


function assert(
    condition: unknown,
    message: string
): asserts condition {

    if (!condition) {
        throw new Error(message);
    }
}


const campaignId =
    "OECL-10.4G-CONTROLLED-CAMPAIGN";

const experimentId =
    "EXPERIMENT-00001";

const executionTaskId =
    "EXECUTION-TASK-00001";

const executionPlanId =
    "SCIENTIFIC-EXECUTION-PLAN-00001";

const stepId =
    `${executionTaskId}-01`;

const specificationId =
    "SCIENTIFIC-EXECUTION-SPECIFICATION-00001";

const runtimeExecutionId =
    "SCIENTIFIC-RUNTIME-EXECUTION-00001";

const outcomeId =
    "SCIENTIFIC-EXECUTION-OUTCOME-00001";

const observationId =
    "SCIENTIFIC-EXECUTION-OBSERVATION-00001";

const evidenceId =
    "SCIENTIFIC-EXECUTION-EVIDENCE-00001";


const selectedExecutableTarget = {

    repository:
        "ten-io-meta/erc8060-reservable",

    filePath:
        "test/ERC8060Reservable.t.sol",

    selector:
        "testReserveValue",

    type:
        "TEST" as const,

    framework:
        "FOUNDRY" as const
};


const scientificProvenance = {

    experimentId,

    targetId:
        "TARGET-00001",

    sourceConclusionId:
        "CONCLUSION-00001",

    sourceIds: [
        "GITHUB-TEN-IO-META-ERC8060-RESERVABLE"
    ],

    targetEvidenceIds: [
        "EVIDENCE-GRAPH-00001"
    ]
};


const experimentQueue: ScientificExperimentQueueResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    queue: [
        {
            queueItemId:
                "QUEUE-00001",

            origin:
                "AUTONOMOUS",

            experiment: {
                experimentId,

                title:
                    "Controlled experiment",

                objective:
                    "Verify referential integrity",

                targetType:
                    "THEORY_VALIDATION",

                targetId:
                    scientificProvenance.targetId,

                sourceConclusionId:
                    scientificProvenance.sourceConclusionId,

                sourceIds:
                    [...scientificProvenance.sourceIds],

                targetEvidenceIds:
                    [...scientificProvenance.targetEvidenceIds],

                hypothesis:
                    "Execution provenance remains traceable.",

                supportCondition:
                    "Controlled success",

                challengeCondition:
                    "Controlled failure",

                priority:
                    "HIGH",

                requiredEvidence: [],

                recommendedRepositories: [
                    selectedExecutableTarget.repository
                ],

                variables: {
                    independent: [],
                    dependent: [],
                    controlled: []
                },

                procedure: [
                    "Execute controlled test"
                ],

                successCriteria: [
                    "Controlled success"
                ],

                failureCriteria: [
                    "Controlled failure"
                ],

                expectedOutcome:
                    "Controlled success",

                estimatedKnowledgeGain:
                    1
            },

            priorityScore:
                1,

            knowledgeGainScore:
                1,

            queueScore:
                1
        }
    ],

    statistics: {} as
        ScientificExperimentQueueResult["statistics"],

    errors: []
};


const execution: ScientificExperimentExecutionResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    tasks: [
        {
            executionTaskId,

            queueItemId:
                "QUEUE-00001",

            ...scientificProvenance,

            origin:
                "AUTONOMOUS",

            targetType:
                "THEORY_VALIDATION",

            sourcePatternRelation:
                "requires",

            title:
                "Controlled execution integrity task",

            objective:
                "Verify execution referential integrity",

            hypothesis:
                "Execution provenance remains traceable.",

            supportCondition:
                "Controlled success",

            challengeCondition:
                "Controlled failure",

            priority:
                "HIGH",

            queueScore:
                1,

            recommendedRepositories: [
                selectedExecutableTarget.repository
            ],

            procedure: [
                "Execute controlled test"
            ],

            successCriteria: [
                "Controlled success"
            ],

            failureCriteria: [
                "Controlled failure"
            ],

            executionStatus:
                "READY",

            blockReasons: [],

            explanation:
                "Controlled 10.4G regression fixture."
        }
    ],

    statistics: {} as
        ScientificExperimentExecutionResult["statistics"],

    errors: []
};


const plans: ScientificExecutionPlanResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    plans: [
        {
            executionPlanId,

            executionTaskId,

            ...scientificProvenance,

            targetType:
                "THEORY_VALIDATION",

            sourcePatternRelation:
                "requires",

            supportCondition:
                "Controlled success",

            challengeCondition:
                "Controlled failure",

            successCriteria: [
                "Controlled success"
            ],

            failureCriteria: [
                "Controlled failure"
            ],

            origin:
                "AUTONOMOUS",

            priority:
                "HIGH",

            queueScore:
                1,

            steps: [
                {
                    stepId,

                    order:
                        1,

                    stepType:
                        "TEST_EXECUTION",

                    title:
                        "Controlled test execution",

                    objective:
                        "Execute controlled test",

                    tools: [
                        "Foundry"
                    ],

                    requiredInputs: [],

                    expectedOutputs: [
                        "Test result"
                    ],

                    status:
                        "READY"
                }
            ],

            totalSteps:
                1,

            readySteps:
                1,

            blockedSteps:
                0,

            executionReady:
                true,

            explanation:
                "Controlled execution plan."
        }
    ],

    statistics: {} as
        ScientificExecutionPlanResult["statistics"],

    errors: []
};


const specifications: ScientificExecutionSpecificationResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    specifications: [
        {
            specificationId,

            experimentId,

            executionTaskId,

            executionPlanId,

            stepId,

            specificationType:
                "TEST_EXECUTION",

            repository:
                selectedExecutableTarget.repository,

            selectedExecutableTarget,

            workingDirectory:
                ".",

            command:
                "forge test",

            testSelector:
                selectedExecutableTarget.selector,

            invariantSelector:
                null,

            supportCondition:
                "Controlled success",

            challengeCondition:
                "Controlled failure",

            scientificPolarity:
                "SUPPORT",

            expectedExitCode:
                0,

            resolutionStatus:
                "EXECUTABLE",

            unresolvedReasons: [],

            successCriteria: [
                "Controlled success"
            ],

            failureCriteria: [
                "Controlled failure"
            ],

            generatedAt:
                new Date().toISOString()
        }
    ],

    statistics: {} as
        ScientificExecutionSpecificationResult["statistics"],

    errors: []
};


const runtime: ScientificRuntimeExecutionResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    executions: [
        {
            runtimeExecutionId,

            executionPlanId,

            executionTaskId,

            ...scientificProvenance,

            stepId,

            stepType:
                "TEST_EXECUTION",

            status:
                "SUCCESS",

            runtime:
                "OECL_CONTROLLED_RUNTIME",

            repository:
                selectedExecutableTarget.repository,

            selectedExecutableTarget,

            startedAt:
                new Date().toISOString(),

            finishedAt:
                new Date().toISOString(),

            evidence: [
                "CONTROLLED_RUNTIME_SUCCESS"
            ],

            observations: [
                "Controlled runtime completed."
            ],

            errors: [],

            explanation:
                "Controlled successful runtime execution."
        }
    ],

    statistics: {} as
        ScientificRuntimeExecutionResult["statistics"],

    errors: []
};


const outcomes: ScientificExecutionOutcomeResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    outcomes: [
        {
            outcomeId,

            executionPlanId,

            executionTaskId,

            ...scientificProvenance,

            targetType:
                "THEORY_VALIDATION",

            successCriteria: [
                "Controlled success"
            ],

            failureCriteria: [
                "Controlled failure"
            ],

            stepId,

            stepType:
                "TEST_EXECUTION",

            repository:
                selectedExecutableTarget.repository,

            selectedExecutableTarget,

            status:
                "SUCCESS",

            scientificResult:
                "SUPPORTS",

            executedAt:
                new Date().toISOString(),

            evidence: [
                "CONTROLLED_RUNTIME_SUCCESS"
            ],

            observations: [
                "Controlled outcome."
            ],

            errors: [],

            explanation:
                "Controlled successful outcome."
        }
    ],

    statistics: {} as
        ScientificExecutionOutcomeResult["statistics"],

    errors: []
};


const observations: ScientificExecutionObservationResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    observations: [
        {
            observationId,

            outcomeId,

            executionPlanId,

            executionTaskId,

            ...scientificProvenance,

            targetType:
                "THEORY_VALIDATION",

            stepId,

            stepType:
                "TEST_EXECUTION",

            repository:
                selectedExecutableTarget.repository,

            selectedExecutableTarget,

            status:
                "SUPPORTED",

            statement:
                "Controlled execution supports the hypothesis.",

            evidence: [
                "CONTROLLED_RUNTIME_SUCCESS"
            ],

            observations: [
                "Controlled observation."
            ],

            generatedAt:
                new Date().toISOString(),

            explanation:
                "Controlled observation derived from outcome."
        }
    ],

    statistics: {} as
        ScientificExecutionObservationResult["statistics"],

    errors: []
};


const evidence: ScientificExecutionEvidenceResult = {

    generatedAt:
        new Date().toISOString(),

    campaignId,

    evidence: [
        {
            evidenceId,

            campaignId,

            observationId,

            outcomeId,

            executionPlanId,

            executionTaskId,

            ...scientificProvenance,

            targetType:
                "THEORY_VALIDATION",

            stepId,

            stepType:
                "TEST_EXECUTION",

            repository:
                selectedExecutableTarget.repository,

            selectedExecutableTarget,

            status:
                "SUPPORTING",

            statement:
                "Controlled execution evidence.",

            sourceEvidence: [
                "CONTROLLED_RUNTIME_SUCCESS"
            ],

            sourceObservations: [
                "Controlled observation."
            ],

            generatedAt:
                new Date().toISOString(),

            explanation:
                "Controlled execution evidence generated from observation."
        }
    ],

    statistics: {} as
        ScientificExecutionEvidenceResult["statistics"],

    errors: []
};


const engine =
    new ScientificExecutionReferentialIntegrityEngine();


/*
 * CASE 1
 * Clean control.
 */

const clean =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        plans,
        specifications,
        runtime,
        outcomes,
        observations,
        evidence
    );

assert(
    clean.valid === true,
    `Clean control unexpectedly invalid: ${JSON.stringify(clean.issues, null, 2)}`
);

assert(
    clean.issues.length === 0,
    "Clean control produced integrity issues."
);

console.log(
    "PASS 1 — clean execution provenance accepted"
);


/*
 * CASE 2
 * Deliberately break Evidence -> Observation.
 */

const brokenEvidenceReference:
    ScientificExecutionEvidenceResult =
        structuredClone(
            evidence
        );

brokenEvidenceReference
    .evidence[0]
    .observationId =
        "MISSING-OBSERVATION";


const brokenReference =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        plans,
        specifications,
        runtime,
        outcomes,
        observations,
        brokenEvidenceReference
    );


assert(
    brokenReference.valid === false,
    "Broken observation reference was not detected."
);

assert(
    brokenReference.issues.some(
        issue =>
            issue.status ===
            "BROKEN_EVIDENCE_OBSERVATION_REFERENCE"
    ),
    "Expected BROKEN_EVIDENCE_OBSERVATION_REFERENCE."
);

console.log(
    "PASS 2 — broken Evidence -> Observation detected"
);


/*
 * CASE 3
 * Preserve references but mutate physical executable provenance.
 */

const brokenTargetProvenance:
    ScientificExecutionEvidenceResult =
        structuredClone(
            evidence
        );

brokenTargetProvenance
    .evidence[0]
    .selectedExecutableTarget = {
        ...selectedExecutableTarget,
        selector:
            "differentSelector"
    };


const brokenTarget =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        plans,
        specifications,
        runtime,
        outcomes,
        observations,
        brokenTargetProvenance
    );


assert(
    brokenTarget.valid === false,
    "Executable target provenance corruption was not detected."
);

assert(
    brokenTarget.issues.some(
        issue =>
            issue.status ===
            "EXECUTABLE_TARGET_PROVENANCE_MISMATCH"
    ),
    "Expected EXECUTABLE_TARGET_PROVENANCE_MISMATCH."
);

console.log(
    "PASS 3 — executable target provenance mutation detected"
);



/*
 * CASE 4
 * Specification references a valid plan but a valid step
 * owned by another valid plan.
 */
const lineagePlans:
    ScientificExecutionPlanResult =
        structuredClone(plans);

const secondPlan =
    structuredClone(
        lineagePlans.plans[0]
    );

secondPlan.executionPlanId =
    "SCIENTIFIC-EXECUTION-PLAN-00002";

secondPlan.steps[0].stepId =
    "EXECUTION-TASK-00001-02";

lineagePlans.plans.push(
    secondPlan
);

const brokenSpecificationLineage:
    ScientificExecutionSpecificationResult =
        structuredClone(specifications);

brokenSpecificationLineage
    .specifications[0]
    .stepId =
        secondPlan.steps[0].stepId;

const specificationLineageResult =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        lineagePlans,
        brokenSpecificationLineage,
        runtime,
        outcomes,
        observations,
        evidence
    );

assert(
    specificationLineageResult.issues.some(
        issue =>
            issue.status ===
            "SPECIFICATION_LINEAGE_MISMATCH"
    ),
    "Expected SPECIFICATION_LINEAGE_MISMATCH."
);

console.log(
    "PASS 4 — cross-plan Specification lineage detected"
);


/*
 * CASE 5
 * Runtime uses a valid step owned by another valid plan
 * while retaining the original plan reference.
 */
const brokenRuntimeLineage:
    ScientificRuntimeExecutionResult =
        structuredClone(runtime);

brokenRuntimeLineage
    .executions[0]
    .stepId =
        secondPlan.steps[0].stepId;

const runtimeLineageResult =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        lineagePlans,
        specifications,
        brokenRuntimeLineage,
        outcomes,
        observations,
        evidence
    );

assert(
    runtimeLineageResult.issues.some(
        issue =>
            issue.status ===
            "RUNTIME_LINEAGE_MISMATCH"
    ),
    "Expected RUNTIME_LINEAGE_MISMATCH."
);

console.log(
    "PASS 5 — cross-plan Runtime lineage detected"
);


/*
 * CASE 6
 * Outcome uses a valid step owned by another valid plan
 * while retaining the original plan reference.
 */
const brokenOutcomeLineage:
    ScientificExecutionOutcomeResult =
        structuredClone(outcomes);

brokenOutcomeLineage
    .outcomes[0]
    .stepId =
        secondPlan.steps[0].stepId;

const outcomeLineageResult =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        lineagePlans,
        specifications,
        runtime,
        brokenOutcomeLineage,
        observations,
        evidence
    );

assert(
    outcomeLineageResult.issues.some(
        issue =>
            issue.status ===
            "OUTCOME_LINEAGE_MISMATCH"
    ),
    "Expected OUTCOME_LINEAGE_MISMATCH."
);

console.log(
    "PASS 6 — cross-plan Outcome lineage detected"
);


/*
 * CASE 7
 * Mutate physical target at Runtime while keeping
 * Specification references intact.
 */
const brokenRuntimeTarget:
    ScientificRuntimeExecutionResult =
        structuredClone(runtime);

brokenRuntimeTarget
    .executions[0]
    .selectedExecutableTarget = {
        ...selectedExecutableTarget,
        selector:
            "runtimeDifferentSelector"
    };

const runtimeTargetResult =
    engine.build(
        campaignId,
        experimentQueue,
        execution,
        plans,
        specifications,
        brokenRuntimeTarget,
        outcomes,
        observations,
        evidence
    );

assert(
    runtimeTargetResult.issues.some(
        issue =>
            issue.status ===
            "EXECUTABLE_TARGET_PROVENANCE_MISMATCH" &&
            issue.entityType ===
            "RUNTIME"
    ),
    "Expected Runtime EXECUTABLE_TARGET_PROVENANCE_MISMATCH."
);

assert(
    runtimeTargetResult.issues.some(
        issue =>
            issue.status ===
            "EXECUTABLE_TARGET_PROVENANCE_MISMATCH" &&
            issue.entityType ===
            "OUTCOME"
    ),
    "Expected Runtime -> Outcome executable target mismatch."
);

console.log(
    "PASS 7 — Specification -> Runtime -> Outcome target drift detected"
);

console.log("");
console.log(
    "PASS — scientific execution referential integrity regression"
);


