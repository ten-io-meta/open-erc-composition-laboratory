import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {deflateRawSync} from "node:zlib";
import {readScientificArchive,extractSourceEvidence} from "../src/server/oeclScientificArchive.ts";

const fixture=JSON.parse(readFileSync(new URL("../src/data/oeclAstExamples.json",import.meta.url),"utf8"));
const digest=createHash("sha256").update(JSON.stringify(fixture)).digest("hex");
assert.equal(digest,"93c27209e59493996106305f1652f106e51db8aa24ae7e3ae2d99c8fbd02f978");
assert.equal(fixture.schemaVersion,"OECL_VERIFIED_AST_GRAPH_SAMPLES_V1");
assert.equal(fixture.runId,44968168041);
assert.equal(fixture.workflowSha,"8ca66ecf07522a1ca2b33da20635249147f3a0db");
assert.equal(fixture.views.length,4);
const names=new Set();
for(const view of fixture.views){
  assert.equal(view.schemaVersion,"OECL_VERIFIED_AST_GRAPH_VIEW_V1");
  assert.equal(view.scientificVerdict,"INCONCLUSIVE");
  assert.equal(view.candidateAdmission,"NOT_ADMITTED");
  assert.equal(view.sourceOnly,true);
  assert.equal(view.evmExecuted,false);
  assert.equal(view.pathFeasibility?.scientificVerdict,"INCONCLUSIVE");
  assert.equal(view.pathFeasibility?.candidateAdmission,"NOT_ADMITTED");
  assert.equal(view.pathFeasibility?.evmExecuted,false);
  assert.equal(view.pathFeasibility?.hypotheses.length,view.hypotheses.length);
  assert.equal(view.provenance.runId,fixture.runId);
  assert.equal(view.provenance.workflowSha,fixture.workflowSha);
  assert.match(view.provenance.graphSha256,/^[a-f0-9]{64}$/);
  assert.match(view.provenance.discoverySha256,/^[a-f0-9]{64}$/);
  assert.match(view.provenance.sourceReportSha256,/^[a-f0-9]{64}$/);
  assert.equal(view.counts.hypotheses,view.hypotheses.length);
  const id=view.selected.map(x=>x.id).join("|");
  assert.ok(!names.has(id));names.add(id);
  assert.equal(view.selected.length,2);
  assert.ok(view.nodes.length>0);
  const nodeIds=new Set(view.nodes.map(x=>x.id));
  assert.equal(nodeIds.size,view.nodes.length);
  for(const e of view.edges){
    assert.ok(nodeIds.has(e.from),"Graph edge outside real nodes");
    assert.ok(nodeIds.has(e.to),"Graph edge outside real nodes");
  }
  assert.ok(view.selected.every(x=>/^[a-f0-9]{64}$/.test(x.sourceSha256)));
  assert.ok(view.hypotheses.every(h=>h.status==="SOURCE_ONLY_UNEVALUATED"&&
    h.candidateAdmission==="NOT_ADMITTED"&&h.scientificVerdict==="INCONCLUSIVE"));
}
assert.equal(fixture.views.filter(v=>v.hypotheses.length===0).length,1);
assert.equal(fixture.views.find(v=>v.hypotheses.length===0).discoveryReason,
  "NO_ADMISSIBLE_SOURCE_RELATION_DISCOVERED");

function crc32(buffer){
  let crc=0xffffffff;
  for(const b of buffer){
    crc^=b;
    for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}
function zipFiles(files){
  let offset=0,local=[],central=[];
  for(const [name,body] of Object.entries(files)){
    const data=Buffer.from(JSON.stringify(body));
    const compressed=deflateRawSync(data);
    const filename=Buffer.from(name);
    const crc=crc32(data);
    const h=Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50,0);
    h.writeUInt16LE(20,4);
    h.writeUInt16LE(8,8);
    h.writeUInt32LE(crc,14);
    h.writeUInt32LE(compressed.length,18);
    h.writeUInt32LE(data.length,22);
    h.writeUInt16LE(filename.length,26);
    const c=Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50,0);
    c.writeUInt16LE(20,4);
    c.writeUInt16LE(20,6);
    c.writeUInt16LE(8,10);
    c.writeUInt32LE(crc,16);
    c.writeUInt32LE(compressed.length,20);
    c.writeUInt32LE(data.length,24);
    c.writeUInt16LE(filename.length,28);
    c.writeUInt32LE(offset,42);
    local.push(h,filename,compressed);
    central.push(c,filename);
    offset+=h.length+filename.length+compressed.length;
  }
  const cd=Buffer.concat(central);
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(Object.keys(files).length,8);
  end.writeUInt16LE(Object.keys(files).length,10);
  end.writeUInt32LE(cd.length,12);
  end.writeUInt32LE(offset,16);
  return Buffer.concat([...local,cd,end]);
}
const zip=zipFiles({
  "structural-ast-graph.json":{schemaVersion:"synthetic"},
  "generic-source-hypotheses.json":{schemaVersion:"synthetic"},
  "source-scientific-report.json":{schemaVersion:"synthetic"},
  "request.json":{requestId:"fake"}
});
const result=readScientificArchive(zip);
assert.equal(result.size,4);
assert.equal(extractSourceEvidence(result,"").graph.schemaVersion,"synthetic");
const crcTampered=Buffer.from(zip);
const pos=crcTampered.indexOf(Buffer.from("synthetic"));
if(pos!==-1)crcTampered[pos]^=1;
else crcTampered[40]^=1;
assert.throws(()=>readScientificArchive(crcTampered));
assert.throws(()=>readScientificArchive(zipFiles({"../unsafe.json":{a:1}})),/ARCHIVE_PATH_UNTRUSTED/);
assert.throws(()=>readScientificArchive(Buffer.alloc(10)),/ARCHIVE_SIZE_LIMIT/);
assert.throws(()=>extractSourceEvidence(new Map(),""),
  /ARTIFACT_DOCUMENT_MISSING/);
console.log("OECL_WEB_AST_EXPLORER: PASS · 4 verified CI source views, negative discovery, graph integrity, ZIP traversal/CRC checks");
