"use strict";
// Read-only, fail-closed projection of source-derived hypotheses and pinned EVM
// evidence into a user-facing report. Does not admit candidates or recalculate
// scientific conclusions. Must run after the independent evidence validators.
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const hash=x=>crypto.createHash("sha256").update(x).digest("hex");
const prefix="erc8060-erc8098-";
const names={
  graph:"structural-graph.json",ast:"ast-hypothesis.json",
  study:"native-ast-study.json",bridge:"ast-evm-native-bridge.json",
  coverage:"native-question-coverage.json",evm:"pinned.json",
  witness:"pinned.invariants.json",native:"pinned.native-behavioral.json",
  recognized:"emergent-property.json",rollback:"failure-matrix.json",
  callbacks:"eth-callbacks.json",multiholder:"multiholder.json",
  audit:"adversarial-audit.json"
};
function load(directory){
  const docs={},raw={};
  for(const [key,suffix] of Object.entries(names)){
    raw[key]=fs.readFileSync(path.join(directory,prefix+suffix));
    docs[key]=JSON.parse(raw[key].toString("utf8"));
  }
  return {docs,raw};
}
function build(bundle){
  const {docs:d,raw}=bundle;
  const digest={};
  for(const key of Object.keys(names)){
    assert.ok(d[key]&&raw[key],"MISSING_ARTIFACT:"+key);
    assert.deepStrictEqual(d[key],JSON.parse(raw[key].toString("utf8")),
      "ARTIFACT_CONTENT_CHANGED:"+key);
    digest[key]=hash(raw[key]);
  }
  const bound=(report,map,reason)=>{
    for(const [name,key] of Object.entries(map))
      assert.equal(report?.[name],digest[key],reason+":"+name);
  };
  bound(d.bridge?.artifactHashes,{
    graph:"graph",hypothesis:"ast",nativeStudy:"study",evm:"evm",
    witness:"witness",native:"native",recognized:"recognized"
  },"BRIDGE_DIGEST_MISMATCH");
  bound(d.study?.inputArtifactDigests,{graph:"graph",sourceHypothesis:"ast"},
    "SOURCE_DISCOVERY_DIGEST_MISMATCH");
  bound(d.coverage?.evidenceArtifactDigests,{
    nativeStudy:"study",bridge:"bridge",evm:"evm",witness:"witness",
    native:"native",recognized:"recognized",rollback:"rollback"
  },"QUESTION_COVERAGE_DIGEST_MISMATCH");
  bound(d.audit?.artifactSha256,{
    success:"evm",rollback:"rollback",callbacks:"callbacks",multiholder:"multiholder"
  },"ADVERSARIAL_AUDIT_DIGEST_MISMATCH");
  const hypothesis=d.ast?.hypotheses?.[0];
  const source=d.study?.discovery;
  const specification=d.study?.specification?.specifications?.[0];
  const property=d.recognized?.property;
  const questions=d.coverage?.observations;
  const roles=d.bridge?.sourceRoles;
  assert.equal(d.ast?.schemaVersion,"OECL_AST_BOUND_BEHAVIORAL_SOURCE_DISCOVERY_V1");
  assert.equal(d.ast?.executionEvidenceUsed,false);
  assert.equal(d.ast?.hypotheses?.length,1);
  assert.equal(d.study?.schemaVersion,"OECL_NATIVE_AST_BEHAVIORAL_STUDY_V1");
  assert.equal(source?.hypotheses?.length,1);
  assert.equal(source?.candidateCount,0);
  assert.equal(d.study?.nativeCandidatesGenerated,0);
  assert.equal(source?.hypotheses?.[0]?.hypothesisId,hypothesis?.hypothesisId);
  assert.equal(specification?.hypothesisId,hypothesis?.hypothesisId);
  assert.equal(specification?.status,"INSUFFICIENT_EVIDENCE");
  assert.equal(specification?.candidateAdmission,"NOT_ADMITTED");
  assert.equal(specification?.nativeCandidateId,null);
  assert.equal(d.bridge?.schemaVersion,"OECL_AST_EVM_NATIVE_BRIDGE_REPORT_V1");
  assert.equal(d.bridge?.matched,true);
  assert.equal(d.bridge?.status,"SCOPED_OBSERVATION_CONSISTENT");
  assert.equal(d.bridge?.hypothesisId,hypothesis?.hypothesisId);
  assert.equal(d.bridge?.nativeSourceSpecification?.specificationId,specification?.specificationId);
  assert.equal(d.bridge?.nativeDiscoveredCandidateCount,0);
  assert.equal(d.bridge?.nativeLocalEvaluation?.scope,"PARTIAL_LOCAL_PROPERTY_CONSTRAINTS_ONLY");
  assert.equal(d.bridge?.nativeLocalEvaluation?.result,"SUPPORT");
  assert.equal(d.coverage?.schemaVersion,"OECL_NATIVE_AST_BEHAVIORAL_COVERAGE_V1");
  assert.deepStrictEqual(d.coverage?.errors,[]);
  assert.equal(d.coverage?.hypothesisId,hypothesis?.hypothesisId);
  assert.equal(d.coverage?.specificationId,specification?.specificationId);
  assert.equal(d.coverage?.status,"PARTIAL_OBSERVATION");
  assert.equal(d.coverage?.allQuestionsResolved,false);
  assert.equal(d.coverage?.sourceCoverageComplete,false);
  assert.equal(questions?.length,specification?.questions?.length);
  assert.equal(d.coverage?.statistics?.total,specification?.questions?.length);
  for(const question of specification.questions){
    const observed=questions.filter(q=>q.questionId===question.questionId);
    assert.equal(observed.length,1,"QUESTION_NOT_UNIQUELY_OBSERVED");
    assert.equal(observed[0].status,"SCOPED_OBSERVED");
    assert.deepStrictEqual(observed[0].sourceFactIds,question.sourceFactIds);
  }
  assert.equal(d.recognized?.schemaVersion,"OECL_SOURCE_BOUND_EMERGENT_PROPERTY_RECOGNITION_V1");
  assert.equal(property?.kind,"SCOPED_ATOMIC_CROSS_ASSET_REDEMPTION_WITH_MONOTONE_SUPPLY");
  assert.equal(property?.status,"OBSERVED_IN_PINNED_LOCAL_EVM");
  assert.equal(d.evm?.classification,"LOCAL_REAL_EVM_TWO_PINNED_REFERENCE_REPOSITORIES");
  assert.equal(d.evm?.claimedGlobalCompatibility,false);
  assert.equal(d.evm?.chainId,31337);
  assert.equal(d.evm?.transactions?.jointRedemption,d.bridge?.witnessTransaction);
  assert.equal(d.evm?.transactions?.jointRedemption,property?.witnessTransaction);
  assert.equal(d.evm?.transactions?.jointRedemption,property?.sourceBinding?.witnessTransaction);
  assert.equal(d.evm?.observations?.sameTransactionContainsBothBurns,true);
  assert.equal(d.audit?.schemaVersion,"OECL_ADVERSARIAL_COVERAGE_AUDIT_V1");
  assert.equal(d.audit?.status,"PARTIAL_COVERAGE");
  assert.equal(d.audit?.observedTransactions?.successful,d.evm?.transactions?.jointRedemption);
  assert.ok(d.audit?.observedTests?.length>0);
  assert.ok(d.audit?.uncovered?.length>0);
  assert.ok(d.audit?.observedTests?.every(x=>x.status==="OBSERVED_LOCAL"));
  assert.ok(d.audit?.uncovered?.every(x=>x.status==="UNTESTED"));
  assert.equal(roles?.length,2);
  assert.equal(hypothesis?.participants?.length,2);
  for(const p of hypothesis.participants)
    assert.equal(roles.filter(r=>r.sourceId===p.sourceId&&r.revision===p.revision&&r.assetClass===p.assetClass).length,1,"SOURCE_ROLE_MISMATCH");
  assert.equal(d.evm?.erc8060Repository,roles[0].sourceId);
  assert.equal(d.evm?.erc8060PinnedRevision,roles[0].revision);
  assert.equal(d.evm?.erc8098Repository,roles[1].sourceId);
  assert.equal(d.evm?.erc8098PinnedRevision,roles[1].revision);
  assert.equal(d.evm?.erc8098SourceSha256,roles[1].sourceSha256);
  for(const report of [d.study,d.bridge,d.coverage,d.native,d.recognized,d.audit])
    assert.equal(report?.finalScientificResult??report?.scientificPolarity,"INCONCLUSIVE","FORGED_FINAL_SCIENTIFIC_RESULT");
  for(const report of [d.study,d.bridge,d.coverage,d.recognized,d.audit])
    assert.equal(report?.candidateAdmission??report?.admission,"NOT_ADMITTED","FORGED_CANDIDATE_ADMISSION");
  const o=d.evm.observations;
  const numberFields=["ethRedeemed","nftObligationBefore","nftObligationAfter",
    "nftObligationDecrease","erc20SupplyBefore","erc20SupplyAfter","supplyDecrease"];
  for(const key of numberFields)
    assert.match(o[key],/^(0|[1-9][0-9]*)$/,"INVALID_EVM_MEASUREMENT:"+key);
  assert.equal(BigInt(o.nftObligationBefore)-BigInt(o.nftObligationAfter),BigInt(o.nftObligationDecrease));
  assert.equal(BigInt(o.nftObligationDecrease),BigInt(o.ethRedeemed));
  assert.equal(BigInt(o.erc20SupplyBefore)-BigInt(o.erc20SupplyAfter),BigInt(o.supplyDecrease));
  assert.ok(BigInt(o.supplyDecrease)>0n);
  return {
    schemaVersion:"OECL_USER_SCIENTIFIC_DOSSIER_V1",verdict:"INCONCLUSIVE",
    candidateAdmission:"NOT_ADMITTED",scope:"PINNED_LOCAL_HARDHAT_EVM",
    universalCompatibilityEstablished:false,
    participants:roles.map(r=>({repository:r.sourceId,revision:r.revision,
      sourceSha256:r.sourceSha256,assetClass:r.assetClass})),
    discovery:{hypothesisId:hypothesis.hypothesisId,relation:hypothesis.relation,
      status:hypothesis.status,origin:"COMPILER_RESOLVED_SOLIDITY_AST_ONLY",
      predictedProperties:hypothesis.predictedProperties,unknowns:hypothesis.unknowns},
    experiment:{chainId:d.evm.chainId,transactionHash:d.evm.transactions.jointRedemption,
      property:property.kind,propertyStatus:property.status,
      ethRedeemedWei:o.ethRedeemed,nftObligationDecreaseWei:o.nftObligationDecrease,
      supplyBeforeBaseUnits:o.erc20SupplyBefore,supplyAfterBaseUnits:o.erc20SupplyAfter,
      supplyDecreaseBaseUnits:o.supplyDecrease,bothBurnsInSameTransaction:true,
      localConstraintResult:d.bridge.nativeLocalEvaluation.result},
    scientificQuestions:{...d.coverage.statistics,sourceCoverageComplete:false,
      allQuestionsResolved:false,observations:questions.map(q=>({questionId:q.questionId,
        participantSide:q.participantSide,category:q.category,status:q.status,
        evidenceRefs:q.evidenceRefs,missing:q.missing}))},
    adversarial:{status:"PARTIAL_COVERAGE",
      observedCaseIds:d.audit.observedTests.map(x=>x.id),
      untested:d.audit.uncovered.map(x=>({id:x.id,reason:x.reason}))},
    limitations:[...new Set([...(d.bridge.remainingUnknowns||[]),
      ...(specification.unresolvedRequirements||[]),
      "LOCAL_EVM_RECEIPT_NOT_INDEPENDENT_PUBLIC_CHAIN_REPLAY",
      "SOURCE_HYPOTHESIS_IS_NOT_AN_ADMITTED_SCIENTIFIC_CANDIDATE"])],
    artifacts:Object.fromEntries(Object.keys(names).map(k=>[k,{
      file:prefix+names[k],sha256:digest[k]}]))
  };
}
if(require.main===module){
  try{
    const [directory,output]=process.argv.slice(2);
    assert.ok(directory&&output,"Usage: node build-user-scientific-dossier.cjs <joint-evidence> <output.json>");
    const report=build(load(directory));
    fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
    console.log("OECL_USER_DOSSIER:"+JSON.stringify({verdict:report.verdict,
      questions:report.scientificQuestions.total,
      observed:report.adversarial.observedCaseIds.length,
      untested:report.adversarial.untested.length}));
  }catch(error){console.error(error);process.exitCode=1;}
}
module.exports={names,load,build};
