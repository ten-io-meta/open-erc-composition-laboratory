"use strict";

/*
 * Exact-source operational invariant witness. This is NOT a substitute for
 * native discovery or complete scientific candidate evaluation.
 *
 * All numeric observations are recomputed from the EVM JSON, never
 * admitted by a self-reported 'pass' flag alone. Each witness is bound
 * to a Git commit, a precise source excerpt and the transaction hash.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const SHA_A = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const SHA_B = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const HEX64 = /^0x[0-9a-fA-F]{64}$/;
const hash = data => crypto.createHash("sha256").update(data).digest("hex");
const rev = dir => execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], {encoding:"utf8"}).trim();
const toValue = (x, key) => {
  assert.equal(typeof x, "string", key + " must be canonical unsigned decimal string");
  assert.match(x, /^(0|[1-9][0-9]*)$/, key + " invalid unsigned integer");
  return BigInt(x);
};
function locate(source, needle, sourceName) {
  const lines = source.toString("utf8").split(/\r?\n/);
  const matches = lines.flatMap((text, i) => text.includes(needle) ? [{line:i+1,text:text.trim()}] : []);
  assert.equal(matches.length, 1, "Ambiguous or missing source fact: " + sourceName + ": " + needle);
  return {...matches[0], fragment:needle};
}
function verifySources(a, b) {
  assert.equal(rev(a), SHA_A, "ERC-8060 checkout does not match pinned revision");
  assert.equal(rev(b), SHA_B, "ERC-8098 checkout does not match pinned revision");
  const sourceA = fs.readFileSync(path.join(a,"contracts/ERC8060Reference.sol"));
  const sourceB = fs.readFileSync(path.join(b,"contracts/ERC8098Reference.sol"));
  const lock = JSON.parse(fs.readFileSync(path.join(b,"package-lock.json"),"utf8"));
  const oz = lock.packages?.["node_modules/@openzeppelin/contracts"];
  assert.equal(oz?.version, "4.9.6", "Inherited OpenZeppelin release differs");
  assert.match(oz.integrity, /^sha512-[A-Za-z0-9+/]+=*$/, "Missing OpenZeppelin integrity");
  // Source-based facts do not imply full execution proof. These are explicit
  // source anchors tied to exact revisions and/or locked inherited code.
  const facts = [
    {id:"A-BACKING-OBLIGATION",side:"A",repository:"ten-io-meta/erc8060-native-eth-value",
      revision:SHA_A,file:"contracts/ERC8060Reference.sol", ...locate(sourceA,"totalRedeemableValue -= redeemable;", "ERC8060 burn obligation")},
    {id:"A-PAYOUT",side:"A",repository:"ten-io-meta/erc8060-native-eth-value",
      revision:SHA_A,file:"contracts/ERC8060Reference.sol", ...locate(sourceA,"payable(msg.sender).call{value: redeemable}", "ERC8060 redemption")},
    {id:"A-SURPLUS",side:"A",repository:"ten-io-meta/erc8060-native-eth-value",
      revision:SHA_A,file:"contracts/ERC8060Reference.sol", ...locate(sourceA,"amount <= surplusValue()", "ERC8060 surplus withdrawal")},
    {id:"B-CONSTRUCTOR-MINT",side:"B",repository:"ten-io-meta/erc8098-reference",
      revision:SHA_B,file:"contracts/ERC8098Reference.sol", ...locate(sourceB,"_mint(initialHolder, initialSupply);","ERC8098 constructor mint")},
    {id:"B-ERC20-INHERITANCE",side:"B",repository:"ten-io-meta/erc8098-reference",
      revision:SHA_B,file:"contracts/ERC8098Reference.sol", ...locate(sourceB,"contract ERC8098Reference is ERC20, ERC20Burnable", "ERC8098 OZ inheritance")}
  ];
  assert.equal((sourceB.toString().match(/\b_mint\s*\(/g)||[]).length,1,
    "Reference implementation contains a second direct _mint call");
  assert.ok(!/\bfunction\s+(?:mint|upgradeTo|setImplementation|grantRole)\s*\(/.test(sourceB.toString()),
    "Unexpected public mint or upgrade selector");
  return {
    facts,
    sourceHashes: { A:hash(sourceA), B:hash(sourceB)},
    inheritedDependency: {
      package:"@openzeppelin/contracts",version:oz.version,integrity:oz.integrity,
      verifiedBehavior:"Dependency identity pinned by lockfile; inherited ERC20 runtime behavior is checked by EVM tests; exhaustive inherited supply proof is NOT claimed"
    }
  };
}

function check({sourceA, sourceB, evidence, rawEvidence}) {
  const lineage = verifySources(sourceA,sourceB);
  const e = evidence;
  assert.equal(e.classification,"LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
  assert.equal(e.claimedGlobalCompatibility,false);
  assert.equal(e.erc8060PinnedRevision,SHA_A);
  assert.equal(e.erc8098PinnedRevision,SHA_B);
  assert.equal(e.erc8098SourceSha256,lineage.sourceHashes.B);
  assert.equal(e.chainId,31337);
  assert.match(e.transactions.jointRedemption,HEX64);
  assert.match(e.transactions.mint,HEX64);
  assert.equal(e.observations.sameTransactionContainsBothBurns,true);
  assert.ok(Number.isSafeInteger(e.observations.nftBurnLogIndex));
  assert.ok(Number.isSafeInteger(e.observations.erc20BurnLogIndex));
  assert.notEqual(e.observations.nftBurnLogIndex,e.observations.erc20BurnLogIndex);

  const o=e.observations;
  const amount=toValue(o.ethRedeemed,"ethRedeemed");
  const payout=toValue(o.alicePayoutNetOfGas,"alicePayoutNetOfGas");
  const initialBacking=toValue(o.nftBackingBefore,"nftBackingBefore");
  const finalBacking=toValue(o.nftBackingAfter,"nftBackingAfter");
  const obligations=toValue(o.nftObligationAfter,"nftObligationAfter");
  const supplyBefore=toValue(o.erc20SupplyBefore,"erc20SupplyBefore");
  const supplyAfter=toValue(o.erc20SupplyAfter,"erc20SupplyAfter");
  const supplyDecrease=toValue(o.supplyDecrease,"supplyDecrease");
  const initialSupply=toValue(o.erc20InitialSupply,"erc20InitialSupply");
  const state = [
    {id:"INV-8060-EXACT-PAYOUT",side:"A",sourceFactIds:["A-PAYOUT"],
      verified:payout===amount && amount>0n, observation:{paidWei:payout.toString(),redeemedWei:amount.toString()}},
    {id:"INV-8060-BACKING-SOLVENT",side:"A",sourceFactIds:["A-BACKING-OBLIGATION","A-SURPLUS"],
      verified:initialBacking-finalBacking===amount && initialBacking>=amount && finalBacking>=obligations && o.nftSolventAfter===true,
      observation:{beforeWei:initialBacking.toString(),afterWei:finalBacking.toString(),remainingObligationWei:obligations.toString()}},
    {id:"INV-8098-MONOTONE-SUPPLY",side:"B",sourceFactIds:["B-CONSTRUCTOR-MINT","B-ERC20-INHERITANCE"],
      verified:initialSupply>=supplyBefore && supplyBefore>=supplyAfter && supplyBefore-supplyAfter===supplyDecrease && supplyDecrease>0n,
      observation:{initialUnits:initialSupply.toString(),beforeUnits:supplyBefore.toString(),afterUnits:supplyAfter.toString(),burnedUnits:supplyDecrease.toString()}},
    {id:"INV-JOINT-ATOMIC-BURNS",side:"JOINT",sourceFactIds:["A-BACKING-OBLIGATION","B-ERC20-INHERITANCE"],
      verified:o.sameTransactionContainsBothBurns===true && o.nftBurnLogIndex!==o.erc20BurnLogIndex,
      observation:{jointTransactionHash:e.transactions.jointRedemption,blockNumber:o.jointReceiptBlockNumber,burnLogIndices:[o.nftBurnLogIndex,o.erc20BurnLogIndex]}}
  ];
  const witness=state.map(row=>({
    invariantId:row.id,participantSide:row.side,
    sourceFactIds:row.sourceFactIds,
    executionTransactionHash:e.transactions.jointRedemption,
    verdict:row.verified?"OBSERVED_CONSISTENT":"OBSERVED_VIOLATION",
    checks:row.observation
  }));
  assert.ok(witness.every(x=>x.verdict==="OBSERVED_CONSISTENT"),"Observed numerical invariant violated");
  return {
    schemaVersion:"OECL_PINNED_INVARIANT_WITNESS_V1",
    classification:"LOCAL_EVM_SOURCE_BOUND_PROPERTY_OBSERVATIONS",
    sourceLineage:lineage,
    evidenceSha256:hash(rawEvidence),
    sourceTransactions:{joint:e.transactions.jointRedemption,mint:e.transactions.mint},
    properties:witness,
    propertyCoverage:{observed:witness.length,total:witness.length},
    // This is a property observation report; does not satisfy the currently
    // require-statement-only ScientificCompositionConstraint or discovery gate.
    candidateDiscovery:"NOT_ADMITTED",
    nativeConstraintAdmission:"NOT_ADMITTED_IN_REQUIRE_STATEMENT_ONLY_SCHEMA",
    evaluationSurfaceCompleteness:"PARTIAL",
    scientificPolarity:"INCONCLUSIVE",
    limits:[
      "Measurements are local EVM test-output observations; live receipts are not independently replayed by this report",
      "The OpenZeppelin inherited ERC20 implementation was version-pinned but not formally proven",
      "No admitted independently discovered OECL composition candidate or full constraint set",
      "Atomic revert negative tests passed in CI but are not independently replay-attested by this JSON report"
    ]
  };
}

function evaluate(sourceA,sourceB,evidencePath,write=true) {
  const raw=fs.readFileSync(evidencePath);
  const report=check({sourceA,sourceB,evidence:JSON.parse(raw),rawEvidence:raw});
  if(write) fs.writeFileSync(evidencePath.replace(/\.json$/,".invariants.json"),JSON.stringify(report,null,2)+"\n");
  return report;
}
if(require.main===module){
  const args=process.argv.slice(2);
  if(args.length!==3) throw Error("Usage: node evaluate-pinned-invariants.cjs <source-8060> <source-8098> <evidence.json>");
  const report=evaluate(...args);
  console.log("OECL_INVARIANT_WITNESS:"+JSON.stringify({
    verified:report.properties.length,
    sourceFacts:report.sourceLineage.facts.length,
    scientificPolarity:report.scientificPolarity
  }));
}
module.exports={evaluate,check,verifySources};
