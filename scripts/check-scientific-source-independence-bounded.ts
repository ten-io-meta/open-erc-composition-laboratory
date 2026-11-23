import assert from "node:assert/strict";
import {
    SourceIndependenceSetAssessmentEngine
} from "../laboratory/source-independence/SourceIndependenceSetAssessmentEngine.js";
import type {
    SourceIndependenceAssessment
} from "../laboratory/source-independence/SourceIndependenceAssessment.js";

const engine = new SourceIndependenceSetAssessmentEngine();
const pair = (
    a: string,b: string,
    status: SourceIndependenceAssessment["status"],
    count = status === "INDEPENDENT" ? 2 : 0
): SourceIndependenceAssessment => ({
    sourceIds:[a,b],status,
    establishedIndependentSources:count,
    reason: status==="INCONCLUSIVE"?"INSUFFICIENT_PROVENANCE":
        "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
    explanation:"controlled scientific evidence fixture"
});

const two = engine.build(["a","b"],[pair("a","b","INDEPENDENT")]);
assert.deepEqual(two.establishedIndependentSourceIds,["a","b"]);
assert.equal(two.fullyEstablished,true);
assert.equal(two.hasInconclusiveRelationships,false);

const fraudulentCount = engine.build(["a","b"],[
    pair("a","b","INDEPENDENT",0)
]);
assert.equal(fraudulentCount.establishedIndependentSources,0);
assert.equal(fraudulentCount.fullyEstablished,false);

const contradiction = engine.build(["a","b"],[
    pair("a","b","INDEPENDENT"),
    pair("b","a","DEPENDENT")
]);
assert.equal(contradiction.establishedIndependentSources,0);
assert.equal(contradiction.fullyEstablished,false);
assert.equal(contradiction.hasInconclusiveRelationships,true);

const unknown = engine.build(["a","b"],[]);
assert.equal(unknown.establishedIndependentSources,0);
assert.equal(unknown.hasInconclusiveRelationships,true);
const partial = engine.build(["a","b","c"],[
    pair("a","b","INDEPENDENT"),
    pair("a","c","INDEPENDENT"),
    pair("b","c","DEPENDENT")
]);
assert.equal(partial.establishedIndependentSources,2);
assert.equal(partial.fullyEstablished,false);
assert.ok(partial.establishedIndependentSourceIds.every((a,i) =>
    partial.establishedIndependentSourceIds.slice(i+1).every(b =>
        [["a","b"],["a","c"]].some(v =>
            v.includes(a)&&v.includes(b)))));

const many=Array.from({length:33},(_,i)=>"s-"+String(i).padStart(2,"0"));
const missing=engine.build(many,[]);
assert.equal(missing.establishedIndependentSources,0);
assert.equal(missing.fullyEstablished,false);
assert.equal(missing.hasInconclusiveRelationships,true);
const path=engine.build(many,many.slice(1).map((b,i)=>
    pair(many[i],b,"INDEPENDENT")));
assert.equal(path.fullyEstablished,false);
assert.equal(path.establishedIndependentSources,2,
    "Adjacent pairwise evidence must never imply 33-way mutual independence");
const complete=[];
for(let i=0;i<many.length;i++)
    for(let j=i+1;j<many.length;j++)
        complete.push(pair(many[i],many[j],"INDEPENDENT"));
const full=engine.build(many,complete);
assert.equal(full.fullyEstablished,true);
assert.equal(full.establishedIndependentSources,33);
assert.equal(full.hasInconclusiveRelationships,false);
const forged=engine.build(many,complete.concat([
    pair(many[0],many[1],"DEPENDENT")
]));
assert.equal(forged.fullyEstablished,false);
assert.equal(forged.establishedIndependentSources<33,true);

const excessive=engine.build(
    Array.from({length:257},(_,i)=>"excess-"+i),[]);
assert.equal(excessive.establishedIndependentSources,0);
assert.equal(excessive.hasInconclusiveRelationships,true);
const malformed=engine.build(["a","", "b"],[
    pair("a","b","INDEPENDENT")
]);
assert.equal(malformed.establishedIndependentSources,0);
assert.equal(malformed.fullyEstablished,false);

console.log("OECL_SCIENTIFIC_SOURCE_INDEPENDENCE_BOUNDED_FAIL_CLOSED_PASS");
