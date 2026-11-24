"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");

const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const PLAN_FILE=path.join(__dirname,"preregistered-8098-4626-falsification.json");
const EXPECTED_ID="OECL-PINNED-8098-4626-ROLE-FALSIFICATION-V1";
const DECIMAL=/^(?:0|[1-9][0-9]*)$/;
const HEX40=/^[a-f0-9]{40}$/i;
const HASH=/^0x[a-f0-9]{64}$/i;

/** Called BEFORE any transaction; checks immutable predicted outcomes. */
function readPrerecordedPredictions(){
  const bytes=fs.readFileSync(PLAN_FILE);
  const plan=JSON.parse(bytes.toString("utf8"));
  assert.equal(plan.experimentId,EXPECTED_ID);
  assert.equal(plan.plannedBeforeExecution,true);
  assert.equal(plan.origin,"CONTROLLED_ADVERSARIAL_HYPOTHESES_NOT_AUTONOMOUS_DISCOVERY");
  assert.equal(plan.erc8098SourceRevision,"68a05289bd68d89db8453c49500e0a1ae6cd11ec");
  assert.equal(plan.toolchainDependencyRevision,"c7eed906835ab39fbc8439eb0493e5a5371b23a2");
  assert.equal(plan.openzeppelinVersion,"4.9.6");
  assert.equal(plan.depositAmountWei,"100000000000000000000");
  assert.equal(plan.hypotheses?.length,2);
  const expected=[
    ["UNDERLYING_ERC8098","A","LTE","underlyingSupplyAfter","underlyingSupplyBefore"],
    ["SEPARATE_ERC4626_SHARES","B","EQ","vaultShareSupplyAfter","vaultShareSupplyBefore"]
  ];
  plan.hypotheses.forEach((p,i)=>{
    assert.deepEqual(
      [p.role,p.participantSide,p.operator,p.leftMetric,p.rightMetric],
      expected[i],"Pre-registered hypothesis role/metrics were changed");
    assert.equal(p.expectedConstraintVerdict,"PRESERVED");
    assert(p.hypothesisId&&p.constraintId&&p.falsificationCriterion);
  });
  return {plan,planSha256:sha256(bytes)};
}

/**
 * This is a LOCAL-CHAIN provider witness only, not Ethereum mainnet receipt
 * authentication. The scientific predictions do not influence measurements.
 */
