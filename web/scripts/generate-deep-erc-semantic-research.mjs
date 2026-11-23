import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,lstatSync,mkdirSync,writeFileSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {anchoredSpecCue} from "./oecl-spec-anchor.mjs";

const root=resolve(process.argv[2]||"official-ercs/ERCS");
const agendaFile=resolve(process.argv[3]||"audit-output/all-erc-scientific-falsification-agenda.json");
const output=resolve(process.argv[4]||"audit-output/deep-erc-scientific-hypotheses.json");
const sha256=x=>createHash("sha256").update(x).digest("hex");
const pin="e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d";
const agenda=JSON.parse(readFileSync(agendaFile,"utf8"));
const profiles=JSON.parse(readFileSync(new URL("./erc-semantic-review-profiles.json",import.meta.url),"utf8"));
assert.equal(agenda.schemaVersion,"OECL_ALL_626_ERC_SCIENTIFIC_FALSIFICATION_AGENDA_V1");
assert.equal(agenda.snapshot.revision,pin);
assert.equal(agenda.standards.length,626);
assert.equal(agenda.researchQuestions.length,1189);
assert.equal(agenda.evmExecuted,false);
assert.equal(agenda.scientificVerdict,"NOT_EVALUATED");
assert.equal(profiles.schemaVersion,"OECL_SEMANTIC_RESEARCH_DESIGNS_V1");
assert.equal(profiles.sourceRevision,pin);
assert.equal(profiles.reviewLabel,"CURATED_SOURCE_GROUNDED_TEST_DESIGN_NOT_EXECUTED");

