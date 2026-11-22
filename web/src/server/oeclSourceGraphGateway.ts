import { extractSourceEvidence, readScientificArchive, ScientificArchiveError } from "./oeclScientificArchive";
import { acceptedSourcePair } from "./oeclGenericSourceJobs";
// Pure CommonJS projection shared with the isolated worker; no Solidity execution.
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { projectGraphBundle } from "../../../laboratory/scientific-open-source-worker/ScientificGraphView.cjs";

const ownerRepo = "ten-io-meta/open-erc-composition-laboratory";
const repoApi = "https://api.github.com/repos/" + ownerRepo;
const workflowName = "OECL Generic Solidity Source AST Laboratory";
const archiveName = "oecl-generic-ast-evidence";
const pinnedRegression = {
  runId: 44966016338,
  workflowSha: "dbc6f352c923d9a3f14e274fc69284cfe49eea47",
};
const catalogExamples: Record<string,string> = {
  "ERC-8060|ERC-8098": "pair-8060-8098/",
  "ERC-8060|ERC-20-BURNABLE": "pair-8060-20burnable/",
  "ERC-8098|ERC-20": "pair-8098-20/",
  "ERC-1155|ERC-20": "pair-1155-20/",
};

type Transport = (url: string,init?: RequestInit) => Promise<Response>;
type RunMetadata = {
  id:number; name:string; event:string; status:string;
  conclusion:string|null; display_title:string; head_sha:string;
  head_branch:string; repository?:{full_name:string};
};
type ArtifactMeta = {id:number;name:string;expired:boolean;size_in_bytes:number};
const maxArchiveSize=1_500_000;

