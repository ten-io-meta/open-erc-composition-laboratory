"use strict";
/** Source-only blind probe of two registered ERC families; NO EVM DISPATCH. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {runPinnedPair}=require("./SourceBackedHypothesisBridge.cjs");
const {choosePair,collectSources}=require("./run-generic-source-worker.cjs");
const {buildGraph}=require("../scientific-solidity-graph/ScientificSolidityAstGraph.cjs");
const {hash}=require("./GenericHypothesisPlanner.cjs");
const valid=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
const FAMILIES=Object.freeze({
 "ERC-4626":{name:"ERC4626",root:"@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol"},
 "ERC-20":{name:"ERC20",root:"@openzeppelin/contracts/token/ERC20/ERC20.sol"}
});
function trace(graph,root,sig){
 const contract=graph.contracts.find(x=>x.unit===root.unit&&x.name===root.name&&x.kind==="contract");
 assert(contract,"REGISTERED_COMPILER_CONTRACT_NOT_FOUND");
 const candidates=graph.functions.filter(f=>f.kind==="function"&&f.implemented&&
  f.name===sig.split("(")[0]&&f.parameterTypes?.join(",")===sig.split("(")[1].slice(0,-1)&&
  [contract.id,...contract.linearizedBaseContracts].includes(f.contractId));
 if(candidates.length!==1)return {signature:sig,status:"AMBIGUOUS_OR_NO_CONCRETE_CALL",writes:[],unresolved:0,external:0};
 const start=candidates[0].id,queue=[start],seen=new Set(),paths=new Map([[start,[start]]]);
 while(queue.length&&seen.size<250){
  const id=queue.shift();if(seen.has(id))continue;seen.add(id);
  for(const e of graph.edges.filter(e=>e.kind==="CALLS"&&e.from===id)){
   if(!paths.has(e.to)){paths.set(e.to,[...paths.get(id),e.to]);queue.push(e.to);}
  }
 }
 const writes=graph.writes.filter(w=>seen.has(w.owner)).map(w=>({
  state:w.state,kind:w.kind,unit:w.location?.unit||null,
  ownerFunctionId:w.owner,
  callPath:paths.get(w.owner)?.map(id=>graph.functions.find(f=>f.id===id)?.name||"?")||[]
 }));
 const unresolved=(graph.unresolved||[]).filter(x=>seen.has(x.owner)).length;
 const external=(graph.externalCalls||[]).filter(x=>seen.has(x.owner)).length;
 return {signature:sig,status:writes.length?"STRUCTURAL_WRITES_OBSERVED":"NO_REACHABLE_WRITE_PROVEN",
  startFunctionId:start,writes,
  unresolved,external,executionAuthorized:false};
}
async function probe(a,b,dependencyRoot){
 const pair=choosePair(a,b);
 const report=await runPinnedPair(a,b,dependencyRoot);
 const gathered=await collectSources(pair,dependencyRoot);
 assert(/^0\.8\.26\+/.test(gathered.deps.solc.version()));
 const input={language:"Solidity",
   sources:Object.fromEntries([...gathered.files].map(([unit,f])=>[unit,{content:f.content}])),
   settings:{optimizer:{enabled:false},outputSelection:{"*":{"":["ast"],"*":["abi"]}}}};
 const output=JSON.parse(gathered.deps.solc.compile(JSON.stringify(input)));
 assert.equal((output.errors||[]).filter(e=>e.severity==="error").length,0);
 const graph=buildGraph({input,output,solcVersion:gathered.deps.solc.version()});
 const participants=pair.map((ref,i)=>{
  const unit=gathered.roots[i],native=output.contracts[unit]?.[ref.contract];
  assert(Array.isArray(native?.abi));
  const signatures=native.abi.filter(x=>x.type==="function").map(
   x=>x.name+"("+x.inputs.map(y=>y.type).join(",")+")");
  const requests=ref.id==="ERC-4626"?
    ["deposit(uint256,address)","withdraw(uint256,address,address)"]:
    ["transfer(address,uint256)","transferFrom(address,address,uint256)"];
  return {id:ref.id,unit,sourceSha256:gathered.files.get(unit).sha256,
   abiSha256:hash(native.abi),nativeMethods:signatures,
   sourceOnlyHypothesisCount:report.participants[i].hypothesisCount,
   operations:requests.map(sig=>({supportedByAbi:signatures.includes(sig),
     ...trace(graph,{unit,name:ref.contract},sig)}))};
 });
 return {schemaVersion:"OECL_VAULT_ERC20_BLIND_PROBE_V1",
   status:"REGISTERED_SOURCE_AND_SOLC_AST_ONLY",
   compilerVersion:gathered.deps.solc.version(),sourceGraphSha256:hash(graph),
   sourceHypothesesSha256:hash(report),participants,
   scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
   candidateAdmission:"NOT_ADMITTED",evmExecuted:false,executionAuthorized:false,
   limitations:["Multi-state deposit/withdraw paths may not be captured by the single-state hypothesis planner.",
    "An ABI method signature alone does not prove safe execution or economic semantics.",
    "This probe neither constructs test transactions nor proves ERC4626/ERC20 interoperability."]};
}
if(require.main===module){
 const [a,b,root,out]=process.argv.slice(2);
 assert(a&&b&&root&&out,"Usage: <registered ERC-A> <registered ERC-B> <dependency-root> <out-dir>");
 probe(a,b,root).then(r=>{
  fs.mkdirSync(path.resolve(out),{recursive:true});
  fs.writeFileSync(path.join(path.resolve(out),"blind-vault-probe.json"),JSON.stringify(r,null,2)+"\n");
  console.log("OECL_BLIND_VAULT_PROBE",JSON.stringify({
   profiles:r.participants.map(p=>p.id),
   sourceHypotheses:r.participants.map(p=>p.sourceOnlyHypothesisCount),
   traced:r.participants.map(p=>p.operations.map(o=>({sig:o.signature,status:o.status,writes:o.writes.length,unresolved:o.unresolved,external:o.external}))),
   evmExecuted:false,candidateAdmission:r.candidateAdmission}));
 }).catch(e=>{console.error("OECL_VAULT_SOURCE_PROBE_FAILED",e.stack||e);process.exitCode=1;});
}
module.exports={probe,trace,FAMILIES};
