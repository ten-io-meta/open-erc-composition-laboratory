"use strict";
/**
 * Only trusted CI invokes this local pinned Solidity EVM scientific worker.
 * plan is built independently BEFORE execute; immutable source/AST/ABI/harness
 * recompilation must re-create exactly the same experiment plan.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {choosePair,collectSources,compileAstBundle,resultRecord}=
  require("./run-generic-source-worker.cjs");
const {discoverGenericPair}=require("./GenericAstPairHypotheses.cjs");
const {evaluateFeasibility}=require("./ScientificAstPathFeasibility.cjs");
const {
  hash,digest,ZERO,PROFILES,QUANTITIES,pinnedSource,reviewedWrapper,
  derivePlan,verifyPlan,initialState,stepEffect,expectedEvent,verifyWitness
}=require("./GenericNftAuthorizationEvmProtocol.cjs");
const [mode,idA,idB,rootArg,outArg]=process.argv.slice(2);
assert(["plan","execute"].includes(mode),"UNREVIEWED_OWNERSHIP_RUN_MODE");
assert(idA&&idB&&idA!==idB&&rootArg&&outArg,"INVALID_OWNERSHIP_INVOCATION");
const root=path.resolve(rootArg),out=path.resolve(outArg);
const planPath=path.join(out,"ownership-experiment-plan.json");
const witnessPath=path.join(out,"ownership-local-evm-witness.json");

function compile(gathered,sources){
  const c=gathered.deps.solc;
  assert(/^0\.8\.26\+/.test(c.version()));
  const r=JSON.parse(c.compile(JSON.stringify({
    language:"Solidity",sources,
    settings:{optimizer:{enabled:false},outputSelection:{
      "*":{"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}
    }}
  })));
  const errors=(r.errors||[]).filter(x=>x.severity==="error");
  assert.equal(errors.length,0,"PINNED_NFT_SOURCE_COMPILE_FAILURE:"+
    errors.slice(0,2).map(x=>x.formattedMessage).join("|"));
  return r.contracts||{};
}
async function resolve(){
  const pair=choosePair(idA,idB),gathered=await collectSources(pair,root);
  const {graph,buildInfo}=compileAstBundle(gathered);
  const participants=pair.map((ref,i)=>({
    id:ref.id,contract:ref.contract,unit:gathered.roots[i]}));
  const discovery=discoverGenericPair(graph,participants);
  assert.deepEqual(discovery.errors,[]);
  const feasibility=evaluateFeasibility(buildInfo,graph,discovery);
  const report=resultRecord(pair,gathered,graph,discovery,feasibility);
  const sources=Object.fromEntries([...gathered.files].map(([unit,v])=>
    [unit,{content:v.content}]));
  const baseline=compile(gathered,sources);
  const originalArtifacts=pair.map((ref,i)=>
    baseline[gathered.roots[i]]?.[ref.contract]||null);
  const selected=pinnedSource(report);
  const wrappers=selected.map((src,i)=>reviewedWrapper(src,i));
  const input={...sources};
  wrappers.filter(Boolean).forEach(w=>{input[w.unit]={content:w.solidity};});
  const generated=wrappers.some(Boolean)?compile(gathered,input):baseline;
  const deployableArtifacts=wrappers.map(w=>w?
    generated[w.unit]?.[w.contractName]||null:null);
  const plan=derivePlan({
    graph,report,originalArtifacts,deployableArtifacts,wrappers,
    compilerVersion:gathered.deps.solc.version(),
    dependencyIntegrity:gathered.deps.integrity
  });
  assert(verifyPlan(plan),"OWNERSHIP_EXPERIMENT_PREREGISTRATION_REFUSED");
  return {plan,artifacts:deployableArtifacts};
}
async function localEvm(plan,artifacts){
  assert(verifyPlan(plan));
  assert.equal(plan.workflowStatus,"REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED");
  assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat",
    "REMOTE_HARDHAT_NETWORK_NOT_ALLOWED");
  process.chdir(root);
  const hre=require(path.join(root,"node_modules/hardhat"));
  const provider=hre.ethers.provider;
  assert.equal(Number((await provider.getNetwork()).chainId),31337);
  const [owner,spender,recipient,attacker]=await hre.ethers.getSigners();
  const actors={owner:owner.address,spender:spender.address,
    recipient:recipient.address,attacker:attacker.address};
  const signers={OWNER:owner,SPENDER:spender,RECIPIENT:recipient,ATTACKER:attacker};
  const budget=plan.executionBudget.maxGasPerTransaction;
  for(let i=0;i<2;i++){
    assert(artifacts[i]&&artifacts[i].abi&&artifacts[i].evm?.bytecode?.object);
    assert.equal(digest(artifacts[i].abi),
      plan.capabilities[i].deployedAbiSha256);
    assert.equal(hash(artifacts[i].evm.bytecode.object),
      plan.capabilities[i].creationBytecodeSha256);
  }
  async function checkedTx(tx,target,caller,method,wanted,contract){
    const mined=await tx.wait(1);
    const rechecked=await provider.getTransactionReceipt(tx.hash);
    const block=await provider.getBlock(mined.blockNumber);
    const actual=await provider.getTransaction(tx.hash);
    assert(mined&&mined.status===1&&rechecked?.status===1);
    assert.equal(rechecked.transactionHash,tx.hash);
    assert.equal(rechecked.blockHash,mined.blockHash);
    assert.equal(block.hash,mined.blockHash);
    assert(block.transactions.some(x=>x.toLowerCase()===tx.hash.toLowerCase()));
    assert.equal(actual.from.toLowerCase(),actors[caller.toLowerCase()].toLowerCase());
    assert.equal(actual.to?.toLowerCase()||null,target?.toLowerCase()||null);
    assert(mined.gasUsed.lte(budget),"TRANSACTION_EXCEEDS_BOUNDED_GAS");
    let parsed=null;
    if(wanted){
      const matches=[];
      for(const log of rechecked.logs){
        if(log.address.toLowerCase()!==target.toLowerCase())continue;
        try{
          const event=contract.interface.parseLog(log);
          if(event.name===wanted.name){
            const args=event.args;
            const candidate=event.name==="Transfer"?{
              name:event.name,from:args[0],to:args[1],tokenId:args[2].toString()
            }:event.name==="TransferSingle"?{
              name:event.name,operator:args[0],from:args[1],to:args[2],
              tokenId:args[3].toString(),amount:args[4].toString()
            }:event.name==="Approval"?{
              name:event.name,from:args[0],to:args[1],tokenId:args[2].toString()
            }:event.name==="ApprovalForAll"?{
              name:event.name,from:args[0],to:args[1],approved:args[2]
            }:null;
            if(candidate)matches.push(candidate);
          }
        }catch{}
      }
      assert.equal(matches.length,1,"EXPECTED_ONE_TYPED_EVENT");
      const norm=x=>JSON.stringify(x).toLowerCase();
      assert.equal(norm(matches[0]),norm(wanted),"MINED_EVENT_ARGUMENTS_DIFFER");
      parsed=matches[0];
    }
    return {txHash:tx.hash,blockHash:mined.blockHash,
      blockNumber:mined.blockNumber,status:mined.status,
      transactionMined:true,gasUsed:mined.gasUsed.toString(),
      fromAddress:actual.from,toAddress:actual.to,method,
      methodSelector:actual.data.slice(0,10),event:parsed};
  }
  const deployments=[],contracts=[];
  for(let i=0;i<2;i++){
    const a=artifacts[i];
    const c=await new hre.ethers.ContractFactory(
      a.abi,"0x"+a.evm.bytecode.object,owner).deploy({gasLimit:budget});
    await c.deployed();
    const receipt=await checkedTx(c.deployTransaction,null,"OWNER",
      "CONSTRUCTOR",null,c);
    const real=await provider.getTransactionReceipt(c.deployTransaction.hash);
    assert.equal(real.contractAddress.toLowerCase(),c.address.toLowerCase());
    const code=await provider.getCode(c.address,receipt.blockNumber);
    assert(code!=="0x"&&code.length>2);
    deployments.push({id:plan.selected[i].id,contractAddress:c.address,
      runtimeCodeKeccak256:hre.ethers.utils.keccak256(code),receipt});
    contracts.push(c);
  }
  async function snapshot(id,contract){
    if(id==="ERC-1155"){
      const [a,b,approved]=await Promise.all([
        contract["balanceOf(address,uint256)"](actors.owner,"101"),
        contract["balanceOf(address,uint256)"](actors.recipient,"101"),
        contract.isApprovedForAll(actors.owner,actors.spender)
      ]);
      return {ownerBalance:a.toString(),recipientBalance:b.toString(),
        operatorApproved:approved};
    }
    const [a,b,approved]=await Promise.all([
      contract.balanceOf(actors.owner),contract.balanceOf(actors.recipient),
      contract.isApprovedForAll(actors.owner,actors.spender)
    ]);
    const owners={};
    for(const id of QUANTITIES.tokenIds){
      try{owners[id]=await contract.ownerOf(id);}
      catch{owners[id]=null;}
    }
    let approved101=null;
    if(owners["101"]!==null)approved101=await contract.getApproved("101");
    return {ownerBalance:a.toString(),recipientBalance:b.toString(),
      operatorApproved:approved,owners,token101Approved:approved101};
  }
  function argsFor(profile,id){
    if(profile==="ERC-721"){
      switch(id){
        case "MINT_101":return [actors.owner,"101"];
        case "MINT_102":return [actors.owner,"102"];
        case "MINT_103":return [actors.owner,"103"];
        case "UNAPPROVED_TRANSFER":
        case "TRANSFER_TOKEN_APPROVED":return [actors.owner,actors.recipient,"101"];
        case "SINGLE_TOKEN_APPROVE":return [actors.spender,"101"];
        case "STALE_APPROVAL_REUSE":return [actors.recipient,actors.owner,"101"];
        case "GLOBAL_APPROVE":return [actors.spender,true];
        case "TRANSFER_GLOBAL_OPERATOR":return [actors.owner,actors.recipient,"102"];
        case "GLOBAL_REVOKE":return [actors.spender,false];
        case "REVOKED_OPERATOR_TRANSFER":return [actors.owner,actors.recipient,"103"];
        case "ZERO_ADDRESS_RECIPIENT":return [actors.owner,ZERO,"103"];
      }
    }else{
      switch(id){
        case "MINT_100":return [actors.owner,"101","100"];
        case "GLOBAL_APPROVE":return [actors.spender,true];
        case "GLOBAL_REVOKE":return [actors.spender,false];
        case "UNAPPROVED_TRANSFER":
        case "REVOKED_OPERATOR_TRANSFER":return [
          actors.owner,actors.recipient,"101","1","0x"];
        case "OVERBALANCE_TRANSFER":return [
          actors.owner,actors.recipient,"101","101","0x"];
        case "TRANSFER_25":return [
          actors.owner,actors.recipient,"101","25","0x"];
        case "ZERO_TRANSFER":return [
          actors.owner,actors.recipient,"101","0","0x"];
        case "ZERO_ADDRESS_RECIPIENT":return [
          actors.owner,ZERO,"101","1","0x"];
      }
    }
    throw Error("UNREGISTERED_STATEFUL_OWNERSHIP_CALL:"+id);
  }
  const participants=[];
  let previousFirst;
  for(let i=0;i<2;i++){
    const profile=plan.selected[i].id,contract=contracts[i],cases=[];
    const prepared=plan.experimentalCases[i];
    if(i===1)previousFirst=await snapshot(plan.selected[0].id,contracts[0]);
    assert.deepEqual(await snapshot(profile,contract),initialState(profile));
    for(const step of prepared.steps){
      const before=await snapshot(profile,contract);
      const connected=contract.connect(signers[step.caller]);
      const args=argsFor(profile,step.id);
      const target=connected[step.signature];
      assert(typeof target==="function","PREREGISTERED_TYPED_ABI_NOT_IN_DEPLOYED_CONTRACT");
      let receipt=null,simulation=null,transactionMined=false,
        statePreserved=null;
      if(step.execution==="EXPECT_UNMINED_REVERT"){
        let reverted=false;
        try{
          await connected.callStatic[step.signature](...args,{gasLimit:budget});
        }catch{reverted=true;}
        assert(reverted,"EXPECTED_ROLE_OR_BOUNDARY_REVERT_NOT_OBSERVED:"+step.id);
        simulation="ETH_CALL_REVERT";statePreserved=true;
        assert.deepEqual(await snapshot(profile,contract),before);
      }else{
        const tx=await target(...args,{gasLimit:budget});
        receipt=await checkedTx(tx,contract.address,step.caller,
          step.signature,expectedEvent(profile,step.id,actors),contract);
        transactionMined=true;
      }
      const after=await snapshot(profile,contract);
      assert.deepEqual(after,stepEffect(profile,step.id,before,actors),
        "EVM_OWNER_OPERATOR_BALANCE_DIFFERS_FROM_PRECOMMITTED_MODEL:"+step.id);
      cases.push({...step,before,after,receipt,simulation,transactionMined,
        statePreserved});
    }
    participants.push({
      id:profile,contractAddress:contract.address,cases,
      finalState:await snapshot(profile,contract),
      minedTransactions:cases.filter(x=>x.transactionMined).length,
      unminedNegativeControls:cases.filter(x=>!x.transactionMined).length
    });
  }
  const unchanged=JSON.stringify(previousFirst)===
    JSON.stringify(await snapshot(plan.selected[0].id,contracts[0]));
  assert(unchanged,"UNRELATED_SECOND_FIXTURE_CHANGED_FIRST_TOKEN");
  const witness={
    schemaVersion:"OECL_OWNERSHIP_LOCAL_EVM_WITNESS_V1",
    selected:plan.selected.map(s=>s.id),planSha256:plan.planSha256,
    chainId:31337,providerScope:"EPHEMERAL_LOCAL_HARDHAT_BLOCK_RECHECKED",
    actors,deployments,participants,
    minedReceiptCount:deployments.length+
      participants.reduce((n,x)=>n+x.minedTransactions,0),
    unminedNegativeCount:participants.reduce(
      (n,x)=>n+x.unminedNegativeControls,0),
    isolationCheck:{firstFixtureUnchanged:unchanged},
    evmExecuted:true,scientificVerdict:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    crossContractInteroperabilityProven:false,
    originalContractsUnmodified:false,fixtureHasUnsafeResearchMint:true,
    outcome:"SCOPED_ROLE_BASED_TRANSFERS_OBSERVED",
    limitations:[
      "This local experiment uses a reviewed, intentionally unprotected mint fixture—not an unchanged ERC721 or ERC1155 deployment.",
      "Receipt and block identities were checked on the same ephemeral Hardhat provider.",
      "All eight expected reverts were eth_call simulations without mined receipts.",
      "No atomic cross-contract composability, production permission model or mainnet validation is claimed."
    ]
  };
  assert(verifyWitness(plan,witness),"INDEPENDENT_OWNERSHIP_WITNESS_GATE_REJECTED");
  return witness;
}
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const {plan,artifacts}=await resolve();
  if(mode==="plan"){
    fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+"\n");
    if(plan.workflowStatus!=="REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED")
      console.log("OECL_OWNERSHIP_AST_DEBUG",JSON.stringify(
        plan.capabilities.map(c=>({id:c.id,ast:c.sourceAST,status:c.status}))));
    console.log("OECL_OWNERSHIP_AST_ABI_PREREGISTRATION",JSON.stringify({
      selected:plan.selected.map(x=>x.id),status:plan.workflowStatus,
      blockers:plan.blockedReasons,planSha256:plan.planSha256,
      experimentalCases:plan.experimentalCases.map(x=>x.steps.length),
      evmExecuted:false}));
    return;
  }
  const archived=JSON.parse(fs.readFileSync(planPath,"utf8"));
  assert(verifyPlan(archived),"ORIGINAL_PREREGISTRATION_INVALID");
  assert.deepEqual(archived,plan,"PINNED_SOURCE_ABI_HARNESS_OR_FALSIFIERS_CHANGED");
  if(plan.workflowStatus!=="REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED"){
    console.log("OECL_OWNERSHIP_EVM_BLOCKED",JSON.stringify(plan.blockedReasons));
    return;
  }
  const witness=await localEvm(plan,artifacts);
  fs.writeFileSync(witnessPath,JSON.stringify(witness,null,2)+"\n");
  console.log("OECL_OWNERSHIP_LOCAL_EVM_PASS",JSON.stringify({
    selected:witness.selected,mined:witness.minedReceiptCount,
    unminedNegative:witness.unminedNegativeCount,
    scope:witness.outcome,compatibilityVerdict:witness.compatibilityVerdict,
    admission:witness.candidateAdmission
  }));
}
main().catch(e=>{console.error("OECL_OWNERSHIP_EVM_FAILURE:",e.stack||String(e));
  process.exitCode=1;});