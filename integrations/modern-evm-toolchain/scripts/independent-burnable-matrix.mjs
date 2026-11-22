import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { network } from "hardhat";

const { ethers } = await network.connect();
const wei = x=>ethers.parseEther(x);
const sha = bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const units=wei("1");
const cases=[];
const aRevision="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const ozCommit="dc44c9f1a4c3b10af99492eed84f83ed244203f6";
const fixtures=["OECLBurnableFixture.sol","OECL8060BurnableCoordinator.sol","OECLAdversarialBurnableCaller.sol"];
const contracts=["ERC8060Reference.sol",...fixtures];
for(const f of contracts) assert.ok(fs.existsSync("contracts/"+f),"Missing pinned local fixture "+f);

async function deploy(){
  const [deployer,alice,attacker]=await ethers.getSigners();
  const nft=await ethers.deployContract("ERC8060Reference");
  await nft.waitForDeployment();
  const token=await ethers.deployContract("OECLBurnableFixture",[wei("100")]);
  await token.waitForDeployment();
  const coordinator=await ethers.deployContract("OECL8060BurnableCoordinator",[
    await nft.getAddress(),await token.getAddress(),units
  ]);
  await coordinator.waitForDeployment();
  await(await token.transfer(alice.address,units)).wait();
  const mint=await(await nft.connect(alice).mint("ipfs://oecl-independent-burnable",{value:wei("0.12")})).wait();
  const addresses={nft:await nft.getAddress(),token:await token.getAddress(),coordinator:await coordinator.getAddress()};
  const runtimeCodeHashes={
    erc8060:ethers.keccak256(await ethers.provider.getCode(addresses.nft)),
    erc20BurnableFixture:ethers.keccak256(await ethers.provider.getCode(addresses.token)),
    coordinator:ethers.keccak256(await ethers.provider.getCode(addresses.coordinator))
  };
  return {deployer,alice,attacker,nft,token,coordinator,units,holder:alice.address,
    mintHash:mint.hash,addresses,runtimeCodeHashes};
}
async function state(ctx){
  let owner=null,nftValue=null,approved=null;
  try{
    owner=await ctx.nft.ownerOf(1n);
    nftValue=String(await ctx.nft.getFunction("valueOf(uint256)").staticCall(1n));
    approved=await ctx.nft.getApproved(1n);
  }catch{ /* token #1 was burned; preserve all other state */ }
  return {
    nftOwner:owner,nftValueWei:nftValue,nftApproved:approved,
    obligationWei:String(await ctx.nft.totalRedeemableValue()),
    backingWei:String(await ethers.provider.getBalance(ctx.addresses.nft)),
    surplusWei:String(await ctx.nft.surplusValue()),
    tokenTotalSupply:String(await ctx.token.totalSupply()),
    holderTokenBalance:String(await ctx.token.balanceOf(ctx.holder)),
    coordinatorTokenBalance:String(await ctx.token.balanceOf(ctx.addresses.coordinator)),
    coordinatorEthBalance:String(await ethers.provider.getBalance(ctx.addresses.coordinator)),
    holderAllowance:String(await ctx.token.allowance(ctx.holder,ctx.addresses.coordinator)),
    aliceTokenBalance:String(await ctx.token.balanceOf(ctx.alice.address))
  };
}
async function approveBoth(ctx){
  await(await ctx.nft.connect(ctx.alice).approve(ctx.addresses.coordinator,1n)).wait();
  await(await ctx.token.connect(ctx.alice).approve(ctx.addresses.coordinator,units)).wait();
}
function evidence(ctx,label,pre,post,receipt,expected){
  const decimal=k=>String(BigInt(pre[k])-BigInt(post[k]));
  return {
    scenario:label,expected,sourcePair:["ERC-8060","ERC-20-BURNABLE"],
    chainId:31337,contractAddresses:ctx.addresses,
    actor:ctx.holder,runtimeCodeHashes:ctx.runtimeCodeHashes,
    transactionHash:receipt?.hash??null,
    receiptStatus:receipt?.status??null,
    blockNumber:receipt?.blockNumber??null,
    gasUsed:receipt?String(receipt.gasUsed):null,
    before:pre,after:post,
    observations:{
      sourceOnly:false,experimentLocalEvm:true,
      nftObligationDeltaWei:decimal("obligationWei"),
      tokenSupplyDeltaBaseUnits:decimal("tokenTotalSupply"),
      nftBackingDeltaWei:decimal("backingWei")
    }
  };
}
async function revertCase(label,ctx,actor,expected){
  const before=await state(ctx);
  let error=null,receipt=null,hash=null;
  try{
    const tx=await ctx.coordinator.connect(actor).redeem(1n,{gasLimit:4_000_000});
    hash=tx.hash;
    await tx.wait();
  }catch(e){
    error=e;
    hash||=e.transactionHash??e.receipt?.hash??e.transaction?.hash??null;
    receipt=e.receipt??null;
  }
  assert.ok(error,label+": expected contract revert");
  if(hash&&!receipt)receipt=await ethers.provider.getTransactionReceipt(hash);
  assert.ok(receipt,label+": require mined EVM failed receipt");
  assert.equal(receipt.status,0,label+": EVM rollback status");
  const after=await state(ctx);
  assert.deepEqual(after,before,label+": all observable state must roll back");
  const entry=evidence(ctx,label,before,after,receipt,expected);
  entry.rollbackObserved=true;
  entry.revertReason=String(error.message??error).slice(0,400);
  cases.push(entry);
}
async function successCase(label,ctx,actor,expected){
  const before=await state(ctx);
  const holderWeiBefore=await ethers.provider.getBalance(ctx.holder);
  const tx=await ctx.coordinator.connect(actor).redeem(1n,{gasLimit:4_000_000});
  const receipt=await tx.wait();
  assert.equal(receipt.status,1);
  const after=await state(ctx);
  const nftEvent=ctx.nft.interface.getEvent("Burned").topicHash;
  const tokenEvent=ctx.token.interface.getEvent("Transfer").topicHash;
  const nftBurns=receipt.logs.filter(l=>
    l.address.toLowerCase()===ctx.addresses.nft.toLowerCase()&&l.topics[0]===nftEvent);
  const tokenBurns=receipt.logs.filter(l=>{
    if(l.address.toLowerCase()!==ctx.addresses.token.toLowerCase()||l.topics[0]!==tokenEvent)
      return false;
    const ev=ctx.token.interface.parseLog(l);
    return ev.args.to===ethers.ZeroAddress &&
      ev.args.from.toLowerCase()===ctx.addresses.coordinator.toLowerCase() &&
      ev.args.value===units;
  });
  assert.equal(nftBurns.length,1);
  assert.equal(tokenBurns.length,1);
  assert.equal(after.nftOwner,null);
  assert.equal(after.obligationWei,"0");
  assert.equal(before.obligationWei,wei("0.1").toString());
  assert.equal(BigInt(before.tokenTotalSupply)-BigInt(after.tokenTotalSupply),units);
  assert.equal(BigInt(before.backingWei)-BigInt(after.backingWei),wei("0.1"));
  assert.equal(after.coordinatorEthBalance,before.coordinatorEthBalance);
  assert.equal(after.coordinatorTokenBalance,"0");
  const item=evidence(ctx,label,before,after,receipt,expected);
  item.burnEvidence={
    erc721BurnLogIndex:nftBurns[0].index,
    erc20BurnLogIndex:tokenBurns[0].index,
    sameTransaction:true,tokenUnits:units.toString()
  };
  if(actor.address.toLowerCase()===ctx.holder.toLowerCase()){
    const afterWei=await ethers.provider.getBalance(ctx.holder);
    const paidGas=receipt.gasUsed*receipt.gasPrice;
    assert.equal(afterWei+paidGas-holderWeiBefore,wei("0.1"));
    item.observations.ownerReceivedWeiAfterGas=(afterWei+paidGas-holderWeiBefore).toString();
  }
  cases.push(item);
}
async function receiverContext(mode){
  const ctx=await deploy();
  const receiver=await ethers.deployContract("OECLAdversarialBurnableCaller",[
    ctx.addresses.nft,ctx.addresses.token,ctx.addresses.coordinator
  ]);
  await receiver.waitForDeployment();
  ctx.holder=await receiver.getAddress();
  await(await ctx.token.transfer(ctx.holder,units)).wait();
  await(await receiver.mintAndApprove(2n,units,{value:wei("0.12")})).wait();
  await(await receiver.configure(mode)).wait();
  return {ctx,receiver};
}
function simpleSnapshot(ctx){
  return Promise.all([
    ctx.nft.ownerOf(2n),
    ctx.nft.totalRedeemableValue(),
    ctx.token.totalSupply(),
    ethers.provider.getBalance(ctx.addresses.nft)
  ]).then(([owner,reserve,supply,backing])=>({
    owner,reserve:String(reserve),supply:String(supply),backing:String(backing)
  }));
}
async function minedRevert(action,label){
  let receipt=null,hash=null,fail=false;
  try{
    const tx=await action();hash=tx.hash;await tx.wait();
  }catch(e){
    fail=true;hash||=e.transactionHash??e.receipt?.hash??e.transaction?.hash??null;
    receipt=e.receipt??null;
  }
  assert.ok(fail,label+" must revert");
  if(hash&&!receipt) receipt=await ethers.provider.getTransactionReceipt(hash);
  assert.ok(receipt,label+" must have mined receipt");
  assert.equal(receipt.status,0,label+" status must be zero");
  return receipt;
}
// 1. Successful independent source-pinned redemption.
{
  const ctx=await deploy();await approveBoth(ctx);
  await successCase("AUTHORIZED_AND_FUNDED",ctx,ctx.alice,"BOTH_BURNS_AND_ETH_SETTLEMENT");
}
// 2-5. Owner and both approvals, then token balance, all atomically rejected.
{
  const ctx=await deploy();await approveBoth(ctx);
  await revertCase("UNAUTHORIZED_NFT_OWNER",ctx,ctx.attacker,"NFT_OWNER_REQUIRED");
}
{
  const ctx=await deploy();
  await(await ctx.token.connect(ctx.alice).approve(ctx.addresses.coordinator,units)).wait();
  await revertCase("NO_NFT_APPROVAL",ctx,ctx.alice,"NFT_APPROVAL_REQUIRED");
}
{
  const ctx=await deploy();
  await(await ctx.nft.connect(ctx.alice).approve(ctx.addresses.coordinator,1n)).wait();
  await revertCase("NO_ERC20_ALLOWANCE",ctx,ctx.alice,"TOKEN_ALLOWANCE_REQUIRED");
}
{
  const ctx=await deploy();await approveBoth(ctx);
  await(await ctx.token.connect(ctx.alice).transfer(ctx.attacker.address,units)).wait();
  await revertCase("INSUFFICIENT_TOKEN_BALANCE",ctx,ctx.alice,"BALANCE_REQUIRED");
}
// 6. Rollback after first burn, when ERC-20 Burnable fixture deliberately fails.
{
  const ctx=await deploy();await approveBoth(ctx);
  await(await ctx.token.setFailBurnForTest(true)).wait();
  await revertCase("INJECTED_SECOND_LEG_BURN_FAILURE",ctx,ctx.alice,"SECOND_LEG_ATOMIC_ROLLBACK");
}
// 7. Reject ETH callback after transferring and burning both assets.
{
  const {ctx,receiver}=await receiverContext(1);
  const before=await simpleSnapshot(ctx);
  const receipt=await minedRevert(()=>receiver.execute(2n,{gasLimit:4_000_000}),
    "PAYOUT_RECEIVER_REJECTS");
  const after=await simpleSnapshot(ctx);
  assert.deepEqual(after,before);
  cases.push({...evidence(ctx,"PAYOUT_RECEIVER_REJECTS",before,after,receipt,
    "ETH_CALLBACK_ROLLBACK"),rollbackObserved:true});
}
// 8. Probe reentrancy; an intentionally caught nested revert must preserve one payout.
{
  const {ctx,receiver}=await receiverContext(2);
  const pre={
    reserve:String(await ctx.nft.totalRedeemableValue()),
    supply:String(await ctx.token.totalSupply()),
    balance:String(await ethers.provider.getBalance(ctx.addresses.nft)),
    holder:ctx.holder
  };
  const receipt=await(await receiver.execute(2n,{gasLimit:4_000_000})).wait();
  assert.equal(receipt.status,1);
  assert.equal(await receiver.nestedRejected(),true);
  assert.equal(await ctx.nft.ownerOf(1n),ctx.alice.address);
  await assert.rejects(()=>ctx.nft.ownerOf(2n));
  const post={
    reserve:String(await ctx.nft.totalRedeemableValue()),
    supply:String(await ctx.token.totalSupply()),
    balance:String(await ethers.provider.getBalance(ctx.addresses.nft)),
    holder:ctx.holder
  };
  assert.equal(BigInt(pre.reserve)-BigInt(post.reserve),wei("0.1"));
  assert.equal(BigInt(pre.supply)-BigInt(post.supply),units);
  cases.push({...evidence(ctx,"REENTRANT_RECEIVER_REJECTED",pre,post,receipt,
    "NESTED_REDEMPTION_FAILED_OUTER_SINGLE_REDEMPTION"),nestedRejected:true});
}
// 9-10. One successful redemption then mandatory mined double-redeem failure.
{
  const ctx=await deploy();await approveBoth(ctx);
  await successCase("SINGLE_BURN_BEFORE_REPLAY",ctx,ctx.alice,"SINGLE_VALID_REDEMPTION");
  const before={
    supply:String(await ctx.token.totalSupply()),
    obligations:String(await ctx.nft.totalRedeemableValue()),
    backing:String(await ethers.provider.getBalance(ctx.addresses.nft))
  };
  const receipt=await minedRevert(
    ()=>ctx.coordinator.connect(ctx.alice).redeem(1n,{gasLimit:4_000_000}),
    "DOUBLE_REDEMPTION_REJECTED");
  const after={
    supply:String(await ctx.token.totalSupply()),
    obligations:String(await ctx.nft.totalRedeemableValue()),
    backing:String(await ethers.provider.getBalance(ctx.addresses.nft))
  };
  assert.deepEqual(after,before);
  cases.push({...evidence(ctx,"DOUBLE_REDEMPTION_REJECTED",before,after,receipt,
    "NO_DOUBLE_REDEMPTION"),rollbackObserved:true});
}
const success=new Set(["AUTHORIZED_AND_FUNDED","REENTRANT_RECEIVER_REJECTED","SINGLE_BURN_BEFORE_REPLAY"]);
assert.equal(cases.length,10);
assert.equal(cases.filter(x=>x.receiptStatus===1).length,3);
assert.equal(cases.filter(x=>x.receiptStatus===0).length,7);
for(const c of cases){
  assert.match(c.transactionHash,/^0x[0-9a-f]{64}$/i);
  assert.ok(Number.isSafeInteger(c.blockNumber)&&c.blockNumber>0);
  if(!success.has(c.scenario)){
    assert.deepEqual(c.after,c.before,"Rollback must cover complete scoped evidence: "+c.scenario);
    assert.equal(c.rollbackObserved,true);
  }
}
const sourcePaths={
  erc8060:"contracts/ERC8060Reference.sol",
  erc20Burnable:"node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol",
  fixture:"contracts/OECLBurnableFixture.sol",
  coordinator:"contracts/OECL8060BurnableCoordinator.sol",
  caller:"contracts/OECLAdversarialBurnableCaller.sol"
};
const sourceHashes=Object.fromEntries(Object.entries(sourcePaths).map(([k,p])=>[k,sha(fs.readFileSync(p))]));
const report={
  schemaVersion:"OECL_MODERN_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1",
  localScope:"PINNED_SOURCE_INDEPENDENT_HARDHAT3_EVM",
  scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
  nativeScientificAdmissionPerformed:false,universalCompatibilityEstablished:false,
  sourceChain:{
    participants:[
      {id:"ERC-8060",repository:"ten-io-meta/erc8060-native-eth-value",
        revision:aRevision,sha256:sourceHashes.erc8060},
      {id:"ERC-20-BURNABLE",repository:"OpenZeppelin/openzeppelin-contracts",
        revision:ozCommit,version:"4.9.6",sha256:sourceHashes.erc20Burnable}
    ],
    fixtures:{fixture:sourceHashes.fixture,coordinator:sourceHashes.coordinator,caller:sourceHashes.caller},
    modernToolchainSha256:sha(fs.readFileSync("package-lock.json")),
    compiler:"0.8.26",
    workflowCommit:process.env.GITHUB_SHA??null
  },
  chainId:Number((await ethers.provider.getNetwork()).chainId),cases,
  coverage:{positive:3,negative:7,allNegativeRollbacksVerified:
    cases.filter(x=>x.receiptStatus===0).every(x=>x.rollbackObserved===true)},
  limitations:[
    "OpenZeppelin ERC20Burnable is an abstract base; the deployed token is an OECL fixture.",
    "OECL-only coordinator and adversarial caller are not production router contracts.",
    "The modern EVM is a separate local test runtime; hashes, gas and bytecode need not match historical receipts.",
    "A passing independent experiment does not admit a discovered OECL candidate."
  ]
};
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/modern-independent-burnable.json",JSON.stringify(report,null,2)+"\n");
console.log("OECL_MODERN_INDEPENDENT_BURNABLE_PASS:"+JSON.stringify({
  count:cases.length,positive:report.coverage.positive,negative:report.coverage.negative,
  scenarios:cases.map(x=>x.scenario),scientificVerdict:report.scientificVerdict
}));
