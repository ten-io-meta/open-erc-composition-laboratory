import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readdirSync,readFileSync,lstatSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {parseOfficialErc,deriveRelation,proposeDocumentaryTests}
  from "../src/server/oeclErcDocumentaryDiscovery.ts";
import {designAutonomousResearch} from "../src/server/oeclAutonomousResearchPlanner.ts";
import registry from "../../laboratory/scientific-open-source-worker/source-registry.json" with {type:"json"};

// Documentary-only exhaustive run. Does not compile or execute any ERC Solidity.
const pinned="e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d";
const directory=resolve(process.argv[2]||"official-ercs/ERCS");
const output=resolve(process.argv[3]||"audit-output/all-erc-documentary-matrix.json");
const hash=x=>createHash("sha256").update(x).digest("hex");
const names=readdirSync(directory).filter(x=>/^erc-[1-9][0-9]{0,7}\.md$/.test(x))
  .sort((a,b)=>Number(a.slice(4,-3))-Number(b.slice(4,-3)));
assert.ok(names.length>=600&&names.length<=10000,"Unexpected pinned ERC catalog size");
const docs=[],documents=[];
for(const name of names){
  const id="ERC-"+name.slice(4,-3),file=join(directory,name);
  const st=lstatSync(file);
  assert.ok(st.isFile()&&!st.isSymbolicLink(),"Unsafe ERC document type: "+name);
  const bytes=readFileSync(file),sourceSha256=hash(bytes);
  let parsed=null,reason=null;
  if(bytes.byteLength>400000)reason="DOCUMENT_TOO_LARGE";
  else {
    try{parsed=parseOfficialErc(id,new TextDecoder("utf-8",{fatal:true}).decode(bytes));}
    catch{reason="DECODE_OR_PARSE_FAILED";}
    if(!parsed&&!reason)reason="UNSUPPORTED_OR_INVALID_SPECIFICATION";
  }
  if(parsed)assert.equal(parsed.provenance.sha256,sourceSha256);
  docs.push(parsed||{id,availability:"UNPARSEABLE_SPECIFICATION",requires:[],interfaceNames:[]});
  documents.push({id,sourceSha256,bytes:bytes.byteLength,
    status:parsed?"PARSED":"UNPARSEABLE",reason,
    title:parsed?.title??null,officialStatus:parsed?.status??null,
    requires:parsed?.requires??[],interfaceNames:parsed?.interfaceNames??[],
    implementationProfileRegistered:registry.sources.some(x=>x.id===id),
    scientificVerdict:"NOT_EVALUATED",evmExecuted:false});
}
assert.equal(new Set(documents.map(x=>x.id)).size,documents.length,"Duplicate ID");
const categories=["DECLARED_DEPENDENCY","SHARED_DEPENDENCY",
  "NO_DECLARED_DEPENDENCY","INCOMPLETE_SPECIFICATIONS"];
const zero=()=>Object.fromEntries(categories.map(x=>[x,0]));
const counts=zero(),perErc=Object.fromEntries(documents.map(x=>[x.id,zero()]));
const directDependencyPairs=[],samples=[];
let pairs=0,designs=0,autonomousPairCandidates=0,autonomousHypotheses=0,
  autonomousAbstentions=0,autonomousPerStandardOnly=0,autonomousIncomplete=0;
