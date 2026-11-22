"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const OZ="dc44c9f1a4c3b10af99492eed84f83ed244203f6";
const expected=[
  "AUTHORIZED_AND_FUNDED","UNAUTHORIZED_NFT_OWNER","NO_NFT_APPROVAL",
  "NO_ERC20_ALLOWANCE","INSUFFICIENT_TOKEN_BALANCE",
  "INJECTED_SECOND_LEG_BURN_FAILURE","PAYOUT_RECEIVER_REJECTS",
  "REENTRANT_RECEIVER_REJECTED","SINGLE_BURN_BEFORE_REPLAY","DOUBLE_REDEMPTION_REJECTED"
];
const positive=new Set(["AUTHORIZED_AND_FUNDED","REENTRANT_RECEIVER_REJECTED","SINGLE_BURN_BEFORE_REPLAY"]);
const uint=x=>{assert.equal(typeof x,"string");assert.match(x,/^(0|[1-9][0-9]*)$/);return BigInt(x)};
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const rev=root=>execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
function compare(old,modern,root8060,rootOZ,modernRoot){
  assert.equal(rev(root8060),A);
  assert.equal(rev(rootOZ),OZ);
  assert.equal(old.schemaVersion,"OECL_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1");
  assert.equal(modern.schemaVersion,"OECL_MODERN_8060_ERC20_BURNABLE_EVM_EVIDENCE_V1");
  assert.equal(old.localScope,"PINNED_SOURCE_INDEPENDENT_HARDHAT_EVM");
  assert.equal(modern.localScope,"PINNED_SOURCE_INDEPENDENT_HARDHAT3_EVM");
  for(const x of [old,modern]){
    assert.equal(x.chainId,31337);
    assert.equal(x.scientificVerdict,"INCONCLUSIVE");
    assert.equal(x.candidateAdmission,"NOT_ADMITTED");
    assert.equal(x.nativeScientificAdmissionPerformed,false);
    assert.equal(x.universalCompatibilityEstablished,false);
    assert.equal(x.cases.length,10);
    assert.equal(x.coverage.positive,3);
    assert.equal(x.coverage.negative,7);
    assert.equal(x.coverage.allNegativeRollbacksVerified,true);
    assert.deepEqual(x.cases.map(c=>c.scenario),expected);
  }
  const rawA=fs.readFileSync(path.join(root8060,"contracts/ERC8060Reference.sol"));
  const rawBurn=fs.readFileSync(path.join(rootOZ,"contracts/token/ERC20/extensions/ERC20Burnable.sol"));
  assert.equal(old.sourceChain.participants[0].revision,A);
  assert.equal(modern.sourceChain.participants[0].revision,A);
  assert.equal(modern.sourceChain.participants[1].revision,OZ);
  assert.equal(old.sourceChain.participants[1].version,"4.9.6");
  assert.equal(modern.sourceChain.participants[1].version,"4.9.6");
  assert.equal(old.sourceChain.participants[0].sha256,sha(rawA));
  assert.equal(modern.sourceChain.participants[0].sha256,sha(rawA));
  assert.equal(old.sourceChain.participants[1].sha256,sha(rawBurn));
  assert.equal(modern.sourceChain.participants[1].sha256,sha(rawBurn));
  assert.equal(sha(fs.readFileSync(path.join(modernRoot,"contracts/ERC8060Reference.sol"))),sha(rawA));
  assert.equal(sha(fs.readFileSync(path.join(modernRoot,"node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol"))),sha(rawBurn));
  for(const file of ["OECLBurnableFixture.sol","OECL8060BurnableCoordinator.sol","OECLAdversarialBurnableCaller.sol"]){
    const id=file==="OECLBurnableFixture.sol"?"fixture":file==="OECL8060BurnableCoordinator.sol"?"coordinator":"caller";
    assert.equal(old.sourceChain.fixtures[id],modern.sourceChain.fixtures[id]);
    assert.equal(modern.sourceChain.fixtures[id],sha(fs.readFileSync(path.join(modernRoot,"contracts",file))));
  }
  assert.equal(modern.sourceChain.modernToolchainSha256,sha(fs.readFileSync(path.join(modernRoot,"package-lock.json"))));
  const cases=[];
  for(let i=0;i<expected.length;i++){
    const h=old.cases[i],m=modern.cases[i],name=expected[i],pass=positive.has(name);
    assert.equal(h.scenario,name);
    assert.equal(m.scenario,name);
    assert.equal(h.expected,m.expected,"Scenario expected outcome");
    assert.deepEqual(h.sourcePair,["ERC-8060","ERC-20-BURNABLE"]);
    assert.deepEqual(m.sourcePair,h.sourcePair);
    assert.equal(h.receiptStatus,pass?1:0);
    assert.equal(m.receiptStatus,pass?1:0);
    for(const x of [h,m]){
      assert.match(x.transactionHash,/^0x[a-f0-9]{64}$/i);
      assert.ok(Number.isSafeInteger(x.blockNumber)&&x.blockNumber>0);
      assert.match(x.gasUsed,/^[0-9]+$/);
      assert.equal(x.chainId,31337);
      assert.equal(x.observations.sourceOnly,false);
      assert.equal(x.observations.experimentLocalEvm,true);
      assert.ok(Object.values(x.runtimeCodeHashes).length===3);
      for(const hash of Object.values(x.runtimeCodeHashes))assert.match(hash,/^0x[a-f0-9]{64}$/i);
      assert.ok(Object.values(x.contractAddresses).length===3);
      for(const addr of Object.values(x.contractAddresses))assert.match(addr,/^0x[a-f0-9]{40}$/i);
      for(const key of ["nftObligationDeltaWei","tokenSupplyDeltaBaseUnits","nftBackingDeltaWei"])
        uint(x.observations[key]);
      if(pass){
        assert.equal(uint(x.observations.nftObligationDeltaWei),100000000000000000n);
        assert.equal(uint(x.observations.tokenSupplyDeltaBaseUnits),1000000000000000000n);
        assert.equal(uint(x.observations.nftBackingDeltaWei),100000000000000000n);
      }else{
        assert.equal(x.rollbackObserved,true);
        assert.deepEqual(x.before,x.after,"Rollback state changed: "+name);
        assert.equal(uint(x.observations.nftObligationDeltaWei),0n);
        assert.equal(uint(x.observations.tokenSupplyDeltaBaseUnits),0n);
        assert.equal(uint(x.observations.nftBackingDeltaWei),0n);
      }
    }
    for(const key of ["nftObligationDeltaWei","tokenSupplyDeltaBaseUnits","nftBackingDeltaWei"])
      assert.equal(uint(h.observations[key]),uint(m.observations[key]),"Different delta for "+name+"/"+key);
    // Compare relevant numeric state by name when both snapshots contain that
    // field. Different ephemeral contract addresses and receipt gas are never equated.
    let snapshotNumericFields=0;
    for(const stage of ["before","after"]){
      for(const k of ["nftValueWei","obligationWei","backingWei","surplusWei",
        "tokenTotalSupply","holderTokenBalance","coordinatorTokenBalance",
        "coordinatorEthBalance","holderAllowance","aliceTokenBalance",
        "reserve","supply","backing","balance","obligations"]){
        if(h[stage][k]===undefined||m[stage][k]===undefined||h[stage][k]===null||m[stage][k]===null)
          continue;
        assert.equal(uint(h[stage][k]),uint(m[stage][k]),
          "Snapshot diverges: "+name+"/"+stage+"/"+k);
        snapshotNumericFields++;
      }
      if(h[stage].nftOwner!==undefined&&m[stage].nftOwner!==undefined)
        assert.equal(h[stage].nftOwner===null,m[stage].nftOwner===null);
    }
    assert.ok(snapshotNumericFields>=4,"Unanchored numeric comparison: "+name);
    if(["AUTHORIZED_AND_FUNDED","SINGLE_BURN_BEFORE_REPLAY"].includes(name)){
      for(const x of [h,m]){
        assert.equal(x.burnEvidence?.sameTransaction,true);
        assert.ok(Number.isSafeInteger(x.burnEvidence.erc721BurnLogIndex));
        assert.ok(Number.isSafeInteger(x.burnEvidence.erc20BurnLogIndex));
        assert.equal(uint(x.burnEvidence.tokenUnits),1000000000000000000n);
        assert.equal(uint(x.observations.ownerReceivedWeiAfterGas),100000000000000000n);
      }
    }
    if(name==="REENTRANT_RECEIVER_REJECTED"){
      assert.equal(h.nestedRejected,true);
      assert.equal(m.nestedRejected,true);
    }
    cases.push({scenario:name,receiptStatus:m.receiptStatus,
      sharedNumericStateFieldsMatched:snapshotNumericFields,
      sourceAndEconomicDeltasMatched:true,
      newRunReceipt:m.transactionHash});
  }
  return {
    schemaVersion:"OECL_INDEPENDENT_BURNABLE_MODERN_PARITY_V1",
    result:"BOUNDED_OBSERVATIONAL_MATCH",
    participantARevision:A,openzeppelinCommit:OZ,openzeppelinVersion:"4.9.6",
    caseCount:cases.length,positiveCount:3,negativeCount:7,
    cases,scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    caveats:[
      "Both runs use independent local Hardhat EVMs with potentially different receipt hashes and gas.",
      "The OpenZeppelin ERC20Burnable base is abstract; deployed ERC20 is OECL test fixture, not a separate ERC-8098 reference.",
      "Source-only hypotheses, constraints and native property observations are verified independently; a positive EVM test is not scientific candidate admission.",
      "Further generic AST, other protocol combinations, routed tests and credential-gated checks are not covered by this parity comparison."
    ]
  };
}
if(require.main===module){
  const [oldFile,modernFile,root8060,rootOZ,modernRoot,outFile]=process.argv.slice(2);
  assert.ok(oldFile&&modernFile&&root8060&&rootOZ&&modernRoot&&outFile);
  const before=JSON.parse(fs.readFileSync(oldFile));
  const after=JSON.parse(fs.readFileSync(modernFile));
  const output=compare(before,after,root8060,rootOZ,modernRoot);
  output.sourceEvidenceSha256={
    historical:sha(fs.readFileSync(oldFile)),modern:sha(fs.readFileSync(modernFile))
  };
  fs.writeFileSync(outFile,JSON.stringify(output,null,2)+"\n");
  console.log("OECL_INDEPENDENT_BURNABLE_MODERN_PARITY_PASS:"+JSON.stringify({
    cases:output.caseCount,positive:output.positiveCount,negative:output.negativeCount,
    result:output.result,scientificVerdict:output.scientificVerdict
  }));
}
module.exports={compare};
