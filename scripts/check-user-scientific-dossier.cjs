"use strict";
const assert=require("node:assert/strict");
const {load,build}=require("./build-user-scientific-dossier.cjs");
const directory=process.argv[2];
assert.ok(directory,"Usage: node check-user-scientific-dossier.cjs <joint-evidence-directory>");
const baseline=load(directory);
const dossier=build(baseline);
assert.equal(dossier.verdict,"INCONCLUSIVE");
assert.equal(dossier.candidateAdmission,"NOT_ADMITTED");
assert.equal(dossier.scientificQuestions.total,10);
assert.equal(dossier.scientificQuestions.allQuestionsResolved,false);
assert.equal(dossier.adversarial.status,"PARTIAL_COVERAGE");
assert.equal(dossier.universalCompatibilityEstablished,false);
const attacks=[
  ["forged_global_support","native",x=>x.finalScientificResult="SUPPORTS"],
  ["admitted_candidate_forgery","bridge",x=>x.candidateAdmission="ADMITTED"],
  ["changed_erc8098_revision","evm",x=>x.erc8098PinnedRevision="f".repeat(40)],
  ["changed_erc8060_revision","bridge",x=>x.sourceRoles[0].revision="0".repeat(40)],
  ["promoted_source_hypothesis","ast",x=>x.hypotheses[0].status="ADMITTED"],
  ["altered_compiler_graph","graph",x=>x.functions.pop()],
  ["fabricated_scientific_question","coverage",x=>x.observations[0].status="SUPPORTED"],
  ["falsely_complete_question_coverage","coverage",x=>x.sourceCoverageComplete=true],
  ["changed_native_evaluator","native",x=>x.result.scientificPolarity="CHALLENGE"],
  ["changed_evm_payout","evm",x=>x.observations.ethRedeemed="42"],
  ["changed_property_transaction","recognized",x=>x.property.witnessTransaction="0x"+"0".repeat(64)],
  ["concealed_untested_threats","audit",x=>x.uncovered=[]],
  ["forged_rollback_evidence","rollback",x=>x.cases[0].measuredStateAfter.tokenSupply="900"],
  ["forged_eth_callback_receipt","callbacks",x=>x.schemaVersion="FAKE"],
  ["forged_multiholder_receipt","multiholder",x=>x.schemaVersion="FAKE"],
  ["modified_parsed_graph_without_bytes","graph",x=>x.schemaVersion="FAKE",true]
];
for(const [name,key,mutate,onlyParsed] of attacks){
  const b={docs:structuredClone(baseline.docs),raw:{...baseline.raw}};
  mutate(b.docs[key]);
  if(!onlyParsed)b.raw[key]=Buffer.from(JSON.stringify(b.docs[key]));
  assert.throws(()=>build(b),undefined,"Tampered evidence admitted: "+name);
}
console.log("OECL_USER_DOSSIER_ADVERSARIAL:"+JSON.stringify({
  baseline:"PASS",negativeControls:attacks.length,
  candidateAdmission:dossier.candidateAdmission,verdict:dossier.verdict
}));
