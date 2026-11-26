"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {review}=require("./review-erc4626-vault-flow.cjs");
const [dir]=process.argv.slice(2);
assert(dir,"USAGE: <archived-vault-witness-dir>");
const archived=path.resolve(dir);
const plan=JSON.parse(fs.readFileSync(path.join(archived,"vault-flow-plan.json"),"utf8"));
const witness=JSON.parse(fs.readFileSync(path.join(archived,"vault-flow-witness.json"),"utf8"));
assert.equal(review(plan,witness).minedLocalReceipts,7);
const attacks=[
 ["forge admission",w=>w.candidateAdmission="ADMITTED"],
 ["forge compatibility",w=>w.compatibilityVerdict="COMPATIBLE"],
 ["forge public EVM",w=>w.chainId=1],
 ["alter source hypothesis linkage",w=>w.planSha256="0".repeat(64)],
 ["forge supply",w=>w.steps[3].after.assetSupply="101"],
 ["forge vault custody",w=>w.steps[3].after.assetVault="41"],
 ["forge share balance",w=>w.steps[3].after.sharesOwner="41"],
 ["forge vault balance",w=>w.finalState.vaultTotalAssets="100"],
 ["forge deposit event",w=>w.steps[3].receipt.events[3].shares="41"],
 ["forge withdraw event",w=>w.steps[6].receipt.events[2].assets="30"],
 ["forge transaction hash",w=>w.steps[6].receipt.txHash=w.steps[3].receipt.txHash],
 ["forge unknown recipient",w=>w.steps[3].receipt.to=w.actors.attacker],
 ["turn simulated revert into mined tx",w=>w.steps[1].transactionMined=true],
 ["insert simulated mined receipt",w=>w.steps[4].receipt={status:1}],
 ["remove simulated state preservation",w=>w.steps[5].statePreserved=false],
 ["forge preview",w=>w.steps[3].preview.shares="50"],
 ["deform step identity",w=>w.steps[8].id="MINT_RANDOM"],
 ["forge network receipt gas",w=>w.steps[2].receipt.gasUsed="9000000"]
];
let rejected=0;
for(const [title,mutate] of attacks){
 const tampered=structuredClone(witness);
 mutate(tampered);
 assert.throws(()=>review(plan,tampered),"FORGED_EVIDENCE_WAS_ADMITTED:"+title);
 rejected++;
}
console.log("OECL_VAULT_WITNESS_ADVERSARIAL_REJECTION_PASS",JSON.stringify({
  reviewedOriginal:true,mutatedWitnessesRejected:rejected,
  witnessPromotionAllowed:false,candidateAdmission:"NOT_ADMITTED"}));
