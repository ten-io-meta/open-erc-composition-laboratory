"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {collectSources}=require("./run-generic-source-worker.cjs");
const registry=require("./source-registry.json");
const root=path.resolve(process.argv[2]||".");
const output=path.resolve(process.argv[3]||"source-output/pair-8098-4626");
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
const {readPrerecordedPredictions,runPreregisteredFalsification}=require("./run-preregistered-8098-4626-falsification.cjs");
const wrapper=[
"// SPDX-License-Identifier: MIT",
"pragma solidity ^0.8.20;",
"import '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';",
"contract OECL8098AssetVault is ERC4626 {",
"  constructor(IERC20 token) ERC20('OECL isolated vault shares','OECL-SHARE') ERC4626(token) {}",
"}"
].join("\n")+"\n";

async function main(){
  const a=registry.sources.find(x=>x.id==="ERC-8098");
  const b=registry.sources.find(x=>x.id==="ERC-4626");
  assert(a&&b&&a.kind==="github"&&b.kind==="openzeppelin");
  assert.equal(a.revision,"68a05289bd68d89db8453c49500e0a1ae6cd11ec");
  const collected=await collectSources([a,b],root);
  const compiler=collected.deps.solc;
  assert(compiler.version().startsWith("0.8.26+"),"Compiler is not the reviewed version");
  assert.equal(collected.deps.version,"4.9.6");
  const sources=Object.fromEntries([...collected.files].map(([key,value])=>[key,{content:value.content}]));
  sources["OECL8098AssetVault.sol"]={content:wrapper};
  const compiled=JSON.parse(compiler.compile(JSON.stringify({language:"Solidity",sources,
    settings:{optimizer:{enabled:false},outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}
  })));
  const errors=(compiled.errors||[]).filter(x=>x.severity==="error");
  if(errors.length)throw Error("PINNED_8098_VAULT_SOLC_FAILED:"+errors.map(x=>x.errorCode||x.message).slice(0,3));
  const assetOut=compiled.contracts[collected.roots[0]]?.ERC8098Reference;
  const vaultOut=compiled.contracts["OECL8098AssetVault.sol"]?.OECL8098AssetVault;
  for(const [name,contract] of [["asset",assetOut],["vault",vaultOut]]){
    if(!contract?.abi || !/^[a-f0-9]+$/i.test(contract?.evm?.bytecode?.object||""))
      throw Error("PINNED_8098_VAULT_BYTECODE_MISSING:"+name);
  }
  // Freeze the controlled prediction plan before deploying any EVM fixture.
  const preregistration=readPrerecordedPredictions();
  process.chdir(root);
  const hre=require(path.join(root,"node_modules/hardhat"));
  const [owner,attacker]=await hre.ethers.getSigners();
  const chain=await hre.ethers.provider.getNetwork();
  assert.equal(Number(chain.chainId),31337,"Not local Hardhat chain");
  const units=n=>hre.ethers.utils.parseUnits(n,18);
  const initial=units("1000"),deposit=units("100"),redeem=units("40"),ten=units("10");
  const asset=await new hre.ethers.ContractFactory(
    assetOut.abi,assetOut.evm.bytecode.object,owner
  ).deploy("Pinned nonincreasing asset","OECL-8098",initial,owner.address);
  await asset.deployed();
  const vault=await new hre.ethers.ContractFactory(
    vaultOut.abi,vaultOut.evm.bytecode.object,owner
  ).deploy(asset.address);
  await vault.deployed();
  const receipts=[],negative=[];
  async function tx(name,fn){
    const transaction=await fn();
    const receipt=await transaction.wait(1);
    assert.equal(receipt.status,1,name+" reverted");
    assert.equal(receipt.transactionHash,transaction.hash);
    receipts.push({name,txHash:transaction.hash,blockNumber:receipt.blockNumber,
      status:receipt.status,gasUsed:receipt.gasUsed.toString()});
    return receipt;
  }
  async function snap(){
    const [underlyingSupply,underlyingOwner,underlyingVault,vaultShareSupply,
      vaultOwnerShares,vaultAttackerShares]=await Promise.all([
      asset.totalSupply(),asset.balanceOf(owner.address),asset.balanceOf(vault.address),
      vault.totalSupply(),vault.balanceOf(owner.address),vault.balanceOf(attacker.address)]);
    return Object.fromEntries(Object.entries({
      underlyingSupply,underlyingOwner,underlyingVault,vaultShareSupply,
      vaultOwnerShares,vaultAttackerShares
    }).map(([key,value])=>[key,value.toString()]));
  }
  const before=await snap();
  assert.equal(before.underlyingSupply,initial.toString());
  assert.equal(before.vaultShareSupply,"0");
  await tx("approve ERC8098 asset for the vault",()=>asset.approve(vault.address,deposit));
  assert((await vault.previewDeposit(deposit)).eq(deposit),"Unadvertised initial vault exchange rate");
  const verifiedDepositReceipt=await tx("deposit ERC8098 underlying, mint separate ERC4626 shares",
    ()=>vault.deposit(deposit,owner.address));
  const afterDeposit=await snap();
  assert.equal(afterDeposit.underlyingSupply,initial.toString(),
    "Underlying monotone supply increased on vault deposit");
  assert.equal(afterDeposit.underlyingVault,deposit.toString());
  assert.equal(afterDeposit.vaultShareSupply,deposit.toString());
  await runPreregisteredFalsification({
    registration:preregistration,provider:hre.ethers.provider,
    ethers:hre.ethers,asset,vault,owner,before,afterDeposit,
    depositReceipt:verifiedDepositReceipt,deposit,output,
    sourceRevision:a.revision,
    sourceSha256:collected.files.get(collected.roots[0]).sha256,
    vaultWrapperSha256:hash(wrapper),compilerVersion:compiler.version(),
    openzeppelinVersion:collected.deps.version,
    dependencyIntegrity:collected.deps.integrity
  });
  async function mustRevert(name,fn){
    const previous=await snap();let reverted=false;
    try{await fn();}catch{reverted=true;}
    assert(reverted,"Expected negative EVM call to revert: "+name);
    assert.deepEqual(await snap(),previous,"Negative simulation changed state: "+name);
    negative.push({name,execution:"EVM_CALL_STATIC_REVERT",
      transactionMined:false,statePreserved:true});
  }
  await mustRevert("unauthorized transfer of ERC8098 asset from vault",()=>
    asset.connect(attacker).callStatic.transferFrom(vault.address,attacker.address,ten));
  await mustRevert("unauthorized burnFrom of ERC8098 holder",()=>
    asset.connect(attacker).callStatic.burnFrom(owner.address,ten));
  await mustRevert("unauthorized redeem of third-party vault shares",()=>
    vault.connect(attacker).callStatic.redeem(ten,attacker.address,owner.address));
  await tx("redeem ERC4626 shares for unchanged-supply ERC8098 asset",
    ()=>vault.redeem(redeem,owner.address,owner.address));
  const afterRedeem=await snap();
  assert.equal(afterRedeem.underlyingSupply,initial.toString());
  assert.equal(afterRedeem.vaultShareSupply,deposit.sub(redeem).toString());
  assert.equal(afterRedeem.underlyingVault,deposit.sub(redeem).toString());
  await tx("burn independently owned ERC8098 underlying after redemption",
    ()=>asset.burn(ten));
  const final=await snap();
  assert.equal(final.underlyingSupply,initial.sub(ten).toString(),
    "ERC8098 underlying failed nonincreasing supply check");
  assert.equal(final.underlyingVault,deposit.sub(redeem).toString());
  assert.equal(final.vaultShareSupply,deposit.sub(redeem).toString());
  const record={
    schemaVersion:"OECL_8098_UNDERLYING_4626_LOCAL_EVM_V1",
    scope:"IMMUTABLE_ERC8098_ASSET_AND_SEPARATE_OZ4_9_6_ERC4626_VAULT_FIXTURE",
    selected:["ERC-8098","ERC-4626"],
    roles:{underlying:"ERC-8098",shares:"ERC-4626 separate ERC20 share token"},
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    evmExecuted:true,localChainId:31337,
    provenance:{
      erc8098Revision:a.revision,erc8098SourceSha256:collected.files.get(collected.roots[0]).sha256,
      vaultWrapperSha256:hash(wrapper),compilerVersion:compiler.version(),
      openzeppelinVersion:collected.deps.version,
      openzeppelinDependencyIntegrity:collected.deps.integrity
    },
    fixtureAddresses:{asset:asset.address,vault:vault.address},
    observations:{before,afterDeposit,afterRedeem,final},
    minedReceipts:receipts,readOnlyNegativeControls:negative,
    limitations:[
      "Local test of one immutable reference ERC8098 as underlying, NOT a universal ERC8098/4626 compatibility proof.",
      "ERC4626 shares belong to a separate token and are minted on deposit. An ERC8098 nonincrease rule applied to THESE shares is a different, untested role and may conflict with minting.",
      "No malicious fee-on-transfer/rebasing asset, rounding/donation attack, arbitrary EVM synthesis or real-chain deployment is tested.",
      "The negative callStatic controls are read-only EVM simulations, not mined transaction receipts."
    ]
  };
  assert.equal(receipts.length,4);
  assert.equal(negative.length,3);
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,"independent-8098-underlying-4626-evm.json"),
    JSON.stringify(record,null,2)+"\n");
  console.log("OECL_8098_UNDERLYING_4626_EVM_PASS",JSON.stringify({
    minedReceipts:receipts.length,negativeSimulations:negative.length,
    underlyingSupplyAfterDeposit:afterDeposit.underlyingSupply,
    vaultShareSupplyAfterDeposit:afterDeposit.vaultShareSupply,
    scientificVerdict:record.scientificVerdict
  }));
}
main().catch(error=>{
  console.error("OECL_8098_UNDERLYING_4626_EVM_FAILED",
    String(error?.stack||error).slice(0,1000));
  process.exitCode=1;
});
