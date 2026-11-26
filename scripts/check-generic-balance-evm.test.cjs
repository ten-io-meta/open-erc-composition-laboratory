"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {hash,allowed,POLICY,CASES,TYPE_SPECS,fixture,planFor,verifyPlan,verifyWitness}=
  require("../laboratory/scientific-open-source-worker/GenericBalanceEvmProtocol.cjs");
const {independentlyReview}=require("./review-generic-balance-evm.cjs");
function abi(withMint=false){
 return Object.entries(TYPE_SPECS).filter(([sig])=>withMint||!sig.startsWith("oeclResearchMint"))
   .map(([sig,x])=>({type:"function",name:sig.split("(")[0],
     inputs:x[0].map(type=>({type})),outputs:x[1].map(type=>({type})),
     stateMutability:x[2]}));
}
const original=[abi(false),abi(false)].map(a=>({abi:a}));
const deployed=[abi(true),abi(true)].map(a=>({abi:a,
  evm:{bytecode:{object:"60006000f3",linkReferences:{}}}}));
const selected=Object.entries(allowed).map(([id,src])=>({id,contract:src.contract,
  sourceUnit:src.sourceUnit,revision:"4.9.6",sourceSha256:"a".repeat(64),
  abiSha256:hash(abi(false)),
  structuralPaths:[{signature:"transfer(address,uint256)",kind:"STATE_WRITE",
    stateVariable:"_balances",path:"compiler transfer -> _transfer",
    executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED",unresolvedReferences:4,
    externalCallReferences:0}],
  hypotheses:[{id:"b".repeat(64),status:"HYPOTHESIS_ONLY",
    signature:"transfer(address,uint256)",stateVariable:"_balances",
    executionSafety:"SOURCE_ONLY_REVIEW_REQUIRED"}]}));
const report={schemaVersion:"OECL_LOCKED_SOURCE_HYPOTHESES_V1",
 status:"COMPILER_RECONCILED_SOURCE_ONLY",evmExecuted:false,
 executionAuthorized:false,candidateAdmission:"NOT_ADMITTED",
 compatibilityVerdict:"NOT_EVALUATED",compilerVersion:"0.8.26+commit.8a97fa7a",
 dependencyIntegrity:"sha512-lock",sourceGraphSha256:"c".repeat(64),participants:selected};
const fixtures=selected.map((p,i)=>fixture(p,i));
const plan=()=>planFor(report,original,deployed,fixtures);
const ZERO="0x"+"0".repeat(40),owner="0x"+"a".repeat(40),
 recipient="0x"+"b".repeat(40),attacker="0x"+"c".repeat(40);
