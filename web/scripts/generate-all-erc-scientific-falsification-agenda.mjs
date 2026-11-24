import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync,lstatSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {parseOfficialErc} from "../src/server/oeclErcDocumentaryDiscovery.ts";
import {anchoredSpecCue} from "./oecl-spec-anchor.mjs";

const corpusDir=resolve(process.argv[2]||"official-ercs/ERCS");
const matrixPath=resolve(process.argv[3]||"audit-output/all-erc-documentary-matrix.json");
const output=resolve(process.argv[4]||"audit-output/all-erc-scientific-falsification-agenda.json");
const raw=readFileSync(matrixPath);
const matrix=JSON.parse(raw.toString("utf8"));
const sha256=x=>createHash("sha256").update(x).digest("hex");
const pin="e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d";
assert.equal(matrix.schemaVersion,"OECL_ALL_ERC_DOCUMENTARY_MATRIX_V1");
assert.equal(matrix.provenance.repository,"ethereum/ERCs");
assert.equal(matrix.provenance.revision,pin);
assert.equal(matrix.evidenceLevel,"SPECIFICATION_ONLY");
assert.equal(matrix.scientificVerdict,"NOT_EVALUATED");
assert.equal(matrix.candidateAdmission,"NOT_ADMITTED");
assert.equal(matrix.evmExecuted,false);
assert.equal(matrix.summary.documentsScanned,626,"Pinned documentary snapshot has changed");
assert.equal(matrix.documents.length,matrix.summary.documentsScanned);
assert.equal(matrix.summary.documentsParsed,626);
assert.equal(matrix.summary.pairsInspected,195625);
const ids=new Set(matrix.documents.map(d=>d.id));
assert.equal(ids.size,626);
const tasks=[],byErc=[],counts={normative:0,interface:0,prerequisite:0,textAnchored:0,externalNeedsReview:0,withoutExtractedRules:0};
for(const record of matrix.documents){
  const filename=record.id.toLowerCase()+".md";
  const file=join(corpusDir,filename);
  const st=lstatSync(file);
  assert(st.isFile()&&!st.isSymbolicLink(),"Unsafe standard document");
  const bytes=readFileSync(file);
  const documentSha256=sha256(bytes);
  assert.equal(record.sourceSha256,documentSha256);
  const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  const doc=parseOfficialErc(record.id,text);
  assert(doc&&doc.availability==="PUBLISHED");
  assert.equal(doc.provenance.sha256,documentSha256);
  assert.deepEqual(doc.requires,record.requires);
  assert.deepEqual(doc.interfaceNames,record.interfaceNames);
  assert.equal(doc.title,record.title);
  assert.equal(doc.status,record.officialStatus);
  const evidence=[];
  const add=(kind,fragment,question,falsifier,requiredEvidence,mode)=>{
    assert(typeof fragment==="string"&&fragment.trim()&&fragment.length<=320);
    const taskId="ERC-QUESTION-"+sha256(Buffer.from(JSON.stringify({
      pin,id:record.id,documentSha256,kind,fragment
    }))).slice(0,24);
    assert(requiredEvidence.length>0);
    evidence.push({taskId,ercId:record.id,kind,
      documentRevision:pin,documentSha256,fragment,
      sourceOfClaim:"OFFICIAL_PINNED_SPECIFICATION_ONLY",
      researchQuestion:question,
      falsificationCriterion:falsifier,
      requiredIndependentEvidence:requiredEvidence,
      scope:mode,
      status:"DOCUMENTARY_QUESTION_ONLY",
      experimentalResult:"NOT_EXECUTED",
      evmExecuted:false,
      scientificVerdict:"NOT_EVALUATED",
      candidateAdmission:"NOT_ADMITTED"});
  };
  // A normative statement is not a verified implementation invariant.
  const normative=doc.requirements.find(x=>/\bMUST\b|\bSHALL\b/.test(x));
  if(normative){
    add("NORMATIVE_CLAIM_BOUNDARY",normative,
      "Does a reviewed implementation of this exact ERC satisfy the quoted normative statement for all applicable conditions?",
      "Find a pinned implementation and reproducible state/transaction witness violating this exact statement under its documented assumptions.",
      ["Full normative context and exception clauses","Pinned implementation and source/bytecode identity","Counterexample with independent state/event/trace checks"],
      "REQUIRES_SEMANTIC_CONTEXT_AND_IMPLEMENTATION");
    counts.normative++;
  }
  // The parser extracts names only. Do not falsely claim ABI conformance.
  if(doc.interfaceNames.length){
    const symbol=doc.interfaceNames[0];
    add("DOCUMENTED_INTERFACE_NAME_BOUNDARY",symbol,
      "Does a concrete claimed implementation implement the documented interface element with the correct full ABI and behavior?",
      "Demonstrate a material signature or behavior mismatch in a reviewed claimed implementation; name similarity alone does not prove one.",
      ["Typed canonical interface and inheritance","Pinned compiled contract ABI","Positive, negative and permission-specific EVM checks"],
      "NAME_ONLY_UNTYPED_NOT_ABI_PROOF");
    counts.interface++;
  }
  // Requires can reference core EIPs as well as ERCs.
  if(doc.requires.length){
    const dependency=doc.requires[0];
    add("DECLARED_PREREQUISITE_BOUNDARY",dependency,
      "Under the exact declared dependency, does a concrete implementation fulfill the prerequisite semantics?",
      "Produce a reviewed source/behavior counterexample showing the prerequisite is not satisfied under the declared relationship.",
      ["Prerequisite specification from its own immutable revision","Pinned implementation graphs and source evidence","Role, authorization and failure-case EVM tests"],
      "PREREQUISITE_MAY_BE_CORE_EIP_OR_ERC");
    counts.prerequisite++;
  }
  // Extract a source-anchored research cue only after simpler exact metadata rules fail.
  let anchoredCue=null;
  if(!evidence.length){
    anchoredCue=anchoredSpecCue(record.id,text);
    if(anchoredCue?.evidenceType==="EXTERNAL_SPECIFICATION_REFERENCE"){
      counts.externalNeedsReview++;
    }else if(anchoredCue){
      add("TEXT_ANCHORED_SPECIFICATION_CUE",anchoredCue.sourceExcerpt,
        "Does a pinned implementation or independently checkable model satisfy the exact cited behavior, including its documented conditions and exceptions?",
        "An independently reproducible, correctly scoped counterexample to the clarified implementation claim would falsify that claim, not the specification itself.",
        ["Review the complete cited section, its exceptions and current normative status",
         "Pin an implementation or formal reference model with exact version and code identity",
         "Produce suitable positive and negative controls with an authenticated observation"],
        "SOURCE_TEXT_RESEARCH_QUESTION_NOT_AN_EXECUTABLE_TEST");
      evidence[evidence.length-1].sourceAnchor=anchoredCue;
      evidence[evidence.length-1].status="SOURCE_ANCHORED_QUESTION_REQUIRES_SEMANTIC_REVIEW";
      counts.textAnchored++;
    }
  }
  // Do not invent a falsifiable question if neither the document nor an external
  // specification supplies a reviewable mechanism in the bounded extractor.
  if(!evidence.length)counts.withoutExtractedRules++;
  assert(evidence.length<=3);
  byErc.push({
    ercId:record.id,title:record.title,officialStatus:record.officialStatus,
    sourceRevision:pin,sourceSha256:documentSha256,
    sourceAvailable:true,
    matchingPinnedImplementationProfile:record.implementationProfileRegistered,
    sourceMetadata:{declaredPrerequisiteCount:doc.requires.length,
      declaredInterfaceNameCount:doc.interfaceNames.length,
      boundedExtractedRequirementCount:doc.requirements.length},
    proposedFalsificationQuestions:evidence.length,
    investigationStatus:evidence.length?
      (anchoredCue?"SOURCE_ANCHORED_QUESTION_NEEDS_SEMANTIC_REVIEW":"DOCUMENTARY_HYPOTHESES_PROPOSED"):
      (anchoredCue?.evidenceType==="EXTERNAL_SPECIFICATION_REFERENCE"?
       "EXTERNAL_NORMATIVE_DOCUMENT_REQUIRES_PINNING":
       "EXTRACTION_LIMIT_NO_GROUNDED_FALSIFICATION_QUESTION"),
    anchoredFallback:anchoredCue,
    implementationVerdict:"NOT_EVALUATED",evmExecuted:false,
    nextEvidenceStep:record.implementationProfileRegistered?
      "REVIEW_PINNED_IMPLEMENTATION_AND_EXPERIMENT_ADAPTER":
      "FIND_AND_PIN_A_CONCRETE_IMPLEMENTATION_OR_FORMAL_MODEL"
  });
  tasks.push(...evidence);
}
assert.equal(byErc.length,626);
assert.equal(new Set(tasks.map(x=>x.taskId)).size,tasks.length);
assert.equal(counts.normative+counts.interface+counts.prerequisite+counts.textAnchored,tasks.length);
assert.equal(counts.withoutExtractedRules,
  byErc.filter(x=>x.proposedFalsificationQuestions===0).length);
