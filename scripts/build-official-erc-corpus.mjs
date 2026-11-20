/**
 * Parse EVERY ERC in a checked-out revision of official ethereum/ERCs.
 * The result is documentary, NEVER a proof of composition.
 */
import { readdir,readFile,writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve,join } from "node:path";
const sourceDir=resolve(process.env.OECL_OFFICIAL_ERC_CHECKOUT||"official-ercs");
const outputDir=resolve("web/src/data");
const revision=execFileSync("git",["-C",sourceDir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
const treeSha=execFileSync("git",["-C",sourceDir,"rev-parse","HEAD^{tree}"],{encoding:"utf8"}).trim();
if(!/^[a-f0-9]{40}$/.test(revision)||!/^[a-f0-9]{40}$/.test(treeSha))throw Error("Invalid ERC source revision");
const files=(await readdir(join(sourceDir,"ERCS"))).filter(x=>/^erc-\d+\.md$/i.test(x)).sort((a,b)=>
Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
if(files.length<300)throw Error("Incomplete ERC checkout.");
function normalizedRefs(text,max=120){
 const refs=[];
 for(const m of text.matchAll(/\b(?:ERC|EIP)[- ]?([1-9]\d{0,6})\b/gi)) {
  refs.push(Number(m[1]));
  if(refs.length>2000)break;
 }
 return [...new Set(refs)].sort((a,b)=>a-b).slice(0,max);
}
function parseFrontmatter(body) {
 const m=/^---\s*\r?\n([\s\S]{0,12000}?)\r?\n---/.exec(body.replace(/^\uFEFF/,""));
 const f={};for(const line of (m?.[1]??"").split(/\r?\n/)){
  const n=/^([a-z][a-z-]*):\s*(.*)$/i.exec(line);
  if(n)f[n[1].toLowerCase()]=n[2].trim().replace(/^["']|["']$/g,"");
 }
 return f;
}
const profiles=[];
for(const file of files) {
 const n=Number(file.match(/\d+/)[0]);
 const body=await readFile(join(sourceDir,"ERCS",file),"utf8");
 const meta=parseFrontmatter(body);
 const requires=[...new Set((meta.requires??"").split(/[,\s]+/).filter(Boolean)
 .map(x=>Number(x.replace(/^(?:EIP|ERC)-?/i,""))).filter(x=>Number.isInteger(x)&&x>0))].sort((a,b)=>a-b);
 const references=normalizedRefs(body.slice(0,250000)).filter(x=>x!==n);
 const abstract=/^##\s+Abstract\s*\r?\n([\s\S]*?)(?=^##\s+|$(?![\s\S]))/im.exec(body);
 const summary=(abstract?.[1]??"").replace(/<[^>]*>/g," ").replace(/\[[^\]]+\]\([^)]+\)/g," ")
 .replace(/[#*_]/g,"").replace(/\s+/g," ").trim().slice(0,340);
 profiles.push({
   id:"ERC-"+n,number:n,title:meta.title??null,specAuthors:meta.author??null,
   editorialStatus:meta.status??null,created:meta.created??null,
   requires:requires.map(x=>"ERC-"+x),
   references:references.map(x=>"ERC-"+x),
   summary:summary||null,
   discussionUrl:meta["discussions-to"]??null,
   sourceUrl:"https://github.com/ethereum/ERCs/blob/"+revision+"/ERCS/"+file,
   evidenceKind:"OFFICIAL_GITHUB_DOCUMENT",
   sourceRevision:revision,
   experimentStatus:"NOT_EVALUATED"
 });
}
if(new Set(profiles.map(x=>x.id)).size!==profiles.length)throw Error("Duplicate canonical ERC document");
const idx={schemaVersion:"OECL_OFFICIAL_ERC_INDEX_V1",source:"ethereum/ERCs",
 branch:"master",sourceTreeSha:treeSha,sourceCommitSha:revision,
 description:"Official GitHub ERC documents; indexed presence only, not composition validation",
 count:profiles.length,ids:profiles.map(x=>x.number)};
const corpus={schemaVersion:"OECL_ERC_DOCUMENTARY_CORPUS_V1",
 provenance:{repository:"ethereum/ERCs",sourceCommitSha:revision,sourceTreeSha:treeSha,
  collectionMethod:"PINNED_GIT_CHECKOUT_PARSE",documentCount:profiles.length},
 limitations:["A declared requires relationship does not establish runtime compatibility.",
  "Textual references and forum discussions are not execution evidence.",
  "No emergent property has been certified by this documentary corpus."],
 profiles};
await writeFile(join(outputDir,"officialErcIndex.json"),JSON.stringify(idx,null,2)+"\n");
await writeFile(join(outputDir,"officialErcCorpus.json"),JSON.stringify(corpus,null,2)+"\n");
const linked=profiles.reduce((n,p)=>n+p.requires.length,0);
console.log("OECL_OFFICIAL_CORPUS_COMPLETE "+JSON.stringify({
 documents:profiles.length,declaredRequires:linked,sourceCommitSha:revision,
 missingTitle:profiles.filter(x=>!x.title).length
}));
