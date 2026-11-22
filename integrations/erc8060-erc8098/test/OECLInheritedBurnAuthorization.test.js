const {expect}=require("chai");
const {ethers}=require("hardhat");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");

describe("OECL pinned inherited ERC20Burnable authorization — isolated local EVM",function(){
  it("distinguishes self burn, insufficient self balance and delegated burnFrom allowance",async function(){
    const [deployer,alice,attacker]=await ethers.getSigners();
    const amount=ethers.utils.parseEther("1");
    const token=await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL 8098 Isolated Burn","OECLISO",ethers.utils.parseEther("100"),deployer.address
    );
    await token.deployed();
    await (await token.transfer(alice.address,amount.mul(3))).wait();
    const snap=async()=>({
      supply:(await token.totalSupply()).toString(),
      aliceBalance:(await token.balanceOf(alice.address)).toString(),
      attackerBalance:(await token.balanceOf(attacker.address)).toString(),
      attackerAllowance:(await token.allowance(alice.address,attacker.address)).toString()
    });
    const isBurn=(receipt,expectedFrom)=>{
      const transfers=receipt.logs.filter(log=>{
        if(log.address.toLowerCase()!==token.address.toLowerCase())return false;
        try {
          const item=token.interface.parseLog(log);
          return item.name==="Transfer" &&
            item.args.from.toLowerCase()===expectedFrom.toLowerCase() &&
            item.args.to===ethers.constants.AddressZero &&
            item.args.value.eq(amount);
        } catch{return false;}
      });
      expect(transfers.length,"expected exact token burn event").to.equal(1);
      expect(receipt.status).to.equal(1);
      return transfers[0].logIndex;
    };
    const beforeSelf=await snap();
    expect(beforeSelf.attackerBalance).to.equal("0");
    const selfReceipt=await (await token.connect(alice).burn(amount)).wait();
    const selfLogIndex=isBurn(selfReceipt,alice.address);
    const afterSelf=await snap();
    expect(BigInt(beforeSelf.supply)-BigInt(afterSelf.supply)).to.equal(BigInt(amount.toString()));
    expect(BigInt(beforeSelf.aliceBalance)-BigInt(afterSelf.aliceBalance)).to.equal(BigInt(amount.toString()));
    expect(afterSelf.attackerBalance).to.equal("0");
    // A public burn acts on _msgSender only: a zero-balance caller cannot
    // destroy Alice's balance by merely invoking burn(uint256).
    const beforeInsufficient=await snap();
    let selfBlocked=false;
    try{await (await token.connect(attacker).burn(amount,{gasLimit:5000000})).wait();}
    catch{selfBlocked=true;}
    expect(selfBlocked,"attacker must not burn somebody else's balance with burn()").to.equal(true);
    const afterInsufficient=await snap();
    expect(afterInsufficient).to.deep.equal(beforeInsufficient);
    const beforeUnauthorized=await snap();
    let delegatedBlocked=false;
    try{await (await token.connect(attacker).burnFrom(alice.address,amount,{gasLimit:5000000})).wait();}
    catch{delegatedBlocked=true;}
    expect(delegatedBlocked,"burnFrom must require allowance").to.equal(true);
    const afterUnauthorized=await snap();
    expect(afterUnauthorized).to.deep.equal(beforeUnauthorized);
    const approval=await (await token.connect(alice).approve(attacker.address,amount)).wait();
    const beforeDelegated=await snap();
    expect(beforeDelegated.attackerAllowance).to.equal(amount.toString());
    const delegatedReceipt=await (await token.connect(attacker).burnFrom(alice.address,amount)).wait();
    const delegatedLogIndex=isBurn(delegatedReceipt,alice.address);
    const afterDelegated=await snap();
    expect(afterDelegated.attackerAllowance).to.equal("0");
    expect(BigInt(beforeDelegated.supply)-BigInt(afterDelegated.supply)).to.equal(BigInt(amount.toString()));
    expect(BigInt(beforeDelegated.aliceBalance)-BigInt(afterDelegated.aliceBalance)).to.equal(BigInt(amount.toString()));
    expect(afterDelegated.attackerBalance).to.equal("0");
    const report={
      schemaVersion:"OECL_PINNED_INHERITED_ERC20_BURN_AUTH_V1",
      classification:"SCOPED_LOCAL_EVM_DIRECT_INHERITED_BURN_AUTHORIZATION",
      source:{repository:"ten-io-meta/erc8098-reference",
        revision:"68a05289bd68d89db8453c49500e0a1ae6cd11ec",
        file:"contracts/ERC8098Reference.sol",
        sha256:crypto.createHash("sha256").update(
          fs.readFileSync(path.join(__dirname,"../contracts/ERC8098Reference.sol"))).digest("hex")},
      testSourceSha256:crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex"),
      dependency:{package:"@openzeppelin/contracts",version:"4.9.6",
        contract:"ERC20Burnable",methods:["burn(uint256)","burnFrom(address,uint256)"]},
      chainId:(await ethers.provider.getNetwork()).chainId,
      tokenAddress:token.address,caller:alice.address,spender:attacker.address,
      burnUnits:amount.toString(),
      selfBurn:{transactionHash:selfReceipt.transactionHash,receiptStatus:selfReceipt.status,
        zeroAddressBurnLogIndex:selfLogIndex,before:beforeSelf,after:afterSelf},
      insufficientSelfBalance:{reverted:selfBlocked,before:beforeInsufficient,after:afterInsufficient},
      // The snapshot after insufficient and unauthorized attempts is identical
      // only before approving; preserve each independent point in the timeline.
      unapprovedDelegatedBurn:{reverted:delegatedBlocked,before:beforeUnauthorized,after:afterUnauthorized},
      approvalTransaction:approval.transactionHash,
      approvedDelegatedBurn:{transactionHash:delegatedReceipt.transactionHash,
        receiptStatus:delegatedReceipt.status,zeroAddressBurnLogIndex:delegatedLogIndex,
        before:beforeDelegated,after:afterDelegated},
      candidateAdmission:"NOT_ADMITTED",scientificPolarity:"INCONCLUSIVE",
      limitations:["Local Hardhat direct-call evidence only; not a full authorization-path trace or audit",
        "The coordinator's allowance requirement is distinct from inherited burn and burnFrom semantics"]
    };
    if(process.env.OECL_INHERITED_BURN_AUTH_PATH){
      fs.mkdirSync(path.dirname(process.env.OECL_INHERITED_BURN_AUTH_PATH),{recursive:true});
      fs.writeFileSync(process.env.OECL_INHERITED_BURN_AUTH_PATH,JSON.stringify(report,null,2)+"\n");
    }
    console.log("OECL_INHERITED_BURN_AUTH_EVM:"+JSON.stringify({selfBurn:true,
      attackerSelfBurnRejected:selfBlocked,unapprovedDelegatedBurnRejected:delegatedBlocked,
      approvedBurnFrom:true,polarity:report.scientificPolarity}));
  });
});
