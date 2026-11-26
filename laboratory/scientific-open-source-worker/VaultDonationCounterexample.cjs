"use strict";
/**
 * Falsifiable asset-donation experiment, data-only and non-executing.
 * Adds one reviewed primitive DONATE and pre/post validity controls
 * to the same base nine-step grammar. Two independent codebases,
 * one locked Solidity compiler, only local Hardhat EVM in CI.
 */
const assert=require("node:assert/strict");
const {PROGRAM:BASE_PROGRAM,bounds:BASE_BOUNDS,emptyState,transition}=require("./ReusableVaultOperationGrammar.cjs");
const {verifyPlan:verifySourcePlan,digest}=require("./SolmateCrossVaultProtocol.cjs");
const {checkAbi}=require("./VaultAssetFlowProtocol.cjs");
const BOUNDS=Object.freeze({...BASE_BOUNDS,donation:"20",preDonationWithdrawal:"41",
 postDonationWithdrawal:"41",invalidAfterDonation:"61"});
const EXTRA=[
 {id:"PRE_DONATION_WITHDRAW41_REVERT",op:"REVERT",role:"OWNER",target:"VAULT",
  signature:"withdraw(uint256,address,address)",args:["PRE41","OWNER","OWNER"],
  execution:"UNMINED_REVERT"},
 {id:"DONATE_20",op:"DONATE_ASSET",role:"OWNER",target:"ASSET",
  signature:"transfer(address,uint256)",args:["VAULT","DONATION"],execution:"MINED"},
 {id:"POST_DONATION_WITHDRAW41_POSSIBLE",op:"EXPECT_SUCCESS",role:"OWNER",target:"VAULT",
  signature:"withdraw(uint256,address,address)",args:["POST41","OWNER","OWNER"],
  execution:"UNMINED_SUCCESS",preview:"previewWithdraw(uint256)"}
];
const PROGRAM=Object.freeze([
 ...BASE_PROGRAM.slice(0,4),
 ...EXTRA,
 ...BASE_PROGRAM.slice(4).map(x=>x.id==="BLOCK_OVER_WITHDRAW"?{
  ...x,args:["OVER_INVALID","OWNER","OWNER"]}:x)
]);
function sourceTypeReady(artifacts){
 return Boolean(artifacts?.asset&&artifacts?.ozVault&&artifacts?.solmateVault&&
  checkAbi(artifacts.asset.abi,"transfer(address,uint256)",
   [["address","uint256"],["bool"],"nonpayable"])&&
  [artifacts.ozVault,artifacts.solmateVault].every(x=>
   checkAbi(x.abi,"maxWithdraw(address)",[["address"],["uint256"],"view"])&&
   checkAbi(x.abi,"previewWithdraw(uint256)",[["uint256"],["uint256"],"view"])));
}
function buildPlan(basePlan,artifacts){
 assert(verifySourcePlan(basePlan),"LOCKED_SOLMATE_PARENT_PLAN_INVALID");
 const ready=basePlan.status==="REVIEWED_CROSS_IMPLEMENTATION_PROGRAM"&&
  sourceTypeReady(artifacts);
 const raw={
  schemaVersion:"OECL_CROSS_IMPL_VAULT_DONATION_PLAN_V1",
  status:ready?"PREREGISTERED_DONATION_COUNTEREXAMPLE":"BLOCKED_UNREVIEWED_DONATION_OPERATION",
  basePlan,
  basePlanSha256:basePlan.planSha256,
  variants:basePlan.variants,
  program:ready?PROGRAM:[],
  quantities:{...BOUNDS},
  expectedIndependentModels:{
   initialShares:"40",assetsAfterDeposit:"40",assetsAfterDonation:"60",
   ozMaxWithdrawAfterDonation:"59",solmateMaxWithdrawAfterDonation:"60",
   postDonationPreview41Both:"28",
   ozPreviewWithdraw15:"11",solmatePreviewWithdraw15:"10",
   ozFinalShares:"29",solmateFinalShares:"30",
   finalOwnerAssets:"55",finalVaultAssets:"45",totalAssetSupply:"100"
  },
  hypothesis:{
   id:"EQUAL_SHARE_BURN_AFTER_DONATION",
   prediction:"For identical 40-asset deposits, 20-asset donations and 15-asset withdrawals both vaults burn the same number of shares.",
   falsifier:"Different independently verified burned-share amounts from successful local EVM withdrawals under these preconditions.",
   stage:"PREREGISTERED_FALSIFIABLE_HYPOTHESIS",
   localVerdict:"NOT_TESTED"
  },
  executionGate:"REVIEWED_LOCAL_HARDHAT_31337_ONLY",
  experimentDispatched:false,evmExecuted:false,executionAuthorized:false,
  compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
  scientificVerdict:"INCONCLUSIVE",
  limitations:[
   "A falsified scoped share-burn equivalence is not a universal cross-ERC incompatibility verdict.",
   "A previously invalid withdrawal amount can become valid after an underlying asset donation; negative controls must be state-aware.",
   "All amounts, source byte hashes, codebases and typed operations are constrained to reviewed local fixtures.",
   "Simulation success or reversion uses eth_call; neither is a mined transaction.",
   "The donation and its preconditions were explicitly designed, not discovered autonomously by the source AST.",
   "Solmate contract files are AGPL-3.0-only and are not vendored or deployed publicly."
  ]
 };
 return {...raw,planSha256:digest(raw)};
}
function verifyPlan(p){
 try{
  if(!p||p.schemaVersion!=="OECL_CROSS_IMPL_VAULT_DONATION_PLAN_V1"||
   !verifySourcePlan(p.basePlan)||p.basePlanSha256!==p.basePlan.planSha256||
   p.executionGate!=="REVIEWED_LOCAL_HARDHAT_31337_ONLY"||
   p.evmExecuted!==false||p.experimentDispatched!==false||
   p.executionAuthorized!==false||
   p.compatibilityVerdict!=="NOT_EVALUATED"||
   p.candidateAdmission!=="NOT_ADMITTED"||
   p.scientificVerdict!=="INCONCLUSIVE"||
   p.hypothesis?.id!=="EQUAL_SHARE_BURN_AFTER_DONATION"||
   p.hypothesis.localVerdict!=="NOT_TESTED"||
   JSON.stringify(p.quantities)!==JSON.stringify(BOUNDS))return false;
  const raw={...p};delete raw.planSha256;
  if(digest(raw)!==p.planSha256)return false;
  if(JSON.stringify(p.variants)!==JSON.stringify(p.basePlan.variants))return false;
  if(p.status==="PREREGISTERED_DONATION_COUNTEREXAMPLE"){
   if(JSON.stringify(p.program)!==JSON.stringify(PROGRAM))return false;
  }else if(p.status!=="BLOCKED_UNREVIEWED_DONATION_OPERATION"||
   !Array.isArray(p.program)||p.program.length!==0)return false;
  return true;
 }catch{return false;}
}
const resolveArgs=(step,actors)=>{
 const m={OWNER:actors.owner,ATTACKER:actors.attacker,VAULT:actors.vault,
  MINTED:BOUNDS.minted,DEPOSIT:BOUNDS.deposit,WITHDRAW:BOUNDS.withdraw,
  DENIED:BOUNDS.denied,INSUFFICIENT:BOUNDS.insufficient,
  PRE41:BOUNDS.preDonationWithdrawal,POST41:BOUNDS.postDonationWithdrawal,
  OVER_INVALID:BOUNDS.invalidAfterDonation,DONATION:BOUNDS.donation};
 return step.args.map(key=>{
  assert(Object.hasOwn(m,key),"UNKNOWN_DONATION_PROGRAM_VARIABLE");
  return m[key];
 });
};
function expectedPreview(variant,assets,before){
 const a=BigInt(assets),s=BigInt(before.sharesSupply),
  total=BigInt(before.vaultTotalAssets);
 const numerator=variant==="OPENZEPPELIN"?a*(s+1n):a*s;
 const denominator=variant==="OPENZEPPELIN"?total+1n:total;
 assert(denominator>0n&&a>0n);
 return ((numerator+denominator-1n)/denominator).toString();
}
function expectedMaxWithdraw(variant,before){
 const shares=BigInt(before.sharesOwner),s=BigInt(before.sharesSupply),
  assets=BigInt(before.vaultTotalAssets);
 const numerator=variant==="OPENZEPPELIN"?shares*(assets+1n):shares*assets;
 const denominator=variant==="OPENZEPPELIN"?s+1n:s;
 assert(denominator>0n);
 return (numerator/denominator).toString();
}
function transitionDonation(before,step,preview){
 if(step.op==="DONATE_ASSET"){
  const after={...before},amount=BigInt(BOUNDS.donation);
  after.assetOwner=(BigInt(before.assetOwner)-amount).toString();
  after.assetVault=(BigInt(before.assetVault)+amount).toString();
  after.vaultTotalAssets=(BigInt(before.vaultTotalAssets)+amount).toString();
  assert(BigInt(after.assetOwner)>=0n);
  assert.equal(after.assetVault,after.vaultTotalAssets);
  assert.equal(BigInt(after.assetOwner)+BigInt(after.assetVault)+BigInt(after.assetAttacker),
   BigInt(after.assetSupply));
  return after;
 }
 if(step.op==="EXPECT_SUCCESS")return {...before};
 return transition(before,step,preview);
}
module.exports={BOUNDS,PROGRAM,sourceTypeReady,buildPlan,verifyPlan,
 resolveArgs,expectedPreview,expectedMaxWithdraw,transitionDonation,emptyState};
