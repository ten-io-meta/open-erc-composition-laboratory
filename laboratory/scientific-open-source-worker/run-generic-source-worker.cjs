"use strict";
/**
 * Isolated, SOURCE-ONLY Solidity worker. Never evaluates Solidity top-level
 * JS, npm scripts, repository build scripts, forge commands, or EVM bytecode.
 * Only an immutable registry of GitHub commits and a lock-pinned OZ package
 * may supply source units. The source tree is compiled to a solc AST.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {buildGraph}=require("../scientific-solidity-graph/ScientificSolidityAstGraph.cjs");
const {discoverGenericPair}=require("./GenericAstPairHypotheses.cjs");
const {evaluateFeasibility}=require("./ScientificAstPathFeasibility.cjs");
const REGISTRY=require("./source-registry.json");
const MAX_FILE_BYTES=256*1024,MAX_TOTAL_BYTES=2*1024*1024;
const MAX_FILES=110,MAX_GITHUB_TREE=4500;
const sha256=b=>crypto.createHash("sha256").update(b).digest("hex");
const sha1GitBlob=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\0")).update(b).digest("hex");
const hex40=x=>typeof x==="string"&&/^[a-f0-9]{40}$/.test(x);
const strictPath=x=>typeof x==="string"&&
  x.length>0&&x.length<=200&&/^[A-Za-z0-9_./-]+$/.test(x)&&
  !x.startsWith("/")&&!x.includes("//")&&
  !x.split("/").some(part=>part==="."||part===".."||!part);
function choosePair(a,b){
  if(typeof a!=="string"||typeof b!=="string"||a===b)
    throw Error("INVALID_SOURCE_PAIR");
  const entries=[a,b].map(id=>REGISTRY.sources.find(x=>x.id===id));
  if(entries.some(x=>!x))throw Error("SOURCE_NOT_IN_REVIEWED_REGISTRY");
  return entries;
}
function lockedDependencies(root){
  const lock=JSON.parse(fs.readFileSync(path.join(root,"package-lock.json"),"utf8"));
  const pkg=lock?.packages?.["node_modules/@openzeppelin/contracts"];
  if(!pkg||pkg.version!==REGISTRY.openzeppelin.version||
      typeof pkg.integrity!=="string"||!pkg.integrity.startsWith("sha512-"))
    throw Error("OPENZEPPELIN_LOCK_INTEGRITY_MISSING");
  const ozRoot=fs.realpathSync(path.join(root,"node_modules/@openzeppelin/contracts"));
  const manifest=JSON.parse(fs.readFileSync(path.join(ozRoot,"package.json"),"utf8"));
  if(manifest.version!==REGISTRY.openzeppelin.version)
    throw Error("OPENZEPPELIN_INSTALLED_VERSION_CHANGED");
  const readOZ=(relative)=>{
    if(!strictPath(relative)||!relative.endsWith(".sol"))
      throw Error("INVALID_DEPENDENCY_IMPORT");
    const filename=fs.realpathSync(path.join(ozRoot,relative));
    if(!filename.startsWith(ozRoot+path.sep))throw Error("DEPENDENCY_TRAVERSAL");
    return fs.readFileSync(filename);
  };
  return {integrity:pkg.integrity,version:pkg.version,readOZ,
    solc:require(path.resolve(root,"node_modules/solc"))};
}
function apiHeaders(env=process.env){
  return {
    Accept:"application/vnd.github+json",
    "X-GitHub-Api-Version":"2022-11-28",
    "User-Agent":"oecl-source-only-ast-worker",
    ...(env.GITHUB_TOKEN?{Authorization:"Bearer "+env.GITHUB_TOKEN}:{})
  };
}
async function githubJson(url,fetcher=fetch,env=process.env){
  if(!url.startsWith("https://api.github.com/repos/"))
    throw Error("DISALLOWED_GITHUB_ORIGIN");
  const response=await fetcher(url,{
    method:"GET",headers:apiHeaders(env),
    cache:"no-store",redirect:"error",
    signal:AbortSignal.timeout(12000)
  });
  if(!response.ok)throw Error("GITHUB_SOURCE_UNAVAILABLE:"+response.status);
  const text=await response.text();
  if(text.length>9*1024*1024)throw Error("GITHUB_RESPONSE_TOO_LARGE");
  return JSON.parse(text);
}
async function lockedTree(entry,fetcher,env){
  if(entry.kind!=="github"||
      !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(entry.repository)||
      !hex40(entry.revision)||!strictPath(entry.file))
    throw Error("UNTRUSTED_REGISTRY_COORDINATES");
  const base="https://api.github.com/repos/"+entry.repository;
  const commit=await githubJson(base+"/git/commits/"+entry.revision,fetcher,env);
  if(commit.sha!==entry.revision||!hex40(commit.tree?.sha))
    throw Error("PINNED_GITHUB_COMMIT_MISMATCH");
  const tree=await githubJson(base+"/git/trees/"+commit.tree.sha+"?recursive=1",fetcher,env);
  if(tree.sha!==commit.tree.sha||tree.truncated||!Array.isArray(tree.tree)||
      tree.tree.length>MAX_GITHUB_TREE)throw Error("GITHUB_TREE_INCOMPLETE_OR_TOO_LARGE");
  const blobs=new Map();
  for(const item of tree.tree){
    if(item.type!=="blob"||item.mode!=="100644"||
        !strictPath(item.path)||!item.path.endsWith(".sol"))continue;
    if(!hex40(item.sha)||item.size>MAX_FILE_BYTES)continue;
    blobs.set(item.path,{sha:item.sha,size:item.size});
  }
  if(!blobs.has(entry.file))throw Error("PINNED_GITHUB_CONTRACT_NOT_FOUND");
  return {base,entry,blobs,fetcher,env};
}
async function githubSource(tree,file){
  const meta=tree.blobs.get(file);
  if(!meta)throw Error("SOURCE_NOT_PRESENT_IN_PINNED_TREE:"+file);
  const data=await githubJson(tree.base+"/git/blobs/"+meta.sha,tree.fetcher,tree.env);
  if(data.sha!==meta.sha||data.encoding!=="base64"||
      typeof data.content!=="string"||data.size!==meta.size)
    throw Error("GITHUB_BLOB_IDENTITY_MISMATCH");
  const value=Buffer.from(data.content.replace(/\s/g,""),"base64");
  if(value.length!==meta.size||value.length>MAX_FILE_BYTES||
      sha1GitBlob(value)!==meta.sha)throw Error("GITHUB_BLOB_HASH_MISMATCH");
  return value;
}
function imports(text){
  const out=[];
  // Source acquisition only. ALL capability inference happens on solc AST.
  const re=/\bimport\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']\s*;/g;
  let hit;
  while((hit=re.exec(text))!==null){
    if(hit[1].length>180)throw Error("IMPORT_PATH_TOO_LONG");
    out.push(hit[1]);
    if(out.length>60)throw Error("TOO_MANY_IMPORTS");
  }
  return out;
}
function resolveImport(unit,imp){
  if(imp.startsWith("@openzeppelin/contracts/")){
    const suffix=imp.slice("@openzeppelin/contracts/".length);
    if(!strictPath(suffix))throw Error("INVALID_OZ_IMPORT");
    return "@openzeppelin/contracts/"+suffix;
  }
  if(!imp.startsWith("./")&&!imp.startsWith("../"))
    throw Error("UNSUPPORTED_EXTERNAL_PACKAGE_IMPORT:"+imp);
  const candidate=path.posix.normalize(path.posix.join(path.posix.dirname(unit),imp));
  if(!candidate.endsWith(".sol")||
      !(unit.startsWith("@openzeppelin/contracts/")
        ? candidate.startsWith("@openzeppelin/contracts/") &&
          strictPath(candidate.slice("@openzeppelin/contracts/".length))
        : strictPath(candidate)))
    throw Error("IMPORT_TRAVERSAL");
  if(unit.startsWith("github/")){
    const namespace=unit.split("/").slice(0,2).join("/")+"/";
    if(!candidate.startsWith(namespace))throw Error("GITHUB_CROSS_REPOSITORY_IMPORT");
  } else if(!candidate.startsWith("@openzeppelin/contracts/"))
    throw Error("DEPENDENCY_CROSS_ROOT_IMPORT");
  return candidate;
}
async function collectSources(pair,dependencyRoot,fetcher=fetch,env=process.env){
  const deps=lockedDependencies(dependencyRoot);
  const trees=await Promise.all(pair.map(entry=>entry.kind==="github"?
    lockedTree(entry,fetcher,env):null));
  const roots=pair.map((entry,i)=>{
    if(entry.kind==="openzeppelin"){
      if(!strictPath(entry.file))throw Error("UNTRUSTED_OPENZEPPELIN_ENTRY");
      return "@openzeppelin/contracts/"+entry.file;
    }
    return "github/"+i+"/"+entry.file;
  });
  const queue=[...roots],seen=new Set(),files=new Map();
  let bytes=0;
  while(queue.length){
    const unit=queue.shift();
    if(seen.has(unit))continue;
    if(seen.size>=MAX_FILES)throw Error("SOURCE_UNIT_LIMIT");
    seen.add(unit);
    let raw;
    if(unit.startsWith("@openzeppelin/contracts/")){
      raw=deps.readOZ(unit.slice("@openzeppelin/contracts/".length));
    } else {
      const parts=unit.split("/");
      const i=Number(parts[1]);
      if(![0,1].includes(i)||!trees[i])throw Error("SOURCE_NAMESPACE_NOT_ALLOWED");
      raw=await githubSource(trees[i],parts.slice(2).join("/"));
    }
    if(raw.length>MAX_FILE_BYTES || (bytes+=raw.length)>MAX_TOTAL_BYTES)
      throw Error("SOURCE_BYTES_LIMIT");
    const content=new TextDecoder("utf-8",{fatal:true}).decode(raw);
    files.set(unit,{content,sha256:sha256(raw)});
    for(const imp of imports(content)){
      const target=resolveImport(unit,imp);
      if(!seen.has(target))queue.push(target);
    }
  }
  return {deps,files,roots};
}
function compileAstBundle(collected){
  const compiler=collected.deps.solc;
  const version=compiler.version();
  if(!/^0\.8\.(2[0-9]|3[0-9])\+/.test(version))
    throw Error("UNSUPPORTED_LOCKED_SOLC_COMPILER:"+version);
  const sources=Object.fromEntries([...collected.files].map(([unit,v])=>[unit,{content:v.content}]));
  const input={language:"Solidity",sources,settings:{
    optimizer:{enabled:false},
    outputSelection:{"*":{"":["ast"]}}
  }};
  const output=JSON.parse(compiler.compile(JSON.stringify(input)));
  const fatal=(output.errors||[]).filter(e=>e.severity==="error");
  if(fatal.length)throw Error("COMPILER_AST_FAILED:"+fatal.slice(0,3).map(e=>e.errorCode||e.type).join(","));
  const buildInfo={input,output,solcVersion:version};
  return {graph:buildGraph(buildInfo),buildInfo};
}
function compileAst(collected){ return compileAstBundle(collected).graph; }
function resultRecord(pair,collected,graph,hypotheses,feasibility){
  const report={
    schemaVersion:"OECL_OPEN_GENERIC_AST_RESULT_V1",
    scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
    sourceOnly:true,evmExecuted:false,
    selected:pair.map((e,i)=>({id:e.id,kind:e.kind,
      sourceUnit:collected.roots[i],
      revision:e.kind==="github"?e.revision:REGISTRY.openzeppelin.version,
      repository:e.kind==="github"?e.repository:REGISTRY.openzeppelin.package,
      sourceSha256:collected.files.get(collected.roots[i]).sha256})),
    compilerVersion:graph.compilerVersion,
    dependencyIntegrity:collected.deps.integrity,
    graphSha256:sha256(Buffer.from(JSON.stringify(graph))),
    hypothesisArtifactSha256:sha256(Buffer.from(JSON.stringify(hypotheses))),
    pathFeasibilityArtifactSha256:sha256(Buffer.from(JSON.stringify(feasibility))),
    pathScreen:{sourceOnly:true,evmExecuted:false,
      blockedModeledPaths:feasibility.hypotheses.filter(h=>h.pathScreen==="AT_LEAST_ONE_MODELED_PATH_BLOCKED").length,
      unprovenExecutablePaths:feasibility.hypotheses.filter(h=>h.pathScreen==="NOT_PROVEN_EXECUTABLE").length},
    counts:{sourceUnits:collected.files.size,contracts:graph.contracts.length,
      callableFunctions:graph.functions.length,
      stateDecreases:graph.writes.filter(w=>w.kind==="DECREASE").length,
      hypotheses:hypotheses.hypotheses.length},
    hypotheses:hypotheses.hypotheses,
    discoveryReason:hypotheses.reason,
    scientificLimitations:[
      ...graph.limitations,...hypotheses.limitations,
      "This run does not verify EVM behavior, native candidate admission or full execution-path reachability.",
      "The supported catalogue is finite; an unsupported ERC is not declared incompatible."
    ]
  };
  return report;
}
async function analyzePair(a,b,root,fetcher=fetch,env=process.env){
  const pair=choosePair(a,b);
  const collected=await collectSources(pair,root,fetcher,env);
  const {graph,buildInfo}=compileAstBundle(collected);
  const primary=pair.map((e,i)=>({
    id:e.id,contract:e.contract,unit:collected.roots[i]
  }));
  const discovery=discoverGenericPair(graph,primary);
  if(discovery.errors.length)throw Error("SOURCE_DISCOVERY_INVALID:"+discovery.errors.join(","));
  const feasibility=evaluateFeasibility(buildInfo,graph,discovery);
  return {graph,discovery,feasibility,
    report:resultRecord(pair,collected,graph,discovery,feasibility)};
}
async function runCli(){
  const [a,b,dependencyRoot,outDir]=process.argv.slice(2);
  assert.ok(a&&b&&dependencyRoot&&outDir,
    "Usage: node run-generic-source-worker.cjs <ERC-A> <ERC-B> <audited-dependency-root> <output-dir>");
  fs.mkdirSync(outDir,{recursive:true});
  try{
    const {graph,discovery,feasibility,report}=await analyzePair(a,b,dependencyRoot);
    for(const [filename,artifact] of [["structural-ast-graph",graph],
      ["generic-source-hypotheses",discovery],["path-feasibility",feasibility],
      ["source-scientific-report",report]]){
      fs.writeFileSync(path.join(outDir,filename+".json"),
        JSON.stringify(artifact,null,2)+"\n");
    }
    console.log("OECL_GENERIC_AST_WORKER:"+JSON.stringify({
      status:"SOURCE_ONLY_INCONCLUSIVE",selected:report.selected.map(x=>x.id),
      units:report.counts.sourceUnits,hypotheses:report.counts.hypotheses,
      scientificVerdict:report.scientificVerdict}));
  }catch(error){
    fs.writeFileSync(path.join(outDir,"source-worker-error.json"),
      JSON.stringify({schemaVersion:"OECL_GENERIC_SOURCE_WORKER_ERROR_V1",
        scientificVerdict:"INCONCLUSIVE",candidateAdmission:"NOT_ADMITTED",
        status:"ANALYSIS_FAILED",reason:String(error.message||error).slice(0,220)},null,2)+"\n");
    console.error("OECL_GENERIC_AST_FAILED:",String(error.message||error).slice(0,220));
    process.exitCode=1;
  }
}
if(require.main===module)runCli();
module.exports={choosePair,strictPath,resolveImport,imports,lockedTree,
  githubSource,collectSources,compileAst,compileAstBundle,resultRecord,analyzePair,sha1GitBlob};
