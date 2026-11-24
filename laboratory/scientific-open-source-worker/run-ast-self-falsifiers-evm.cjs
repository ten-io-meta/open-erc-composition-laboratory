"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const txHex=x=>typeof x==="string"&&/^0x[0-9a-f]{64}$/i.test(x);
const amountRe=/^(?:0|[1-9][0-9]*)$/;

function loadSelfFalsifiers(folder,originalRegistration){
  const filename=path.join(folder,"ast-self-falsification-plan.json");
  const bytes=fs.readFileSync(filename);
  const plan=JSON.parse(bytes);
  assert.equal(plan.schemaVersion,"OECL_AST_SELF_FALSIFICATION_PLAN_V1");
  assert.equal(plan.generationMethod,"RULE_BASED_BOUNDARY_CHALLENGE_FROM_COMPILER_AST");
  assert.equal(plan.generatedBeforeEvmDeployment,true);
  assert.equal(plan.emulatedEvmOrReceipt,false);
  assert.equal(plan.sourcePlanSha256,originalRegistration.planSha256);
  assert.equal(plan.sourceGraphSha256,originalRegistration.plan.provenance.graphSha256);
  assert.equal(plan.experimentId,originalRegistration.plan.experimentId);
  assert.equal(plan.originHypothesisId,originalRegistration.plan.originHypothesisId);
  assert.equal(plan.challenges?.length,4);
  const predictions=originalRegistration.plan.predictions;
  const allowed=["BURN_UNDERLYING","REDEEM_SHARES"];
  assert.deepEqual(predictions.map(p=>p.operation),allowed);
  for(const p of predictions){
    const cases=plan.challenges.filter(c=>c.originalScopedPredictionId===p.predictionId);
    assert.equal(cases.length,2);
    assert.deepEqual(cases.map(c=>c.challengeKind),
      ["ZERO_AMOUNT_BOUNDARY","ABOVE_OWNED_BALANCE"]);
    for(const c of cases){
      assert.equal(c.originHypothesisId,p.parentAstHypothesisId);
      assert.equal(c.entrypoint,p.publicEntrypoint);
      assert.equal(c.sourceSha256,p.stateSourceSha256);
      assert.equal(c.sourceRevision,p.sourceRevision);
      assert.deepEqual(c.astCallPath,p.callPath);
      assert.equal(c.operation,p.operation);
      assert.equal(c.participantSide,p.participantSide);
      assert.equal(c.status,"CHALLENGE_PROPOSED_NOT_EVM_TESTED");
      assert(["ZERO","OWNED_TOKEN_BALANCE_PLUS_ONE"].includes(c.quantityRule));
    }
  }
  return {filename,plan,planSha256:sha256(bytes)};
}

/**
 * Separates an overgeneralized source claim from the scoped positive route.
 * Actual EVM effects are recorded before applying any scientific label.
 */
