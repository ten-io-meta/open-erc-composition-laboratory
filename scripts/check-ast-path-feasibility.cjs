"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {evaluateFeasibility,expressionAtoms,contradiction}=require(
  "../laboratory/scientific-open-source-worker/ScientificAstPathFeasibility.cjs");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const src=" ".repeat(2500);
const unit="fixtures/Synthetic.sol";
const loc=(start,length=12)=>({unit,start,length,line:1});
const atom=(name,id,op,n)=>{
  const idNode={nodeType:"Identifier",name,referencedDeclaration:id,
    typeDescriptions:{typeString:"uint256"}};
  const value={nodeType:"Literal",kind:"number",value:String(n)};
  return {nodeType:"BinaryOperation",operator:op,
    leftExpression:idNode,rightExpression:value};
};
const exprBool=(name,id)=>({nodeType:"Identifier",name,referencedDeclaration:id,
  typeDescriptions:{typeString:"bool"}});
const expression=(condition,start)=>{
  return {nodeType:"ExpressionStatement",src:start+":19:0",
    expression:{nodeType:"FunctionCall",expression:{nodeType:"Identifier",name:"require"},
      arguments:[condition]}};
};
const revertIf=(condition,start)=>({
  nodeType:"IfStatement",src:start+":23:0",condition,
  trueBody:{nodeType:"RevertStatement",src:(start+9)+":5:0"}
});
const stateWrite=(start)=>({nodeType:"ExpressionStatement",src:start+":16:0",
  expression:{nodeType:"Assignment",operator:"-="}});
const call=(start)=>({nodeType:"ExpressionStatement",src:start+":18:0",
  expression:{nodeType:"FunctionCall"}});
const func=(id,statements,modifiers=[])=>({
  nodeType:"FunctionDefinition",id,modifiers,
  body:{nodeType:"Block",src:"30:800:0",statements}
});
const mod=(id,statements)=>({nodeType:"ModifierDefinition",id,
  body:{nodeType:"Block",src:"850:350:0",statements}});
const entryA=(first,second)=>func(11,[expression(first,100),
  expression(second,130),call(200)]);
const internalA=func(12,[stateWrite(300)]);
const entryB=func(21,[call(400)]);
const internalB=func(22,[stateWrite(500)]);
const modGuard=(id,withPlaceholder=true)=>mod(id,[
  expression({nodeType:"BinaryOperation",operator:"==",
    leftExpression:{nodeType:"MemberAccess",memberName:"sender",
      expression:{nodeType:"Identifier",name:"msg"}},
    rightExpression:{nodeType:"Identifier",name:"owner",
      referencedDeclaration:77,typeDescriptions:{typeString:"address"}}},900),
  ...(withPlaceholder?[{nodeType:"PlaceholderStatement",src:"930:4:0"}]:[])
]);
function sample(overrides={}){
  const f1=entryA(atom("amount",301,">",10),atom("amount",301,"<",5));
  const f2=internalA,f3=entryB,f4=internalB;
  const m=modGuard(50);
  f3.modifiers=[{nodeType:"ModifierInvocation",modifierName:{referencedDeclaration:50}}];
  const ast={nodeType:"SourceUnit",nodes:[
    {nodeType:"ContractDefinition",id:1,nodes:[f1,f2]},
    {nodeType:"ContractDefinition",id:2,nodes:[f3,f4,m]}
  ]};
  const graph={
    schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
    scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    sources:[{unit,sha256:sha(src)}],
    functions:[{id:11,unit,name:"burn"},{id:12,unit,name:"_burn"},
      {id:21,unit,name:"burn"},{id:22,unit,name:"_burn"}],
    modifiers:[{id:50,unit,name:"onlyOwner",contractId:2,location:loc(850)}],
    edges:[{kind:"CALLS",from:11,to:12,location:loc(200)},
      {kind:"CALLS",from:21,to:22,location:loc(400)},
      {kind:"APPLIES_MODIFIER",from:21,to:50,location:loc(850)}],
    writes:[{owner:12,state:"_supply",kind:"DECREASE",location:loc(300)},
      {owner:22,state:"_supply",kind:"DECREASE",location:loc(500)}],
    unresolved:[],externalCalls:[]
  };
  const discovery={schemaVersion:"OECL_GENERIC_AST_HYPOTHESES_V1",
    verdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    sourceGraphSha256:sha(JSON.stringify(graph)),
    hypotheses:[{hypothesisId:"AST-HYP-123",status:"SOURCE_ONLY_UNEVALUATED",
      candidateAdmission:"NOT_ADMITTED",kind:"POTENTIAL_COUPLED_STATE_DECREASE",
      evidence:[{participant:"A",callPath:[11,12],
        stateDecrease:{state:"_supply",location:loc(300)}},
        {participant:"B",callPath:[21,22],
          stateDecrease:{state:"_supply",location:loc(500)}}]}]};
  const build={input:{sources:{[unit]:{content:src}}},
    output:{sources:{[unit]:{ast}}}};
  return {build,graph,discovery,ast,f1,f2,f3,f4,m,...overrides};
}
let fixture=sample();
const result=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(result.schemaVersion,"OECL_AST_PATH_FEASIBILITY_V1");
assert.equal(result.scientificVerdict,"INCONCLUSIVE");
assert.equal(result.candidateAdmission,"NOT_ADMITTED");
assert.equal(result.evmExecuted,false);
assert.equal(result.hypotheses[0].pathScreen,"AT_LEAST_ONE_MODELED_PATH_BLOCKED");
assert.equal(result.hypotheses[0].participants[0].pathScreen,
  "PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH");
