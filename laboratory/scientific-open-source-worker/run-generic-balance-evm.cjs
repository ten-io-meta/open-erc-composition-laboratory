"use strict";
/**
 * Local-only pinned generic balance grammar EVM. Never accepts user calldata.
 * Existing source-only hypotheses stay NOT_ADMITTED; this is a separately
 * reviewed fixture policy, not an open ABI-dispatch endpoint.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {runPinnedPair}=require("./SourceBackedHypothesisBridge.cjs");
const {choosePair,collectSources}=require("./run-generic-source-worker.cjs");
const {POLICY,CASES,fixture,planFor,verifyPlan,verifyWitness,hash,sha256}=
  require("./GenericBalanceEvmProtocol.cjs");
const ZERO="0x"+"0".repeat(40);
const [mode,idA,idB,rootArg,outArg]=process.argv.slice(2);
assert(["plan","execute"].includes(mode),"UNREVIEWED_GENERIC_EVM_RUN_MODE");
assert(idA&&idB&&idA!==idB&&rootArg&&outArg,"INVALID_GENERIC_EVM_INVOCATION");
const root=path.resolve(rootArg),out=path.resolve(outArg);
const planPath=path.join(out,"generic-balance-plan.json");
const witnessPath=path.join(out,"generic-balance-witness.json");
function compile(gathered,sources){
  const solc=gathered.deps.solc;
  assert(/^0\.8\.26\+/.test(solc.version()));
  const output=JSON.parse(solc.compile(JSON.stringify({language:"Solidity",sources,
    settings:{optimizer:{enabled:false},outputSelection:{
      "*":{"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}
    }}})));
  const errors=(output.errors||[]).filter(x=>x.severity==="error");
  assert.equal(errors.length,0,"LOCKED_GENERIC_BALANCE_SOLC_ERROR:"+
    errors.slice(0,2).map(e=>e.formattedMessage).join(" | "));
  return output.contracts||{};
}
async function resolve(){
  const sourceReport=await runPinnedPair(idA,idB,root);
  const pair=choosePair(idA,idB),gathered=await collectSources(pair,root);
  const sourceInput=Object.fromEntries([...gathered.files].map(([unit,x])=>
    [unit,{content:x.content}]));
  const baseline=compile(gathered,sourceInput);
  const originals=pair.map((ref,i)=>baseline[gathered.roots[i]]?.[ref.contract]||null);
  const fixtures=sourceReport.participants.map((p,i)=>fixture(p,i));
  const combined={...sourceInput};
  for(const f of fixtures.filter(Boolean))combined[f.unit]={content:f.solidity};
  const compiled=fixtures.some(Boolean)?compile(gathered,combined):baseline;
  const deployables=fixtures.map(f=>f?compiled[f.unit]?.[f.contractName]||null:null);
  const plan=planFor(sourceReport,originals,deployables,fixtures);
  assert(verifyPlan(plan),"GENERIC_BALANCE_PLAN_VERIFICATION_FAILED");
  return {plan,deployables};
}
const number=x=>BigInt(x);
function nextState(before,step){
  const s=Object.fromEntries(Object.entries(before).map(([k,v])=>[k,number(v)]));
  if(step==="MINT_100"){s.ownerBalance+=100n;s.totalSupply+=100n;}
  if(step==="TRANSFER_25"||step==="TRANSFER_10"){
    const n=step==="TRANSFER_25"?25n:10n;
    s.ownerBalance-=n;s.recipientBalance+=n;
  }
  return Object.fromEntries(Object.entries(s).map(([k,v])=>[k,v.toString()]));
}
async function localEvm(plan,deployables){
  assert(verifyPlan(plan));
  assert.equal(plan.workflowStatus,"REVIEWED_BALANCE_OPERATIONS_PREREGISTERED");
  assert.equal(process.env.HARDHAT_NETWORK||"hardhat","hardhat",
    "EXTERNAL_HARDHAT_NETWORK_FORBIDDEN");
  process.chdir(root);
  const hre=require(path.join(root,"node_modules/hardhat"));
  const provider=hre.ethers.provider;
  assert.equal(Number((await provider.getNetwork()).chainId),31337,"REMOTE_EVM_FORBIDDEN");
  const [owner,recipient,attacker]=await hre.ethers.getSigners();
  const actors={owner:owner.address,recipient:recipient.address,attacker:attacker.address};
  const signers={OWNER:owner,ATTACKER:attacker};
  async function snapshot(contract){
    const [a,b,c,total,allowance]=await Promise.all([
      contract.balanceOf(actors.owner),contract.balanceOf(actors.recipient),
      contract.balanceOf(actors.attacker),contract.totalSupply(),
      contract.allowance(actors.owner,actors.attacker)]);
    return {ownerBalance:a.toString(),recipientBalance:b.toString(),
      attackerBalance:c.toString(),totalSupply:total.toString(),
      attackerAllowance:allowance.toString()};
  }
  async function checkedTx(tx,target,caller,method,contract,expectedEvent){
    const receipt=await tx.wait(1);
    const rechecked=await provider.getTransactionReceipt(tx.hash);
    const actual=await provider.getTransaction(tx.hash);
    const block=await provider.getBlock(receipt.blockNumber);
    assert(receipt?.status===1&&rechecked?.status===1&&actual&&block);
    assert.equal(receipt.transactionHash,rechecked.transactionHash);
    assert.equal(receipt.blockHash,rechecked.blockHash);
    assert.equal(block.hash,receipt.blockHash);
    assert(block.transactions.some(h=>h.toLowerCase()===tx.hash.toLowerCase()));
    assert.equal(actual.from.toLowerCase(),actors[caller.toLowerCase()].toLowerCase());
    assert.equal(actual.to?.toLowerCase()||null,target?.toLowerCase()||null);
    assert(receipt.gasUsed.lte(POLICY.maxGasPerTransaction));
    const selector=target?contract.interface.getSighash(method):null;
    if(selector)assert.equal(actual.data.slice(0,10),selector);
    let event=null;
    if(expectedEvent){
      const matches=[];
      for(const log of rechecked.logs){
        if(log.address.toLowerCase()!==target.toLowerCase())continue;
        try{
          const parsed=contract.interface.parseLog(log);
          if(parsed.name==="Transfer")matches.push({
            name:"Transfer",from:parsed.args[0],to:parsed.args[1],
            amount:parsed.args[2].toString()});
        }catch{}
      }
      assert.equal(matches.length,1,"REVIEWED_TRANSFER_EVENT_COUNT_CHANGED");
      const lower=x=>JSON.stringify(x).toLowerCase();
      assert.equal(lower(matches[0]),lower(expectedEvent),"EVENT_ARGUMENTS_DIFFER");
      event=matches[0];
    }
    return {txHash:tx.hash,blockHash:receipt.blockHash,blockNumber:receipt.blockNumber,
      status:receipt.status,transactionMined:true,gasUsed:receipt.gasUsed.toString(),
      fromAddress:actual.from,toAddress:actual.to,method,
      methodSelector:selector||"CREATE",event};
  }
  function argsFor(step){
    switch(step.id){
      case "MINT_100":return [actors.owner,POLICY.initial];
      case "NO_ALLOWANCE_FROM":return [actors.owner,actors.recipient,POLICY.negative];
      case "TRANSFER_25":return [actors.recipient,POLICY.first];
      case "OVER_BALANCE":return [actors.recipient,POLICY.over];
      case "TRANSFER_ZERO":return [actors.recipient,POLICY.zero];
      case "ZERO_RECIPIENT":return [ZERO,POLICY.negative];
      case "TRANSFER_10":return [actors.recipient,POLICY.last];
      default:throw Error("UNREVIEWED_BALANCE_OPERATION:"+step.id);
    }
  }
  function wanted(step){
    if(step.execution!=="MINED")return null;
    if(step.id==="MINT_100")return {name:"Transfer",from:ZERO,
      to:actors.owner,amount:POLICY.initial};
    return {name:"Transfer",from:actors.owner,to:actors.recipient,
      amount:step.id==="TRANSFER_25"?POLICY.first:
        step.id==="TRANSFER_10"?POLICY.last:POLICY.zero};
  }
  const deployments=[],participants=[];
  for(let i=0;i<2;i++){
    const artifact=deployables[i],cap=plan.capabilities[i];
    assert(artifact?.abi&&artifact.evm?.bytecode?.object);
    assert.equal(hash(artifact.abi),cap.deployedAbiSha256);
    assert.equal(sha256(artifact.evm.bytecode.object),cap.creationBytecodeSha256);
    const factory=new hre.ethers.ContractFactory(
      artifact.abi,"0x"+artifact.evm.bytecode.object,owner);
    const contract=await factory.deploy({gasLimit:POLICY.maxGasPerTransaction});
    await contract.deployed();
    const created=await checkedTx(contract.deployTransaction,null,
      "OWNER","CONSTRUCTOR",contract,null);
    const deployed=await provider.getTransactionReceipt(contract.deployTransaction.hash);
    assert.equal(deployed.contractAddress.toLowerCase(),contract.address.toLowerCase());
    const runtimeCode=await provider.getCode(contract.address,created.blockNumber);
    assert(runtimeCode&&runtimeCode!=="0x");
    deployments.push({id:plan.selected[i].id,contractAddress:contract.address,
      runtimeCodeKeccak256:hre.ethers.utils.keccak256(runtimeCode),receipt:created});
    assert.deepEqual(await snapshot(contract),{
      ownerBalance:"0",recipientBalance:"0",attackerBalance:"0",
      totalSupply:"0",attackerAllowance:"0"});
    const cases=[];
    for(const step of plan.cases[i].steps){
      const before=await snapshot(contract),connected=contract.connect(signers[step.caller]);
      const args=argsFor(step);
      assert(typeof connected[step.signature]==="function",
        "PREREGISTERED_METHOD_MISSING");
      let receipt=null,simulation=null,statePreserved=null,transactionMined=false;
      if(step.execution==="EXPECT_UNMINED_REVERT"){
        let reverted=false;
        try{
          await connected.callStatic[step.signature](...args,
            {gasLimit:POLICY.maxGasPerTransaction});
        }catch{reverted=true;}
        assert(reverted,"NEGATIVE_CONTROL_DID_NOT_REVERT:"+step.id);
        simulation="ETH_CALL_REVERT";statePreserved=true;
        assert.deepEqual(await snapshot(contract),before);
      }else{
        const tx=await connected[step.signature](...args,
          {gasLimit:POLICY.maxGasPerTransaction});
        receipt=await checkedTx(tx,contract.address,step.caller,
          step.signature,contract,wanted(step));
        transactionMined=true;
      }
      const after=await snapshot(contract);
      assert.deepEqual(after,nextState(before,step.id),
        "EVM_STATE_DIFFERS_FROM_PRECOMMITTED_BALANCE_MODEL:"+step.id);
      cases.push({...step,before,after,receipt,simulation,transactionMined,statePreserved});
    }
    const finalState=await snapshot(contract);
    participants.push({id:plan.selected[i].id,contractAddress:contract.address,cases,
      finalState,minedTransactions:cases.filter(x=>x.transactionMined).length,
      unminedNegativeControls:cases.filter(x=>!x.transactionMined).length});
  }
  const witness={schemaVersion:"OECL_GENERIC_BALANCE_EVM_WITNESS_V1",
    planSha256:plan.planSha256,chainId:31337,
    providerScope:"EPHEMERAL_LOCAL_HARDHAT_BLOCK_RECHECKED",
    actors,deployments,participants,minedReceiptCount:10,unminedNegativeCount:6,
    evmExecuted:true,scientificVerdict:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    fixtureHasUnsafeResearchMint:true,crossContractInteroperabilityProven:false,
    outcome:"ISOLATED_GENERIC_BALANCE_TRANSFERS_OBSERVED",
    limitations:[
      "Two OpenZeppelin ERC20-like implementations ran separately, not atomically together.",
      "Each deployed fixture adds an unprotected research mint unavailable in originals.",
      "Six negative controls are unmined eth_call reverts, not mined receipts.",
      "Reviewed local Hardhat receipts are not mainnet observations; no general ERC safety claim."
    ]};
  assert(verifyWitness(plan,witness),"LOCAL_GENERIC_BALANCE_WITNESS_INVALID");
  return witness;
}
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const {plan,deployables}=await resolve();
  if(mode==="plan"){
    fs.writeFileSync(planPath,JSON.stringify(plan,null,2)+"\n");
    console.log("OECL_GENERIC_BALANCE_PREREGISTRATION",JSON.stringify({
      profiles:plan.selected.map(p=>p.id),status:plan.workflowStatus,
      hypothesisIds:plan.selected.map(p=>p.hypothesisId),planSha256:plan.planSha256,
      evmExecuted:false}));
    return;
  }
  const archived=JSON.parse(fs.readFileSync(planPath,"utf8"));
  assert(verifyPlan(archived),"ARCHIVED_PLAN_HASH_INVALID");
  assert.deepEqual(archived,plan,"COMPILER_ABI_AST_OR_FIXTURE_CHANGED_SINCE_PREREGISTRATION");
  if(plan.workflowStatus!=="REVIEWED_BALANCE_OPERATIONS_PREREGISTERED"){
    console.log("OECL_GENERIC_BALANCE_EVM_BLOCKED",JSON.stringify({
      statuses:plan.capabilities.map(c=>c.status)}));
    return;
  }
  const witness=await localEvm(plan,deployables);
  fs.writeFileSync(witnessPath,JSON.stringify(witness,null,2)+"\n");
  console.log("OECL_GENERIC_BALANCE_LOCAL_EVM_PASS",JSON.stringify({
    mined:witness.minedReceiptCount,unminedNegative:witness.unminedNegativeCount,
    final:witness.participants.map(p=>({id:p.id,...p.finalState})),
    compatibilityVerdict:witness.compatibilityVerdict,
    admission:witness.candidateAdmission}));
}
main().catch(e=>{console.error("OECL_GENERIC_BALANCE_EVM_FAILURE:",e.stack||String(e));process.exitCode=1;});
