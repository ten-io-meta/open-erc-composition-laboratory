"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {independentlyReview}=require("./review-reusable-vault-grammar.cjs");
const dir=path.resolve(process.argv[2]||"");
assert(process.argv[2],"USAGE: <archived-evidence-dir>");
const plan=JSON.parse(fs.readFileSync(path.join(dir,"reusable-vault-plan.json"),"utf8"));
const witness=JSON.parse(fs.readFileSync(path.join(dir,"reusable-vault-witness.json"),"utf8"));
assert.equal(independentlyReview(plan,witness).minedLocalReceipts,14);
const edits=[
 ["admission",w=>w.candidateAdmission="ADMITTED"],
 ["compatibility",w=>w.compatibilityVerdict="COMPATIBLE"],
 ["mainnet",w=>w.chainId=1],
 ["claim independent source",w=>w.twoIndependentReviewedVaultFamilies=true],
 ["duplicate deployments",w=>w.scenarios[1].created[0].address=w.scenarios[0].created[0].address],
 ["wrong variant ratio",w=>w.scenarios[1].shareRatio=1],
 ["wrong offset preview",w=>w.scenarios[1].steps[3].preview.shares="40"],
 ["wrong offset ledger",w=>w.scenarios[1].steps[3].after.sharesOwner="40"],
 ["wrong offset final",w=>w.scenarios[1].finalState.sharesOwner="25"],
 ["supply forged",w=>w.scenarios[0].steps[3].after.assetSupply="120"],
 ["vault assets forged",w=>w.scenarios[0].steps[3].after.assetVault="41"],
 ["event amount forged",w=>w.scenarios[1].steps[3].receipt.events[3].shares="4000"],
 ["withdraw amount forged",w=>w.scenarios[0].steps[6].receipt.events[2].assets="16"],
 ["receipt hash replay",w=>w.scenarios[1].steps[6].receipt.txHash=w.scenarios[0].steps[6].receipt.txHash],
 ["over gas limit",w=>w.scenarios[0].steps[2].receipt.gasUsed="3000001"],
 ["receipt wrong target",w=>w.scenarios[0].steps[3].receipt.to=w.actors.attacker],
 ["negative marked mined",w=>w.scenarios[1].steps[1].transactionMined=true],
 ["simulated assigned receipt",w=>w.scenarios[0].steps[4].receipt={status:1}],
 ["unknown action",w=>w.scenarios[0].steps[8].signature="steal(address)"],
 ["fake before",w=>w.scenarios[0].steps[6].before.sharesOwner="900"],
 ["revert changed state",w=>w.scenarios[1].steps[5].after.assetOwner="0"],
 ["fabricated plan link",w=>w.planSha256="0".repeat(64)]
];
for(const [name,mutate] of edits){
 const changed=structuredClone(witness);
 mutate(changed);
 assert.throws(()=>independentlyReview(plan,changed),"FORGED_WITNESS_ACCEPTED:"+name);
}
console.log("OECL_REUSABLE_VAULT_FALSIFIERS_REJECTED",JSON.stringify({
 rejected:edits.length,originalReviewed:true,universalCompatibilityProven:false,
 candidateAdmission:"NOT_ADMITTED"}));
