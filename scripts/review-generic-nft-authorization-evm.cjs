"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {
  verifyPlan,verifyWitness,digest,ZERO
}=require("../laboratory/scientific-open-source-worker/GenericNftAuthorizationEvmProtocol.cjs");
const initial=path.resolve(process.argv[2]||"source-output/nft-ownership");
const fresh=path.resolve(process.argv[3]||"independent-nft-review");
const read=(dir,filename)=>JSON.parse(fs.readFileSync(path.join(dir,filename),"utf8"));
const committed=read(initial,"ownership-experiment-plan.json");
const recomputed=read(fresh,"ownership-experiment-plan.json");
assert(verifyPlan(committed),"ARCHIVED_NFT_RESEARCH_PLAN_INVALID");
assert(verifyPlan(recomputed),"RECOMPILED_NFT_RESEARCH_PLAN_INVALID");
assert.deepEqual(committed,recomputed,
  "EXACT_PINNED_AST_ABI_HARNESS_BYTECODE_OR_REFUTERS_NOT_REPRODUCIBLE");
assert.equal(committed.workflowStatus,"REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED");
const witness=read(initial,"ownership-local-evm-witness.json");
assert(verifyWitness(committed,witness),
  "INDEPENDENT_OWNERSHIP_RECEIPT_OR_LEDGER_WITNESS_REJECTED");
// Independently recompute from the archived balances without using the
// experiment runner's stepEffect() oracle.
const p721=witness.participants.find(x=>x.id==="ERC-721");
const p1155=witness.participants.find(x=>x.id==="ERC-1155");
assert(p721&&p1155);
const cases721=Object.fromEntries(p721.cases.map(x=>[x.id,x]));
const cases1155=Object.fromEntries(p1155.cases.map(x=>[x.id,x]));
const delta=(item,field)=>
  BigInt(item.after[field])-BigInt(item.before[field]);
const tokenCases=["MINT_101","MINT_102","MINT_103"];
for(const key of tokenCases)assert.equal(delta(cases721[key],"ownerBalance"),1n);
assert.equal(delta(cases721.TRANSFER_TOKEN_APPROVED,"ownerBalance"),-1n);
assert.equal(delta(cases721.TRANSFER_TOKEN_APPROVED,"recipientBalance"),1n);
assert.equal(delta(cases721.TRANSFER_GLOBAL_OPERATOR,"ownerBalance"),-1n);
assert.equal(delta(cases721.TRANSFER_GLOBAL_OPERATOR,"recipientBalance"),1n);
assert.equal(cases721.SINGLE_TOKEN_APPROVE.after.token101Approved.toLowerCase(),
  witness.actors.spender.toLowerCase());
assert.equal(cases721.TRANSFER_TOKEN_APPROVED.after.token101Approved.toLowerCase(),
  ZERO.toLowerCase());
assert.equal(cases721.GLOBAL_APPROVE.after.operatorApproved,true);
assert.equal(cases721.GLOBAL_REVOKE.after.operatorApproved,false);
assert.equal(p721.finalState.ownerBalance,"1");
assert.equal(p721.finalState.recipientBalance,"2");
assert.equal(p721.finalState.owners["101"].toLowerCase(),
  witness.actors.recipient.toLowerCase());
assert.equal(p721.finalState.owners["102"].toLowerCase(),
  witness.actors.recipient.toLowerCase());
assert.equal(p721.finalState.owners["103"].toLowerCase(),
  witness.actors.owner.toLowerCase());

assert.equal(delta(cases1155.MINT_100,"ownerBalance"),100n);
assert.equal(delta(cases1155.TRANSFER_25,"ownerBalance"),-25n);
assert.equal(delta(cases1155.TRANSFER_25,"recipientBalance"),25n);
assert.equal(delta(cases1155.TRANSFER_25,"ownerBalance")+
  delta(cases1155.TRANSFER_25,"recipientBalance"),0n);
assert.deepEqual(cases1155.ZERO_TRANSFER.before,cases1155.ZERO_TRANSFER.after);
assert.equal(cases1155.GLOBAL_APPROVE.after.operatorApproved,true);
assert.equal(cases1155.GLOBAL_REVOKE.after.operatorApproved,false);
assert.equal(p1155.finalState.ownerBalance,"75");
assert.equal(p1155.finalState.recipientBalance,"25");
assert.equal(p1155.finalState.operatorApproved,false);
for(const participant of [p721,p1155]){
  for(const test of participant.cases.filter(x=>x.execution==="EXPECT_UNMINED_REVERT")){
    assert.deepEqual(test.before,test.after);
    assert.equal(test.transactionMined,false);
    assert.equal(test.receipt,null);
    assert.equal(test.simulation,"ETH_CALL_REVERT");
  }
}
assert.equal(witness.minedReceiptCount,15);
assert.equal(witness.unminedNegativeCount,8);
assert.equal(witness.crossContractInteroperabilityProven,false);
assert.equal(witness.candidateAdmission,"NOT_ADMITTED");
const summary={
  schemaVersion:"OECL_OWNERSHIP_INDEPENDENT_COMPILER_REPLAY_V1",
  sourcePlanSha256:committed.planSha256,
  witnessSha256:digest(witness),
  sourceDigests:committed.selected.map(x=>({id:x.id,sha256:x.sourceSha256})),
  compilerVersion:committed.compilerVersion,
  checkedSourceAndAbi:true,
  independentlyRecomputedBalanceAndAuthorizationInvariants:true,
  minedLocalReceipts:15,
  unminedExpectedReverts:8,
  nftFinalOwnerBalance:1,
  nftFinalRecipientBalance:2,
  multiTokenFinalOwnerBalance:75,
  multiTokenFinalRecipientBalance:25,
  crossContractInteroperabilityProven:false,
  compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Fresh runner checked archived receipts and source-origin invariants; it did not requery the destroyed in-memory Hardhat blockchain.",
    "Both deployment types used immutable, hash-identified test-only minting wrappers.",
    "No ERC721/1155 composability guarantee is implied by isolated permission tests."
  ]
};
fs.mkdirSync(fresh,{recursive:true});
fs.writeFileSync(path.join(fresh,"independent-review.json"),
  JSON.stringify(summary,null,2)+"\n");
console.log("OECL_OWNERSHIP_INDEPENDENT_AST_ABI_LEDGER_REVIEW_PASS",JSON.stringify({
  planSha256:committed.planSha256,mined:15,unminedNegative:8,
  nftOwner:1,nftRecipient:2,multiOwner:75,multiRecipient:25,
  compatibility:"NOT_EVALUATED"
}));