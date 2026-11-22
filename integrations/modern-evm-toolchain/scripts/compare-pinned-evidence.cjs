"use strict";
// Test-only comparison of independently executed EVM evidence. Not a proof of
// general interoperability, equivalent bytecode, deployed-chain behavior, or
// protocol admission. Historical receipt hashes are intentionally not equated.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const SHA_A = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const SHA_B = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const SRC_A = "ten-io-meta/erc8060-native-eth-value@" + SHA_A;
const SRC_B = "ten-io-meta/erc8098-reference@" + SHA_B;
const decimal = s => {
  assert.equal(typeof s, "string");
  assert.match(s, /^(0|[1-9][0-9]*)$/);
  return BigInt(s);
};
function sha(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}
function requireTx(s) {
  assert.match(s, /^0x[a-fA-F0-9]{64}$/);
}
function compareArtifacts(historical, modern, failures, callbacks, adversarial) {
  assert.equal(historical.classification, "LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
  assert.equal(historical.claimedGlobalCompatibility, false);
  assert.equal(historical.erc8060PinnedRevision, SHA_A);
  assert.equal(historical.erc8098PinnedRevision, SHA_B);
  assert.equal(historical.erc8060Repository, "ten-io-meta/erc8060-native-eth-value");
  assert.equal(historical.erc8098Repository, "ten-io-meta/erc8098-reference");
  assert.equal(modern.status, "LOCAL_EVM_NUMERIC_CONTROLS_OBSERVED");
  assert.deepEqual(modern.participants, [SRC_A, SRC_B]);
  assert.equal(historical.erc8098SourceSha256, modern.erc8098SourceSha256);
  assert.equal(historical.chainId, 31337);
  assert.equal(modern.chainId, 31337);
  requireTx(historical.transactions.jointRedemption);
  requireTx(modern.receiptHash);
  for(const [label,p] of [["historical",historical.contracts],["modern",modern.contracts]]) {
    for(const v of [p.nft,p.monotoneSupply,p.joint])
      assert.match(v, /^0x[a-fA-F0-9]{40}$/, label + " contract address");
  }
  assert.equal(modern.scientificVerdict,"INCONCLUSIVE");
  assert.equal(modern.candidateAdmission,"NOT_ADMITTED");
  const h=historical.observations,m=modern.observations;
  assert.equal(h.sameTransactionContainsBothBurns,true);
  assert.equal(m.sameTransactionContainsBothBurns,true);
  assert.equal(m.nftBurnEvents,1);
  assert.equal(m.erc20BurnEvents,1);
  assert.equal(m.receiptStatus,1);
  assert.equal(h.nftSolventAfter,true);
  assert.equal(m.nftSolventAfter,true);
  assert.equal(h.doubleRedeemRejected,true); // Historical-only control, not parity.
  const fields = [
    "nftBackingBefore","nftBackingAfter","nftObligationBefore",
    "nftObligationAfter","ethRedeemed","alicePayoutNetOfGas",
    "erc20SupplyBefore","erc20SupplyAfter","supplyDecrease"
  ];
  for (const field of fields) {
    assert.equal(decimal(m[field]),decimal(h[field]),"Positive control mismatch: "+field);
  }
  assert.equal(decimal(m.ethRedeemed),100000000000000000n);
  assert.equal(decimal(m.supplyDecrease),1000000000000000000n);
  assert.equal(decimal(m.erc20SupplyBefore)-decimal(m.erc20SupplyAfter),decimal(m.supplyDecrease));
  assert.equal(decimal(m.nftBackingBefore)-decimal(m.nftBackingAfter),decimal(m.ethRedeemed));
  assert.equal(decimal(m.nftObligationBefore)-decimal(m.nftObligationAfter),decimal(m.ethRedeemed));
  assert.equal(decimal(m.alicePayoutNetOfGas),decimal(m.ethRedeemed));
  assert.equal(decimal(m.coordinatorEthBefore),0n);
  assert.equal(decimal(m.coordinatorEthAfter),0n);
  assert.equal(decimal(m.coordinatorTokenAfter),0n);

  assert.equal(failures.schemaVersion, "OECL_PINNED_FAILURE_EXPERIMENTS_V1");
  assert.equal(failures.chainId, 31337);
  assert.equal(failures.candidateAdmission, "NOT_ADMITTED");
  assert.equal(failures.scientificPolarity, "INCONCLUSIVE");
  assert.equal(adversarial.schemaVersion, "OECL_MODERN_LOCAL_ADVERSARIAL_MATRIX_V1");
  assert.equal(adversarial.scientificVerdict, "INCONCLUSIVE");
  assert.equal(adversarial.candidateAdmission, "NOT_ADMITTED");
  assert.equal(adversarial.chainId, 31337);
  assert.equal(adversarial.sourceA,SRC_A);
  assert.equal(adversarial.sourceB,SRC_B);
  const modernCases=new Map(adversarial.checks.map(x=>[x.label,x]));
  assert.equal(modernCases.size,6);
  assert.equal(adversarial.checks.length,6);
  assert.equal(failures.cases.length,4);
  const idMap = new Map([
    ["REVERT-NONOWNER","UNAUTHORIZED_OWNER_REDEEM_REJECTED"],
    ["REVERT-NFT-APPROVAL","MISSING_NFT_APPROVAL_ROLLBACK"],
    ["REVERT-ERC20-APPROVAL","MISSING_TOKEN_ALLOWANCE_ROLLBACK"],
    ["REVERT-ERC20-BALANCE","INSUFFICIENT_TOKEN_BALANCE_ROLLBACK"]
  ]);
  const matches=[];
  for(const historicalCase of failures.cases) {
    const target=idMap.get(historicalCase.experimentId);
    assert.ok(target,"Unmapped historical test: "+historicalCase.experimentId);
    const modernCase=modernCases.get(target);
    assert.ok(modernCase,"Missing modern negative control: "+target);
    assert.equal(historicalCase.sourceProvenance.participantA,SRC_A);
    assert.equal(historicalCase.sourceProvenance.participantB,SRC_B);
    assert.equal(historicalCase.classification,"OBSERVED_LOCAL_EVM_REVERT_AND_STATE_ROLLBACK");
    assert.equal(historicalCase.unchanged,true);
    assert.deepEqual(historicalCase.measuredStateAfter,historicalCase.measuredStateBefore);
    assert.equal(modernCase.status,"REJECTED_WITH_STATE_UNCHANGED");
    assert.equal(modernCase.rollbackVerified,true);
    assert.deepEqual(modernCase.stateAfter,modernCase.stateBefore);
    assert.match(modernCase.stateBefore.owner,/^0x[a-f0-9]{40}$/i);
    assert.match(historicalCase.measuredStateBefore.owner,/^0x[a-f0-9]{40}$/i);
    for(const [hk,mk] of [
      ["redeemableWei","obligations"],
      ["nftBackingWei","nftWei"],
      ["nftValueWei","nftValueWei"],
      ["tokenSupply","tokenSupply"],
      ["aliceTokenBalance","holderUnits"],
      ["jointTokenBalance","jointUnits"],
      ["jointEthWei","jointWei"],
      ["tokenAllowance","tokenAllowance"]
    ]) {
      assert.equal(decimal(historicalCase.measuredStateBefore[hk]),
        decimal(modernCase.stateBefore[mk]),"Failure state mismatch "+target+" / "+hk);
    }
    assert.ok([0,null].includes(historicalCase.revertedReceiptStatus));
    assert.ok([0,null].includes(modernCase.receiptStatus));
    if(historicalCase.revertedReceiptStatus===0)requireTx(historicalCase.attemptedTransactionHash);
    if(modernCase.receiptStatus===0)requireTx(modernCase.transactionHash);
    matches.push({control:historicalCase.experimentId,modernControl:target,
      stateRollbackMatched:true,
      historicalReceiptStatus:historicalCase.revertedReceiptStatus,
      modernReceiptStatus:modernCase.receiptStatus});
  }
  assert.equal(new Set(matches.map(x=>x.modernControl)).size,4);
  assert.equal(callbacks.schemaVersion,"OECL_PINNED_ETH_CALLBACK_EXPERIMENTS_V1");
  assert.equal(callbacks.chainId,31337);
  assert.equal(callbacks.scientificPolarity,"INCONCLUSIVE");
  assert.equal(callbacks.candidateAdmission,"NOT_ADMITTED");
  assert.equal(callbacks.cases.length,2);
  const cb=new Map(callbacks.cases.map(x=>[x.caseId,x]));
  assert.equal(cb.size,2);
  const oldReject=cb.get("REJECTED_ETH_CALLBACK_AT_END");
  const newReject=modernCases.get("REJECTED_ETH_RECEIVER_FULL_ROLLBACK");
  assert.ok(oldReject && newReject);
  assert.equal(oldReject.source.sourceA,SRC_A);
  assert.equal(oldReject.source.sourceB,SRC_B);
  assert.equal(oldReject.receiptStatus,0);
  requireTx(oldReject.transactionHash);
  assert.equal(oldReject.unchanged,true);
  assert.deepEqual(oldReject.after,oldReject.before);
  assert.equal(newReject.receiptStatus,0);
  requireTx(newReject.transactionHash);
  assert.deepEqual(newReject.stateAfter,newReject.stateBefore);
  for(const [hk,mk] of [
    ["nftObligationsWei","obligations"],["nftBalanceWei","backing"],
    ["tokenSupply","supply"],["receiverTokenBalance","receiverBalance"],
    ["receiverEthWei","receiverWei"],["jointEthWei","jointWei"],
    ["jointTokenBalance","jointUnits"],["callbackCount","callbacks"]
  ]) assert.equal(decimal(oldReject.before[hk]),decimal(newReject.stateBefore[mk]),
      "Rejected ETH callback mismatch "+hk);
  const oldReentry=cb.get("REENTRANT_CALLBACK_ATTEMPT_BLOCKED");
  const newReentry=modernCases.get("REENTRANCY_BLOCKED_SINGLE_OUTER_PAYOUT");
  assert.ok(oldReentry && newReentry);
  assert.equal(oldReentry.source.sourceA,SRC_A);
  assert.equal(oldReentry.source.sourceB,SRC_B);
  assert.equal(oldReentry.receiptStatus,1);
  requireTx(oldReentry.transactionHash);
  assert.equal(newReentry.receiptStatus,1);
  requireTx(newReentry.receipt);
  for(const record of [oldReentry,newReentry]) {
    assert.equal(record.callbackAttempted,true);
    assert.equal(record.nestedCallSucceeded,false);
    assert.equal(record.nestedRevertReason,"ReentrancyGuard: reentrant call");
    assert.equal(record.nftBurnEvents,1);
    assert.equal(record.erc20BurnEvents,1);
  }
  assert.equal(decimal(oldReentry.after.nftObligationsWei),decimal(newReentry.obligationsAfter));
  assert.equal(decimal(oldReentry.after.receiverEthWei),decimal(newReentry.receiverEthAfter));
  assert.equal(decimal(oldReentry.before.tokenSupply)-decimal(oldReentry.after.tokenSupply),
    decimal(newReentry.supplyDecrease));
  assert.equal(decimal(newReentry.valuePaidWei),100000000000000000n);
  matches.push({control:"REJECTED_ETH_CALLBACK_AT_END",modernControl:newReject.label,
    minedRollbackMatched:true});
  matches.push({control:"REENTRANT_CALLBACK_ATTEMPT_BLOCKED",modernControl:newReentry.label,
    callbackReentrancyBlocked:true,singleBurnEach:true});
  assert.equal(matches.length,6);
  return {schemaVersion:"OECL_PINNED_MODERN_OBSERVATIONAL_COMPARISON_V1",
    result:"BOUNDED_OBSERVATIONAL_MATCH",
    historicRuntime:"Hardhat2 Ethers5",
    modernRuntime:"Hardhat3 Ethers6",
    participantRevisions:[SHA_A,SHA_B],
    chainId:31337,
    positiveNumericFieldsMatched:fields,
    positiveSharedReceiptEventCountsMatched:true,
    adversarialCasesMatched:matches,
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    notEstablished:[
      "Historical and modern transactions occur in separate local EVMs; their receipt hashes, addresses and gas usage are not required to match.",
      "This does not prove bytecode equivalence, independent protocol discovery, production security, general interoperability, or global composability.",
      "The modern run does not reproduce every historical test, including the historical double-redemption test; its result is validated only on the legacy side.",
      "The core 221-check suite excludes 11 separately routed integration checks and 4 credential-dependent checks.",
      "This is an instrumented, bounded observed-control comparison; not an independent manual audit."
    ]};
}
function main() {
  const files=process.argv.slice(2);
  assert.equal(files.length,5,"Usage: node compare-pinned-evidence.cjs historic-positive.json modern-positive.json historic-failure.json historic-callback.json modern-adversarial.json");
  const raw=files.map(f=>fs.readFileSync(f));
  const inputs=raw.map(b=>JSON.parse(b));
  const result=compareArtifacts(...inputs);
  result.inputSha256=Object.fromEntries(files.map((file,i)=>[path.basename(file),sha(raw[i])]));
  const target=process.env.OECL_EVIDENCE_COMPARISON_PATH || "evidence-comparison.json";
  fs.writeFileSync(target,JSON.stringify(result,null,2)+"\n");
  console.log("OECL_BOUNDED_EVIDENCE_COMPARISON_PASS:"+JSON.stringify({
    result:result.result,positiveFields:result.positiveNumericFieldsMatched.length,
    negativeControls:result.adversarialCasesMatched.length,
    scientificVerdict:result.scientificVerdict,admission:result.candidateAdmission
  }));
}
if(require.main===module)main();
module.exports={compareArtifacts};
