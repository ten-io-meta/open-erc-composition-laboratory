"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const sha256=x=>crypto.createHash("sha256").update(x).digest("hex");
const dir=path.resolve(process.argv[2]||"source-output/pair-8098-4626");
const planFile=path.join(__dirname,"preregistered-8098-4626-falsification.json");
const planBytes=fs.readFileSync(planFile);
const plan=JSON.parse(planBytes.toString("utf8"));
const report=JSON.parse(fs.readFileSync(path.join(dir,
  "scientist-adversarial-falsification.json"),"utf8"));
const original=JSON.parse(fs.readFileSync(path.join(dir,
  "independent-8098-underlying-4626-evm.json"),"utf8"));
assert.equal(report.schemaVersion,
  "OECL_PREREGISTERED_SCIENTIST_LOCAL_EVM_FALSIFICATION_V1");
assert.equal(report.experimentId,plan.experimentId);
assert.equal(report.scenarioId,plan.scenarioId);
assert.equal(report.planSha256,sha256(planBytes),"Predictions changed after execution");
assert.equal(report.registeredBeforeExecution,true);
assert.equal(report.provenance.localChainId,31337);
assert.equal(report.provenance.sourceRevision,plan.erc8098SourceRevision);
assert.equal(report.provenance.openzeppelinVersion,plan.openzeppelinVersion);
assert.equal(report.provenance.sourceSha256,original.provenance.erc8098SourceSha256);
assert.equal(report.provenance.vaultWrapperSha256,original.provenance.vaultWrapperSha256);
assert.equal(report.provenance.compilerVersion,original.provenance.compilerVersion);
assert.equal(report.provenance.dependencyIntegrity,original.provenance.openzeppelinDependencyIntegrity);
assert.equal(report.provenance.assetAddress,original.fixtureAddresses.asset);
assert.equal(report.provenance.vaultAddress,original.fixtureAddresses.vault);
assert.equal(report.fullCompatibilityVerdict,"NOT_EVALUATED");
assert.equal(report.scientificVerdict,"INCONCLUSIVE");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.equal(report.observationTrust,
  "LOCAL_HARDHAT_PROVIDER_CHECKED_NOT_MAINNET_AUTHENTICATION");
const witness=report.localEvmReceiptWitness;
assert.equal(witness.verification,
  "LIVE_LOCAL_PROVIDER_RECEIPT_AND_BLOCK_AND_EVENT_CHECKED");
assert(/^0x[a-f0-9]{64}$/i.test(witness.transactionHash));
assert(/^0x[a-f0-9]{64}$/i.test(witness.blockHash));
assert.equal(witness.receiptStatus,1);
assert.equal(witness.transactionTo.toLowerCase(),original.fixtureAddresses.vault.toLowerCase());
assert.equal(witness.transactionFrom.toLowerCase(),
  witness.verifiedEvent.sender.toLowerCase());
assert.equal(witness.verifiedEvent.receiver.toLowerCase(),
  witness.transactionFrom.toLowerCase());
assert(/^0x[a-f0-9]{64}$/i.test(report.provenance.assetCodeHash));
assert(/^0x[a-f0-9]{64}$/i.test(report.provenance.vaultCodeHash));
const receipt=original.minedReceipts.find(x=>x.name.includes("deposit ERC8098 underlying"));
assert(receipt&&receipt.txHash===witness.transactionHash);
assert.equal(receipt.blockNumber,witness.blockNumber);
assert.equal(original.observations.before.underlyingSupply,
  report.stateMeasurements.underlyingSupplyBefore);
assert.equal(original.observations.afterDeposit.underlyingSupply,
  report.stateMeasurements.underlyingSupplyAfter);
assert.equal(original.observations.before.vaultShareSupply,
  report.stateMeasurements.vaultShareSupplyBefore);
assert.equal(original.observations.afterDeposit.vaultShareSupply,
  report.stateMeasurements.vaultShareSupplyAfter);
const originalPlanMetrics=Object.fromEntries(
  plan.hypotheses.map(h=>[h.hypothesisId,h]));
assert.equal(report.trials.length,2);
assert.equal(new Set(report.trials.map(x=>x.prediction.hypothesisId)).size,2);
const decimal=/^(0|[1-9][0-9]*)$/;
const actual=[];
for(const t of report.trials){
  const p=originalPlanMetrics[t.prediction.hypothesisId];
  assert(p,"Unregistered scientific prediction");
  assert.equal(t.prediction.expectedConstraintVerdict,p.expectedConstraintVerdict);
  assert.equal(t.prediction.candidateId,plan.experimentId);
  assert.equal(t.prediction.scenarioId,plan.scenarioId);
  assert.equal(t.prediction.participantSide,p.participantSide);
  assert.equal(t.prediction.constraintId,p.constraintId);
  assert.equal(t.constraint.constraintId,p.constraintId);
  assert.equal(t.constraint.sourceRevision,t.prediction.sourceRevision);
  assert.equal(t.observation.sourceRevision,t.prediction.sourceRevision);
  assert.equal(t.observation.transactionHash,witness.transactionHash);
  assert.equal(t.observation.participantSide,p.participantSide);
  assert.equal(t.constraint.behavioralPredicate.operator,p.operator);
  assert.equal(t.constraint.behavioralPredicate.leftMetric,p.leftMetric);
  assert.equal(t.constraint.behavioralPredicate.rightMetric,p.rightMetric);
  assert.equal(t.observation.evidence.length,3);
  assert.equal(t.observation.numericMeasurements[p.leftMetric],
    report.stateMeasurements[p.leftMetric]);
  assert.equal(t.observation.numericMeasurements[p.rightMetric],
    report.stateMeasurements[p.rightMetric]);
  const left=t.observation.numericMeasurements[p.leftMetric],
    right=t.observation.numericMeasurements[p.rightMetric];
  assert(decimal.test(left)&&decimal.test(right));
  const l=BigInt(left),r=BigInt(right);
  const holds=p.operator==="EQ"?l===r:p.operator==="LTE"?l<=r:l>=r;
  const observed=holds?"PRESERVED":"VIOLATED";
  assert.equal(t.observation.verdict,observed,
    "Measured state and claimed scientific observation contradict");
  const result=observed===p.expectedConstraintVerdict?
    "REPORTED_MEASUREMENTS_MATCH_PREDICTION":
    "REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION";
  assert.equal(t.comparison,result);
  if(p.participantSide==="A")
    assert.equal(t.prediction.sourceRevision,plan.erc8098SourceRevision);
  else
    assert.equal(t.prediction.sourceRevision,
      "sha256:"+original.provenance.vaultWrapperSha256);
  actual.push({id:p.hypothesisId,alignment:result});
}
assert.equal(actual[0].alignment,"REPORTED_MEASUREMENTS_MATCH_PREDICTION");
assert.equal(actual[1].alignment,"REPORTED_MEASUREMENTS_CHALLENGE_PREDICTION");
const shareChange=BigInt(report.stateMeasurements.vaultShareSupplyAfter)-
  BigInt(report.stateMeasurements.vaultShareSupplyBefore);
assert(shareChange>0n);
assert.equal(witness.verifiedEvent.shares,shareChange.toString());
assert.equal(witness.verifiedEvent.assets,plan.depositAmountWei);
console.log("OECL_PREREGISTERED_EVM_FALSIFICATION_ARTIFACT_PASS",
  JSON.stringify({planSha256:report.planSha256,observations:actual,
    witnessTxHash:witness.transactionHash,fullCompatibilityVerdict:report.fullCompatibilityVerdict}));
