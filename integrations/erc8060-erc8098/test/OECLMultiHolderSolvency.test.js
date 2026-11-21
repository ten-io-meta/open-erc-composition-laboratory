const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

describe("OECL pinned multi-holder solvency and guarded surplus",function(){
  it("keeps two independent NFT obligations solvent after maximum permitted surplus withdrawal and sequential joint burns",async function(){
    const [deployer,alice,bob] = await ethers.getSigners();
    const nft = await (await ethers.getContractFactory("ERC8060Reference")).deploy();
    await nft.deployed();
    const units=ethers.utils.parseEther("1");
    const redemption=ethers.utils.parseEther("0.10");
    const mintPrice=ethers.utils.parseEther("0.12");
    const token = await (await ethers.getContractFactory("ERC8098Reference")).deploy(
      "OECL Multi-holder","OECLMH",ethers.utils.parseEther("100"),deployer.address
    );
    await token.deployed();
    const joint=await (await ethers.getContractFactory("OECLJointRedemption")).deploy(
      nft.address,token.address,units
    );
    await joint.deployed();
    await (await nft.connect(alice).mint("ipfs://alice",{value:mintPrice})).wait();
    await (await nft.connect(bob).mint("ipfs://bob",{value:mintPrice})).wait();
    await (await token.transfer(alice.address,units)).wait();
    await (await token.transfer(bob.address,units)).wait();

    const state=async()=>({
      backingWei:(await ethers.provider.getBalance(nft.address)).toString(),
      obligationsWei:(await nft.totalRedeemableValue()).toString(),
      tokenSupply:(await token.totalSupply()).toString(),
      nft1Owner:await nft.ownerOf(1).catch(()=>null),
      nft2Owner:await nft.ownerOf(2).catch(()=>null)
    });
    const before=await state();
    expect(before.backingWei).to.equal(ethers.utils.parseEther("0.24").toString());
    expect(before.obligationsWei).to.equal(ethers.utils.parseEther("0.20").toString());
    const surplus=await nft.surplusValue();
    expect(surplus.eq(ethers.utils.parseEther("0.04"))).to.equal(true);
    const surplusTx=await (await nft.withdrawSurplus(surplus)).wait();
    const afterSurplus=await state();
    expect(afterSurplus.backingWei).to.equal(afterSurplus.obligationsWei);
    expect(afterSurplus.obligationsWei).to.equal(before.obligationsWei);

    await (await nft.connect(alice).approve(joint.address,1)).wait();
    await (await token.connect(alice).approve(joint.address,units)).wait();
    await (await nft.connect(bob).approve(joint.address,2)).wait();
    await (await token.connect(bob).approve(joint.address,units)).wait();

    const first=await (await joint.connect(alice).redeem(1)).wait();
    const afterFirst=await state();
    expect(first.status).to.equal(1);
    expect(afterFirst.nft1Owner).to.equal(null);
    expect(afterFirst.nft2Owner).to.equal(bob.address);
    expect(afterFirst.backingWei).to.equal(redemption.toString());
    expect(afterFirst.obligationsWei).to.equal(redemption.toString());
    expect(afterFirst.tokenSupply).to.equal(ethers.utils.parseEther("99").toString());

    const second=await (await joint.connect(bob).redeem(2)).wait();
    const afterSecond=await state();
    expect(second.status).to.equal(1);
    expect(afterSecond.nft1Owner).to.equal(null);
    expect(afterSecond.nft2Owner).to.equal(null);
    expect(afterSecond.backingWei).to.equal("0");
    expect(afterSecond.obligationsWei).to.equal("0");
    expect(afterSecond.tokenSupply).to.equal(ethers.utils.parseEther("98").toString());
    expect((await ethers.provider.getBalance(joint.address)).eq(0)).to.equal(true);
    expect((await token.balanceOf(joint.address)).eq(0)).to.equal(true);

    const artifact={
      schemaVersion:"OECL_PINNED_MULTIHOLDER_SOLVENCY_V1",chainId:31337,
      sourceRevisions:{
        erc8060:"c7eed906835ab39fbc8439eb0493e5a5371b23a2",
        erc8098:"68a05289bd68d89db8453c49500e0a1ae6cd11ec"
      },
      tx:{
        maxSurplusWithdrawal:surplusTx.transactionHash,
        aliceJointRedemption:first.transactionHash,
        bobJointRedemption:second.transactionHash
      },
      holders:[alice.address,bob.address],
      before,afterSurplus,afterFirst,afterSecond,
      surplusWithdrawnWei:surplus.toString(),
      outcome:"TWO_INDEPENDENT_JOINT_BURNS_AFTER_MAX_ALLOWED_SURPLUS",
      scientificPolarity:"INCONCLUSIVE",
      candidateAdmission:"NOT_ADMITTED"
    };
    if(process.env.OECL_MULTIHOLDER_EVIDENCE_PATH){
      fs.mkdirSync(path.dirname(process.env.OECL_MULTIHOLDER_EVIDENCE_PATH),{recursive:true});
      fs.writeFileSync(process.env.OECL_MULTIHOLDER_EVIDENCE_PATH,JSON.stringify(artifact,null,2)+"\n");
    }
    console.log("OECL_MULTI_HOLDER:"+JSON.stringify({before,afterFirst,afterSecond,
      tx:artifact.tx,scientificPolarity:artifact.scientificPolarity}));
  });
});
