"use strict";
// Deliberate evidence falsification tests. Preserve all actual participant
// sources and historical receipts. No forged report may pass the parity gate.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const { compare }=require("./compare-independent-burnable.cjs");
const [oldFile,newFile,source8060,sourceOZ,modernRoot]=process.argv.slice(2);
assert.ok(oldFile&&newFile&&source8060&&sourceOZ&&modernRoot);
const original=[JSON.parse(fs.readFileSync(oldFile)),JSON.parse(fs.readFileSync(newFile))];
const check=x=>compare(x[0],x[1],source8060,sourceOZ,modernRoot);
assert.equal(check(original).result,"BOUNDED_OBSERVATIONAL_MATCH");
const mutations=[
  ["incorrect ERC8060 source digest",1,x=>x.sourceChain.participants[0].sha256="0".repeat(64)],
  ["incorrect OpenZeppelin source digest",1,x=>x.sourceChain.participants[1].sha256="f".repeat(64)],
  ["admission overclaim",1,x=>x.candidateAdmission="ADMITTED"],
  ["missing independent scenario",1,x=>x.cases.pop()],
  ["scenario reordering",1,x=>{[x.cases[0],x.cases[1]]=[x.cases[1],x.cases[0]]}],
  ["positive receipt falsely reverted",1,x=>x.cases[0].receiptStatus=0],
  ["tampered positive ERC20 supply decrease",1,x=>x.cases[0].observations.tokenSupplyDeltaBaseUnits="2"],
  ["tampered ETH payout",1,x=>x.cases[0].observations.ownerReceivedWeiAfterGas="1"],
  ["failed transaction receipt marked success",1,x=>x.cases[1].receiptStatus=1],
  ["false negative rollback",1,x=>x.cases[2].after.tokenTotalSupply="5"],
  ["missing second leg failure",1,x=>x.cases[5].rollbackObserved=false],
  ["reentrant callback silently accepted",1,x=>x.cases[7].nestedRejected=false],
  ["non-numeric NFT value",1,x=>x.cases[0].before.nftValueWei="[object Object]"],
  ["tampered fixture source",1,x=>x.sourceChain.fixtures.fixture="0".repeat(64)],
  ["legacy incorrect source chain",0,x=>x.sourceChain.participants[1].sha256="a".repeat(64)]
];
for(const [name,index,mutate] of mutations){
  const altered=structuredClone(original);
  mutate(altered[index]);
  assert.throws(()=>check(altered),undefined,"Forged independent EVM evidence accepted: "+name);
}
console.log("OECL_INDEPENDENT_BURNABLE_PARITY_NEGATIVE_PASS:"+JSON.stringify({
  attemptedMutations:mutations.length,acceptedForgedReports:0,
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED"
}));
