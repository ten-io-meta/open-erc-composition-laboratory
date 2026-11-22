"use strict";
const fs = require("node:fs");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const [sourceA,sourceB,reportPath] = process.argv.slice(2);
assert.ok(sourceA && sourceB && reportPath,"Expected pinned source A, B and failure-matrix.json");
const shaA="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const shaB="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const rev=p=>execFileSync("git",["-C",p,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(rev(sourceA),shaA);
assert.equal(rev(sourceB),shaB);
const report=JSON.parse(fs.readFileSync(reportPath,"utf8"));
assert.equal(report.schemaVersion,"OECL_PINNED_FAILURE_EXPERIMENTS_V1");
assert.equal(report.chainId,31337);
assert.equal(report.scientificPolarity,"INCONCLUSIVE");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
const mandatory=new Map([
  ["REVERT-NONOWNER","NFT_OWNER_REQUIRED"],
  ["REVERT-NFT-APPROVAL","NFT_ALLOWANCE_REQUIRED"],
  ["REVERT-ERC20-APPROVAL","TOKEN_ALLOWANCE_REQUIRED"],
  ["REVERT-ERC20-BALANCE","TOKEN_BALANCE_REQUIRED"]
]);
assert.equal(report.cases.length,mandatory.size);
const seen=new Set();
const address=x=>typeof x==="string"&&/^0x[a-f0-9]{40}$/i.test(x);
const unsigned=x=>typeof x==="string"&&/^(0|[1-9][0-9]*)$/.test(x);
const numeric=["nftBackingWei","redeemableWei","nftValueWei","tokenSupply",
  "aliceTokenBalance","jointTokenBalance","jointEthWei","tokenAllowance"];
for(const item of report.cases) {
    assert.ok(mandatory.has(item.experimentId),"Unknown failure experiment");
    assert.ok(!seen.has(item.experimentId),"Repeated experiment");
    seen.add(item.experimentId);
    assert.equal(item.expectedFailure,mandatory.get(item.experimentId));
    assert.equal(item.classification,"OBSERVED_LOCAL_EVM_REVERT_AND_STATE_ROLLBACK");
    assert.equal(item.unchanged,true);
    assert.equal(item.sourceProvenance.participantA,"ten-io-meta/erc8060-native-eth-value@"+shaA);
    assert.equal(item.sourceProvenance.participantB,"ten-io-meta/erc8098-reference@"+shaB);
    assert.ok(Object.values(item.contractAddresses).every(address));
    assert.ok(address(item.measuredStateBefore.owner));
    assert.ok(address(item.measuredStateBefore.nftApproval));
    assert.deepEqual(item.measuredStateAfter,item.measuredStateBefore,
        "Source reported unchanged but numerical state differs");
    for(const key of numeric)assert.ok(unsigned(item.measuredStateBefore[key]),"Invalid "+key);
    assert.ok(BigInt(item.measuredStateBefore.nftBackingWei)>=BigInt(item.measuredStateBefore.redeemableWei));
    assert.equal(item.measuredStateBefore.jointTokenBalance,"0");
    assert.equal(item.measuredStateBefore.jointEthWei,"0");
    if(item.attemptedTransactionHash!==null) {
        assert.match(item.attemptedTransactionHash,/^0x[a-f0-9]{64}$/i);
    }
    assert.ok(item.revertedReceiptStatus===0||item.revertedReceiptStatus===null);
    if(item.revertedReceiptStatus===0) assert.ok(item.attemptedTransactionHash);
}
const counts={cases:report.cases.length,
    sourceBound:report.cases.length,
    revertedReceipts:report.cases.filter(x=>x.revertedReceiptStatus===0).length,
    rejectedBeforeBroadcast:report.cases.filter(x=>x.revertedReceiptStatus===null).length};
const receipts={
    schemaVersion:"OECL_ATOMIC_ROLLBACK_EXPERIMENT_VALIDATION_V1",
    sourceReportSha256:crypto.createHash("sha256").update(fs.readFileSync(reportPath)).digest("hex"),
    sourceRevisionA:shaA,sourceRevisionB:shaB,
    counts,
    allObservedStatesUnchanged:true,
    candidateScientificResult:"INCONCLUSIVE",
    disclaimer:"State was asserted in a local Hardhat test; this validator does not independently replay EVM state. Missing tx hash and receipt status remain explicitly unknown, not asserted proven."
};
fs.writeFileSync(reportPath.replace(/\.json$/,".validated.json"),JSON.stringify(receipts,null,2)+"\n");
console.log("OECL_ATOMIC_FAILURE_EXPERIMENTS:"+JSON.stringify(receipts));
