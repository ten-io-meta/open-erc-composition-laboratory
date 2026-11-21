import assert from "node:assert/strict";
import { ScientificCompositionConstraintEvaluatorEngine } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import { ScientificExecutionResultEvaluatorEngine } from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";
import type { ScientificExecutionOutcome } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcome.js";
import type { ScientificExecutionOutcomeResult } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";
import type { ScientificCompositionConstraint } from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type { ScientificCompositionConstraintObservation } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";

/** Fake repositories and transactions are for gating regression ONLY. Not proof of ERC interoperability. */
const candidateId = "CANDIDATE-TEST-A-B";
const repoA = { participantSide: "A", participantKind: "PROTOCOL", participantId: "A", sourceId: "SOURCE-A", repository: "org/a", sourceRevision: "a".repeat(40) } as const;
const repoB = { participantSide: "B", participantKind: "PROTOCOL", participantId: "B", sourceId: "SOURCE-B", repository: "org/b", sourceRevision: "b".repeat(40) } as const;
const constraints: ScientificCompositionConstraint[] = [repoA, repoB].map(source => ({
    constraintId: source.participantSide + "-1",
    candidateId,
    participantSide: source.participantSide,
    participantKind: "PROTOCOL",
    participantId: source.participantId,
    sourceId: source.sourceId,
    sourceRevision: source.sourceRevision,
    basis: "SOLIDITY_REQUIRE_STATEMENT",
    factId: "FACT-" + source.participantSide,
    containerKind: "CONTRACT",
    containerSymbol: "TestContract",
    locator: { sourceLocation: "test", filePath: "Test.sol", startLine: 2, endLine: 2 },
    rawText: "require(approved, 'rejected');"
}));
const workspaceSources = [repoA, repoB].map(source => ({
    ...source,
    requiredRevision: source.sourceRevision,
    observedRevision: source.sourceRevision,
    localPath: "/tmp/contract-" + source.participantSide,
    worktreeClean: true as const
}));

function buildOutcome(polarity: "SUPPORT" | "CHALLENGE" = "SUPPORT"): ScientificExecutionOutcome {
    const observations: ScientificCompositionConstraintObservation[] = constraints.map(c => ({
        observationId: "OBS-" + c.constraintId,
        candidateId, constraintId: c.constraintId, participantSide: c.participantSide,
        verdict: polarity === "CHALLENGE" && c.participantSide === "B" ? "VIOLATED" : "PRESERVED",
        evidence: ["runtime-assertion:" + c.constraintId, "tx:0x" + "1".repeat(64)]
    }));
    const evaluated = new ScientificCompositionConstraintEvaluatorEngine().evaluate(constraints, observations);
    const candidate = {
        candidateId, participantA: {kind:"PROTOCOL",id:"A"}, participantB: {kind:"PROTOCOL",id:"B"},
        mechanism:"SHARED_RECURRENT_CONCEPT", conceptId:"SYNTHETIC-COMMON-CASE",
        supportingCapabilityIdsA:["A-CAP"],supportingCapabilityIdsB:["B-CAP"],
        provenance:[
            {kind:"PROTOCOL_CONCEPT",sourceId:repoA.sourceId,sourceRevision:repoA.sourceRevision,evidenceId:"DISCOVERY-A"},
            {kind:"PROTOCOL_CONCEPT",sourceId:repoB.sourceId,sourceRevision:repoB.sourceRevision,evidenceId:"DISCOVERY-B"}
        ],
        evaluationStatus:"UNEVALUATED"
    };
    const spec = {
        specificationId:"SPEC-1",candidateId,mechanism:candidate.mechanism,candidateSnapshot:candidate,
        status:"READY",sourceIds:[repoA.sourceId,repoB.sourceId],targetEvidenceIds:["DISCOVERY-A","DISCOVERY-B"],
        constraints,participantAConstraintIds:["A-1"],participantBConstraintIds:["B-1"],
        unresolvedGuardFactIds:[],
        scientificCriteria:{
            relation:"PRESERVES_OBSERVED_CONSTRAINTS",
            support:{expectedPolarity:"SUPPORT",condition:"ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"},
            challenge:{expectedPolarity:"CHALLENGE",condition:"ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"},
            inconclusive:{whenNoScientificPolarity:true}
        }
    };
    const requirement = {
        requirementId: "REQ-1",
        evaluationSpecificationId: "SPEC-1",
        candidate,
        constraints, participantAConstraintIds: ["A-1"], participantBConstraintIds: ["B-1"],
        unresolvedGuardFactIds: [], participantSources: [repoA, repoB]
    };
    const joint = {
        runtime: "OECL_NATIVE_COMPOSITION_JOINT_CONTRACT_EXECUTION",
        compositionExecutionRequirement: requirement,
        compositionWorkspaceMaterialization: {
            status: "MATERIALIZED", requirementId: requirement.requirementId, candidateId,
            workspacePath: "/tmp/test", sourceMaterializations: workspaceSources, errors: []
        },
        compositionRecipeSelection: {
            status: "SELECTED",
            selectedRegistrationId: "R-1",
            evaluationSurfaceCompleteness: "COMPLETE_FOR_CANDIDATE_EVALUATION",
            matchingRegistrationIds: ["R-1"], reasons: []
        },
        jointContractHarnessExecution: {
            status: "EXECUTED", recipeId: "RECIPE-1", errors: [],
            participantSources: workspaceSources,
            driverReport: {
                sharedRuntime: true, scientificPolarity: "NEUTRAL",
                participantA: { executed: true, transactionHashes: ["0x" + "1".repeat(64)], contractAddresses: ["0x" + "2".repeat(40)] },
                participantB: { executed: true, transactionHashes: ["0x" + "1".repeat(64)], contractAddresses: ["0x" + "3".repeat(40)] },
                constraintObservations: observations
            }
        },
        compositionConstraintEvaluation: evaluated
    };
    return {
        outcomeId:"OUT-1", executionPlanId:"PLAN-1", executionTaskId:"TASK-1",
        experimentId:"EXP-1", targetType:"COMPOSITION_CANDIDATE", targetId:candidateId,
        sourceIds:[], targetEvidenceIds:[], successCriteria:[], failureCriteria:[],
        stepId:"STEP-1", stepType:"COMPOSITION_EXECUTION", repository:null,
        selectedExecutableTarget:null, status:"INCONCLUSIVE", scientificResult:"INCONCLUSIVE",
        executedAt:null, evidence:[], observations:[], errors:[], explanation:"",
        jointCompositionEvidence: joint,
        discoveredCandidateEvidence: {discovery:{candidates:[candidate],errors:[]},specifications:{specifications:[spec],errors:[]}}
    } as unknown as ScientificExecutionOutcome;
}

