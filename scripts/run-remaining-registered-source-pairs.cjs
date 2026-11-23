"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");

// Only immutable registered Solidity sources; no user URLs, code or scripts.
const registry=require("../laboratory/scientific-open-source-worker/source-registry.json");
const root=path.resolve(__dirname,"../..");
const oecl=path.join(root,"oecl");
const workflow=fs.readFileSync(path.join(oecl,".github/workflows/oecl-generic-source-lab.yml"),"utf8");
const shard=Number(process.argv[2]);
assert.ok(Number.isInteger(shard)&&shard>=0&&shard<3,"Shard must be 0, 1 or 2");
const ids=registry.sources.map(x=>x.id);
const pairKey=(a,b)=>[a,b].sort().join("|");
const configured=new Set();
for(const m of workflow.matchAll(/run-generic-source-worker\.cjs\s+(ERC-[A-Z0-9-]+)\s+(ERC-[A-Z0-9-]+)\s+dependency-source\s+source-output\/pair-[a-z0-9-]+/g)){
  assert.ok(ids.includes(m[1])&&ids.includes(m[2]));
  configured.add(pairKey(m[1],m[2]));
}
assert.equal(ids.length,10,"Expected reviewed 10-profile registry");
assert.equal(configured.size,9,"Existing reviewed regression pair coverage has changed");
const all=[];
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  if(!configured.has(pairKey(ids[i],ids[j])))all.push([ids[i],ids[j]]);
}
assert.equal(all.length,36,"New source-only pair inventory must cover all missing pairs");
const outputDir=path.join(root,"source-output");
fs.mkdirSync(outputDir,{recursive:true});
const results=[];
for(const [index,pair] of all.entries()){
  if(index%3!==shard)continue;
  const [a,b]=pair;
  const resultDir=path.join(outputDir,"matrix-"+a+"-"+b);
  const args=[path.join(oecl,"laboratory/scientific-open-source-worker/run-generic-source-worker.cjs"),
    a,b,path.join(root,"dependency-source"),resultDir];
  const processRun=spawnSync(process.execPath,args,{
    cwd:root,env:process.env,encoding:"utf8",timeout:100000,maxBuffer:1_000_000,
  });
  const reportFile=path.join(resultDir,"source-scientific-report.json");
  let report=null,error=null,digest=null;
  try{
    if(processRun.error)throw processRun.error;
    if(processRun.status!==0)throw Error("WORKER_EXIT_"+String(processRun.status));
    const raw=fs.readFileSync(reportFile);
    report=JSON.parse(raw.toString("utf8"));
    if(report.selected?.map(x=>x.id).join("|")!==a+"|"+b||
       report.scientificVerdict!=="INCONCLUSIVE"||
       report.candidateAdmission!=="NOT_ADMITTED"||
       report.sourceOnly!==true||report.evmExecuted!==false||
       !Number.isInteger(report.counts?.sourceUnits)||
       report.counts.sourceUnits<2)
      throw Error("SOURCE_REPORT_SCOPE_OR_IDENTITY_FAILED");
    digest=crypto.createHash("sha256").update(raw).digest("hex");
  }catch(e){error=String(e?.message||"UNKNOWN_WORKER_ERROR").slice(0,160);}
  results.push({
    sourceA:a,sourceB:b,
    status:error?"SOURCE_ANALYSIS_FAILED":"SOURCE_AST_COMPILED",
    reportSha256:digest,
    sourceUnitCount:report?.counts?.sourceUnits??null,
    hypotheses:report?.counts?.hypotheses??null,
    scientificVerdict:error?null:"INCONCLUSIVE",
    candidateAdmission:error?null:"NOT_ADMITTED",
    evmExecuted:false,error,
  });
  console.log("OECL_SOURCE_MATRIX_PAIR",a,b,error?"FAILED":"SOURCE_ONLY_COMPLETE",
    report?.counts?.hypotheses??"n/a");
}
assert.equal(results.length,12,"Each shard must attempt exactly 12 source pairs");
const failed=results.filter(x=>x.status!=="SOURCE_AST_COMPILED");
const out={schemaVersion:"OECL_REMAINING_PINNED_AST_PAIR_MATRIX_V1",
  evidenceLevel:"COMPILER_RESOLVED_SOURCE_ONLY",shard,allProfiles:ids.length,
  existingRegressionPairs:configured.size,remainingPairCount:all.length,
  scientificScope:"NOT_AN_EVM_COMPATIBILITY_TEST",
  attempted:results.length,passed:results.length-failed.length,failed:failed.length,
  results};
fs.writeFileSync(path.join(outputDir,"oecl-new-pair-matrix-"+shard+".json"),
  JSON.stringify(out,null,2)+"\n");
console.log("OECL_REMAINING_AST_SHARD",JSON.stringify({
  shard,attempted:out.attempted,passed:out.passed,failed:out.failed
}));
if(failed.length)process.exitCode=1;
