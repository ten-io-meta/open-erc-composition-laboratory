"use strict";
/* Adversarial second-pass tests over ACTUAL locally mined archived witness. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  verifyPlan,verifyWitness
}=require("../laboratory/scientific-open-source-worker/GenericNftAuthorizationEvmProtocol.cjs");
const dir=path.resolve(process.argv[2]||"source-output/nft-ownership");
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
const plan=read("ownership-experiment-plan.json");
const actual=read("ownership-local-evm-witness.json");
assert(verifyPlan(plan));
assert(verifyWitness(plan,actual));
const invalid=[
  ["promote global compatibility",x=>{x.compatibilityVerdict="COMPATIBLE";}],
  ["invent mainnet proof",x=>{x.chainId=1;}],
  ["fake cross-contract composability",x=>{x.crossContractInteroperabilityProven=true;}],
  ["conceal test-only minting",x=>{x.fixtureHasUnsafeResearchMint=false;}],
  ["forge plan provenance",x=>{x.planSha256="0".repeat(64);}],
  ["swap selected source",x=>{x.selected.reverse();}],
  ["duplicate receipt",x=>{x.deployments[1].receipt.txHash=x.deployments[0].receipt.txHash;}],
  ["change ownerOf token",x=>{
    x.participants[0].finalState.owners["101"]=x.actors.owner;
  }],
  ["invent unapproved transfer",x=>{
    x.participants[0].cases[3].transactionMined=true;
  }],
  ["skip operator revocation",x=>{
    x.participants[1].cases[6].after.operatorApproved=true;
  }],
  ["fake transfer amount",x=>{
    x.participants[1].cases[3].receipt.event.amount="20";
  }],
  ["lie about stale 721 approval",x=>{
    x.participants[0].cases[5].after.token101Approved=x.actors.spender;
  }],
  ["turn unmined revert into receipt",x=>{
    x.participants[1].cases[4].receipt={transactionMined:true};
  }],
  ["mint more owner tokens",x=>{
    x.participants[0].cases[0].after.ownerBalance="10";
  }],
  ["invent receipt count",x=>{x.minedReceiptCount=16;}],
  ["alter gas budget",x=>{x.deployments[0].receipt.gasUsed="4000000";}],
  ["forge event approval",x=>{
    x.participants[0].cases[4].receipt.event.to=x.actors.attacker;
  }],
  ["erase zero-address rejection",x=>{
    x.participants[1].cases[8].simulation="DID_NOT_REVERT";
  }]
];
for(const [name,mutate] of invalid){
  const copy=structuredClone(actual);mutate(copy);
  assert.equal(verifyWitness(plan,copy),false,name);
}
console.log("OECL_OWNERSHIP_ACTUAL_WITNESS_FORGERY_REJECTED_PASS:"+invalid.length);