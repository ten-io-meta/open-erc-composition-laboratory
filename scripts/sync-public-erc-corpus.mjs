// Reproducible public-document corpus. Run against a pinned clone of ethereum/ERCs.
// Magicians' recent topics are a secondary, fallible documentary index, NEVER a proof.
import {readdir,readFile,mkdir,writeFile} from "node:fs/promises";
import {execFileSync} from "node:child_process";
import {resolve,join,dirname} from "node:path";
import {parseOfficialErc,indexedDiscussionIds} from "./lib/erc-corpus.mjs";
const flags = process.argv.slice(2);
function option(key,fallback){const i=flags.indexOf(key);return i>=0?flags[i+1]:fallback}
const root=resolve(option("--erc-root","./.cache/ethereum-ERCs"));
const output=resolve(option("--output","web/src/data/publicErcCorpus.json"));
const pages=Math.max(0,Math.min(3,Number(option("--magicians-pages","2"))||0));
const directory=join(root,"ERCS");
const files=(await readdir(directory)).filter(name=>/^erc-[1-9]\d*\.md$/i.test(name));
const standards=[];
for(const filename of files){
 const path="ERCS/"+filename;
 const record=parseOfficialErc(path,await readFile(join(directory,filename),"utf8"));
 if(record)standards.push(record);
}
standards.sort((a,b)=>a.number-b.number);
const ids=new Set(standards.map(x=>x.id));
if(standards.length<400||ids.size!==standards.length)throw Error("Official ERC inventory incomplete or duplicated: "+standards.length);
const revision=execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
if(!/^[0-9a-f]{40}$/.test(revision))throw Error("Missing pinned official ERC Git revision");
let discussionCoverage={status:"UNAVAILABLE",attemptedPages:pages,fetchedPages:0,lastError:null};
const forums=new Map();
for(let page=0;page<pages;page++){
 try{
  const ctrl=new AbortController();
  const timeout=setTimeout(()=>ctrl.abort(),9000);
  let response;
  try{response=await fetch("https://ethereum-magicians.org/latest.json?page="+page,{
    headers:{"accept":"application/json","user-agent":"OECL-Research-Indexer/0.1 (public reproducible catalog)"},
    signal:ctrl.signal});}
  finally{clearTimeout(timeout)}
  if(!response.ok)throw Error("Magicians HTTP "+response.status);
  const json=await response.json();
  const topics=json?.topic_list?.topics;
  if(!Array.isArray(topics))throw Error("Unexpected Discourse topic-list schema");
  for(const topic of topics){
   if(!Number.isInteger(topic.id)||typeof topic.slug!=="string")continue;
   const ercs=indexedDiscussionIds(topic).filter(id=>ids.has(id));
   if(ercs.length===0)continue;
   forums.set(topic.id,{id:topic.id,title:String(topic.title||"").slice(0,180),
    url:"https://ethereum-magicians.org/t/"+encodeURIComponent(topic.slug)+"/"+topic.id,
    ercs,updatedAt:topic.last_posted_at||null,
    evidenceLevel:"TOPIC_TITLE_ONLY_NOT_VALIDATED"});
  }
  discussionCoverage={status:"PARTIAL_RECENT_TOPIC_INDEX",attemptedPages:pages,fetchedPages:page+1,lastError:null};
 }catch(error){
  discussionCoverage={status:page>0?"PARTIAL_RECENT_TOPIC_INDEX":"UNAVAILABLE",
    attemptedPages:pages,fetchedPages:page,lastError:String(error?.message||error).slice(0,200)};
  break;
 }
}
const catalog={
 schemaVersion:"OECL_PUBLIC_ERC_DOCUMENTARY_CORPUS_V1",
 generatedAt:new Date().toISOString(),
 source:{repository:"ethereum/ERCs",revision,treePath:"ERCS/erc-*.md",
  url:"https://github.com/ethereum/ERCs/tree/"+revision+"/ERCS",scope:"official repository markdown at pinned revision"},
 forum:{source:"https://ethereum-magicians.org",...discussionCoverage,
  caution:"Recent topic-title references and discussions-to URLs are unreviewed documentary context, not compatibility or implementation evidence"},
 scientificStatus:"NOT_EVALUATED",
 standards,
 recentDiscussionTopics:[...forums.values()].sort((a,b)=>b.id-a.id)
};
await mkdir(dirname(output),{recursive:true});
await writeFile(output,JSON.stringify(catalog,null,2)+"\n","utf8");
console.log("OECL_PUBLIC_CORPUS "+JSON.stringify({
 officialCount:standards.length,officialRevision:revision,forumStatus:catalog.forum.status,
 forumTopics:catalog.recentDiscussionTopics.length,generatedAt:catalog.generatedAt,
 example721:standards.find(s=>s.id==="ERC-721")?.requires,
 official8060Present:ids.has("ERC-8060"),
 output
}));
