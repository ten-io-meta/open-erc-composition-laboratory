"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {compare}=require("./compare-extended-pinned-evidence.cjs");
const files=process.argv.slice(2);
assert.equal(files.length,7,"Require seven independent source-bound historical/modern EVM evidence files");
const originals=files.map(f=>JSON.parse(fs.readFileSync(f,"utf8")));
assert.equal(compare(...originals).result,"BOUNDED_OBSERVATIONAL_MATCH");
const mutations=[
  ["burn source digest spoof",1,x=>x.sourceSha256="f".repeat(64)],
  ["burn self-balance falsely unchanged",1,x=>x.selfBurn.after.aliceBalance=x.selfBurn.before.aliceBalance],
  ["delegated allowance falsely retained",1,x=>x.approvedDelegatedBurn.after.attackerAllowance=x.burnUnits],
  ["unauthorized delegated burn claimed accepted",1,x=>x.unapprovedDelegatedBurn.reverted=false],
  ["multi-holder surplus payout tampered",3,x=>x.surplusWithdrawnWei="1234"],
  ["multi-holder insolvent",3,x=>x.afterFirst.obligationsWei="400000000000000000"],
  ["multi-holder live NFT falsely burned",3,x=>x.afterFirst.nft2Owner=null],
  ["opcode trace fabricated ERC8060 source",5,x=>x.source.sha256="0".repeat(64)],
  ["opcode disappeared NFT call",5,x=>{
    const nft=x.contractAddresses.nft.slice(2).toLowerCase();
    for(const ins of x.instructions)if(ins.target===nft)ins.target="0".repeat(40);
  }],
  ["opcode missing SSTORE",5,x=>x.instructions=x.instructions.filter(x=>x.op!=="SSTORE")],
  ["wrong source-mapped historical witness",6,x=>x.sourceSha256="a".repeat(64)],
  ["false admission in modern evidence",5,x=>x.candidateAdmission="ADMITTED"]
];
for(const [label,index,mutate] of mutations) {
  const copy=structuredClone(originals);
  mutate(copy[index]);
  assert.throws(()=>compare(...copy),undefined,"Comparator accepted forged case: "+label);
}
console.log("OECL_EXTENDED_PARITY_NEGATIVE_CONTROLS_PASS:"+JSON.stringify({
  rejectedMutations:mutations.length,acceptedFakes:0,scientificVerdict:"INCONCLUSIVE",
  candidateAdmission:"NOT_ADMITTED"
}));
