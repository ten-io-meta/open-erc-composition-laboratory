"use strict";
/**
 * OECL-ED-001 pinned compiler + raw-source witness for ERC4626's IERC20
 * transfer dependency. This is a source-level, constructor-supplied interface
 * path, NOT a runtime address binding or ERC20Burnable-specific causal effect.
 * No source compilation, execution, network, RPC, wallets, or state mutation.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const hash=b=>createHash("sha256").update(b).digest("hex");
const UNIT="@openzeppelin/contracts/";
const PATHS=Object.freeze({
  VAULT:"token/ERC20/extensions/ERC4626.sol",
  BURNABLE:"token/ERC20/extensions/ERC20Burnable.sol",
  ERC20:"token/ERC20/ERC20.sol",
  SAFE:"token/ERC20/utils/SafeERC20.sol",
  ADDRESS:"utils/Address.sol",
  IERC20:"token/ERC20/IERC20.sol"
});
const EXPECTED_SHA=Object.freeze({
  VAULT:"0610f62eeae3a7dee46c4c37cc80c59060fd56cea7fb1e00a950f1e6a2f981ac",
  BURNABLE:"0344809a1044e11ece2401b4f7288f414ea41fa9d1dad24143c84b737c9fc02e",
  ERC20:"d20d52b4be98738b8aa52b5bb0f88943f62128969b33d654fbca731539a7fe0a",
  SAFE:"82dc918d8df553e2461b96595580e565424b407d73dab8a7ce4bde479810fb2a",
  ADDRESS:"8b85a2463eda119c2f42c34fa3d942b61aee65df381f48ed436fe8edb3a7d602",
  IERC20:"7ebde70853ccafcf1876900dad458f46eb9444d591d39bfc58e952e2582f5587"
});
const REPORT_SHA="1285579731a69237faf42362da53bbf163ea763d76e9e528f4b740d4973eca9d";
function check(condition,reason){
  assert.ok(condition,"OECL_ED001_PINNED_DEPENDENCY_UNRESOLVED:"+reason);
}
function reportMatch(report,rawReport,graph){
  check(Buffer.isBuffer(rawReport) && hash(rawReport)===REPORT_SHA,
    "PINNED_SOURCE_REPORT_CHANGED");
  check(report?.schemaVersion==="OECL_OPEN_GENERIC_AST_RESULT_V1" &&
    report?.sourceOnly===true && report?.evmExecuted===false &&
    report?.scientificVerdict==="INCONCLUSIVE" &&
    report?.candidateAdmission==="NOT_ADMITTED",
    "EXPECTED_SOURCE_ONLY_SCIENTIFIC_SCOPE");
  check(Array.isArray(report.selected) && report.selected.length===2 &&
    report.selected[0].id==="ERC-20-BURNABLE" &&
    report.selected[1].id==="ERC-4626" &&
    report.selected.every(x=>x.revision==="4.9.6"),"PAIR_IDENTITY_OR_VERSION_MISMATCH");
  check(graph?.schemaVersion==="OECL_SOLIDITY_COMPILER_AST_GRAPH_V1" &&
    Array.isArray(graph?.functions) && Array.isArray(graph?.edges) &&
    Array.isArray(graph?.sources) && Array.isArray(graph?.unresolved),
    "COMPILER_GRAPH_SCHEMA_OR_PROVENANCE_MISSING");
  check(report.graphSha256===hash(Buffer.from(JSON.stringify(graph))),
    "COMPILER_GRAPH_DIGEST_MISMATCH");
}
function pinnedFiles(graph,files){
  check(files && typeof files==="object" && !Array.isArray(files) &&
    Object.keys(files).sort().join("|")===Object.keys(PATHS).sort().join("|"),
    "SOURCE_FILE_SET_NOT_EXACT");
  for(const [id,rel] of Object.entries(PATHS)){
    const raw=files[id];
    check(Buffer.isBuffer(raw) && raw.length>200 &&
      raw.length<200000 && hash(raw)===EXPECTED_SHA[id],
      "RAW_SOURCE_BYTES_NOT_PINNED_"+id);
    const graphSources=graph.sources.filter(s=>s.unit===UNIT+rel);
    check(graphSources.length===1 && graphSources[0].sha256===EXPECTED_SHA[id],
      "COMPILER_UNIT_NOT_SAME_AS_RAW_SOURCE_"+id);
  }
}
function sourceCheck(files){
  const source=Object.fromEntries(Object.keys(PATHS).map(id=>[id,files[id].toString("utf8")]));
  for(const [id,needles] of Object.entries({
    VAULT:[
      "IERC20 private immutable _asset;",
      "_asset = asset_;",
      "return address(_asset);",
      "return _asset.balanceOf(address(this));",
      "SafeERC20.safeTransferFrom(_asset, caller, address(this), assets);",
      "SafeERC20.safeTransfer(_asset, receiver, assets);",
      "_burn(owner, shares);"
    ],
    BURNABLE:["_burn(_msgSender(), amount);", "_burn(account, amount);"],
    SAFE:[
      "function safeTransfer(IERC20 token, address to, uint256 value) internal",
      "function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal",
      "_callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));",
      "_callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));",
      "address(token).functionCall(data"
    ],
    IERC20:["function transfer(address to, uint256 amount) external returns (bool);",
      "function transferFrom(address from, address to, uint256 amount) external returns (bool);"]
  })){
    for(const needle of needles)check(source[id].includes(needle),
      "PINNED_SOURCE_PATH_NOT_FOUND_"+id);
  }
}
function compilerPath(graph){
  const fn=(contract,name,id)=>{
    const matches=graph.functions.filter(f=>f.contractName===contract &&
      f.name===name && f.unit===UNIT+PATHS[id] && f.implemented===true);
    check(matches.length===1,"EXACT_FUNCTION_NOT_FOUND_"+contract+"_"+name);
    return matches[0];
  };
  const functions={
    deposit:fn("ERC4626","deposit","VAULT"),
    redeem:fn("ERC4626","redeem","VAULT"),
    _deposit:fn("ERC4626","_deposit","VAULT"),
    _withdraw:fn("ERC4626","_withdraw","VAULT"),
    safeTransferFrom:fn("SafeERC20","safeTransferFrom","SAFE"),
    safeTransfer:fn("SafeERC20","safeTransfer","SAFE"),
    _callOptionalReturn:fn("SafeERC20","_callOptionalReturn","SAFE"),
    functionCall:fn("Address","functionCall","ADDRESS"),
    burnableBurn:fn("ERC20Burnable","burn","BURNABLE"),
    inheritedBurn:fn("ERC20","_burn","ERC20")
  };
  check(functions.functionCall.parameterTypes?.length===3,"ADDRESS_CALL_OVERLOAD_NOT_DISTINGUISHED");
  const chains=[
    {id:"VAULT_DEPOSIT_TO_IERC20_TRANSFER_FROM",nodes:["deposit","_deposit","safeTransferFrom","_callOptionalReturn","functionCall"],
      lines:[157,221,35,122]},
    {id:"VAULT_REDEEM_TO_IERC20_TRANSFER",nodes:["redeem","_withdraw","safeTransfer","_callOptionalReturn","functionCall"],
      lines:[191,248,27,122]},
    {id:"VAULT_REDEEM_BURNS_OWN_SHARES",nodes:["redeem","_withdraw","inheritedBurn"],
      lines:[191,247]},
    {id:"BURNABLE_EXT_BURNS_OWN_TOKEN",nodes:["burnableBurn","inheritedBurn"],
      lines:[21]}
  ];
  return chains.map(c=>{
    const edges=[];
    for(let i=1;i<c.nodes.length;i++){
      const from=functions[c.nodes[i-1]],to=functions[c.nodes[i]];
      const matched=graph.edges.filter(e=>e.kind==="CALLS"&&e.from===from.id&&
        e.to===to.id&&e.location?.line===c.lines[i-1]);
      check(matched.length===1,"COMPILER_CALL_EDGE_MISSING_OR_AMBIGUOUS_"+c.id);
      edges.push({from:from.contractName+"."+from.name,
        to:to.contractName+"."+to.name,
        callerSourceUnit:matched[0].location.unit,
        callerSourceLine:matched[0].location.line,
        compilerCallerId:from.id,compilerTargetId:to.id});
    }
    return {id:c.id,verifiedEdges:edges};
  });
}
function assess(input){
  check(input && typeof input==="object","MISSING_INPUT");
  const {report,rawReport,graph,files}=input;
  reportMatch(report,rawReport,graph);
  pinnedFiles(graph,files);
  sourceCheck(files);
  const callChains=compilerPath(graph);
  const vault=report.selected[1],burnable=report.selected[0];
  check(vault.sourceSha256===EXPECTED_SHA.VAULT &&
    burnable.sourceSha256===EXPECTED_SHA.BURNABLE &&
    vault.sourceUnit===UNIT+PATHS.VAULT &&
    burnable.sourceUnit===UNIT+PATHS.BURNABLE,
    "PROFILE_SOURCE_IDENTITY");
  return {
    schemaVersion:"OECL_ED001_PINNED_VAULT_ASSET_CALL_WITNESS_V1",
    evaluatedPair:"ERC-20-BURNABLE|ERC-4626",
    evidence:"COMPILER_AST_GRAPH_AND_RAW_SOURCE_BYTES_PINNED",
    toolchainVersion:report.compilerVersion??"UNKNOWN",
    sourceReportSha256:REPORT_SHA,
    sourceHashes:Object.fromEntries(Object.keys(PATHS).sort().map(id=>[PATHS[id],EXPECTED_SHA[id]])),
    callChains,
    identifiedSourceLevelDependency:{
      caller:"OpenZeppelin ERC4626 4.9.6",
      declaredInterface:"IERC20",
      constructorParameter:"asset_",
      immutableState:"_asset",
      depositEffectRequest:"IERC20.transferFrom VIA SafeERC20(_asset)",
      redemptionEffectRequest:"IERC20.transfer VIA SafeERC20(_asset)",
      underlyingTransferRequestsPresent:true,
      runtimeCalleeAddress:"UNRESOLVED_UNTIL_DEPLOYED_CONSTRUCTOR_ARG_AND_CODE_CHECK",
      burnableImplementationAsActualAsset:"NOT_ESTABLISHED",
      recipientImplementationConformance:"NOT_ESTABLISHED",
      successfulExternalExecution:"NOT_OBSERVED",
      observerTrust:"PINNED_COMPILER_AND_RAW_SOURCE_ONLY"
    },
    nonEquivalence:{
      inheritedERC20BurnSourceCodeDoesNotShareStorage:true,
      erc4626ShareBurnIsNotUnderlyingAssetBurn:true,
      genericIerc20DependencyDoesNotImplyBurnableExtension:true,
      deploymentLinkMustBeVerifiedIndependently:true
    },
    nextIndependentChecks:[
      "Pin a deployable ERC4626 constructor asset_ address and its runtime code hash",
      "Verify a concrete ERC20Burnable deployment if that extension is part of the hypothesis",
      "Pin vault share token, underlying asset, account roles and denominated units separately",
      "Verify an external token transfer effect through independent runtime state/receipt checks",
      "Compare against a plain ERC20 implementation and isolated + noninteracting controls",
      "If a nontrivial cross-protocol P is formulated, preregister selective ablation and restoration"
    ],
    scientificFinding:"PINNED_GENERIC_IERC20_TRANSFER_DEPENDENCY_IN_ERC4626_SOURCE_ONLY",
    actualCrossParticipantCausalEffect:"NOT_ESTABLISHED",
    novelEmergentProperty:"NOT_DEMONSTRATED",
    hypothesisOrigin:"HUMAN_INTERPRETATION_OF_BOUNDED_AST_FINDING",
    evmExecuted:false,canAnnounceEmergence:false,evmExecutionAuthorized:false,
    changesExistingVerdicts:false
  };
}
function load(root){
  const reportDir=path.resolve(root.reportDir);
  const sourceRoot=path.resolve(root.sourceRoot);
  const rawReport=fs.readFileSync(path.join(reportDir,"source-scientific-report.json"));
  const report=JSON.parse(rawReport.toString("utf8"));
  const graph=JSON.parse(fs.readFileSync(path.join(reportDir,"structural-ast-graph.json"),"utf8"));
  const files=Object.fromEntries(Object.entries(PATHS).map(([id,rel])=>[
    id,fs.readFileSync(path.join(sourceRoot,rel))]));
  return {report,rawReport,graph,files};
}
module.exports={assess,load,PATHS,EXPECTED_SHA,REPORT_SHA};
if(require.main===module){
  const [reportDir,sourceRoot,out]=process.argv.slice(2);
  assert(reportDir&&sourceRoot&&out,"USAGE: <archived source pair dir> <pinned node_modules/@openzeppelin/contracts> <witness output>");
  const result=assess(load({reportDir,sourceRoot}));
  fs.writeFileSync(path.resolve(out),JSON.stringify(result,null,2)+"\n");
  console.log("OECL_ED001_PINNED_VAULT_ASSET_CALL_WITNESS",JSON.stringify({
    evidence:result.scientificFinding,
    paths:result.callChains.map(x=>x.id),
    runtimeTarget:result.identifiedSourceLevelDependency.runtimeCalleeAddress,
    emergent:result.novelEmergentProperty,executed:result.evmExecuted
  }));
}
