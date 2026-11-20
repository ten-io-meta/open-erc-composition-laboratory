import { readFileSync } from "node:fs";
const index=JSON.parse(readFileSync("web/src/data/officialErcIndex.json","utf8"));
const corpus=JSON.parse(readFileSync("web/src/data/officialErcCorpus.json","utf8"));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
assert(index.count>=300,"Official ERC index suspiciously small");
assert(corpus.provenance.documentCount===index.count,"Corpus and index count differ");
assert(corpus.provenance.sourceCommitSha===index.sourceCommitSha,"Pinned source revisions differ");
assert(corpus.provenance.sourceTreeSha===index.sourceTreeSha,"Pinned tree revisions differ");
assert(corpus.profiles.length===index.count,"Missing official ERC profiles");
const byId=new Map(corpus.profiles.map(p=>[p.id,p]));
assert(byId.size===index.count,"Duplicate ERC profiles");
for(const n of index.ids){
 const p=byId.get("ERC-"+n);
 assert(p&&p.number===n,"Missing ERC-"+n);
 assert(p.sourceRevision===index.sourceCommitSha,"Unpinned source for "+n);
 assert(p.experimentStatus==="NOT_EVALUATED","Documentary text cannot certify "+n);
 assert(p.evidenceKind==="OFFICIAL_GITHUB_DOCUMENT","Invalid evidence type "+n);
 assert(p.sourceUrl.startsWith("https://github.com/ethereum/ERCs/blob/"+index.sourceCommitSha+"/"),"Wrong source URL "+n);
 assert(Array.isArray(p.requires)&&Array.isArray(p.references),"Invalid relations "+n);
 for(const r of p.requires)assert(/^ERC-[1-9]\d*$/.test(r),"Invalid declared requirement "+n);
}
for(const n of [20,165,721,1155]){
 assert(byId.has("ERC-"+n),"Missing well-known ERC-"+n);
}
console.log("OECL_CORPUS_TEST_PASS "+JSON.stringify({
 documents:byId.size,requires:corpus.profiles.reduce((n,p)=>n+p.requires.length,0),
 sourceCommitSha:index.sourceCommitSha, certifiedEmergentProperties:0
}));
