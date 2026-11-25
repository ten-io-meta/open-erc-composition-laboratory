"use strict";
/**
 * Two-stage generic experiment: compiler AST / ABI / bytecode preregistration
 * BEFORE any EVM transaction, followed by isolated local Hardhat deployment
 * and read-only interface challenge ONLY for a reviewed safe capability.
 *
 * Not a public runner. No arbitrary Solidity, URLs, scripts, RPCs or wallet.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {choosePair,collectSources,compileAstBundle,resultRecord}=
  require("./run-generic-source-worker.cjs");
const {discoverGenericPair}=require("./GenericAstPairHypotheses.cjs");
const {evaluateFeasibility}=require("./ScientificAstPathFeasibility.cjs");
const {deriveProtocol,verifyProtocol,verifyWitness,canonical,digest,TEST_VECTORS,SIGNATURE,EVIDENCE}=
  require("./GenericReadOnlyAbiEvmProtocol.cjs");

const mode=process.argv[2],idA=process.argv[3],idB=process.argv[4];
const root=path.resolve(process.argv[5]||"dependency-source");
const out=path.resolve(process.argv[6]||"source-output/generic-readonly");
assert(["plan","execute"].includes(mode),"INVALID_RUN_MODE");
assert(typeof idA==="string"&&typeof idB==="string"&&idA!==idB);
const planPath=path.join(out,"generic-read-only-plan.json");

function buildAbi(collected,pair){
  const compiler=collected.deps.solc;
  assert(/^0\.8\.26\+/.test(compiler.version()));
  const sources=Object.fromEntries([...collected.files].map(([unit,v])=>[unit,{content:v.content}]));
  const settings={optimizer:{enabled:false},outputSelection:{
    "*":{"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}
  }};
  const compile=withSources=>JSON.parse(compiler.compile(
    JSON.stringify({language:"Solidity",sources:withSources,settings})));
  const base=compile(sources);
  const errors=(base.errors||[]).filter(e=>e.severity==="error");
  assert.equal(errors.length,0,"LOCKED_EVM_BYTECODE_COMPILATION_FAILED");
  return pair.map((source,i)=>{
    const unit=collected.roots[i],original=base.contracts?.[unit]?.[source.contract];
    assert(original?.abi,"PINNED_PRIMARY_CONTRACT_ABI_NOT_FOUND");
    // Preserve native concrete bytecode and constructor when possible.
    if(original?.evm?.bytecode?.object)return original;
    // The audited OpenZeppelin ERC165 and ERC2981 bases are abstract despite
    // implementing their methods. Inheritance-only wrapper creation is safe
    // only for already reviewed, pinned OZ registry profiles.
    if(source.kind!=="openzeppelin")return original;
    assert(/^[A-Za-z][A-Za-z0-9_]{0,80}$/.test(source.contract));
    assert(unit.startsWith("@openzeppelin/contracts/")&&
      /^[A-Za-z0-9_./-]+$/.test(unit.slice("@openzeppelin/contracts/".length))&&
      !unit.includes("..")&&unit.endsWith(".sol"));
    const wrapper="OECLReadOnlyAuto"+i;
    const filename="OECL_Auto_Registered_Only_"+i+".sol";
    const solidity=[
      "// SPDX-License-Identifier: MIT",
      "pragma solidity ^0.8.20;",
      'import "'+unit+'";',
      "contract "+wrapper+" is "+source.contract+" {}",
      ""
    ].join("\n");
    const generated=compile({...sources,[filename]:{content:solidity}});
    const generatedErrors=(generated.errors||[]).filter(e=>e.severity==="error");
    if(generatedErrors.length)return original; // Safely blocked, never guess constructor args.
    const instantiated=generated.contracts?.[filename]?.[wrapper];
    if(!instantiated?.abi||!instantiated?.evm?.bytecode?.object)return original;
    return {...instantiated,oeclWrapperSha256:digest(solidity)};
  });
}
async function resolve(){
  const pair=choosePair(idA,idB);
  const collected=await collectSources(pair,root);
  const {graph,buildInfo}=compileAstBundle(collected);
  const participants=pair.map((e,i)=>({
    id:e.id,contract:e.contract,unit:collected.roots[i]
  }));
  const discovery=discoverGenericPair(graph,participants);
  assert.deepEqual(discovery.errors,[]);
  const feasibility=evaluateFeasibility(buildInfo,graph,discovery);
  const report=resultRecord(pair,collected,graph,discovery,feasibility);
  const compiled=buildAbi(collected,pair);
  const plan=deriveProtocol({graph,report,artifacts:compiled,
    compilerVersion:collected.deps.solc.version(),
    dependencyIntegrity:collected.deps.integrity});
  assert(verifyProtocol(plan),"PREREGISTERED_PROTOCOL_FAILED_RECHECK");
  return {plan,compiled,report};
}
async function execute(plan,compiled){
  assert(verifyProtocol(plan),"CANNOT_EXECUTE_INVALID_PROTOCOL");
  assert.equal(plan.workflowStatus,"PREREGISTERED_SAFE_READ_ONLY_PROTOCOL",
    "NO_REVIEWED_GENERIC_EVM_ADAPTER");
  assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat","EXTERNAL_RPC_DISALLOWED");
  // Hardhat 2's ephemeral local provider is the only allowed execution target.
  process.chdir(root);
  const hre=require(path.join(root,"node_modules/hardhat"));
  const chain=await hre.ethers.provider.getNetwork();
  assert.equal(Number(chain.chainId),31337,"NOT_LOCAL_HARDHAT_CHAIN");
  const provider=hre.ethers.provider;
  const [owner]=await hre.ethers.getSigners();
  const receipts=[];
  const contracts=[];
  for(let i=0;i<2;i++){
    const c=compiled[i];
    assert.equal(digest(c.evm.bytecode.object),plan.compiled[i].creationBytecodeSha256);
    assert.equal(canonical(c.abi),plan.compiled[i].abiSha256);
    assert.equal(c.oeclWrapperSha256||null,plan.compiled[i].wrapperSourceSha256,
      "DEPLOYMENT_WRAPPER_SOURCE_CHANGED_AFTER_PREREGISTRATION");
    const contract=await new hre.ethers.ContractFactory(
      c.abi,"0x"+c.evm.bytecode.object,owner).deploy();
    await contract.deployed();
    const tx=contract.deployTransaction;
    const receipt=await tx.wait(1);
    const check=await provider.getTransactionReceipt(tx.hash);
    const block=await provider.getBlock(receipt.blockNumber);
    const transaction=await provider.getTransaction(tx.hash);
    assert(check&&receipt.status===1&&check.status===1);
    assert.equal(receipt.transactionHash,tx.hash);
    assert.equal(check.blockHash,receipt.blockHash);
    assert.equal(block.hash,receipt.blockHash);
    assert(block.transactions.some(x=>x.toLowerCase()===tx.hash.toLowerCase()));
    assert.equal(transaction.to,null,"EXPECTED_CONTRACT_CREATION");
    assert.equal(check.contractAddress.toLowerCase(),contract.address.toLowerCase());
    const code=await provider.getCode(contract.address,receipt.blockNumber);
    assert(code!=="0x"&&code.length>2,"CONTRACT_CREATION_NO_RUNTIME_CODE");
    receipts.push({
      id:plan.selected[i].id,contractAddress:contract.address,
      txHash:tx.hash,blockHash:receipt.blockHash,
      blockNumber:receipt.blockNumber,
      status:receipt.status,transactionMined:true,
      codeKeccak256:hre.ethers.utils.keccak256(code)
    });
    contracts.push(contract);
  }
  const probes=[];
  for(const vector of TEST_VECTORS){
    const responses=[];
    for(let i=0;i<2;i++){
      const contract=contracts[i],iface=contract.interface;
      const data=iface.encodeFunctionData(SIGNATURE,[vector]);
      const raw=await provider.call({to:contract.address,from:owner.address,data});
      assert(/^0x[0-9a-f]{64}$/i.test(raw),
        "EVM_RETURN_NOT_ABI_DECODABLE_AS_BOOLEAN_WORD");
      const decoded=iface.decodeFunctionResult(SIGNATURE,raw);
      assert.equal(decoded.length,1);
      assert(typeof decoded[0]==="boolean","NONCANONICAL_BOOLEAN_ABI_RESPONSE");
      responses.push({
        id:plan.selected[i].id,contractAddress:contract.address,
        returnData:raw,value:decoded[0]
      });
    }
    probes.push({method:SIGNATURE,vector,transactionMined:false,responses});
  }
  assert.equal(probes.length*2,plan.candidate.maxReadOnlyCalls);
  const differences=probes.filter(x=>x.responses[0].value!==x.responses[1].value);
  const result={
    schemaVersion:"OECL_GENERIC_ABI_READ_ONLY_EVM_WITNESS_V1",
    selected:plan.selected.map(x=>x.id),planSha256:plan.planSha256,
    chainId:31337,providerScope:EVIDENCE,evmExecuted:true,
    deployments:receipts,
    readOnlyProbes:probes,
    differingVectorCount:differences.length,
    outcome:differences.length?
      "SCOPED_DIFFERENCE_OBSERVED":"NO_DIFFERENCE_OBSERVED_IN_SAMPLED_INPUTS",
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",globalInteroperabilityClaim:false,
    limitations:[
      "This local EVM execution was limited to registry-pinned deployable contracts with zero-input constructors and a verified supportsInterface(bytes4) ABI.",
      "Only three preregistered interface identifiers were sampled; other interfaces, roles, callbacks and economic semantics were not evaluated.",
      "Deployment receipts were independently queried on the same ephemeral Hardhat provider, not authenticated to Ethereum mainnet.",
      "All six supportsInterface probes were eth_call; they are not mined transaction receipts.",
      "The comparison does not imply general compatibility or incompatibility."
    ]
  };
  if(differences.length&& !verifyWitness(plan,result))
    throw Error("INDEPENDENT_EVIDENCE_CONTRACT_REJECTED");
  return result;
}
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const generated=await resolve();
  const plan=generated.plan;
  if(mode==="plan"){
    fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+"\n");
    console.log("OECL_GENERIC_ABI_PREREGISTERED",JSON.stringify({
      pair:plan.selected.map(x=>x.id),
      workflowStatus:plan.workflowStatus,blocked:plan.blockedReasons,
      planSha256:plan.planSha256,localEvmExecuted:false}));
    return;
  }
  const previous=JSON.parse(fs.readFileSync(planPath,"utf8"));
  assert(verifyProtocol(previous));
  assert.deepEqual(previous,plan,"PINNED_SOURCE_ABI_OR_PROTOCOL_CHANGED_BETWEEN_PLAN_AND_EVM");
  if(plan.workflowStatus!=="PREREGISTERED_SAFE_READ_ONLY_PROTOCOL"){
    console.log("OECL_GENERIC_ABI_EVM_BLOCKED",JSON.stringify(plan.blockedReasons));
    // Refuse to execute any contract if both reviewed capability gates do not pass.
    return;
  }
  const witness=await execute(plan,generated.compiled);
  fs.writeFileSync(path.join(out,"generic-read-only-evm-witness.json"),
    JSON.stringify(witness,null,2)+"\n");
  console.log("OECL_GENERIC_ABI_EVM_LOCAL_RECEIPTS",JSON.stringify({
    selected:witness.selected,deployments:witness.deployments.length,
    readOnlyCalls:witness.readOnlyProbes.length*2,
    scopedDifferentVectors:witness.differingVectorCount,
    outcome:witness.outcome,compatibilityVerdict:witness.compatibilityVerdict
  }));
}
main().catch(e=>{console.error("OECL_GENERIC_ABI_EVM_FAILED:",e.stack||String(e));process.exitCode=1;});