assert.equal(result.hypotheses[0].participants[1].pathScreen,"NOT_PROVEN_EXECUTABLE");
assert.ok(result.hypotheses[0].participants[1].flags.includes("MODIFIER_AUTHORIZATION_GATED"));
assert.equal(result.hypotheses[0].evmPlan.status,"DESIGN_ONLY_NOT_EXECUTED");
// The same identifiers but different compiler declaration IDs are not equivalent.
fixture=sample();
fixture.f1.body.statements[1]=expression(atom("amount",999,"<",5),130);
const distinct=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(distinct.hypotheses[0].participants[0].pathScreen,"NOT_PROVEN_EXECUTABLE");
// Side effects between two individually satisfiable checks break proof segments.
fixture=sample();
fixture.f1.body.statements.splice(1,0,{nodeType:"ExpressionStatement",
  src:"119:9:0",expression:{nodeType:"Assignment",operator:"="}});
const separated=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(separated.hypotheses[0].participants[0].pathScreen,"NOT_PROVEN_EXECUTABLE");
// An inherited modifier with no placeholder suppresses the attached body.
fixture=sample();
fixture.m.body.statements=fixture.m.body.statements.filter(x=>x.nodeType!=="PlaceholderStatement");
const missing=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.ok(missing.hypotheses[0].participants[1].blockers.some(x=>
  x.kind==="MODIFIER_SUPPRESSES_FUNCTION_BODY"));
// Contradictory inherited modifier guards suppress access before the body.
fixture=sample();
fixture.m.body.statements=[
  expression(atom("quota",777,">",9),865),
  expression(atom("quota",777,"<",2),895),
  {nodeType:"PlaceholderStatement",src:"930:4:0"}
];
const modifierConflict=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(modifierConflict.hypotheses[0].participants[1].pathScreen,
  "PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH");
assert.ok(modifierConflict.hypotheses[0].participants[1].blockers.some(x=>
  x.kind==="CONTRADICTORY_INTERVAL_GUARDS"));
// A blocked call site must not condemn an alternative unblocked source site.
fixture=sample();
fixture.f1.body.statements=[
  expression(atom("amount",301,">",10),100),
  call(120),
  expression(atom("amount",301,"<",5),150),
  call(200)
];
fixture.graph.edges.push({kind:"CALLS",from:11,to:12,location:loc(120)});
fixture.discovery.sourceGraphSha256=sha(JSON.stringify(fixture.graph));
const alternative=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(alternative.hypotheses[0].participants[0].pathScreen,
  "NOT_PROVEN_EXECUTABLE");
