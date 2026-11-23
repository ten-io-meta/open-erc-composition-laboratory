import { createHash } from "node:crypto";
import registry from "../../../laboratory/scientific-open-source-worker/source-registry.json";

/**
 * Discovery index only. An ERC document existing in ethereum/ERCs does not
 * mean it is final, that OECL analyzed its code, or that it is compatible.
 */
export type ErcCatalogEntry = {
  id: string;
  title: string | null;
  origin: "OFFICIAL_ERC_REPOSITORY" | "OECL_SOURCE_ONLY";
  sourceProfile: boolean;
};
export type ErcCatalog = {
  status: "COMPLETE_OFFICIAL_INDEX" | "PARTIAL_LOCAL_INDEX";
  entries: ErcCatalogEntry[];
  officialCount: number;
  localOnlyCount: number;
  fetchedAt: string;
  source: {
    repository: "ethereum/ERCs";
    branch: "master";
    treeSha: string | null;
    indexUrl: string;
  };
  message: string;
};

type Transport = (url:string, init?:RequestInit)=>Promise<Response>;
const TREE_URL="https://api.github.com/repos/ethereum/ERCs/git/trees/master?recursive=1";
const WEBSITE_URL="https://ercs.ethereum.org/erc";
const MAX_BYTES=5_000_000;
const TTL_MS=3_600_000;
let cached: {data:ErcCatalog; expires:number}|null=null;
let pending:Promise<ErcCatalog>|null=null;

