"use strict";
/**
 * Trusted CI bridge: reconstruct source/ABI/AST from the same locked solc invocation.
 * No signing, calldata generation, deployment, RPC calls or evidence admission.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {choosePair,collectSources}=require("./run-generic-source-worker.cjs");
const {buildGraph}=require("../scientific-solidity-graph/ScientificSolidityAstGraph.cjs");
const {discover,hash}=require("./GenericHypothesisPlanner.cjs");
const LOCK_SHA256="73a70b40bad9d064a244d1a36986b78be9adedc85d2043a6431add0c428b41b1";
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const isHash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const types=new Set(["address","uint256","bool","bytes32"]);
const type=t=>t==="address payable"?"address":t;
const signature=f=>f.name+"("+f.parameterTypes.map(type).join(",")+")";
function shortest(graph,start,end){
  const q=[[start]],seen=new Set([start]);
  while(q.length){
    const chain=q.shift(),last=chain[chain.length-1];
    if(last===end)return chain;
    if(chain.length>=10)continue;
    for(const edge of graph.edges.filter(x=>x.kind==="CALLS"&&x.from===last)){
      if(!seen.has(edge.to)){seen.add(edge.to);q.push([...chain,edge.to]);}
    }
  }
  return null;
}
function pathsFromGraph(graph,root,abi){
  assert.equal(graph?.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(graph.status,"STRUCTURAL_OBSERVATION_ONLY");
  assert(Array.isArray(graph.functions)&&Array.isArray(graph.contracts)&&
    Array.isArray(graph.writes)&&Array.isArray(graph.edges));
  assert(Array.isArray(abi));
  const c=graph.contracts.filter(x=>x.unit===root.unit&&x.name===root.contract&&x.kind==="contract");
  assert.equal(c.length,1,"ROOT_CONTRACT_NOT_UNIQUE");
  const bases=new Set([c[0].id,...c[0].linearizedBaseContracts]);
  const facts=[];
  for(const entry of abi.filter(x=>x.type==="function"&&
      ["payable","nonpayable"].includes(x.stateMutability)&&
      Array.isArray(x.inputs)&&x.inputs.length>0&&x.inputs.every(i=>types.has(i.type)))){
    const sig=entry.name+"("+entry.inputs.map(x=>x.type).join(",")+")";
    const candidates=graph.functions.filter(f=>f.kind==="function"&&f.implemented&&
      ["public","external"].includes(f.visibility)&&bases.has(f.contractId)&&
      f.name===entry.name&&Array.isArray(f.parameterTypes)&&
      f.parameterTypes.every(p=>types.has(type(p)))&&signature(f)===sig);
    if(candidates.length!==1)continue; // overloaded, ambiguous, or unresolved
    const f=candidates[0], matches=[];
    for(const w of graph.writes.filter(w=>typeof w.state==="string"&&
        typeof w.location?.unit==="string"&&Number.isSafeInteger(w.location.start))){
      const chain=shortest(graph,f.id,w.owner);
      if(!chain)continue;
      if(chain.some(id=>(graph.unresolved||[]).some(e=>e.owner===id)||
        (graph.externalCalls||[]).some(e=>e.owner===id)))continue;
      const nodes=chain.map(id=>graph.functions.find(x=>x.id===id));
      if(nodes.some(x=>!x))continue;
      if(!graph.sources.some(s=>s.unit===w.location.unit&&isHash(s.sha256)))continue;
      matches.push({signature:sig,kind:"STATE_WRITE",stateVariable:w.state,
        path:nodes.map(n=>n.name+"#"+n.id).join(" -> ")+" @"+w.location.unit+":"+w.location.start});
    }
    const states=[...new Set(matches.map(m=>m.stateVariable))];
    if(states.length!==1)continue; // do not select a convenient write from a multi-effect method
    const first=matches.filter(m=>m.stateVariable===states[0]).sort((a,b)=>a.path.localeCompare(b.path))[0];
    if(first)facts.push(first);
  }
  return {paths:facts.sort((a,b)=>a.signature.localeCompare(b.signature))};
}
function reconcileInputs(graph,collected){
  assert.equal(graph.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(graph.compilerVersion,collected.deps.solc.version());
  assert.equal(graph.sources.length,collected.files.size);
  for(const s of graph.sources){
    const local=collected.files.get(s.unit);
    assert(local&&isHash(s.sha256)&&s.sha256===local.sha256&&
      s.sha256===sha256(Buffer.from(local.content,"utf8")),"SOURCE_GRAPH_BYTES_MISMATCH");
  }
  for(const root of collected.roots)
    assert(graph.sources.some(s=>s.unit===root),"REGISTERED_ROOT_MISSING");
}
async function runPinnedPair(a,b,dependencyRoot){
  const pair=choosePair(a,b);
  const root=path.resolve(dependencyRoot);
  const lock=fs.readFileSync(path.join(root,"package-lock.json"));
  assert.equal(sha256(lock),LOCK_SHA256,"PINNED_LOCK_SHA256_MISMATCH");
  const collected=await collectSources(pair,root);
  const solc=collected.deps.solc,version=solc.version();
  assert(/^0\.8\.26\+/.test(version),"UNREVIEWED_SOLC_VERSION");
  const input={language:"Solidity",
    sources:Object.fromEntries([...collected.files].map(([unit,file])=>[unit,{content:file.content}])),
    settings:{optimizer:{enabled:false},outputSelection:{"*":{"":["ast"],"*":["abi"]}}}};
  const output=JSON.parse(solc.compile(JSON.stringify(input)));
  const errors=(output.errors||[]).filter(e=>e.severity==="error");
  assert.equal(errors.length,0,"COMPILER_REJECTED_LOCKED_SOURCES");
  const graph=buildGraph({input,output,solcVersion:version});
  reconcileInputs(graph,collected);
  const sourceGraphSha256=hash(graph);
  const participants=pair.map((ref,i)=>{
    const unit=collected.roots[i],original=output.contracts?.[unit]?.[ref.contract];
    assert(Array.isArray(original?.abi),"LOCKED_CONTRACT_ABI_UNAVAILABLE:"+ref.id);
    const abi=original.abi;
    const source={sourceSha256:collected.files.get(unit).sha256,
      astSha256:sourceGraphSha256,abiSha256:hash(abi)};
    const ast=pathsFromGraph(graph,{unit,contract:ref.contract},abi);
    const hypotheses=discover({source,abi,ast});
    assert.equal(hypotheses.status,"SOURCE_IDENTITY_UNATTESTED");
    return {id:ref.id,revision:ref.kind==="github"?ref.revision:"4.9.6",
      contract:ref.contract,sourceUnit:unit,sourceSha256:source.sourceSha256,
      abiSha256:source.abiSha256,structuralPaths:ast.paths,
      hypothesisCount:hypotheses.hypotheses.length,hypotheses:hypotheses.hypotheses};
  });
  return {schemaVersion:"OECL_LOCKED_SOURCE_HYPOTHESES_V1",
    status:"COMPILER_RECONCILED_SOURCE_ONLY",registryScope:"REVIEWED_SOURCE_REGISTRY",
    compilerVersion:version,lockSha256:sha256(lock),
    dependencyIntegrity:collected.deps.integrity,
    sourceGraphSha256,participants,evmExecuted:false,
    executionAuthorized:false,independentReviewStatus:"AWAITING_SEPARATE_RECONSTRUCTION",
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:["Real solc AST and ABI were reconstructed from exact collected source bytes.",
      "Structural source effects may be conditional or impossible to reach.",
      "Dependency identity requires the trusted pinned CI checkout and npm integrity enforcement.",
      "No local EVM state transition, adversarial control or interoperability proof is claimed."]};
}
module.exports={runPinnedPair,pathsFromGraph,reconcileInputs,LOCK_SHA256};
