import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,lstatSync} from "node:fs";
import {join,resolve} from "node:path";
const folder=resolve(process.argv[2]||"official-ercs/ERCS");
const report=JSON.parse(readFileSync(resolve(process.argv[3]||
 "audit-output/deep-erc-scientific-hypotheses.json"),"utf8"));
const profiles=JSON.parse(readFileSync(new URL("./erc-semantic-review-profiles.json",import.meta.url),"utf8"));
const agenda=JSON.parse(readFileSync(resolve(process.argv[4]||
 "audit-output/all-erc-scientific-falsification-agenda.json"),"utf8"));
const hash=x=>createHash("sha256").update(x).digest("hex");
assert.equal(report.schemaVersion,"OECL_54_ERC_SOURCE_ANCHORED_SEMANTIC_HYPOTHESIS_REVIEW_V1");
assert.equal(report.sourcePin.revision,"e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d");
assert.equal(report.sourcePin.repository,"ethereum/ERCs");
assert.equal(report.scientificVerdict,"NOT_EVALUATED");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.equal(report.evmExecuted,false);
assert.equal(report.records.length,54);
assert.equal(report.summary.coveredHistoricalGaps,54);
assert.equal(report.summary.curatedConditionalHypothesisDesigns,13);
assert.equal(report.summary.stillAwaitingDetailedSemanticReview,41);
assert.equal(report.summary.independentExperimentsExecuted,0);
assert.equal(report.summary.evmExperimentsExecuted,0);
assert.equal(report.summary.discoveredVulnerabilities,0);
assert.equal(report.sourcePin.all626AgendaSha256,
  hash(readFileSync(resolve(process.argv[4]||
   "audit-output/all-erc-scientific-falsification-agenda.json"))));
const catalog=new Map(agenda.standards.map(d=>[d.ercId,d]));
assert.equal(catalog.size,626);
const curated=new Map(profiles.entries.map(p=>[p.ercId,p]));
assert.equal(curated.size,13);
const seen=new Set();
let reviewed=0,pending=0;
for(const record of report.records){
 assert(!seen.has(record.ercId),"Duplicated document");
 seen.add(record.ercId);
 assert.equal(record.evmExecuted,false);
 assert.equal(record.scientificVerdict,"NOT_EVALUATED");
 assert.equal(record.globalCompatibility,"NOT_EVALUATED");
 assert.equal(record.candidateAdmission,"NOT_ADMITTED");
 assert.equal(record.risk,"NO_VERIFIED_SECURITY_VULNERABILITY");
 const standard=catalog.get(record.ercId);
 assert(standard&&standard.anchoredFallback,"Not an original source gap");
 assert.equal(record.source.documentSha256,standard.sourceSha256);
 assert.deepEqual(record.source.excerptAnchor,standard.anchoredFallback);
 const source=join(folder,record.ercId.toLowerCase()+".md");
 const st=lstatSync(source);
 assert(st.isFile()&&!st.isSymbolicLink());
 const file=readFileSync(source);
 const original=file.toString("utf8");
 const lines=original.split(/\r?\n/);
 assert.equal(hash(file),record.source.documentSha256);
 const cue=record.source.excerptAnchor;
 assert.equal(hash(Buffer.from(lines[cue.location.line-1])),cue.sourceLineSha256);
 assert.equal(lines[cue.location.line-1].trim().slice(0,180),cue.sourceExcerpt);
 const question=agenda.researchQuestions.find(q=>q.taskId===record.documentaryQuestionId);
 assert(question&&question.ercId===record.ercId);
 assert.equal(question.experimentalResult,"NOT_EXECUTED");
 assert.equal(question.evmExecuted,false);
 const quote=record.source.supportingLine;
 if(record.hypothesis){
   const profile=curated.get(record.ercId);
   assert(profile&&quote,"Curated hypothesis has no second exact source anchor");
   assert.equal(record.stage,"SCOPED_HYPOTHESIS_DESIGNED_REVIEW_REQUIRED");
   assert.equal(record.hypothesis.mechanism,profile.mechanism);
   assert.equal(record.hypothesis.conditionalHypothesis,profile.conditionalHypothesis);
   assert.equal(record.hypothesis.falsificationCriterion,profile.falsificationCriterion);
   assert.equal(record.hypothesis.approval,"HUMAN_SEMANTIC_REVIEW_REQUIRED");
   assert.equal(record.hypothesis.hypothesisStatus,"PROPOSED_NOT_INDEPENDENTLY_TESTED");
   assert.equal(record.hypothesis.evmExecuted,false);
   assert.equal(record.hypothesis.scientificVerdict,"NOT_EVALUATED");
   assert.equal(record.hypothesis.candidateAdmission,"NOT_ADMITTED");
   assert.equal(hash(Buffer.from(lines[quote.line-1])),quote.sourceLineSha256);
   assert(lines[quote.line-1].includes(profile.supportPhrase));
   assert.equal(quote.excerpt,lines[quote.line-1].trim().slice(0,200));
   assert(record.hypothesis.requiredIndependentEvidence.length>=2);
   assert(record.hypothesis.uncertainties.length>=1);
   reviewed++;
 }else{
   assert(!curated.has(record.ercId),"Curated profile was silently dropped");
   assert.equal(record.stage,"CONTEXTUAL_SEMANTIC_REVIEW_PENDING");
   assert.equal(quote,null);
   assert(record.missingScience.length>=3);
   pending++;
 }
 assert(record.source.nearbySourceContext.length>=1);
 for(const context of record.source.nearbySourceContext){
   assert.equal(hash(Buffer.from(lines[context.line-1])),context.sha256);
   assert.equal(lines[context.line-1].slice(0,240),context.text);
 }
 // The document digest gate must reject even a one-character mutation.
 const mutated=Buffer.concat([file,Buffer.from(" ")]);
 assert.notEqual(hash(mutated),record.source.documentSha256);
}
assert.equal(reviewed,13);
assert.equal(pending,41);
assert.equal(seen.size,54);
for(const id of ["ERC-55","ERC-191","ERC-2535","ERC-7201","ERC-7837"]){
 assert(report.records.some(x=>x.ercId===id&&x.hypothesis),"Critical research example missing");
}
console.log("OECL_54_ERC_DEEP_SCIENTIFIC_RESEARCH_PROVENANCE_PASS",JSON.stringify({
 documents:54,curatedConditionalDesigns:reviewed,awaitingSemanticReview:pending,
 sourceHashesVerified:54,independentEvmWitnesses:0,scientificVerdict:"NOT_EVALUATED"}));