const catalogue=new Map(profiles.entries.map(p=>[p.ercId,p]));
assert.equal(catalogue.size,profiles.entries.length,"Duplicate curated ERC IDs");
const anchors=agenda.standards.filter(x=>x.anchoredFallback?.sourceLineSha256);
assert.equal(anchors.length,54,"Source-backed historical gap count changed");
const allIds=new Set(anchors.map(x=>x.ercId));
assert.equal(allIds.size,54);
for(const profile of profiles.entries){
  assert(allIds.has(profile.ercId),"Profile not based on one of the 54 pinned source gaps");
  for(const field of ["mechanism","supportPhrase","conditionalHypothesis",
    "preconditions","positiveControl","adversarialControl","falsificationCriterion",
    "verificationModality"]){
    assert(typeof profile[field]==="string"&&profile[field].trim().length>=8&&
      profile[field].length<=900,"Invalid research-profile field "+field);
  }
  assert(Array.isArray(profile.requiredIndependentEvidence)&&
    profile.requiredIndependentEvidence.length>=2&&
    profile.requiredIndependentEvidence.every(s=>typeof s==="string"&&s.length>=8));
  assert(Array.isArray(profile.uncertainties)&&profile.uncertainties.length);
  assert.equal(profile.evmExecuted,false);
  assert.equal(profile.compatibilityVerdict,"NOT_EVALUATED");
}
const records=[], seenIds=new Set();
for(const doc of anchors){
  const filepath=join(root,doc.ercId.toLowerCase()+".md");
  const fileStats=lstatSync(filepath);
  assert(fileStats.isFile()&&!fileStats.isSymbolicLink());
  const bytes=readFileSync(filepath);
  assert.equal(sha256(bytes),doc.sourceSha256,"Pinned source changed for "+doc.ercId);
  const source=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  const lines=source.split(/\r?\n/);
  const cue=doc.anchoredFallback;
  const idx=cue.location.line-1;
  assert(idx>=0&&idx<lines.length&&cue.location.sectionLine<=idx);
  assert.equal(sha256(Buffer.from(lines[idx],"utf8")),cue.sourceLineSha256);
  assert.equal(lines[idx].trim().slice(0,180),cue.sourceExcerpt);
  const freshCue=anchoredSpecCue(doc.ercId,source);
  assert.deepEqual(freshCue,cue,"Document extractor provenance changed");
  const related=agenda.researchQuestions.filter(q=>q.ercId===doc.ercId&&
    q.kind==="TEXT_ANCHORED_SPECIFICATION_CUE");
  assert.equal(related.length,1);
  assert.deepEqual(related[0].sourceAnchor,cue);
  assert.equal(related[0].evmExecuted,false);
  assert.equal(related[0].scientificVerdict,"NOT_EVALUATED");
  const id="SEMANTIC-REVIEW-"+sha256(Buffer.from(
    [pin,doc.ercId,doc.sourceSha256,cue.sourceLineSha256].join("|"))).slice(0,24);
  assert(!seenIds.has(id));seenIds.add(id);
  const profile=catalogue.get(doc.ercId);
  let supportingLine=null,hypothesis=null;
  if(profile){
    const matches=lines.map((line,i)=>line.includes(profile.supportPhrase)?i:-1)
      .filter(i=>i>=0);
    assert.equal(matches.length,1,"Missing or ambiguous source phrase for "+doc.ercId);
    const i=matches[0];
    supportingLine={
      line:i+1,sourceLineSha256:sha256(Buffer.from(lines[i],"utf8")),
      excerpt:lines[i].trim().slice(0,200),
      assertedMeaning:"AUTHOR_PROPOSED_SEMANTIC_READING_NOT_A_VERIFIED_INVARIANT"
    };
    hypothesis={
      hypothesisId:"DOC-HYP-"+sha256(Buffer.from(id+"|"+profile.mechanism)).slice(0,24),
      mechanism:profile.mechanism,
      conditionalHypothesis:profile.conditionalHypothesis,
      explicitAssumptions:profile.preconditions,
      positiveControl:profile.positiveControl,
      adversarialControl:profile.adversarialControl,
      falsificationCriterion:profile.falsificationCriterion,
      verificationModality:profile.verificationModality,
      requiredIndependentEvidence:profile.requiredIndependentEvidence,
      uncertainties:profile.uncertainties,
      validityScope:"EXACT_PINNED_DOCUMENT_WITH_CURATED_ASSUMPTIONS_ONLY",
      approval:"HUMAN_SEMANTIC_REVIEW_REQUIRED",
      hypothesisStatus:"PROPOSED_NOT_INDEPENDENTLY_TESTED",
      evidenceScope:"SOURCE_DOCUMENT_PLUS_HUMAN_AUTHORED_EXPERIMENT_DESIGN",
      evmExecuted:false,
      scientificVerdict:"NOT_EVALUATED",
      candidateAdmission:"NOT_ADMITTED"
    };
  }
  const window=[];
  for(let i=Math.max(0,idx-3);i<=Math.min(lines.length-1,idx+3);i++){
    window.push({line:i+1,text:lines[i].slice(0,240),
      sha256:sha256(Buffer.from(lines[i],"utf8"))});
  }
  records.push({
    researchId:id,ercId:doc.ercId,title:doc.title,
    officialStatusAtPinnedRevision:doc.officialStatus,
    source:{repository:"ethereum/ERCs",revision:pin,
      documentSha256:doc.sourceSha256,excerptAnchor:cue,
      supportingLine,nearbySourceContext:window},
    documentaryQuestionId:related[0].taskId,
    sourceCueType:cue.evidenceType,
    stage:hypothesis?"SCOPED_HYPOTHESIS_DESIGNED_REVIEW_REQUIRED":
      "CONTEXTUAL_SEMANTIC_REVIEW_PENDING",
    researchPriority:hypothesis?
      (["ERC-2535","ERC-7201","ERC-7837","ERC-7743","ERC-1822"].includes(doc.ercId)?
        "HIGH_RISK_MECHANISM":"MECHANISM_DESIGN_READY_FOR_REVIEW"):
      "DOCUMENTARY_CONTEXT_REQUIRED",
    hypothesis,
    missingScience:hypothesis?[
      "Human approval of full normative context, exceptions and source version",
      "Independent reference/model or immutable implementation identity",
      "Independent positive and counterexample controls",
      "Admissible verified observations before scientific promotion"
    ]:[
      "Interpret complete source section and distinguish descriptive from normative claims",
      "Identify roles, preconditions, units, scope and external standards",
      "Choose a proposition that is actually falsifiable without circular source evidence",
      "Select a formal/offchain/EVM test only after adequate model and implementation pinning"
    ],
    finding:"NO_INDEPENDENT_IMPLEMENTATION_TEST",
    risk:"NO_VERIFIED_SECURITY_VULNERABILITY",
    evmExecuted:false,scientificVerdict:"NOT_EVALUATED",
    globalCompatibility:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED"
  });
}
const designed=records.filter(x=>x.hypothesis!==null);
const pending=records.filter(x=>x.hypothesis===null);
assert.equal(designed.length,profiles.entries.length);
assert.equal(designed.length+pending.length,54);
assert(records.every(x=>x.source.documentSha256&&x.source.excerptAnchor.sourceLineSha256));
const outputData={
  schemaVersion:"OECL_54_ERC_SOURCE_ANCHORED_SEMANTIC_HYPOTHESIS_REVIEW_V1",
  sourcePin:{repository:"ethereum/ERCs",revision:pin,
    all626AgendaSha256:sha256(readFileSync(agendaFile))},
  summary:{coveredHistoricalGaps:records.length,
    curatedConditionalHypothesisDesigns:designed.length,
    stillAwaitingDetailedSemanticReview:pending.length,
    uniqueReferencedSourceDocuments:allIds.size,
    independentExperimentsExecuted:0,evmExperimentsExecuted:0,
    discoveredVulnerabilities:0},
  evidenceBoundary:"Human-authored scoped research test proposals from original official text; no source line or formatting is implementation proof.",
  scientificVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
  evmExecuted:false,records,
  limitations:[
    "The full pinned document and surrounding clauses govern, not isolated extracted lines.",
    "Proposed controls are test DESIGN, not empirical witnesses or automatically executed code.",
    "No unreviewed text is treated as instructions, deployed code, accepted security evidence or a formal model.",
    "Historic withdrawn/stagnant proposals remain historic research inputs.",
    "Corpus-wide documentary coverage does not imply 626 runnable Solidity contracts or 195625 executable pairings.",
    "Offchain cryptographic and formatting standards require appropriate independent oracles, not unnecessary EVM simulation."
  ]
};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(outputData,null,2)+"\n");
console.log("OECL_54_ERC_SEMANTIC_HYPOTHESES_SCOPED_PASS",
  JSON.stringify(outputData.summary));