const txhash=n=>"0x"+n.toString(16).padStart(64,"0");
function receipt(n,target,method,from,amount,to){
 return {txHash:txhash(n),blockHash:txhash(100+n),blockNumber:n,
   status:1,transactionMined:true,gasUsed:"22000",fromAddress:owner,
   toAddress:target,method,methodSelector:target?
    method.startsWith("oeclResearchMint")?"0x1a2b3c4d":"0xa9059cbb":"CREATE",
   event:amount===null?null:{name:"Transfer",from,to,amount}};
}
function witness(p){
 const deployments=[],participants=[];
 for(let i=0;i<2;i++){
   const address="0x"+String(i+1).repeat(40),blockBase=i*20;
   deployments.push({id:p.selected[i].id,contractAddress:address,
     runtimeCodeKeccak256:txhash(i+50),
     receipt:receipt(blockBase+1,null,"CONSTRUCTOR",null,null,null)});
   let curr={ownerBalance:"0",recipientBalance:"0",attackerBalance:"0",
     totalSupply:"0",attackerAllowance:"0"};
   const cases=[];
   for(let j=0;j<CASES.length;j++){
     const [id,execution,caller,signature]=CASES[j];
     const before={...curr},next={...curr};
     if(id==="MINT_100"){next.ownerBalance="100";next.totalSupply="100";}
     if(id==="TRANSFER_25"){next.ownerBalance="75";next.recipientBalance="25";}
     if(id==="TRANSFER_10"){next.ownerBalance="65";next.recipientBalance="35";}
     const mined=execution==="MINED";
     const amount=id==="MINT_100"?"100":id==="TRANSFER_25"?"25":
       id==="TRANSFER_10"?"10":"0";
     cases.push({id,execution,caller,signature,before,after:next,
       receipt:mined?receipt(blockBase+j+2,address,signature,
         id==="MINT_100"?ZERO:owner,amount,
         id==="MINT_100"?owner:recipient):null,
       simulation:mined?null:"ETH_CALL_REVERT",transactionMined:mined,
       statePreserved:mined?null:true});
     curr=next;
   }
   participants.push({id:p.selected[i].id,contractAddress:address,cases,
     finalState:curr,minedTransactions:4,unminedNegativeControls:3});
 }
 return {schemaVersion:"OECL_GENERIC_BALANCE_EVM_WITNESS_V1",
   planSha256:p.planSha256,chainId:31337,
   providerScope:"EPHEMERAL_LOCAL_HARDHAT_BLOCK_RECHECKED",
   actors:{owner,recipient,attacker},deployments,participants,
   minedReceiptCount:10,unminedNegativeCount:6,
   evmExecuted:true,scientificVerdict:"INCONCLUSIVE",
   candidateAdmission:"NOT_ADMITTED",compatibilityVerdict:"NOT_EVALUATED",
   crossContractInteroperabilityProven:false,fixtureHasUnsafeResearchMint:true,
   outcome:"ISOLATED_GENERIC_BALANCE_TRANSFERS_OBSERVED",limitations:["isolated"]};
}
test("derive identical operation grammar from two typed ABI/AST participants",()=>{
 const p=plan();
 assert.equal(p.workflowStatus,"REVIEWED_BALANCE_OPERATIONS_PREREGISTERED");
 assert.deepEqual(p.cases.map(x=>x.steps.map(s=>s.id)),[...Array(2)].map(()=>CASES.map(x=>x[0])));
 assert.equal(verifyPlan(p),true);
 assert.equal(p.candidateAdmission,"NOT_ADMITTED");
 assert.equal(p.evmExecuted,false);
});
test("reject mutated hypothesis pair, fixture, bytecode or plan",()=>{
 const changed=structuredClone(report);
 changed.participants[1].id="ERC-721";
 assert.equal(planFor(changed,original,deployed,fixtures).workflowStatus,
   "BLOCKED_UNREVIEWED_OPERATION");
 const forged=structuredClone(fixtures);forged[0].solidity+="\nfunction steal() external {}\n";
 assert.equal(planFor(report,original,deployed,forged).workflowStatus,
   "BLOCKED_UNREVIEWED_OPERATION");
 const missing=structuredClone(original);missing[0].abi.pop();
 assert.equal(planFor(report,missing,deployed,fixtures).workflowStatus,
   "BLOCKED_UNREVIEWED_OPERATION");
 const p=plan();p.quantities.over="1";
 assert.equal(verifyPlan(p),false);
 const q=plan();q.cases[0].steps[3].execution="MINED";
 assert.equal(verifyPlan(q),false);
});
test("independent reviewer catches fabricated receipts, state and events",()=>{
 const p=plan(),w=witness(p);
 assert.equal(verifyWitness(p,w),true);
 assert.equal(independentlyReview(p,w).checkedMinedLocalReceipts,10);
 const edits=[
   x=>{x.candidateAdmission="ADMITTED";},
   x=>{x.chainId=1;},
   x=>{x.minedReceiptCount=11;},
   x=>{x.participants[0].cases[2].after.ownerBalance="76";},
   x=>{x.participants[0].cases[0].receipt.event.amount="1000";},
   x=>{x.participants[0].cases[1].receipt={};},
   x=>{x.participants[0].cases[2].receipt.txHash=x.participants[1].cases[2].receipt.txHash;},
   x=>{x.participants[1].finalState.totalSupply="101";},
   x=>{x.participants[0].cases[5].statePreserved=false;},
   x=>{x.participants[0].cases[0].receipt.fromAddress=attacker;}
 ];
 for(const edit of edits){
   const forged=structuredClone(w);edit(forged);
   assert.throws(()=>independentlyReview(p,forged));
 }
});
