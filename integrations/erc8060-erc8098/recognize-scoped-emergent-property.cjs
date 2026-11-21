"use strict";
/**
 * Research-stage observable-property recognizer.
 *
 * Deduces a bounded cross-asset effect from independently produced pinned
 * source, EVM, invariant and rollback artifacts. It NEVER manufactures a
 * CrossProtocolCompositionEngine candidate or promotes scientific polarity.
 * Inputs must first pass their dedicated source/receipt validators in CI.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const [discoveryPath, witnessPath, successPath, rollbackPath, hypothesisPath, outputPath] = process.argv.slice(2);
assert.ok([discoveryPath,witnessPath,successPath,rollbackPath,hypothesisPath,outputPath].every(Boolean),
  "Usage: recognize-scoped-emergent-property <discovery> <invariants> <success> <rollbacks> <hypothesis> <output>");
const read = path => {
  const bytes = fs.readFileSync(path);
  return { data: JSON.parse(bytes.toString("utf8")),
    sha256: crypto.createHash("sha256").update(bytes).digest("hex") };
};
const files = [discoveryPath,witnessPath,successPath,rollbackPath,hypothesisPath].map(read);
const [discovery,witness,success,rollback,hypothesis] = files.map(x=>x.data);
const shaA = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const shaB = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const tx = x => typeof x === "string" && /^0x[a-f0-9]{64}$/i.test(x);
const uint = x => typeof x === "string" && /^(0|[1-9][0-9]*)$/.test(x);
const pinned = (d,s) => d?.participants?.length===2 &&
  d.participants.some(p=>p.protocolId==="ERC-8060" && p.revision===shaA &&
    p.repository==="ten-io-meta/erc8060-native-eth-value") &&
  d.participants.some(p=>p.protocolId==="ERC-8098" && p.revision===shaB &&
    p.repository==="ten-io-meta/erc8098-reference") &&
  d.inheritedEvidence?.importClosure?.status==="RESOLVED" &&
  d.inheritedCapabilityObservations?.every(p=>p.status==="RESOLVED" &&
    p.burnCapabilityProvenance?.some(f=>f.symbol==="burn" && f.sourceFactId)) &&
  s.erc8060PinnedRevision===shaA && s.erc8098PinnedRevision===shaB;
// Detect a bounded property from measured before/after quantities, matching
// source-anchored assertions, independently observed burns and rollback tests.
// Do not rely on a pre-authored property label as sufficient positive evidence.
function recognize(d,w,s,r,h) {
  if (!pinned(d,s) || d.matchedPairCandidates?.length!==0 ||
      w.schemaVersion!=="OECL_PINNED_INVARIANT_WITNESS_V1" ||
      w.scientificPolarity!=="INCONCLUSIVE" ||
      s.chainId!==31337 || s.claimedGlobalCompatibility!==false ||
      r.schemaVersion!=="OECL_PINNED_FAILURE_EXPERIMENTS_V1" ||
      r.cases?.length!==4 ||
      h.hypothesis?.status!=="SCOPED_EXPERIMENTAL_HYPOTHESIS" ||
      h.hypothesis?.discoveryAdmission!=="NOT_ADMITTED" ||
      h.hypothesis?.scientificPolarity!=="INCONCLUSIVE") return null;
  const t=s.transactions?.jointRedemption, o=s.observations;
  if (!tx(t) || !tx(h.hypothesis.sharedTransactionHash) ||
      h.hypothesis.sharedTransactionHash.toLowerCase()!==t.toLowerCase() ||
      w.sourceTransactions?.joint?.toLowerCase()!==t.toLowerCase() ||
      !o?.sameTransactionContainsBothBurns || !o.nftSolventAfter ||
      !Number.isSafeInteger(o.nftBurnLogIndex) ||
      !Number.isSafeInteger(o.erc20BurnLogIndex) ||
      o.nftBurnLogIndex===o.erc20BurnLogIndex) return null;
  const nums=["nftBackingBefore","nftBackingAfter","nftObligationAfter",
    "ethRedeemed","alicePayoutNetOfGas","erc20SupplyBefore","erc20SupplyAfter",
    "supplyDecrease"];
  if(!nums.every(k=>uint(o[k]))) return null;
  const backing0=BigInt(o.nftBackingBefore),backing1=BigInt(o.nftBackingAfter);
  const obligation=BigInt(o.nftObligationAfter),redeemed=BigInt(o.ethRedeemed);
  const paid=BigInt(o.alicePayoutNetOfGas),supply0=BigInt(o.erc20SupplyBefore);
  const supply1=BigInt(o.erc20SupplyAfter),destroyed=BigInt(o.supplyDecrease);
  if(redeemed<=0n || destroyed<=0n || paid!==redeemed ||
      backing0-backing1!==redeemed || backing1<obligation ||
      supply0-supply1!==destroyed || supply1<0n) return null;
  const expected=new Map([
    ["INV-8060-EXACT-PAYOUT","A"],
    ["INV-8060-BACKING-SOLVENT","A"],
    ["INV-8098-MONOTONE-SUPPLY","B"],
    ["INV-JOINT-ATOMIC-BURNS","JOINT"]
  ]);
  if(w.properties?.length<4 || h.hypothesis.supportingPropertyIds?.length!==4) return null;
  const facts=new Set(w.sourceLineage?.facts?.map(x=>x.id)||[]);
  for(const [id,side] of expected) {
    const matches=w.properties.filter(x=>x.invariantId===id);
    if(matches.length!==1) return null;
    const p=matches[0];
    if(p.participantSide!==side || p.verdict!=="OBSERVED_CONSISTENT" ||
       p.executionTransactionHash?.toLowerCase()!==t.toLowerCase() ||
       !p.sourceFactIds?.length ||
       !p.sourceFactIds.every(x=>facts.has(x)) ||
       !h.hypothesis.supportingPropertyIds.includes(id)) return null;
  }
  const allowed=new Set(["REVERT-NONOWNER","REVERT-NFT-APPROVAL",
    "REVERT-ERC20-APPROVAL","REVERT-ERC20-BALANCE"]);
  if(new Set(r.cases.map(x=>x.experimentId)).size!==4 ||
     r.cases.some(x=>!allowed.has(x.experimentId) || !x.unchanged ||
       JSON.stringify(x.measuredStateBefore)!==JSON.stringify(x.measuredStateAfter) ||
       x.sourceProvenance?.participantA!=="ten-io-meta/erc8060-native-eth-value@"+shaA ||
       x.sourceProvenance?.participantB!=="ten-io-meta/erc8098-reference@"+shaB)) return null;
  return {
    kind:"SCOPED_ATOMIC_CROSS_ASSET_REDEMPTION_WITH_MONOTONE_SUPPLY",
    status:"OBSERVED_IN_PINNED_LOCAL_EVM",
    witnessTransaction:t,
    observations:{
      nftValueRedeemedWei:redeemed.toString(),
      fungibleSupplyDestroyedUnits:destroyed.toString(),
      backingAfterWei:backing1.toString(),
      remainingNftObligationsWei:obligation.toString(),
      distinctBurnLogIndices:[o.nftBurnLogIndex,o.erc20BurnLogIndex],
      independentlyCheckedRollbackScenarios:r.cases.length
    }
  };
}
const recognized=recognize(discovery,witness,success,rollback,hypothesis);
assert.ok(recognized,"No bounded source-and-EVM-backed emergent interaction recognized");
// Mutations prove the detector depends on observed evidence, not a target label.
const probes=[
  ["missing_second_burn",(d,w,s)=>{s.observations.sameTransactionContainsBothBurns=false;}],
  ["forged_supply_increase",(d,w,s)=>{s.observations.erc20SupplyAfter=(BigInt(s.observations.erc20SupplyBefore)+1n).toString();}],
  ["no_nft_redemption",(d,w,s)=>{s.observations.nftBackingAfter=s.observations.nftBackingBefore;}],
  ["insolvent_backing",(d,w,s)=>{s.observations.nftObligationAfter=(BigInt(s.observations.nftBackingAfter)+1n).toString();}],
  ["wrong_transaction",(d,w,s,r,h)=>{h.hypothesis.sharedTransactionHash="0x"+"0".repeat(64);}],
  ["altered_rollback",(d,w,s,r)=>{r.cases[0].measuredStateAfter.tokenSupply="999";}],
  ["forged_source_revision",(d)=>{d.participants[0].revision="0".repeat(40);}],
  ["missing_native_fact",(d,w)=>{w.properties[0].sourceFactIds=["NOT-A-SOURCE-FACT"];}],
  ["missing_joint_property",(d,w)=>{w.properties=w.properties.filter(x=>x.invariantId!=="INV-JOINT-ATOMIC-BURNS");}]
];
for(const [label,mutate] of probes) {
  const inputs=structuredClone([discovery,witness,success,rollback,hypothesis]);
  mutate(...inputs);
  assert.equal(recognize(...inputs),null,"Forged evidence falsely recognized: "+label);
}
const report={
  schemaVersion:"OECL_SOURCE_BOUND_EMERGENT_PROPERTY_RECOGNITION_V1",
  sourceArtifacts:files.map((f,i)=>({path:[discoveryPath,witnessPath,successPath,rollbackPath,hypothesisPath][i],sha256:f.sha256})),
  property:recognized,
  adversarialFalsificationProbes:probes.map(x=>x[0]),
  nativeDiscoveryCandidateCount:discovery.matchedPairCandidates.length,
  candidateAdmission:"NOT_ADMITTED",
  scientificPolarity:"INCONCLUSIVE",
  limitation:"A bounded cross-asset emergent effect observed in one pinned local EVM and selected rollback cases; not independently discovered by the general source-only candidate engine, not a universal ERC interoperability claim."
};
fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n");
console.log("OECL_EMERGENT_PROPERTY_RECOGNITION:"+JSON.stringify({
  kind:recognized.kind,status:recognized.status,
  negativeControls:probes.length,candidateAdmission:report.candidateAdmission,
  scientificPolarity:report.scientificPolarity
}));
