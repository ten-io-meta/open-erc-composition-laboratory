"use strict";
/**
 * An experiment design policy, NOT authority to execute unknown contracts.
 * One reviewed family: pinned OpenZeppelin ERC721/1155 authorization behavior.
 * AST gates and typed ABIs precede fixed, preregistered transaction sequences.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const registry=require("./source-registry.json");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const digest=x=>hash(JSON.stringify(x));
const sha=x=>typeof x==="string"&&/^[a-f0-9]{64}$/.test(x);
const hex40=x=>typeof x==="string"&&/^0x[0-9a-f]{40}$/i.test(x);
const hex64=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const ZERO="0x"+"0".repeat(40);
const PROFILES=["ERC-721","ERC-1155"];
const QUANTITIES=Object.freeze({
  tokenIds:["101","102","103"],mint1155:"100",send1155:"25",
  overBalance:"101",attempt:"1",zero:"0"
});
const METHODS={
  "ERC-721":{
    "oeclResearchMint(address,uint256)":[["address","uint256"],[],"nonpayable"],
    "approve(address,uint256)":[["address","uint256"],[],"nonpayable"],
    "transferFrom(address,address,uint256)":[["address","address","uint256"],[],"nonpayable"],
    "setApprovalForAll(address,bool)":[["address","bool"],[],"nonpayable"],
    "balanceOf(address)":[["address"],["uint256"],"view"],
    "ownerOf(uint256)":[["uint256"],["address"],"view"],
    "getApproved(uint256)":[["uint256"],["address"],"view"],
    "isApprovedForAll(address,address)":[["address","address"],["bool"],"view"]
  },
  "ERC-1155":{
    "oeclResearchMint(address,uint256,uint256)":[["address","uint256","uint256"],[],"nonpayable"],
    "safeTransferFrom(address,address,uint256,uint256,bytes)":[
      ["address","address","uint256","uint256","bytes"],[],"nonpayable"],
    "setApprovalForAll(address,bool)":[["address","bool"],[],"nonpayable"],
    "balanceOf(address,uint256)":[["address","uint256"],["uint256"],"view"],
    "isApprovedForAll(address,address)":[["address","address"],["bool"],"view"]
  }
};
const SEQUENCES={
  "ERC-721":[
    ["MINT_101","MINED","OWNER","oeclResearchMint(address,uint256)"],
    ["MINT_102","MINED","OWNER","oeclResearchMint(address,uint256)"],
    ["MINT_103","MINED","OWNER","oeclResearchMint(address,uint256)"],
    ["UNAPPROVED_TRANSFER","EXPECT_UNMINED_REVERT","ATTACKER","transferFrom(address,address,uint256)"],
    ["SINGLE_TOKEN_APPROVE","MINED","OWNER","approve(address,uint256)"],
    ["TRANSFER_TOKEN_APPROVED","MINED","SPENDER","transferFrom(address,address,uint256)"],
    ["STALE_APPROVAL_REUSE","EXPECT_UNMINED_REVERT","SPENDER","transferFrom(address,address,uint256)"],
    ["GLOBAL_APPROVE","MINED","OWNER","setApprovalForAll(address,bool)"],
    ["TRANSFER_GLOBAL_OPERATOR","MINED","SPENDER","transferFrom(address,address,uint256)"],
    ["GLOBAL_REVOKE","MINED","OWNER","setApprovalForAll(address,bool)"],
    ["REVOKED_OPERATOR_TRANSFER","EXPECT_UNMINED_REVERT","SPENDER","transferFrom(address,address,uint256)"],
    ["ZERO_ADDRESS_RECIPIENT","EXPECT_UNMINED_REVERT","OWNER","transferFrom(address,address,uint256)"]
  ],
  "ERC-1155":[
    ["MINT_100","MINED","OWNER","oeclResearchMint(address,uint256,uint256)"],
    ["UNAPPROVED_TRANSFER","EXPECT_UNMINED_REVERT","ATTACKER",
      "safeTransferFrom(address,address,uint256,uint256,bytes)"],
    ["GLOBAL_APPROVE","MINED","OWNER","setApprovalForAll(address,bool)"],
    ["TRANSFER_25","MINED","SPENDER","safeTransferFrom(address,address,uint256,uint256,bytes)"],
    ["OVERBALANCE_TRANSFER","EXPECT_UNMINED_REVERT","SPENDER",
      "safeTransferFrom(address,address,uint256,uint256,bytes)"],
    ["ZERO_TRANSFER","MINED","SPENDER","safeTransferFrom(address,address,uint256,uint256,bytes)"],
    ["GLOBAL_REVOKE","MINED","OWNER","setApprovalForAll(address,bool)"],
    ["REVOKED_OPERATOR_TRANSFER","EXPECT_UNMINED_REVERT","SPENDER",
      "safeTransferFrom(address,address,uint256,uint256,bytes)"],
    ["ZERO_ADDRESS_RECIPIENT","EXPECT_UNMINED_REVERT","OWNER",
      "safeTransferFrom(address,address,uint256,uint256,bytes)"]
  ]
};
function signatureSpec(abi,signature,spec){
  if(!Array.isArray(abi))return false;
  const name=signature.split("(")[0];
  return abi.filter(x=>x.type==="function"&&x.name===name&&
    x.inputs?.map(y=>y.type).join(",")===spec[0].join(",")&&
    x.outputs?.map(y=>y.type).join(",")===spec[1].join(",")&&
    x.stateMutability===spec[2]).length===1;
}
function pinnedSource(report){
  assert.equal(report?.schemaVersion,"OECL_OPEN_GENERIC_AST_RESULT_V1");
  assert.equal(report.sourceOnly,true);assert.equal(report.evmExecuted,false);
  assert.equal(report.scientificVerdict,"INCONCLUSIVE");
  assert.equal(report.candidateAdmission,"NOT_ADMITTED");
  assert(Array.isArray(report.selected)&&report.selected.length===2);
  return report.selected.map(s=>{
    const ref=registry.sources.find(x=>x.id===s.id);
    assert(ref,"UNREGISTERED_SOLIDITY_PROFILE");
    const revision=ref.kind==="github"?ref.revision:registry.openzeppelin.version;
    assert.equal(s.kind,ref.kind);assert.equal(s.revision,revision);
    assert.equal(s.repository,ref.kind==="github"?ref.repository:registry.openzeppelin.package);
    const unit=ref.kind==="openzeppelin"?"@openzeppelin/contracts/"+ref.file:
      "github/"+report.selected.indexOf(s)+"/"+ref.file;
    assert.equal(s.sourceUnit,unit,"SOURCE_UNIT_CHANGED");
    assert(sha(s.sourceSha256));
    return {id:s.id,kind:s.kind,repository:s.repository,revision,
      sourceUnit:unit,sourceSha256:s.sourceSha256,contract:ref.contract};
  });
}
function reachable(graph,start,end){
  if(!start||!end)return null;
  const q=[[start]],seen=new Set([start]);
  while(q.length){
    const chain=q.shift(),last=chain[chain.length-1];
    if(last===end)return chain;
    if(chain.length>10)continue;
    for(const e of graph.edges.filter(x=>x.kind==="CALLS"&&x.from===last)){
      if(!seen.has(e.to)){seen.add(e.to);q.push([...chain,e.to]);}
    }
  }
  return null;
}
function astCapabilities(graph,src){
  const root=graph.contracts.find(c=>c.unit===src.sourceUnit&&c.name===src.contract);
  if(!root)return {status:"PRIMARY_CONTRACT_NOT_RESOLVED"};
  const bases=new Set([root.id,...root.linearizedBaseContracts]);
  const functions=name=>{
    const facts=graph.functions.filter(f=>bases.has(f.contractId)&&
      f.name===name&&f.kind==="function"&&f.implemented);
    return facts.length===1?facts[0]:null;
  };
  const writes=(name,state,kind)=>{
    const f=functions(name);
    return Boolean(f&&graph.writes.some(w=>w.owner===f.id&&
      w.state===state&&(!kind||w.kind===kind)));
  };
  const id=src.id,required=id==="ERC-721"?
    ["transferFrom","_transfer","_mint","approve","_approve",
      "setApprovalForAll","_setApprovalForAll","_isApprovedOrOwner"]:
    ["safeTransferFrom","_safeTransferFrom","_mint","setApprovalForAll",
      "_setApprovalForAll"];
  const funcs=Object.fromEntries(required.map(n=>[n,functions(n)]));
  if(Object.values(funcs).some(x=>!x))return {status:"REQUIRED_COMPILER_FUNCTION_MISSING"};
  const transferPath=id==="ERC-721"?
    reachable(graph,funcs.transferFrom.id,funcs._transfer.id):
    reachable(graph,funcs.safeTransferFrom.id,funcs._safeTransferFrom.id);
  if(!transferPath)return {status:"TRANSFER_PATH_UNRESOLVED"};
  const authorityPath=id==="ERC-721"?
    reachable(graph,funcs.transferFrom.id,funcs._isApprovedOrOwner.id):
    null;
  const approvals=id==="ERC-721"?
    reachable(graph,funcs.approve.id,funcs._approve.id):null;
  if(id==="ERC-721"&&(!authorityPath||!approvals))
    return {status:"TOKEN_APPROVAL_PATH_UNRESOLVED"};
  const globalApprovalPath=reachable(graph,funcs.setApprovalForAll.id,
    funcs._setApprovalForAll.id);
  if(!globalApprovalPath)
    return {status:"GLOBAL_OPERATOR_APPROVAL_PATH_UNRESOLVED"};
  const stateChecks=id==="ERC-721"?[
    writes("_mint","_owners"),writes("_transfer","_owners"),
    writes("_approve","_tokenApprovals"),
    writes("_setApprovalForAll","_operatorApprovals")
  ]:[
    writes("_mint","_balances"),
    writes("_safeTransferFrom","_balances"),
    writes("_setApprovalForAll","_operatorApprovals")
  ];
  if(stateChecks.some(x=>!x))return {status:"REQUIRED_STATE_WRITE_NOT_RESOLVED",
    checks:stateChecks,
    observedWrites:graph.writes.filter(w=>
      Object.values(funcs).some(f=>f.id===w.owner)).map(w=>({
        owner:graph.functions.find(f=>f.id===w.owner)?.name,
        state:w.state,kind:w.kind})),
    functions:Object.fromEntries(Object.entries(funcs).map(([k,v])=>[k,v.id]))};
  return {status:"READY",mainContractAstId:root.id,baseContractIds:[...bases],
    transferPath,authorityPath,tokenApprovePath:approvals,
    globalApprovalPath,
    sourceSha256:src.sourceSha256,
    effectEvidence:{compilerWrites:stateChecks.length,
      semantics:"STRUCTURAL_ONLY_NEEDS_EVM_CONFIRMATION"}};
}
function reviewedWrapper(source,index){
  if(!PROFILES.includes(source.id)||source.kind!=="openzeppelin"||
     source.revision!=="4.9.6"||
     source.contract!==(source.id==="ERC-721"?"ERC721":"ERC1155")||
     source.sourceUnit!=="@openzeppelin/contracts/"+
      (source.id==="ERC-721"?"token/ERC721/ERC721.sol":"token/ERC1155/ERC1155.sol"))
    return null;
  const contractName="OECLReviewedOwnershipFixture"+index;
  const header=[
    "// SPDX-License-Identifier: MIT","pragma solidity ^0.8.20;",
    'import "'+source.sourceUnit+'";',
    "contract "+contractName+" is "+source.contract+" {"
  ];
  const body=source.id==="ERC-721"?[
    'constructor() ERC721("OECL laboratory NFT","OECLNFT") {}',
    "function oeclResearchMint(address to,uint256 id) external { _mint(to,id); }"
  ]:[
    'constructor() ERC1155("ipfs://oecl.example/{id}.json") {}',
    'function oeclResearchMint(address to,uint256 id,uint256 amount) external { _mint(to,id,amount,""); }'
  ];
  const solidity=[...header,...body,"}",""].join("\n");
  return {unit:"OECL_ReviewedOwnership_"+index+".sol",
    contractName,solidity,sourceSha256:hash(solidity),
    addsUnprotectedTestOnlyMint:true};
}
function derivePlan({graph,report,originalArtifacts,deployableArtifacts,wrappers,
  compilerVersion,dependencyIntegrity}){
  assert.equal(graph?.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(report.graphSha256,digest(graph),"AST_GRAPH_IDENTITY_MISMATCH");
  assert.equal(report.compilerVersion,compilerVersion,"COMPILER_VERSION_MISMATCH");
  assert.equal(report.dependencyIntegrity,dependencyIntegrity,"PACKAGE_INTEGRITY_MISMATCH");
  assert(/^0\.8\.26\+/.test(compilerVersion),"UNLOCKED_COMPILER");
  assert(typeof dependencyIntegrity==="string"&&dependencyIntegrity.startsWith("sha512-"));
  const selected=pinnedSource(report);
  assert([originalArtifacts,deployableArtifacts,wrappers].every(
    a=>Array.isArray(a)&&a.length===2));
  const approvedPair=selected.map(s=>s.id).sort().join("|")===
    [...PROFILES].sort().join("|");
  const capabilities=selected.map((src,i)=>{
    const methods=METHODS[src.id],original=originalArtifacts[i],
      compiled=deployableArtifacts[i],wrapper=wrappers[i];
    const ast=approvedPair?astCapabilities(graph,src):
      {status:"UNREVIEWED_OWNERSHIP_PROFILE"};
    const fixture=approvedPair?reviewedWrapper(src,i):null;
    const nativeSignatures=methods?Object.entries(methods).filter(
      ([k])=>!k.startsWith("oeclResearchMint")):[];
    const nativeValid=nativeSignatures.length>0&&nativeSignatures.every(
      ([sig,types])=>signatureSpec(original?.abi,sig,types));
    const fixtureValid=Boolean(fixture&&wrapper&&compiled&&
      wrapper.sourceSha256===fixture.sourceSha256&&
      wrapper.solidity===fixture.solidity&&
      wrapper.contractName===fixture.contractName&&
      Object.entries(methods).every(([sig,types])=>
        signatureSpec(compiled.abi,sig,types))&&
      typeof compiled.evm?.bytecode?.object==="string"&&
      /^[0-9a-f]+$/i.test(compiled.evm.bytecode.object)&&
      compiled.evm.bytecode.object.length>0&&
      compiled.evm.bytecode.object.length<=120000&&
      Object.keys(compiled.evm.bytecode.linkReferences||{}).length===0&&
      !(compiled.abi||[]).some(e=>e.type==="constructor"&&e.inputs?.length));
    const status=!approvedPair?"UNREVIEWED_OWNERSHIP_PROFILE":
      !nativeValid?"REQUIRED_NATIVE_ABI_MISSING":
      ast.status!=="READY"?ast.status:
      !fixtureValid?"REVIEWED_DEPLOYMENT_FIXTURE_NOT_READY":"READY";
    return {id:src.id,status,sourceAST:ast,
      nativeAbiSha256:digest(original?.abi??null),
      harnessSourceSha256:fixture?.sourceSha256??null,
      deployedAbiSha256:digest(compiled?.abi??null),
      creationBytecodeSha256:hash(compiled?.evm?.bytecode?.object??""),
      harnessAddsUnprotectedMint:true};
  });
  const ready=capabilities.every(c=>c.status==="READY");
  const cases=ready?selected.map(src=>({
    id:src.id,steps:SEQUENCES[src.id].map(x=>
      ({id:x[0],execution:x[1],caller:x[2],signature:x[3]}))
  })):[];
  const base={
    schemaVersion:"OECL_PINNED_OWNERSHIP_EVM_PROTOCOL_V1",
    scope:"REVIEWED_OZ_ERC721_ERC1155_INDEPENDENT_LOCAL_FIXTURES_ONLY",
    mechanism:"AST_ABI_GENERATED_OWNER_OPERATOR_APPROVAL_TRANSFER_CHALLENGES",
    selected,sourceGraphSha256:report.graphSha256,
    sourceReportSha256:digest(report),compilerVersion,dependencyIntegrity,
    capabilities,workflowStatus:ready?
      "REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED":
      "BLOCKED_NO_REVIEWED_OWNERSHIP_CAPABILITY",
    blockedReasons:ready?[]:capabilities.filter(c=>c.status!=="READY")
      .map(c=>c.id+":"+c.status),
    experimentalCases:cases,
    quantities:{tokenIds:[...QUANTITIES.tokenIds],mint1155:QUANTITIES.mint1155,
      send1155:QUANTITIES.send1155,overBalance:QUANTITIES.overBalance,
      attempt:QUANTITIES.attempt,zero:QUANTITIES.zero},
    hypotheses:ready?[
      {kind:"OWNER_AND_SINGLE_TOKEN_APPROVAL_721",
        prediction:"ERC721 token-specific spender approval permits transfer of token 101 and is cleared by that transfer.",
        falsifier:"A successful token-101 transfer without a prior right, or a token-101 approval remaining after transfer, falsifies the scoped expectation.",
        control:"Third-party transfer without permission and reuse of stale approval must revert without mining."
      },
      {kind:"GLOBAL_OPERATOR_AUTHORIZATION",
        prediction:"Approved global operators can transfer selected assets and revocation prohibits later unauthorized transfers.",
        falsifier:"A mined transfer by a revoked operator would falsify the authorization model in this fixture.",
        control:"An unauthorized caller must revert before approval; a zero-recipient destination must revert."
      },
      {kind:"QUANTITY_BOUNDARY_1155",
        prediction:"A successful 25-unit ERC1155 transfer preserves the sum of owner and recipient balances; zero transfer preserves both.",
        falsifier:"Any mined eligible transfer violating measured conservation falsifies the fixture-scoped rule.",
        control:"The operator's over-balance transfer attempt and a revoked operator must revert unmined."
      }
    ]:[],
    executionBudget:{maxDeployments:2,maxMinedTransactions:15,
      maxUnminedNegativeCalls:8,maxGasPerTransaction:3000000,
      maxSourceUnits:110,maxSourceBytes:2097152},
    evmExecuted:false,experimentDispatched:false,
    sourceOnly:true,scientificVerdict:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
    executionGate:"REVIEWED_GITHUB_ACTION_ONLY_LOCAL_HARDHAT_31337",
    limitations:[
      "This fixed permission/ownership test grammar is not arbitrary ERC721/1155 EVM generation.",
      "Generated fixtures expose intentionally unprotected research minting; this is not present in the original production contracts.",
      "The ERC721 and ERC1155 contracts are separate local deployments, not a cross-standard interoperability experiment.",
      "All negative checks are unmined eth_call simulations, not reverted mined transaction receipts.",
      "The independent reviewer recompiles and checks archived evidence but cannot authenticate the destroyed local EVM state to Ethereum mainnet."
    ]
  };
  return {...base,planSha256:digest(base)};
}
function verifyPlan(plan){
  try{
    if(!plan||plan.schemaVersion!=="OECL_PINNED_OWNERSHIP_EVM_PROTOCOL_V1"||
      plan.scope!=="REVIEWED_OZ_ERC721_ERC1155_INDEPENDENT_LOCAL_FIXTURES_ONLY"||
      plan.executionGate!=="REVIEWED_GITHUB_ACTION_ONLY_LOCAL_HARDHAT_31337"||
      plan.scientificVerdict!=="INCONCLUSIVE"||
      plan.compatibilityVerdict!=="NOT_EVALUATED"||
      plan.candidateAdmission!=="NOT_ADMITTED"||
      plan.evmExecuted!==false||plan.experimentDispatched!==false||
      plan.sourceOnly!==true||
      JSON.stringify(plan.quantities)!==JSON.stringify(QUANTITIES)||
      JSON.stringify(plan.executionBudget)!==JSON.stringify({
        maxDeployments:2,maxMinedTransactions:15,maxUnminedNegativeCalls:8,
        maxGasPerTransaction:3000000,maxSourceUnits:110,maxSourceBytes:2097152
      })||
      !sha(plan.sourceReportSha256)||!sha(plan.sourceGraphSha256)||
      !Array.isArray(plan.selected)||plan.selected.length!==2||
      !Array.isArray(plan.capabilities)||plan.capabilities.length!==2||
      !Array.isArray(plan.experimentalCases)||!Array.isArray(plan.blockedReasons))
      return false;
    const selected=plan.selected;
    selected.forEach((s,i)=>{
      const ref=registry.sources.find(x=>x.id===s.id);
      assert(ref);
      assert.equal(s.kind,ref.kind);
      assert.equal(s.revision,ref.kind==="github"?ref.revision:registry.openzeppelin.version);
      assert.equal(s.repository,ref.kind==="github"?ref.repository:registry.openzeppelin.package);
      assert.equal(s.sourceUnit,ref.kind==="openzeppelin"?
        "@openzeppelin/contracts/"+ref.file:"github/"+i+"/"+ref.file);
      assert.equal(s.contract,ref.contract);
      assert(sha(s.sourceSha256));
      const cap=plan.capabilities[i];
      assert.equal(cap.id,s.id);
      assert(sha(cap.nativeAbiSha256)&&sha(cap.deployedAbiSha256)&&
        sha(cap.creationBytecodeSha256));
      assert(cap.harnessSourceSha256===null||sha(cap.harnessSourceSha256));
      assert.equal(cap.harnessAddsUnprotectedMint,true);
    });
    const ready=plan.capabilities.every(c=>c.status==="READY");
    const pair=selected.map(s=>s.id).sort().join("|");
    if(ready){
      assert.equal(pair,[...PROFILES].sort().join("|"));
      assert.equal(plan.workflowStatus,"REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED");
      assert.deepEqual(plan.blockedReasons,[]);
      assert.equal(plan.experimentalCases.length,2);
      for(let i=0;i<2;i++){
        assert.equal(plan.capabilities[i].sourceAST?.status,"READY");
        assert(sha(plan.capabilities[i].harnessSourceSha256));
        assert.deepEqual(plan.experimentalCases[i],{
          id:selected[i].id,steps:SEQUENCES[selected[i].id].map(x=>({
            id:x[0],execution:x[1],caller:x[2],signature:x[3]
          }))
        });
      }
      assert.equal(plan.hypotheses.length,3);
    }else{
      assert.equal(plan.workflowStatus,"BLOCKED_NO_REVIEWED_OWNERSHIP_CAPABILITY");
      assert.equal(plan.experimentalCases.length,0);
      assert.equal(plan.hypotheses.length,0);
      assert.deepEqual(plan.blockedReasons,plan.capabilities
        .filter(c=>c.status!=="READY").map(c=>c.id+":"+c.status));
    }
    const {planSha256,...body}=plan;
    return digest(body)===planSha256;
  }catch{return false;}
}
function initialState(id){
  if(id==="ERC-721")return {ownerBalance:"0",recipientBalance:"0",
    operatorApproved:false,owners:{101:null,102:null,103:null},
    token101Approved:null};
  return {ownerBalance:"0",recipientBalance:"0",operatorApproved:false};
}
function stepEffect(id,step,state,actors){
  const next=structuredClone(state);
  if(id==="ERC-721"){
    if(step.startsWith("MINT_")){
      const tokenId=step.split("_")[1];
      next.owners[tokenId]=actors.owner;next.ownerBalance=
        (BigInt(next.ownerBalance)+1n).toString();
      if(tokenId==="101")next.token101Approved=ZERO;
    }
    if(step==="SINGLE_TOKEN_APPROVE")next.token101Approved=actors.spender;
    if(step==="TRANSFER_TOKEN_APPROVED"||step==="TRANSFER_GLOBAL_OPERATOR"){
      const tokenId=step==="TRANSFER_TOKEN_APPROVED"?"101":"102";
      next.owners[tokenId]=actors.recipient;
      next.ownerBalance=(BigInt(next.ownerBalance)-1n).toString();
      next.recipientBalance=(BigInt(next.recipientBalance)+1n).toString();
      if(tokenId==="101")next.token101Approved=ZERO;
    }
    if(step==="GLOBAL_APPROVE")next.operatorApproved=true;
    if(step==="GLOBAL_REVOKE")next.operatorApproved=false;
  }else{
    if(step==="MINT_100")
      next.ownerBalance=QUANTITIES.mint1155;
    if(step==="TRANSFER_25"){
      next.ownerBalance=(BigInt(next.ownerBalance)-25n).toString();
      next.recipientBalance=(BigInt(next.recipientBalance)+25n).toString();
    }
    if(step==="GLOBAL_APPROVE")next.operatorApproved=true;
    if(step==="GLOBAL_REVOKE")next.operatorApproved=false;
  }
  return next;
}
function expectedEvent(profile,step,actors){
  const nft=profile==="ERC-721";
  if(step.startsWith("MINT_"))return nft?
    {name:"Transfer",from:ZERO,to:actors.owner,
      tokenId:step.split("_")[1]}:
    {name:"TransferSingle",operator:actors.owner,from:ZERO,
      to:actors.owner,tokenId:"101",amount:"100"};
  if(step==="SINGLE_TOKEN_APPROVE")
    return {name:"Approval",from:actors.owner,to:actors.spender,tokenId:"101"};
  if(step==="GLOBAL_APPROVE"||step==="GLOBAL_REVOKE")
    return {name:"ApprovalForAll",from:actors.owner,to:actors.spender,
      approved:step==="GLOBAL_APPROVE"};
  if(step.startsWith("TRANSFER_")||step==="ZERO_TRANSFER"){
    if(nft)return {name:"Transfer",from:actors.owner,to:actors.recipient,
      tokenId:step==="TRANSFER_TOKEN_APPROVED"?"101":"102"};
    return {name:"TransferSingle",operator:actors.spender,
      from:actors.owner,to:actors.recipient,tokenId:"101",
      amount:step==="ZERO_TRANSFER"?"0":"25"};
  }
  return null;
}
function verifyWitness(plan,witness){
  if(!verifyPlan(plan)||
     plan.workflowStatus!=="REVIEWED_OWNERSHIP_PROTOCOL_PREREGISTERED")
    return false;
  try{
    assert.equal(witness.schemaVersion,"OECL_OWNERSHIP_LOCAL_EVM_WITNESS_V1");
    assert.equal(witness.planSha256,plan.planSha256);
    assert.deepEqual(witness.selected,plan.selected.map(s=>s.id));
    assert.equal(witness.chainId,31337);
    assert.equal(witness.providerScope,"EPHEMERAL_LOCAL_HARDHAT_BLOCK_RECHECKED");
    assert.equal(witness.evmExecuted,true);
    assert.equal(witness.scientificVerdict,"INCONCLUSIVE");
    assert.equal(witness.compatibilityVerdict,"NOT_EVALUATED");
    assert.equal(witness.candidateAdmission,"NOT_ADMITTED");
    assert.equal(witness.crossContractInteroperabilityProven,false);
    assert.equal(witness.originalContractsUnmodified,false);
    assert.equal(witness.fixtureHasUnsafeResearchMint,true);
    assert.equal(witness.isolationCheck?.firstFixtureUnchanged,true);
    assert.equal(witness.minedReceiptCount,15);
    assert.equal(witness.unminedNegativeCount,8);
    assert.equal(witness.outcome,"SCOPED_ROLE_BASED_TRANSFERS_OBSERVED");
    const actors=witness.actors;
    assert(actors&&Object.keys(actors).sort().join(",")==="attacker,owner,recipient,spender");
    assert(Object.values(actors).every(hex40)&&
      new Set(Object.values(actors).map(s=>s.toLowerCase())).size===4);
    assert(Array.isArray(witness.deployments)&&witness.deployments.length===2);
    assert(Array.isArray(witness.participants)&&witness.participants.length===2);
    const hashes=new Set(),addresses=new Set();
    function checkReceipt(tx,to,caller,method,event){
      assert(tx&&tx.transactionMined===true&&tx.status===1);
      assert(hex64(tx.txHash)&&hex64(tx.blockHash));
      assert(Number.isSafeInteger(tx.blockNumber)&&tx.blockNumber>=1);
      assert(/^[1-9][0-9]*$/.test(tx.gasUsed));
      assert(BigInt(tx.gasUsed)<=BigInt(plan.executionBudget.maxGasPerTransaction));
      assert.equal(tx.fromAddress.toLowerCase(),actors[caller.toLowerCase()].toLowerCase());
      if(to===null)assert.equal(tx.toAddress,null);
      else assert.equal(tx.toAddress.toLowerCase(),to.toLowerCase());
      assert(/^0x[a-f0-9]{8}$/i.test(tx.methodSelector));
      assert.equal(tx.method,method);
      assert.deepEqual(tx.event,event);
      assert(!hashes.has(tx.txHash.toLowerCase()));
      hashes.add(tx.txHash.toLowerCase());
    }
    for(let i=0;i<2;i++){
      const expected=plan.experimentalCases[i],dep=witness.deployments[i],
        part=witness.participants[i];
      assert.equal(dep.id,expected.id);
      assert(hex40(dep.contractAddress)&&hex64(dep.runtimeCodeKeccak256));
      assert(!addresses.has(dep.contractAddress.toLowerCase()));
      addresses.add(dep.contractAddress.toLowerCase());
      checkReceipt(dep.receipt,null,"OWNER","CONSTRUCTOR",null);
      assert.equal(part.id,expected.id);
      assert.equal(part.contractAddress.toLowerCase(),dep.contractAddress.toLowerCase());
      assert.deepEqual(part.cases.map(x=>x.id),expected.steps.map(x=>x.id));
      let before=initialState(expected.id),mine=0,negative=0;
      for(let j=0;j<expected.steps.length;j++){
        const step=expected.steps[j],observed=part.cases[j];
        assert.equal(observed.execution,step.execution);
        assert.equal(observed.caller,step.caller);
        assert.equal(observed.signature,step.signature);
        assert.deepEqual(observed.before,before);
        const after=stepEffect(expected.id,step.id,before,actors);
        assert.deepEqual(observed.after,after);
        if(step.execution==="MINED"){
          mine++;
          assert.equal(observed.simulation,null);
          assert.equal(observed.transactionMined,true);
          checkReceipt(observed.receipt,dep.contractAddress,
            step.caller,step.signature,expectedEvent(expected.id,step.id,actors));
        }else{
          negative++;
          assert.equal(observed.transactionMined,false);
          assert.equal(observed.simulation,"ETH_CALL_REVERT");
          assert.equal(observed.receipt,null);
          assert.equal(observed.statePreserved,true);
          assert.deepEqual(observed.after,observed.before);
        }
        before=after;
      }
      assert.equal(part.minedTransactions,mine);
      assert.equal(part.unminedNegativeControls,negative);
      assert.deepEqual(part.finalState,before);
    }
    assert.equal(hashes.size,15);
    return true;
  }catch{return false;}
}
module.exports={hash,digest,ZERO,PROFILES,QUANTITIES,METHODS,SEQUENCES,
  signatureSpec,pinnedSource,astCapabilities,reviewedWrapper,
  derivePlan,verifyPlan,initialState,stepEffect,expectedEvent,verifyWitness,hex40,hex64};