const autonomousSamples=[];
for(let i=0;i<docs.length;i++){
  for(let j=i+1;j<docs.length;j++){
    const a=docs[i],b=docs[j],relation=deriveRelation(a,b);
    assert.ok(Object.hasOwn(counts,relation.kind),"Unknown documentary category");
    assert.equal(relation.kind,deriveRelation(b,a).kind,"Asymmetric relation category");
    counts[relation.kind]++;perErc[a.id][relation.kind]++;perErc[b.id][relation.kind]++;
    if(relation.kind==="DECLARED_DEPENDENCY")
      directDependencyPairs.push({a:a.id,b:b.id,basis:relation.statements});
    if(relation.kind==="INCOMPLETE_SPECIFICATIONS"&&samples.length<30)
      samples.push({a:a.id,b:b.id});
    const questions=proposeDocumentaryTests(a,b);
    assert.ok(questions.length<=3&&questions.every(q=>q.requiredEvidence?.length>0));
    designs+=questions.length;
    const scientific=designAutonomousResearch({
      status:"DOCUMENTARY_COMPARISON",scope:"OFFICIAL_ERC_SPECIFICATIONS_ONLY",
      protocols:[a.id,b.id],standards:[a,b],
      scientificVerdict:"NOT_EVALUATED",candidateAdmission:"NOT_ADMITTED",
      implementationVerified:false,evmExecuted:false,
    });
    assert.equal(scientific.pairKey,[a.id,b.id].join("|"));
    assert.equal(scientific.evmExecuted,false);
    assert.equal(scientific.sourceCompiled,false);
    assert.equal(scientific.experimentDispatched,false);
    assert.equal(scientific.compatibilityVerdict,"NOT_EVALUATED");
    assert.equal(scientific.candidateAdmission,"NOT_ADMITTED");
    assert.ok(scientific.hypotheses.length<=6);
    assert.ok(scientific.hypotheses.every(h=>h.anchors.length>0&&h.falsifier&&
      h.positiveControl&&h.negativeControl&&h.hypothesisStatus==="PROPOSED_FOR_HUMAN_SEMANTIC_REVIEW"));
    autonomousHypotheses+=scientific.hypotheses.length;
    if(scientific.planningStatus==="CROSS_STANDARD_CANDIDATES_FOR_REVIEW")
      autonomousPairCandidates++;
    else if(scientific.planningStatus==="SINGLE_STANDARD_ONLY_NO_COMPOSITION_INFERRED")
      autonomousPerStandardOnly++;
    else if(scientific.planningStatus==="ABSTAINED_NO_SUPPORTED_ANCHORS")
      autonomousAbstentions++;
    else autonomousIncomplete++;
    if(autonomousSamples.length<25&&scientific.hypotheses.some(h=>
      h.relationshipScope==="CROSS_STANDARD_CONDITIONAL"))
      autonomousSamples.push({pair:scientific.pairKey,
        families:scientific.hypotheses.map(h=>h.family),
        planSha256:scientific.planSha256,
        sourceSha256:scientific.sourceRevisions.map(d=>d.sha256)});
    pairs++;
  }
}
assert.equal(pairs,docs.length*(docs.length-1)/2);
assert.equal(autonomousPairCandidates+autonomousPerStandardOnly+
  autonomousAbstentions+autonomousIncomplete,pairs);
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),pairs);
for(const doc of documents){
  assert.equal(Object.values(perErc[doc.id]).reduce((a,b)=>a+b,0),docs.length-1);
  assert.equal(doc.evmExecuted,false);
}
const report={
  schemaVersion:"OECL_ALL_ERC_DOCUMENTARY_MATRIX_V1",
  provenance:{repository:"ethereum/ERCs",revision:pinned,glob:"ERCS/erc-*.md"},
  evidenceLevel:"SPECIFICATION_ONLY",scientificVerdict:"NOT_EVALUATED",
  candidateAdmission:"NOT_ADMITTED",evmExecuted:false,
  autonomousScientificDesign:{
    status:"SOURCE_ANCHORED_RESEARCH_AGENDA_ONLY",
    algorithm:"DETERMINISTIC_HYPOTHESIS_FALSIFIER_AND_ABSTENTION_PLANNER",
    documentsRequiredForPairClaim:2,
    pairsPlanned:pairs,pairsWithCrossStandardCandidates:autonomousPairCandidates,
    pairsWithPerStandardOnlyTests:autonomousPerStandardOnly,
    pairsAbstainingWithoutAnchors:autonomousAbstentions,
    pairsWithIncompleteDocuments:autonomousIncomplete,
    totalHypothesisDesigns:autonomousHypotheses,
    generatedEvmAdapters:0,evmExperimentsExecuted:0,independentConfirmations:0,
    samples:autonomousSamples,
    limits:[
      "This deterministic rule-based process is not general autonomous scientific reasoning.",
      "An unparseable ERC remains unknown, never incompatible.",
      "Every proposed clause and falsifier needs semantic review before a test is run.",
      "Source-only proposals cannot establish compatibility or Ethereum runtime behavior."
    ]
  },
  summary:{documentsScanned:docs.length,
    documentsParsed:documents.filter(x=>x.status==="PARSED").length,
    documentsUnparseable:documents.filter(x=>x.status!=="PARSED").length,
    registeredImplementationProfiles:documents.filter(x=>x.implementationProfileRegistered).length,
    pairsInspected:pairs,pairCategories:counts,documentaryTestDesigns:designs},
  limitations:[
    "Every pair classification uses official documentary text, not Solidity or EVM execution.",
    "Absent or unparseable documentary evidence is incomplete, never incompatible.",
    "A shared prerequisite is not an ABI, authorization, economic or custody proof.",
    "A registered Solidity profile does not mean all its possible pairings have been tested.",
    "This immutable official commit is a historical snapshot, not mutable current master."
  ],
  perErc,directDependencyPairs,incompletePairSamples:samples,documents
};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+"\n","utf8");
console.log("OECL_ALL_ERC_DOCUMENTARY_MATRIX_PASS",JSON.stringify(report.summary));
console.log("No EVM tests executed and no compatibility verdict asserted.");
