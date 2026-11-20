/**
 * OECL documentary intake. Source facts, search observations, candidate relations
 * and experimentally established composition properties are different evidence levels.
 * No untrusted web content is executed, no ERC is privileged, no compatibility is inferred.
 */
import index from "@/data/officialErcIndex.json";
import corpus from "@/data/officialErcCorpus.json";
import scientificCatalog from "@/data/scientificPairCatalog.json";
import { scientificWorkOrder } from "@/server/oeclScientificWorkOrder";

export type ErcDocument = {
  id: string;
  status: "FETCHED" | "OPEN_PROPOSAL_PR" | "NOT_IN_OFFICIAL_SNAPSHOT" | "SOURCE_UNAVAILABLE";
  title: string | null;
  editorialStatus: string | null;
  summary: string | null;
  discussionUrl: string | null;
  requires: string[];
  references: string[];
  url: string;
  sourceRevision: string;
  specAuthors: string | null;
  documentCreatedAt: string | null;
  proposalAttribution: null | {
    pullRequestNumber: number;
    submittedBy: string | null;
    openedAt: string | null;
    updatedAt: string | null;
    sourceCommitSha: string;
    sourcePullRequestUrl: string;
  };
};
export type ForumEvidence = {
  status: "SEARCHED" | "SOURCE_UNAVAILABLE";
  query: string;
  topics: Array<{
    id: number; title: string; url: string;
    createdAt: string | null; lastActivityAt: string | null;
    author: string | null; firstPostUpdatedAt: string | null;
    firstPostVersion: number | null; metadataStatus: "VERIFIED_TOPIC" | "SEARCH_RESULT_ONLY";
    postCount: number | null;
  }>;
};
type DocumentRelation = {
  kind: "DECLARED_REQUIRES" | "MENTIONS" | "PROPOSAL_REQUIRES" | "PROPOSAL_MENTIONS";
  source: string;
  target: string;
  explanation: string;
  evidenceUrl: string;
};
const known = new Set<number>(index.ids);
export const indexedCount = index.count;
export const indexSourceRevision = index.sourceTreeSha;
export const normalizeErc = (value: string | null): string | null => {
  if (!value) return null;
  const match = /^(?:ERC[- ]?)?([1-9][0-9]{0,6})$/i.exec(value.trim());
  return match ? "ERC-" + Number(match[1]) : null;
};
const documentById = new Map(corpus.profiles.map(profile => [profile.id, profile] as const));
// PRs are a separate epistemic tier from merged official documents.
function fieldsFromProposal(body:string): Record<string,string> {
 const m=/^---\s*\r?\n([\s\S]{0,12000}?)\r?\n---/.exec(body.replace(/^\uFEFF/,""));
 const fields:Record<string,string>={};
 for(const line of (m?.[1]??"").split(/\r?\n/)){
  const field=/^([a-z][a-z-]*):\s*(.*)$/i.exec(line);
  if(field)fields[field[1].toLowerCase()]=field[2].trim();
 }
 return fields;
}
function referencesFromProposal(text:string,self:string):string[]{
 const ids:string[]=[];
 for(const m of text.slice(0,100000).matchAll(/\b(?:ERC|EIP)[- ]?([1-9]\d{0,6})\b/gi))
  ids.push("ERC-"+Number(m[1]));
 return [...new Set(ids.filter(x=>x!==self))].sort().slice(0,80);
}
async function githubJson(url:string):Promise<unknown>{
 const headers:Record<string,string>={
  "Accept":"application/vnd.github+json",
  "User-Agent":"OECL-ERC-research-v1"
 };
 if(process.env.GITHUB_TOKEN)headers.Authorization="Bearer "+process.env.GITHUB_TOKEN;
 const response=await fetch(url,{
  next:{revalidate:7200},signal:AbortSignal.timeout(8000),headers
 });
 if(!response.ok)throw Error("GitHub source unavailable: "+response.status);
 return response.json();
}
async function readOpenProposal(id:string):Promise<ErcDocument|null>{
 const number=Number(id.slice(4));
 // Search only ethereum/ERCs PRs. An external repository or forum post does not
 // acquire ERC editorial status from search relevance alone.
 try {
  const q='repo:ethereum/ERCs is:pr is:open "'+number+'"';
  const response=await githubJson("https://api.github.com/search/issues?q="+encodeURIComponent(q)+"&per_page=8") as
  {items?:Array<{number?:number;state?:string;user?:{login?:string};created_at?:string;updated_at?:string;html_url?:string}>};
  for(const item of (response.items??[]).slice(0,8)){
   if(typeof item.number!=="number"||item.state!=="open")continue;
   const files=await githubJson("https://api.github.com/repos/ethereum/ERCs/pulls/"+item.number+"/files?per_page=100") as
   Array<{filename?:string;raw_url?:string}>;
   const target=files.find(file=>file.filename==="ERCS/erc-"+number+".md");
   if(!target?.raw_url)continue;
   const blobRef=/\/raw\/([a-f0-9]{40})\//i.exec(target.raw_url)?.[1];
   if(!blobRef)continue;
   const sourceUrl="https://raw.githubusercontent.com/ethereum/ERCs/"+blobRef+"/ERCS/erc-"+number+".md";
   const source=await fetch(sourceUrl,{
     next:{revalidate:7200},signal:AbortSignal.timeout(8000),headers:{"Accept":"text/plain"}
   });
   if(!source.ok)continue;
   const body=(await source.text()).slice(0,230000);
   const front=fieldsFromProposal(body);
   if(Number(front.eip)!==number)continue;
   const requires=[...new Set((front.requires??"").split(/[,\s]+/).filter(Boolean)
      .map(t=>normalizeErc(t.replace(/^(?:EIP|ERC)-?/i,"")))
      .filter((x):x is string=>Boolean(x)))].sort();
   const abstract=/^##\s+Abstract\s*\r?\n([\s\S]*?)(?=^##\s+|$(?![\s\S]))/im.exec(body);
   const summary=(abstract?.[1]??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,400);
   const forumLink=front["discussions-to"];
   return {
     id,status:"OPEN_PROPOSAL_PR",title:front.title||null,
     editorialStatus:(front.status||"Proposed")+" (unmerged GitHub PR)",
     summary:summary||null,
     discussionUrl:forumLink&&/^https:\/\/(?:ethereum-magicians\.org|github\.com|ethresear\.ch)\//i.test(forumLink)?forumLink:null,
     requires,references:referencesFromProposal(body,id),
     url:"https://github.com/ethereum/ERCs/pull/"+item.number,
     sourceRevision:blobRef,
     specAuthors:front.author??null,
     documentCreatedAt:front.created??null,
     proposalAttribution:{
       pullRequestNumber:item.number,submittedBy:item.user?.login??null,
       openedAt:item.created_at??null,updatedAt:item.updated_at??null,
       sourceCommitSha:blobRef,sourcePullRequestUrl:"https://github.com/ethereum/ERCs/pull/"+item.number
     }
   };
  }
 }catch{}
 return null;
}

