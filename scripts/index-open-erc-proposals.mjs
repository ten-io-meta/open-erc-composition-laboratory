/**
 * Read-only broad discovery of unmerged proposals in ethereum/ERCs.
 * Never promote a PR to official specification or infer runtime viability.
 * GitHub Actions uploads the resulting JSON for review, not automatic publication.
 */
import { writeFile,mkdir } from "node:fs/promises";
const origin="https://api.github.com";
const headers={
 "Accept":"application/vnd.github+json",
 "User-Agent":"OECL-proposal-indexer/1.0",
 ...(process.env.GITHUB_TOKEN?{Authorization:"Bearer "+process.env.GITHUB_TOKEN}:{})
};
async function get(path) {
 const response=await fetch(origin+path,{
  headers,signal:AbortSignal.timeout(25000)
 });
 if(!response.ok)throw Error("GitHub "+response.status+": "+path);
 return response.json();
}
function metadata(body) {
 const match=/^---\s*\r?\n([\s\S]{0,12000}?)\r?\n---/.exec(body.replace(/^\uFEFF/,""));
 const fields={};
 for(const line of (match?.[1]??"").split(/\r?\n/)) {
  const x=/^([a-z][a-z-]*):\s*(.*)$/i.exec(line);
  if(x)fields[x[1].toLowerCase()]=x[2].trim();
 }
 return fields;
}
const pages=[];const MAX_PAGES=12;
for(let page=1;page<=MAX_PAGES;page++){
 const list=await get("/repos/ethereum/ERCs/pulls?state=open&per_page=100&page="+page);
 if(!Array.isArray(list))throw Error("GitHub did not return a PR collection");
 pages.push(...list);
 if(list.length<100)break;
 if(page===MAX_PAGES)throw Error("Exceeded bounded open PR pages; corpus must not be called complete");
}
const uniquePrs=new Map(pages.map(p=>[p.number,p]));
if(uniquePrs.size!==pages.length)throw Error("Duplicate PRs in paginated upstream");
const proposals=[];const failures=[];
const queue=[...uniquePrs.values()].sort((a,b)=>a.number-b.number);
let next=0;
async function worker(){
 while(next<queue.length){
  const item=queue[next++];
  try{
   const files=await get("/repos/ethereum/ERCs/pulls/"+item.number+"/files?per_page=100");
   if(!Array.isArray(files))throw Error("Changed-file collection unavailable");
   for(const f of files){
    const match=/^ERCS\/erc-([1-9]\d{0,6})\.md$/.exec(f.filename||"");
    if(!match)continue;
    const n=Number(match[1]);
    const sha=/\/raw\/([a-f0-9]{40})\//i.exec(f.raw_url||"")?.[1];
    if(!sha){failures.push({pr:item.number,erc:n,reason:"MISSING_PINNED_BLOB"});continue;}
    const raw="https://raw.githubusercontent.com/ethereum/ERCs/"+sha+"/ERCS/erc-"+n+".md";
    try{
      const source=await fetch(raw,{headers:{Accept:"text/plain","User-Agent":"OECL-proposal-indexer/1.0"},
        signal:AbortSignal.timeout(12000)});
      if(!source.ok)throw Error("raw status "+source.status);
      const fields=metadata((await source.text()).slice(0,230000));
      if(Number(fields.eip)!==n)throw Error("ERC filename and frontmatter disagree");
      proposals.push({
       id:"ERC-"+n,prNumber:item.number,
       githubPRUrl:"https://github.com/ethereum/ERCs/pull/"+item.number,
       status:"OPEN_PROPOSAL_PR",sourceRevision:sha,
       openedAt:item.created_at??null,updatedAt:item.updated_at??null,
       submittedBy:item.user?.login??null,specAuthors:fields.author??null,
       proposalStatus:fields.status??null,sourceCreatedAt:fields.created??null,
       title:fields.title??null,
       requires:(fields.requires??"").split(/[,\s]+/).filter(Boolean)
         .map(v=>v.replace(/^(?:ERC|EIP)-?/i,"")).filter(v=>/^[1-9]\d{0,6}$/.test(v))
         .map(v=>"ERC-"+Number(v)),
       discussionUrl:typeof fields["discussions-to"]==="string"&&
         /^https:\/\/(?:ethereum-magicians\.org|github\.com|ethresear\.ch)\//i.test(fields["discussions-to"])
           ?fields["discussions-to"]:null,
       evidenceLevel:"UNMERGED_GITHUB_PROPOSAL_SOURCE_ONLY"
      });
    }catch(error){
      failures.push({pr:item.number,erc:n,reason:"PINNED_SOURCE_UNAVAILABLE:"+String(error).slice(0,110)});
    }
   }
  }catch(error){
   failures.push({pr:item.number,reason:"PR_CHANGED_FILES_UNAVAILABLE:"+String(error).slice(0,110)});
  }
 }
}
await Promise.all(Array.from({length:4},()=>worker()));
proposals.sort((a,b)=>a.id.localeCompare(b.id)||a.prNumber-b.prNumber);
const index={
 schemaVersion:"OECL_OPEN_ERC_PROPOSAL_INDEX_V1",
 source:"ethereum/ERCs",
 retrieval:"GitHub REST open pull requests and changed-file pinned markdown",
 scannedOpenPullRequests:pages.length,
 examinedDocumentProposals:proposals.length,
 errors:failures,
 coverage:failures.length?"PARTIAL_SOURCE_UNAVAILABLE":"ALL_DISCOVERABLE_OPEN_PR_SOURCE_FILES_SCANNED",
 note:"PR status is not official ERC editorial acceptance, deployment, security assurance or compatibility.",
 proposals
};
await mkdir("audit-results",{recursive:true});
await writeFile("audit-results/open-erc-proposals.json",JSON.stringify(index,null,2)+"\n");
console.log("OECL_OPEN_PROPOSALS "+JSON.stringify({
 scannedPRs:index.scannedOpenPullRequests,proposalDocuments:proposals.length,
 errors:failures.length,coverage:index.coverage,contains8060:proposals.some(p=>p.id==="ERC-8060")
}));
if(failures.length>0)console.log("OECL_OPEN_PROPOSAL_INCOMPLETE First errors "+JSON.stringify(failures.slice(0,5)));