async function runSelfFalsifiers({
  registration,originalRegistration,provider,ethers,asset,vault,
  owner,afterDeposit,snap,output
}){
  const {plan,planSha256,filename}=registration;
  const chain=await provider.getNetwork();
  assert.equal(Number(chain.chainId),31337,"Unsafe non-local counterfactual chain");
  assert.equal(plan.sourcePlanSha256,originalRegistration.planSha256);
  const cases=[];
  for(const test of plan.challenges){
    const isAsset=test.operation==="BURN_UNDERLYING";
    const contract=isAsset?asset:vault;
    const balance=isAsset?await asset.balanceOf(owner.address):
      await vault.balanceOf(owner.address);
    const amount=test.challengeKind==="ZERO_AMOUNT_BOUNDARY"?
      ethers.constants.Zero:balance.add(1);
    const args=isAsset?[amount]:[amount,owner.address,owner.address];
    const method=isAsset?"burn(uint256)":"redeem(uint256,address,address)";
    const before=await snap();
    let result;
    if(test.challengeKind==="ZERO_AMOUNT_BOUNDARY"){
      let receipt=null,revertReason=null;
      try{
        const tx=await contract[isAsset?"burn":"redeem"](...args);
        receipt=await tx.wait(1);
      }catch(error){
        revertReason=String(error?.code||error?.reason||"CALL_REVERTED").slice(0,100);
      }
      const after=await snap();
      const numericBefore=BigInt(isAsset?before.underlyingSupply:before.vaultShareSupply);
      const numericAfter=BigInt(isAsset?after.underlyingSupply:after.vaultShareSupply);
      const unchanged=JSON.stringify(before)===JSON.stringify(after);
      let witness=null;
      if(receipt){
        assert.equal(receipt.status,1);
        assert(txHex(receipt.transactionHash));
        const fetched=await provider.getTransactionReceipt(receipt.transactionHash);
        assert(fetched&&fetched.status===1);
        assert.equal(fetched.blockHash,receipt.blockHash);
        assert.equal(fetched.blockNumber,receipt.blockNumber);
        const block=await provider.getBlock(fetched.blockNumber);
        assert(block&&block.hash.toLowerCase()===receipt.blockHash.toLowerCase()&&
          block.transactions.some(h=>h.toLowerCase()===receipt.transactionHash.toLowerCase()));
        const tx=await provider.getTransaction(fetched.transactionHash);
        assert(tx&&tx.to.toLowerCase()===contract.address.toLowerCase());
        assert.equal(tx.from.toLowerCase(),owner.address.toLowerCase());
        assert.equal(tx.data.slice(0,10).toLowerCase(),
          contract.interface.getSighash(method).toLowerCase());
        const decoded=contract.interface.decodeFunctionData(method,tx.data);
        assert.equal(decoded[0].toString(),"0","Not a zero-value boundary EVM transaction");
        const topic=contract.interface.getEventTopic("Transfer");
        const zeroBurns=fetched.logs.filter(l=>
          l.address.toLowerCase()===contract.address.toLowerCase()&&
          l.topics[0]?.toLowerCase()===topic.toLowerCase())
          .map(l=>contract.interface.parseLog(l)).filter(e=>
            e.name==="Transfer" &&
            e.args.from.toLowerCase()===owner.address.toLowerCase() &&
            e.args.to.toLowerCase()===ethers.constants.AddressZero.toLowerCase() &&
            e.args.value.eq(0));
        const bytecode=await provider.getCode(contract.address,receipt.blockNumber);
        assert(bytecode.length>2);
        witness={
          transactionMined:true,txHash:receipt.transactionHash,
          blockNumber:receipt.blockNumber,blockHash:receipt.blockHash,
          transactionTo:tx.to,caller:tx.from,methodSelector:tx.data.slice(0,10),
          verifiedZeroValueBurnEvents:zeroBurns.length,
          contractCodeKeccak256:ethers.utils.keccak256(bytecode),
          receiptStatus:receipt.status,
          verification:"LOCAL_PROVIDER_BLOCK_TX_AND_RECEIPT_RECHECKED"
        };
      }
      const successful=receipt!==null;
      result={
        execution:successful?"MINED_SUCCESSFUL_ZERO_QUANTITY":"ZERO_QUANTITY_REVERTED",
        transactionMined:successful,
        actualNumericBefore:numericBefore.toString(),
        actualNumericAfter:numericAfter.toString(),
        totalSupplyStrictlyDecreased:numericAfter<numericBefore,
        allTrackedStateUnchanged:unchanged,
        witnessedRevertReason:successful?null:revertReason,
        receipt:witness,
        interpretation:successful&&! (numericAfter<numericBefore)?
          "OVERGENERALIZED_STRICT_DECREASE_FALSIFIED":
          "OVERGENERALIZATION_NOT_FALSIFIED_BY_THIS_ZERO_CASE"
      };
    }else{
      // Read-only negative control: a revert cannot produce a mined receipt.
      let reverted=false;
      try{
        await contract.callStatic[isAsset?"burn":"redeem"](...args);
      }catch{reverted=true;}
      const after=await snap();
      const stateUnchanged=JSON.stringify(before)===JSON.stringify(after);
      assert(stateUnchanged,"Read-only overbalance simulation changed tracked state");
      result={
        execution:reverted?"UNMINED_EVM_CALLSTATIC_REVERT":"READ_ONLY_CALL_UNEXPECTEDLY_SUCCEEDED",
        transactionMined:false,
        attemptedAmount:amount.toString(),previousOwnedBalance:balance.toString(),
        allTrackedStateUnchanged:stateUnchanged,receipt:null,
        interpretation:reverted?
          "OVERGENERALIZED_UNCONDITIONAL_EXECUTABILITY_FALSIFIED":
          "UNCONDITIONAL_EXECUTABILITY_NOT_FALSIFIED_BY_THIS_CASE"
      };
    }
    assert(amountRe.test(result.actualNumericBefore??"0"));
    cases.push({
      caseId:test.caseId,
      originalScopedPredictionId:test.originalScopedPredictionId,
      challengeKind:test.challengeKind,
      contestedGeneralization:test.contestedGeneralization,
      falsificationRule:test.falsificationRule,
      operation:test.operation,sourceSha256:test.sourceSha256,
      sourceRevision:test.sourceRevision,
      originHypothesisId:test.originHypothesisId,
      testQuantity:amount.toString(),
      actual:result,
      provenanceScope:"SOURCE_AST_COUNTERFACTUAL_TO_LOCAL_HARDHAT_EVM",
      generalCompatibilityVerdict:"NOT_EVALUATED",
      candidateAdmission:"NOT_ADMITTED"
    });
    console.log("OECL_AUTOGENERATED_AST_COUNTERFACTUAL_EVM",test.operation,
      test.challengeKind,result.execution,result.interpretation);
  }
  assert.equal(cases.length,4);
  assert.equal(sha256(fs.readFileSync(filename)),planSha256,"Plan changed after EVM");
  const record={
    schemaVersion:"OECL_AST_AUTOGENERATED_COUNTEREXAMPLES_LOCAL_EVM_V1",
    originHypothesisId:plan.originHypothesisId,
    originalPositivePlanSha256:plan.sourcePlanSha256,
    counterfactualPlanSha256:planSha256,
    generationMethod:plan.generationMethod,
    generatedBeforeEvmDeployment:true,
    localChainId:31337,
    baselineStateAfterDeposit:afterDeposit,
    cases,
    scope:"CHALLENGE_OF_OVERGENERALIZATION_NOT_PROOF_OF_ORIGINAL_PATH_FAILURE",
    sourceHypothesisStatus:"INCONCLUSIVE",
    compatibilityVerdict:"NOT_EVALUATED",
    candidateAdmission:"NOT_ADMITTED",
    limitations:[
      "A successful zero-quantity call with unchanged totalSupply refutes the stronger ANY SUCCESSFUL CALL MUST DECREASE claim only.",
      "The original strictly positive owner-authorized source path remains separately supported by its specific EVM observations.",
      "A callStatic revert is read-only negative evidence, not a mined revert receipt.",
      "These deterministic AST-triggered boundary probes use reviewed fixed EVM adapters, not arbitrary Solidity synthesis or global vulnerability detection."
    ]
  };
  fs.writeFileSync(path.join(output,"ast-self-falsification-evm.json"),
    JSON.stringify(record,null,2)+"\n");
  console.log("OECL_AST_AUTOGENERATED_COUNTERFACTUAL_EVM_REPORT",JSON.stringify({
    cases:cases.length,
    boundaryCounterexamples:cases.filter(x=>
      x.actual.interpretation==="OVERGENERALIZED_STRICT_DECREASE_FALSIFIED").length,
    unminedNegativeReverts:cases.filter(x=>
      x.actual.execution==="UNMINED_EVM_CALLSTATIC_REVERT").length,
    generalCompatibility:record.compatibilityVerdict
  }));
  return record;
}
module.exports={loadSelfFalsifiers,runSelfFalsifiers};
