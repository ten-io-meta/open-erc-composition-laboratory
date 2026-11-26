"use strict";
/**
 * Bounded data-only operation language for ERC20 asset + ERC4626 vault flows.
 * Every typed method and state write is checked against the pinned compiler ABI/AST.
 * Grammar selection is not arbitrary RPC, generalized ERC safety, or EVM admission.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {fixture,nativeSpecs,checkAbi}=require("./VaultAssetFlowProtocol.cjs");
const digest=x=>crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const hex64=x=>typeof x==="string"&&/^[0-9a-f]{64}$/.test(x);
const variants=Object.freeze([
 {id:"STANDARD",offset:0,shareRatio:1},
 {id:"OFFSET_ONE",offset:1,shareRatio:10}
]);
const bounds=Object.freeze({minted:"100",deposit:"40",withdraw:"15",denied:"1",
 overWithdraw:"41",insufficient:"101",maxGasPerTransaction:3000000});
const PROGRAM=Object.freeze([
 {id:"FUND",op:"FUND_ASSET",role:"OWNER",target:"ASSET",signature:"oeclResearchMint(address,uint256)",
   args:["OWNER","MINTED"],execution:"MINED"},
 {id:"BLOCK_NO_APPROVAL",op:"REVERT",role:"OWNER",target:"VAULT",signature:"deposit(uint256,address)",
   args:["DENIED","OWNER"],execution:"UNMINED_REVERT"},
 {id:"APPROVE_DEPOSIT",op:"ALLOW",role:"OWNER",target:"ASSET",signature:"approve(address,uint256)",
   args:["VAULT","DEPOSIT"],execution:"MINED"},
 {id:"DEPOSIT",op:"CUSTODY_IN",role:"OWNER",target:"VAULT",signature:"deposit(uint256,address)",
   args:["DEPOSIT","OWNER"],execution:"MINED",preview:"previewDeposit(uint256)"},
 {id:"BLOCK_ATTACKER",op:"REVERT",role:"ATTACKER",target:"VAULT",signature:"withdraw(uint256,address,address)",
   args:["DENIED","ATTACKER","OWNER"],execution:"UNMINED_REVERT"},
 {id:"BLOCK_OVER_WITHDRAW",op:"REVERT",role:"OWNER",target:"VAULT",signature:"withdraw(uint256,address,address)",
   args:["OVER_WITHDRAW","OWNER","OWNER"],execution:"UNMINED_REVERT"},
 {id:"WITHDRAW",op:"CUSTODY_OUT",role:"OWNER",target:"VAULT",signature:"withdraw(uint256,address,address)",
   args:["WITHDRAW","OWNER","OWNER"],execution:"MINED",preview:"previewWithdraw(uint256)"},
 {id:"APPROVE_INSUFFICIENT",op:"ALLOW",role:"OWNER",target:"ASSET",signature:"approve(address,uint256)",
   args:["VAULT","INSUFFICIENT"],execution:"MINED"},
 {id:"BLOCK_INSUFFICIENT",op:"REVERT",role:"OWNER",target:"VAULT",signature:"deposit(uint256,address)",
   args:["INSUFFICIENT","OWNER"],execution:"UNMINED_REVERT"}
]);
const fixtureForVariant=(registered,index)=>{
 assert(index===0||index===1);
 if(registered?.id!=="ERC-4626"||
   registered.unit!=="@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol"||
   !hex64(registered.sourceSha256))return null;
 const base=fixture(registered,0);
 if(!base)return null;
 const v=variants[index];
 const contract=v.id==="STANDARD"?"OECLVaultSharesResearch":"OECLVaultSharesOffsetResearch";
 const unit=v.id==="STANDARD"?"OECL_VaultSharesResearch.sol":"OECL_VaultSharesOffsetResearch.sol";
 let solidity=base.solidity;
 if(v.id==="OFFSET_ONE"){
   solidity=solidity.replace("contract OECLVaultSharesResearch is ERC4626 {",
      "contract OECLVaultSharesOffsetResearch is ERC4626 {")
     .replace("\n}\n","\nfunction _decimalsOffset() internal pure override returns (uint8) { return 1; }\n}\n");
   assert(solidity.includes("function _decimalsOffset()"));
 }
 return {unit,contract,solidity,sha256:sha(solidity),addsUnsafeMint:false,
   decimalsOffset:v.offset,variant:v.id};
};
const matchSpec=(abi,sig,spec)=>checkAbi(abi,sig,spec);
function grammarTypeSafety(artifactByRole){
 const specs={
  ASSET:{...nativeSpecs.ASSET,
   "oeclResearchMint(address,uint256)":[["address","uint256"],[],"nonpayable"]},
  VAULT:{...nativeSpecs.VAULT}
 };
 return Object.keys(specs).every(role=>Object.entries(specs[role]).every(
   ([sig,spec])=>matchSpec(artifactByRole[role]?.abi,sig,spec)));
}
function compileProgram(source,native,artifactByVariant,assetArtifact,allFixtures,version,integrity){
 assert(source?.schemaVersion==="OECL_VAULT_ERC20_BLIND_PROBE_V1");
 assert(source.evmExecuted===false&&source.executionAuthorized===false);
 assert(source.candidateAdmission==="NOT_ADMITTED"&&source.compatibilityVerdict==="NOT_EVALUATED");
 const [vault,asset]=source.participants;
 const sourceAllowed=source.participants.length===2&&vault?.id==="ERC-4626"&&
   asset?.id==="ERC-20"&&
   vault.unit==="@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol"&&
   asset.unit==="@openzeppelin/contracts/token/ERC20/ERC20.sol"&&
   source.compilerVersion===version&&/^0\.8\.26\+/.test(version)&&
   [vault,asset].every(x=>hex64(x.sourceSha256)&&hex64(x.abiSha256));
 const sourceWrites=sourceAllowed&&
  vault.operations?.length===2&&vault.operations.every(x=>
   x.supportedByAbi&&x.status==="STRUCTURAL_WRITES_OBSERVED"&&
   x.writes?.length>0&&Number.isSafeInteger(x.unresolved)&&
   Number.isSafeInteger(x.external))&&
  asset.operations?.length===2&&asset.operations.every(x=>
   x.supportedByAbi&&x.status==="STRUCTURAL_WRITES_OBSERVED"&&x.writes?.length>0);
 const nativeValid=sourceWrites&&Array.isArray(native)&&native.length===2&&
  Object.entries(nativeSpecs.VAULT).every(([sig,spec])=>matchSpec(native[0]?.abi,sig,spec))&&
  Object.entries(nativeSpecs.ASSET).every(([sig,spec])=>matchSpec(native[1]?.abi,sig,spec))&&
  digest(native[0].abi)===vault.abiSha256&&digest(native[1].abi)===asset.abiSha256;
 const checked=variants.map((v,i)=>{
  const item=allFixtures?.vaults?.[i],expected=fixtureForVariant(vault,i),
    deployed=artifactByVariant?.[i];
  const assetExpected=fixture(asset,1);
  const matched=Boolean(nativeValid&&item&&expected&&assetExpected&&
    allFixtures.asset?.solidity===assetExpected.solidity&&
    allFixtures.asset.sha256===assetExpected.sha256&&
    item.solidity===expected.solidity&&item.sha256===expected.sha256&&
    item.contract===expected.contract&&
    grammarTypeSafety({ASSET:assetArtifact,VAULT:deployed})&&
    typeof deployed?.evm?.bytecode?.object==="string"&&
    /^[0-9a-f]+$/i.test(deployed.evm.bytecode.object)&&
    deployed.evm.bytecode.object.length<120000&&
    Object.keys(deployed.evm.bytecode.linkReferences||{}).length===0&&
    typeof assetArtifact?.evm?.bytecode?.object==="string"&&
    /^[0-9a-f]+$/i.test(assetArtifact.evm.bytecode.object)&&
    assetArtifact.evm.bytecode.object.length<120000&&
    Object.keys(assetArtifact.evm.bytecode.linkReferences||{}).length===0);
  return {id:v.id,offset:v.offset,shareRatio:v.shareRatio,
   status:matched?"READY":"BLOCKED_UNREVIEWED_SOURCE_ABI_OR_BYTECODE",
   vaultFixtureSha256:expected?.sha256||null,
   vaultAbiSha256:digest(deployed?.abi||null),
   vaultCreationBytecodeSha256:sha(deployed?.evm?.bytecode?.object||""),
   assetFixtureSha256:assetExpected?.sha256||null,
   assetAbiSha256:digest(assetArtifact?.abi||null),
   assetCreationBytecodeSha256:sha(assetArtifact?.evm?.bytecode?.object||"")};
 });
 const ready=checked.every(x=>x.status==="READY");
 const base={schemaVersion:"OECL_VAULT_OPERATION_GRAMMAR_PLAN_V1",
   status:ready?"BOUNDED_GRAMMAR_PREREGISTERED":"BLOCKED_UNREVIEWED_CONTRACT_OR_OPERATION",
   sourceProbeSha256:digest(source),sourceGraphSha256:source.sourceGraphSha256,
   compilerVersion:version,dependencyIntegrity:integrity,
   grammar:"TYPED_FUND_ALLOW_CUSTODY_IN_CUSTODY_OUT_EXPECT_REVERT",
   variants:checked,program:ready?PROGRAM:[],
   quantities:{...bounds},executionGate:"REVIEWED_CI_ONLY_EPHEMERAL_HARDHAT_31337",
   autonomy:"REUSABLE_INTERPRETER_WITH_TWO_REVIEWED_VARIANT_FIXTURES",
   evmExecuted:false,executionAuthorized:false,experimentDispatched:false,
   scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
   candidateAdmission:"NOT_ADMITTED",
   limitations:[
    "Both variants inherit the same pinned OZ 4.9.6 ERC4626 source; these are not unrelated verified implementations.",
    "A reviewed variant fixture changes decimalsOffset (0 or 1); source AST did not infer this economic invariant alone.",
    "The same data-only program and state transition oracle operate over both variants.",
    "Unsafe ERC20 test-only mint must never deploy to any live chain.",
    "Simulated revert is not a mined failed transaction; local receipts do not establish universal ERC compatibility."
   ]};
 return {...base,planSha256:digest(base)};
}
function verifyPlan(plan){
 try{
  if(!plan||plan.schemaVersion!=="OECL_VAULT_OPERATION_GRAMMAR_PLAN_V1"||
   plan.executionGate!=="REVIEWED_CI_ONLY_EPHEMERAL_HARDHAT_31337"||
   plan.grammar!=="TYPED_FUND_ALLOW_CUSTODY_IN_CUSTODY_OUT_EXPECT_REVERT"||
   plan.evmExecuted!==false||plan.executionAuthorized!==false||
   plan.experimentDispatched!==false||plan.scientificVerdict!=="INCONCLUSIVE"||
   plan.compatibilityVerdict!=="NOT_EVALUATED"||plan.candidateAdmission!=="NOT_ADMITTED"||
   JSON.stringify(plan.quantities)!==JSON.stringify(bounds))return false;
  const raw={...plan};delete raw.planSha256;
  if(digest(raw)!==plan.planSha256||!Array.isArray(plan.variants)||
   plan.variants.length!==2||plan.variants.some((x,i)=>
    x.id!==variants[i].id||x.offset!==variants[i].offset||
    x.shareRatio!==variants[i].shareRatio))return false;
  if(plan.status==="BOUNDED_GRAMMAR_PREREGISTERED"){
   if(plan.variants.some(v=>v.status!=="READY")||
     JSON.stringify(plan.program)!==JSON.stringify(PROGRAM))return false;
  }else if(plan.status!=="BLOCKED_UNREVIEWED_CONTRACT_OR_OPERATION"||
    !Array.isArray(plan.program)||plan.program.length!==0)return false;
  return true;
 }catch{return false;}
}
const getArgs=(instruction,actors)=>{
 const map={OWNER:actors.owner,ATTACKER:actors.attacker,VAULT:actors.vault,
   MINTED:bounds.minted,DEPOSIT:bounds.deposit,WITHDRAW:bounds.withdraw,
   DENIED:bounds.denied,OVER_WITHDRAW:bounds.overWithdraw,
   INSUFFICIENT:bounds.insufficient};
 return instruction.args.map(symbol=>{
  assert(Object.hasOwn(map,symbol),"UNKNOWN_VAULT_GRAMMAR_SYMBOL");
  return map[symbol];
 });
};
const emptyState=()=>({assetOwner:"0",assetVault:"0",assetAttacker:"0",
 sharesOwner:"0",sharesAttacker:"0",assetSupply:"0",sharesSupply:"0",
 vaultTotalAssets:"0",allowanceOwnerVault:"0"});
function transition(state,instruction,preview){
 const after={...state};
 const add=(key,amount)=>{after[key]=(BigInt(after[key])+amount).toString();};
 switch(instruction.op){
  case "FUND_ASSET":
   add("assetOwner",BigInt(bounds.minted));
   add("assetSupply",BigInt(bounds.minted));break;
  case "ALLOW":
   after.allowanceOwnerVault=instruction.id==="APPROVE_DEPOSIT"?
    bounds.deposit:bounds.insufficient;break;
  case "CUSTODY_IN":{
   const shares=BigInt(preview?.shares);
   assert(shares>0n&&shares<=1000n,"INVALID_DEPOSIT_PREVIEW");
   add("assetOwner",-BigInt(bounds.deposit));
   add("assetVault",BigInt(bounds.deposit));
   add("sharesOwner",shares);add("sharesSupply",shares);
   add("vaultTotalAssets",BigInt(bounds.deposit));
   after.allowanceOwnerVault="0";
   break;
  }
  case "CUSTODY_OUT":{
   const shares=BigInt(preview?.shares);
   assert(shares>0n&&shares<=1000n,"INVALID_WITHDRAW_PREVIEW");
   add("assetOwner",BigInt(bounds.withdraw));
   add("assetVault",-BigInt(bounds.withdraw));
   add("sharesOwner",-shares);add("sharesSupply",-shares);
   add("vaultTotalAssets",-BigInt(bounds.withdraw));
   break;
  }
  case "REVERT":break;
  default:throw Error("UNREVIEWED_VAULT_GRAMMAR_OPCODE");
 }
 assert(Object.values(after).every(x=>BigInt(x)>=0n),"NEGATIVE_LEDGER_VALUE");
 assert(BigInt(after.assetOwner)+BigInt(after.assetVault)+BigInt(after.assetAttacker)===
  BigInt(after.assetSupply),"ASSET_SUPPLY_NOT_CONSERVED");
 assert(after.assetVault===after.vaultTotalAssets,"VAULT_ASSET_CUSTODY_INCONSISTENT");
 assert(after.sharesOwner===after.sharesSupply,"SHARE_SUPPLY_INCONSISTENT");
 return after;
}
module.exports={digest,sha,variants,bounds,PROGRAM,fixtureForVariant,
 grammarTypeSafety,compileProgram,verifyPlan,getArgs,transition,emptyState};
