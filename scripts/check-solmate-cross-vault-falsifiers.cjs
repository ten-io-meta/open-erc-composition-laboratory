"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {review}=require("./review-solmate-cross-vault-evm.cjs");
const archive=path.resolve(process.argv[2]||"");
assert(process.argv[2],"USAGE: <archived-evidence-directory>");
const p=JSON.parse(fs.readFileSync(path.join(archive,"solmate-grammar-plan.json")));
const witness=JSON.parse(fs.readFileSync(path.join(archive,"solmate-grammar-witness.json")));
assert.equal(review(p,witness).minedLocalReceipts,14);
const falsifiers=[
 ["promote admission",w=>w.candidateAdmission="ADMITTED"],
 ["forge compatibility",w=>w.compatibilityVerdict="COMPATIBLE"],
 ["fake live chain",w=>w.chainId=1],
 ["disable local restriction",w=>w.arbitrarySolidityExecutionEnabled=true],
 ["forge source identity",w=>w.planSha256="0".repeat(64)],
 ["duplicate transactions",w=>w.scenarios[1].steps[3].receipt.txHash=w.scenarios[0].steps[3].receipt.txHash],
 ["duplicate deployment",w=>w.scenarios[1].created[0].address=w.scenarios[0].created[0].address],
 ["missing simulated revert",w=>w.scenarios[1].steps[4].simulation=null],
 ["claim unmined as mined",w=>w.scenarios[1].steps[5].transactionMined=true],
 ["invent negative receipt",w=>w.scenarios[0].steps[1].receipt={status:1}],
 ["mutate balance",w=>w.scenarios[1].steps[3].after.assetVault="41"],
 ["mutate share supply",w=>w.scenarios[0].steps[3].after.sharesSupply="41"],
 ["mutate asset total",w=>w.scenarios[1].finalState.assetSupply="101"],
 ["mutate preview",w=>w.scenarios[1].steps[3].preview.shares="39"],
 ["mutate deposit event",w=>w.scenarios[1].steps[3].receipt.events[3].shares="42"],
 ["mutate withdraw event",w=>w.scenarios[0].steps[6].receipt.events[2].assets="60"],
 ["change withdraw event order",w=>w.scenarios[1].withdrawEventOrder.reverse()],
 ["alter method",w=>w.scenarios[1].steps[3].signature="steal(uint256)"],
 ["forge recipient",w=>w.scenarios[1].steps[3].receipt.to=w.actors.attacker],
 ["forge gas",w=>w.scenarios[0].steps[2].receipt.gasUsed="3000001"],
 ["change before snapshot",w=>w.scenarios[1].steps[6].before.sharesOwner="0"],
 ["change after on reverted",w=>w.scenarios[0].steps[5].after.assetOwner="0"],
 ["claim one shared codebase",w=>w.twoIndependentVaultCodebasesObserved=false],
 ["fake mined count",w=>w.minedReceipts=15]
];
for(const [name,edit] of falsifiers){
 const altered=structuredClone(witness);
 edit(altered);
 assert.throws(()=>review(p,altered),"FORGED_SOLMATE_WITNESS_ACCEPTED:"+name);
}
console.log("OECL_SOLMATE_CROSS_IMPLEMENTATION_FALSIFIERS_PASS",JSON.stringify({
 originalReconciled:true,mutatedWitnessesRejected:falsifiers.length,
 crossImplementationValidatedOnlyInLocalFixtures:true,
 scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
 candidateAdmission:"NOT_ADMITTED"
}));
