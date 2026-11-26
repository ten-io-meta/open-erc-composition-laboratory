"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {review}=require("./review-vault-donation-counterexample.cjs");
const root=path.resolve(process.argv[2]||"");assert(process.argv[2]);
const plan=JSON.parse(fs.readFileSync(path.join(root,"vault-donation-plan.json"),"utf8"));
const w=JSON.parse(fs.readFileSync(path.join(root,"vault-donation-witness.json"),"utf8"));
assert.equal(review(plan,w).minedReceipts,16);
const edits=[
 ["false universal admission",x=>x.candidateAdmission="ADMITTED"],
 ["false compatible",x=>x.compatibilityVerdict="COMPATIBLE"],
 ["mainnet chain fraud",x=>x.chainId=1],
 ["live arbitrary exec",x=>x.arbitrarySolidityExecutionEnabled=true],
 ["parent link fraud",x=>x.planSha256="0".repeat(64)],
 ["claim no scoped refutation",x=>x.scopedHypothesis.verdict="CONFIRMED"],
 ["reverse burned shares",x=>x.scopedHypothesis.solmateWithdrawBurn="11"],
 ["forge donation amount",x=>x.scenarios[0].steps[5].after.assetVault="61"],
 ["forge donation sender balance",x=>x.scenarios[1].steps[5].after.assetOwner="41"],
 ["forge asset total supply",x=>x.scenarios[0].finalState.assetSupply="120"],
 ["forge OZ burnt shares",x=>x.scenarios[0].steps[9].after.sharesOwner="30"],
 ["forge Solmate burnt shares",x=>x.scenarios[1].steps[9].after.sharesOwner="29"],
 ["forge OZ preview",x=>x.scenarios[0].steps[9].preview.shares="10"],
 ["forge SM preview",x=>x.scenarios[1].steps[9].preview.shares="11"],
 ["forge post donation 41 preview",x=>x.scenarios[0].steps[6].preview.shares="41"],
 ["forge maxWithdraw",x=>x.scenarios[1].steps[6].maxWithdraw="41"],
 ["claim pre donation success",x=>x.scenarios[0].steps[4].simulation="ETH_CALL_SUCCESS"],
 ["claim post donation revert",x=>x.scenarios[0].steps[6].simulation="ETH_CALL_REVERT"],
 ["fake mined simulation",x=>x.scenarios[1].steps[6].receipt={status:1}],
 ["fake nonmined donation",x=>x.scenarios[0].steps[5].receipt=null],
 ["forge event amount",x=>x.scenarios[0].steps[5].receipt.events[0].amount="25"],
 ["forge gas",x=>x.scenarios[1].steps[9].receipt.gasUsed="9000000"],
 ["replay tx hash",x=>x.scenarios[1].steps[9].receipt.txHash=x.scenarios[0].steps[9].receipt.txHash],
 ["alter event order",x=>x.scenarios[1].withdrawEventOrder.reverse()],
 ["recycle deployment address",x=>x.scenarios[1].created[0].address=x.scenarios[0].created[0].address],
 ["change actor",x=>x.scenarios[1].steps[3].receipt.from=x.actors.attacker],
 ["add manipulated step",x=>x.scenarios[0].steps.push({id:"ARBITRARY"})],
 ["mark simulated as state changing",x=>x.scenarios[1].steps[8].statePreserved=false],
 ["tamper final custody",x=>x.scenarios[0].finalState.vaultTotalAssets="44"],
 ["alter method selector",x=>x.scenarios[1].steps[5].receipt.methodSelector="0xdeadbeef"]
];
for(const [name,mutation] of edits){
 const modified=structuredClone(w);
 mutation(modified);
 assert.throws(()=>review(plan,modified),"MUTATED_WITNESS_WRONGLY_ACCEPTED:"+name);
}
console.log("OECL_DONATION_FALSIFIER_REJECTIONS_PASS",JSON.stringify({
 originalWitnessReviewed:true,forgedWitnessesRejected:edits.length,
 scopedHypothesis:"EQUAL_SHARE_BURN_REFUTED_ONLY_IN_LOCAL_FIXTURES",
 compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED"}));