assert(tasks.every(x=>x.evmExecuted===false&&x.scientificVerdict==="NOT_EVALUATED"));
const report={
  schemaVersion:"OECL_ALL_626_ERC_SCIENTIFIC_FALSIFICATION_AGENDA_V1",
  origin:"PINNED_OFFICIAL_SPECIFICATIONS_AND_BOUNDED_DETERMINISTIC_RULES",
  snapshot:{repository:matrix.provenance.repository,revision:pin,
    corpusMatrixSha256:sha256(raw)},
  evidenceLevel:"SPECIFICATION_ONLY",
  scientificVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",evmExecuted:false,
  summary:{
    standardsInspected:626,standardsWithQuestions:
      byErc.filter(x=>x.proposedFalsificationQuestions>0).length,
    standardsWithoutExtractedFalsifiableClaims:counts.withoutExtractedRules,
    questionsProposed:tasks.length,
    questionKinds:counts,
    registeredImplementationProfilesInSnapshot:
      byErc.filter(x=>x.matchingPinnedImplementationProfile).length,
    documentaryPairCoverage:matrix.summary.pairsInspected,
    astExperimentsExecutedByAgenda:0,evmExperimentsExecutedByAgenda:0
  },
  limitations:[
    "All 626 ERC files are included, but a blank extracted rule is an evidence gap, not a scientific hypothesis.",
    "Fallback source lines are exact-byte anchored research cues, not independently verified normative obligations.",
    "Withdrawn or stagnant proposals are historic research subjects, not automatically recommended standards.",
    "External specification references require separate source pinning before conformance claims.",
    "A normative line requires semantic context including exceptions; interface names are not ABI signatures.",
    "Questions are NOT proofs of vulnerabilities, implementation compatibility, or executed falsification.",
    "Prerequisites may refer to core EIPs or external revisions outside this 626-ERC snapshot.",
    "Only registered immutable implementation profiles can be considered for subsequent source experiments.",
    "The 195625 pair comparisons are documentary relations, not independent source or EVM tests.",
    "Extending AST/EVM coverage safely requires immutable code pinning, reviewed adapters, negative controls and isolated execution."
  ],
  standards:byErc,researchQuestions:tasks
};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log("OECL_ERC_GROUNDED_EXTRACTION_GAPS",JSON.stringify(
  byErc.filter(x=>x.proposedFalsificationQuestions===0)
    .map(x=>({id:x.ercId,title:x.title,status:x.officialStatus,
      requirements:x.sourceMetadata.boundedExtractedRequirementCount,
      interfaces:x.sourceMetadata.declaredInterfaceNameCount,
      prerequisites:x.sourceMetadata.declaredPrerequisiteCount}))
));
console.log("OECL_ALL_626_ERC_SCIENTIST_AGENDA_PASS",JSON.stringify(report.summary));
