import assert from "node:assert/strict";
import fs from "node:fs";
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
await (await nft.connect(alice).mint("ipfs://oecl-modern-smoke", {
  value: ethers.parseEther("0.12"),
})).wait();
const beforeSupply = await token.totalSupply();
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
assert.equal(value, ethers.parseEther("0.10"));
assert.equal(afterSupply, beforeSupply - units);
assert.equal(afterBacking, beforeBacking - value);
assert.equal(afterHolder + paidGas - afterApprovalsHolder, value);
assert.equal(await nft.totalRedeemableValue(), 0n);
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
  valuePaidWei: value.toString(),
  supplyDeltaWei: (beforeSupply - afterSupply).toString(),
  approvalGasExcluded: (beforeHolder - afterApprovalsHolder).toString(),
};
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync("reports/modern-smoke.json", JSON.stringify(report, null, 2) + "\n");
console.log("OECL_MODERN_LOCAL_SMOKE_PASS:" + JSON.stringify(report));
