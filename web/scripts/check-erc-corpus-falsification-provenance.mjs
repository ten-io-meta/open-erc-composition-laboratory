import assert from "node:assert/strict";
import {readFileSync,lstatSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";

const docsDir=resolve(process.argv[2]||"official-ercs/ERCS");
const report=JSON.parse(readFileSync(resolve(process.argv[3]||
  "audit-output/all-erc-scientific-falsification-agenda.json"),"utf8"));
const sha256=x=>createHash("sha256").update(x).digest("hex");
const revision="e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d";
assert.equal(report.schemaVersion,"OECL_ALL_626_ERC_SCIENTIFIC_FALSIFICATION_AGENDA_V1");
assert.equal(report.snapshot.repository,"ethereum/ERCs");
assert.equal(report.snapshot.revision,revision);
assert.equal(report.scientificVerdict,"NOT_EVALUATED");
assert.equal(report.candidateAdmission,"NOT_ADMITTED");
assert.equal(report.evmExecuted,false);
assert.equal(report.standards.length,626);
const indexed=new Map(report.standards.map(x=>[x.ercId,x]));
assert.equal(indexed.size,626);
const targeted=[55,600,1080,1328,1387,1388,2678].map(x=>"ERC-"+x);
let anchored=0,unresolved=0;
for(const doc of report.standards){
  const filename=join(docsDir,doc.ercId.toLowerCase()+".md");
  const st=lstatSync(filename);
  assert(st.isFile()&&!st.isSymbolicLink(),"Wrong document kind");
  const text=readFileSync(filename,"utf8");
  const lines=text.split(/\r?\n/);
  assert.equal(sha256(Buffer.from(text)),doc.sourceSha256);
  assert.equal(doc.sourceRevision,revision);
  assert.equal(doc.evmExecuted,false);
  assert.equal(doc.implementationVerdict,"NOT_EVALUATED");
  if(doc.anchoredFallback){
    const a=doc.anchoredFallback;
    assert.equal(a.ercId,doc.ercId);
    assert.equal(a.requiresFullSemanticContext,true);
    assert.equal(a.certainty,"EXACT_TEXT_ANCHOR_ONLY");
    assert(a.location.line>0 && a.location.line<=lines.length);
    assert(a.location.sectionLine>0 && a.location.sectionLine<a.location.line);
    const sourceLine=lines[a.location.line-1];
    assert.equal(sha256(Buffer.from(sourceLine)),a.sourceLineSha256);
    assert.equal(sourceLine.trim().slice(0,180),a.sourceExcerpt);
    if(a.evidenceType!=="EXTERNAL_SPECIFICATION_REFERENCE"){
      const linked=report.researchQuestions.filter(q=>
        q.ercId===doc.ercId&&q.kind==="TEXT_ANCHORED_SPECIFICATION_CUE");
      assert.equal(linked.length,1);
      assert.deepEqual(linked[0].sourceAnchor,a);
      assert.equal(linked[0].experimentalResult,"NOT_EXECUTED");
      assert.equal(linked[0].evmExecuted,false);
      assert.equal(linked[0].scientificVerdict,"NOT_EVALUATED");
      anchored++;
    }
  }
  if(!doc.proposedFalsificationQuestions){
    assert(["EXTRACTION_LIMIT_NO_GROUNDED_FALSIFICATION_QUESTION",
      "EXTERNAL_NORMATIVE_DOCUMENT_REQUIRES_PINNING"].includes(doc.investigationStatus));
    unresolved++;
  }
}
for(const id of targeted){
  const d=indexed.get(id);
  assert(d,"Missing original difficult ERC "+id);
  assert(d.anchoredFallback?.sourceLineSha256,
    "Missing exact source-line anchor for previously unrecognized ERC "+id);
  assert(d.proposedFalsificationQuestions>0,
    "Still no grounded test-design question for ERC "+id);
}
assert.equal(report.summary.standardsInspected,626);
assert.equal(report.summary.questionsProposed,report.researchQuestions.length);
assert.equal(report.summary.standardsWithoutExtractedFalsifiableClaims,unresolved);
assert.equal(report.summary.questionKinds.textAnchored,anchored);
assert.equal(report.summary.astExperimentsExecutedByAgenda,0);
assert.equal(report.summary.evmExperimentsExecutedByAgenda,0);
console.log("OECL_ALL_626_ERC_SOURCE_ANCHOR_PROVENANCE_PASS",JSON.stringify({
  standardsVerified:626,sourceAnchoredQuestions:anchored,
  remainingWithoutQuestion:unresolved,
  targetedPreviouslyUnhandledMechanisms:targeted.length,
  executableTestsRun:0
}));
