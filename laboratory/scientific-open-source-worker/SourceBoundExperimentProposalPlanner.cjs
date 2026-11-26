"use strict";
/**
 * Proposal-only deterministic scientific counterexample search.
 * Sources/compiler/ABI/AST are revalidated by SolmateCrossVaultProtocol.
 * Reviewed 4626 math models are priors; not autonomously inferred AST formulas.
 * Never deploys, signs, sends transactions or grants EVM authority.
 */
const assert=require("node:assert/strict");
const {makePlan:sourceBoundPlan,verifyPlan:verifySourcePlan,digest,SOLMATE_COMMIT}=
 require("./SolmateCrossVaultProtocol.cjs");
const {checkAbi}=require("./VaultAssetFlowProtocol.cjs");
const {BOUNDS:OLD_BOUNDS}=require("./VaultDonationCounterexample.cjs");
const NUMERIC_POLICY=Object.freeze({
 initialAssetBudget:100,initialDeposit:40,donationMin:1,donationMax:12,
 withdrawalMin:1,withdrawalMax:40,
 maxMinedTxPerImplementation:7,maxSimulationsPerImplementation:3,
 maxGasPerTx:3000000,chainId:31337
});
const MODELS=Object.freeze([
 {id:"OPENZEPPELIN",model:"REVIEWED_OZ_4_9_6_VIRTUAL_ASSETS_SHARES_PLUS_ONE",
  contractFamily:"ERC-4626"},
 {id:"SOLMATE",model:"REVIEWED_SOLMATE_89365b8_REAL_ASSETS_SHARES",
  contractFamily:"ERC-4626"}
]);
const divUp=(a,b)=>{assert(a>=0n&&b>0n);return (a+b-1n)/b;};
function convertPreview(implementation,assets,shares,totalAssets){
 const a=BigInt(assets),s=BigInt(shares),t=BigInt(totalAssets);
 assert(a>0n&&s>0n&&t>0n);
 if(implementation==="OPENZEPPELIN")return divUp(a*(s+1n),t+1n);
 if(implementation==="SOLMATE")return divUp(a*s,t);
 throw Error("UNKNOWN_REVIEWED_SHARE_MODEL");
}
function maxWithdraw(implementation,shares,totalShares,totalAssets){
 const o=BigInt(shares),s=BigInt(totalShares),t=BigInt(totalAssets);
 assert(o>=0n&&s>0n&&t>0n);
 if(implementation==="OPENZEPPELIN")return o*(t+1n)/(s+1n);
 if(implementation==="SOLMATE")return o*t/s;
 throw Error("UNKNOWN_REVIEWED_SHARE_MODEL");
}
function chooseCase(policy=NUMERIC_POLICY){
 assert.deepEqual(policy,NUMERIC_POLICY,"NUMERIC_SEARCH_POLICY_CHANGED");
 const s=BigInt(policy.initialDeposit),ownerAssets=BigInt(policy.initialAssetBudget);
 let searched=0,admissible=0,distinct=0,selected=null;
 for(let d=policy.donationMin;d<=policy.donationMax;d++){
  for(let w=policy.withdrawalMin;w<=policy.withdrawalMax;w++){
   searched++;
   const donation=BigInt(d),withdrawal=BigInt(w),total=s+donation;
   if(s+donation>ownerAssets)continue;
   if(withdrawal>maxWithdraw("OPENZEPPELIN",s,s,total)||
      withdrawal>maxWithdraw("SOLMATE",s,s,total))continue;
   admissible++;
   const oz=convertPreview("OPENZEPPELIN",withdrawal,s,total),
    sm=convertPreview("SOLMATE",withdrawal,s,total);
   if(oz===sm)continue;
   distinct++;
   if(selected===null)selected={donation:d,withdrawal:w,
    ozBurnedShares:oz.toString(),solmateBurnedShares:sm.toString(),
    ozFinalShares:(s-oz).toString(),solmateFinalShares:(s-sm).toString()};
  }
 }
 return {selected,search:{searched,admissible,distinct,selectionCriterion:
  "MINIMUM_DONATION_THEN_MINIMUM_WITHDRAWAL_WITH_DISTINCT_BURN_AND_SHARED_VALIDITY"},
  boundedSearch:true};
}
function checkCompilerCapabilities(prepared){
 const p=prepared?.sourceReport,base=sourceBoundPlan(prepared);
 if(!verifySourcePlan(base)||
  base.status!=="REVIEWED_CROSS_IMPLEMENTATION_PROGRAM"||
  p?.schemaVersion!=="OECL_INDEPENDENT_ERC4626_SOURCE_PROBE_V1"||
  p?.solmateRevision!==SOLMATE_COMMIT||
  p.operations?.length!==2||
  !p.operations.every(x=>x.supportedByAbi&&
    x.status==="STRUCTURAL_WRITES_OBSERVED"&&x.writes.length>0)||
  base.variants.map(v=>v.id).join("|")!=="OPENZEPPELIN|SOLMATE")return {base,ready:false};
 const a=prepared.artifacts?.asset,v=[prepared.artifacts?.ozVault,prepared.artifacts?.solmateVault];
 const typed=checkAbi(a?.abi,"transfer(address,uint256)",
  [["address","uint256"],["bool"],"nonpayable"])&&
  checkAbi(a?.abi,"approve(address,uint256)",
   [["address","uint256"],["bool"],"nonpayable"])&&
  v.every(x=>
   checkAbi(x?.abi,"deposit(uint256,address)",[["uint256","address"],["uint256"],"nonpayable"])&&
   checkAbi(x?.abi,"withdraw(uint256,address,address)",
    [["uint256","address","address"],["uint256"],"nonpayable"])&&
   checkAbi(x?.abi,"previewWithdraw(uint256)",[["uint256"],["uint256"],"view"])&&
   checkAbi(x?.abi,"maxWithdraw(address)",[["address"],["uint256"],"view"])&&
   checkAbi(x?.abi,"totalAssets()",[[],["uint256"],"view"])&&
   checkAbi(x?.abi,"totalSupply()",[[],["uint256"],"view"]));
 return {base,ready:Boolean(typed)};
}
function propose(prepared){
 const {base,ready}=checkCompilerCapabilities(prepared);
 const exploration=chooseCase();
 const selection=ready?exploration.selected:null;
 const preDonationControl=NUMERIC_POLICY.initialDeposit+1;
 const postDonationMax=selection?NUMERIC_POLICY.initialDeposit+selection.donation+1:null;
 const controlModels=selection?{
   ozMaxWithdrawAfter:maxWithdraw("OPENZEPPELIN",40n,40n,40n+BigInt(selection.donation)).toString(),
   solmateMaxWithdrawAfter:maxWithdraw("SOLMATE",40n,40n,40n+BigInt(selection.donation)).toString(),
   beforeControlAmount:preDonationControl.toString(),
   afterControlAmount:preDonationControl.toString(),
   knownInvalidAfterAmount:postDonationMax.toString(),
   expectedBefore:"ETH_CALL_REVERT_BOTH",
   expectedAfter:"ETH_CALL_SUCCESS_BOTH",
   expectedInvalid:"ETH_CALL_REVERT_BOTH",
   expectedShareBurnDifference:true
  }:null;
 // This is an output to request authorization, NOT authorization in itself.
 const raw={
  schemaVersion:"OECL_AUTOMATIC_SCIENTIFIC_EXPERIMENT_PROPOSAL_V1",
  status:selection?"GENERATED_SOURCE_BOUND_CANDIDATE_NEEDS_REVIEW":
   "BLOCKED_NO_TRUSTED_CANDIDATE",
  provenance:{
   basePlanSha256:base.planSha256,
   solmateRevision:SOLMATE_COMMIT,
   sourceGraphSha256:base.sourceGraphSha256,
   registeredBaselineSha256:base.registeredBaselineSha256,
   externalSolmateSha256:base.externalSourceFileSha256,
   compilerVersion:base.compilerVersion,
   twoCodebases:base.variants.map(v=>({id:v.id,source:v.source,
    vaultAbiSha256:v.vaultAbiSha256,vaultBytecodeSha256:v.vaultBytecodeSha256,
    assetAbiSha256:v.assetAbiSha256,assetBytecodeSha256:v.assetBytecodeSha256})),
   abiAstLocked:true
  },
  baseline:base,
  proposalKind:"INTERVENTION_ON_UNDERLYING_ASSETS_COMPARE_WITHDRAW_SHARE_BURN",
  methodDiscovery:{asset:"transfer(address,uint256)",vault:"withdraw(uint256,address,address)",
   observationMethods:["previewWithdraw(uint256)","maxWithdraw(address)",
    "totalAssets()","totalSupply()"]},
  sourceInferenceClaim:"TYPED_ABI_AST_CAPABILITIES_ONLY",
  economicPrior:"TWO_MANUALLY_REVIEWED_FORMULA_ADAPTERS_BOUND_TO_SOURCE_HASHES",
  reviewedModels:MODELS,
  numericPolicy:{...NUMERIC_POLICY},
  exploration:exploration.search,
  selection,
  preconditions:selection?[
   "Local Hardhat chain ID 31337 and two exact compiled fixture bytecodes",
   "Each separate test vault starts with zero assets and zero shares",
   "Research ERC20 mint 100 to owner; owner approves vault for 40",
   "Successful owner deposit of 40 returns 40 shares before donation",
   "No fee-on-transfer, rebase, other depositor or malicious underlying in these fixtures",
   "Owner underlying balance >= proposed donation; no donation creates vault shares",
   "Proposed withdraw must remain <= maxWithdraw in both models"
  ]:[],
  controls:controlModels,
  experimentProgram:selection?[
   {kind:"MINT_TEST_ASSET",signature:"oeclResearchMint(address,uint256)",
    quantity:"100",review:"MINED_REVIEWED_FIXTURE_ONLY"},
   {kind:"APPROVE_VAULT_ASSETS",signature:"approve(address,uint256)",
    quantity:"40",review:"MINED_REVIEWED_FIXTURE_ONLY"},
   {kind:"DEPOSIT_UNDERLYING",signature:"deposit(uint256,address)",
    quantity:"40",review:"MINED_REVIEWED_FIXTURE_ONLY"},
   {kind:"NEGATIVE_BEFORE",signature:"withdraw(uint256,address,address)",
    quantity:String(preDonationControl),review:"ETH_CALL_ONLY_EXPECT_REVERT"},
   {kind:"DIRECT_UNDERLYING_DONATION",signature:"transfer(address,uint256)",
    quantity:String(selection.donation),review:"MINED_REVIEWED_FIXTURE_ONLY"},
   {kind:"POSITIVE_AFTER",signature:"withdraw(uint256,address,address)",
    quantity:String(preDonationControl),review:"ETH_CALL_ONLY_EXPECT_SUCCESS"},
   {kind:"NEGATIVE_AFTER",signature:"withdraw(uint256,address,address)",
    quantity:String(postDonationMax),review:"ETH_CALL_ONLY_EXPECT_REVERT"},
   {kind:"WITHDRAW_TEST",signature:"withdraw(uint256,address,address)",
    quantity:String(selection.withdrawal),review:"MINED_REVIEWED_FIXTURE_ONLY"}
  ]:[],
  falsifiableHypothesis:selection?{
   id:"EQUAL_BURNED_SHARES_UNDER_EQUAL_ASSET_INTERVENTION",
   nullHypothesis:"The two independent implementations burn the same number of shares for an equal underlying withdrawal after a matched donation.",
   falsifier:"Two successful mined withdrawals with the same source-backed preconditions but different independently verified share burns",
   predictionFromReviewedModels:{openzeppelin:selection.ozBurnedShares,
    solmate:selection.solmateBurnedShares},
   localVerdict:"NOT_TESTED"
  }:null,
  requestedAuthorizations:selection?[
   {action:"APPROVE_LOCAL_CI_REPLAY",scope:"EXACT_REVIEWED_FIXTURES_HARDHAT_31337_ONLY",
    granted:false},
   {action:"APPROVE_RESEARCH_TOKEN_ALLOWANCE",scope:"40_TEST_UNDERLYING_UNITS_TO_LOCAL_VAULT",
    granted:false},
   {action:"REVIEW_EVIDENCE_AND_SCIENTIFIC_CONCLUSION",
    scope:"NO_AUTOMATIC_COMPATIBILITY_OR_ADMISSION",granted:false}
  ]:[],
  executionGate:"SOURCE_ONLY_NO_DISPATCH",
  executionAuthorized:false,experimentDispatched:false,evmExecuted:false,
  compatibilityVerdict:"NOT_EVALUATED",scientificVerdict:"INCONCLUSIVE",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
   "The intervention family and the two economic formulas are manually reviewed priors, not discovered from AST.",
   "The numeric perturbation and matching witness case are generated deterministically within tight reviewed limits.",
   "This proposal requests human/CI review; a proposal cannot grant itself authorization.",
   "A mined scoped refutation cannot be promoted to universal ERC incompatibility.",
   "Original pinned Solmate Solidity is AGPL-3.0-only and remains external."
  ]
 };
 return {...raw,proposalSha256:digest(raw)};
}
function verifyProposal(generated,prepared){
 try{
  if(!generated||generated.executionAuthorized!==false||
   generated.executionGate!=="SOURCE_ONLY_NO_DISPATCH"||
   generated.experimentDispatched!==false||generated.evmExecuted!==false||
   generated.candidateAdmission!=="NOT_ADMITTED"||
   generated.compatibilityVerdict!=="NOT_EVALUATED"||
   !Array.isArray(generated.requestedAuthorizations)||
   generated.requestedAuthorizations.some(x=>x.granted!==false))return false;
  const expected=propose(prepared);
  return digest(generated)===digest(expected)&&
   JSON.stringify(generated)===JSON.stringify(expected);
 }catch{return false;}
}
module.exports={NUMERIC_POLICY,MODELS,divUp,convertPreview,maxWithdraw,chooseCase,
 checkCompilerCapabilities,propose,verifyProposal};
