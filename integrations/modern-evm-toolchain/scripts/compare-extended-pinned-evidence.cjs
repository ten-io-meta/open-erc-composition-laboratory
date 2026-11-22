"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const UINT=x=>{assert.equal(typeof x,"string");assert.match(x,/^(0|[1-9][0-9]*)$/);return BigInt(x)};
const tx=x=>assert.match(x,/^0x[0-9a-f]{64}$/i);
const address=x=>assert.match(x,/^0x[0-9a-f]{40}$/i);
function compare(burnOld,burnNew,solventOld,solventNew,opcodeOld,opcodeNew,opcodeAttestation) {
  // Inherited ERC20Burnable implementation: compare signed-off state transitions
  // and negative controls, not transaction hashes of two independent EVMs.
  assert.equal(burnOld.schemaVersion,"OECL_PINNED_INHERITED_ERC20_BURN_AUTH_V1");
  assert.equal(burnNew.schemaVersion,"OECL_MODERN_INHERITED_BURN_PARITY_V1");
  assert.equal(burnOld.source.revision,B);
  assert.equal(burnNew.sourceRevision,B);
  assert.equal(burnOld.chainId,31337);
  assert.equal(burnNew.chainId,31337);
  assert.equal(burnOld.dependency.version,"4.9.6");
  assert.equal(burnNew.dependency.version,"4.9.6");
  assert.equal(burnOld.dependency.contract,"ERC20Burnable");
  assert.equal(burnNew.dependency.contract,"ERC20Burnable");
  assert.equal(UINT(burnOld.burnUnits),UINT(burnNew.burnUnits));
  for(const type of ["selfBurn","insufficientSelfBalance","unapprovedDelegatedBurn","approvedDelegatedBurn"]) {
    const h=burnOld[type],m=burnNew[type];
    for(const moment of ["before","after"]){
      for(const key of ["supply","aliceBalance","attackerBalance","attackerAllowance"])
        assert.equal(UINT(h[moment][key]),UINT(m[moment][key]),"Burn "+type+"/"+moment+"/"+key);
    }
    if(type==="selfBurn"||type==="approvedDelegatedBurn") {
      assert.equal(h.receiptStatus,1);
      assert.equal(m.receiptStatus,1);
      assert.equal(m.burnEvents,1);
      tx(h.transactionHash);tx(m.txHash);
      assert.ok(Number.isSafeInteger(h.zeroAddressBurnLogIndex));
      assert.ok(Number.isSafeInteger(m.logIndex));
      assert.equal(UINT(h.before.supply)-UINT(h.after.supply),UINT(burnOld.burnUnits));
    } else {
      assert.equal(h.reverted,true);
      assert.equal(m.reverted,true);
      assert.deepEqual(h.before,h.after);
      assert.deepEqual(m.before,m.after);
      assert.ok([0,null].includes(m.receiptStatus));
    }
  }
  assert.equal(burnOld.scientificPolarity,"INCONCLUSIVE");
  assert.equal(burnNew.scientificPolarity,"INCONCLUSIVE");
  assert.equal(burnNew.candidateAdmission,"NOT_ADMITTED");

  // Two independent holders: same observed state and monotone supply at each
  // checkpoint. Actor addresses are not compared across two fresh EVMs.
  assert.equal(solventOld.schemaVersion,"OECL_PINNED_MULTIHOLDER_SOLVENCY_V1");
  assert.equal(solventNew.schemaVersion,"OECL_MODERN_MULTIHOLDER_PARITY_V1");
  for(const r of [solventOld,solventNew]){
    assert.equal(r.chainId,31337);
    assert.equal(r.sourceRevisions.erc8060,A);
    assert.equal(r.sourceRevisions.erc8098,B);
    assert.equal(r.candidateAdmission,"NOT_ADMITTED");
    assert.equal(r.scientificPolarity,"INCONCLUSIVE");
    assert.equal(r.outcome,"TWO_INDEPENDENT_JOINT_BURNS_AFTER_MAX_ALLOWED_SURPLUS");
    assert.equal(r.holders.length,2);
    r.holders.forEach(address);
    assert.notEqual(r.holders[0].toLowerCase(),r.holders[1].toLowerCase());
    for(const hash of Object.values(r.tx))tx(hash);
    for(const stage of ["before","afterSurplus","afterFirst","afterSecond"]) {
      const state=r[stage];
      assert.ok(UINT(state.backingWei)>=UINT(state.obligationsWei));
      assert.ok(UINT(state.tokenSupply)<=100000000000000000000n);
    }
    assert.equal(r.before.nft1Owner,r.holders[0]);
    assert.equal(r.before.nft2Owner,r.holders[1]);
    assert.equal(r.afterFirst.nft1Owner,null);
    assert.equal(r.afterFirst.nft2Owner,r.holders[1]);
    assert.equal(r.afterSecond.nft1Owner,null);
    assert.equal(r.afterSecond.nft2Owner,null);
  }
  assert.equal(UINT(solventOld.surplusWithdrawnWei),UINT(solventNew.surplusWithdrawnWei));
  for(const stage of ["before","afterSurplus","afterFirst","afterSecond"]) {
    for(const key of ["backingWei","obligationsWei","tokenSupply"])
      assert.equal(UINT(solventOld[stage][key]),UINT(solventNew[stage][key]),"Holder "+stage+"/"+key);
  }
  // Opcode source-path comparison: historical source-map attribution is
  // independently validated; modern trace confirms *observable execution*
  // only. Do not fabricate Hardhat3 compiler source map anchors.
  assert.equal(opcodeOld.schemaVersion,"OECL_PINNED_NFT_OPCODE_EXECUTION_TRACE_V1");
  assert.equal(opcodeNew.schemaVersion,"OECL_MODERN_PINNED_NFT_OPCODE_EXECUTION_TRACE_V1");
  assert.equal(opcodeAttestation.schemaVersion,"OECL_NFT_COMPILER_SOURCE_EXECUTION_WITNESS_V1");
  for(const r of [opcodeOld,opcodeNew]) {
    assert.equal(r.chainId,31337);
    assert.equal(r.transactionStatus,1);
    tx(r.transactionHash);
    assert.equal(r.source.repository,"ten-io-meta/erc8060-native-eth-value");
    assert.equal(r.source.revision,A);
    assert.equal(r.candidateAdmission,"NOT_ADMITTED");
    assert.equal(r.scientificPolarity,"INCONCLUSIVE");
    for(const k of ["nft","token","joint"])address(r.contractAddresses[k]);
    for(const x of r.instructions){
      assert.ok(Number.isSafeInteger(x.pc)&&x.pc>=0);
      assert.ok(Number.isSafeInteger(x.depth)&&x.depth>=1);
      assert.match(x.op,/^[A-Z0-9_]+$/);
      if(["CALL","STATICCALL","DELEGATECALL","CALLCODE"].includes(x.op))
        assert.match(x.target,/^[a-f0-9]{40}$/);
    }
    assert.ok(r.instructions.length>100);
    assert.ok(r.instructions.some(x=>x.op==="SSTORE"));
    const calledNft=r.instructions.some(x=>x.target===r.contractAddresses.nft.slice(2).toLowerCase());
    assert.ok(calledNft,"Expected observed nested call to NFT participant");
  }
  assert.equal(opcodeOld.source.sha256,opcodeNew.source.sha256);
  assert.equal(opcodeAttestation.sourceSha256,opcodeOld.source.sha256);
  assert.equal(opcodeAttestation.sourceRevisionA,A);
  assert.equal(opcodeAttestation.sourceRevisionB,B);
  assert.equal(opcodeAttestation.scientificPolarity,"INCONCLUSIVE");
  assert.equal(opcodeAttestation.candidateAdmission,"NOT_ADMITTED");
  assert.ok(opcodeAttestation.sourceMappedAnchors?.length>0);
  for(const key of ["nftLiabilityBeforeWei","nftLiabilityAfterWei","fungibleSupplyBeforeUnits","fungibleSupplyAfterUnits"]){
    assert.equal(UINT(opcodeOld.measured[key]),UINT(opcodeNew.measured[key]),"Opcode observed "+key);
  }
  const historicalCounts={
    opcodes:opcodeOld.instructions.length,
    sstores:opcodeOld.instructions.filter(x=>x.op==="SSTORE").length
  };
  const modernCounts={
    opcodes:opcodeNew.instructions.length,
    sstores:opcodeNew.instructions.filter(x=>x.op==="SSTORE").length
  };
  return {
    schemaVersion:"OECL_EXTENDED_CROSS_RUNTIME_PARITY_V1",
    result:"BOUNDED_OBSERVATIONAL_MATCH",
    migratedFamilyChecks:[
      "INHERITED_BURN_AUTHORIZATION",
      "MULTIHOLDER_SURPLUS_SOLVENCY",
      "NFT_EXECUTED_OPCODE_OBSERVATION"
    ],
    historicalSourceMappedAnchors:opcodeAttestation.sourceMappedAnchors.length,
    historicalTrace:historicalCounts,
    modernTrace:modernCounts,
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "Different runtime receipts, transaction hashes and gas budgets are not compared literally.",
      "Modern opcode source-map attestation and bytecode equivalence are not claimed; only the historically compiled source is attributed to precise EVM program counters.",
      "This is only three pinned experiment families; independent ERC20Burnable matrix, generic source lab, native recipe and routed/credential cases need separate migration gates.",
      "A passing observation does not license protocol scientific admission, external deployment or replacement of historical immutable evidence."
    ]
  };
}
if(require.main===module){
  const files=process.argv.slice(2);
  assert.equal(files.length,7,"Usage: compare-extended-pinned-evidence.cjs old-burn modern-burn old-multiholder modern-multiholder old-opcode modern-opcode old-opcode-validated");
  const raw=files.map(p=>fs.readFileSync(p));
  const report=compare(...raw.map(x=>JSON.parse(x)));
  report.inputSha256=Object.fromEntries(files.map((f,i)=>[f.split("/").at(-1),crypto.createHash("sha256").update(raw[i]).digest("hex")]));
  const dest=process.env.OECL_EXTENDED_PARITY_PATH||"extended-parity.json";
  fs.writeFileSync(dest,JSON.stringify(report,null,2)+"\n");
  console.log("OECL_EXTENDED_PARITY_PASS:"+JSON.stringify({result:report.result,checks:report.migratedFamilyChecks,
    historicalTrace:report.historicalTrace,modernTrace:report.modernTrace,scientificVerdict:report.scientificVerdict}));
}
module.exports={compare};
