import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import { network } from "hardhat";
const { ethers }=await network.connect();
const [deployer,alice]=await ethers.getSigners();
const nft=await ethers.deployContract("ERC8060Reference");
await nft.waitForDeployment();
const units=ethers.parseEther("1");
const token=await ethers.deployContract("ERC8098Reference",[
  "OECL AST EVM Trace","OECLTRACE",ethers.parseEther("100"),deployer.address
]);
await token.waitForDeployment();
const joint=await ethers.deployContract("OECLJointRedemption",[
  await nft.getAddress(),await token.getAddress(),units
]);
await joint.waitForDeployment();
await(await token.transfer(alice.address,units)).wait();
await(await nft.connect(alice).mint("ipfs://trace",{value:ethers.parseEther("0.12")})).wait();
await(await nft.connect(alice).approve(await joint.getAddress(),1n)).wait();
await(await token.connect(alice).approve(await joint.getAddress(),units)).wait();
const liabilityBefore=await nft.totalRedeemableValue();
const supplyBefore=await token.totalSupply();
const receipt=await(await joint.connect(alice).redeem(1n)).wait();
const liabilityAfter=await nft.totalRedeemableValue();
const supplyAfter=await token.totalSupply();
assert.equal(receipt.status,1);
assert.equal(liabilityBefore-liabilityAfter,await nft.REDEEM_VALUE());
assert.equal(supplyBefore-supplyAfter,units);
const trace=await ethers.provider.send("debug_traceTransaction",[
  receipt.hash,{disableMemory:true,disableStorage:true,disableStack:false}
]);
assert.equal(trace.failed,false);
assert.ok(trace.structLogs.length>100);
const instructionLog=trace.structLogs.map(step=>{
  const line={pc:step.pc,op:step.op,depth:step.depth};
  if(["CALL","STATICCALL","DELEGATECALL","CALLCODE"].includes(step.op)){
    assert.ok(Array.isArray(step.stack),"Missing raw call stack");
    line.target=String(step.stack[step.stack.length-2]).replace(/^0x/,"").slice(-40).toLowerCase();
  }
  return line;
});
assert.ok(instructionLog.some(x=>x.op==="SSTORE"));
const originalSource=fs.readFileSync("contracts/ERC8060Reference.sol");
const hash=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const report={
  schemaVersion:"OECL_MODERN_PINNED_NFT_OPCODE_EXECUTION_TRACE_V1",
  origin:"HARDHAT3_DEBUG_TRACE_TRANSACTION_OPCODE_SEQUENCE",
  chainId:Number((await ethers.provider.getNetwork()).chainId),
  transactionHash:receipt.hash,
  transactionStatus:receipt.status,
  contractAddresses:{nft:await nft.getAddress(),token:await token.getAddress(),joint:await joint.getAddress()},
  source:{repository:"ten-io-meta/erc8060-native-eth-value",
    revision:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
    file:"contracts/ERC8060Reference.sol",sha256:hash(originalSource)},
  measured:{
    nftLiabilityBeforeWei:liabilityBefore.toString(),
    nftLiabilityAfterWei:liabilityAfter.toString(),
    fungibleSupplyBeforeUnits:supplyBefore.toString(),
    fungibleSupplyAfterUnits:supplyAfter.toString()
  },
  instructions:instructionLog,
  scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Local Hardhat3 debug trace, not a live chain trace or global path proof",
    "Compare observed opcode properties, not exact bytecodes or program counters across compiler runtimes",
    "No independent source-map attestation is claimed by this runner"
  ]
};
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/modern-nft-opcode.json",JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_OPCODE_PARITY_PASS:"+JSON.stringify({
  instructionCount:instructionLog.length,sstore:instructionLog.filter(x=>x.op==="SSTORE").length,
  maxDepth:Math.max(...instructionLog.map(x=>x.depth)),
  scientificPolarity:report.scientificPolarity
}));
