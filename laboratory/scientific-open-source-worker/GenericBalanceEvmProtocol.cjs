"use strict";
/**
 * Reviewed operation-family policy for pinned ERC20-like local fixtures.
 * Structural AST hypotheses are candidates, NOT generic execution authority.
 * Only this immutable source/ABI/fixture policy can authorize the local CI job.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {hash}=require("./GenericHypothesisPlanner.cjs");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const hex64=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
const hex32=s=>typeof s==="string"&&/^0x[0-9a-f]{64}$/i.test(s);
const hex40=s=>typeof s==="string"&&/^0x[0-9a-f]{40}$/i.test(s);
const allowed=Object.freeze({
  "ERC-20":{contract:"ERC20",sourceUnit:"@openzeppelin/contracts/token/ERC20/ERC20.sol"},
  "ERC-20-BURNABLE":{contract:"ERC20Burnable",sourceUnit:"@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"}
});
const IDS=Object.freeze(Object.keys(allowed));
const POLICY=Object.freeze({initial:"100",first:"25",last:"10",over:"101",
  negative:"1",zero:"0",maxGasPerTransaction:3000000,maxMined:10,maxSimulations:6});
const CASES=Object.freeze([
  ["MINT_100","MINED","OWNER","oeclResearchMint(address,uint256)"],
  ["NO_ALLOWANCE_FROM","EXPECT_UNMINED_REVERT","ATTACKER","transferFrom(address,address,uint256)"],
  ["TRANSFER_25","MINED","OWNER","transfer(address,uint256)"],
  ["OVER_BALANCE","EXPECT_UNMINED_REVERT","OWNER","transfer(address,uint256)"],
  ["TRANSFER_ZERO","MINED","OWNER","transfer(address,uint256)"],
  ["ZERO_RECIPIENT","EXPECT_UNMINED_REVERT","OWNER","transfer(address,uint256)"],
  ["TRANSFER_10","MINED","OWNER","transfer(address,uint256)"]
]);
const TYPE_SPECS={
 "transfer(address,uint256)":[["address","uint256"],["bool"],"nonpayable"],
 "transferFrom(address,address,uint256)":[["address","address","uint256"],["bool"],"nonpayable"],
 "balanceOf(address)":[["address"],["uint256"],"view"],
 "totalSupply()":[[],["uint256"],"view"],
 "allowance(address,address)":[["address","address"],["uint256"],"view"],
 "oeclResearchMint(address,uint256)":[["address","uint256"],[],"nonpayable"]
};
const checkAbi=(abi,sig,types)=>{
  if(!Array.isArray(abi))return false;
  return abi.filter(e=>e.type==="function"&&e.name===sig.split("(")[0]&&
    e.inputs?.map(x=>x.type).join(",")===types[0].join(",")&&
    e.outputs?.map(x=>x.type).join(",")===types[1].join(",")&&
    e.stateMutability===types[2]).length===1;
};
function fixture(profile,index){
  const expected=allowed[profile?.id];
  if(!expected||profile.contract!==expected.contract||
     profile.sourceUnit!==expected.sourceUnit||profile.revision!=="4.9.6"||
     !hex64(profile.sourceSha256))return null;
  const unit="OECL_GenericBalanceFixture_"+index+".sol";
  const contractName="OECLGenericBalanceFixture"+index;
  const solidity=[
    "// SPDX-License-Identifier: MIT",
    "pragma solidity ^0.8.20;",
    'import "'+profile.sourceUnit+'";',
    "contract "+contractName+" is "+profile.contract+" {",
    'constructor() ERC20("OECL local research token", "OECL") {}',
    "function oeclResearchMint(address to, uint256 amount) external { _mint(to, amount); }",
    "}",""
  ].join("\n");
  return {unit,contractName,solidity,sourceSha256:sha256(solidity),
    addsUnprotectedTestOnlyMint:true};
}
function planFor(sourceReport,originalArtifacts,fixtureArtifacts,fixtures){
  assert.equal(sourceReport?.schemaVersion,"OECL_LOCKED_SOURCE_HYPOTHESES_V1");
  assert.equal(sourceReport.status,"COMPILER_RECONCILED_SOURCE_ONLY");
  assert.equal(sourceReport.candidateAdmission,"NOT_ADMITTED");
  assert.equal(sourceReport.evmExecuted,false);
  assert.equal(sourceReport.executionAuthorized,false);
  assert.equal(sourceReport.compatibilityVerdict,"NOT_EVALUATED");
  assert(/^0\.8\.26\+/.test(sourceReport.compilerVersion));
  assert(Array.isArray(sourceReport.participants)&&sourceReport.participants.length===2);
  assert([originalArtifacts,fixtureArtifacts,fixtures].every(x=>Array.isArray(x)&&x.length===2));
  const selected=sourceReport.participants.map(x=>({id:x.id,contract:x.contract,
    sourceUnit:x.sourceUnit,sourceSha256:x.sourceSha256,abiSha256:x.abiSha256,
    hypothesisId:x.hypotheses.find(h=>h.signature==="transfer(address,uint256)"&&
      h.stateVariable==="_balances"&&h.status==="HYPOTHESIS_ONLY"&&
      h.executionSafety==="SOURCE_ONLY_REVIEW_REQUIRED")?.id||null}));
  const exactPair=selected.map(x=>x.id).sort().join("|")===IDS.slice().sort().join("|");
  const capabilities=selected.map((src,i)=>{
    const original=originalArtifacts[i],deployed=fixtureArtifacts[i],wrap=fixtures[i],
      expected=fixture(src.id,i);
    const srcValid=Boolean(exactPair&&expected&&src.contract===allowed[src.id].contract&&
      src.sourceUnit===allowed[src.id].sourceUnit&&hex64(src.hypothesisId)&&
      sourceReport.participants[i].structuralPaths.some(p=>
        p.signature==="transfer(address,uint256)"&&p.stateVariable==="_balances"&&
        p.executionSafety==="SOURCE_ONLY_REVIEW_REQUIRED"));
    const nativeValid=srcValid&&Object.entries(TYPE_SPECS).filter(([k])=>!k.startsWith("oeclResearchMint")).every(
      ([sig,spec])=>checkAbi(original?.abi,sig,spec))&&hash(original?.abi)===src.abiSha256;
    const wrapperValid=Boolean(nativeValid&&wrap&&deployed&&
      wrap.sourceSha256===expected.sourceSha256&&wrap.solidity===expected.solidity&&
      wrap.contractName===expected.contractName&&
      Object.entries(TYPE_SPECS).every(([sig,spec])=>checkAbi(deployed.abi,sig,spec))&&
      typeof deployed.evm?.bytecode?.object==="string"&&
      /^[a-f0-9]+$/i.test(deployed.evm.bytecode.object)&&
      deployed.evm.bytecode.object.length>0&&deployed.evm.bytecode.object.length<120000&&
      Object.keys(deployed.evm.bytecode.linkReferences||{}).length===0);
    return {id:src.id,status:!srcValid?"UNREVIEWED_SOURCE_OR_OPERATION":
      !nativeValid?"NATIVE_TYPED_ABI_NOT_VERIFIED":
      !wrapperValid?"PINNED_FIXTURE_NOT_VERIFIED":"READY",
      fixtureSourceSha256:expected?.sourceSha256||null,
      originalAbiSha256:hash(original?.abi||null),
      deployedAbiSha256:hash(deployed?.abi||null),
      creationBytecodeSha256:sha256(deployed?.evm?.bytecode?.object||"")};
  });
  const ready=capabilities.every(x=>x.status==="READY");
  const base={
    schemaVersion:"OECL_GENERIC_BALANCE_EVM_PLAN_V1",
    scope:"PINNED_ERC20_LIKE_LOCAL_FIXTURES_ONLY",
    grammar:"ABI_AST_SELECTED_BALANCE_TRANSFER_WITH_BOUNDED_ADVERSARIAL_CONTROLS",
    sourceReportSha256:hash(sourceReport),
    sourceGraphSha256:sourceReport.sourceGraphSha256,
    compilerVersion:sourceReport.compilerVersion,
    dependencyIntegrity:sourceReport.dependencyIntegrity,
    executionGate:"REVIEWED_CI_ONLY_EPHEMERAL_HARDHAT_31337",
    selected,capabilities,
    workflowStatus:ready?"REVIEWED_BALANCE_OPERATIONS_PREREGISTERED":"BLOCKED_UNREVIEWED_OPERATION",
    cases:ready?selected.map(s=>({id:s.id,
      steps:CASES.map(([id,execution,caller,signature])=>({id,execution,caller,signature}))})):[],
    quantities:{...POLICY},
    evmExecuted:false,experimentDispatched:false,sourceOnly:true,
    scientificVerdict:"INCONCLUSIVE",compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "Only two reviewed OZ 4.9.6 ERC20-like implementations; not arbitrary ERCs or composability.",
      "Test-only fixtures have an unprotected research mint that is absent from originals.",
      "Three expected reverts per fixture are unmined eth_call simulations, not mined transactions.",
      "AST write reachability is structural and does not independently establish execution feasibility.",
      "Second runner cannot query terminated local Hardhat history or certify mainnet behavior."
    ]};
  return {...base,planSha256:hash(base)};
}
function verifyPlan(plan){
  try{
    if(!plan||plan.schemaVersion!=="OECL_GENERIC_BALANCE_EVM_PLAN_V1"||
      plan.scope!=="PINNED_ERC20_LIKE_LOCAL_FIXTURES_ONLY"||
      plan.executionGate!=="REVIEWED_CI_ONLY_EPHEMERAL_HARDHAT_31337"||
      plan.evmExecuted!==false||plan.experimentDispatched!==false||
      plan.candidateAdmission!=="NOT_ADMITTED"||
      plan.compatibilityVerdict!=="NOT_EVALUATED")return false;
    const p={...plan};delete p.planSha256;
    if(hash(p)!==plan.planSha256)return false;
    if(!Array.isArray(plan.selected)||plan.selected.length!==2||
      !Array.isArray(plan.capabilities)||plan.capabilities.length!==2)return false;
    if(JSON.stringify(plan.quantities)!==JSON.stringify(POLICY))return false;
    if(plan.workflowStatus==="REVIEWED_BALANCE_OPERATIONS_PREREGISTERED"){
      if(plan.selected.map(x=>x.id).sort().join("|")!==IDS.slice().sort().join("|")||
        plan.capabilities.some(c=>c.status!=="READY")||
        !Array.isArray(plan.cases)||plan.cases.length!==2)return false;
      for(let i=0;i<2;i++){
        if(plan.cases[i].id!==plan.selected[i].id||
           JSON.stringify(plan.cases[i].steps)!==
           JSON.stringify(CASES.map(([id,execution,caller,signature])=>
             ({id,execution,caller,signature}))))return false;
      }
    }else if(plan.workflowStatus!=="BLOCKED_UNREVIEWED_OPERATION"||
      plan.cases?.length!==0)return false;
    return true;
  }catch{return false;}
}
function verifyWitness(plan,w){
  try{
    assert(verifyPlan(plan));
    assert.equal(plan.workflowStatus,"REVIEWED_BALANCE_OPERATIONS_PREREGISTERED");
    assert.equal(w?.schemaVersion,"OECL_GENERIC_BALANCE_EVM_WITNESS_V1");
    assert.equal(w.planSha256,plan.planSha256);
    assert.equal(w.chainId,31337);
    assert.equal(w.providerScope,"EPHEMERAL_LOCAL_HARDHAT_BLOCK_RECHECKED");
    assert.equal(w.evmExecuted,true);
    assert.equal(w.candidateAdmission,"NOT_ADMITTED");
    assert.equal(w.compatibilityVerdict,"NOT_EVALUATED");
    assert.equal(w.crossContractInteroperabilityProven,false);
    assert.equal(w.fixtureHasUnsafeResearchMint,true);
    assert(Array.isArray(w.deployments)&&w.deployments.length===2);
    assert(Array.isArray(w.participants)&&w.participants.length===2);
    assert.equal(w.minedReceiptCount,10);
    assert.equal(w.unminedNegativeCount,6);
    assert(Object.values(w.actors||{}).every(hex40));
    const receipt=r=>{
      assert(r&&hex32(r.txHash)&&hex32(r.blockHash));
      assert(Number.isSafeInteger(r.blockNumber)&&r.blockNumber>0);
      assert.equal(r.status,1);assert.equal(r.transactionMined,true);
      assert(BigInt(r.gasUsed)>0n&&BigInt(r.gasUsed)<=BigInt(POLICY.maxGasPerTransaction));
      assert(hex40(r.fromAddress));assert(r.toAddress===null||hex40(r.toAddress));
    };
    for(let i=0;i<2;i++){
      const p=w.participants[i],d=w.deployments[i],expected=plan.cases[i];
      assert.equal(p.id,expected.id);assert.equal(d.id,expected.id);
      assert(hex40(p.contractAddress));assert.equal(d.contractAddress,p.contractAddress);
      assert(hex32(d.runtimeCodeKeccak256));receipt(d.receipt);
      assert.equal(d.receipt.toAddress,null);
      assert.equal(p.cases.length,CASES.length);
      for(let j=0;j<CASES.length;j++){
        const item=p.cases[j],step=expected.steps[j];
        for(const key of ["id","execution","caller","signature"])
          assert.equal(item[key],step[key]);
        const expectedMined=step.execution==="MINED";
        assert.equal(item.transactionMined,expectedMined);
        if(expectedMined){
          receipt(item.receipt);assert.equal(item.simulation,null);
          assert.equal(item.receipt.toAddress,p.contractAddress);
          assert.equal(item.receipt.method,step.signature);
        }else{
          assert.equal(item.receipt,null);
          assert.equal(item.simulation,"ETH_CALL_REVERT");
          assert.deepEqual(item.before,item.after);
          assert.equal(item.statePreserved,true);
        }
      }
      assert.equal(p.minedTransactions,4);
      assert.equal(p.unminedNegativeControls,3);
      assert.deepEqual(p.finalState,p.cases[p.cases.length-1].after);
      assert.equal(p.finalState.ownerBalance,"65");
      assert.equal(p.finalState.recipientBalance,"35");
      assert.equal(p.finalState.attackerBalance,"0");
      assert.equal(p.finalState.totalSupply,"100");
      assert.equal(p.finalState.attackerAllowance,"0");
    }
    return true;
  }catch{return false;}
}
module.exports={sha256,hash,hex32,hex40,allowed,IDS,POLICY,CASES,TYPE_SPECS,
  checkAbi,fixture,planFor,verifyPlan,verifyWitness};
