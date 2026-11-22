import assert from "node:assert/strict";
import { ScientificDiscoveredCandidateAdmissionEngine } from "../laboratory/scientific-candidate-admission/ScientificDiscoveredCandidateAdmissionEngine.js";
import type { ScientificCrossProtocolCompositionResult } from "../laboratory/scientific-cross-protocol-composition/ScientificCrossProtocolCompositionResult.js";
import type { ScientificCompositionEvaluationSpecificationResult } from "../laboratory/scientific-composition-evaluation-specification/ScientificCompositionEvaluationSpecificationResult.js";
import type { ScientificCompositionExecutionRequirement } from "../laboratory/scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

/** Synthetic provenance for gate regression only, not an actual OECL discovery. */
const id="SYNTHETIC-DISCOVERY-ONLY";
const sourceA={participantSide:"A",participantKind:"PROTOCOL",participantId:"ERC-8060",sourceId:"A-SOURCE",
    repository:"ten-io-meta/erc8060-native-eth-value",sourceRevision:"a".repeat(40)};
const sourceB={participantSide:"B",participantKind:"PROTOCOL",participantId:"ERC-8098",sourceId:"B-SOURCE",
    repository:"ten-io-meta/erc8098-reference",sourceRevision:"b".repeat(40)};
const candidate={
    candidateId:id, participantA:{kind:"PROTOCOL",id:"ERC-8060"},
    participantB:{kind:"PROTOCOL",id:"ERC-8098"},
    mechanism:"SHARED_RECURRENT_CONCEPT",conceptId:"CONCEPT-TEST",
    supportingCapabilityIdsA:["CAP-A"],supportingCapabilityIdsB:["CAP-B"],
    provenance:[
        {kind:"PROTOCOL_CONCEPT",sourceId:"A-SOURCE",sourceRevision:sourceA.sourceRevision,evidenceId:"FACT-A"},
        {kind:"PROTOCOL_CONCEPT",sourceId:"B-SOURCE",sourceRevision:sourceB.sourceRevision,evidenceId:"FACT-B"}
    ],evaluationStatus:"UNEVALUATED"
};
const constraint=(side:"A"|"B")=>({
    constraintId:"C-"+side,candidateId:id,
    participantSide:side,participantKind:"PROTOCOL",
    participantId:side==="A"?"ERC-8060":"ERC-8098",
    sourceId:side==="A"?"A-SOURCE":"B-SOURCE",
    sourceRevision:side==="A"?sourceA.sourceRevision:sourceB.sourceRevision,
    factId:"FACT-"+side,basis:"SOLIDITY_REQUIRE_STATEMENT",
    containerKind:"CONTRACT",containerSymbol:"Test",
    locator:{sourceLocation:"fixture://"+side,filePath:"Test.sol",startLine:1,endLine:1},
    rawText:"require(true);"
});
const constraints=[constraint("A"),constraint("B")];
const spec={
    specificationId:"SPEC-TEST",candidateId:id,mechanism:candidate.mechanism,candidateSnapshot:candidate,
    status:"READY",sourceIds:["A-SOURCE","B-SOURCE"],targetEvidenceIds:["FACT-A","FACT-B"],
    constraints,participantAConstraintIds:["C-A"],participantBConstraintIds:["C-B"],
    unresolvedGuardFactIds:[],
    scientificCriteria:{
        relation:"PRESERVES_OBSERVED_CONSTRAINTS",
        support:{expectedPolarity:"SUPPORT",condition:"ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED"},
        challenge:{expectedPolarity:"CHALLENGE",condition:"ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED"},
        inconclusive:{whenNoScientificPolarity:true}
    }
};
const requirement={
    requirementId:"REQ-TEST",evaluationSpecificationId:"SPEC-TEST",candidate,
    constraints,participantAConstraintIds:["C-A"],participantBConstraintIds:["C-B"],
    unresolvedGuardFactIds:[],participantSources:[sourceA,sourceB]
};
const discovery={candidates:[candidate],errors:[]};
const specification={specifications:[spec],errors:[]};
type Inputs={discovery:ScientificCrossProtocolCompositionResult;specifications:ScientificCompositionEvaluationSpecificationResult;requirement:ScientificCompositionExecutionRequirement};
const base={discovery,specifications:specification,requirement} as unknown as Inputs;
const copy=()=>structuredClone(base);
const engine=new ScientificDiscoveredCandidateAdmissionEngine();
let checked=0;
function test(name:string,mutate:(inputs:Inputs)=>void,expected:"BLOCKED"|"ELIGIBLE_FOR_REVIEW"){
    const inputs=copy();mutate(inputs);
    const result=engine.assess(id,inputs.discovery,inputs.specifications,inputs.requirement);
    assert.equal(result.status,expected,name+": "+JSON.stringify(result.errors));
    checked++;
}
test("synthetic consistent cross-source discovery is review-eligible only",()=>{},"ELIGIBLE_FOR_REVIEW");
test("no candidate from discovery",x=>{x.discovery.candidates=[];},"BLOCKED");
test("repeated candidate",x=>{x.discovery.candidates.push(structuredClone(x.discovery.candidates[0]));},"BLOCKED");
test("upstream discovery error",x=>{x.discovery.errors.push("unresolved");},"BLOCKED");
test("no source provenance",x=>{x.discovery.candidates[0].provenance=[];},"BLOCKED");
test("missing provenance revision",x=>{x.discovery.candidates[0].provenance[0].sourceRevision=undefined;},"BLOCKED");
test("spec not ready",x=>{x.specifications.specifications[0].status="INSUFFICIENT_EVIDENCE";},"BLOCKED");
test("forged candidate snapshot",x=>{x.specifications.specifications[0].candidateSnapshot!.candidateId="OTHER";},"BLOCKED");
test("wrong required source revision",x=>{x.requirement.participantSources[1].sourceRevision="0".repeat(40);},"BLOCKED");
test("missing B guard",x=>{x.requirement.participantBConstraintIds=[];},"BLOCKED");
test("missing discovered B participant",x=>{x.discovery.candidates[0].participantB.id="ERC-9999";},"BLOCKED");
test("unresolved source guards",x=>{x.requirement.unresolvedGuardFactIds=["UNRESOLVED"]; },"BLOCKED");
test("modified guard source",x=>{x.requirement.constraints[0].sourceId="FORGED";},"BLOCKED");
test("duplicate evidence identifiers",x=>{x.discovery.candidates[0].provenance[1].evidenceId="FACT-A";},"BLOCKED");
test("different specification identity",x=>{x.requirement.evaluationSpecificationId="OTHER";},"BLOCKED");

const none=engine.assess("ERC8060-ERC8098-UNADMITTED",{candidates:[],errors:[]},
 {specifications:[],errors:[]},base.requirement);
assert.equal(none.status,"BLOCKED");
checked++;
console.log("PASS: "+checked+" candidate discovery admission regressions; synthetic READY is not real discovery");
