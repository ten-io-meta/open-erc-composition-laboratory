"use strict";
/**
 * Independent witness reviewer: no dependency on runner transition/event oracle.
 * Recompilation proves plan identity, not replay of destroyed Hardhat block history.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {verifyPlan,PROGRAM,bounds,variants}=require(
 "../laboratory/scientific-open-source-worker/ReusableVaultOperationGrammar.cjs");
const sha=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const low=s=>String(s).toLowerCase();
const isAddress=s=>typeof s==="string"&&/^0x[0-9a-f]{40}$/i.test(s);
const isBytes32=s=>typeof s==="string"&&/^0x[0-9a-f]{64}$/i.test(s);
const ZERO="0x"+"0".repeat(40);
function independentlyReview(plan,w){
 assert(verifyPlan(plan)&&plan.status==="BOUNDED_GRAMMAR_PREREGISTERED");
 assert.equal(w?.schemaVersion,"OECL_REUSABLE_VAULT_GRAMMAR_LOCAL_WITNESS_V1");
 assert.equal(w.planSha256,plan.planSha256);
 assert.equal(w.chainId,31337);
 assert.equal(w.providerScope,"EPHEMERAL_HARDHAT_BLOCKS_AND_RECEIPTS_RECHECKED");
 assert.equal(w.testOnlyUnprotectedAssetMint,true);
 assert.equal(w.sameTypedProgramAcrossVariants,true);
 assert.equal(w.twoIndependentReviewedVaultFamilies,false);
 assert.equal(w.scientificVerdict,"INCONCLUSIVE");
 assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(w.candidateAdmission,"NOT_ADMITTED");
 assert.equal(w.totalMinedReceipts,14);
 assert.equal(w.totalUnminedControls,8);
 assert(isAddress(w.actors?.owner)&&isAddress(w.actors?.attacker));
 assert.notEqual(low(w.actors.owner),low(w.actors.attacker));
 assert(Array.isArray(w.scenarios)&&w.scenarios.length===2);
 const txs=new Set(),addresses=new Set();
 let previousBlock=0,receiptCount=0,negativeCount=0;
 function receipt(r,target,method,owner){
  assert(r&&isBytes32(r.txHash)&&isBytes32(r.blockHash));
  assert(!txs.has(low(r.txHash)),"DUPLICATE_TRANSACTION_RECEIPT");
  txs.add(low(r.txHash));receiptCount++;
  assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>previousBlock,
    "MINED_BLOCK_SEQUENCE_INVALID");
  previousBlock=r.blockNumber;
  assert.equal(r.status,1);assert.equal(r.transactionMined,true);
  assert(BigInt(r.gasUsed)>0n&&BigInt(r.gasUsed)<=3000000n);
  assert.equal(low(r.from),low(owner));
  assert.equal(r.to===null?null:low(r.to),target===null?null:low(target));
  assert.equal(r.method,method);
  assert.equal(r.methodSelector,method==="CONSTRUCTOR"?"CREATE":r.methodSelector);
  if(method!=="CONSTRUCTOR")assert(/^0x[0-9a-f]{8}$/i.test(r.methodSelector));
  assert(Array.isArray(r.events));
 }
 const empty={assetOwner:"0",assetVault:"0",assetAttacker:"0",
  sharesOwner:"0",sharesAttacker:"0",assetSupply:"0",sharesSupply:"0",
  vaultTotalAssets:"0",allowanceOwnerVault:"0"};
 for(let i=0;i<2;i++){
  const s=w.scenarios[i],v=variants[i],planV=plan.variants[i];
  assert.equal(s.id,v.id);assert.equal(s.offset,v.offset);
  assert.equal(s.shareRatio,v.shareRatio);
  assert.equal(planV.id,s.id);
  assert(Array.isArray(s.created)&&s.created.length===2);
  assert.deepEqual(s.created.map(x=>x.role),["ASSET","VAULT"]);
  const asset=s.created[0].address,vault=s.created[1].address,owner=w.actors.owner;
  for(const d of s.created){
   assert(isAddress(d.address)&&isBytes32(d.runtimeKeccak256));
   assert(!addresses.has(low(d.address)),"SHARED_DEPLOYMENT_NOT_INDEPENDENT");
   addresses.add(low(d.address));receipt(d.receipt,null,"CONSTRUCTOR",owner);
   assert.deepEqual(d.receipt.events,[]);
  }
  const eventTransfer=(contract,from,to,amount)=>({contract,name:"Transfer",from,to,amount});
  const approve=amount=>({contract:"ASSET",name:"Approval",from:owner,to:vault,amount});
  const shares=(amount)=>(BigInt(amount)*BigInt(v.shareRatio)).toString();
  assert.deepEqual(s.initialState,empty,"NONEMPTY_STATE_BEFORE_EXPERIMENT");
  assert(Array.isArray(s.steps)&&s.steps.length===PROGRAM.length);
  let ledger={...empty},count=0,reverts=0;
  for(let j=0;j<PROGRAM.length;j++){
   const item=s.steps[j],spec=PROGRAM[j];
   for(const key of ["id","op","role","target","signature","execution"])
    assert.equal(item[key],spec[key],"GRAMMAR_STEP_SUBSTITUTED");
   assert.deepEqual(item.args,spec.args,"GRAMMAR_ARGUMENT_SYMBOL_SUBSTITUTED");
   assert.equal(item.preview===null||typeof item.preview==="object",true);
   assert.deepEqual(item.before,ledger,"DISCONTINUOUS_LEDGER");
   const next={...ledger};
   let events=[];
   switch(spec.op){
    case "FUND_ASSET":
     next.assetOwner="100";next.assetSupply="100";
     events=[eventTransfer("ASSET",ZERO,owner,"100")];break;
    case "ALLOW":{
     const amount=spec.id==="APPROVE_DEPOSIT"?"40":"101";
     next.allowanceOwnerVault=amount;
     events=[approve(amount)];break;
    }
    case "CUSTODY_IN":
     next.assetOwner="60";next.assetVault="40";
     next.sharesOwner=shares("40");next.sharesSupply=shares("40");
     next.vaultTotalAssets="40";next.allowanceOwnerVault="0";
     events=[approve("0"),eventTransfer("ASSET",owner,vault,"40"),
      eventTransfer("VAULT",ZERO,owner,shares("40")),
      {contract:"VAULT",name:"Deposit",sender:owner,receiver:owner,
       assets:"40",shares:shares("40")}];break;
    case "CUSTODY_OUT":
     next.assetOwner="75";next.assetVault="25";
     next.sharesOwner=shares("25");next.sharesSupply=shares("25");
     next.vaultTotalAssets="25";
     events=[eventTransfer("VAULT",owner,ZERO,shares("15")),
      eventTransfer("ASSET",vault,owner,"15"),
      {contract:"VAULT",name:"Withdraw",sender:owner,receiver:owner,
       owner,assets:"15",shares:shares("15")}];break;
    case "REVERT":break;
    default:throw Error("UNKNOWN_INDEPENDENT_REVIEW_OPCODE");
   }
   assert.deepEqual(item.after,next,"INVALID_ASSET_SHARE_TRANSITION");
   assert.equal(item.after.assetVault,item.after.vaultTotalAssets);
   assert.equal(item.after.sharesSupply,item.after.sharesOwner);
   assert.equal(BigInt(item.after.assetOwner)+BigInt(item.after.assetVault),
    BigInt(item.after.assetSupply));
   if(spec.preview){
    assert.deepEqual(item.preview,{
     method:spec.preview,
     assets:spec.op==="CUSTODY_IN"?"40":"15",
     shares:spec.op==="CUSTODY_IN"?shares("40"):shares("15")
    },"FORGED_SHARE_PREVIEW");
   }else assert.equal(item.preview,null);
   if(spec.execution==="MINED"){
    count++;assert.equal(item.transactionMined,true);
    assert.equal(item.simulation,null);assert.equal(item.statePreserved,null);
    receipt(item.receipt,spec.target==="ASSET"?asset:vault,spec.signature,owner);
    assert.equal(JSON.stringify(item.receipt.events).toLowerCase(),
     JSON.stringify(events).toLowerCase(),"INCORRECT_MINED_TYPED_EVENTS");
   }else{
    reverts++;negativeCount++;
    assert.equal(item.transactionMined,false);
    assert.equal(item.receipt,null);
    assert.equal(item.simulation,"ETH_CALL_REVERT");
    assert.equal(item.statePreserved,true);
    assert.deepEqual(item.after,item.before,"REVERT_CHANGED_LEDGER");
   }
   ledger=next;
  }
  assert.equal(count,5);assert.equal(reverts,4);
  assert.equal(s.minedReceipts,7);assert.equal(s.unminedNegativeControls,4);
  assert.deepEqual(s.finalState,ledger,"FORGED_FINAL_LEDGER");
  assert.deepEqual(s.finalState,{...empty,assetOwner:"75",assetVault:"25",
   assetSupply:"100",allowanceOwnerVault:"101",vaultTotalAssets:"25",
   sharesOwner:shares("25"),sharesSupply:shares("25")});
 }
 assert.equal(txs.size,14);assert.equal(receiptCount,14);assert.equal(negativeCount,8);
 return {schemaVersion:"OECL_REUSABLE_VAULT_GRAMMAR_REVIEW_V1",
  planSha256:plan.planSha256,witnessSha256:sha(w),
  validatedScenarios:w.scenarios.map(x=>({id:x.id,shareRatio:x.shareRatio,
   finalShares:x.finalState.sharesOwner})),
  minedLocalReceipts:14,unminedReverts:8,independentLedgerAndEvents:true,
  fixtureVariantsFromOneRegisteredERC4626Source:true,
  independentImplementationsProven:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "Second runner reconstructs compiler plan but cannot query destroyed Hardhat blocks.",
   "Both vault variants inherit one pinned OpenZeppelin ERC4626 implementation.",
   "The typed operation grammar and policy are reviewed code, not fully autonomous generation."
  ]};
}
function checkFiles(archive,fresh){
 const read=(dir,n)=>JSON.parse(fs.readFileSync(path.join(dir,n),"utf8"));
 const plan=read(archive,"reusable-vault-plan.json");
 const repro=read(fresh,"reusable-vault-plan.json");
 assert.deepEqual(plan,repro,"SECOND_RUNNER_SOURCE_OR_GRAMMAR_CHANGED");
 const result=independentlyReview(plan,read(archive,"reusable-vault-witness.json"));
 fs.writeFileSync(path.join(fresh,"reusable-vault-review.json"),
  JSON.stringify(result,null,2)+"\n");
 return result;
}
if(require.main===module){
 const [archive,fresh]=process.argv.slice(2);
 assert(archive&&fresh);
 console.log("OECL_REUSABLE_VAULT_GRAMMAR_INDEPENDENT_REVIEW",
  JSON.stringify(checkFiles(path.resolve(archive),path.resolve(fresh))));
}
module.exports={independentlyReview,checkFiles};
