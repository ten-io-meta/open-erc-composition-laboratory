"use strict";
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {discoverGenericPair}=require("../laboratory/scientific-open-source-worker/GenericAstPairHypotheses.cjs");
const {choosePair,strictPath,resolveImport,imports,lockedTree,githubSource,
  sha1GitBlob}=require("../laboratory/scientific-open-source-worker/run-generic-source-worker.cjs");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const location=(unit,i)=>({unit,line:i,start:i*10,length:5});
const a="github/0/contracts/A.sol",b="github/1/contracts/B.sol";
const graph={
  schemaVersion:"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1",
  status:"STRUCTURAL_OBSERVATION_ONLY",
  scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  sources:[{unit:a,sha256:hash("source-A")},{unit:b,sha256:hash("source-B")}],
  contracts:[
    {id:1,name:"ExampleA",kind:"contract",unit:a,linearizedBaseContracts:[1,3]},
    {id:2,name:"ExampleB",kind:"contract",unit:b,linearizedBaseContracts:[2,4]},
    {id:3,name:"ERC721",kind:"contract",unit:a,linearizedBaseContracts:[3]},
    {id:4,name:"ERC20",kind:"contract",unit:b,linearizedBaseContracts:[4]}],
  functions:[
    {id:11,contractId:1,unit:a,name:"redeem",kind:"function",implemented:true,visibility:"external",location:location(a,1)},
    {id:12,contractId:1,unit:a,name:"_burn",kind:"function",implemented:true,visibility:"internal",location:location(a,2)},
    {id:21,contractId:2,unit:b,name:"burn",kind:"function",implemented:true,visibility:"public",location:location(b,1)},
    {id:22,contractId:4,unit:b,name:"_burn",kind:"function",implemented:true,visibility:"internal",location:location(b,2)}],
  edges:[{from:11,to:12,kind:"CALLS"},{from:21,to:22,kind:"CALLS"}],
  writes:[{owner:12,state:"redeemableClaims",kind:"DECREASE",location:location(a,2)},
    {owner:22,state:"tokenTotalSupply",kind:"DECREASE",location:location(b,2)}]
};
const pair=[{id:"ERC-A",unit:a,contract:"ExampleA"},
  {id:"ERC-B",unit:b,contract:"ExampleB"}];
const result=discoverGenericPair(graph,pair);
assert.equal(result.errors.length,0);
assert.equal(result.hypotheses.length,1);
assert.equal(result.hypotheses[0].kind,"POTENTIAL_COUPLED_STATE_DECREASE");
assert.equal(result.candidateAdmission,"NOT_ADMITTED");
assert.equal(result.verdict,"INCONCLUSIVE");
assert.equal(result.hypotheses[0].status,"SOURCE_ONLY_UNEVALUATED");
assert.equal(result.hypotheses[0].evidence[0].stateDecrease.state,"redeemableClaims");
assert.equal(result.hypotheses[0].evidence[1].stateDecrease.state,"tokenTotalSupply");
assert.equal(result.hypotheses[0].evidence[0].stateDecrease.sourceSha256,hash("source-A"));

const noCall=structuredClone(graph);
noCall.edges=noCall.edges.filter(e=>e.from!==11);
assert.equal(discoverGenericPair(noCall,pair).hypotheses.length,0,
  "Orphaned decrease cannot generate an invented executable route.");
const noDecrease=structuredClone(graph);
noDecrease.writes=noDecrease.writes.filter(e=>e.owner!==22);
assert.equal(discoverGenericPair(noDecrease,pair).hypotheses.length,0);
const forgedSource=structuredClone(graph);
forgedSource.sources[0].sha256="FORGED";
assert.equal(discoverGenericPair(forgedSource,pair).errors.length,1);
const badAdmission=structuredClone(graph);
badAdmission.scientificPolarity="SUPPORTS";
assert.equal(discoverGenericPair(badAdmission,pair).errors.length,1);
const common=structuredClone(graph);
common.contracts[1].linearizedBaseContracts.push(3);
const shared=discoverGenericPair(common,pair);
assert.equal(shared.hypotheses.some(h=>h.kind==="SHARED_STANDARD_INHERITANCE"),true);
assert.equal(shared.verdict,"INCONCLUSIVE");
assert.equal(shared.candidateAdmission,"NOT_ADMITTED");