async function runPreregisteredFalsification(x){
  const {registration,provider,ethers,asset,vault,owner,before,afterDeposit,
    depositReceipt,deposit,sourceRevision,sourceSha256,vaultWrapperSha256,
    compilerVersion,openzeppelinVersion,dependencyIntegrity,output}=x;
  const {plan,planSha256}=registration;
  assert.equal(plan.erc8098SourceRevision,sourceRevision);
  assert(HEX40.test(sourceRevision)&&/^[a-f0-9]{64}$/i.test(sourceSha256));
  assert(/^[a-f0-9]{64}$/i.test(vaultWrapperSha256));
  assert.equal(plan.openzeppelinVersion,openzeppelinVersion);
  assert.equal(deposit.toString(),plan.depositAmountWei);
  const network=await provider.getNetwork();
  assert.equal(Number(network.chainId),31337);
  assert.equal(depositReceipt.status,1);
  assert(HASH.test(depositReceipt.transactionHash));
  assert.equal(typeof depositReceipt.blockHash,"string");
  const verifiedReceipt=await provider.getTransactionReceipt(depositReceipt.transactionHash);
  assert(verifiedReceipt,"Local provider did not return mined receipt");
  assert.equal(verifiedReceipt.status,1);
  assert.equal(verifiedReceipt.blockNumber,depositReceipt.blockNumber);
  assert.equal(verifiedReceipt.blockHash.toLowerCase(),depositReceipt.blockHash.toLowerCase());
  const block=await provider.getBlock(verifiedReceipt.blockNumber);
  assert(block&&block.hash.toLowerCase()===verifiedReceipt.blockHash.toLowerCase());
  assert(block.transactions.some(h=>h.toLowerCase()===verifiedReceipt.transactionHash.toLowerCase()));
  const transaction=await provider.getTransaction(verifiedReceipt.transactionHash);
  assert(transaction&&transaction.to.toLowerCase()===vault.address.toLowerCase());
  assert.equal(transaction.from.toLowerCase(),owner.address.toLowerCase());
  assert.equal(transaction.data.slice(0,10).toLowerCase(),
    vault.interface.getSighash("deposit(uint256,address)").toLowerCase());
  assert.equal(transaction.value.toString(),"0");
  const expectedCode=[];
  for(const c of [asset,vault]){
    const deployed=await provider.getCode(c.address,verifiedReceipt.blockNumber);
    assert(deployed.length>2,"Deployed code missing from receipt block");
    expectedCode.push(ethers.utils.keccak256(deployed));
  }
  const depositTopic=vault.interface.getEventTopic("Deposit");
  const events=[];
  for(const log of verifiedReceipt.logs){
    if(log.address.toLowerCase()!==vault.address.toLowerCase()||
       log.topics[0]?.toLowerCase()!==depositTopic.toLowerCase())continue;
    const parsed=vault.interface.parseLog(log);
    assert.equal(parsed.name,"Deposit");
    events.push({
      sender:parsed.args.sender,
      receiver:parsed.args.owner,
      assets:parsed.args.assets.toString(),
      shares:parsed.args.shares.toString(),
      logIndex:log.logIndex
    });
  }
  assert.equal(events.length,1,"Expected one vault Deposit event");
  const minted=(BigInt(afterDeposit.vaultShareSupply)-BigInt(before.vaultShareSupply));
  assert(minted>0n,"Depositing failed to mint vault shares");
  assert.equal(events[0].sender.toLowerCase(),owner.address.toLowerCase());
  assert.equal(events[0].receiver.toLowerCase(),owner.address.toLowerCase());
  assert.equal(events[0].assets,plan.depositAmountWei);
  assert.equal(events[0].shares,minted.toString());
  assert.equal(afterDeposit.underlyingVault,plan.depositAmountWei);
  const metrics={
    underlyingSupplyBefore:before.underlyingSupply,
    underlyingSupplyAfter:afterDeposit.underlyingSupply,
    vaultShareSupplyBefore:before.vaultShareSupply,
    vaultShareSupplyAfter:afterDeposit.vaultShareSupply
  };
  Object.values(metrics).forEach(v=>assert(DECIMAL.test(v),"Invalid numeric measurement"));
  // Each observation is recomputed *before* consulting hypothesis predictions.
  const trials=plan.hypotheses.map(p=>{
    const a=BigInt(metrics[p.leftMetric]),b=BigInt(metrics[p.rightMetric]);
    const holds=p.operator==="LTE"?a<=b:p.operator==="EQ"?a===b:a>=b;
    const actual=holds?"PRESERVED":"VIOLATED";
    const sourceRevisionForRole=p.participantSide==="A"?
      sourceRevision:"sha256:"+vaultWrapperSha256;
    return {
      prediction:{
        hypothesisId:p.hypothesisId,candidateId:plan.experimentId,
        constraintId:p.constraintId,participantSide:p.participantSide,
        sourceRevision:sourceRevisionForRole,scenarioId:plan.scenarioId,
        expectedConstraintVerdict:p.expectedConstraintVerdict
      },
      hypothesisOrigin:plan.origin,statement:p.statement,
      falsificationCriterion:p.falsificationCriterion,role:p.role,
      constraint:{
        constraintId:p.constraintId,candidateId:plan.experimentId,
        participantSide:p.participantSide,
        participantKind:"PROTOCOL",participantId:
          p.participantSide==="A"?"ERC-8098":"ERC-4626",
        sourceId:p.participantSide==="A"?"PINNED-ERC8098-SOURCE":"PINNED-OZ4626-VAULT",
        sourceRevision:sourceRevisionForRole,
        factId:"FACT-"+p.constraintId,
        basis:"SOURCE_DERIVED_BEHAVIORAL_INVARIANT",
        containerKind:"CONTRACT",
        containerSymbol:p.participantSide==="A"?"ERC8098Reference":"OECL8098AssetVault",
        locator:{sourceLocation:"PINNED_GITHUB_AND_NPM_LOCKED_SOURCE"},
        rawText:p.statement,
        behavioralPredicate:{
          kind:"UNSIGNED_INTEGER_RELATION",
          leftMetric:p.leftMetric,rightMetric:p.rightMetric,
          operator:p.operator
        }
      },
      observation:{
        observationId:"OBS-"+p.constraintId,
        candidateId:plan.experimentId,
        constraintId:p.constraintId,participantSide:p.participantSide,
        verdict:actual,
        evidence:["LOCAL_PROVIDER_VERIFIED_DEPOSIT_RECEIPT",
          "LOCAL_PROVIDER_VERIFIED_VAULT_DEPOSIT_EVENT",
          "RECORDED_BEFORE_AND_AFTER_CONTRACT_STATE"],
        numericMeasurements:{
          [p.leftMetric]:metrics[p.leftMetric],
          [p.rightMetric]:metrics[p.rightMetric]
        },
        sourceRevision:sourceRevisionForRole,
        transactionHash:verifiedReceipt.transactionHash
      },
      comparison:actual===p.expectedConstraintVerdict?
        "REPORTED_MEASUREMENTS_MATCH_PREDICTION":
        "REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION"
    };
  });
  assert.equal(trials[0].comparison,"REPORTED_MEASUREMENTS_MATCH_PREDICTION");
  assert.equal(trials[1].comparison,"REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION");
  const witness={
    schemaVersion:"OECL_PREREGISTERED_SCIENTIST_LOCAL_EVM_FALSIFICATION_V1",
    experimentId:plan.experimentId,scenarioId:plan.scenarioId,
    planSha256,registeredBeforeExecution:true,
    provenance:{
      sourceRevision,sourceSha256,vaultWrapperSha256,compilerVersion,
      openzeppelinVersion,dependencyIntegrity,
      localChainId:31337,
      assetAddress:asset.address,vaultAddress:vault.address,
      assetCodeHash:expectedCode[0],vaultCodeHash:expectedCode[1]
    },
    localEvmReceiptWitness:{
      verification:"LIVE_LOCAL_PROVIDER_RECEIPT_AND_BLOCK_AND_EVENT_CHECKED",
      transactionHash:verifiedReceipt.transactionHash,
      transactionTo:transaction.to,transactionFrom:transaction.from,
      transactionDataSelector:transaction.data.slice(0,10),
      blockHash:block.hash,blockNumber:block.number,
      receiptStatus:verifiedReceipt.status,
      verifiedEvent:events[0]
    },
    stateMeasurements:metrics,
    trials,
    observationTrust:"LOCAL_HARDHAT_PROVIDER_CHECKED_NOT_MAINNET_AUTHENTICATION",
    scientificVerdict:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",
    fullCompatibilityVerdict:"NOT_EVALUATED",
    limitations:[
      "This is a deliberately controlled adversarial prediction, not a newly discovered autonomous scientist hypothesis.",
      "Only the local pinned ERC8098 underlying and OZ4.9.6 ERC4626 shares in a first-deposit fixture were tested.",
      "A successful local provider receipt is not an independently authenticated Ethereum mainnet receipt or general interoperability proof.",
      "The scientific comparator may challenge a prediction but cannot rewrite any EVM observation."
    ]
  };
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,"scientist-adversarial-falsification.json"),
    JSON.stringify(witness,null,2)+"\n");
  console.log("OECL_PREREGISTERED_SCIENTIST_LOCAL_EVM_FALSIFICATION_PASS",JSON.stringify({
    falsifiedHypothesis:trials[1].prediction.hypothesisId,
    supportedScopedHypothesis:trials[0].prediction.hypothesisId,
    transactionHash:verifiedReceipt.transactionHash,
    providerVerified:true,compatibilityVerdict:witness.fullCompatibilityVerdict
  }));
  return witness;
}
module.exports={readPrerecordedPredictions,runPreregisteredFalsification};
