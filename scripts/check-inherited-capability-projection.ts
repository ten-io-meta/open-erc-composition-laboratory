import assert from "node:assert/strict";
import { SolidityScientificSourceFactExtractor } from "../laboratory/scientific-source-fact/SolidityScientificSourceFactExtractor.js";
import { ScientificSolidityInheritanceGraphEngine } from "../laboratory/scientific-solidity-inheritance/ScientificSolidityInheritanceGraphEngine.js";
import { ScientificInheritedCapabilityProjectionEngine } from "../laboratory/scientific-inherited-capability/ScientificInheritedCapabilityProjectionEngine.js";
import type { ScientificSourceObservation } from "../laboratory/scientific-source-observation/ScientificSourceObservation.js";

const extractor=new SolidityScientificSourceFactExtractor();
const sourceA=`pragma solidity ^0.8.20;
contract SourceBase {
  function burn(uint256 amount) public virtual {}
  function _burn(uint256 amount) internal virtual {}
}`;
const sourceB=`pragma solidity ^0.8.20;
contract Candidate is SourceBase {
  function check() external {}
}`;
function observe(id:string,revision:string,rawText:string):ScientificSourceObservation{
    return {observationId:"OBS-"+id,sourceId:id,sourceType:"GITHUB",
        sourceRevision:revision,kind:"CONTRACT_SOURCE",
        locator:{sourceLocation:"fixture://"+id,filePath:id+".sol",
            startLine:1,endLine:rawText.split(/\r?\n/).length},rawText};
}
const a=extractor.extract(observe("A","a".repeat(40),sourceA));
const b=extractor.extract(observe("B","b".repeat(40),sourceB));
const facts=[...a,...b];
const graph=new ScientificSolidityInheritanceGraphEngine().build({facts});
assert.deepEqual(graph.errors,[]);
const root=b.find(x=>x.kind==="CONTRACT_DECLARATION"&&x.symbol==="Candidate")!;
assert.ok(root);
const engine=new ScientificInheritedCapabilityProjectionEngine();
const result=engine.project({graph,facts,rootDeclarationFactId:root.factId,symbols:["burn","_burn"]});
assert.equal(result.status,"RESOLVED",JSON.stringify(result.unresolved));
assert.deepEqual(result.capabilities.map(x=>x.symbol),["_burn","burn"]);
assert.ok(result.capabilities.every(x=>x.depth===1 && x.inheritanceEdgeIds.length===1));
assert.ok(result.capabilities.every(x=>x.sourceId==="A" && x.sourceRevision==="a".repeat(40)));
const rootDirect=a.find(x=>x.kind==="CONTRACT_DECLARATION"&&x.symbol==="SourceBase")!;
const direct=engine.project({graph,facts,rootDeclarationFactId:rootDirect.factId,symbols:["burn"]});
assert.equal(direct.status,"RESOLVED");
assert.equal(direct.capabilities.length,1);
assert.equal(direct.capabilities[0].depth,0);
assert.deepEqual(direct.capabilities[0].inheritanceEdgeIds,[]);
const noFacts=engine.project({graph,facts:b,rootDeclarationFactId:root.factId,symbols:["burn"]});
assert.equal(noFacts.status,"INCOMPLETE");
assert.ok(noFacts.unresolved.length>0);
const wrongLineage=structuredClone(facts);
wrongLineage.find(x=>x.factId===root.factId)!.sourceRevision="0".repeat(40);
const altered=engine.project({graph,facts:wrongLineage,rootDeclarationFactId:root.factId,symbols:["burn"]});
assert.equal(altered.status,"INCOMPLETE");
const wrongEdge=structuredClone(graph);
wrongEdge.edges[0].objectSourceRevision="0".repeat(40);
const inconsistent=engine.project({graph:wrongEdge,facts,rootDeclarationFactId:root.factId,symbols:["burn"]});
assert.equal(inconsistent.status,"INCOMPLETE");
const missingRoot=engine.project({graph,facts,rootDeclarationFactId:"NOT-ROOT",symbols:["burn"]});
assert.equal(missingRoot.status,"INCOMPLETE");
const disjoint=engine.project({graph,facts,rootDeclarationFactId:root.factId,symbols:["unknown"]});
assert.equal(disjoint.status,"RESOLVED");
assert.equal(disjoint.capabilities.length,0);
const missingParentGraph=structuredClone(graph);
missingParentGraph.edges=[];
missingParentGraph.unresolvedInheritanceReferences.push({
    inheritanceReferenceId:"MISSING-A",subjectDeclarationFactId:root.factId,
    subjectContainerSymbol:"Candidate",inheritedSymbol:"SourceBase",reason:"NO_DECLARATION_MATCH"
});
const unresolved=engine.project({graph:missingParentGraph,facts,rootDeclarationFactId:root.factId,symbols:["burn"]});
assert.equal(unresolved.status,"INCOMPLETE");
assert.equal(unresolved.capabilities.length,0);
console.log("PASS: source-anchored inherited capability projection, depth and 6 adversarial boundaries");