function evaluated(input: ScientificExecutionOutcome): string {
    const result = new ScientificExecutionResultEvaluatorEngine().build("GATE-TEST", {
        generatedAt:"", campaignId:"GATE-TEST", outcomes:[input],
        statistics:{} as ScientificExecutionOutcomeResult["statistics"], errors:[]
    });
    assert.deepEqual(result.errors, []);
    return result.updatedOutcomes.outcomes[0].scientificResult;
}
let pass = 0;
function check(label: string, input: ScientificExecutionOutcome, expected: string) {
    assert.equal(evaluated(input), expected, label);
    console.log("PASS: " + label);
    pass++;
}
check("complete two-source joint evidence", buildOutcome(), "SUPPORTS");
check("actual sourced constraint violation", buildOutcome("CHALLENGE"), "CHALLENGES");
const undiscovered = buildOutcome();
undiscovered.discoveredCandidateEvidence = undefined;
check("successful joint execution without discovery stays inconclusive",undiscovered,"INCONCLUSIVE");
const fakeDiscovery = buildOutcome();
fakeDiscovery.discoveredCandidateEvidence!.discovery.candidates[0].provenance=[];
check("unproven discovery provenance stays inconclusive",fakeDiscovery,"INCONCLUSIVE");
const a = buildOutcome();
a.jointCompositionEvidence!.compositionExecutionRequirement!.participantSources[1].sourceRevision = "0".repeat(40);
check("changed source revision cannot support", a, "INCONCLUSIVE");
const b = buildOutcome();
b.jointCompositionEvidence!.jointContractHarnessExecution!.driverReport!.constraintObservations!.pop();
check("partial observations cannot support", b, "INCONCLUSIVE");
const c = buildOutcome();
c.jointCompositionEvidence!.compositionConstraintEvaluation!.evaluations[1].status = "PRESERVED";
check("tampered evaluator result cannot support", c, "INCONCLUSIVE");
const d = buildOutcome();
d.jointCompositionEvidence!.jointContractHarnessExecution!.participantSources[1].observedRevision = "0".repeat(40);
check("mismatched executed source cannot support", d, "INCONCLUSIVE");
const e = buildOutcome();
e.jointCompositionEvidence!.compositionExecutionRequirement!.participantBConstraintIds = [];
check("missing B constraints cannot support", e, "INCONCLUSIVE");
const f = buildOutcome();
f.jointCompositionEvidence = undefined;
check("unattributed JSON is not native joint execution", f, "INCONCLUSIVE");
const g = buildOutcome();
g.jointCompositionEvidence!.compositionRecipeSelection!.matchingRegistrationIds.push("OTHER");
check("ambiguous recipe cannot support", g, "INCONCLUSIVE");
const h = buildOutcome();
h.jointCompositionEvidence!.jointContractHarnessExecution!.driverReport!.sharedRuntime = false;
check("non-shared runtime cannot support", h, "INCONCLUSIVE");
const incompleteSurface = buildOutcome();
incompleteSurface.jointCompositionEvidence!.compositionRecipeSelection!.evaluationSurfaceCompleteness = "PARTIAL";
check("partial bilateral evaluation surface cannot support", incompleteSurface, "INCONCLUSIVE");
const unresolved = buildOutcome();
unresolved.jointCompositionEvidence!.compositionExecutionRequirement!.unresolvedGuardFactIds = ["UNRESOLVED-GUARD"];
check("unresolved source guard cannot support", unresolved, "INCONCLUSIVE");
const i = buildOutcome();
i.jointCompositionEvidence!.jointContractHarnessExecution!.driverReport!.constraintObservations![1].evidence = [];
check("empty execution evidence cannot support", i, "INCONCLUSIVE");
console.log("PASS: fail-closed native joint evaluator regression (" + pass + " cases)");
