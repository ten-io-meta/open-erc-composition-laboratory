"use strict";
/**
 * Gated source→AST→ABI→preregister→local EVM stateful scientific cycle.
 * Registry-only immutable sources, exact locked solc/OZ and a reviewed ERC20
 * family fixture. No public dispatch, arbitrary Solidity, URL, private key
 * or remote Ethereum provider.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {choosePair,collectSources,compileAstBundle,resultRecord}=
  require("./run-generic-source-worker.cjs");
const {discoverGenericPair}=require("./GenericAstPairHypotheses.cjs");
const {evaluateFeasibility}=require("./ScientificAstPathFeasibility.cjs");
const {
  digest,hash,profiles,values,buildHarnessSource,signedProtocolBody,
  verifyStatefulPlan,expectedOutcome,expectedEvent,verifyStatefulWitness
}=require("./GenericStatefulEvmProtocol.cjs");

const [mode,idA,idB,rootArg,outArg]=process.argv.slice(2);
assert(["plan","execute"].includes(mode),"UNREVIEWED_STATEFUL_RUN_MODE");
assert(typeof idA==="string"&&typeof idB==="string"&&idA!==idB);
assert(rootArg&&outArg,"USAGE: <plan|execute> <profileA> <profileB> <locked-dependency-root> <output>");
const root=path.resolve(rootArg),output=path.resolve(outArg);
const planPath=path.join(output,"stateful-scientific-plan.json");
const witnessPath=path.join(output,"stateful-local-evm-witness.json");

function solidityCompile(collected,withSources){
  const compiler=collected.deps.solc;
  assert(/^0\.8\.26\+/.test(compiler.version()));
  const compiled=JSON.parse(compiler.compile(JSON.stringify({
    language:"Solidity",sources:withSources,
    settings:{optimizer:{enabled:false},outputSelection:{
      "*":{"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}
    }}
  })));
  const errors=(compiled.errors||[]).filter(e=>e.severity==="error");
  assert.equal(errors.length,0,"PINNED_SOURCE_OR_HARNESS_COMPILATION_FAILED:"+
    errors.slice(0,2).map(e=>e.errorCode||e.type).join(","));
  return compiled.contracts||{};
}
async function resolve(){
  const pair=choosePair(idA,idB);
  const gathered=await collectSources(pair,root);
  const {graph,buildInfo}=compileAstBundle(gathered);
  const primary=pair.map((ref,i)=>({
    id:ref.id,contract:ref.contract,unit:gathered.roots[i]
  }));
  const discovery=discoverGenericPair(graph,primary);
  assert.deepEqual(discovery.errors,[]);
  const feasibility=evaluateFeasibility(buildInfo,graph,discovery);
  const report=resultRecord(pair,gathered,graph,discovery,feasibility);
  const sources=Object.fromEntries([...gathered.files].map(([unit,v])=>
    [unit,{content:v.content}]));
  const original=solidityCompile(gathered,sources);
  const originalArtifacts=pair.map((ref,i)=>
    original[gathered.roots[i]]?.[ref.contract]||null);
  const wrappers=pair.map((ref,i)=>buildHarnessSource({
    id:ref.id,kind:ref.kind,contract:ref.contract,
    revision:ref.kind==="github"?ref.revision:"4.9.6",
    sourceUnit:gathered.roots[i]
  },i));
  const compiledSources={...sources};
  for(const w of wrappers)if(w)compiledSources[w.unit]={content:w.solidity};
  const compilation=wrappers.some(Boolean)?
    solidityCompile(gathered,compiledSources):original;
  const deployableArtifacts=wrappers.map(w=>w?
    compilation[w.unit]?.[w.contractName]||null:null);
  const plan=signedProtocolBody({
    report,graph,originalArtifacts,deployableArtifacts,wrappers,
    compilerVersion:gathered.deps.solc.version(),
    dependencyIntegrity:gathered.deps.integrity
  });
  assert(verifyStatefulPlan(plan),"INVALID_STATEFUL_PREREGISTRATION");
  return {plan,deployableArtifacts,wrappers};
}
async function execute(plan,compiled){
  assert(verifyStatefulPlan(plan));
  assert.equal(plan.workflowStatus,"REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED");
  assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat","REMOTE_PROVIDER_FORBIDDEN");
  process.chdir(root); // Resolve only the pinned local Hardhat project, never a remote RPC.
  const hre=require(path.join(root,"node_modules/hardhat"));
  const provider=hre.ethers.provider;
  const network=await provider.getNetwork();
  assert.equal(Number(network.chainId),31337,"NOT_EPHEMERAL_LOCAL_HARDHAT");
  const [owner,spender,recipient,attacker]=await hre.ethers.getSigners();
  const actors={owner:owner.address,spender:spender.address,
    recipient:recipient.address,attacker:attacker.address};
  const signers={OWNER:owner,SPENDER:spender,RECIPIENT:recipient,ATTACKER:attacker};
  const budget=plan.executionBudget.maxGasPerTransaction;
  const ifaceHashes=compiled.map((artifact,i)=>({
    abi:digest(artifact.abi),bytecode:hash(artifact.evm.bytecode.object),
    wrapper:plan.capabilities[i].harnessSourceSha256
  }));
  ifaceHashes.forEach((v,i)=>{
    assert.equal(v.abi,plan.capabilities[i].deployedAbiSha256);
    assert.equal(v.bytecode,plan.capabilities[i].creationBytecodeSha256);
  });
  const deployments=[],tokens=[];
  async function checkedTx(tx,target,who,method,evt,contract){
    const mined=await tx.wait(1);
    const rechecked=await provider.getTransactionReceipt(tx.hash);
    const block=await provider.getBlock(mined.blockNumber);
    const actual=await provider.getTransaction(tx.hash);
    assert(mined&&mined.status===1&&rechecked?.status===1);
    assert.equal(mined.transactionHash,tx.hash);
    assert.equal(rechecked.transactionHash,tx.hash);
    assert.equal(rechecked.blockHash,mined.blockHash);
    assert.equal(block.hash,mined.blockHash);
    assert(block.transactions.some(x=>x.toLowerCase()===tx.hash.toLowerCase()));
    assert.equal(actual.from.toLowerCase(),who.toLowerCase());
    assert.equal(target?actual.to?.toLowerCase():actual.to,
      target?target.toLowerCase():null);
    assert(mined.gasUsed.lte(budget),"EVM_TX_OVER_PRECOMMITTED_GAS");
    let event=null;
    if(evt){
      const decoded=[];
      for(const log of rechecked.logs){
        if(log.address.toLowerCase()!==target.toLowerCase())continue;
        try{
          const e=contract.interface.parseLog(log);
          if(e.name===evt.name){
            const from=e.args.from||e.args.owner;
            const to=e.args.to||e.args.spender;
            decoded.push({name:e.name,from,to,amount:e.args.value.toString()});
          }
        }catch{}
      }
      assert.equal(decoded.length,1,"EXPECTED_SINGLE_MAPPED_EVENT");
      event=decoded[0];
      assert.deepEqual({
        name:event.name,from:event.from.toLowerCase(),to:event.to.toLowerCase(),
        amount:event.amount
      },{
        name:evt.name,from:evt.from.toLowerCase(),to:evt.to.toLowerCase(),
        amount:evt.amount
      },"EVENT_WITNESS_DIFFERS_FROM_PRECOMMITTED_EFFECT");
    }
    return {
      txHash:tx.hash,blockHash:mined.blockHash,blockNumber:mined.blockNumber,
      status:mined.status,transactionMined:true,
      gasUsed:mined.gasUsed.toString(),fromAddress:actual.from,
      toAddress:actual.to,method,
      methodSelector:actual.data.slice(0,10),event
    };
  }
  for(let i=0;i<2;i++){
    const artifact=compiled[i];
    assert.equal(hash(artifact.evm.bytecode.object),
      plan.capabilities[i].creationBytecodeSha256);
    const contract=await new hre.ethers.ContractFactory(
      artifact.abi,"0x"+artifact.evm.bytecode.object,owner).deploy({
        gasLimit:budget
      });
    await contract.deployed();
    const receipt=await checkedTx(contract.deployTransaction,
      null,actors.owner,"CONSTRUCTOR",null,contract);
    assert.equal(receipt.toAddress,null);
    const mined=await provider.getTransactionReceipt(contract.deployTransaction.hash);
    assert.equal(mined.contractAddress.toLowerCase(),contract.address.toLowerCase());
    const code=await provider.getCode(contract.address,receipt.blockNumber);
    assert(code!=="0x"&&code.length>2);
    deployments.push({
      id:plan.selected[i].id,contractAddress:contract.address,
      runtimeCodeKeccak256:hre.ethers.utils.keccak256(code),receipt
    });
    tokens.push(contract);
  }
  async function snapshot(token){
    const values=await Promise.all([
      token.balanceOf(actors.owner),token.balanceOf(actors.recipient),
      token.balanceOf(actors.spender),token.balanceOf(actors.attacker),
      token.totalSupply(),token.allowance(actors.owner,actors.spender)
    ]);
    const result={};
    ["owner","recipient","spender","attacker","supply","allowance"].forEach(
      (key,i)=>result[key]=values[i].toString());
    return result;
  }
  function quantity(name){
    const mapping={MINTED:values.minted,APPROVED:values.approved,
      TRANSFER:values.transfer,BURN:values.burn,ZERO:values.zero,
      UNAUTHORIZED:values.unauthorized,
      OVER_ALLOWANCE:values.overAllowance,
      OVER_BALANCE:values.overBalance};
    const amount=mapping[name];
    assert(amount!==undefined,"UNREVIEWED_QUANTITY_ROLE");
    return amount;
  }
  function argumentsFor(step){
    const amount=quantity(step.quantityRole);
    if(step.id==="MINT_INITIAL")return [actors.owner,amount];
    if(step.id==="APPROVE_SPENDER")return [actors.spender,amount];
    if(["NO_ALLOWANCE_ATTACKER","OVER_ALLOWANCE_SPENDER",
        "AUTHORIZED_TRANSFER","ZERO_TRANSFER_BOUNDARY"].includes(step.id))
      return [actors.owner,actors.recipient,amount];
    if(["NO_ALLOWANCE_BURN_ATTACKER",
        "AUTHORIZED_BURN_FROM","ZERO_BURN_BOUNDARY"].includes(step.id))
      return [actors.owner,amount];
    if(step.id==="OVER_BALANCE_DIRECT_BURN")return [amount];
    throw Error("UNREGISTERED_STATEFUL_OPERATION");
  }
  async function runCase(token,step,role){
    const before=await snapshot(token);
    const args=argumentsFor(step);
    const method=token.connect(signers[step.caller]);
    assert(method&&typeof method[step.signature]==="function",
      "COMPILED_ABI_OPERATION_NOT_FOUND");
    const amount=quantity(step.quantityRole);
    let receipt=null,simulation=null,transactionMined=false,statePreserved=null;
    if(step.execution==="READ_ONLY_EXPECT_REVERT"){
      let reverted=false;
      try{
        await method.callStatic[step.signature](...args,{gasLimit:budget});
      }catch{reverted=true;}
      assert(reverted,"PREREGISTERED_REFUTER_DID_NOT_REVERT:"+step.id);
      simulation="ETH_CALL_REVERT";
      statePreserved=true;
      assert.deepEqual(await snapshot(token),before,
        "UNMINED_NEGATIVE_CONTROL_MUTATED_SOURCE_STATE");
    }else{
      const tx=await method[step.signature](...args,{gasLimit:budget});
      const evt=expectedEvent(step.id,actors);
      receipt=await checkedTx(tx,token.address,
        signers[step.caller].address,step.signature,evt,token);
      transactionMined=true;
    }
    const after=await snapshot(token);
    const expected=expectedOutcome(role,step.id,before);
    assert.deepEqual(after,expected,
      "REAL_EVM_STATE_DIFFERS_FROM_PRECOMMITTED_SCIENTIFIC_EXPECTATION:"+step.id);
    return {id:step.id,execution:step.execution,signature:step.signature,
      caller:step.caller,quantityRole:step.quantityRole,quantity:amount,
      before,after,receipt,simulation,transactionMined,statePreserved};
  }
  const participantReports=[];
  let previousState=null;
  for(let i=0;i<2;i++){
    if(i===1)previousState=await snapshot(tokens[0]);
    const protocol=plan.experimentalCases[i],token=tokens[i],records=[];
    assert.deepEqual(await snapshot(token),{
      owner:"0",recipient:"0",spender:"0",attacker:"0",supply:"0",allowance:"0"
    },"UNEXPECTED_INITIAL_ACCOUNTING");
    for(const step of protocol.steps)
      records.push(await runCase(token,step,protocol.role));
    const finalState=await snapshot(token);
    participantReports.push({
      id:protocol.id,role:protocol.role,contractAddress:token.address,
      cases:records,finalState,
      minedTransactions:records.filter(x=>x.transactionMined).length,
      unminedNegativeControls:records.filter(x=>!x.transactionMined).length
    });
  }
  const otherUnchanged=JSON.stringify(previousState)===
    JSON.stringify(await snapshot(tokens[0]));
  assert(otherUnchanged,"INDEPENDENT_TOKEN_AFFECTED_BY_UNRELATED_TOKEN_OPERATIONS");
  const witness={
    schemaVersion:"OECL_GENERIC_STATEFUL_ERC20_LOCAL_EVM_V1",
    selected:plan.selected.map(x=>x.id),planSha256:plan.planSha256,
    chainId:31337,
    providerScope:"EPHEMERAL_LOCAL_HARDHAT_RECEIPT_RECHECKED",
    actors,deployments,participants:participantReports,evmExecuted:true,
    minedReceiptCount:deployments.length+
      participantReports.reduce((n,p)=>n+p.minedTransactions,0),
    unminedNegativeCount:participantReports.reduce(
      (n,p)=>n+p.unminedNegativeControls,0),
    isolationCheck:{otherTokenUnchanged:otherUnchanged},
    fixtureHasUnsafeTestMint:true,crossContractAtomicityProven:false,
    generalCompatibilityClaim:false,
    outcome:"SCOPED_TRANSFER_AND_BURN_BEHAVIOR_OBSERVED",
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "This is a fixed registered ERC20/ ERC20Burnable in-memory fixture, not arbitrary Solidity EVM test synthesis.",
      "A generated wrapper exposes test-only, unprotected minting and is not the unchanged original deployed code.",
      "State-changing successful calls are mined; negative controls are unmined callStatic reverts.",
      "These are two independent token deployments; no atomic composability or cross-contract custody was tested.",
      "Receipts and block hashes were rechecked against the same local Hardhat provider, not authenticated to mainnet."
    ]
  };
  assert(verifyStatefulWitness(plan,witness),
    "SCOPED_LOCAL_EVM_WITNESS_AND_ACCOUNTING_REJECTED");
  return witness;
}
async function main(){
  fs.mkdirSync(output,{recursive:true});
  const generated=await resolve();
  const plan=generated.plan;
  if(mode==="plan"){
    fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+"\n");
    console.log("OECL_STATEFUL_AST_ABI_PROTOCOL",JSON.stringify({
      selected:plan.selected.map(x=>x.id),workflowStatus:plan.workflowStatus,
      blocked:plan.blockedReasons,planSha256:plan.planSha256,
      evmExecuted:false,caseCount:plan.experimentalCases.map(x=>x.steps.length)
    }));
    return;
  }
  const registered=JSON.parse(fs.readFileSync(planPath,"utf8"));
  assert(verifyStatefulPlan(registered),"UNVERIFIED_PREDEPLOYMENT_PLAN");
  assert.deepEqual(registered,plan,
    "PINNED_AST_ABI_QUANTITY_OR_CONTROL_CHANGED_AFTER_PREREGISTRATION");
  if(plan.workflowStatus!=="REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED"){
    console.log("OECL_STATEFUL_EVM_REFUSED",JSON.stringify(plan.blockedReasons));
    return;
  }
  const witness=await execute(plan,generated.deployableArtifacts);
  fs.writeFileSync(witnessPath,JSON.stringify(witness,null,2)+"\n");
  console.log("OECL_STATEFUL_REAL_LOCAL_EVM_PASS",JSON.stringify({
    selected:witness.selected,mined:witness.minedReceiptCount,
    unminedNegative:witness.unminedNegativeCount,
    outcome:witness.outcome,compatibilityVerdict:witness.compatibilityVerdict,
    admission:witness.candidateAdmission
  }));
}
main().catch(e=>{console.error("OECL_STATEFUL_REAL_EVM_FAILED:",e.stack||String(e));process.exitCode=1;});