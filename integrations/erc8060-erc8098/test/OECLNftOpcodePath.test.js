"use strict";
const {expect}=require("chai");
const {ethers,network,artifacts}=require("hardhat");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
describe("OECL pinned NFT compiler-source EVM opcode path",function(){
  it("records actual nested NFT opcodes against pinned Solidity source, without proving all paths",async function(){
    const [deployer,alice]=await ethers.getSigners();
    const nft=await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const amount=ethers.utils.parseEther("1");
    const token=await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL AST EVM Trace","OECLTRACE",ethers.utils.parseEther("100"),deployer.address
    );
    await token.deployed();
    const joint=await (await ethers.getContractFactory("OECLJointRedemption")).deploy(
      nft.address,token.address,amount
    );
    await joint.deployed();
    await (await token.transfer(alice.address,amount)).wait();
    await (await nft.connect(alice).mint("ipfs://trace",{value:ethers.utils.parseEther("0.12")})).wait();
    await (await nft.connect(alice).approve(joint.address,1)).wait();
    await (await token.connect(alice).approve(joint.address,amount)).wait();
    const liabilityBefore=await nft.totalRedeemableValue();
    const supplyBefore=await token.totalSupply();
    const receipt=await (await joint.connect(alice).redeem(1)).wait();
    const liabilityAfter=await nft.totalRedeemableValue();
    const supplyAfter=await token.totalSupply();
    expect(receipt.status).to.equal(1);
    expect(liabilityBefore.sub(liabilityAfter).eq(await nft.REDEEM_VALUE())).to.equal(true);
    expect(supplyBefore.sub(supplyAfter).eq(amount)).to.equal(true);
    const trace=await network.provider.send("debug_traceTransaction",[
      receipt.transactionHash,{disableMemory:true,disableStorage:true,disableStack:false}
    ]);
    expect(trace.failed).to.equal(false);
    expect(trace.structLogs.length).to.be.greaterThan(100);
    // Persist opcode program counters and contract-call target stack operands.
    // The independent validator must reconstruct the call frame and compiler
    // source map; this test does NOT assign or trust its own AST line labels.
    const instructionLog=trace.structLogs.map(step=>{
      const line={pc:step.pc,op:step.op,depth:step.depth};
      if(["CALL","STATICCALL","DELEGATECALL","CALLCODE"].includes(step.op)){
        expect(Array.isArray(step.stack),"Opcode call stack unavailable").to.equal(true);
        const stack=step.stack;
        line.target=String(stack[stack.length-2]).replace(/^0x/,"").slice(-40).toLowerCase();
      }
      return line;
    });
    const repoRoot=path.join(__dirname,"..");
    const pinnedSource=fs.readFileSync(path.join(repoRoot,"contracts/ERC8060Reference.sol"));
    const testSource=fs.readFileSync(__filename);
    const report={
      schemaVersion:"OECL_PINNED_NFT_OPCODE_EXECUTION_TRACE_V1",
      origin:"HARDHAT_DEBUG_TRACE_TRANSACTION_OPCODE_SEQUENCE",
      chainId:(await ethers.provider.getNetwork()).chainId,
      transactionHash:receipt.transactionHash,
      transactionStatus:receipt.status,
      contractAddresses:{nft:nft.address,token:token.address,joint:joint.address},
      source:{repository:"ten-io-meta/erc8060-native-eth-value",
        revision:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
        file:"contracts/ERC8060Reference.sol",sha256:hash(pinnedSource)},
      testSourceSha256:hash(testSource),
      measured:{
        nftLiabilityBeforeWei:liabilityBefore.toString(),
        nftLiabilityAfterWei:liabilityAfter.toString(),
        fungibleSupplyBeforeUnits:supplyBefore.toString(),
        fungibleSupplyAfterUnits:supplyAfter.toString()
      },
      instructions:instructionLog,
      scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
      limitations:[
        "Local Hardhat debug trace, not a public-chain trace or formal proof",
        "Source maps attest observed instruction locations; no universal branch feasibility",
        "Only this successful pinned transaction is traced; adversarial path coverage remains separate"
      ]
    };
    expect(report.instructions.some(x=>x.op==="SSTORE")).to.equal(true);
    if(process.env.OECL_NFT_OPCODE_TRACE_PATH){
      fs.mkdirSync(path.dirname(process.env.OECL_NFT_OPCODE_TRACE_PATH),{recursive:true});
      fs.writeFileSync(process.env.OECL_NFT_OPCODE_TRACE_PATH,JSON.stringify(report,null,2)+"\n");
    }
    console.log("OECL_NFT_OPCODE_EXECUTION_TRACE:"+JSON.stringify({
      transactionHash:report.transactionHash,instructions:instructionLog.length,
      maxDepth:Math.max(...instructionLog.map(x=>x.depth)),
      totalSstore:instructionLog.filter(x=>x.op==="SSTORE").length,
      scientificPolarity:report.scientificPolarity
    }));
  });
});
