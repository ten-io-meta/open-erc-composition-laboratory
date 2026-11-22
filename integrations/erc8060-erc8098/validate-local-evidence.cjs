const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const evidencePath = process.argv[2];
if (!evidencePath) throw new Error("Usage: node validate-local-evidence.cjs <evidence.json>");
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
const isAddress = value => /^0x[0-9a-fA-F]{40}$/.test(value);
const isTx = value => /^0x[0-9a-fA-F]{64}$/.test(value);
assert.equal(evidence.classification, "LOCAL_REAL_EVM_EXPERIMENT_WITH_EXPERIMENTAL_8098_FIXTURE");
assert.equal(evidence.claimedGlobalCompatibility, false);
assert.equal(evidence.erc8060Repository, "ten-io-meta/erc8060-native-eth-value");
assert.equal(evidence.erc8060PinnedRevision, "c7eed906835ab39fbc8439eb0493e5a5371b23a2");
assert.equal(evidence.erc8098Status, "EXPERIMENTAL_FIXTURE_NOT_EXTERNAL_REFERENCE");
assert.equal(evidence.chainId, 31337);
assert.match(evidence.erc8098FixtureSha256, /^[0-9a-f]{64}$/);
for (const address of Object.values(evidence.contracts)) assert.ok(isAddress(address));
assert.ok(isTx(evidence.transactions.mint));
assert.ok(isTx(evidence.transactions.jointRedemption));
assert.equal(evidence.observations.sameTransactionContainsBothBurns, true);
assert.equal(evidence.observations.nftSolventAfter, true);
assert.equal(evidence.observations.doubleRedeemRejected, true);
assert.equal(BigInt(evidence.observations.nftObligationAfter), 0n);
const before = BigInt(evidence.observations.erc20SupplyBefore);
const after = BigInt(evidence.observations.erc20SupplyAfter);
const decrease = BigInt(evidence.observations.supplyDecrease);
assert.equal(before - after, decrease);
assert.ok(decrease > 0n);
assert.ok(after >= 0n);

/*
 * Operational evidence is admitted as a local experiment only.
 * It is NOT converted into candidate SUPPORT/CHALLENGE because the
 * 8098 participant is a locally-authored fixture, not an independently
 * sourced and pinned ERC implementation admitted by OECL discovery.
 */
const receipt = {
  schemaVersion: "OECL_LOCAL_COMPOSITION_RECEIPT_V1",
  admission: "ACCEPTED_LOCAL_EVM_EVIDENCE",
  experimentScope: "PINNED_ERC8060_PLUS_EXPERIMENTAL_8098_FIXTURE",
  scientificPolarity: "INCONCLUSIVE",
  reasons: [
    "The joint execution used two Solidity contracts in one local EVM and emitted transaction-scoped evidence.",
    "ERC-8098 participant is an experimental fixture, not an independently admitted pinned source.",
    "No discovered composition candidate or complete externally admitted constraint set is attached.",
    "Local experimental success cannot establish universal protocol compatibility."
  ],
  source: { path: path.basename(evidencePath), sha256: require("node:crypto").createHash("sha256").update(fs.readFileSync(evidencePath)).digest("hex") },
  erc8060PinnedRevision: evidence.erc8060PinnedRevision,
  transaction: evidence.transactions.jointRedemption,
  erc8098FixtureSha256: evidence.erc8098FixtureSha256
};
const receiptPath = evidencePath.replace(/\.json$/, ".receipt.json");
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
console.log("OECL_LOCAL_EVIDENCE_VALIDATION:" + JSON.stringify(receipt));
