"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {check,verifySources}=require("./evaluate-pinned-invariants.cjs");
const [a,b,evidencePath]=process.argv.slice(2);
assert.ok(a&&b&&evidencePath,"Missing two source roots and joint evidence JSON");
const raw=fs.readFileSync(evidencePath);
const baseline=JSON.parse(raw);
const evaluate=e=>check({sourceA:a,sourceB:b,evidence:e,rawEvidence:Buffer.from(JSON.stringify(e))});
const result=evaluate(baseline);
assert.equal(result.properties.length,4);
assert.equal(result.sourceLineage.facts.length,8);
assert.equal(result.scientificPolarity,"INCONCLUSIVE");
const cases=[
 ["NFT payout mismatch",e=>{e.observations.alicePayoutNetOfGas="1";}],
 ["NFT backing mismatch",e=>{e.observations.nftBackingAfter="1";}],
 ["NFT liability before missing",e=>{delete e.observations.nftObligationBefore;}],
 ["NFT liability decrease forged",e=>{e.observations.nftObligationDecrease="1";}],
 ["NFT obligation before changed",e=>{e.observations.nftObligationBefore="110000000000000000";}],
 ["NFT backing below obligations",e=>{e.observations.nftObligationAfter="99999999999999999999";}],
 ["ERC-8098 supply remint",e=>{e.observations.erc20SupplyAfter="101000000000000000000";}],
 ["ERC-8098 supply decrease tamper",e=>{e.observations.supplyDecrease="3";}],
 ["ERC-8098 initial ceiling tamper",e=>{e.observations.erc20InitialSupply="0";}],
 ["Wrong ERC-8060 revision",e=>{e.erc8060PinnedRevision="0".repeat(40);}],
 ["Wrong ERC-8098 revision",e=>{e.erc8098PinnedRevision="0".repeat(40);}],
 ["Wrong ERC-8098 source hash",e=>{e.erc8098SourceSha256="f".repeat(64);}],
 ["Forged transaction",e=>{e.transactions.jointRedemption="not-a-transaction";}],
 ["Only one burn event",e=>{e.observations.sameTransactionContainsBothBurns=false;}],
 ["Same log reported twice",e=>{e.observations.erc20BurnLogIndex=e.observations.nftBurnLogIndex;}],
 ["Unparseable unsigned amount",e=>{e.observations.ethRedeemed="-1";}]
];
for(const [label,mutate] of cases){
 const e=structuredClone(baseline);
 mutate(e);
 assert.throws(()=>evaluate(e),undefined,label);
}
console.log("PASS: pinned source-derived invariant witness and "+cases.length+" adversarial evidence mutations");
