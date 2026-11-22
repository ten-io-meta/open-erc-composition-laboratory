import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { network } from "hardhat";

const { ethers } = await network.connect();
const [deployer, alice] = await ethers.getSigners();
const units = ethers.parseEther("1");
const nft = await ethers.deployContract("ERC8060Reference");
await nft.waitForDeployment();
const token = await ethers.deployContract("ERC8098Reference", [
  "OECL ERC8098 Reference", "OECL8098", ethers.parseEther("100"), deployer.address
]);
await token.waitForDeployment();
const joint = await ethers.deployContract("OECLJointRedemption", [
  await nft.getAddress(), await token.getAddress(), units
]);
await joint.waitForDeployment();

await (await token.transfer(alice.address, units)).wait();
const mintTx = await nft.connect(alice).mint("ipfs://oecl-modern-smoke", {
  value: ethers.parseEther("0.12"),
});
await mintTx.wait();
const beforeSupply = await token.totalSupply();
const obligationsBefore = await nft.totalRedeemableValue();
const jointBalanceBefore = await ethers.provider.getBalance(await joint.getAddress());
// Explicit ABI selector avoids the Ethers 6 / JavaScript valueOf() name collision.
const value = await nft.getFunction("valueOf(uint256)").staticCall(1n);
const beforeHolder = await ethers.provider.getBalance(alice.address);
const beforeBacking = await ethers.provider.getBalance(await nft.getAddress());
await (await nft.connect(alice).approve(await joint.getAddress(), 1n)).wait();
await (await token.connect(alice).approve(await joint.getAddress(), units)).wait();
const afterApprovalsHolder = await ethers.provider.getBalance(alice.address);
const response = await joint.connect(alice).redeem(1n);
const receipt = await response.wait();
const afterHolder = await ethers.provider.getBalance(alice.address);
const paidGas = receipt.gasUsed * receipt.gasPrice;
const afterSupply = await token.totalSupply();
const afterBacking = await ethers.provider.getBalance(await nft.getAddress());
const obligationsAfter = await nft.totalRedeemableValue();
const chainId = Number((await ethers.provider.getNetwork()).chainId);
const nftAddress = (await nft.getAddress()).toLowerCase();
const tokenAddress = (await token.getAddress()).toLowerCase();
const erc721BurnTopic = nft.interface.getEvent("Burned").topicHash;
const erc20BurnTopic = token.interface.getEvent("Transfer").topicHash;
const nftBurns = receipt.logs.filter(log => log.address.toLowerCase() === nftAddress && log.topics[0] === erc721BurnTopic);
const erc20Burns = receipt.logs.filter(log => log.address.toLowerCase() === tokenAddress && log.topics[0] === erc20BurnTopic &&
  token.interface.parseLog(log).args.to === ethers.ZeroAddress);
assert.equal(receipt.status, 1);
assert.equal(chainId, 31337);
assert.equal(nftBurns.length, 1);
assert.equal(erc20Burns.length, 1);
assert.equal(value, ethers.parseEther("0.10"));
assert.equal(afterSupply, beforeSupply - units);
assert.equal(obligationsBefore - obligationsAfter, value);
assert.ok(beforeBacking >= obligationsBefore);
assert.ok(afterBacking >= obligationsAfter);
assert.equal(afterBacking, beforeBacking - value);
assert.equal(afterHolder + paidGas - afterApprovalsHolder, value);
assert.equal(obligationsAfter, 0n);
assert.equal(await ethers.provider.getBalance(await joint.getAddress()), 0n);
assert.equal(await token.balanceOf(await joint.getAddress()), 0n);
const report = {
  scope: "HARDHAT3_ETHERS6_NEW_LOCAL_SMOKE_NOT_COMPARABLE_HISTORIC_RECEIPT",
  participants: [
    "ten-io-meta/erc8060-native-eth-value@c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    "ten-io-meta/erc8098-reference@68a05289bd68d89db8453c49500e0a1ae6cd11ec",
  ],
  status: "LOCAL_EVM_NUMERIC_CONTROLS_OBSERVED",
  scientificVerdict: "INCONCLUSIVE",
  candidateAdmission: "NOT_ADMITTED",
  receiptHash: receipt.hash,
  chainId,
  erc8098SourceSha256: crypto.createHash("sha256").update(fs.readFileSync("contracts/ERC8098Reference.sol")).digest("hex"),
  contracts: { nft: await nft.getAddress(), monotoneSupply: await token.getAddress(), joint: await joint.getAddress() },
  observations: {
    sameTransactionContainsBothBurns: nftBurns.length === 1 && erc20Burns.length === 1,
    nftBurnEvents: nftBurns.length,
    erc20BurnEvents: erc20Burns.length,
    nftSolventAfter: afterBacking >= obligationsAfter,
    nftBackingBefore: beforeBacking.toString(),
    nftBackingAfter: afterBacking.toString(),
    nftObligationBefore: obligationsBefore.toString(),
    nftObligationAfter: obligationsAfter.toString(),
    ethRedeemed: value.toString(),
    alicePayoutNetOfGas: (afterHolder + paidGas - afterApprovalsHolder).toString(),
    erc20SupplyBefore: beforeSupply.toString(),
    erc20SupplyAfter: afterSupply.toString(),
    supplyDecrease: (beforeSupply - afterSupply).toString(),
    coordinatorEthBefore: jointBalanceBefore.toString(),
    coordinatorEthAfter: String(await ethers.provider.getBalance(await joint.getAddress())),
    coordinatorTokenAfter: String(await token.balanceOf(await joint.getAddress())),
    receiptStatus: receipt.status
  },
  valuePaidWei: value.toString(),
  supplyDeltaWei: (beforeSupply - afterSupply).toString(),
  approvalGasExcluded: (beforeHolder - afterApprovalsHolder).toString(),
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/modern-smoke.json", JSON.stringify(report, null, 2) + "\n");
console.log("OECL_MODERN_LOCAL_SMOKE_PASS:" + JSON.stringify(report));
