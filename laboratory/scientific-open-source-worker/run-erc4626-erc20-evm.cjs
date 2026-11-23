"use strict";
/*
 * Bounded independent local EVM experiment for a *specific* audited pair:
 * OpenZeppelin ERC4626 × ERC20, version 4.9.6 from the locked dependency
 * checkout. This is NOT arbitrary ERC execution or compatibility admission.
 * Only the two trusted wrappers below are compiled, no user code is accepted.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

const root=path.resolve(process.argv[2]||".");
const output=path.resolve(process.argv[3]||"source-output/pair-4626-20");
function sha256(v){return crypto.createHash("sha256").update(v).digest("hex");}
function fullPath(relative){
  const parts=relative.split("/");
  if(parts.some(x=>x===".."||x==="."||!x)||!relative.startsWith("@openzeppelin/contracts/")||
     !relative.endsWith(".sol"))throw Error("DISALLOWED_SOLC_IMPORT:"+relative);
  return path.join(root,"node_modules",relative);
}

const solidity=[
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.20;",
  "import '@openzeppelin/contracts/token/ERC20/ERC20.sol';",
  "import '@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol';",
  "contract OECLTestAsset is ERC20 {",
  "  constructor() ERC20('Research asset','R-AST') {}",
  "  function testMint(address to,uint256 amount) external { _mint(to,amount); }",
  "}",
  "contract OECLTestVault is ERC4626 {",
  "  constructor(IERC20 token) ERC20('Research vault shares','R-SHARE') ERC4626(token) {}",
  "}"
].join("\n")+"\n";

async function main(){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,"node_modules/@openzeppelin/contracts/package.json"),"utf8"));
  const lock=JSON.parse(fs.readFileSync(path.join(root,"package-lock.json"),"utf8"));
  const pkg=lock.packages?.["node_modules/@openzeppelin/contracts"];
  if(manifest.version!=="4.9.6"||pkg?.version!=="4.9.6"||
     typeof pkg.integrity!=="string"||!pkg.integrity.startsWith("sha512-"))
    throw Error("UNLOCKED_ERC4626_DEPENDENCY");
  const compiler=require(path.join(root,"node_modules/solc"));
  if(!compiler.version().startsWith("0.8.26+"))throw Error("UNLOCKED_SOLC_VERSION");
  const input={language:"Solidity",sources:{"OECL_ERC4626_ERC20_Test.sol":{content:solidity}},
    settings:{optimizer:{enabled:false},
      outputSelection:{"*":{"*":["abi","evm.bytecode.object"]}}}};
  const outputJSON=JSON.parse(compiler.compile(JSON.stringify(input),{import:(name)=>{
    try{return {contents:fs.readFileSync(fullPath(name),"utf8")};}
    catch{return {error:"UNVERIFIED_COMPILER_IMPORT:"+name};}
  }}));
  const errors=(outputJSON.errors||[]).filter(x=>x.severity==="error");
  if(errors.length)throw Error("SOLC_EVM_FIXTURE_COMPILE_FAILED:"+errors.map(x=>x.errorCode||x.message).slice(0,3));
  const file=outputJSON.contracts["OECL_ERC4626_ERC20_Test.sol"];
  for(const n of ["OECLTestAsset","OECLTestVault"])
    if(!file?.[n]?.abi || !/^[0-9a-f]+$/i.test(file[n]?.evm?.bytecode?.object||""))
      throw Error("FIXTURE_BYTECODE_MISSING:"+n);

  // Hardhat runs as a local in-memory EVM. No RPC/private key or mainnet.
  process.chdir(root);
  const hre=require(path.join(root,"node_modules/hardhat"));
  const provider=hre.ethers.provider;
  const chain=await provider.getNetwork();
  if(Number(chain.chainId)!==31337)throw Error("NOT_AN_ISOLATED_HARDHAT_EVM");
  const [owner,attacker]=await hre.ethers.getSigners();
  const asset=await new hre.ethers.ContractFactory(
    file.OECLTestAsset.abi,file.OECLTestAsset.evm.bytecode.object,owner).deploy();
  await asset.deployed();
  const vault=await new hre.ethers.ContractFactory(
    file.OECLTestVault.abi,file.OECLTestVault.evm.bytecode.object,owner).deploy(asset.address);
  await vault.deployed();
  const amount=hre.ethers.utils.parseUnits("100",18);
  const forty=hre.ethers.utils.parseUnits("40",18);
  const ten=hre.ethers.utils.parseUnits("10",18);
  const decimals=18;
  const txReceipts=[];
  async function transact(name,task){
    const tx=await task();
    const receipt=await tx.wait(1);
    if(receipt.status!==1||receipt.transactionHash!==tx.hash)throw Error("EVM_TRANSACTION_NOT_CONFIRMED:"+name);
    txReceipts.push({name,txHash:tx.hash,blockNumber:receipt.blockNumber,
      status:receipt.status,gasUsed:receipt.gasUsed.toString()});
  }
  async function snapshot(){
    const [assetsInVault,sharesOwner,sharesAttacker,vaultShareSupply,ownerUnderlying,attackerUnderlying]=await Promise.all([
      asset.balanceOf(vault.address),vault.balanceOf(owner.address),vault.balanceOf(attacker.address),
      vault.totalSupply(),asset.balanceOf(owner.address),asset.balanceOf(attacker.address)]);
    return {assetsInVault:assetsInVault.toString(),sharesOwner:sharesOwner.toString(),
      sharesAttacker:sharesAttacker.toString(),vaultShareSupply:vaultShareSupply.toString(),
      ownerUnderlying:ownerUnderlying.toString(),attackerUnderlying:attackerUnderlying.toString()};
  }
  const zero=hre.ethers.constants.Zero;
  assert((await vault.totalAssets()).eq(zero));
  assert((await vault.totalSupply()).eq(zero));
  await transact("mint trusted research underlying",()=>asset.testMint(owner.address,amount.mul(10)));
  await transact("approve vault asset spending",()=>asset.approve(vault.address,amount));
  const preview=await vault.previewDeposit(amount);
  assert(preview.eq(amount),"Initial vault should have 1:1 asset/share ratio in this fixture");
  await transact("deposit underlying through ERC4626",()=>vault.deposit(amount,owner.address));
  const afterDeposit=await snapshot();
  assert.equal(afterDeposit.assetsInVault,amount.toString());
  assert.equal(afterDeposit.vaultShareSupply,amount.toString());
  assert.equal(afterDeposit.sharesOwner,amount.toString());

  const negative=[];
  async function expectRevert(name,action){
    const before=await snapshot();
    let reverted=false;
    try{await action();}catch{reverted=true;}
    assert(reverted,"Expected local EVM callStatic to revert:"+name);
    assert.deepEqual(await snapshot(),before,"Failed read-only EVM call altered state:"+name);
    negative.push({name,execution:"EVM_CALL_STATIC_REVERT",transactionMined:false,
      statePreserved:true});
  }
  await expectRevert("attacker cannot withdraw owner's shares",()=>
    vault.connect(attacker).callStatic.withdraw(ten,attacker.address,owner.address));
  await expectRevert("attacker cannot deposit without underlying or approval",()=>
    vault.connect(attacker).callStatic.deposit(ten,attacker.address));

  await transact("redeem some shares for underlying",()=>vault.redeem(forty,owner.address,owner.address));
  const remaining=amount.sub(forty);
  assert((await vault.totalAssets()).eq(remaining));
  assert((await vault.totalSupply()).eq(remaining));
  assert((await asset.balanceOf(vault.address)).eq(remaining));
  await expectRevert("withdraw above owner's share balance",()=>
    vault.callStatic.withdraw(remaining.add(ten),owner.address,owner.address));

  await transact("transfer underlying to independent account",()=>asset.transfer(attacker.address,ten));
  await transact("approve vault from independent account",()=>asset.connect(attacker).approve(vault.address,ten));
  await transact("independent account deposits underlying",()=>vault.connect(attacker).deposit(ten,attacker.address));
  assert((await vault.balanceOf(attacker.address)).eq(ten));
  assert((await vault.totalAssets()).eq(remaining.add(ten)));
  assert((await vault.totalSupply()).eq(remaining.add(ten)));
  const final=await snapshot();

  const result={
    schemaVersion:"OECL_ERC4626_ERC20_LOCAL_EVM_RECEIPTS_V1",
    scope:"OZ_4_9_6_ERC4626_ERC20_ISOLATED_FIXTURE_ONLY",
    selected:["ERC-4626","ERC-20"],
    scientificVerdict:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",
    evmExecuted:true,
    localChainId:31337,
    sourceSha256:sha256(solidity),
    lockedDependency:{package:"@openzeppelin/contracts",version:"4.9.6",
      integrity:pkg.integrity},
    compilerVersion:compiler.version(),
    fixtureContracts:{asset:asset.address,vault:vault.address},
    observations:{
      initialDeposit:amount.toString(),initialShares:preview.toString(),
      afterDeposit,redeemedAssets:forty.toString(),afterAllOperations:final,
      independentDeposit:ten.toString(),assetDecimals:decimals,
    },
    minedReceipts:txReceipts,
    readOnlyNegativeControls:negative,
    limitations:[
      "This experiment deploys audited OpenZeppelin contracts through a purpose-built fixture, not arbitrary deployed implementations.",
      "The positive receipts only demonstrate one ERC4626/ERC20 accounting path on a local in-memory EVM.",
      "Negative callStatic controls are EVM simulations; they are not mined transaction receipts.",
      "No untrusted source, external RPC, user-controlled contract or new pair candidate was executed.",
      "Access-control semantics, malicious assets, share rounding, reentrancy and all other scenarios need further independent tests.",
    ]
  };
  if(txReceipts.length!==7||negative.length!==3)throw Error("EVM_OBSERVATION_COUNT_MISMATCH");
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,"independent-local-evm.json"),JSON.stringify(result,null,2)+"\n");
  console.log("OECL_ERC4626_ERC20_EVM_RECORD:"+JSON.stringify(result));
  console.log("OECL_ERC4626_ERC20_EVM_PASS:"+JSON.stringify({
    pair:result.selected,receipts:txReceipts.length,callStaticReverts:negative.length,
    localChainId:result.localChainId,scientificVerdict:result.scientificVerdict,
  }));
}
main().catch(error=>{
  console.error("OECL_ERC4626_ERC20_EVM_FAIL:"+String(error?.stack||error).slice(0,1600));
  process.exitCode=1;
});