async function loadDocument(id: string): Promise<ErcDocument> {
  const profile=documentById.get(id);
  const n=Number(id.slice(4));
  const base: ErcDocument={
    id,status:"SOURCE_UNAVAILABLE",title:null,editorialStatus:null,
    summary:null,discussionUrl:null,requires:[],references:[],
    url:"https://github.com/ethereum/ERCs/blob/"+index.sourceCommitSha+"/ERCS/erc-"+n+".md",
    sourceRevision:index.sourceCommitSha,
    specAuthors:null,documentCreatedAt:null,proposalAttribution:null
  };
  if(!known.has(n))return (await readOpenProposal(id))??{...base,status:"NOT_IN_OFFICIAL_SNAPSHOT"};
  // The entire corpus comes from ONE pinned Git checkout, not on-demand drifting versions.
  if(corpus.provenance.sourceCommitSha!==index.sourceCommitSha||!profile)return base;
  return {
    ...base,status:"FETCHED",title:profile.title,
    editorialStatus:profile.editorialStatus,
    summary:profile.summary,discussionUrl:profile.discussionUrl,
    requires:profile.requires,references:profile.references,
    url:profile.sourceUrl,sourceRevision:profile.sourceRevision,
    specAuthors:("specAuthors" in profile&&typeof profile.specAuthors==="string")?profile.specAuthors:null,
    documentCreatedAt:profile.created??null,
    proposalAttribution:null
  };
}
async function searchMagicians(id: string): Promise<ForumEvidence> {
  const fallback:ForumEvidence={status:"SOURCE_UNAVAILABLE",query:id,topics:[]};
  try {
    const response=await fetch(
      "https://ethereum-magicians.org/search.json?q="+encodeURIComponent('"'+id+'"'),
      {next:{revalidate:3600},signal:AbortSignal.timeout(7000),
       headers:{"Accept":"application/json","User-Agent":"OECL-documentary-research/1.0"}}
    );
    if(!response.ok)return fallback;
    const payload:unknown=await response.json();
    const root=payload as {topics?:unknown[]};
    // Bound calls to avoid scraping and rate-limit violations.
    const hits=(Array.isArray(root.topics)?root.topics:[]).slice(0,3)
      .flatMap((value):ForumEvidence["topics"]=>{
        if(!value||typeof value!=="object")return [];
        const t=value as {id?:unknown;title?:unknown;slug?:unknown;
          created_at?:unknown;last_posted_at?:unknown;posts_count?:unknown};
        if(typeof t.id!=="number"||!Number.isSafeInteger(t.id)||
           typeof t.title!=="string"||typeof t.slug!=="string"||
           !/^[a-z0-9-]+$/.test(t.slug))return [];
        return [{
          id:t.id,title:t.title.slice(0,240),
          url:"https://ethereum-magicians.org/t/"+t.slug+"/"+t.id,
          createdAt:typeof t.created_at==="string"?t.created_at:null,
          lastActivityAt:typeof t.last_posted_at==="string"?t.last_posted_at:null,
          author:null,firstPostUpdatedAt:null,firstPostVersion:null,
          postCount:typeof t.posts_count==="number"?t.posts_count:null,
          metadataStatus:"SEARCH_RESULT_ONLY" as const
        }];
      });
    const topics=await Promise.all(hits.map(async hit=>{
      try {
        const response=await fetch(
          "https://ethereum-magicians.org/t/"+hit.id+".json",
          {next:{revalidate:3600},signal:AbortSignal.timeout(5000),
           headers:{"Accept":"application/json","User-Agent":"OECL-documentary-research/1.0"}}
        );
        if(!response.ok)return hit;
        const topic=await response.json() as {
          id?:number;created_at?:string;last_posted_at?:string;posts_count?:number;
          post_stream?:{posts?:Array<{post_number?:number;username?:string;
            created_at?:string;updated_at?:string;version?:number}>}
        };
        if(topic.id!==hit.id)return hit;
        const first=topic.post_stream?.posts?.find(p=>p.post_number===1);
        return {...hit,
          createdAt:topic.created_at??hit.createdAt,
          lastActivityAt:topic.last_posted_at??hit.lastActivityAt,
          author:first?.username??null,firstPostUpdatedAt:first?.updated_at??null,
          firstPostVersion:first?.version??null,postCount:topic.posts_count??hit.postCount,
          metadataStatus:first?"VERIFIED_TOPIC" as const:"SEARCH_RESULT_ONLY" as const};
      }catch{return hit;}
    }));
    return {status:"SEARCHED",query:id,topics};
  }catch{return fallback;}
}
export async function researchErcPair(a:string,b:string) {
  const [left,right,forumA,forumB] = await Promise.all([
    loadDocument(a),loadDocument(b),searchMagicians(a),searchMagicians(b)
  ]);
  const documentaryRelations: DocumentRelation[]=[];
  for (const [source,target] of [[left,right],[right,left]]) {
    if (source.status!=="FETCHED"&&source.status!=="OPEN_PROPOSAL_PR") continue;
    if (source.requires.includes(target.id)) documentaryRelations.push({
      kind:source.status==="OPEN_PROPOSAL_PR"?"PROPOSAL_REQUIRES":"DECLARED_REQUIRES",source:source.id,target:target.id,
      explanation:source.id+" explicitly declares "+target.id+" in the specification's requires field.",
      evidenceUrl:source.url
    });
    else if(source.references.includes(target.id)) documentaryRelations.push({
      kind:source.status==="OPEN_PROPOSAL_PR"?"PROPOSAL_MENTIONS":"MENTIONS",source:source.id,target:target.id,
      explanation:source.id+" mentions "+target.id+" in its source text; a mention is not proof of interoperability.",
      evidenceUrl:source.url
    });
  }
  const projection=scientificCatalog.projections.find(p=>
    (p.sourceParticipantId===a&&p.targetParticipantId===b)||
    (p.sourceParticipantId===b&&p.targetParticipantId===a)
  )??null;
  const bothFetched=[left,right].every(d=>d.status==="FETCHED"||d.status==="OPEN_PROPOSAL_PR");
  return {
    status:"DOCUMENTARY_RESEARCH_ONLY" as const,
    protocols:[a,b],
    provenance:{repository:"ethereum/ERCs",treeSha:index.sourceTreeSha,commitSha:index.sourceCommitSha,
      indexedDocuments:index.count,forum:"ethereum-magicians.org"},
    standards:[left,right],
    forum:[forumA,forumB],
    documentaryRelations,
    scienceWorkOrder:scientificWorkOrder(a,b),
    scientificProjection:projection ? {
      compatibility:projection.compatibility?.polarity??"INCONCLUSIVE",
      harmony:projection.harmony?.status??"INCONCLUSIVE",
      valueStatus:projection.compositionValue?.status??"NOT_ESTABLISHED",
      findingCount:projection.compositionValue?.findingCount??0,
      basis:"EXISTING_FROZEN_SCIENTIFIC_SNAPSHOT"
    }:null,
    newExperimentExecuted:false,
    emergentPropertiesVerified:[] as string[],
    conclusion:projection ? "EXISTING_SCIENTIFIC_SNAPSHOT" :
      bothFetched ? "DOCUMENTARY_CANDIDATE_NOT_EVALUATED" : "INCOMPLETE_SOURCE_EVIDENCE",
    researchQuestions:documentaryRelations.some(x=>x.kind==="DECLARED_REQUIRES"||x.kind==="PROPOSAL_REQUIRES")?[
      "Does the declared dependency preserve the required invariants when both contracts execute?",
      "Which behavior, if any, emerges only when these participants are composed?",
      "Does removing either participant remove that behavior, and what exact boundary fails?"
    ]:[
      "Is there an actual shared execution or interface dependency, beyond documentary similarity?",
      "What joint runtime configuration and independent boundary evidence would establish feasibility?",
      "Can any newly observed property be falsified with an ablation or adversarial execution?"
    ],
    limitation:"Forum mentions and ERC text are documentary signals, never proof of runtime compatibility or emergence. Missing source evidence is INCONCLUSIVE, not incompatible."
  };
}
