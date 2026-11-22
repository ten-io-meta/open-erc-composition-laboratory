"use strict";
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const wei = x=>ethers.utils.parseEther(x);
const sha256 = x=>crypto.createHash("sha256").update(x).digest("hex");
const originalRevision = "c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const tokenSourceUnit = "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
const originalSourceFile = path.resolve(__dirname,"../contracts/ERC8060Reference.sol");
const sourcePaths = {
  erc8060: originalSourceFile,
  erc20Burnable: path.resolve(__dirname, "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"),
  fixture: path.resolve(__dirname, "../contracts/OECLBurnableFixture.sol"),
  coordinator: path.resolve(__dirname, "../contracts/OECL8060BurnableCoordinator.sol"),
  caller: path.resolve(__dirname, "../contracts/OECLAdversarialBurnableCaller.sol")
};
const cases=[];
function bn(x){return x.toString();}
async function deploy(){
  const [deployer,alice,attacker]=await ethers.getSigners();
  const nft=await(await ethers.getContractFactory("ERC8060Reference")).deploy();
  await nft.deployed();
  const token=await(await ethers.getContractFactory("OECLBurnableFixture")).deploy(wei("100"));
  await token.deployed();
  const units=wei("1");
  const coordinator=await(await ethers.getContractFactory("OECL8060BurnableCoordinator"))
    .deploy(nft.address,token.address,units);
  await coordinator.deployed();
  await(await token.transfer(alice.address,units)).wait();
  const receipt=await(await nft.connect(alice).mint("ipfs://oecl-independent-burnable",
    {value:wei("0.12")})).wait();
  return {deployer,alice,attacker,nft,token,coordinator,units,mintHash:receipt.transactionHash,
    holder:alice.address};
}
async function state(ctx){
  const {nft,token,coordinator,holder,alice}=ctx;
  let owner=null,tokenValue=null,approved=null;
  try{owner=await nft.ownerOf(1);tokenValue=bn(await nft.valueOf(1));approved=await nft.getApproved(1);}
  catch(_){}
  return {
    nftOwner:owner,
    nftValueWei:tokenValue,
    nftApproved:approved,
    obligationWei:bn(await nft.totalRedeemableValue()),
    backingWei:bn(await ethers.provider.getBalance(nft.address)),
    surplusWei:bn(await nft.surplusValue()),
    tokenTotalSupply:bn(await token.totalSupply()),
    holderTokenBalance:bn(await token.balanceOf(holder)),
    coordinatorTokenBalance:bn(await token.balanceOf(coordinator.address)),
    coordinatorEthBalance:bn(await ethers.provider.getBalance(coordinator.address)),
    holderAllowance:bn(await token.allowance(holder,coordinator.address)),
    aliceTokenBalance:bn(await token.balanceOf(alice.address))
  };
}
async function approveBoth(ctx,actor=ctx.alice){
  await(await ctx.nft.connect(actor).approve(ctx.coordinator.address,1)).wait();
  await(await ctx.token.connect(actor).approve(ctx.coordinator.address,ctx.units)).wait();
}
function evidenceBase(ctx,scenario,pre,post,receipt,expected){
  return {
    scenario,expected,sourcePair:["ERC-8060","ERC-20-BURNABLE"],
    chainId:31337,
    contractAddresses:{nft:ctx.nft.address,token:ctx.token.address,coordinator:ctx.coordinator.address},
    actor:ctx.holder,transactionHash:receipt?.transactionHash||null,
    receiptStatus:receipt?.status??null,blockNumber:receipt?.blockNumber??null,
    gasUsed:receipt?bn(receipt.gasUsed):null,
    before:pre,after:post,
    observations:{
      sourceOnly:false,experimentLocalEvm:true,
      nftObligationDeltaWei:String(BigInt(pre.obligationWei??pre.obligations??pre.reserve)-
        BigInt(post.obligationWei??post.obligations??post.reserve)),
      tokenSupplyDeltaBaseUnits:String(BigInt(pre.tokenTotalSupply??pre.supply)-
        BigInt(post.tokenTotalSupply??post.supply)),
      nftBackingDeltaWei:String(BigInt(pre.backingWei??pre.backing??pre.balance)-
        BigInt(post.backingWei??post.backing??post.balance))
    }
  };
}
async function failCase(label,ctx,actor,expected){
  const before=await state(ctx);
  let receipt=null,reason=null,hash=null;
  try{
    const tx=await ctx.coordinator.connect(actor).redeem(1,{gasLimit:4_000_000});
    hash=tx.hash;
    receipt=await tx.wait();
  }catch(error){
    reason=String(error.message||error).slice(0,400);
    hash=hash||error.transactionHash||error.receipt?.transactionHash||error.transaction?.hash||null;
    receipt=error.receipt||null;
  }
  expect(reason,label+": transaction must revert").not.to.equal(null);
  if(hash && !receipt)receipt=await ethers.provider.getTransactionReceipt(hash);
  expect(receipt,label+": failure requires mined local EVM receipt").not.to.equal(null);
  expect(receipt.status,label+": failed EVM status").to.equal(0);
  const after=await state(ctx);
  expect(after,label+": protocol storage must be exactly restored").to.deep.equal(before);
  const item=evidenceBase(ctx,label,before,after,receipt,expected);
  item.rollbackObserved=true;
  item.revertReason=reason;
  cases.push(item);
  console.log("OECL_INDEPENDENT_EVM_NEGATIVE:"+JSON.stringify({
    case:label,status:receipt.status,hash:receipt.transactionHash,unchanged:true
  }));
}
async function successCase(label,ctx,actor,expected){
  const before=await state(ctx);
  const oldEth=await ethers.provider.getBalance(ctx.holder);
  const tx=await ctx.coordinator.connect(actor).redeem(1,{gasLimit:4_000_000});
  const receipt=await tx.wait();
  expect(receipt.status).to.equal(1);
  const after=await state(ctx);
  const nftEvent=ctx.nft.interface.getEventTopic("Burned");
  const tokenEvent=ctx.token.interface.getEventTopic("Transfer");
  const nftBurns=receipt.logs.filter(l=>l.address.toLowerCase()===ctx.nft.address.toLowerCase()&&
    l.topics[0]===nftEvent);
  const tokenBurns=receipt.logs.filter(l=>{
    if(l.address.toLowerCase()!==ctx.token.address.toLowerCase()||l.topics[0]!==tokenEvent)return false;
    const event=ctx.token.interface.parseLog(l);
    return event.args.to===ethers.constants.AddressZero &&
      event.args.from.toLowerCase()===ctx.coordinator.address.toLowerCase() &&
      event.args.value.eq(ctx.units);
  });
  expect(nftBurns.length).to.equal(1);
  expect(tokenBurns.length).to.equal(1);
  expect(after.nftOwner).to.equal(null);
  expect(after.obligationWei).to.equal("0");
  expect(before.obligationWei).to.equal(bn(wei("0.1")));
  expect((BigInt(before.tokenTotalSupply)-BigInt(after.tokenTotalSupply)).toString())
    .to.equal(bn(ctx.units));
  expect((BigInt(before.backingWei)-BigInt(after.backingWei)).toString())
    .to.equal(bn(wei("0.1")));
  expect(after.coordinatorEthBalance).to.equal(before.coordinatorEthBalance);
  expect(after.coordinatorTokenBalance).to.equal("0");
  const item=evidenceBase(ctx,label,before,after,receipt,expected);
  item.burnEvidence={
    erc721BurnLogIndex:nftBurns[0].logIndex,
    erc20BurnLogIndex:tokenBurns[0].logIndex,
    sameTransaction:true,tokenUnits:bn(ctx.units)
  };
  if(actor.address.toLowerCase()===ctx.holder.toLowerCase()){
    const afterEth=await ethers.provider.getBalance(ctx.holder);
    const cost=receipt.gasUsed.mul(receipt.effectiveGasPrice||tx.gasPrice);
    expect(afterEth.add(cost).sub(oldEth).eq(wei("0.1"))).to.equal(true);
    item.observations.ownerReceivedWeiAfterGas=bn(afterEth.add(cost).sub(oldEth));
  }
  cases.push(item);
  console.log("OECL_INDEPENDENT_EVM_POSITIVE:"+JSON.stringify({
    case:label,status:receipt.status,hash:receipt.transactionHash,
    redemptionWei:item.observations.nftObligationDeltaWei,
    burnUnits:item.observations.tokenSupplyDeltaBaseUnits
  }));
}
describe("OECL independently isolated ERC-8060 × OpenZeppelin ERC20Burnable EVM experiments",function(){
  this.timeout(120000);
  before(async function(){
    const chain=await ethers.provider.getNetwork();
    expect(chain.chainId).to.equal(31337);
  });
  after(function(){
    if(!process.env.OECL_BURNABLE_EVM_REPORT_PATH)return;
    const buildInfoDir=path.resolve(__dirname,"../artifacts/build-info");
    const builds=fs.readdirSync(buildInfoDir).filter(x=>x.endsWith(".json"));
    const versions=[...new Set(builds.map(x=>JSON.parse(fs.readFileSync(path.join(buildInfoDir,x),"utf8")).solcVersion))];
    const doc={
      schemaVersion:"OECL_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1",
      localScope:"PINNED_SOURCE_INDEPENDENT_HARDHAT_EVM",
      scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
      nativeScientificAdmissionPerformed:false,
      universalCompatibilityEstablished:false,
      sourceChain:{
        participants:[
          {id:"ERC-8060",repository:"ten-io-meta/erc8060-native-eth-value",
            revision:originalRevision,file:"contracts/ERC8060Reference.sol",
            sha256:sha256(fs.readFileSync(sourcePaths.erc8060))},
          {id:"ERC-20-BURNABLE",repository:"OpenZeppelin/openzeppelin-contracts",
            version:"4.9.6",file:tokenSourceUnit,
            sha256:sha256(fs.readFileSync(sourcePaths.erc20Burnable))}
        ],
        fixtures:Object.fromEntries(["fixture","coordinator","caller"].map(k=>
          [k,sha256(fs.readFileSync(sourcePaths[k]))])),
        hardhatConfigSha256:sha256(fs.readFileSync(path.resolve(__dirname,"../hardhat.config.js"))),
        lockfileSha256:sha256(fs.readFileSync(path.resolve(__dirname,"../package-lock.json"))),
        compilerVersions:versions,
        scenarioScriptSha256:sha256(fs.readFileSync(__filename)),
        workflowCommit:process.env.GITHUB_SHA||null
      },
      chainId:31337,
      cases,
      coverage:{
        positive:cases.filter(c=>c.receiptStatus===1).length,
        negative:cases.filter(c=>c.receiptStatus===0).length,
        allNegativeRollbacksVerified:cases.filter(c=>c.receiptStatus===0).every(c=>c.rollbackObserved===true)
      },
      limitations:[
        "OpenZeppelin ERC20Burnable is abstract; the deployable token is a purpose-built OECL test fixture.",
        "The coordinator and adversarial callback contract are OECL-only fixtures, not ERC participants or production integration contracts.",
        "Local chainId 31337 transaction hashes are ephemeral and cannot be replayed in public block explorers.",
        "A successful composed test does not prove universal ERC compatibility, native candidate admission or execution of every source path.",
        "Tests must be compared with a separately generated AST report from the exact source revisions."
      ]
    };
    fs.mkdirSync(path.dirname(process.env.OECL_BURNABLE_EVM_REPORT_PATH),{recursive:true});
    fs.writeFileSync(process.env.OECL_BURNABLE_EVM_REPORT_PATH,JSON.stringify(doc,null,2)+"\n");
  });
  it("redeems with separate ERC20Burnable after legitimate approvals and exact NFT custody",async()=>{
    const ctx=await deploy();
    await approveBoth(ctx);
    await successCase("AUTHORIZED_AND_FUNDED",ctx,ctx.alice,"BOTH_BURNS_AND_ETH_SETTLEMENT");
  });
  it("rejects non-owner despite other approvals",async()=>{
    const ctx=await deploy();await approveBoth(ctx);
    await failCase("UNAUTHORIZED_NFT_OWNER",ctx,ctx.attacker,"NFT_OWNER_REQUIRED");
  });
  it("rejects absent ERC721 approval without token or NFT changes",async()=>{
    const ctx=await deploy();await(await ctx.token.connect(ctx.alice)
      .approve(ctx.coordinator.address,ctx.units)).wait();
    await failCase("NO_NFT_APPROVAL",ctx,ctx.alice,"NFT_APPROVAL_REQUIRED");
  });
  it("atomically rolls back NFT custody when ERC20 allowance is missing",async()=>{
    const ctx=await deploy();await(await ctx.nft.connect(ctx.alice)
      .approve(ctx.coordinator.address,1)).wait();
    await failCase("NO_ERC20_ALLOWANCE",ctx,ctx.alice,"TOKEN_ALLOWANCE_REQUIRED");
  });
  it("rejects zero ERC20 balance despite granted allowance",async()=>{
    const ctx=await deploy();await approveBoth(ctx);
    await(await ctx.token.connect(ctx.alice).transfer(ctx.attacker.address,ctx.units)).wait();
    await failCase("INSUFFICIENT_TOKEN_BALANCE",ctx,ctx.alice,"BALANCE_REQUIRED");
  });
  it("rolls back completed NFT burn when ERC20Burnable second leg reverts",async()=>{
    const ctx=await deploy();await approveBoth(ctx);
    await(await ctx.token.setFailBurnForTest(true)).wait();
    await failCase("INJECTED_SECOND_LEG_BURN_FAILURE",ctx,ctx.alice,"SECOND_LEG_ATOMIC_ROLLBACK");
  });
  it("reverts both burns if ETH payout receiver rejects the transfer",async()=>{
    const ctx=await deploy();
    const Adversarial=await ethers.getContractFactory("OECLAdversarialBurnableCaller");
    const receiver=await Adversarial.deploy(ctx.nft.address,ctx.token.address,ctx.coordinator.address);
    await receiver.deployed();
    ctx.holder=receiver.address;
    await(await ctx.token.transfer(receiver.address,ctx.units)).wait();
    await(await receiver.mintAndApprove(2,ctx.units,{value:wei("0.12")})).wait();
    // NFT #1 stays with Alice; the receiver owns NFT #2.
    await(await receiver.configure(1)).wait();
    const before={
      owner:await ctx.nft.ownerOf(2),
      reserve:bn(await ctx.nft.totalRedeemableValue()),
      supply:bn(await ctx.token.totalSupply()),
      backing:bn(await ethers.provider.getBalance(ctx.nft.address))
    };
    let receipt=null,hash=null;
    try{const tx=await receiver.execute(2,{gasLimit:4_000_000});
      hash=tx.hash;receipt=await tx.wait();
    }catch(e){receipt=e.receipt||null;hash=hash||e.transactionHash||e.receipt?.transactionHash;}
    if(hash&&!receipt)receipt=await ethers.provider.getTransactionReceipt(hash);
    expect(receipt).not.to.equal(null);
    expect(receipt.status).to.equal(0);
    const after={
      owner:await ctx.nft.ownerOf(2),
      reserve:bn(await ctx.nft.totalRedeemableValue()),
      supply:bn(await ctx.token.totalSupply()),
      backing:bn(await ethers.provider.getBalance(ctx.nft.address))
    };
    expect(after).to.deep.equal(before);
    cases.push({...evidenceBase(ctx,"PAYOUT_RECEIVER_REJECTS",before,after,receipt,"ETH_CALLBACK_ROLLBACK"),
      rollbackObserved:true});
  });
  it("blocks nested redemption while allowing an intentionally caught callback",async()=>{
    const ctx=await deploy();
    const Adversarial=await ethers.getContractFactory("OECLAdversarialBurnableCaller");
    const receiver=await Adversarial.deploy(ctx.nft.address,ctx.token.address,ctx.coordinator.address);
    await receiver.deployed();
    ctx.holder=receiver.address;
    await(await ctx.token.transfer(receiver.address,ctx.units)).wait();
    await(await receiver.mintAndApprove(2,ctx.units,{value:wei("0.12")})).wait();
    await(await receiver.configure(2)).wait();
    // Two NFTs exist, token 1 Alice and token 2 the receiver.
    const pre={
      reserve:bn(await ctx.nft.totalRedeemableValue()),
      supply:bn(await ctx.token.totalSupply()),
      balance:bn(await ethers.provider.getBalance(ctx.nft.address)),
      holder:ctx.holder
    };
    const tx=await receiver.execute(2,{gasLimit:4_000_000});
    const receipt=await tx.wait();
    expect(receipt.status).to.equal(1);
    expect(await receiver.nestedRejected()).to.equal(true);
    expect(await ctx.nft.ownerOf(1)).to.equal(ctx.alice.address);
    let gone=false;
    try{await ctx.nft.ownerOf(2);}catch{gone=true;}
    expect(gone).to.equal(true);
    const post={
      reserve:bn(await ctx.nft.totalRedeemableValue()),
      supply:bn(await ctx.token.totalSupply()),
      balance:bn(await ethers.provider.getBalance(ctx.nft.address)),
      holder:ctx.holder
    };
    expect(BigInt(pre.reserve)-BigInt(post.reserve)).to.equal(BigInt(wei("0.1").toString()));
    expect(BigInt(pre.supply)-BigInt(post.supply)).to.equal(BigInt(ctx.units.toString()));
    cases.push({...evidenceBase(ctx,"REENTRANT_RECEIVER_REJECTED",pre,post,receipt,
      "NESTED_REDEMPTION_FAILED_OUTER_SINGLE_REDEMPTION"),nestedRejected:true});
  });
  it("rejects double redemption after a successful operation",async()=>{
    const ctx=await deploy();await approveBoth(ctx);
    await successCase("SINGLE_BURN_BEFORE_REPLAY",ctx,ctx.alice,"SINGLE_VALID_REDEMPTION");
    const before={
      supply:bn(await ctx.token.totalSupply()),
      obligations:bn(await ctx.nft.totalRedeemableValue()),
      backing:bn(await ethers.provider.getBalance(ctx.nft.address))
    };
    let receipt=null,hash=null;
    try{const tx=await ctx.coordinator.connect(ctx.alice).redeem(1,{gasLimit:4_000_000});
      hash=tx.hash;receipt=await tx.wait();}
    catch(error){receipt=error.receipt||null;hash=hash||error.transactionHash||error.receipt?.transactionHash;}
    if(hash&&!receipt)receipt=await ethers.provider.getTransactionReceipt(hash);
    expect(receipt).not.to.equal(null);expect(receipt.status).to.equal(0);
    const after={
      supply:bn(await ctx.token.totalSupply()),
      obligations:bn(await ctx.nft.totalRedeemableValue()),
      backing:bn(await ethers.provider.getBalance(ctx.nft.address))
    };
    expect(after).to.deep.equal(before);
    cases.push({...evidenceBase(ctx,"DOUBLE_REDEMPTION_REJECTED",before,after,receipt,
      "NO_DOUBLE_REDEMPTION"),rollbackObserved:true});
  });
});
