"use strict";
/**
 * Generic SAFE, BOUNDED candidate protocol for immutable registered Solidity.
 * Only one read-only ABI signature is admitted until a reviewed compiler-driven
 * protocol safely supports additional method families. No user-supplied code,
 * calldata, remote RPC, unsandboxed JS, arbitrary bytecode or compatibility
 * admission is accepted.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const registry=require("./source-registry.json");
const digest=x=>crypto.createHash("sha256").update(x).digest("hex");
const canonical=x=>digest(JSON.stringify(x));
const sha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const safeHex=x=>typeof x==="string"&&/^0x[a-f0-9]{64}$/i.test(x);
const TEST_VECTORS=Object.freeze(["0x01ffc9a7","0xffffffff","0x2a55205a"]);
const SIGNATURE="supportsInterface(bytes4)";
const EVIDENCE="PINNED_LOCAL_HARDHAT_PROVIDER_ONLY";
function knownSources(selected){
  if(!Array.isArray(selected)||selected.length!==2||
    selected[0].id===selected[1].id)throw Error("INVALID_REGISTERED_PAIR");
  return selected.map(s=>{
    const ref=registry.sources.find(r=>r.id===s.id);
    assert(ref,"UNREGISTERED_SOURCE_PROFILE");
    const revision=ref.kind==="github"?ref.revision:registry.openzeppelin.version;
    assert.equal(s.revision,revision,"SOURCE_REVISION_CHANGED");
    assert.equal(s.kind,ref.kind,"SOURCE_KIND_CHANGED");
    assert.equal(s.repository,ref.kind==="github"?ref.repository:registry.openzeppelin.package,
      "SOURCE_REPOSITORY_CHANGED");
    assert(sha(s.sourceSha256),"SOURCE_HASH_MISSING");
    assert(typeof s.sourceUnit==="string"&&s.sourceUnit.length<220);
    return {id:s.id,kind:s.kind,repository:s.repository,revision,
      sourceUnit:s.sourceUnit,sourceSha256:s.sourceSha256,contract:ref.contract};
  });
}
function admission(artifact){
  if(!artifact||typeof artifact!=="object")return "MISSING_COMPILER_OUTPUT";
  const ctor=artifact.abi?.filter(x=>x.type==="constructor")||[];
  if(!Array.isArray(artifact.abi))return "NO_RESOLVED_ABI";
  if(ctor.length>1||ctor.some(c=>c.inputs?.length!==0))return "CONSTRUCTOR_INPUTS_REQUIRE_REVIEW";
  const bytecode=artifact.evm?.bytecode?.object;
  if(typeof bytecode!=="string"||!bytecode.length||
     bytecode.length%2!==0||!/^[a-fA-F0-9]+$/.test(bytecode))
    return "NONDEPLOYABLE_OR_UNLINKED_BYTECODE";
  if(bytecode.length>120000)return "BYTECODE_EXCEEDS_BUDGET";
  if(Object.keys(artifact.evm?.bytecode?.linkReferences||{}).length)
    return "UNRESOLVED_LIBRARY_LINKS";
  const candidates=artifact.abi.filter(x=>x.type==="function"&&
    x.name==="supportsInterface"&&x.stateMutability==="view"&&
    x.inputs?.length===1&&x.inputs[0].type==="bytes4"&&
    x.outputs?.length===1&&x.outputs[0].type==="bool");
  return candidates.length===1?"READY":"NO_REVIEWED_READ_ONLY_METHOD";
}
function deriveProtocol({report,graph,artifacts,compilerVersion,dependencyIntegrity}){
  assert.equal(report?.schemaVersion,"OECL_OPEN_GENERIC_AST_RESULT_V1");
  assert.equal(report.scientificVerdict,"INCONCLUSIVE");
  assert.equal(report.candidateAdmission,"NOT_ADMITTED");
  assert.equal(report.sourceOnly,true);
  assert.equal(report.evmExecuted,false);
  assert.equal(graph?.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(report.graphSha256,canonical(graph),"AST_GRAPH_IDENTITY_MISMATCH");
  assert.equal(report.compilerVersion,compilerVersion,"COMPILER_VERSION_MISMATCH");
  assert.equal(report.dependencyIntegrity,dependencyIntegrity,"PACKAGE_LOCK_CHANGED");
  assert(/^0\.8\.26\+/.test(compilerVersion),"COMPILER_NOT_LOCKED");
  assert(typeof dependencyIntegrity==="string"&&dependencyIntegrity.startsWith("sha512-"));
  const selection=knownSources(report.selected);
  assert(Array.isArray(artifacts)&&artifacts.length===2);
  const capabilities=artifacts.map(admission);
  const status=capabilities.every(x=>x==="READY")?
    "PREREGISTERED_SAFE_READ_ONLY_PROTOCOL":"BLOCKED_NO_REVIEWED_EXECUTION_CAPABILITY";
  const body={
    schemaVersion:"OECL_GENERIC_ABI_READ_ONLY_PROTOCOL_V1",
    scope:"PINNED_REGISTERED_SOLIDITY_CONTRACTS_ONLY",
    mechanism:"SAME_TYPED_ABI_DIFFERENT_BEHAVIOR_CHALLENGE",
    selected:selection,
    sourceGraphSha256:report.graphSha256,
    compilerVersion,dependencyIntegrity,
    sourceReportSha256:canonical(report),
    capabilities,
    workflowStatus:status,
    blockedReasons:status==="PREREGISTERED_SAFE_READ_ONLY_PROTOCOL"?[]:
      capabilities.map((reason,i)=>reason==="READY"?null:
        selection[i].id+":"+reason).filter(Boolean),
    candidate:{
      hypothesis:"Matching typed supportsInterface(bytes4) signatures need not imply identical support sets.",
      prediction:"A difference in decoded boolean responses for an identical preregistered interface ID would refute behavioral equality on that input only.",
      falsifier:"If all decoded responses match on the selected interface IDs, a difference has not been observed in this bounded experiment.",
      alternative:"Two distinct implementations can legitimately support different optional extensions while exposing the same ABI selector.",
      positiveControl:"Call the canonical IERC165 interface ID on each deployed fixture.",
      negativeControl:"Call the invalid 0xffffffff interface ID on each deployed fixture.",
      distinguishingChallenge:"Call the IERC2981 royalty interface ID on both fixtures.",
      signature:SIGNATURE,
      testVectors:[...TEST_VECTORS],
      maxDeployments:2,maxReadOnlyCalls:6,
      sourceOnly:true,evmExecuted:false,experimentDispatched:false,
      requiresHumanReviewForGeneralAdmission:true
    },
    compiled:artifacts.map((a,i)=>({
      id:selection[i].id,
      abiSha256:canonical(a?.abi??null),
      creationBytecodeSha256:digest(a?.evm?.bytecode?.object??""),
      deploymentProfile:sha(a?.oeclWrapperSha256)?
        "PINNED_INHERITANCE_ONLY_WRAPPER":"EXACT_REGISTERED_CONCRETE",
      wrapperSourceSha256:sha(a?.oeclWrapperSha256)?a.oeclWrapperSha256:null,
      contract:selection[i].contract
    })),
    scientificVerdict:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    evmExecuted:false,
    executionGate:"LOCAL_EPHEMERAL_HARDHAT_ONLY_NO_PUBLIC_DISPATCH",
    reviewerLimitations:[
      "This fixed ABI probe is not a general Solidity test-generation engine.",
      "A common supportsInterface signature is source-level ABI evidence, not a global ERC composability claim.",
      "Only immutable reviewed registry members are eligible; unknown constructors and unsafe method families are blocked.",
      "A minimal inheritance-only Solidity wrapper may instantiate an otherwise abstract pinned OpenZeppelin base; that generated wrapper source is SHA-256 identified and changes the exact deployed contract type.",
      "Local deployment receipts can be rechecked against the local Hardhat provider, not independently authenticated against Ethereum mainnet.",
      "Read-only EVM calls are not mined transaction receipts."
    ]
  };
  return {...body,planSha256:canonical(body)};
}
function verifyProtocol(plan){
  try{
    if(!plan||plan.schemaVersion!=="OECL_GENERIC_ABI_READ_ONLY_PROTOCOL_V1"||
      plan.scope!=="PINNED_REGISTERED_SOLIDITY_CONTRACTS_ONLY"||
      plan.candidate?.signature!==SIGNATURE||
      JSON.stringify(plan.candidate?.testVectors)!==JSON.stringify(TEST_VECTORS)||
      plan.candidate.maxReadOnlyCalls!==6||plan.candidate.maxDeployments!==2||
      !Array.isArray(plan.compiled)||plan.compiled.length!==2||
      !plan.compiled.every(c=>sha(c.abiSha256)&&sha(c.creationBytecodeSha256)&&
        (c.wrapperSourceSha256===null||sha(c.wrapperSourceSha256))&&
        c.deploymentProfile===(c.wrapperSourceSha256?
          "PINNED_INHERITANCE_ONLY_WRAPPER":"EXACT_REGISTERED_CONCRETE"))||
      plan.selected.length!==2||plan.selected.some(x=>!sha(x.sourceSha256))||
      !sha(plan.sourceReportSha256)||!sha(plan.sourceGraphSha256)||
      plan.evmExecuted!==false||plan.candidate.evmExecuted!==false||
      plan.candidate.experimentDispatched!==false||
      plan.compatibilityVerdict!=="NOT_EVALUATED"||
      plan.scientificVerdict!=="INCONCLUSIVE"||
      plan.candidateAdmission!=="NOT_ADMITTED"||
      plan.executionGate!=="LOCAL_EPHEMERAL_HARDHAT_ONLY_NO_PUBLIC_DISPATCH"||
      plan.planSha256!==canonical(Object.fromEntries(
        Object.entries(plan).filter(([k])=>k!=="planSha256"))))return false;
    knownSources(plan.selected);
    const ready=plan.capabilities.every(x=>x==="READY");
    return plan.capabilities.length===2&&
      (ready?plan.workflowStatus==="PREREGISTERED_SAFE_READ_ONLY_PROTOCOL":
        plan.workflowStatus==="BLOCKED_NO_REVIEWED_EXECUTION_CAPABILITY")&&
      plan.blockedReasons.length===(ready?0:plan.capabilities.filter(x=>x!=="READY").length);
  }catch{return false;}
}
function verifyWitness(plan,witness){
  if(!verifyProtocol(plan)||plan.workflowStatus!=="PREREGISTERED_SAFE_READ_ONLY_PROTOCOL")return false;
  try{
    assert.equal(witness.schemaVersion,"OECL_GENERIC_ABI_READ_ONLY_EVM_WITNESS_V1");
    assert.equal(witness.planSha256,plan.planSha256);
    assert.deepEqual(witness.selected,plan.selected.map(x=>x.id));
    assert.equal(witness.chainId,31337);
    assert.equal(witness.providerScope,EVIDENCE);
    assert.equal(witness.compatibilityVerdict,"NOT_EVALUATED");
    assert.equal(witness.scientificVerdict,"INCONCLUSIVE");
    assert.equal(witness.candidateAdmission,"NOT_ADMITTED");
    assert.equal(witness.evmExecuted,true);
    assert.equal(witness.outcome,"SCOPED_DIFFERENCE_OBSERVED");
    assert.equal(witness.deployments.length,2);
    assert.deepEqual(witness.readOnlyProbes.map(p=>p.vector),TEST_VECTORS);
    const txs=new Set(),addresses=new Set();
    witness.deployments.forEach((d,i)=>{
      assert.equal(d.id,plan.selected[i].id);
      assert(safeHex(d.txHash)&&safeHex(d.blockHash));
      assert.equal(d.transactionMined,true);
      assert.equal(d.status,1);
      assert(/^0x[a-f0-9]{40}$/i.test(d.contractAddress));
      assert(safeHex(d.codeKeccak256));
      assert(!txs.has(d.txHash)&&!addresses.has(d.contractAddress));
      txs.add(d.txHash);addresses.add(d.contractAddress);
    });
    let differences=0;
    for(const p of witness.readOnlyProbes){
      assert.equal(p.transactionMined,false);
      assert.equal(p.method,SIGNATURE);
      assert(Array.isArray(p.responses)&&p.responses.length===2);
      p.responses.forEach((response,i)=>{
        assert.equal(response.id,plan.selected[i].id);
        assert.equal(response.contractAddress,witness.deployments[i].contractAddress);
        assert.equal(typeof response.value,"boolean");
        assert(/^0x[a-fA-F0-9]*$/.test(response.returnData)&&
          response.returnData.length===66);
        // ABI bool MUST be the canonical 32-byte word 0 or 1. Never trust a
        // Boolean attached separately by the experiment runner.
        assert.equal(response.returnData.toLowerCase(),
          "0x"+"0".repeat(63)+(response.value?"1":"0"));
      });
      if(p.vector===TEST_VECTORS[0])
        assert(p.responses.every(x=>x.value===true),"IERC165_POSITIVE_CONTROL_NOT_MET");
      if(p.vector===TEST_VECTORS[1])
        assert(p.responses.every(x=>x.value===false),"INVALID_INTERFACE_NEGATIVE_CONTROL_NOT_MET");
      if(p.responses[0].value!==p.responses[1].value)differences++;
    }
    assert.equal(witness.differingVectorCount,differences);
    assert(differences>0);
    assert.equal(witness.globalInteroperabilityClaim,false);
    return true;
  }catch{return false;}
}
module.exports={TEST_VECTORS,SIGNATURE,EVIDENCE,admission,deriveProtocol,
  verifyProtocol,verifyWitness,canonical,digest};