assert.equal(choosePair("ERC-8060","ERC-8098").length,2);
assert.equal(choosePair("ERC-721","ERC-20-BURNABLE").length,2);
for(const id of ["ERC-165","ERC-2612","ERC-2981","ERC-4626"])
  assert.equal(choosePair(id,"ERC-8060").length,2);
for(const ids of [["ERC-9999","ERC-8060"],["ERC-8060","ERC-8060"],
  ["../../evil","ERC-20"]])assert.throws(()=>choosePair(...ids));
for(const input of ["../danger.sol","./a.sol","/tmp/a.sol","x//y.sol","a/../b.sol",""])
  assert.equal(strictPath(input),false,"Untrusted path accepted: "+input);
assert.equal(resolveImport("github/0/contracts/A.sol","../lib/Util.sol"),
  "github/0/lib/Util.sol");
assert.throws(()=>resolveImport("github/0/contracts/A.sol","../../../escape.sol"));
assert.throws(()=>resolveImport("github/0/contracts/A.sol","https://evil.invalid/E.sol"));
assert.throws(()=>resolveImport("@openzeppelin/contracts/token/ERC20/ERC20.sol","../../../escape.sol"));
assert.deepEqual(imports('import "@openzeppelin/contracts/token/ERC20/ERC20.sol";'),
  ["@openzeppelin/contracts/token/ERC20/ERC20.sol"]);

const original=Buffer.from("// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract Example {}\n");
const blobHash=sha1GitBlob(original);
const revision="1".repeat(40),treeId="2".repeat(40);
const entry={kind:"github",repository:"example/safe",revision,
  file:"contracts/Example.sol",contract:"Example"};
const requests=[];
const fake=async url=>{
  requests.push(url);
  let body;
  if(url.includes("/git/commits/"))body={sha:revision,tree:{sha:treeId}};
  else if(url.includes("/git/trees/"))body={sha:treeId,truncated:false,
    tree:[{path:entry.file,type:"blob",mode:"100644",sha:blobHash,size:original.length}]};
  else if(url.includes("/git/blobs/"))body={sha:blobHash,size:original.length,
    encoding:"base64",content:original.toString("base64")};
  else throw Error("Wrong fixed API URL");
  return new Response(JSON.stringify(body),{status:200});
};
(async()=>{
 const tree=await lockedTree(entry,fake,{});
 const data=await githubSource(tree,entry.file);
 assert.equal(data.toString(),original.toString());
 assert.equal(requests.length,3);
 const forged=async url=>{
   const r=await fake(url);
   if(url.includes("/git/blobs/"))return new Response(JSON.stringify({
     sha:blobHash,size:original.length,encoding:"base64",
     content:Buffer.from("Z".repeat(original.length)).toString("base64")
   }),{status:200});
   return r;
 };
 const forgedTree=await lockedTree(entry,forged,{});
 await assert.rejects(githubSource(forgedTree,entry.file),/GITHUB_BLOB_HASH_MISMATCH/);
 const wrongOrigin=async()=>new Response("{}");
 await assert.rejects(lockedTree({...entry,repository:"https://evil.invalid/x"},wrongOrigin,{}),
   /UNTRUSTED_REGISTRY_COORDINATES/);
 console.log("OECL_GENERIC_SOURCE_WORKER_NEGATIVES: PASS · source graph paths, immutable Git blobs, registry constraints, verdict remains INCONCLUSIVE");
})().catch(err=>{console.error(err);process.exitCode=1;});
