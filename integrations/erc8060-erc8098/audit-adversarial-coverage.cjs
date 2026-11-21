"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const [successPath,rollbackPath,callbackPath,multiholderPath,outPath]=process.argv.slice(2);
assert.ok(successPath&&rollbackPath&&callbackPath&&multiholderPath&&outPath,"Expected positive, revert, callback JSON artifacts and output");
const read=p=>({raw:fs.readFileSync(p),data:JSON.parse(fs.readFileSync(p,"utf8"))});
const positive=read(successPath),rollback=read(rollbackPath),callback=read(callbackPath),multiholder=read(multiholderPath);
assert.equal(positive.data.classification,"LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
assert.equal(positive.data.claimedGlobalCompatibility,false);
assert.equal(positive.data.chainId,31337);
assert.match(positive.data.transactions.jointRedemption,/^0x[a-f0-9]{64}$/i);
assert.equal(positive.data.observations.sameTransactionContainsBothBurns,true);
assert.equal(rollback.data.schemaVersion,"OECL_PINNED_FAILURE_EXPERIMENTS_V1");
assert.equal(callback.data.schemaVersion,"OECL_PINNED_ETH_CALLBACK_EXPERIMENTS_V1");
assert.equal(rollback.data.chainId,31337);
assert.equal(callback.data.chainId,31337);
const revertIds=["REVERT-NONOWNER","REVERT-NFT-APPROVAL","REVERT-ERC20-APPROVAL","REVERT-ERC20-BALANCE"];
assert.deepEqual(rollback.data.cases.map(x=>x.experimentId).sort(),revertIds.sort());
assert.ok(rollback.data.cases.every(x=>x.revertedReceiptStatus===0 && x.unchanged===true &&
    /^0x[a-f0-9]{64}$/i.test(x.attemptedTransactionHash) &&
    JSON.stringify(x.measuredStateBefore)===JSON.stringify(x.measuredStateAfter)));
const byCallback=new Map(callback.data.cases.map(x=>[x.caseId,x]));
assert.equal(byCallback.size,2);
const rejected=byCallback.get("REJECTED_ETH_CALLBACK_AT_END");
const reentry=byCallback.get("REENTRANT_CALLBACK_ATTEMPT_BLOCKED");
assert.ok(rejected&&reentry);
assert.equal(rejected.receiptStatus,0);
assert.deepEqual(rejected.before,rejected.after);
assert.equal(reentry.receiptStatus,1);
assert.equal(reentry.nestedRevertReason,"ReentrancyGuard: reentrant call");
assert.equal(reentry.nftBurnEvents,1);
assert.equal(reentry.erc20BurnEvents,1);
assert.equal(multiholder.data.schemaVersion,"OECL_PINNED_MULTIHOLDER_SOLVENCY_V1");
assert.equal(multiholder.data.scientificPolarity,"INCONCLUSIVE");
assert.equal(multiholder.data.candidateAdmission,"NOT_ADMITTED");
assert.equal(multiholder.data.holders.length,2);
assert.equal(multiholder.data.afterFirst.nft1Owner,null);
assert.equal(multiholder.data.afterFirst.nft2Owner,multiholder.data.holders[1]);
assert.equal(multiholder.data.afterSecond.nft2Owner,null);
assert.equal(multiholder.data.afterSecond.nftObligationsWei,"0");
assert.equal(multiholder.data.afterSecond.backingWei,"0");
assert.equal(multiholder.data.afterSecond.tokenSupply,"98000000000000000000");
const tested=[
    ["JOINT_SUCCESS","POSITIVE_TRANSACTION"],
    ["PAYOUT_EXACT","POSITIVE_TRANSACTION"],
    ["NFT_SOLVENCY_AFTER_BURN","POSITIVE_TRANSACTION"],
    ["ERC20_MONOTONIC_BURN","POSITIVE_TRANSACTION"],
    ...revertIds.map(x=>[x,"MINED_REVERT_STATE_EQUALITY"]),
    ["REJECTED_ETH_AT_FINAL_PAYMENT","MINED_REVERT_STATE_EQUALITY"],
    ["REENTRANT_RECEIVE_CALLBACK","MINED_SUCCESS_NESTED_REVERT"],
    ["TWO_HOLDERS_MAX_SURPLUS_SEQUENTIAL_REDEMPTION","MULTIHOLDER_LOCAL_EVM_STATE_SEQUENCE"]
];
const absent=[
    ["ADVERSARIAL_ERC20_IMPLEMENTATION","Not tested: ERC-8098 is a fixed reference and not an arbitrary token."],
    ["ADVERSARIAL_NFT_IMPLEMENTATION","Not tested: ERC-8060 is fixed and not an arbitrary ERC-721."],
    ["CONCURRENT_MULTIHOLDER_INTERLEAVING","Two holders redeemed sequentially; adversarial transaction ordering and same-block races untested."],
    ["MANY_USERS_AND_APPROVAL_RACES","Only tested signers and explicit one-token approvals."],
    ["GAS_EXHAUSTION_AND_COMPLEX_RECEIVER_CALLBACKS","Rejecting ETH and single nested redeem tested; unbounded gas grief not tested."],
    ["PUBLIC_CHAIN_RECEIPT_REPLAY","Observations from local Hardhat EVM; no independent chain replay."],
    ["FORMAL_VERIFICATION","Finite scenario testing, not mathematical proof over all state transitions."],
    ["GENERAL_PROTOCOL_DISCOVERY","The authentic cross-protocol scientific candidate is not admitted."],
    ["ERC8098_CONSTRUCTOR_AND_UPGRADE_VARIANTS","Not tested across other ERC-8098 implementations or proxy upgrades."]
];
const report={
    schemaVersion:"OECL_ADVERSARIAL_COVERAGE_AUDIT_V1",
    createdFrom:"PINNED_LOCAL_EVM_EXPERIMENT_ARTIFACTS",
    artifactSha256:{
        success:crypto.createHash("sha256").update(positive.raw).digest("hex"),
        rollback:crypto.createHash("sha256").update(rollback.raw).digest("hex"),
        callbacks:crypto.createHash("sha256").update(callback.raw).digest("hex"),
        multiholder:crypto.createHash("sha256").update(multiholder.raw).digest("hex")
    },
    observedTests:tested.map(([id,evidenceClass])=>({id,evidenceClass,status:"OBSERVED_LOCAL"})),
    uncovered:absent.map(([id,reason])=>({id,reason,status:"UNTESTED"})),
    observedTransactions:{
        successful:positive.data.transactions.jointRedemption,
        reverted:[...rollback.data.cases.map(x=>x.attemptedTransactionHash),rejected.transactionHash],
        guardedOuterSuccess:reentry.transactionHash
    },
    status:"PARTIAL_COVERAGE",
    candidateAdmission:"NOT_ADMITTED",
    scientificPolarity:"INCONCLUSIVE",
    interpretation:"Explicit finite-state experiment audit; no security certification or global composability claim."
};
assert.equal(report.observedTests.length,11);
assert.equal(report.uncovered.length,9);
fs.writeFileSync(outPath,JSON.stringify(report,null,2)+"\n");
console.log("OECL_ADVERSARIAL_COVERAGE_AUDIT:"+JSON.stringify({
    observed:report.observedTests.length,uncovered:report.uncovered.length,status:report.status,
    candidateAdmission:report.candidateAdmission,scientificPolarity:report.scientificPolarity
}));
