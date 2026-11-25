"use strict";
/*
 * State-changing EVM protocol design, generated from compiler-resolved source
 * facts and typed ABI, but for ONE explicit reviewed ERC20 asset fixture family.
 * Never equate discovering a mutating ABI with permission to execute it.
 *
 * The reviewed test-only wrapper exposes oeclResearchMint for initial fixture
 * state; that function is NOT claimed to be part of ERC20 or ERC20Burnable.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const registry=require("./source-registry.json");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const digest=x=>hash(JSON.stringify(x));
const sha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const profiles=["ERC-20","ERC-20-BURNABLE"];
const values=Object.freeze({
  minted:"100",approved:"50",transfer:"25",burn:"10",
  zero:"0",unauthorized:"1",overAllowance:"51",overBalance:"101"
});
const approvedMethods=Object.freeze({
  transfer:["approve(address,uint256)","transferFrom(address,address,uint256)",
    "allowance(address,address)","balanceOf(address)","totalSupply()"],
  burn:["burn(uint256)","burnFrom(address,uint256)"],
  harness:"oeclResearchMint(address,uint256)"
});
const TYPES=Object.freeze({
  "approve(address,uint256)":{inputs:["address","uint256"],outputs:["bool"],mutability:"nonpayable"},
  "transferFrom(address,address,uint256)":{inputs:["address","address","uint256"],outputs:["bool"],mutability:"nonpayable"},
  "allowance(address,address)":{inputs:["address","address"],outputs:["uint256"],mutability:"view"},
  "balanceOf(address)":{inputs:["address"],outputs:["uint256"],mutability:"view"},
  "totalSupply()":{inputs:[],outputs:["uint256"],mutability:"view"},
  "burn(uint256)":{inputs:["uint256"],outputs:[],mutability:"nonpayable"},
  "burnFrom(address,uint256)":{inputs:["address","uint256"],outputs:[],mutability:"nonpayable"},
  "oeclResearchMint(address,uint256)":{inputs:["address","uint256"],outputs:[],mutability:"nonpayable"}
});
const orderedSteps=Object.freeze({
  common:[
    ["MINT_INITIAL","MINED_TEST_ONLY_SETUP","oeclResearchMint(address,uint256)","OWNER","MINTED"],
    ["APPROVE_SPENDER","MINED","approve(address,uint256)","OWNER","APPROVED"],
    ["NO_ALLOWANCE_ATTACKER","READ_ONLY_EXPECT_REVERT","transferFrom(address,address,uint256)","ATTACKER","UNAUTHORIZED"],
    ["OVER_ALLOWANCE_SPENDER","READ_ONLY_EXPECT_REVERT","transferFrom(address,address,uint256)","SPENDER","OVER_ALLOWANCE"],
    ["AUTHORIZED_TRANSFER","MINED","transferFrom(address,address,uint256)","SPENDER","TRANSFER"],
    ["ZERO_TRANSFER_BOUNDARY","MINED","transferFrom(address,address,uint256)","SPENDER","ZERO"],
  ],
  burn:[
    ["NO_ALLOWANCE_BURN_ATTACKER","READ_ONLY_EXPECT_REVERT","burnFrom(address,uint256)","ATTACKER","UNAUTHORIZED"],
    ["OVER_BALANCE_DIRECT_BURN","READ_ONLY_EXPECT_REVERT","burn(uint256)","OWNER","OVER_BALANCE"],
    ["AUTHORIZED_BURN_FROM","MINED","burnFrom(address,uint256)","SPENDER","BURN"],
    ["ZERO_BURN_BOUNDARY","MINED","burnFrom(address,uint256)","SPENDER","ZERO"]
  ]
});
const hex40=x=>typeof x==="string"&&/^0x[0-9a-f]{40}$/i.test(x);
const hex64=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);

function verifiedSources(report){
  assert.equal(report?.schemaVersion,"OECL_OPEN_GENERIC_AST_RESULT_V1");
  assert.equal(report.sourceOnly,true);
  assert.equal(report.evmExecuted,false);
  assert.equal(report.scientificVerdict,"INCONCLUSIVE");
  assert.equal(report.candidateAdmission,"NOT_ADMITTED");
  assert(Array.isArray(report.selected)&&report.selected.length===2);
  assert(report.selected[0].id!==report.selected[1].id);
  return report.selected.map(s=>{
    const ref=registry.sources.find(x=>x.id===s.id);
    assert(ref,"UNREGISTERED_SOURCE_PROFILE");
    const revision=ref.kind==="github"?ref.revision:registry.openzeppelin.version;
    assert.equal(s.kind,ref.kind);
    assert.equal(s.revision,revision);
    assert.equal(s.repository,ref.kind==="github"?ref.repository:registry.openzeppelin.package);
    assert(sha(s.sourceSha256));
    assert(typeof s.sourceUnit==="string"&&s.sourceUnit.length<220);
    return {id:s.id,kind:s.kind,repository:s.repository,revision,
      sourceUnit:s.sourceUnit,sourceSha256:s.sourceSha256,contract:ref.contract};
  });
}
function abiFunction(artifact,signature){
  const expected=TYPES[signature];
  if(!artifact||!expected||!Array.isArray(artifact.abi))return false;
  const name=signature.split("(")[0];
  const found=artifact.abi.filter(x=>x.type==="function"&&x.name===name&&
    Array.isArray(x.inputs)&&x.inputs.map(y=>y.type).join(",")===expected.inputs.join(",")&&
    Array.isArray(x.outputs)&&x.outputs.map(y=>y.type).join(",")===expected.outputs.join(",")&&
    x.stateMutability===expected.mutability);
  return found.length===1;
}
function inheritance(graph,src){
  const contract=graph.contracts.filter(c=>c.kind==="contract"&&
    c.unit===src.sourceUnit&&c.name===src.contract);
  if(contract.length!==1)return null;
  const baseIds=new Set([contract[0].id,...contract[0].linearizedBaseContracts]);
  const baseNames=graph.contracts.filter(c=>baseIds.has(c.id)).map(c=>c.name);
  if(!baseNames.includes("ERC20"))return null;
  return {baseIds,baseNames};
}
function fact(graph,baseIds,name){
  const hits=graph.functions.filter(f=>baseIds.has(f.contractId)&&f.name===name&&
    f.kind==="function"&&f.implemented);
  return hits.length===1?hits[0]:null;
}
function canReach(graph,start,target){
  const edges=graph.edges.filter(e=>e.kind==="CALLS");
  const queue=[[start]],seen=new Set([start]);
  while(queue.length){
    const chain=queue.shift(),id=chain[chain.length-1];
    if(id===target)return chain;
    if(chain.length>=12)continue;
    for(const edge of edges.filter(e=>e.from===id)){
      if(!seen.has(edge.to)){seen.add(edge.to);queue.push([...chain,edge.to]);}
    }
  }
  return null;
}
function astCapability(graph,src,isBurn){
  const model=inheritance(graph,src);
  if(!model)return {status:"NO_COMPILER_RESOLVED_ERC20_INHERITANCE"};
  const names=["transferFrom","_spendAllowance","_transfer","_approve",
    "_mint","balanceOf","allowance","totalSupply",...(isBurn?["burnFrom","burn","_burn"]:[])];
  const functions=Object.fromEntries(names.map(name=>[name,fact(graph,model.baseIds,name)]));
  if(Object.values(functions).some(x=>!x))return {status:"COMPILER_FUNCTIONS_NOT_RESOLVED"};
  const transferSpend=canReach(graph,functions.transferFrom.id,functions._spendAllowance.id);
  const transferMove=canReach(graph,functions.transferFrom.id,functions._transfer.id);
  const needs=["_balances","_allowances","_totalSupply"];
  const stateWrites=needs.map(state=>graph.writes.filter(w=>
    state===w.state&&model.baseIds.has(
      graph.functions.find(f=>f.id===w.owner)?.contractId)));
  if(!transferSpend||!transferMove||stateWrites.some(x=>x.length===0))
    return {status:"AST_REQUIRED_ALLOWANCE_OR_STATE_PATH_NOT_RESOLVED"};
  if(!graph.writes.some(w=>w.owner===functions._transfer.id&&w.state==="_balances")||
     !graph.writes.some(w=>w.owner===functions._approve.id&&w.state==="_allowances")||
     !graph.writes.some(w=>w.owner===functions._mint.id&&w.state==="_totalSupply"))
    return {status:"AST_REQUIRED_TRANSFER_OR_MINT_WRITES_NOT_OBSERVED"};
  let burnPath=null;
  if(isBurn){
    const burnSpend=canReach(graph,functions.burnFrom.id,functions._spendAllowance.id);
    const burnDecrease=canReach(graph,functions.burnFrom.id,functions._burn.id);
    const directBurn=canReach(graph,functions.burn.id,functions._burn.id);
    if(!burnSpend||!burnDecrease||!directBurn||
       !graph.writes.some(w=>w.owner===functions._burn.id&&
         w.state==="_totalSupply"&&w.kind==="DECREASE"))
      return {status:"AST_BURN_SUPPLY_DECREASE_NOT_RESOLVED"};
    burnPath={allowanceCallPath:burnSpend,burnCallPath:burnDecrease,
      directBurnCallPath:directBurn,
      supplyDecreaseLocation:graph.writes.find(w=>w.owner===functions._burn.id&&
        w.state==="_totalSupply"&&w.kind==="DECREASE").location};
  }
  return {status:"READY",sourceSha256:src.sourceSha256,
    baseContracts:model.baseNames,
    transferFrom:{functionId:functions.transferFrom.id,allowanceCallPath:transferSpend,
      transferCallPath:transferMove},
    writes:stateWrites.map((facts,i)=>({name:needs[i],
      kinds:[...new Set(facts.map(w=>w.kind))].sort()})),
    burnFrom:burnPath};
}
function buildHarnessSource(src,index){
  if(!profiles.includes(src.id)||src.kind!=="openzeppelin"||
     src.revision!=="4.9.6"||
     src.contract!==(src.id==="ERC-20"?"ERC20":"ERC20Burnable")||
     src.sourceUnit!=="@openzeppelin/contracts/"+
       (src.id==="ERC-20"?"token/ERC20/ERC20.sol":
        "token/ERC20/extensions/ERC20Burnable.sol"))
    return null;
  const name="OECLStatefulParticipant"+index;
  const solidity=[
    "// SPDX-License-Identifier: MIT",
    "pragma solidity ^0.8.20;",
    'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";',
    'import "'+src.sourceUnit+'";',
    "contract "+name+" is "+src.contract+" {",
    '  constructor() ERC20("OECL research token","OECL") {}',
    // This is a fixed, reviewed fixture setup entry, NOT a source ERC method.
    "  function oeclResearchMint(address to,uint256 amount) external { _mint(to,amount); }",
    "}",""
  ].join("\n");
  return {contractName:name,unit:"OECL_Stateful_Registered_"+index+".sol",
    solidity,sourceSha256:hash(solidity),fixtureMintIsTestOnly:true};
}
function signedProtocolBody({report,graph,originalArtifacts,deployableArtifacts,
  wrappers,compilerVersion,dependencyIntegrity}){
  assert.equal(graph?.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(report.graphSha256,digest(graph),"AST_GRAPH_IDENTITY_MISMATCH");
  assert.equal(report.compilerVersion,compilerVersion,"COMPILER_VERSION_MISMATCH");
  assert.equal(report.dependencyIntegrity,dependencyIntegrity,"PACKAGE_LOCK_CHANGED");
  assert(/^0\.8\.26\+/.test(compilerVersion),"UNLOCKED_SOLC");
  assert(typeof dependencyIntegrity==="string"&&dependencyIntegrity.startsWith("sha512-"));
  const selected=verifiedSources(report);
  assert(Array.isArray(originalArtifacts)&&originalArtifacts.length===2);
  assert(Array.isArray(deployableArtifacts)&&deployableArtifacts.length===2);
  assert(Array.isArray(wrappers)&&wrappers.length===2);
  const isReviewed=selected.map(s=>s.id).every(id=>profiles.includes(id));
  const reasons=[],capabilities=[];
  if(!isReviewed)reasons.push("UNREVIEWED_STATEFUL_HARNESS_PROFILE");
  selected.forEach((s,i)=>{
    const source=graph.sources.find(x=>x.unit===s.sourceUnit);
    assert(source&&source.sha256===s.sourceSha256,"PRIMARY_SOURCE_SHA_MISMATCH");
    const burn=s.id==="ERC-20-BURNABLE";
    const methods=[...approvedMethods.transfer,...(burn?approvedMethods.burn:[])];
    const native=originalArtifacts[i];
    const abiValid=methods.every(x=>abiFunction(native,x));
    const ast=astCapability(graph,s,burn);
    const harness=buildHarnessSource(s,i);
    const wrapper=wrappers[i],deployment=deployableArtifacts[i];
    const wrapperValid=Boolean(harness&&wrapper&&deployment&&
      wrapper.sourceSha256===harness.sourceSha256&&
      wrapper.solidity===harness.solidity&&
      wrapper.contractName===harness.contractName&&
      abiFunction(deployment,approvedMethods.harness)&&
      methods.every(x=>abiFunction(deployment,x))&&
      deployment.evm?.bytecode?.object?.length>0&&
      deployment.evm.bytecode.object.length<=120000&&
      /^[0-9a-f]+$/i.test(deployment.evm.bytecode.object)&&
      Object.keys(deployment.evm.bytecode.linkReferences||{}).length===0&&
      !(deployment.abi||[]).some(e=>e.type==="constructor"&&e.inputs?.length));
    let reason=!isReviewed?"UNREVIEWED_STATEFUL_HARNESS_PROFILE":
      !abiValid?"REQUIRED_TYPED_ABI_NOT_COMPILED":
      ast.status!=="READY"?ast.status:
      !wrapperValid?"REVIEWED_HARNESS_NOT_DEPLOYABLE":"READY";
    reasons.push(reason);
    capabilities.push({id:s.id,role:burn?"ERC20_WITH_BURN_EXTENSION":"ERC20_BASE",
      status:reason,sourceAST:ast,
      requiredAbiMethods:methods,
      nativeAbiSha256:digest(native?.abi??null),
      harnessSourceSha256:harness?.sourceSha256??null,
      deployedAbiSha256:digest(deployment?.abi??null),
      creationBytecodeSha256:hash(deployment?.evm?.bytecode?.object??""),
      harnessAddsTestOnlyMint:true});
  });
  const ready=reasons.every(x=>x==="READY");
  const cases=ready?selected.map((s,i)=>({
    id:s.id,role:s.id==="ERC-20-BURNABLE"?"BURNABLE":"BASE",
    steps:[...orderedSteps.common,...(s.id==="ERC-20-BURNABLE"?orderedSteps.burn:[])]
      .map(parts=>({id:parts[0],execution:parts[1],
        signature:parts[2],caller:parts[3],quantityRole:parts[4]}))
  })):[];
  const base={
    schemaVersion:"OECL_GENERIC_STATEFUL_ERC20_PLAN_V1",
    scope:"REVIEWED_PINNED_ERC20_AND_BURNABLE_LOCAL_HARDHAT_FIXTURES_ONLY",
    mechanism:"AST_ABI_DERIVED_ALLOWANCE_TRANSFER_AND_CONDITIONAL_BURN_CHALLENGES",
    selected,sourceGraphSha256:report.graphSha256,
    sourceReportSha256:digest(report),compilerVersion,dependencyIntegrity,
    capabilities,workflowStatus:ready?
      "REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED":"BLOCKED_NO_REVIEWED_STATEFUL_CAPABILITY",
    blockedReasons:ready?[]:capabilities.filter(x=>x.status!=="READY")
      .map(x=>x.id+":"+x.status),
    experimentalCases:cases,
    quantities:{...values},
    hypotheses:ready?[
      {kind:"ALLOWANCE_TRANSFER_ACCOUNTING",
        predicted:"With an adequate owner allowance, transferFrom should move the selected quantity without changing total supply.",
        refuter:"A mined eligible transfer changing supply or transferring a different balance quantity falsifies this fixture-scoped prediction.",
        alternatives:["The test-only mint supplies initial state, not an ERC20 minting guarantee.",
          "Authorization might differ for real deployment roles or upgraded contracts."],
        positive:"Spender transfers an allowed positive quantity after owner approval.",
        negatives:["Caller without allowance must revert in read-only simulation.",
          "A request larger than the live allowance must revert in read-only simulation.",
          "A zero transfer can succeed without requiring balances to decrease."]
      },
      {kind:"APPROVED_BURN_ACCOUNTING",
        predicted:"For the burnable extension, approved burnFrom reduces owner balance and token supply by the recorded positive quantity.",
        refuter:"A mined eligible burn not reducing both balances and total supply by the same measured amount falsifies that scoped prediction.",
        alternatives:["Base ERC20 does not expose burnFrom; that does not make it an incompatible ERC20.",
          "Failure for overbalance, missing authorization or zero quantity must not be conflated."],
        positive:"Spender burns a positive amount within the remaining allowance.",
        negatives:["Caller without allowance must revert.",
          "Direct burn of more tokens than held must revert.",
          "Zero burn must not reduce supply."]
      }
    ]:[],
    executionBudget:{maxDeployments:2,maxMinedTransactions:12,
      maxUnminedNegativeCalls:6,maxGasPerTransaction:3000000,
      maxSourceUnits:110,maxSourceBytes:2097152},
    sourceCompiled:true,evmExecuted:false,experimentDispatched:false,
    humanReviewForProductionRequired:true,scientificVerdict:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    executionGate:"REVIEWED_GITHUB_ACTION_LOCAL_HARDHAT_31337_NO_PUBLIC_JOB_DISPATCH",
    limitations:[
      "This is a fixed reviewed ERC20-style stateful grammar, not arbitrary transaction synthesis for all ERCs.",
      "A generated hash-pinned harness exposes a test-only unprotected mint; that extra capability is not present in the original ERC20 standard.",
      "Each token is deployed independently; no cross-contract interoperability, atomic coordination or financial accounting is tested.",
      "ABIs and AST call-paths are conditions for experiment design, not proof that the paths are executable.",
      "Negative controls use unmined callStatic and cannot be described as mined reverted transactions.",
      "All mined receipts are from a single ephemeral Hardhat 31337 provider and are not Ethereum mainnet attestations."
    ]
  };
  return {...base,planSha256:digest(base)};
}
function verifyStatefulPlan(plan){
  try{
    if(!plan||plan.schemaVersion!=="OECL_GENERIC_STATEFUL_ERC20_PLAN_V1"||
      plan.scope!=="REVIEWED_PINNED_ERC20_AND_BURNABLE_LOCAL_HARDHAT_FIXTURES_ONLY"||
      plan.mechanism!=="AST_ABI_DERIVED_ALLOWANCE_TRANSFER_AND_CONDITIONAL_BURN_CHALLENGES"||
      plan.sourceCompiled!==true||plan.evmExecuted!==false||
      plan.experimentDispatched!==false||
      plan.executionGate!=="REVIEWED_GITHUB_ACTION_LOCAL_HARDHAT_31337_NO_PUBLIC_JOB_DISPATCH"||
      plan.scientificVerdict!=="INCONCLUSIVE"||
      plan.compatibilityVerdict!=="NOT_EVALUATED"||
      plan.candidateAdmission!=="NOT_ADMITTED"||
      JSON.stringify(plan.quantities)!==JSON.stringify(values)||
      JSON.stringify(plan.executionBudget)!==JSON.stringify({
        maxDeployments:2,maxMinedTransactions:12,maxUnminedNegativeCalls:6,
        maxGasPerTransaction:3000000,maxSourceUnits:110,maxSourceBytes:2097152
      })||
      !sha(plan.sourceGraphSha256)||!sha(plan.sourceReportSha256)||
      !sha(plan.planSha256)||!Array.isArray(plan.selected)||
      plan.selected.length!==2||!Array.isArray(plan.capabilities)||
      plan.capabilities.length!==2||!Array.isArray(plan.experimentalCases)||
      plan.experimentalCases.length>2)return false;
    const verified=plan.selected.map(s=>{
      const r=registry.sources.find(x=>x.id===s.id);
      if(!r||s.revision!==(r.kind==="github"?r.revision:"4.9.6")||
        s.repository!==(r.kind==="github"?r.repository:"@openzeppelin/contracts")||
        !sha(s.sourceSha256))throw Error("FORGED_SOURCE_IDENTITY");
      return r;
    });
    if(!verified.length||plan.selected[0].id===plan.selected[1].id)return false;
    if(plan.capabilities.some((c,i)=>c.id!==plan.selected[i].id||
      !sha(c.nativeAbiSha256)||!sha(c.creationBytecodeSha256)||
      !sha(c.deployedAbiSha256)||
      (c.harnessSourceSha256!==null&&!sha(c.harnessSourceSha256))||
      c.harnessAddsTestOnlyMint!==true))return false;
    const ready=plan.capabilities.every(c=>c.status==="READY");
    if((ready?plan.workflowStatus!=="REVIEWED_STATEFUL_PROTOCOL_PREREGISTERED":
      plan.workflowStatus!=="BLOCKED_NO_REVIEWED_STATEFUL_CAPABILITY")||
      plan.blockedReasons.length!==(ready?0:plan.capabilities.filter(c=>c.status!=="READY").length)||
      plan.experimentalCases.length!==(ready?2:0)||
      plan.hypotheses.length!==(ready?2:0))return false;
    if(ready){
      if(plan.selected.some(x=>!profiles.includes(x.id)))return false;
      for(let i=0;i<2;i++){
        const s=plan.selected[i],c=plan.capabilities[i],expected=plan.experimentalCases[i];
        if(!sha(c.harnessSourceSha256)||
          c.role!==(s.id==="ERC-20"?"ERC20_BASE":"ERC20_WITH_BURN_EXTENSION")||
          c.sourceAST?.status!=="READY"||
          expected?.id!==s.id||
          expected.role!==(s.id==="ERC-20"?"BASE":"BURNABLE")||
          JSON.stringify(expected.steps)!==JSON.stringify(
            [...orderedSteps.common,...(s.id==="ERC-20-BURNABLE"?orderedSteps.burn:[])]
              .map(parts=>({id:parts[0],execution:parts[1],
                signature:parts[2],caller:parts[3],quantityRole:parts[4]}))))
          return false;
      }
    }
    const {planSha256,...body}=plan;
    return digest(body)===planSha256;
  }catch{return false;}
}
module.exports={hash,digest,profiles,values,approvedMethods,TYPES,
  abiFunction,astCapability,buildHarnessSource,signedProtocolBody,verifyStatefulPlan,
  hex40,hex64};