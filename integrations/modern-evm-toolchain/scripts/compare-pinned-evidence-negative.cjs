"use strict";
// Adversarial integrity tests of the normalized report comparison itself.
// These are mutations of *in-memory* copies of separately generated evidence.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {compareArtifacts}=require("./compare-pinned-evidence.cjs");
const inputs=process.argv.slice(2);
assert.equal(inputs.length,5,"Expected five independently generated evidence JSON paths");
const originals=inputs.map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
assert.equal(compareArtifacts(...originals).result,"BOUNDED_OBSERVATIONAL_MATCH");
const mutations=[
  ["payout mismatch",5,1, x=>{x.observations.ethRedeemed=(BigInt(x.observations.ethRedeemed)+1n).toString()}],
  ["scientific overclaim",5,1, x=>{x.candidateAdmission="ADMITTED"}],
  ["participant mismatch",5,4, x=>{x.sourceA="forged:erc8060"}],
  ["missing adversarial case",5,4, x=>{x.checks.pop()}],
  ["false rollback",5,4, x=>{x.checks[0].stateAfter.tokenSupply="999"}],
  ["missing mined rejection",5,4, x=>{
    const c=x.checks.find(x=>x.label==="REJECTED_ETH_RECEIVER_FULL_ROLLBACK");c.receiptStatus=null
  }],
  ["forged participant source SHA",5,1, x=>{x.erc8098SourceSha256="0".repeat(64)}],
  ["historical not solvent",5,0, x=>{x.observations.nftSolventAfter=false}],
  ["falsified reentrancy outcome",5,4, x=>{
    const c=x.checks.find(x=>x.label==="REENTRANCY_BLOCKED_SINGLE_OUTER_PAYOUT");
    c.nestedCallSucceeded=true
  }]
];
for(const [label,,target,mutate] of mutations){
  const sample=structuredClone(originals);
  mutate(sample[target]);
  assert.throws(()=>compareArtifacts(...sample),"Comparison accepted forged evidence: "+label);
}
console.log("OECL_EVIDENCE_COMPARISON_NEGATIVE_CONTROLS_PASS:"+JSON.stringify({
  attemptedMutations:mutations.length,acceptedForgedReports:0,
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED"
}));