export class SourceGraphGatewayError extends Error {
  constructor(readonly code: string) { super(code); }
}
const reject=(code:string):never=>{throw new SourceGraphGatewayError(code);};
function apiHeaders(token:string) {
  return {
    Accept:"application/vnd.github+json",
    Authorization:"Bearer "+token,
    "User-Agent":"oecl-verified-source-graph",
    "X-GitHub-Api-Version":"2022-11-28",
  };
}
async function readJson<T>(url:string,token:string,transport:Transport):Promise<T>{
  if(!url.startsWith(repoApi+"/actions/"))reject("GITHUB_API_URL_NOT_ALLOWED");
  const response=await transport(url,{
    method:"GET",headers:apiHeaders(token),redirect:"error",
    cache:"no-store",signal:AbortSignal.timeout(12000),
  });
  if(!response.ok)reject("GITHUB_EVIDENCE_LOOKUP_FAILED");
  return await response.json() as T;
}
function verifyRun(run:RunMetadata,expect:{
  runId:number;mode:"CI_REGRESSION"|"CONTROLLED_REQUEST";workflowSha?:string;requestId?:string
}){
  if(run?.id!==expect.runId || run.name!==workflowName ||
     run.status!=="completed"||run.conclusion!=="success" ||
     !/^[a-f0-9]{40}$/.test(run.head_sha) ||
     run.repository?.full_name!==ownerRepo)reject("WORKFLOW_IDENTITY_MISMATCH");
  if(expect.mode==="CI_REGRESSION"){
    if(run.event!=="push"||run.head_sha!==expect.workflowSha)
      reject("PINNED_CI_RUN_MISMATCH");
  }else if(run.event!=="workflow_dispatch"||
           run.head_branch!=="main"||
           run.display_title!=="OECL-SOURCE-REQUEST-"+expect.requestId)
    reject("JOB_CORRELATION_MISMATCH");
}
function approvedArchiveLocation(value:string|null){
  if(!value)reject("SIGNED_ARCHIVE_URL_MISSING");
  let location:URL;
  try{location=new URL(value);}catch{return reject("SIGNED_ARCHIVE_URL_INVALID");}
  const host=location.hostname.toLowerCase();
  const trusted=host.endsWith(".blob.core.windows.net")||
    host.endsWith(".actions.githubusercontent.com")||
    host==="objects.githubusercontent.com"||
    host==="github.com";
  if(location.protocol!=="https:" || location.username || location.password ||
     location.port || !trusted || location.hash)
    reject("SIGNED_ARCHIVE_ORIGIN_NOT_ALLOWED");
  return location.toString();
}
async function boundedBytes(response:Response){
  const length=Number(response.headers.get("content-length")||"0");
  if(!response.ok || (length && length>maxArchiveSize) || !response.body)
    reject("ARCHIVE_RESPONSE_INVALID");
  const reader=response.body.getReader();
  let total=0;
  const buffers:Uint8Array[]=[];
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      total+=value.byteLength;
      if(total>maxArchiveSize)reject("ARCHIVE_DOWNLOAD_SIZE_LIMIT");
      buffers.push(value);
    }
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  return Buffer.concat(buffers.map(x=>Buffer.from(x)));
}
async function loadArchivedDocuments(runId:number,token:string,transport:Transport){
  const list=await readJson<{artifacts:ArtifactMeta[]}>(
    repoApi+"/actions/runs/"+runId+"/artifacts?per_page=100",token,transport);
  if(!Array.isArray(list.artifacts))reject("ARTIFACT_LIST_INVALID");
  const matches=list.artifacts.filter(x=>x.name===archiveName&&!x.expired);
  if(matches.length!==1 || !Number.isSafeInteger(matches[0].id) ||
     matches[0].id<1 || matches[0].size_in_bytes>maxArchiveSize)
    reject("VERIFIED_SOURCE_ARCHIVE_UNAVAILABLE");
  const url=repoApi+"/actions/artifacts/"+matches[0].id+"/zip";
  const redirect=await transport(url,{
    method:"GET",headers:apiHeaders(token),redirect:"manual",
    cache:"no-store",signal:AbortSignal.timeout(12000),
  });
  if(redirect.status!==302)reject("GITHUB_ARCHIVE_REDIRECT_EXPECTED");
  const signed=approvedArchiveLocation(redirect.headers.get("location"));
  const download=await transport(signed,{
    method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000),
  });
  const zip=await boundedBytes(download);
  return readScientificArchive(zip);
}
export async function verifiedSourceView(
  input:{sourceA:string;sourceB:string;requestId?:string},
  token:string,
  transport:Transport=fetch,
) {
  if(!acceptedSourcePair(input.sourceA,input.sourceB))
    reject("SOURCE_PAIR_NOT_REGISTERED");
  const live=typeof input.requestId==="string";
  const expected=live?null:pinnedRegression;
  const run=live?
    await findRequestRun(input.requestId!,token,transport):
    await readJson<RunMetadata>(
      repoApi+"/actions/runs/"+pinnedRegression.runId,token,transport);
  const identity={
    runId:run.id,
    workflowSha:run.head_sha,
    mode:live?"CONTROLLED_REQUEST" as const:"CI_REGRESSION" as const,
    requestId:live?input.requestId!:null,
  };
  verifyRun(run,{
    runId:run.id, mode:identity.mode,
    workflowSha:expected?.workflowSha,
    requestId:live?input.requestId:undefined,
  });
  const prefix=live?"":catalogExamples[input.sourceA+"|"+input.sourceB];
  if(prefix===undefined)reject("NO_VERIFIED_GRAPH_EXAMPLE");
  const archive=await loadArchivedDocuments(run.id,token,transport);
  if(live){
    const request=archive.get("request.json") as Record<string,unknown>|undefined;
    if(request?.schemaVersion!=="OECL_GENERIC_SOURCE_REQUEST_V1"||
       request.requestId!==input.requestId||
       String(request.runId)!==String(run.id)||
       request.workflowSha!==run.head_sha||
       request.sourceA!==input.sourceA||request.sourceB!==input.sourceB||
       request.scientificVerdict!=="INCONCLUSIVE"||
       request.candidateAdmission!=="NOT_ADMITTED")
      reject("REQUEST_EVIDENCE_CORRELATION_FAILED");
  }
  const {graph,discovery,report}=extractSourceEvidence(archive,prefix);
  try{
    const view=projectGraphBundle(graph,discovery,report,identity);
    if(view.selected.map((x:{id:string})=>x.id).join("|")!==
       input.sourceA+"|"+input.sourceB)
      reject("RESULT_SELECTED_PAIR_MISMATCH");
    return view;
  }catch(error){
    if(error instanceof SourceGraphGatewayError)throw error;
    if(error instanceof ScientificArchiveError)
      reject("SOURCE_ARCHIVE_INVALID");
    reject("SOURCE_GRAPH_EVIDENCE_NOT_VERIFIED");
  }
}
async function findRequestRun(id:string,token:string,transport:Transport):Promise<RunMetadata>{
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id))
    reject("INVALID_SOURCE_REQUEST_ID");
  const runs=await readJson<{workflow_runs:RunMetadata[]}>(
    repoApi+"/actions/workflows/oecl-generic-source-lab.yml/runs?event=workflow_dispatch&per_page=100",
    token,transport);
  const matches=runs.workflow_runs?.filter(r=>
    r.display_title==="OECL-SOURCE-REQUEST-"+id&&r.event==="workflow_dispatch");
  if(!Array.isArray(matches)||matches.length!==1)
    reject("VERIFIED_REQUEST_RUN_NOT_FOUND");
  // Fetch the single run independently rather than relying solely on list data.
  const run=await readJson<RunMetadata>(
    repoApi+"/actions/runs/"+matches[0].id,token,transport);
  if(run.display_title!==matches[0].display_title || run.id!==matches[0].id)
    reject("RUN_LIST_IDENTITY_CHANGED");
  return run;
}
export function hasVerifiedExample(a:string,b:string){
  return Object.hasOwn(catalogExamples,a+"|"+b);
}
