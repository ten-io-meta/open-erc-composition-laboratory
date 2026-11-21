import assert from "node:assert/strict";
import { ScientificCompositionConstraintEvaluatorEngine } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintEvaluatorEngine.js";
import { ScientificExecutionResultEvaluatorEngine } from "../laboratory/scientific-execution-result-evaluator/ScientificExecutionResultEvaluatorEngine.js";
import type { ScientificCompositionConstraint } from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionConstraint.js";
import type { ScientificCompositionConstraintObservation } from "../laboratory/scientific-composition-constraint-evaluation/ScientificCompositionConstraintObservation.js";
import type { ScientificExecutionOutcome } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcome.js";
import type { ScientificExecutionOutcomeResult } from "../laboratory/scientific-execution-outcome/ScientificExecutionOutcomeResult.js";

/** Regression fixture only. Fictitious tx and sources are NEVER real ERC evidence. */
const candidateId = "BEHAVIORAL-REGRESSION-ONLY";
const tx = "0x" + "f".repeat(64);
const shaA = "a".repeat(40), shaB = "b".repeat(40);
const sources = [
    { participantSide: "A" as const, participantKind: "PROTOCOL" as const, participantId: "ERC-A", sourceId: "SOURCE-A", repository: "fixture/A", sourceRevision: shaA },
    { participantSide: "B" as const, participantKind: "PROTOCOL" as const, participantId: "ERC-B", sourceId: "SOURCE-B", repository: "fixture/B", sourceRevision: shaB }
];
const constraints: ScientificCompositionConstraint[] = [
    { constraintId: "SOLVENCY", candidateId, participantSide: "A", participantKind: "PROTOCOL",
      participantId: "ERC-A", sourceId: "SOURCE-A", sourceRevision: shaA, factId: "A-FACT",
      basis: "SOURCE_DERIVED_BEHAVIORAL_INVARIANT", containerKind: "CONTRACT", containerSymbol: "A",
      locator: {sourceLocation:"fixture://A",filePath:"A.sol",startLine:10,endLine:10},
      rawText: "balance >= obligations;",
      behavioralPredicate: {kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"balance",operator:"GTE",rightMetric:"obligations"} },
    { constraintId: "NONINCREASE", candidateId, participantSide: "B", participantKind: "PROTOCOL",
      participantId: "ERC-B", sourceId: "SOURCE-B", sourceRevision: shaB, factId: "B-FACT",
      basis: "SOURCE_DERIVED_BEHAVIORAL_INVARIANT", containerKind: "CONTRACT", containerSymbol: "B",
      locator: {sourceLocation:"fixture://B",filePath:"B.sol",startLine:30,endLine:30},
      rawText: "_totalSupply -= amount;",
      behavioralPredicate: {kind:"UNSIGNED_INTEGER_RELATION",leftMetric:"after",operator:"LTE",rightMetric:"before"} }
];
const observations: ScientificCompositionConstraintObservation[] = [
    { observationId:"OBS-SOLVENCY", candidateId, constraintId:"SOLVENCY", participantSide:"A",
      sourceRevision:shaA, transactionHash:tx, numericMeasurements:{balance:"200",obligations:"100"},
      verdict:"PRESERVED", evidence:["fixture:balance-state"] },
    { observationId:"OBS-NONINCREASE", candidateId, constraintId:"NONINCREASE", participantSide:"B",
      sourceRevision:shaB, transactionHash:tx, numericMeasurements:{after:"99",before:"100"},
      verdict:"PRESERVED", evidence:["fixture:token-supply"] }
];
const engine = new ScientificCompositionConstraintEvaluatorEngine();
const clone = <T>(value:T):T=>structuredClone(value);
let checks=0;
function check(label:string, c:ScientificCompositionConstraint[], o:ScientificCompositionConstraintObservation[],
    expected:"SUPPORT"|"CHALLENGE"|"INCONCLUSIVE") {
    const result=engine.evaluate(c,o);
    assert.equal(result.scientificPolarity,expected,label+": "+JSON.stringify(result.errors));
    checks++;
}
check("two typed invariants observed",constraints,observations,"SUPPORT");
const violated=clone(observations);
violated[1].numericMeasurements!.after="101";
violated[1].verdict="VIOLATED";
check("measured supply increase challenges",constraints,violated,"CHALLENGE");
const inconsistent=clone(observations);
inconsistent[1].numericMeasurements!.after="101";
check("claimed pass contradicted by numbers rejected",constraints,inconsistent,"INCONCLUSIVE");
const missing=clone(observations);
missing[1].numericMeasurements=undefined;
check("missing operands inconclusive",constraints,missing,"INCONCLUSIVE");
const wrongRev=clone(observations);
wrongRev[1].sourceRevision="0".repeat(40);
check("unbound source revision inconclusive",constraints,wrongRev,"INCONCLUSIVE");
const noTx=clone(observations);
noTx[0].transactionHash=undefined;
check("missing transaction hash inconclusive",constraints,noTx,"INCONCLUSIVE");
const badAmount=clone(observations);
badAmount[0].numericMeasurements!.balance="-1";
check("negative amount inconclusive",constraints,badAmount,"INCONCLUSIVE");
const partial=clone(observations);
partial.pop();
check("partial participant coverage inconclusive",constraints,partial,"INCONCLUSIVE");

