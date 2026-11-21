"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const digest=s=>crypto.createHash("sha256").update(s).digest("hex");
const tx=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const addr=x=>typeof x==="string"&&/^0x[0-9a-f]{40}$/i.test(x);
const uint=x=>typeof x==="string"&&/^(0|[1-9][0-9]*)$/.test(x);
function sourceMapper(build,unit,name){
  const compiled=build.output?.contracts?.[unit]?.[name]?.evm?.deployedBytecode;
  assert.ok(compiled?.object&&typeof compiled.sourceMap==="string",
    "Missing compiler deployed-bytecode source map");
  const clean=compiled.object.replace(/^0x/,"");
  assert.match(clean,/^[0-9a-f]+$/i,"Unresolved library reference in source-map bytecode");
  const bytes=Buffer.from(clean,"hex");
  const entries=compiled.sourceMap.split(";");
  const positions=new Map();
  const current=[0,0,-1,"",0];
  let count=0;
  for(let pc=0;pc<bytes.length;){
    const fields=(entries[count]||"").split(":");
    for(let j=0;j<fields.length&&j<5;j++){
      if(fields[j]!=="")current[j]=j===3?fields[j]:Number(fields[j]);
    }
    // Solidity's deployment bytecode ends in CBOR metadata. The compiler
    // source map covers executable opcodes, not the trailing data bytes.
    if(count<entries.length)
      positions.set(pc,{offset:current[0],size:current[1],fileId:current[2]});
    const opcode=bytes[pc];
    pc+=1+(opcode>=0x60&&opcode<=0x7f?opcode-0x5f:0);
    count++;
  }
  assert.ok(count>=100&&entries.length>=100&&count>=entries.length-2,
    "Compiler executable source map extends beyond decoded bytecode: "+JSON.stringify({
      decodedInstructions:count,sourceMapEntries:entries.length}));
  return positions;
}
function validate(a,b,report){
  const git=p=>execFileSync("git",["-C",p,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  assert.equal(git(a),A);assert.equal(git(b),B);
  assert.equal(report.schemaVersion,"OECL_PINNED_NFT_OPCODE_EXECUTION_TRACE_V1");
  assert.equal(report.origin,"HARDHAT_DEBUG_TRACE_TRANSACTION_OPCODE_SEQUENCE");
  assert.equal(report.chainId,31337);
  assert.equal(report.transactionStatus,1);
  assert.ok(tx(report.transactionHash));
  assert.equal(report.scientificPolarity,"INCONCLUSIVE");
  assert.equal(report.candidateAdmission,"NOT_ADMITTED");
  assert.equal(report.source?.repository,"ten-io-meta/erc8060-native-eth-value");
  assert.equal(report.source.revision,A);
  assert.equal(report.source.file,"contracts/ERC8060Reference.sol");
  const original=fs.readFileSync(path.join(a,report.source.file));
  assert.equal(report.source.sha256,digest(original));
  assert.equal(report.testSourceSha256,digest(fs.readFileSync(path.join(__dirname,
    "test/OECLNftOpcodePath.test.js"))));
  const origText=original.toString("utf8");
  const readValue=(key)=>{assert.ok(uint(report.measured?.[key]),"Missing "+key);
    return BigInt(report.measured[key]);};
  const before=readValue("nftLiabilityBeforeWei");
  const after=readValue("nftLiabilityAfterWei");
  const supplyBefore=readValue("fungibleSupplyBeforeUnits");
  const supplyAfter=readValue("fungibleSupplyAfterUnits");
  assert.equal(before-after,100000000000000000n,"NFT liability decrease differs from pinned redeem value");
  assert.equal(supplyBefore-supplyAfter,1000000000000000000n,"ERC20 burn delta mismatch");
  const unit=report.source.file;
  const buildDir=path.join(a,"artifacts/build-info");
  const builds=fs.readdirSync(buildDir).filter(x=>x.endsWith(".json")).map(file=>{
    const raw=fs.readFileSync(path.join(buildDir,file));
    const build=JSON.parse(raw);
    if(build.input?.sources?.[unit]?.content!==origText||
       !build.output?.contracts?.[unit]?.ERC8060Reference?.evm?.deployedBytecode?.sourceMap)
      return null;
    return {build,file,sha:digest(raw)};
  }).filter(Boolean);
  assert.equal(builds.length,1,"Exactly one pinned compiler build-info expected");
  const {build,sha:buildInfoSha256}=builds[0];
  const mapper=sourceMapper(build,unit,"ERC8060Reference");
  const unitId=build.output.sources[unit].id;
  const guardUnit="@openzeppelin/contracts/security/ReentrancyGuard.sol";
  const guardId=build.output.sources[guardUnit]?.id;
  assert.ok(Number.isInteger(unitId)&&Number.isInteger(guardId),
    "Missing inherited modifier source in pinned compiler AST");
  const ownerNeedle='require(ownerOf(tokenId) == msg.sender';
  const debitNeedle='totalRedeemableValue -= redeemable;';
  const deleteNeedle='delete _redeemableValue[tokenId];';
  const burnStart=origText.indexOf("function _burn(uint256 tokenId)");
  const burnEnd=origText.indexOf("super._burn(tokenId);",burnStart);
  assert.ok(burnStart>=0&&burnEnd>burnStart&&origText.indexOf(debitNeedle,burnStart)>burnStart);
  const ownerStart=origText.indexOf(ownerNeedle);
  const debitStart=origText.indexOf(debitNeedle);
  const deletionStart=origText.indexOf(deleteNeedle);
  assert.ok(ownerStart>=0&&debitStart>=0&&deletionStart>=0);
  const guardText=build.input.sources[guardUnit]?.content;
  assert.equal(typeof guardText,"string");
  const enter=guardText.indexOf("_status = _ENTERED;");
  // The same source statement exists in ReentrancyGuard's constructor and
  // _nonReentrantAfter(). Runtime execution must resolve to the latter.
  const afterMarker=guardText.indexOf("function _nonReentrantAfter()");
  assert.ok(afterMarker>=0,"No inherited modifier exit implementation");
  const leave=guardText.indexOf("_status = _NOT_ENTERED;",afterMarker);
  assert.ok(enter>=0&&leave>=0);
  const overlaps=(mapping,start,len)=>
    mapping.offset < start+len && mapping.offset+mapping.size>start;
  const instructions=report.instructions;
  assert.ok(Array.isArray(instructions)&&instructions.length>100);
  const root=report.contractAddresses?.joint?.toLowerCase();
  const nft=report.contractAddresses?.nft?.toLowerCase();
  const token=report.contractAddresses?.token?.toLowerCase();
  assert.ok(addr(root)&&addr(nft)&&addr(token));
  assert.equal(new Set([root,nft,token]).size,3);
  const frames=new Map([[1,root]]);
  const anchors=[];
  let nftOpcodes=0,nftSstores=0,nftCalls=0;
  const rejectedOps=[];
  for(let i=0;i<instructions.length;i++){
    const ins=instructions[i];
    assert.ok(Number.isSafeInteger(ins.pc)&&ins.pc>=0&&
      Number.isSafeInteger(ins.depth)&&ins.depth>=1&&
      typeof ins.op==="string"&&/^[A-Z0-9_]+$/.test(ins.op),"Malformed opcode trace");
    if(i>0){
      const prior=instructions[i-1];
      if(ins.depth>prior.depth){
        assert.equal(ins.depth,prior.depth+1,"Unsupported frame jump");
        assert.ok(["CALL","STATICCALL","DELEGATECALL","CALLCODE"].includes(prior.op),
          "Unexpected depth increase without CALL");
        assert.match(prior.target||"",/^[0-9a-f]{40}$/i);
        frames.set(ins.depth,"0x"+prior.target.toLowerCase());
      }
      if(ins.depth<prior.depth)for(const depth of [...frames.keys()])
        if(depth>ins.depth)frames.delete(depth);
    }
    assert.ok(frames.has(ins.depth),"No source address for opcode frame");
    if(["CALL","STATICCALL","DELEGATECALL","CALLCODE"].includes(ins.op)){
      assert.match(ins.target||"",/^[0-9a-f]{40}$/i,
        "CALL target not preserved from local EVM stack");
    } else assert.equal(ins.target,undefined,"Unexpected forged non-CALL address");
    if(frames.get(ins.depth)!==nft)continue;
    nftOpcodes++;
    const mapped=mapper.get(ins.pc);
    assert.ok(mapped,"Executed NFT program counter not present in compiler bytecode");
    if(ins.op==="SSTORE")nftSstores++;
    if(["CALL","STATICCALL"].includes(ins.op))nftCalls++;
    const record=(kind,sourceFileId,start,len)=>{
      if(mapped.fileId===sourceFileId&&overlaps(mapped,start,len))
        anchors.push({kind,pc:ins.pc,depth:ins.depth,op:ins.op,
          fileId:mapped.fileId,sourceStart:mapped.offset,sourceLength:mapped.size});
    };
    if(ins.op==="SSTORE"){
      record("NFT_LIABILITY_SSTORE",unitId,debitStart,debitNeedle.length);
      record("NFT_REDEEMABLE_DELETE_SSTORE",unitId,deletionStart,deleteNeedle.length);
      record("NFT_REENTRANCY_ENTER_SSTORE",guardId,enter,"_status = _ENTERED;".length);
      record("NFT_REENTRANCY_EXIT_SSTORE",guardId,leave,"_status = _NOT_ENTERED;".length);
    } else record("NFT_OWNER_GUARD_EXECUTED_SOURCE",unitId,ownerStart,ownerNeedle.length);
  }
  assert.ok(nftOpcodes>100&&nftSstores>=3&&nftCalls>=1,
    "Too few resolved NFT opcodes; check caller frames and trace");
  const count=kind=>anchors.filter(x=>x.kind===kind).length;
  assert.ok(count("NFT_LIABILITY_SSTORE")>=1,
    "No EVM SSTORE mapped to NFT liability debit; samples: "+JSON.stringify(anchors.slice(0,12)));
  assert.ok(count("NFT_REENTRANCY_ENTER_SSTORE")>=1,
    "No traced modifier entry SSTORE");
  assert.ok(count("NFT_REENTRANCY_EXIT_SSTORE")>=1,
    "No traced modifier exit SSTORE");
  assert.ok(count("NFT_OWNER_GUARD_EXECUTED_SOURCE")>=1,
    "No opcode mapped to NFT owner guard");
  return {
    schemaVersion:"OECL_NFT_COMPILER_SOURCE_EXECUTION_WITNESS_V1",
    sourceRevisionA:A,sourceRevisionB:B,
    sourceSha256:digest(original),compilerBuildInfoSha256:buildInfoSha256,
    compilerVersion:build.solcVersion,
    jointTransactionHash:report.transactionHash,
    sourceMappedAnchors:anchors,
    observed:{nftOpcodes,nftSstores,nftCalls,
      nftLiabilityDebitSstore:count("NFT_LIABILITY_SSTORE"),
      modifierEntrySstore:count("NFT_REENTRANCY_ENTER_SSTORE"),
      modifierExitSstore:count("NFT_REENTRANCY_EXIT_SSTORE"),
      ownerGuardOpcodes:count("NFT_OWNER_GUARD_EXECUTED_SOURCE")},
    scientificPolarity:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "Compiler-anchored opcodes observed in one pinned local EVM execution, not proof of all paths",
      "Internal _burn label is inferred from compiler source location and state debit, not from a symbolic EVM call",
      "Trace JSON and compiler build-info are trusted local CI artifacts, not independently replayed chain consensus evidence"
    ]
  };
}
function main(a,b,tracePath){
  const bytes=fs.readFileSync(tracePath);
  const report=JSON.parse(bytes);
  const checked=validate(a,b,report);
  checked.rawTraceSha256=digest(bytes);
  const controls=[
    ["nft_wrong_source_sha",x=>{x.source.sha256="0".repeat(64);}],
    ["nft_wrong_transaction_hash",x=>{x.transactionHash="NOT_A_TRANSACTION";}],
    ["nft_wrong_redeemed_amount",x=>{x.measured.nftLiabilityAfterWei=x.measured.nftLiabilityBeforeWei;}],
    ["nft_wrong_fungible_delta",x=>{x.measured.fungibleSupplyAfterUnits=x.measured.fungibleSupplyBeforeUnits;}],
    ["nft_removed_sstores",x=>{x.instructions=x.instructions.filter(s=>s.op!=="SSTORE");}],
    ["nft_broken_call_target",x=>{const ins=x.instructions.find(s=>s.depth===1&&
      ["CALL","STATICCALL"].includes(s.op));if(ins)ins.target="0".repeat(40);}],
    ["nft_bad_trace_depth",x=>{x.instructions[1].depth=99;}],
    ["nft_promoted_claim",x=>{x.scientificPolarity="SUPPORTS";}]
  ];
  for(const [name,mutate] of controls){
    const altered=structuredClone(report);mutate(altered);
    assert.throws(()=>validate(a,b,altered),undefined,
      "Tampered opcode observation accepted: "+name);
  }
  checked.adversarialControls=controls.map(x=>x[0]);
  fs.writeFileSync(tracePath.replace(/\.json$/,".validated.json"),JSON.stringify(checked,null,2)+"\n");
  console.log("OECL_NFT_COMPILER_OPCODE_WITNESS:"+JSON.stringify({
    anchors:checked.sourceMappedAnchors.length,observed:checked.observed,
    adversarialRejections:controls.length,admission:checked.candidateAdmission,
    scientificPolarity:checked.scientificPolarity
  }));
}
if(require.main===module)main(...process.argv.slice(2));
module.exports={validate};
