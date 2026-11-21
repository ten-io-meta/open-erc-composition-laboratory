"use strict";
/**
 * Binds existing pinned source-only facts to the generic effect matcher.
 * This is a source-only adapter: it never reads an EVM transaction artifact.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const {discover}=require("../laboratory/scientific-behavioral-complementarity/GenericBehavioralEffectMatcher.cjs");
const [sourceHypothesisPath,outputPath]=process.argv.slice(2);
assert.ok(sourceHypothesisPath&&outputPath,"Usage: check-generic-behavioral-complementarity.cjs <source-only-report> <output>");
const source=JSON.parse(fs.readFileSync(sourceHypothesisPath,"utf8"));
assert.equal(source.schemaVersion,"OECL_SOURCE_ONLY_BEHAVIORAL_HYPOTHESIS_V1");
assert.equal(source.executionEvidenceUsed,false);
assert.equal(source.candidateAdmission,"NOT_ADMITTED");
assert.equal(source.scientificPolarity,"INCONCLUSIVE");
const original=source.hypothesis;
assert.equal(original.status,"SOURCE_ONLY_UNEVALUATED");
const ids=original.participants.map(x=>x.id);
const evidenceBySource=new Map();
for(const entry of original.provenance) {
  if(!entry.sourceId||!entry.sourceRevision||!entry.sourceSha256||!entry.kind)
    throw new Error("Unverifiable source evidence");
  const group=evidenceBySource.get(entry.sourceId)??[];
  group.push({factId:entry.kind+"@"+entry.line,sourceId:entry.sourceId,
    sourceRevision:entry.sourceRevision,sourceSha256:entry.sourceSha256});
  evidenceBySource.set(entry.sourceId,group);
}
function participant(entry,assetClass,required) {
  const facts=[...(evidenceBySource.get(entry.id)||[])];
  // The inherited ERC20Burnable declaration belongs to OpenZeppelin.
  // Attribute it through the observed primary-source import, preserving
  // its actual origin rather than laundering it into the ERC source.
  if(assetClass==="FUNGIBLE") {
    const imported=original.provenance.find(x=>x.kind==="INHERITED_FUNGIBLE_BURN");
    const anchor=facts.find(x=>x.factId.startsWith("BURNABLE_IMPORT@"));
    assert.ok(imported && anchor,"Inherited burn is missing a declared import anchor");
    facts.push({
      factId:imported.kind+"@"+imported.line,
      sourceId:imported.sourceId,sourceRevision:imported.sourceRevision,
      sourceSha256:imported.sourceSha256,
      attributedParticipantId:entry.id,
      inheritanceAnchorFactId:anchor.factId
    });
  }
  const byKind=new Map(facts.map(x=>[x.factId.split("@")[0],x]));
  assert.ok(required.every(x=>byKind.has(x)),"Missing source facts for "+entry.id);
  const selected=k=>[byKind.get(k).factId];
  const auth=assetClass==="NON_FUNGIBLE"?"OWNER_GUARD":"INHERITED_FUNGIBLE_BURN";
  const available=assetClass==="NON_FUNGIBLE"?"SOLVENCY_GUARD":"CONSTRUCTOR_ALLOCATION";
  const consistent=assetClass==="NON_FUNGIBLE"?"LIABILITY_DECREASE":"BURNABLE_IMPORT";
  const effect=assetClass==="NON_FUNGIBLE"?"LIABILITY_DECREASE":"INHERITED_FUNGIBLE_BURN";
  return {
    sourceId:entry.id,revision:entry.revision,assetClass,provenance:facts,
    effects:[{kind:"DECREASE",assetClass,boundedBy:"AVAILABLE_QUANTITY",sourceFactIds:selected(effect)}],
    restrictions:[
      {kind:"AUTHORIZATION",sourceFactIds:selected(auth)},
      {kind:"AVAILABILITY",sourceFactIds:selected(available)},
      {kind:"STATE_CONSISTENCY",sourceFactIds:selected(consistent)}
    ]
  };
}
const a=original.participants.find(x=>original.provenance.some(p=>p.sourceId===x.id&&p.kind==="NFT_BURN_ENTRY"));
const b=original.participants.find(x=>original.provenance.some(p=>p.sourceId===x.id&&p.kind==="BURNABLE_IMPORT"));
assert.ok(a&&b&&a.id!==b.id);
const participants=[
  participant(a,"NON_FUNGIBLE",["NFT_BURN_ENTRY","OWNER_GUARD","SOLVENCY_GUARD","LIABILITY_DECREASE"]),
  participant(b,"FUNGIBLE",["INHERITED_FUNGIBLE_BURN","CONSTRUCTOR_ALLOCATION","BURNABLE_IMPORT"])
];
const good=discover({participants});
assert.deepEqual(good.errors,[]);
assert.equal(good.hypotheses.length,1);
assert.equal(good.hypotheses[0].admission,"NOT_ADMITTED");
assert.equal(good.hypotheses[0].scientificPolarity,"INCONCLUSIVE");
const controls=[];
function reject(label,change) {
  const mutated=structuredClone(participants);
  change(mutated);
  const result=discover({participants:mutated});
  assert.ok(result.errors.length>0||result.hypotheses.length===0,
    "Invalid source-bound input generated a hypothesis: "+label);
  controls.push(label);
}
reject("missing_source_identity",x=>{x[0].sourceId="";});
reject("forged_fact_revision",x=>{x[1].provenance[0].sourceRevision="forged";});
reject("missing_source_fact",x=>{x[0].effects[0].sourceFactIds=["missing"];});
reject("missing_authorization",x=>{x[0].restrictions=x[0].restrictions.filter(y=>y.kind!=="AUTHORIZATION");});
reject("missing_availability",x=>{x[1].restrictions=x[1].restrictions.filter(y=>y.kind!=="AVAILABILITY");});
reject("missing_consistency",x=>{x[1].restrictions=x[1].restrictions.filter(y=>y.kind!=="STATE_CONSISTENCY");});
reject("no_decrease_effect",x=>{x[0].effects[0].kind="INCREASE";});
reject("same_resource_class",x=>{x[1].assetClass=x[0].assetClass;});
reject("duplicate_source",x=>{x[1].sourceId=x[0].sourceId;x[1].revision=x[0].revision;});
// Demonstrate portability to an unrelated domain using typed synthetic,
// source-revision-bound observations, without ERC names or EVM fixtures.
const synthetic=structuredClone(participants);
synthetic[0].sourceId="example/voucher-cancellation";
synthetic[1].sourceId="example/credit-destruction";
for(let i=0;i<synthetic.length;i++) {
  const p=synthetic[i], originalId=participants[i].sourceId;
  for(const f of p.provenance) {
    if(f.sourceId===originalId) f.sourceId=p.sourceId;
    if(f.attributedParticipantId===originalId) f.attributedParticipantId=p.sourceId;
  }
}
const portable=discover({participants:synthetic});
assert.deepEqual(portable.errors,[]);
assert.equal(portable.hypotheses.length,1);
assert.notEqual(portable.hypotheses[0].hypothesisId,good.hypotheses[0].hypothesisId);
const report={
  schemaVersion:"OECL_GENERIC_SOURCE_EFFECT_DISCOVERY_V1",
  sourceHypothesisArtifact:sourceHypothesisPath,
  sourceHypothesisSha256:crypto.createHash("sha256").update(fs.readFileSync(sourceHypothesisPath)).digest("hex"),
  normalizedParticipants:participants,
  hypotheses:good.hypotheses,
  negativeControls:controls,
  syntheticTransferTest:{domain:"VOUCHER_CREDIT",hypotheses:portable.hypotheses.length,
    warning:"Synthetic portability only verifies the abstract matching algorithm, not real contracts or semantic extraction."},
  evidenceOrigin:"SOURCE_ONLY",
  executionEvidenceUsed:false,
  admission:"NOT_ADMITTED",
  scientificPolarity:"INCONCLUSIVE",
  limitations:[
    "The normalization adapter still uses an ERC-specific source extractor and is not yet a universal Solidity semantic analyzer.",
    "An inferred matching effect does not prove control-flow reachability or an implementable cross-contract authorization path.",
    "No compatibility or scientific SUPPORTS can be inferred from a source-only hypothesis."
  ]
};
fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n");
console.log("OECL_GENERIC_EFFECT_DISCOVERY:"+JSON.stringify({
  hypotheses:good.hypotheses.length,negativeControls:controls.length,
  syntheticTransfer:portable.hypotheses.length,evidence:report.evidenceOrigin,
  admission:report.admission,scientificPolarity:report.scientificPolarity
}));
