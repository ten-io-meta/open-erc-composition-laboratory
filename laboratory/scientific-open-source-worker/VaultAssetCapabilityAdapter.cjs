"use strict";
/* Pinned, comparative ERC-4626 x ERC-20 capability experiment.
 * Source-only preregistration, no generic EVM execution.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const ROOTS={
  "ERC-4626":"0610f62eeae3a7dee46c4c37cc80c59060fd56cea7fb1e00a950f1e6a2f981ac",
  "ERC-20":"d20d52b4be98738b8aa52b5bb0f88943f62128969b33d654fbca731539a7fe0a"
};
const FIXTURE_SHA="2d95b37480c2a458e95045ddd7d69efc30452c7b2e470de8c264df14149ec674";
const ADAPTER="PINNED_OZ_4_9_6_ERC4626_ERC20_LOCAL_HARDHAT_ONLY";
const ID=(h,label)=>"CAP-"+hash(h+"|"+label).slice(0,24);
const EXPERIMENTS=[
  {code:"VAULT_DEPOSIT_MINTS_SHARES",mechanism:"ERC4626.deposit on pinned vault",
    preconditions:["approved underlying held by owner","vault initially empty","positive amount"],
    support:"Successful mined deposit increases assets in vault and vault share supply by the observed amount",
    falsifier:"Mined successful deposit without the specified vault balance and supply changes"},
  {code:"VAULT_REDEEM_BURNS_SHARES",mechanism:"ERC4626.redeem on pinned vault",
    preconditions:["owner holds shares","redeem amount positive and owned"],
    support:"Successful mined redeem reduces vault total share supply and assets in vault in this exact initial 1:1 fixture",
    falsifier:"Mined successful redeem that leaves vault supply or custody unchanged"},
  {code:"PLAIN_ERC20_DEPOSIT_SELECTOR_REVERTS",mechanism:"Raw read-only deposit(uint256,address) call to pinned plain-ERC20 asset",
    preconditions:["verified asset ABI lacks deposit","same selector accepted by vault","fixed wrapper has no fallback"],
    support:"EVM eth_call to ERC20 asset with vault deposit selector reverts without changing observed state",
    falsifier:"The same valid encoded call succeeds against the pinned plain ERC20 asset"}
];

function assessVaultAssetFixture(x){
  const {report,graph,discovery,feasibility}=x;
  assert.deepEqual(report.selected.map(s=>s.id),["ERC-4626","ERC-20"]);
  assert.equal(report.compilerVersion,"0.8.26+commit.8a97fa7a.Emscripten.clang");
  assert.equal(report.selected.length,2);
  for(const s of report.selected){
    assert.equal(s.kind,"openzeppelin");
    assert.equal(s.revision,"4.9.6");
    assert.equal(s.repository,"@openzeppelin/contracts");
    assert.equal(s.sourceSha256,ROOTS[s.id],"Pinned OpenZeppelin source hash differs");
    assert(graph.sources.some(u=>u.unit===s.sourceUnit&&u.sha256===s.sourceSha256));
  }
  assert.deepEqual(report.selected.map(s=>s.sourceUnit),
    ["@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol",
      "@openzeppelin/contracts/token/ERC20/ERC20.sol"]);
  assert.equal(discovery.hypotheses.length,1,
    "Only the reviewed shared-inheritance hypothesis can use this adapter");
  const h=discovery.hypotheses[0];
  assert.equal(h.kind,"SHARED_STANDARD_INHERITANCE");
  assert.deepEqual(h.bases,["ERC20"]);
  assert.equal(h.evidence.length,2);
  for(let i=0;i<2;i++){
    assert.equal(h.evidence[i].participant,report.selected[i].id);
    assert.equal(h.evidence[i].sourceUnit,report.selected[i].sourceUnit);
    assert.equal(h.evidence[i].sourceSha256,report.selected[i].sourceSha256);
  }
  assert.equal(feasibility.hypotheses.length,1);
  assert.equal(feasibility.hypotheses[0].hypothesisId,h.hypothesisId);
  assert.equal(feasibility.hypotheses[0].pathScreen,"NO_EXECUTABLE_ROUTE_SPECIFIED");

  const rootVault=graph.contracts.filter(c=>c.name==="ERC4626"&&
    c.unit===report.selected[0].sourceUnit&&c.kind==="contract");
  const rootAsset=graph.contracts.filter(c=>c.name==="ERC20"&&
    c.unit===report.selected[1].sourceUnit&&c.kind==="contract");
  assert.equal(rootVault.length,1);assert.equal(rootAsset.length,1);
  assert(rootVault[0].linearizedBaseContracts.includes(rootAsset[0].id));
  const exported=(id,name)=>graph.functions.some(f=>f.contractId===id&&
    f.name===name&&f.implemented===true&&
    ["public","external"].includes(f.visibility));
  for(const fn of ["deposit","redeem"])assert(exported(rootVault[0].id,fn));
  assert.equal(exported(rootAsset[0].id,"deposit"),false);
  assert.equal(exported(rootAsset[0].id,"redeem"),false);
  assert.equal(graph.sources.length>1,true);
  return {ready:true,adapter:ADAPTER,
    originHypothesisId:h.hypothesisId,
    hypothesisKind:h.kind,
    fixtureSourceSha256:FIXTURE_SHA,
    dependencyIntegrity:report.dependencyIntegrity,
    testIds:EXPERIMENTS.map(e=>ID(h.hypothesisId,e.code)),
    protocols:EXPERIMENTS.map(e=>({...e,caseId:ID(h.hypothesisId,e.code),
      status:"PREREGISTERED_NOT_EXECUTED"})),
    boundary:"SHARED_ERC20_INHERITANCE_NOT_EQUAL_RUNTIME_INTERFACE",
    executor:"REVIEWED_LOCAL_HARDHAT_FIXTURE_ONLY"};
}
const integer=v=>typeof v==="string"&&/^(0|[1-9][0-9]*)$/.test(v);
const num=v=>{assert(integer(v),"Invalid unsigned decimal EVM quantity");return BigInt(v)};
const hashTx=v=>typeof v==="string"&&/^0x[a-f0-9]{64}$/i.test(v);
const hashAddress=v=>typeof v==="string"&&/^0x[a-f0-9]{40}$/i.test(v);
function concludeVaultAsset({plan,planBytes,evm,evmBytes,sourcePlan}){
  assert.equal(plan?.schemaVersion,"OECL_CAPABILITY_GATED_SCIENCE_CYCLE_V1");
  assert.deepEqual(plan,sourcePlan,"Stored plan must match source-only regeneration");
  assert.equal(plan.fixture?.adapter,ADAPTER);
  assert.equal(plan.fixture?.ready,true);
  assert.equal(plan.localEvmExecuted,false);
  assert.equal(plan.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(plan.candidateAdmission,"NOT_ADMITTED");
  if(!evm||!evmBytes)return {
    schemaVersion:"OECL_ERC4626_ERC20_SCOPED_CYCLE_CONCLUSION_V1",
    status:"UNRESOLVED_MISSING_EVM_EVIDENCE",
    compatibilityVerdict:"NOT_EVALUATED",scientificVerdict:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",evmEvidenceAdmitted:false,
    scopedConclusions:[]};
  assert.equal(evm.schemaVersion,"OECL_ERC4626_ERC20_LOCAL_EVM_RECEIPTS_V1");
  assert.equal(evm.scope,"OZ_4_9_6_ERC4626_ERC20_ISOLATED_FIXTURE_ONLY");
  assert.deepEqual(evm.selected,["ERC-4626","ERC-20"]);
  assert.equal(evm.scientificVerdict,"INCONCLUSIVE");
  assert.equal(evm.compatibilityVerdict,"NOT_EVALUATED");
  assert.equal(evm.candidateAdmission,"NOT_ADMITTED");
  assert.equal(evm.evmExecuted,true);
  assert.equal(evm.localChainId,31337);
  assert.equal(evm.sourceSha256,plan.fixture.fixtureSourceSha256);
  assert.equal(evm.compilerVersion,"0.8.26+commit.8a97fa7a.Emscripten.clang");
  assert.equal(evm.lockedDependency?.version,"4.9.6");
  assert.equal(evm.lockedDependency?.integrity,plan.fixture.dependencyIntegrity);
  assert.equal(evm.sourcePlanSha256,hash(planBytes));
  assert.equal(evm.originHypothesisId,plan.fixture.originHypothesisId);
  assert.deepEqual(evm.testIds,plan.fixture.testIds);
  assert(evm.observations);
  const o=evm.observations;
  const before=o.beforeDeposit,after=o.afterDeposit,redeem=o.afterRedeem,final=o.afterAllOperations;
  for(const state of [before,after,redeem,final]){
    assert(state&&typeof state==="object");
    for(const k of ["assetsInVault","sharesOwner","sharesAttacker",
      "vaultShareSupply","ownerUnderlying","attackerUnderlying"])num(state[k]);
  }
  const initial=num(o.initialDeposit),claimedShares=num(o.initialShares),
    redeemed=num(o.redeemedAssets),independent=num(o.independentDeposit);
  assert(initial>0n&&redeemed>0n&&independent>0n);
  assert.equal(num(before.vaultShareSupply),0n);
  assert.equal(num(before.assetsInVault),0n);
  assert.equal(num(after.assetsInVault)-num(before.assetsInVault),initial);
  assert.equal(num(after.vaultShareSupply)-num(before.vaultShareSupply),claimedShares);
  assert.equal(num(after.sharesOwner)-num(before.sharesOwner),claimedShares);
  assert.equal(num(after.ownerUnderlying)+initial,num(before.ownerUnderlying));
  // The pinned local fixture has an initial 1:1 share/asset ratio.
  assert.equal(initial,claimedShares);
  assert.equal(num(after.vaultShareSupply)-num(redeem.vaultShareSupply),redeemed);
  assert.equal(num(after.assetsInVault)-num(redeem.assetsInVault),redeemed);
  assert.equal(num(redeem.sharesOwner)+redeemed,num(after.sharesOwner));
  assert.equal(num(redeem.ownerUnderlying)-redeemed,num(after.ownerUnderlying));
  assert.equal(num(final.vaultShareSupply)-num(redeem.vaultShareSupply),independent);
  assert.equal(num(final.assetsInVault)-num(redeem.assetsInVault),independent);
  assert.equal(num(final.sharesAttacker)-num(redeem.sharesAttacker),independent);
  assert.equal(num(final.vaultShareSupply),num(final.assetsInVault));
  assert.equal(o.assetDecimals,18);

  assert.equal(evm.minedReceipts?.length,7);
  const named=new Map(evm.minedReceipts.map(r=>[r.name,r]));
  assert.equal(named.size,7);
  const receipts=[...named.values()];
  assert.equal(new Set(receipts.map(r=>r.txHash.toLowerCase())).size,7);
  for(const r of receipts){
    assert(hashTx(r.txHash));assert.equal(r.status,1);
    assert(Number.isInteger(r.blockNumber)&&r.blockNumber>0);
    assert(num(r.gasUsed)>0n);
    const w=r.witness;
    assert.equal(w?.proofScope,"LOCAL_HARDHAT_PROVIDER_RECEIPT_BLOCK_TRANSACTION_RECHECKED");
    assert(hashTx(w.blockHash));
    assert(hashTx(w.contractCodeKeccak256));
    assert(hashAddress(w.transactionTo));
    assert(hashAddress(w.caller));
    assert(/^0x[a-f0-9]{8}$/i.test(w.methodSelector));
  }
  const asset=evm.fixtureContracts?.asset,vault=evm.fixtureContracts?.vault;
  assert(hashAddress(asset)&&hashAddress(vault));
  const deposit=named.get("deposit underlying through ERC4626");
  const redemption=named.get("redeem some shares for underlying");
  const independentDeposit=named.get("independent account deposits underlying");
  for(const r of [deposit,redemption,independentDeposit]){
    assert.equal(r.witness.transactionTo.toLowerCase(),vault.toLowerCase());
  }
  assert.equal(deposit.witness.event?.name,"Deposit");
  assert.equal(deposit.witness.event.assets,o.initialDeposit);
  assert.equal(deposit.witness.event.shares,o.initialShares);
  assert.equal(redemption.witness.event?.name,"Withdraw");
  assert.equal(redemption.witness.event.assets,o.redeemedAssets);
  assert.equal(redemption.witness.event.shares,o.redeemedAssets);
  assert.equal(independentDeposit.witness.event?.name,"Deposit");
  assert.equal(independentDeposit.witness.event.assets,o.independentDeposit);
  assert.equal(independentDeposit.witness.event.shares,o.independentDeposit);

  assert.equal(evm.readOnlyNegativeControls?.length,3);
  assert.deepEqual(evm.readOnlyNegativeControls.map(n=>n.name),[
    "attacker cannot withdraw owner's shares",
    "attacker cannot deposit without underlying or approval",
    "withdraw above owner's share balance"]);
  assert(evm.readOnlyNegativeControls.every(n=>
    n.execution==="EVM_CALL_STATIC_REVERT"&&n.transactionMined===false&&
    n.statePreserved===true));
  const probe=evm.capabilityProbe;
  assert.equal(probe.caseId,plan.fixture.testIds[2]);
  assert.equal(probe.probedFunction,"deposit(uint256,address)");
  assert.equal(probe.assetHasDepositAbi,false);
  assert.equal(probe.vaultHasDepositAbi,true);
  assert.equal(probe.assetCallReverted,true);
  assert.equal(probe.statePreserved,true);
  assert.equal(probe.transactionMined,false);
  assert.equal(probe.asset.toLowerCase(),asset.toLowerCase());
  assert.equal(probe.vault.toLowerCase(),vault.toLowerCase());
  assert(/^0x[a-f0-9]{8}$/i.test(probe.methodSelector));
  return {
    schemaVersion:"OECL_ERC4626_ERC20_SCOPED_CYCLE_CONCLUSION_V1",
    hypothesisId:plan.fixture.originHypothesisId,
    experimentMethod:"PREREGISTERED_SOURCE_AST_AND_PINNED_LOCAL_EVM_REPLAY",
    status:"SCOPED_BEHAVIORAL_DIFFERENCE_OBSERVED",
    scopedConclusions:[
      {caseId:plan.fixture.testIds[0],
       conclusion:"PINNED_VAULT_DEPOSIT_MINTED_SHARES_AND_RECEIVED_ASSETS",
       localReceipt:deposit.txHash,
       assetDelta:initial.toString(),shareDelta:claimedShares.toString()},
      {caseId:plan.fixture.testIds[1],
       conclusion:"PINNED_VAULT_REDEEM_REDUCED_SHARES_AND_ASSETS",
       localReceipt:redemption.txHash,shareDelta:redeemed.toString()},
      {caseId:plan.fixture.testIds[2],
       conclusion:"PLAIN_PINNED_ERC20_ASSET_DEPOSIT_SELECTOR_REVERTED",
       evidence:"UNMINED_PROVIDER_READONLY_CALL_WITH_STATE_CHECK"}
    ],
    provenance:{sourcePlanSha256:hash(planBytes),
      sourceGraphSha256:plan.provenance.graphSha256,
      evmArtifactSha256:hash(evmBytes),originHypothesisId:plan.fixture.originHypothesisId},
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",evmEvidenceAdmitted:true,
    receiptAuthentication:"LOCAL_PROVIDER_RECHECK_IN_RUNNER;REPLAY_ONLY_RECOMPUTES_ARTIFACT",
    limitations:[
      "Shared ERC20 inheritance did not establish equal exposed behavior: this result is restricted to the pinned wrapper implementations.",
      "The original source-only inheritance finding was not a claim of universal behavioral equivalence.",
      "No independently authenticated chain receipt and no adversarial token implementation were tested.",
      "Read-only reverts were not mined and never count as successful transactions.",
      "Global ERC4626/ERC20 compatibility and candidate admission are not established."
    ]
  };
}
module.exports={assessVaultAssetFixture,concludeVaultAsset,ADAPTER,FIXTURE_SHA};
