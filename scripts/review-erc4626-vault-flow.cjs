"use strict";
/** Independent archived ERC4626/20 balance, event and receipt review.
 * Reviews immutable evidence; cannot requery terminated local Hardhat blocks.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {verifyPlan,hash,BOUNDS,ZERO}=require("../laboratory/scientific-open-source-worker/VaultAssetFlowProtocol.cjs");
const validAddr=s=>typeof s==="string"&&/^0x[a-fA-F0-9]{40}$/.test(s);
const validBytes32=s=>typeof s==="string"&&/^0x[a-fA-F0-9]{64}$/.test(s);
const lowercase=s=>String(s).toLowerCase();
const sha=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
function review(plan,w){
 assert(verifyPlan(plan),"VAULT_RECONSTRUCTED_PLAN_NOT_VERIFIED");
 assert.equal(plan.status,"REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED");
 assert.equal(w.schemaVersion,"OECL_ERC4626_ERC20_LOCAL_EVM_WITNESS_V1");
 assert.equal(w.planSha256,plan.planSha256);
 assert.equal(w.chainId,31337);
 assert.equal(w.providerScope,"EPHEMERAL_HARDHAT_31337_RECHECKED_AT_RUNTIME");
 assert.equal(w.scopeObservation,"ERC4626_VAULT_AND_ERC20_ASSET_INTERACTION_OBSERVED");
 assert.equal(w.crossContractInteractionObserved,true);
 assert.equal(w.universalCompatibilityProven,false);
 assert.equal(w.candidateAdmission,"NOT_ADMITTED");
 assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
 assert.equal(w.scientificVerdict,"INCONCLUSIVE");
 assert.equal(w.unsafeTestMintOnly,true);
 assert.deepEqual(w.sourceBaselineHypotheses,plan.sourceHypotheses);
 assert(validAddr(w.actors?.owner)&&validAddr(w.actors?.attacker));
 assert.notEqual(lowercase(w.actors.owner),lowercase(w.actors.attacker));
 assert.equal(w.created?.length,2);assert.equal(w.steps?.length,9);
 assert.deepEqual(w.created.map(x=>x.role),["ASSET","VAULT"]);
 const asset=w.created[0].address,vault=w.created[1].address;
 assert(validAddr(asset)&&validAddr(vault)&&asset.toLowerCase()!==vault.toLowerCase());
 const mined=new Set();
 let lastBlock=0;
 function checkReceipt(receipt,method,to){
  assert(receipt&&receipt.status===1&&receipt.transactionMined===true);
  assert(validBytes32(receipt.txHash)&&validBytes32(receipt.blockHash));
  assert(!mined.has(lowercase(receipt.txHash)),"DUPLICATE_OR_FORGED_TX");
  mined.add(lowercase(receipt.txHash));
  assert(Number.isSafeInteger(receipt.blockNumber)&&receipt.blockNumber>lastBlock,
   "BLOCK_ORDER_OR_NUMBER_INVALID");
  lastBlock=receipt.blockNumber;
  assert(BigInt(receipt.gasUsed)>0n&&BigInt(receipt.gasUsed)<=BigInt(BOUNDS.maxGasPerTransaction));
  assert.equal(receipt.method,method);
  assert.equal(lowercase(receipt.from),lowercase(w.actors.owner));
  assert.equal(receipt.to?.toLowerCase()||null,to?.toLowerCase()||null);
  assert(to? /^0x[0-9a-f]{8}$/i.test(receipt.methodSelector):
    receipt.methodSelector==="CREATE");
  assert(Array.isArray(receipt.events));
 }
 for(const d of w.created){
  assert(validBytes32(d.runtimeKeccak256));
  checkReceipt(d.receipt,"CONSTRUCTOR",null);
  assert.equal(d.receipt.events.length,0);
 }
 const empty=Object.freeze({assetOwner:"0",assetVault:"0",assetAttacker:"0",
  sharesOwner:"0",sharesAttacker:"0",assetSupply:"0",
  sharesSupply:"0",vaultTotalAssets:"0",allowanceOwnerVault:"0"});
 assert.deepEqual(w.initialState,empty);
 let prev={...empty};
 function expected(id){
  const next={...prev};
  if(id==="MINT_ASSET_100"){next.assetOwner="100";next.assetSupply="100";}
  if(id==="APPROVE_40")next.allowanceOwnerVault="40";
  if(id==="DEPOSIT_40"){
   next.assetOwner="60";next.assetVault="40";next.sharesOwner="40";
   next.sharesSupply="40";next.vaultTotalAssets="40";next.allowanceOwnerVault="0";
  }
  if(id==="WITHDRAW_15"){
   next.assetOwner="75";next.assetVault="25";next.sharesOwner="25";
   next.sharesSupply="25";next.vaultTotalAssets="25";
  }
  if(id==="APPROVE_101")next.allowanceOwnerVault="101";
  return next;
 }
 const addr=w.actors.owner;
 function wantEvents(id){
  const assetTransfer=(from,to,amount)=>({contract:"ASSET",name:"Transfer",from,to,amount});
  const vaultTransfer=(from,to,amount)=>({contract:"VAULT",name:"Transfer",from,to,amount});
  const approval=amount=>({contract:"ASSET",name:"Approval",from:addr,to:vault,amount});
  if(id==="MINT_ASSET_100")return [assetTransfer(ZERO,addr,"100")];
  if(id==="APPROVE_40")return [approval("40")];
  if(id==="DEPOSIT_40")return [approval("0"),
   assetTransfer(addr,vault,"40"),vaultTransfer(ZERO,addr,"40"),
   {contract:"VAULT",name:"Deposit",sender:addr,receiver:addr,assets:"40",shares:"40"}];
  if(id==="WITHDRAW_15")return [vaultTransfer(addr,ZERO,"15"),
   assetTransfer(vault,addr,"15"),
   {contract:"VAULT",name:"Withdraw",sender:addr,receiver:addr,
     owner:addr,assets:"15",shares:"15"}];
  if(id==="APPROVE_101")return [approval("101")];
  return [];
 }
 let minedSteps=0,unminedControls=0;
 for(let i=0;i<plan.cases.length;i++){
  const specification=plan.cases[i],s=w.steps[i];
  for(const key of ["id","execution","caller","target","method"])
   assert.equal(s[key],specification[key],"UNREGISTERED_STEP");
  assert.deepEqual(s.before,prev,"LEDGER_IS_NOT_CONTIGUOUS");
  assert.deepEqual(s.after,expected(s.id),"INCORRECT_VAULT_ASSET_SHARE_DELTA");
  assert.equal(s.after.assetVault,s.after.vaultTotalAssets,
    "TOKENIZED_VAULT_ASSETS_DIFFER_FROM_ERC20_BALANCE");
  assert.equal(s.after.sharesOwner,s.after.sharesSupply,
    "UNEXPLAINED_VAULT_SHARES");
  assert.equal(BigInt(s.after.assetOwner)+BigInt(s.after.assetVault)+
    BigInt(s.after.assetAttacker),BigInt(s.after.assetSupply),
    "UNDERLYING_TOKEN_CONSERVATION_FAILED");
  if(s.id==="DEPOSIT_40"||s.id==="WITHDRAW_15"){
   assert.equal(s.preview.method,
    s.id==="DEPOSIT_40"?"previewDeposit(uint256)":"previewWithdraw(uint256)");
   assert.equal(s.preview.assets,s.id==="DEPOSIT_40"?"40":"15");
   assert.equal(s.preview.shares,s.id==="DEPOSIT_40"?"40":"15");
  }else assert.equal(s.preview,null);
  if(s.execution==="MINED"){
   minedSteps++;
   assert.equal(s.transactionMined,true);
   assert.equal(s.simulation,null);
   assert.equal(s.statePreserved,null);
   checkReceipt(s.receipt,s.method,s.target==="ASSET"?asset:vault);
   assert.deepEqual(
    JSON.parse(JSON.stringify(s.receipt.events).toLowerCase()),
    JSON.parse(JSON.stringify(wantEvents(s.id)).toLowerCase()),
    "INDEPENDENT_EVENT_RECONCILIATION_FAILED");
  }else{
   unminedControls++;
   assert.equal(s.execution,"UNMINED_REVERT");
   assert.equal(s.transactionMined,false);
   assert.equal(s.simulation,"ETH_CALL_REVERT");
   assert.equal(s.statePreserved,true);
   assert.equal(s.receipt,null);
   assert.deepEqual(s.before,s.after);
  }
  prev=s.after;
 }
 assert.equal(minedSteps,5);assert.equal(unminedControls,4);
 assert.equal(w.minedReceiptCount,7);assert.equal(w.unminedNegativeCount,4);
 assert.equal(mined.size,7);assert.deepEqual(w.finalState,prev);
 assert.deepEqual(prev,{assetOwner:"75",assetVault:"25",assetAttacker:"0",
  sharesOwner:"25",sharesAttacker:"0",assetSupply:"100",sharesSupply:"25",
  vaultTotalAssets:"25",allowanceOwnerVault:"101"});
 return {schemaVersion:"OECL_VAULT_INDEPENDENT_WITNESS_REVIEW_V1",
  planSha256:plan.planSha256,witnessSha256:sha(w),
  sourceGraphSha256:plan.sourceGraphSha256,
  originalSourceOnlyHypotheses:plan.sourceHypotheses,
  minedLocalReceipts:7,unminedControls:4,
  independentBalanceReconstruction:true,
  independentTypedEventCheck:true,
  sourceOnlyInferenceNotAutonomousExecution:true,
  crossContractInteractionObserved:true,
  universalCompatibilityProven:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:["Archived receipts were checked in the executing runner; a later runner cannot requery terminated Hardhat blocks.",
   "One reviewed ERC4626-specific policy was necessary; this does not demonstrate fully autonomous experiment construction.",
   "Unsafe test-only ERC20 mint and default no-fee vault are not representative of all ERC20/ERC4626 deployments."]};
}
function checkFiles(archiveDir,reproDir){
 const read=(dir,name)=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
 const archive=read(archiveDir,"vault-flow-plan.json"),
  regenerated=read(reproDir,"vault-flow-plan.json");
 assert.deepEqual(archive,regenerated,"INDEPENDENT_COMPILER_PLAN_DIFFERENT");
 const verdict=review(archive,read(archiveDir,"vault-flow-witness.json"));
 fs.writeFileSync(path.join(reproDir,"vault-independent-review.json"),
  JSON.stringify(verdict,null,2)+"\n");
 return verdict;
}
if(require.main===module){
 const [archiveDir,reproDir]=process.argv.slice(2);
 assert(archiveDir&&reproDir);
 const result=checkFiles(path.resolve(archiveDir),path.resolve(reproDir));
 console.log("OECL_VAULT_INDEPENDENT_REVIEW_PASS",JSON.stringify(result));
}
module.exports={review,checkFiles};