function finalResult(c:ScientificCompositionConstraint[],obs:ScientificCompositionConstraintObservation[],
   completeness:"COMPLETE_FOR_CANDIDATE_EVALUATION"|"PARTIAL"="COMPLETE_FOR_CANDIDATE_EVALUATION",
   txB=tx) {
    const evalResult=engine.evaluate(c,obs);
    const executedSources=sources.map((source,i)=>({
        ...source,requiredRevision:source.sourceRevision,observedRevision:source.sourceRevision,
        localPath:"/fake/source-"+i,worktreeClean:true as const
    }));
    const candidate={
        candidateId,participantA:{kind:"PROTOCOL",id:"ERC-A"},
        participantB:{kind:"PROTOCOL",id:"ERC-B"},
        mechanism:"SHARED_RECURRENT_CONCEPT",conceptId:"SYNTHETIC-INVARIANT",
        supportingCapabilityIdsA:["A-CAP"],supportingCapabilityIdsB:["B-CAP"],
        provenance:[
            {kind:"PROTOCOL_CONCEPT",sourceId:"SOURCE-A",sourceRevision:shaA,evidenceId:"DISCOVERY-FACT-A"},
            {kind:"PROTOCOL_CONCEPT",sourceId:"SOURCE-B",sourceRevision:shaB,evidenceId:"DISCOVERY-FACT-B"}
        ],evaluationStatus:"UNEVALUATED"
    };
    const spec={
        specificationId:"SPEC-TEST",candidateId,mechanism:candidate.mechanism,
        candidateSnapshot:candidate,status:"READY",
        sourceIds:["SOURCE-A","SOURCE-B"],targetEvidenceIds:["DISCOVERY-FACT-A","DISCOVERY-FACT-B"],
        constraints:c,participantAConstraintIds:["SOLVENCY"],participantBConstraintIds:["NONINCREASE"],
        unresolvedGuardFactIds:[],
        scientificCriteria:{
            relation:"PRESERVES_OBSERVED_CONSTRAINTS",
            support:{expectedPolarity:"SUPPORT",condition:"ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"},
            challenge:{expectedPolarity:"CHALLENGE",condition:"ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"},
            inconclusive:{whenNoScientificPolarity:true}
        }
    };
    const evidence={
        runtime:"OECL_NATIVE_COMPOSITION_JOINT_CONTRACT_EXECUTION",
        compositionExecutionRequirement:{
            requirementId:"REQ-TEST",evaluationSpecificationId:"SPEC-TEST",
            candidate,
            constraints:c,participantAConstraintIds:["SOLVENCY"],participantBConstraintIds:["NONINCREASE"],
            unresolvedGuardFactIds:[],participantSources:sources
        },
        compositionWorkspaceMaterialization:{requirementId:"REQ-TEST",candidateId,
            workspacePath:"/fake",sourceMaterializations:executedSources,status:"MATERIALIZED",errors:[]},
        compositionRecipeSelection:{status:"SELECTED",selectedRegistrationId:"REG-TEST",
            matchingRegistrationIds:["REG-TEST"],evaluationSurfaceCompleteness:completeness,reasons:[]},
        jointContractHarnessExecution:{recipeId:"RECIPE-TEST",status:"EXECUTED",errors:[],
            participantSources:executedSources,driverReport:{
                sharedRuntime:true,scientificPolarity:"NEUTRAL",
                participantA:{executed:true,transactionHashes:[tx],contractAddresses:["0x"+"1".repeat(40)]},
                participantB:{executed:true,transactionHashes:[txB],contractAddresses:["0x"+"2".repeat(40)]},
                constraintObservations:obs
            }},
        compositionConstraintEvaluation:evalResult
    };
    const outcome={
        outcomeId:"OUT-1",executionPlanId:"PLAN-1",executionTaskId:"TASK-1",experimentId:"EXP-1",
        targetType:"COMPOSITION_CANDIDATE",targetId:candidateId,
        sourceIds:[],targetEvidenceIds:[],successCriteria:[],failureCriteria:[],
        stepId:"STEP-1",stepType:"COMPOSITION_EXECUTION",repository:null,
        selectedExecutableTarget:null,status:"INCONCLUSIVE",scientificResult:"INCONCLUSIVE",
        executedAt:null,evidence:[],observations:[],errors:[],explanation:"",
        jointCompositionEvidence:evidence,
        discoveredCandidateEvidence:{discovery:{candidates:[candidate],errors:[]},specifications:{specifications:[spec],errors:[]}}
    } as unknown as ScientificExecutionOutcome;
    const evaluated=new ScientificExecutionResultEvaluatorEngine().build("REG",{
        generatedAt:"",campaignId:"REG",outcomes:[outcome],
        statistics:{} as ScientificExecutionOutcomeResult["statistics"],errors:[]
    });
    assert.deepEqual(evaluated.errors,[]);
    return evaluated.updatedOutcomes.outcomes[0].scientificResult;
}
assert.equal(finalResult(constraints,observations),"SUPPORTS");checks++;
assert.equal(finalResult(constraints,violated),"CHALLENGES");checks++;
assert.equal(finalResult(constraints,observations,"PARTIAL"),"INCONCLUSIVE");checks++;
assert.equal(finalResult(constraints,observations,"COMPLETE_FOR_CANDIDATE_EVALUATION","0x"+"e".repeat(64)),"INCONCLUSIVE");checks++;
assert.equal(finalResult(constraints,missing),"INCONCLUSIVE");checks++;
assert.equal(finalResult(constraints,inconsistent),"INCONCLUSIVE");checks++;
console.log("PASS: behavioral native constraint + final polarity regression ("+checks+" synthetic cases)");
