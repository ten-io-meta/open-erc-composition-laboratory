"use strict";
/**
 * Independent archived-witness arithmetic/typed event review.
 * Does NOT import the runner's state-transition oracle and cannot authenticate
 * the destroyed in-memory provider after the GitHub job terminates.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {verifyPlan,verifyWitness}=require("../laboratory/scientific-open-source-worker/GenericBalanceEvmProtocol.cjs");
const digest=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const ZERO="0x"+"0".repeat(40);
const lower=s=>String(s).toLowerCase();
function independentlyReview(plan,w){
  assert(verifyPlan(plan),"PREREGISTRATION_IDENTITY_NOT_VALID");
  assert(verifyWitness(plan,w),"SCOPED_WITNESS_SCHEMA_FAILED");
  assert.equal(w.scientificVerdict,"INCONCLUSIVE");
  assert.equal(w.crossContractInteroperabilityProven,false);
  assert.equal(w.fixtureHasUnsafeResearchMint,true);
  assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(w.candidateAdmission,"NOT_ADMITTED");
  assert.equal(w.outcome,"ISOLATED_GENERIC_BALANCE_TRANSFERS_OBSERVED");
  assert.equal(plan.cases.length,2);
  assert.equal(w.participants.length,2);
  const hashes=new Set(),allDeploys=new Set();
  const minedReceipt=r=>{
    assert(!hashes.has(lower(r.txHash)),"DUPLICATE_MINED_TRANSACTION");
    hashes.add(lower(r.txHash));
    assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>0);
    assert.equal(r.status,1);
    assert(typeof r.gasUsed==="string"&&BigInt(r.gasUsed)>0n);
    assert(BigInt(r.gasUsed)<=3000000n);
  };
  const expectedSteps=[
    ["MINT_100", "MINED","oeclResearchMint(address,uint256)",100n,0n,100n],
    ["NO_ALLOWANCE_FROM","EXPECT_UNMINED_REVERT","transferFrom(address,address,uint256)",0n,0n,0n],
    ["TRANSFER_25","MINED","transfer(address,uint256)",-25n,25n,0n],
    ["OVER_BALANCE","EXPECT_UNMINED_REVERT","transfer(address,uint256)",0n,0n,0n],
    ["TRANSFER_ZERO","MINED","transfer(address,uint256)",0n,0n,0n],
    ["ZERO_RECIPIENT","EXPECT_UNMINED_REVERT","transfer(address,uint256)",0n,0n,0n],
    ["TRANSFER_10","MINED","transfer(address,uint256)",-10n,10n,0n]
  ];
  for(let i=0;i<2;i++){
    const p=w.participants[i],d=w.deployments[i];
    assert.equal(p.id,plan.selected[i].id);
    assert.equal(d.id,p.id);
    assert(!allDeploys.has(lower(p.contractAddress)),"FIXTURE_ADDRESS_REUSED");
    allDeploys.add(lower(p.contractAddress));
    minedReceipt(d.receipt);
    assert.equal(lower(d.receipt.fromAddress),lower(w.actors.owner));
    assert.equal(d.receipt.method,"CONSTRUCTOR");
    assert.equal(d.receipt.methodSelector,"CREATE");
    assert.equal(d.receipt.toAddress,null);
    assert.equal(p.cases.length,expectedSteps.length);
    let previous={ownerBalance:"0",recipientBalance:"0",attackerBalance:"0",
      totalSupply:"0",attackerAllowance:"0"};
    for(let j=0;j<expectedSteps.length;j++){
      const row=p.cases[j],e=expectedSteps[j];
      assert.equal(row.id,e[0]);assert.equal(row.execution,e[1]);
      assert.equal(row.signature,e[2]);
      assert.deepEqual(row.before,previous,"LEDGER_NOT_CONTIGUOUS");
      const [owner,recipient,attacker,total,allowance]=[
        row.before.ownerBalance,row.before.recipientBalance,
        row.before.attackerBalance,row.before.totalSupply,row.before.attackerAllowance].map(BigInt);
      const after=row.after;
      assert.equal(BigInt(after.ownerBalance),owner+e[3],"OWNER_DELTA_FORGED");
      assert.equal(BigInt(after.recipientBalance),recipient+e[4],"RECIPIENT_DELTA_FORGED");
      assert.equal(BigInt(after.totalSupply),total+e[5],"SUPPLY_DELTA_FORGED");
      assert.equal(BigInt(after.attackerBalance),attacker,"ATTACKER_BALANCE_CHANGED");
      assert.equal(BigInt(after.attackerAllowance),allowance,"UNAUTHORIZED_ALLOWANCE_CHANGE");
      assert(BigInt(after.ownerBalance)>=0n&&BigInt(after.recipientBalance)>=0n);
      assert.equal(row.before.attackerAllowance,"0");
      if(e[1]==="MINED"){
        minedReceipt(row.receipt);
        assert.equal(row.transactionMined,true);
        assert.equal(lower(row.receipt.toAddress),lower(p.contractAddress));
        assert.equal(lower(row.receipt.fromAddress),lower(w.actors.owner));
        assert.equal(row.receipt.method,e[2]);
        assert(row.receipt.methodSelector!=="CREATE");
        assert(row.receipt.methodSelector.startsWith("0x"));
        assert.equal(row.receipt.event?.name,"Transfer");
        const expectedFrom=j===0?ZERO:w.actors.owner;
        const expectedTo=j===0?w.actors.owner:w.actors.recipient;
        const expectedAmount=j===0?"100":j===2?"25":j===4?"0":"10";
        assert.equal(lower(row.receipt.event.from),lower(expectedFrom),"TRANSFER_FROM_FORGED");
        assert.equal(lower(row.receipt.event.to),lower(expectedTo),"TRANSFER_TO_FORGED");
        assert.equal(row.receipt.event.amount,expectedAmount,"TRANSFER_AMOUNT_FORGED");
        assert.equal(row.simulation,null);
      }else{
        assert.equal(row.transactionMined,false);
        assert.equal(row.receipt,null);
        assert.equal(row.simulation,"ETH_CALL_REVERT");
        assert.equal(row.statePreserved,true);
        assert.deepEqual(row.before,row.after);
      }
      previous=row.after;
    }
    assert.deepEqual(p.finalState,previous);
    assert.equal(p.finalState.ownerBalance,"65");
    assert.equal(p.finalState.recipientBalance,"35");
    assert.equal(p.finalState.attackerBalance,"0");
    assert.equal(p.finalState.totalSupply,"100");
    assert.equal(p.finalState.attackerAllowance,"0");
  }
  assert.equal(hashes.size,10);
  assert.equal(w.minedReceiptCount,10);
  assert.equal(w.unminedNegativeCount,6);
  return {schemaVersion:"OECL_GENERIC_BALANCE_INDEPENDENT_REVIEW_V1",
    planSha256:plan.planSha256,witnessSha256:digest(w),
    sourceGraphSha256:plan.sourceGraphSha256,
    checkedMinedLocalReceipts:10,checkedUnminedSimulations:6,
    checkedBalanceConservation:true,checkedTokenSupply:true,
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "A fresh runner recompiled the fixture bytecode and verified plan identity.",
      "Archived receipts and state deltas were independently recomputed, but terminated Hardhat blocks could not be re-queried.",
      "Transfer approvals and failure simulations are fixture-scoped; this is not cross-contract composability."
    ]};
}
function reviewFiles(archivedDir,freshDir){
  const read=(dir,n)=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
  const plan=read(archivedDir,"generic-balance-plan.json");
  const regenerated=read(freshDir,"generic-balance-plan.json");
  assert.deepEqual(plan,regenerated,"FRESH_COMPILER_ABI_AST_FIXTURE_PLAN_MISMATCH");
  const result=independentlyReview(plan,read(archivedDir,"generic-balance-witness.json"));
  fs.mkdirSync(freshDir,{recursive:true});
  fs.writeFileSync(path.join(freshDir,"generic-balance-independent-review.json"),
    JSON.stringify(result,null,2)+"\n");
  return result;
}
if(require.main===module){
  const [archived,fresh]=process.argv.slice(2);
  assert(archived&&fresh,"USAGE: <archived-dir> <fresh-dir>");
  const result=reviewFiles(path.resolve(archived),path.resolve(fresh));
  console.log("OECL_GENERIC_BALANCE_INDEPENDENT_REVIEW_PASS",JSON.stringify(result));
}
module.exports={independentlyReview,reviewFiles};
