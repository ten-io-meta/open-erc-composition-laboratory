const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");

const ERC8060_REV = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const ERC8098_REV = "68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const txHash = value => typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value);
const address = value => typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value);
const gitSha = dir => execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
function validate(source8060, source8098, evidenceFile) {
  assert.equal(gitSha(source8060), ERC8060_REV, "ERC8060 unpinned source");
  assert.equal(gitSha(source8098), ERC8098_REV, "ERC8098 unpinned source");
  const raw = fs.readFileSync(evidenceFile);
  const report = JSON.parse(raw);
  assert.equal(report.classification, "LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
  assert.equal(report.claimedGlobalCompatibility, false);
  assert.equal(report.erc8060Repository, "ten-io-meta/erc8060-native-eth-value");
  assert.equal(report.erc8060PinnedRevision, ERC8060_REV);
  assert.equal(report.erc8098Repository, "ten-io-meta/erc8098-reference");
  assert.equal(report.erc8098PinnedRevision, ERC8098_REV);
  assert.equal(report.erc8098Status, "AUTHOR_MAINTAINED_PINNED_REFERENCE_CANDIDATE");
  const source8098Bytes = fs.readFileSync(path.join(source8098, "contracts/ERC8098Reference.sol"));
  const source8098Sha256 = crypto.createHash("sha256").update(source8098Bytes).digest("hex");
  assert.equal(report.erc8098SourceSha256, source8098Sha256);
  assert.equal(report.chainId, 31337);
  assert.ok(Object.values(report.contracts).every(address));
  assert.ok(Object.values(report.transactions).every(txHash));
  const observed = report.observations;
  assert.equal(observed.sameTransactionContainsBothBurns, true);
  assert.ok(Number.isSafeInteger(observed.nftBurnLogIndex));
  assert.ok(Number.isSafeInteger(observed.erc20BurnLogIndex));
  assert.notEqual(observed.nftBurnLogIndex, observed.erc20BurnLogIndex);
  assert.equal(observed.nftSolventAfter, true);
  assert.equal(observed.doubleRedeemRejected, true);
  const backingBefore = BigInt(observed.nftBackingBefore);
  const backingAfter = BigInt(observed.nftBackingAfter);
  const redeem = BigInt(observed.ethRedeemed);
  const payout = BigInt(observed.alicePayoutNetOfGas);
  for(const key of ["nftObligationBefore","nftObligationAfter","nftObligationDecrease"])
    assert.match(observed[key], /^(0|[1-9][0-9]*)$/, "Invalid "+key);
  const obligationBefore=BigInt(observed.nftObligationBefore);
  const obligation = BigInt(observed.nftObligationAfter);
  const obligationDecrease=BigInt(observed.nftObligationDecrease);
  assert.ok(obligationBefore>=redeem && obligationBefore>=obligation);
  assert.equal(obligationBefore-obligation,redeem,"NFT liabilities did not decrease by redeemable amount");
  assert.equal(obligationDecrease,redeem,"NFT obligation delta must match payout");
  assert.ok(backingBefore >= redeem);
  assert.equal(backingBefore - backingAfter, redeem, "NFT backing change mismatches redemption");
  assert.equal(payout, redeem, "NFT owner ETH payment differs from actual redemption");
  assert.ok(backingAfter >= obligation);
  const before = BigInt(observed.erc20SupplyBefore);
  const after = BigInt(observed.erc20SupplyAfter);
  const decrease = BigInt(observed.supplyDecrease);
  assert.ok(before <= BigInt(observed.erc20InitialSupply));
  assert.equal(before - after, decrease);
  assert.ok(decrease > 0n && after >= 0n);
  const receipt = {
    schemaVersion: "OECL_TWO_PINNED_REFERENCES_EVIDENCE_V1",
    admission: "ACCEPTED_REPRODUCIBLE_LOCAL_EVM_INTERACTION",
    source: { file: path.basename(evidenceFile), sha256: crypto.createHash("sha256").update(raw).digest("hex") },
    participants: [
      { id: "ERC-8060", repository: report.erc8060Repository, revision: ERC8060_REV, address: report.contracts.nft },
      { id: "ERC-8098", repository: report.erc8098Repository, revision: ERC8098_REV, address: report.contracts.monotoneSupply, sha256: source8098Sha256 }
    ],
    chainId: report.chainId,
    transactionHash: report.transactions.jointRedemption,
    observed: {
      sameTransactionContainsBothBurns: true,
      exactNetEthPayout: true,
      nftRemainsSolvent: true,
      erc20SupplyNonIncreasing: true,
      rollbackNegativeTestsPassed: true
    },
    scientificPolarity: "INCONCLUSIVE",
    scientificScope: "The joint behavior of two exact, pinned implementations is evidenced on a local Hardhat EVM. This is not full ERC-8098 independent audit or admission of a discovered composition candidate with source-derived constraints.",
    pending: ["CANDIDATE_SPECIFIC_DISCOVERY", "SOURCE_DERIVED_CONSTRAINT_COVERAGE", "OECL_NATIVE_RECIPE_REGISTRATION_AND_EVALUATION"]
  };
  fs.writeFileSync(evidenceFile.replace(/\.json$/, ".receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  console.log("OECL_PINNED_REFERENCES_EVIDENCE:" + JSON.stringify(receipt));
}
if (require.main === module) {
  if (process.argv.length !== 5) throw new Error("Usage: node validate-pinned-references.cjs <erc8060-dir> <erc8098-dir> <evidence.json>");
  validate(...process.argv.slice(2));
}
module.exports = { validate };
