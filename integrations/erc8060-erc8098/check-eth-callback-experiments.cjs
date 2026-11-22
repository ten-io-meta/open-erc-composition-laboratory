"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const [sourceA,sourceB,reportPath]=process.argv.slice(2);
assert.ok(sourceA&&sourceB&&reportPath,"Usage: <source8060> <source8098> <eth-callbacks.json>");
const A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const git=p=>execFileSync("git",["-C",p,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(git(sourceA),A);
assert.equal(git(sourceB),B);
const reportRaw=fs.readFileSync(reportPath);
const report=JSON.parse(reportRaw);
assert.equal(report.schemaVersion,"OECL_PINNED_ETH_CALLBACK_EXPERIMENTS_V1");
assert.equal(report.chainId,31337);
assert.equal(report.scientificPolarity,"INCONCLUSIVE");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
const testCode=fs.readFileSync(path.join(__dirname,"test/OECLAdversarialEthReceiver.test.js"));
assert.equal(report.sourceTestSha256,crypto.createHash("sha256").update(testCode).digest("hex"));
assert.equal(report.cases.length,2);
const byId=new Map(report.cases.map(x=>[x.caseId,x]));
assert.equal(byId.size,2);
const reject=byId.get("REJECTED_ETH_CALLBACK_AT_END");
const reenter=byId.get("REENTRANT_CALLBACK_ATTEMPT_BLOCKED");
assert.ok(reject&&reenter);
const wei=v=>{
  assert.equal(typeof v,"string");
  assert.match(v,/^(0|[1-9][0-9]*)$/);
  return BigInt(v);
};
for(const entry of [reject,reenter]) {
    assert.match(entry.transactionHash,/^0x[a-f0-9]{64}$/i);
    const source=entry.source;
    assert.equal(source.sourceA,"ten-io-meta/erc8060-native-eth-value@"+A);
    assert.equal(source.sourceB,"ten-io-meta/erc8098-reference@"+B);
    for(const address of [source.nft,source.token,source.coordinator,source.adversarialReceiver])
        assert.match(address,/^0x[a-f0-9]{40}$/i);
    for(const prefix of ["before","after"]) {
        const state=entry[prefix];
        for(const key of ["nftBalanceWei","nftObligationsWei","tokenSupply","receiverTokenBalance",
          "jointTokenBalance","receiverEthWei","jointEthWei","tokenAllowance","callbackCount"])
          wei(state[key]);
        assert.ok(wei(state.nftBalanceWei)>=wei(state.nftObligationsWei));
    }
}
assert.equal(reject.expected,"FULL_TRANSACTION_REVERTS");
assert.equal(reject.receiptStatus,0);
assert.equal(reject.unchanged,true);
assert.deepEqual(reject.after,reject.before,"ETH rejection did not fully roll back state");
assert.equal(reject.before.nftOwner,reject.source.adversarialReceiver);
assert.equal(wei(reject.before.nftObligationsWei),100000000000000000n);
assert.equal(wei(reject.before.tokenSupply),100000000000000000000n);

assert.equal(reenter.expected,"ONE_OUTER_REDEMPTION_AND_ZERO_NESTED_BURNS");
assert.equal(reenter.receiptStatus,1);
assert.equal(reenter.callbackAttempted,true);
assert.equal(reenter.nestedCallSucceeded,false);
assert.equal(reenter.nestedRevertReason,"ReentrancyGuard: reentrant call");
assert.equal(reenter.nftBurnEvents,1);
assert.equal(reenter.erc20BurnEvents,1);
assert.equal(reenter.after.nftOwner,null);
assert.equal(reenter.after.nftObligationsWei,"0");
assert.equal(reenter.after.callbackCount,"1");
assert.equal(reenter.after.attemptedReentry,true);
assert.equal(reenter.after.reentrySucceeded,false);
assert.equal(wei(reenter.after.receiverEthWei)-wei(reenter.before.receiverEthWei),100000000000000000n);
assert.equal(wei(reenter.before.nftBalanceWei)-wei(reenter.after.nftBalanceWei),100000000000000000n);
assert.equal(wei(reenter.before.tokenSupply)-wei(reenter.after.tokenSupply),1000000000000000000n);
assert.equal(reenter.after.receiverTokenBalance,"0");
assert.equal(reenter.after.jointTokenBalance,"0");
assert.equal(reenter.after.jointEthWei,"0");
const result={
    schemaVersion:"OECL_ETH_CALLBACK_EXPERIMENT_VALIDATION_V1",
    reportSha256:crypto.createHash("sha256").update(reportRaw).digest("hex"),
    sourceRevisions:[A,B],
    rejectedPayoutRevertedAtomically:true,
    revertedReceiptStatus:reject.receiptStatus,
    reentrancyAttemptRejectedByGuard:true,
    outerSingleRedemptionSucceeded:true,
    nftAndErc20BurnEventsEach:1,
    scientificPolarity:"INCONCLUSIVE",
    caveat:"Two concrete local-EVM callback paths; not formal global reentrancy security proof."
};
fs.writeFileSync(reportPath.replace(/\.json$/,".validated.json"),JSON.stringify(result,null,2)+"\n");
console.log("OECL_ETH_CALLBACK_VALIDATED:"+JSON.stringify(result));
