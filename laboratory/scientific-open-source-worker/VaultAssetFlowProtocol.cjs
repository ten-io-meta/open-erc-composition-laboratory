"use strict";
/**
 * Reviewed ERC4626/20 experimental adapter. It is NOT inferred semantics.
 * Selection is constrained by pinned compiler ABI + AST observations, and
 * runtime is gated to test-only Hardhat fixtures with bounded calldata.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const hash=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const isHash=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const isAddress=x=>typeof x==="string"&&/^0x[a-f0-9]{40}$/i.test(x);
const isBytes32=x=>typeof x==="string"&&/^0x[a-f0-9]{64}$/i.test(x);
const ZERO="0x"+"0".repeat(40);
const SOURCE_POLICY=Object.freeze({
 "ERC-4626":{contract:"ERC4626",unit:"@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol"},
 "ERC-20":{contract:"ERC20",unit:"@openzeppelin/contracts/token/ERC20/ERC20.sol"}
});
const GRAMMAR=Object.freeze([
 ["MINT_ASSET_100","MINED","OWNER","ASSET","oeclResearchMint(address,uint256)"],
 ["NO_APPROVAL_DEPOSIT","UNMINED_REVERT","OWNER","VAULT","deposit(uint256,address)"],
 ["APPROVE_40","MINED","OWNER","ASSET","approve(address,uint256)"],
 ["DEPOSIT_40","MINED","OWNER","VAULT","deposit(uint256,address)"],
 ["ATTACKER_WITHDRAW","UNMINED_REVERT","ATTACKER","VAULT","withdraw(uint256,address,address)"],
 ["OVER_WITHDRAW","UNMINED_REVERT","OWNER","VAULT","withdraw(uint256,address,address)"],
 ["WITHDRAW_15","MINED","OWNER","VAULT","withdraw(uint256,address,address)"],
 ["APPROVE_101","MINED","OWNER","ASSET","approve(address,uint256)"],
 ["INSUFFICIENT_ASSET_DEPOSIT","UNMINED_REVERT","OWNER","VAULT","deposit(uint256,address)"]
]);
const BOUNDS=Object.freeze({
 mintedAssets:"100",depositAssets:"40",withdrawAssets:"15",
 deniedAssets:"1",overWithdrawAssets:"41",insufficientAssets:"101",
 maxGasPerTransaction:3000000,maxMinedIncludingDeployments:7,maxUnminedControls:4
});
const signature=(entry)=>entry.name+"("+entry.inputs.map(x=>x.type).join(",")+")";
const nativeSpecs={
 ASSET: {
  "approve(address,uint256)":[["address","uint256"],["bool"],"nonpayable"],
  "balanceOf(address)":[["address"],["uint256"],"view"],
  "allowance(address,address)":[["address","address"],["uint256"],"view"],
  "totalSupply()":[[],["uint256"],"view"]
 },
 VAULT: {
  "deposit(uint256,address)":[["uint256","address"],["uint256"],"nonpayable"],
  "withdraw(uint256,address,address)":[["uint256","address","address"],["uint256"],"nonpayable"],
  "previewDeposit(uint256)":[["uint256"],["uint256"],"view"],
  "previewWithdraw(uint256)":[["uint256"],["uint256"],"view"],
  "balanceOf(address)":[["address"],["uint256"],"view"],
  "totalAssets()":[[],["uint256"],"view"],
  "totalSupply()":[[],["uint256"],"view"],
  "asset()":[[],["address"],"view"],
  "maxWithdraw(address)":[["address"],["uint256"],"view"]
 }
};
function checkAbi(abi,sig,spec){
 return Array.isArray(abi)&&abi.filter(f=>f.type==="function"&&
  f.name===sig.split("(")[0]&&f.inputs?.map(x=>x.type).join(",")===spec[0].join(",")&&
  f.outputs?.map(x=>x.type).join(",")===spec[1].join(",")&&
  f.stateMutability===spec[2]).length===1;
}
function fixture(participant,index){
 const approved=SOURCE_POLICY[participant?.id];
 if(!approved||participant.unit!==approved.unit||participant.id!==
  (index===0?"ERC-4626":"ERC-20")||!isHash(participant.sourceSha256))return null;
 if(index===1){
  const unit="OECL_VaultAssetResearch.sol",contract="OECLVaultAssetResearch";
  const solidity=[
   "// SPDX-License-Identifier: MIT",
   "pragma solidity ^0.8.20;",
   'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
   "contract "+contract+" is ERC20 {",
   'constructor() ERC20("OECL Lab Asset","OELA") {}',
   "function oeclResearchMint(address who,uint256 amount) external { _mint(who,amount); }",
   "}",""
  ].join("\n");
  return {unit,contract,solidity,sha256:sha(solidity),addsUnsafeMint:true};
 }
 const unit="OECL_VaultSharesResearch.sol",contract="OECLVaultSharesResearch";
 const solidity=[
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.20;",
  'import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";',
  'import "@openzeppelin/contracts/token/ERC20/IERC20.sol";',
  "contract "+contract+" is ERC4626 {",
  'constructor(IERC20 asset_) ERC20("OECL Vault Shares","OEVS") ERC4626(asset_) {}',
  "}",""
 ].join("\n");
 return {unit,contract,solidity,sha256:sha(solidity),addsUnsafeMint:false};
}
function makePlan(source,original,fixtures,deployed,compilerVersion,dependencyIntegrity){
 assert(source?.schemaVersion==="OECL_VAULT_ERC20_BLIND_PROBE_V1");
 assert(source.evmExecuted===false&&source.executionAuthorized===false);
 assert(source.candidateAdmission==="NOT_ADMITTED"&&source.compatibilityVerdict==="NOT_EVALUATED");
 assert([original,fixtures,deployed].every(xs=>Array.isArray(xs)&&xs.length===2));
 const select=source.participants.map(x=>({id:x.id,unit:x.unit,
  sourceSha256:x.sourceSha256,abiSha256:x.abiSha256,
  hypothesisCount:x.sourceOnlyHypothesisCount,
  measuredOperations:x.operations.map(o=>({signature:o.signature,
   status:o.status,writeCount:o.writes.length,unresolved:o.unresolved,external:o.external}))}));
 const exact=select.map(x=>x.id).join("|")==="ERC-4626|ERC-20"&&
  /^0\.8\.26\+/.test(compilerVersion)&&
  source.compilerVersion===compilerVersion&&
  select.every((x,i)=>x.unit===SOURCE_POLICY[x.id]?.unit&&isHash(x.sourceSha256)&&
    source.participants[i].nativeMethods?.length>0);
 const checks=select.map((x,i)=>{
  const native=original[i],f=fixtures[i],compiled=deployed[i],expected=fixture(x,i);
  const category=i===0?"VAULT":"ASSET";
  const typed=Boolean(exact&&native?.abi&&
    Object.entries(nativeSpecs[category]).every(([sig,spec])=>checkAbi(native.abi,sig,spec))&&
    hash(native.abi)===x.abiSha256&&
    source.participants[i].operations.every(o=>o.supportedByAbi));
  const reviewed=Boolean(typed&&expected&&f&&compiled&&
    f.unit===expected.unit&&f.contract===expected.contract&&
    f.solidity===expected.solidity&&f.sha256===expected.sha256&&
    f.addsUnsafeMint===expected.addsUnsafeMint&&
    compiled.abi&&compiled.evm?.bytecode?.object&&
    compiled.evm.bytecode.object.length>0&&
    compiled.evm.bytecode.object.length<120000&&
    Object.keys(compiled.evm.bytecode.linkReferences||{}).length===0);
  return {id:x.id,status:reviewed?"READY":typed?"UNREVIEWED_DEPLOYABLE_FIXTURE":"UNVERIFIED_NATIVE_ABI_OR_SOURCE",
   nativeAbiSha256:hash(native?.abi||null),fixtureSourceSha256:expected?.sha256||null,
   fixtureAbiSha256:hash(compiled?.abi||null),
   creationBytecodeSha256:sha(compiled?.evm?.bytecode?.object||"")};
 });
 const ready=checks.every(x=>x.status==="READY")&&
  select[0].measuredOperations.every(o=>o.status==="STRUCTURAL_WRITES_OBSERVED")&&
  select[1].measuredOperations.every(o=>o.status==="STRUCTURAL_WRITES_OBSERVED");
 const plan={
  schemaVersion:"OECL_VAULT_ASSET_FLOW_PLAN_V1",
  status:ready?"REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED":"BLOCKED_INCOMPLETE_SOURCE_OR_ABI",
  sourceProbeSha256:hash(source),sourceGraphSha256:source.sourceGraphSha256,
  compilerVersion,dependencyIntegrity,
  scope:"TWO_PINNED_OZ_4_9_6_CONTRACTS_WITH_RESEARCH_ASSET_MINT",
  experimentDesign:"EXPLICITLY_REVIEWED_ERC4626_POLICY_NOT_FULLY_AUTONOMOUS",
  selected:select,capabilities:checks,
  cases:ready?GRAMMAR.map(([id,execution,caller,target,method])=>(
    {id,execution,caller,target,method})) :[],
  quantities:{...BOUNDS},
  executionGate:"CI_ONLY_LOCAL_HARDHAT_31337",
  sourceHypotheses:[select[0].hypothesisCount,select[1].hypothesisCount],
  evmExecuted:false,executionAuthorized:false,experimentDispatched:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "Vault asset and share flows are an explicitly reviewed ERC4626-specific operation policy, not autonomous protocol synthesis.",
   "Unresolved and external AST references are preserved; reaching a write does not prove executable behavior.",
   "A test-only ERC20 fixture has an unrestricted mint. Never deploy the fixture on public networks.",
   "Local receipts and archived state do not prove Ethereum-wide interoperability."
  ]
 };
 return {...plan,planSha256:hash(plan)};
}
function verifyPlan(plan){
 try{
  if(!plan||plan.schemaVersion!=="OECL_VAULT_ASSET_FLOW_PLAN_V1"||
   plan.scope!=="TWO_PINNED_OZ_4_9_6_CONTRACTS_WITH_RESEARCH_ASSET_MINT"||
   plan.executionGate!=="CI_ONLY_LOCAL_HARDHAT_31337"||
   plan.experimentDesign!=="EXPLICITLY_REVIEWED_ERC4626_POLICY_NOT_FULLY_AUTONOMOUS"||
   plan.evmExecuted!==false||plan.executionAuthorized!==false||
   plan.experimentDispatched!==false||plan.candidateAdmission!=="NOT_ADMITTED"||
   plan.compatibilityVerdict!=="NOT_EVALUATED"||
   JSON.stringify(plan.quantities)!==JSON.stringify(BOUNDS))return false;
  const copy={...plan};delete copy.planSha256;
  if(hash(copy)!==plan.planSha256)return false;
  if(plan.status==="REVIEWED_LOCAL_VAULT_FLOW_PREREGISTERED"){
   if(plan.selected.map(x=>x.id).join("|")!=="ERC-4626|ERC-20"||
    plan.capabilities.some(x=>x.status!=="READY"))return false;
   if(JSON.stringify(plan.cases)!==
    JSON.stringify(GRAMMAR.map(([id,execution,caller,target,method])=>(
     {id,execution,caller,target,method}))))return false;
  }else if(plan.status!=="BLOCKED_INCOMPLETE_SOURCE_OR_ABI"||
    !Array.isArray(plan.cases)||plan.cases.length>0)return false;
  return true;
 }catch{return false;}
}
module.exports={hash,sha,isHash,isAddress,isBytes32,ZERO,SOURCE_POLICY,GRAMMAR,BOUNDS,
 nativeSpecs,checkAbi,fixture,makePlan,verifyPlan};