async function boundedText(r:Response,max=MAX_BYTES):Promise<string>{
  const declared=Number(r.headers.get("content-length")||"0");
  if((declared&&(!Number.isSafeInteger(declared)||declared>max))||!r.body)
    throw Error("CATALOG_SOURCE_TOO_LARGE");
  const reader=r.body.getReader();let size=0;const chunks:Uint8Array[]=[];
  try{
    while(true){const next=await reader.read();if(next.done)break;
      size+=next.value.byteLength;if(size>max)throw Error("CATALOG_SOURCE_TOO_LARGE");
      chunks.push(next.value);
    }
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
}
function decodeHtml(text:string):string{
  return text.replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|[0-9]+);/gi,x=>{
    const entities:Record<string,string>={"&amp;":"&","&quot;":'"',"&apos;":"'","&lt;":"<","&gt;":">","&nbsp;":" "};
    if(entities[x.toLowerCase()])return entities[x.toLowerCase()];
    const hex=x[2]?.toLowerCase()==="x";
    const n=Number.parseInt(x.slice(hex?3:2,-1),hex?16:10);
    return Number.isInteger(n)&&n>=32&&n<=0x10ffff?
      String.fromCodePoint(n):" ";
  });
}
function stripTags(html:string):string{
  return decodeHtml(html.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()).trim();
}
export function parseOfficialTitles(html:string):Map<string,string>{
  const map=new Map<string,string>();
  for(const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
    const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
    if(cells.length<2)continue;
    const rawId=stripTags(cells[0][1]);
    const n=rawId.match(/^(?:ERC[-\s]?)?([1-9][0-9]{0,7})$/i);
    if(!n)continue;
    const title=stripTags(cells[1][1]).slice(0,150);
    if(title.length>2)map.set("ERC-"+n[1],title);
  }
  return map;
}
export function parseGitTree(input:unknown):{ids:string[];sha:string}{
  if(!input||typeof input!=="object")throw Error("INVALID_CATALOG_TREE");
  const result=input as Record<string,unknown>;
  if(result.truncated!==false||typeof result.sha!=="string"||
    !/^[0-9a-f]{40}$/.test(result.sha)||!Array.isArray(result.tree))
    throw Error("INCOMPLETE_CATALOG_TREE");
  if(result.tree.length>15000)throw Error("CATALOG_TREE_TOO_LARGE");
  const ids=new Set<string>();
  for(const entry of result.tree){
    if(!entry||typeof entry!=="object")continue;
    const node=entry as Record<string,unknown>;
    if(node.type!=="blob"||typeof node.path!=="string")continue;
    const match=node.path.match(/^ERCS\/erc-([1-9][0-9]{0,7})\.md$/);
    if(match)ids.add("ERC-"+match[1]);
  }
  if(ids.size<50||ids.size>10000)throw Error("CATALOG_COVERAGE_UNVERIFIED");
  return {ids:[...ids].sort((a,b)=>Number(a.slice(4))-Number(b.slice(4))),sha:result.sha};
}
function mergeEntries(ids:string[],titles:Map<string,string>):ErcCatalogEntry[]{
  const entries=new Map<string,ErcCatalogEntry>();
  for(const id of ids)entries.set(id,{id,title:titles.get(id)||null,origin:"OFFICIAL_ERC_REPOSITORY",sourceProfile:false});
  for(const item of registry.sources){
    if(!/^ERC-[1-9][0-9]{0,7}$/.test(item.id))continue;
    const previous=entries.get(item.id);
    entries.set(item.id,previous?{...previous,sourceProfile:true}:{
      id:item.id,title:item.label,origin:"OECL_SOURCE_ONLY",sourceProfile:true});
  }
  return [...entries.values()].sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
}
export async function buildErcCatalog(transport:Transport=fetch):Promise<ErcCatalog>{
  let officialIds:string[]=[],treeSha:string|null=null;
  const titles=new Map<string,string>();
  try{
    const response=await transport(TREE_URL,{method:"GET",redirect:"error",
      cache:"no-store",headers:{Accept:"application/vnd.github+json","User-Agent":"oecl-erc-index"},
      signal:AbortSignal.timeout(8500)});
    if(!response.ok)throw Error("OFFICIAL_TREE_UNAVAILABLE");
    const tree=parseGitTree(JSON.parse(await boundedText(response)));
    officialIds=tree.ids;treeSha=tree.sha;
    try{
      const titlesRes=await transport(WEBSITE_URL,{method:"GET",redirect:"error",cache:"no-store",
        headers:{Accept:"text/html"},signal:AbortSignal.timeout(5000)});
      if(titlesRes.ok){
        for(const [id,title] of parseOfficialTitles(await boundedText(titlesRes,2_000_000)))
          if(officialIds.includes(id))titles.set(id,title);
      }
    }catch{/* Titles are optional; never block the verified ID list. */}
  }catch{/* Local-only honest fallback. */}
  const entries=mergeEntries(officialIds,titles);
  const complete=treeSha!==null;
  return {
    status:complete?"COMPLETE_OFFICIAL_INDEX":"PARTIAL_LOCAL_INDEX",
    entries,officialCount:officialIds.length,
    localOnlyCount:entries.filter(x=>x.origin==="OECL_SOURCE_ONLY").length,
    fetchedAt:new Date().toISOString(),
    source:{repository:"ethereum/ERCs",branch:"master",treeSha,indexUrl:"https://github.com/ethereum/ERCs/tree/master/ERCS"},
    message:complete?
      "Official ERC document index retrieved; entries may be Draft or incomplete. OECL source profiles are identified separately.":
      "Official ERC index temporarily unavailable. Only OECL registered profiles are shown; you may still enter any ERC number manually.",
  };
}
export async function getErcCatalog(transport:Transport=fetch,now=Date.now()):Promise<ErcCatalog>{
  if(cached&&cached.expires>now)return cached.data;
  if(pending)return pending;
  const task=buildErcCatalog(transport);
  pending=task;
  try{
    const data=await task;
    cached={data,expires:now+(data.status==="COMPLETE_OFFICIAL_INDEX"?TTL_MS:30_000)};
    return data;
  }finally{if(pending===task)pending=null;}
}
export function catalogSnapshotHash(catalog:ErcCatalog):string{
  return createHash("sha256").update(JSON.stringify({
    ids:catalog.entries.map(x=>x.id),treeSha:catalog.source.treeSha,
  })).digest("hex");
}