// Nested branch effects are unresolved, never silently marked reachable.
fixture=sample();
fixture.f1.body.statements=[expression(atom("amount",301,">",10),100),
  {nodeType:"IfStatement",src:"180:60:0",condition:atom("amount",301,"<",5),
    trueBody:{nodeType:"Block",src:"191:45:0",statements:[call(200)]}}
];
const conditional=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(conditional.hypotheses[0].participants[0].pathScreen,
  "NOT_PROVEN_EXECUTABLE");
assert.ok(conditional.hypotheses[0].participants[0].flags.includes(
  "SOURCE_PATH_HAS_UNMODELED_CONTEXT"));

// Conditional reverts are necessary guards on the continuing path.
fixture=sample();
fixture.f1.body.statements=[expression(atom("amount",301,"==",0),100),
  revertIf(atom("amount",301,"==",0),130),call(200)];
const inverted=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(inverted.hypotheses[0].participants[0].pathScreen,
  "PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH");
// A conditional abort with an else branch is NOT a pure prerequisite:
// the continuing else branch can mutate the tracked variable. Treat it as
// unknown even if distant require guards would otherwise look contradictory.
fixture=sample();
fixture.f1.body.statements=[
  expression(atom("amount",301,"==",0),100),
  {nodeType:"IfStatement",src:"130:48:0",
    condition:atom("amount",301,"==",1),
    trueBody:{nodeType:"RevertStatement",src:"140:8:0"},
    falseBody:{nodeType:"ExpressionStatement",src:"152:15:0",
      expression:{nodeType:"Assignment",operator:"="}}
  },
  expression(atom("amount",301,"==",2),180),call(200)
];
const mutatingElse=evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery);
assert.equal(mutatingElse.hypotheses[0].participants[0].pathScreen,
  "NOT_PROVEN_EXECUTABLE",
  "A possible variable write in an else branch must break contradictory-guard proof");

// Constant false always aborts.
fixture=sample();
fixture.f1.body.statements=[expression({nodeType:"Literal",kind:"bool",value:"false"},100),call(200)];
assert.equal(evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery)
  .hypotheses[0].participants[0].pathScreen,"PROVEN_BLOCKED_WITHIN_MODELED_AST_PATH");
// Shared inheritance has no direct executable route.
fixture=sample();
fixture.discovery.hypotheses=[{hypothesisId:"AST-HYP-123",kind:"SHARED_STANDARD_INHERITANCE",
  status:"SOURCE_ONLY_UNEVALUATED",candidateAdmission:"NOT_ADMITTED",evidence:[]}];
assert.equal(evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery)
  .hypotheses[0].pathScreen,"NO_EXECUTABLE_ROUTE_SPECIFIED");
// A malicious digest change cannot produce an accepted scientific report.
fixture=sample();
fixture.graph.sources[0].sha256="0".repeat(64);
fixture.discovery.sourceGraphSha256=sha(JSON.stringify(fixture.graph));
assert.throws(()=>evaluateFeasibility(fixture.build,fixture.graph,fixture.discovery),
  /AST_SOURCE_HASH_MISMATCH/);
const atomProof=expressionAtoms(atom("balance",51,">=",3));
assert.equal(atomProof[0].symbol,51);
assert.equal(contradiction([{atoms:[{symbol:51,label:"balance",type:"number",op:"!=",value:"1"}]},
  {atoms:[{symbol:51,label:"balance",type:"number",op:"==",value:"1"}]}]).kind,
  "CONTRADICTORY_NUMERIC_GUARDS");
console.log("OECL_AST_PATH_FALSIFICATION: PASS — contradictory guards, inherited permissions, empty modifiers, conditional abort, mutation boundaries and forged provenance");
