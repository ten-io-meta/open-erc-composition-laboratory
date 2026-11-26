"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {BOUNDS,PROGRAM,resolveArgs,transitionDonation,emptyState,
 expectedPreview,expectedMaxWithdraw}=require(
 "../laboratory/scientific-open-source-worker/VaultDonationCounterexample.cjs");
test("one typed program explicitly preregisters donation and state-dependent adversarial controls",()=>{
 assert.equal(PROGRAM.length,12);
 assert.equal(PROGRAM[3].id,"DEPOSIT");
 assert.deepEqual(PROGRAM.slice(4,7).map(x=>x.id),[
  "PRE_DONATION_WITHDRAW41_REVERT","DONATE_20",
  "POST_DONATION_WITHDRAW41_POSSIBLE"]);
 assert.equal(PROGRAM.find(x=>x.id==="BLOCK_OVER_WITHDRAW").args[0],"OVER_INVALID");
 assert.equal(BOUNDS.invalidAfterDonation,"61");
 assert.equal(PROGRAM.filter(x=>x.execution==="MINED").length,6);
 assert.equal(PROGRAM.filter(x=>x.execution==="UNMINED_REVERT").length,5);
 assert.equal(PROGRAM.filter(x=>x.execution==="UNMINED_SUCCESS").length,1);
});
test("independently sourced formulas predict different burn amounts after the same donation",()=>{
 const before={...emptyState(),assetOwner:"40",assetVault:"60",
   sharesOwner:"40",sharesSupply:"40",vaultTotalAssets:"60",assetSupply:"100"};
 assert.equal(expectedPreview("OPENZEPPELIN","15",before),"11");
 assert.equal(expectedPreview("SOLMATE","15",before),"10");
 assert.equal(expectedPreview("OPENZEPPELIN","41",before),"28");
 assert.equal(expectedPreview("SOLMATE","41",before),"28");
 assert.equal(expectedMaxWithdraw("OPENZEPPELIN",before),"59");
 assert.equal(expectedMaxWithdraw("SOLMATE",before),"60");
 assert.equal(expectedPreview("SOLMATE","41",{...before,assetVault:"40",
  vaultTotalAssets:"40"}),"41");
});
test("pre/post-donation model changes recipient balances but not ERC20 total supply",()=>{
 const actor={owner:"0x"+"1".repeat(40),attacker:"0x"+"2".repeat(40),
   vault:"0x"+"3".repeat(40)};
 const donate=PROGRAM.find(x=>x.id==="DONATE_20");
 assert.deepEqual(resolveArgs(donate,actor),[actor.vault,"20"]);
 const afterDeposit={...emptyState(),assetOwner:"60",assetVault:"40",
  assetSupply:"100",sharesOwner:"40",sharesSupply:"40",
  vaultTotalAssets:"40",allowanceOwnerVault:"0"};
 const afterDonation=transitionDonation(afterDeposit,donate,null);
 assert.deepEqual(afterDonation,{...afterDeposit,assetOwner:"40",
  assetVault:"60",vaultTotalAssets:"60"});
 for(const [variant,burn,shares] of [["OPENZEPPELIN","11","29"],
   ["SOLMATE","10","30"]]){
  const withdrawn=transitionDonation(afterDonation,
   PROGRAM.find(x=>x.id==="WITHDRAW"),{
    shares:expectedPreview(variant,"15",afterDonation)});
  assert.equal(withdrawn.assetOwner,"55");
  assert.equal(withdrawn.assetVault,"45");
  assert.equal(withdrawn.vaultTotalAssets,"45");
  assert.equal(withdrawn.assetSupply,"100");
  assert.equal(withdrawn.sharesOwner,shares);
  assert.equal((40n-BigInt(shares)).toString(),burn);
 }
});
test("unknown arguments or negative balances fail closed",()=>{
 assert.throws(()=>resolveArgs({...PROGRAM[5],args:["MALICIOUS_CALL"]},
  {owner:"A",vault:"B",attacker:"C"}),/UNKNOWN_DONATION_PROGRAM_VARIABLE/);
 assert.throws(()=>transitionDonation(emptyState(),PROGRAM[5],null));
 assert.throws(()=>transitionDonation(emptyState(),{op:"UNREVIEWED_EXECUTE"},null));
});
