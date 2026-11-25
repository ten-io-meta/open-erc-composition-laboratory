"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {pathsFromGraph,reconcileInputs,LOCK_SHA256}=require("../laboratory/scientific-open-source-worker/SourceBackedHypothesisBridge.cjs");
const crypto=require("node:crypto");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
const abi=[{type:"function",name:"transfer",stateMutability:"nonpayable",
  inputs:[{type:"address"},{type:"uint256"}],outputs:[]}];
function sample(){
 const text="pragma solidity ^0.8.20; contract Test {}";
 const unit="src/Test.sol";
 return {graph:{schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",status:"STRUCTURAL_OBSERVATION_ONLY",
   compilerVersion:"0.8.26+commit.8a97fa7a",
   sources:[{unit,sha256:sha(text)}],
   contracts:[{id:1,kind:"contract",name:"Test",unit,linearizedBaseContracts:[1]}],
   functions:[{id:2,contractId:1,kind:"function",implemented:true,visibility:"public",
     name:"transfer",parameterTypes:["address","uint256"]},
     {id:3,contractId:1,kind:"function",implemented:true,visibility:"internal",
     name:"_transfer",parameterTypes:["address","uint256"]}],
   edges:[{kind:"CALLS",from:2,to:3}],
   writes:[{owner:3,state:"_balances",location:{unit,start:10}}],
   unresolved:[],externalCalls:[]},
   collected:{roots:[unit],files:new Map([[unit,{content:text,sha256:sha(text)}]]),
     deps:{solc:{version:()=>"0.8.26+commit.8a97fa7a"}}},unit};
}
test("source graph and bytes reconcile; paths follow compiler IDs",()=>{
 const {graph,collected,unit}=sample();
 reconcileInputs(graph,collected);
 const paths=pathsFromGraph(graph,{unit,contract:"Test"},abi).paths;
 assert.equal(paths.length,1);
 assert.equal(paths[0].signature,"transfer(address,uint256)");
 assert.match(paths[0].path,/#2.*#3/);
 assert.equal(LOCK_SHA256.length,64);
 graph.contracts.push({id:9,kind:"interface",name:"IToken",unit,linearizedBaseContracts:[9]});
 graph.contracts[0].linearizedBaseContracts.push(9);
 graph.functions.push({...graph.functions[0],id:99,contractId:9});
 assert.equal(pathsFromGraph(graph,{unit,contract:"Test"},abi).paths.length,1);
});
test("reject altered source hashes and undeclared roots",()=>{
 const {graph,collected}=sample();
 collected.files.values().next().value.content+="fake";
 assert.throws(()=>reconcileInputs(graph,collected),/SOURCE_GRAPH_BYTES_MISMATCH/);
 const sample2=sample();
 sample2.collected.roots.push("missing.sol");
 assert.throws(()=>reconcileInputs(sample2.graph,sample2.collected),/REGISTERED_ROOT_MISSING/);
});
test("block unresolved, external, ambiguous, or multi-effect AST paths",()=>{
 const {graph,unit}=sample();
 graph.unresolved=[{owner:3}];
 assert.equal(pathsFromGraph(graph,{unit,contract:"Test"},abi).paths.length,0);
 graph.unresolved=[];graph.externalCalls=[{owner:2}];
 assert.equal(pathsFromGraph(graph,{unit,contract:"Test"},abi).paths.length,0);
 graph.externalCalls=[];graph.writes.push({owner:3,state:"_totalSupply",location:{unit,start:20}});
 assert.equal(pathsFromGraph(graph,{unit,contract:"Test"},abi).paths.length,0);
 graph.writes.pop();graph.functions.push({...graph.functions[0],id:5});
 assert.equal(pathsFromGraph(graph,{unit,contract:"Test"},abi).paths.length,0);
});
