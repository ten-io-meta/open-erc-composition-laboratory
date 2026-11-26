"use strict";
/**
 * Solmate ERC-4626 external-source research profile.
 * Source is pinned to a reviewed Git commit and every Solidity Git blob.
 * No source copied into OECL: CI reads external checkout with AGPL SPDX.
 * This module only compiles/infers/pregenerates; it cannot dispatch transactions.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {collectSources,choosePair}=require("./run-generic-source-worker.cjs");
const {probe,trace}=require("./run-erc4626-blind-source-probe.cjs");
const {buildGraph}=require("../scientific-solidity-graph/ScientificSolidityAstGraph.cjs");
const {fixture,nativeSpecs,checkAbi}=require("./VaultAssetFlowProtocol.cjs");
const {PROGRAM,bounds,verifyPlan:verifyOldPlan}=require("./ReusableVaultOperationGrammar.cjs");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const digest=x=>sha256(JSON.stringify(x));
const SOLMATE_COMMIT="89365b880c4f3c786bdd453d4b8e8fe410344a69";
const SOLMATE_BLOBS=Object.freeze({
 "src/tokens/ERC4626.sol":"0a34ac9855a4ea371319c882e392428432a27ab2",
 "src/tokens/ERC20.sol":"965704466c0dbd8038d77a72482d82d21413625a",
 "src/utils/SafeTransferLib.sol":"7f8236db6c7170d045c61b2716734a301d631ad3",
 "src/utils/FixedPointMathLib.sol":"6887722722908760687eb099eeec42cb5d446366"
});
const SOLMATE_UNIT="solmate/src/tokens/ERC4626.sol";
const variants=Object.freeze([
 {id:"OPENZEPPELIN",source:"OZ_4_9_6",family:"ERC-4626"},
 {id:"SOLMATE",source:"SOLMATE_COMMIT_PINNED",family:"ERC-4626"}
]);
const isHex=s=>typeof s==="string"&&/^[0-9a-f]{64}$/.test(s);
function gitBlobSha(bytes){
 return crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
}
function verifiedSolmateUnits(root){
 const result={},sha256ByFile={};
 assert(typeof root==="string"&&root.length>1);
 for(const [file,expectedBlob] of Object.entries(SOLMATE_BLOBS)){
  const full=path.resolve(root,file);
  const stat=fs.lstatSync(full);
  assert(stat.isFile()&&!stat.isSymbolicLink(),"SOLMATE_SOURCE_NOT_REGULAR_FILE");
  const bytes=fs.readFileSync(full);
  assert(bytes.length>100&&bytes.length<100000,"SOLMATE_SOURCE_SIZE_OUT_OF_REVIEWED_RANGE");
  assert.equal(gitBlobSha(bytes),expectedBlob,"SOLMATE_REVIEWED_GIT_BLOB_MISMATCH:"+file);
  const text=bytes.toString("utf8");
  assert(!text.includes("\ufffd"),"SOLMATE_SOURCE_INVALID_UTF8");
  result["solmate/"+file]={content:text};
  sha256ByFile[file]=sha256(bytes);
 }
 return {sources:result,sha256ByFile,commit:SOLMATE_COMMIT,gitBlobs:{...SOLMATE_BLOBS},
  sourceLicense:"AGPL-3.0-only_IN_SOURCE_SPDX"};
}
function compile(solc,sources){
 assert(/^0\.8\.26\+/.test(solc.version()),"UNREVIEWED_COMPILER");
 const input={language:"Solidity",sources,settings:{optimizer:{enabled:false},
  outputSelection:{"*":{"":["ast"],"*":["abi","evm.bytecode.object","evm.bytecode.linkReferences"]}}}};
 const out=JSON.parse(solc.compile(JSON.stringify(input)));
 const errors=(out.errors||[]).filter(e=>e.severity==="error");
 assert.equal(errors.length,0,errors.slice(0,2).map(e=>e.formattedMessage).join("\n"));
 return {input,out};
}
function solmateFixture(){
 const unit="OECL_SolmateVaultResearch.sol",contract="OECLSolmateVaultResearch";
 const solidity=[
  "// SPDX-License-Identifier: MIT",
  "pragma solidity ^0.8.20;",
  'import {ERC4626 as SolmateERC4626} from "solmate/src/tokens/ERC4626.sol";',
  'import {ERC20 as SolmateERC20} from "solmate/src/tokens/ERC20.sol";',
  "contract "+contract+" is SolmateERC4626 {",
  'constructor(address asset_) SolmateERC4626(SolmateERC20(asset_), "OECL Solmate Vault", "OES") {}',
  "function totalAssets() public view override returns (uint256) {",
  "  return asset.balanceOf(address(this));",
  "}",
  "}",""
 ].join("\n");
 return {unit,contract,solidity,sourceSha256:sha256(Buffer.from(solidity,"utf8")),
  assetsCalculatedFromRealUnderlyingBalance:true,testOnly:true};
}
async function prepare(ozDependencyRoot,solmateRoot){
 // Both source-only baselines must be generated before a live fixture/experiment.
 const baseline=await probe("ERC-4626","ERC-20",ozDependencyRoot);
 const pair=choosePair("ERC-4626","ERC-20");
 const gathered=await collectSources(pair,ozDependencyRoot);
 const original=Object.fromEntries([...gathered.files].map(([unit,file])=>[unit,{content:file.content}]));
 const solmate=verifiedSolmateUnits(solmateRoot);
 const combined={...original,...solmate.sources};
 const solmateCompiled=compile(gathered.deps.solc,combined);
 const graph=buildGraph({input:solmateCompiled.input,output:solmateCompiled.out,
  solcVersion:gathered.deps.solc.version()});
 const solmateNative=solmateCompiled.out.contracts?.[SOLMATE_UNIT]?.ERC4626;
 assert(Array.isArray(solmateNative?.abi),"SOLMATE_NATIVE_ERC4626_ABI_MISSING");
 const signatures=solmateNative.abi.filter(f=>f.type==="function")
   .map(f=>f.name+"("+f.inputs.map(x=>x.type).join(",")+")");
 const operations=["deposit(uint256,address)","withdraw(uint256,address,address)"]
   .map(sig=>({sig,supportedByAbi:signatures.includes(sig),
    ...trace(graph,{unit:SOLMATE_UNIT,name:"ERC4626"},sig)}));
 const sourceReport={
  schemaVersion:"OECL_INDEPENDENT_ERC4626_SOURCE_PROBE_V1",
  status:"PINNED_SOLMATE_COMPILER_AST_OBSERVATION_ONLY",
  externalRepository:"transmissions11/solmate",
  solmateRevision:SOLMATE_COMMIT,
  solmateGitBlobs:solmate.gitBlobs,
  solmateFileSha256:solmate.sha256ByFile,
  solmateLicense:solmate.sourceLicense,
  compilerVersion:gathered.deps.solc.version(),
  compilerGraphSha256:digest(graph),
  registeredBaselineSha256:digest(baseline),
  originalSolmateAbiSha256:digest(solmateNative.abi),
  operations,
  statusEvidence:"STRUCTURAL_OBSERVATION_NOT_EXECUTION_AUTHORITY",
  evmExecuted:false,executionAuthorized:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Solmate ERC4626 has abstract totalAssets(): concrete test adapter is required.",
    "Only reviewed pinned Solmate source files are compiled; not arbitrary GitHub contracts.",
    "AST reachability and matched signatures do not prove runtime feasibility or compatibility.",
    "No new EVM evidence or public dispatch is admitted by this source-only probe."
  ]
 };
 const ozVaultFixture=fixture(baseline.participants[0],0);
 const ozAssetFixture=fixture(baseline.participants[1],1);
 const smFixture=solmateFixture();
 const fullSources={...combined};
 for(const f of [ozVaultFixture,ozAssetFixture]){
  if(f)fullSources[f.unit]={content:f.solidity};
 }
 fullSources[smFixture.unit]={content:smFixture.solidity};
 const compiled=compile(gathered.deps.solc,fullSources);
 const ozVault=ozVaultFixture&&compiled.out.contracts?.[ozVaultFixture.unit]?.[ozVaultFixture.contract];
 const asset=ozAssetFixture&&compiled.out.contracts?.[ozAssetFixture.unit]?.[ozAssetFixture.contract];
 const smVault=compiled.out.contracts?.[smFixture.unit]?.[smFixture.contract];
 return {sourceReport,baseline,gathered,solmate,
  fixtures:{ozVault:ozVaultFixture,asset:ozAssetFixture,solmateVault:smFixture},
  originals:{ozVault:solmateCompiled.out.contracts?.[gathered.roots[0]]?.[pair[0].contract],
    ozAsset:solmateCompiled.out.contracts?.[gathered.roots[1]]?.[pair[1].contract],
    solmateVault:solmateNative},
  artifacts:{ozVault,solmateVault:smVault,asset}};
}
function typedVault(abi){
 return Object.entries(nativeSpecs.VAULT).every(([sig,spec])=>checkAbi(abi,sig,spec));
}
function typedAsset(abi){
 return Object.entries(nativeSpecs.ASSET).every(([sig,spec])=>checkAbi(abi,sig,spec))&&
  checkAbi(abi,"oeclResearchMint(address,uint256)",[["address","uint256"],[],"nonpayable"]);
}
function makePlan(prepared){
 const {sourceReport,baseline,solmate,originals,artifacts,fixtures}=prepared;
 assert(sourceReport?.schemaVersion==="OECL_INDEPENDENT_ERC4626_SOURCE_PROBE_V1");
 assert(sourceReport.evmExecuted===false&&sourceReport.executionAuthorized===false);
 assert(sourceReport.solmateRevision===SOLMATE_COMMIT);
 const validSource=sourceReport.solmateGitBlobs&&
  JSON.stringify(sourceReport.solmateGitBlobs)===JSON.stringify(SOLMATE_BLOBS)&&
  sourceReport.compilerGraphSha256&&isHex(sourceReport.compilerGraphSha256)&&
  sourceReport.operations.length===2&&sourceReport.operations.every(x=>
   x.supportedByAbi&&x.status==="STRUCTURAL_WRITES_OBSERVED"&&x.writes.length>0)&&
  baseline.participants?.[0]?.id==="ERC-4626"&&baseline.participants?.[1]?.id==="ERC-20"&&
  originals.ozVault&&originals.ozAsset&&originals.solmateVault&&
  typedVault(originals.ozVault.abi)&&typedVault(originals.solmateVault.abi)&&
  Object.entries(nativeSpecs.ASSET).every(([sig,spec])=>checkAbi(originals.ozAsset.abi,sig,spec))&&
  digest(originals.solmateVault.abi)===sourceReport.originalSolmateAbiSha256;
 const checks=variants.map(v=>{
  const target=v.id==="SOLMATE"?artifacts.solmateVault:artifacts.ozVault;
  const expected=v.id==="SOLMATE"?fixtures.solmateVault:fixtures.ozVault;
  const ready=Boolean(validSource&&target&&expected&&artifacts.asset&&fixtures.asset&&
   typedVault(target.abi)&&typedAsset(artifacts.asset.abi)&&
   typeof target.evm?.bytecode?.object==="string"&&
   /^[0-9a-f]+$/i.test(target.evm.bytecode.object)&&
   target.evm.bytecode.object.length>0&&target.evm.bytecode.object.length<120000&&
   Object.keys(target.evm.bytecode.linkReferences||{}).length===0&&
   typeof artifacts.asset.evm?.bytecode?.object==="string"&&
   /^[0-9a-f]+$/i.test(artifacts.asset.evm.bytecode.object)&&
   artifacts.asset.evm.bytecode.object.length>0&&
   Object.keys(artifacts.asset.evm.bytecode.linkReferences||{}).length===0);
  return {id:v.id,source:v.source,status:ready?"READY":"BLOCKED_UNVERIFIED_IMPLEMENTATION",
   nativeAbiSha256:digest(v.id==="SOLMATE"?originals.solmateVault.abi:originals.ozVault.abi),
   vaultFixtureSourceSha256:expected?.sourceSha256||expected?.sha256||null,
   vaultAbiSha256:digest(target?.abi||null),
   vaultBytecodeSha256:sha256(target?.evm?.bytecode?.object||""),
   assetFixtureSourceSha256:fixtures.asset?.sha256||null,
   assetAbiSha256:digest(artifacts.asset?.abi||null),
   assetBytecodeSha256:sha256(artifacts.asset?.evm?.bytecode?.object||"")};
 });
 const ready=checks.every(x=>x.status==="READY");
 const base={schemaVersion:"OECL_SOLMATE_CROSS_IMPL_VAULT_GRAMMAR_PLAN_V1",
  status:ready?"REVIEWED_CROSS_IMPLEMENTATION_PROGRAM":"BLOCKED_UNVERIFIED_SOURCE_OR_ABI",
  sourceProbeSha256:digest(sourceReport),solmateRevision:SOLMATE_COMMIT,
  solmateLicense:sourceReport.solmateLicense,
  externalSourceFileSha256:sourceReport.solmateFileSha256,
  sourceGraphSha256:sourceReport.compilerGraphSha256,
  registeredBaselineSha256:sourceReport.registeredBaselineSha256,
  compilerVersion:sourceReport.compilerVersion,
  dependencyIntegrity:prepared.gathered.deps.integrity,
  variants:checks,
  grammar:"TYPED_FUND_ALLOW_CUSTODY_IN_CUSTODY_OUT_EXPECT_REVERT",
  grammarProgram:ready?PROGRAM:[],
  quantities:{...bounds},
  executionGate:"CI_ONLY_LOCAL_HARDHAT_31337",
  twoIndependentCodebasesCompared:true,
  economicSemanticsReviewed:true,
  evmExecuted:false,executionAuthorized:false,experimentDispatched:false,
  scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",
  limitations:[
    "Two distinct codebases are tested using one reviewed operation program; this does not prove all vaults.",
    "Solmate abstract totalAssets required one reviewable fixture adapter.",
    "OZ and Solmate may emit equivalent events in differing order; each signed event and state delta is checked.",
    "The simulation is on ephemeral Hardhat 31337 using an intentionally unsafe research asset mint.",
    "No claim of autonomously inferred operational preconditions or universal ERC compatibility."
  ]};
 return {...base,planSha256:digest(base)};
}
function verifyPlan(p){
 try{
  if(!p||p.schemaVersion!=="OECL_SOLMATE_CROSS_IMPL_VAULT_GRAMMAR_PLAN_V1"||
   p.solmateRevision!==SOLMATE_COMMIT||
   p.executionGate!=="CI_ONLY_LOCAL_HARDHAT_31337"||
   p.grammar!=="TYPED_FUND_ALLOW_CUSTODY_IN_CUSTODY_OUT_EXPECT_REVERT"||
   p.evmExecuted!==false||p.executionAuthorized!==false||p.experimentDispatched!==false||
   p.candidateAdmission!=="NOT_ADMITTED"||p.compatibilityVerdict!=="NOT_EVALUATED"||
   p.scientificVerdict!=="INCONCLUSIVE"||
   JSON.stringify(p.quantities)!==JSON.stringify(bounds))return false;
  const c={...p};delete c.planSha256;
  if(digest(c)!==p.planSha256)return false;
  if(!Array.isArray(p.variants)||p.variants.length!==2||
    p.variants.some((x,i)=>x.id!==variants[i].id||x.source!==variants[i].source))return false;
  if(p.status==="REVIEWED_CROSS_IMPLEMENTATION_PROGRAM"){
   if(p.variants.some(v=>v.status!=="READY")||
    JSON.stringify(p.grammarProgram)!==JSON.stringify(PROGRAM))return false;
  }else if(p.status!=="BLOCKED_UNVERIFIED_SOURCE_OR_ABI"||
    !Array.isArray(p.grammarProgram)||p.grammarProgram.length!==0)return false;
  return true;
 }catch{return false;}
}
module.exports={SOLMATE_COMMIT,SOLMATE_BLOBS,SOLMATE_UNIT,variants,
 verifiedSolmateUnits,solmateFixture,prepare,makePlan,verifyPlan,digest,sha256,gitBlobSha};
