/* eslint-disable @typescript-eslint/no-require-imports -- Node-only CommonJS fixture executes transpiled TS in an isolated test module. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const ts=require("typescript");
const registry=JSON.parse(fs.readFileSync(
  "../laboratory/scientific-open-source-worker/source-registry.json","utf8"));
const code=fs.readFileSync("src/server/oeclGenericSourceJobs.ts","utf8");
const compiled=ts.transpileModule(code,{compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
  esModuleInterop:true,isolatedModules:true
}}).outputText;
const mod={exports:{}};
const fixedRequire=name=>{
  if(name.endsWith("/source-registry.json"))return registry;
  if(name==="./oeclOnDemandJobs")return {
    isJobId:value=>/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value)
  };
  throw Error("Unexpected dependency in strict generic worker test: "+name);
};
Function("exports","require","module",compiled)(mod.exports,fixedRequire,mod);
const api=mod.exports;
const id="123e4567-e89b-42d3-a456-426614174000";
const token="ghp_FAKE_TOKEN_REDACTED_NEVER_USE";
const today=new Date().toISOString();
assert.equal(api.genericSourceAvailable({}),false);
assert.equal(api.genericSourceAvailable({
  OECL_ENABLE_GENERIC_SOURCE_ANALYSIS:"true",
  OECL_ANALYSIS_ACCESS_KEY:"A".repeat(42),
  OECL_GITHUB_ACTIONS_TOKEN:token
}),true);
assert.equal(api.availableSourceCatalog().length,10);
for(const id of ["ERC-165","ERC-2612","ERC-2981","ERC-4626"]){
  assert.equal(api.acceptedSourcePair(id,"ERC-8060"),true);
  assert.ok(api.availableSourceCatalog().some(x=>x.id===id));
}
assert.equal(api.acceptedSourcePair("ERC-8060","ERC-20-BURNABLE"),true);
assert.equal(api.acceptedSourcePair("ERC-8098","ERC-20"),true);
for(const values of [["ERC-8060","ERC-8060"],["ERC-8098","ERC-9999"],
  ["../evil","ERC-8060"],["https://evil/contract.sol","ERC-721"]])
  assert.equal(api.acceptedSourcePair(...values),false);
const run=(id,state,conclusion=null,created_at=today)=>({
  id:100123,event:"workflow_dispatch",
  display_title:"OECL-SOURCE-REQUEST-"+id,status:state,conclusion,created_at,
  html_url:"https://evil.invalid/not-accepted"
});
assert.equal(api.capacityAvailable([]).available,true);
assert.equal(api.capacityAvailable([run(id,"queued")]).available,false);
assert.equal(api.capacityAvailable([run(id,"in_progress")]).available,false);
assert.equal(api.capacityAvailable([run(id,"completed","success"),
  run(id,"completed","success"),run(id,"completed","success")]).available,false);
assert.equal(api.capacityAvailable([{...run(id,"queued"),display_title:"FOREIGN-JOB-"+id}]).available,true);
const hits=[];
const fake=async (url,opts={})=>{
  hits.push({url,opts});
  if(opts.method==="GET")return new Response(JSON.stringify({workflow_runs:[]}),{status:200});
  if(opts.method==="POST")return new Response(null,{status:204});
  throw Error("Unexpected Github request");
};
(async()=>{
  await api.dispatchGenericSource(id,"ERC-8060","ERC-20-BURNABLE",token,fake);
  assert.equal(hits.length,2);
  assert.match(hits[0].url,/\/oecl-generic-source-lab\.yml\/runs\?/);
  assert.equal(hits[1].opts.method,"POST");
  assert.deepEqual(JSON.parse(hits[1].opts.body),{
    ref:"main",inputs:{
      request_id:id,source_a:"ERC-8060",source_b:"ERC-20-BURNABLE"
    }
  });
  assert.equal(hits[1].url,"https://api.github.com/repos/ten-io-meta/open-erc-composition-laboratory/actions/workflows/oecl-generic-source-lab.yml/dispatches");
  await assert.rejects(api.dispatchGenericSource(id,"ERC-8060","ERC-8060",token,fake),
    /UNREGISTERED_SOURCE_PAIR/);
  await assert.rejects(api.dispatchGenericSource("bad","ERC-8060","ERC-20",token,fake),
    /INVALID_JOB_ID/);
  const blocked=async()=>new Response(JSON.stringify({workflow_runs:[run(id,"queued")]}),{status:200});
  await assert.rejects(api.dispatchGenericSource(id,"ERC-8060","ERC-20",token,blocked),
    /SOURCE_WORKER_CAPACITY_EXHAUSTED/);
  const status=api.sourceJobState([run(id,"completed","success")],id);
  assert.equal(status.state,"AWAITING_SOURCE_ARTIFACT");
  assert.equal(status.runId,100123);
  // A green job is not sufficient evidence; check the named artifact for
  // this specific GitHub run and reject absent, expired or forged listings.
  const artifact = {id:8241,name:"oecl-generic-ast-evidence",expired:false,size_in_bytes:4096};
  const verify = artifacts=>async (url,options)=> {
    assert.equal(url,"https://api.github.com/repos/ten-io-meta/open-erc-composition-laboratory/actions/runs/100123/artifacts?per_page=100");
    assert.equal(options.method,"GET");
    return new Response(JSON.stringify({artifacts}),{status:200});
  };
  assert.equal(await api.hasPublishedSourceArtifact(100123,token,verify([artifact])),true);
  for(const forged of [[],
    [{...artifact,name:"unrelated"}],
    [{...artifact,expired:true}],
    [{...artifact,size_in_bytes:0}],
    [{...artifact,id:null}]]) {
    assert.equal(await api.hasPublishedSourceArtifact(100123,token,verify(forged)),false);
  }
  await assert.rejects(api.hasPublishedSourceArtifact(0,token,verify([artifact])),
    /INVALID_SOURCE_RUN_ID/);
  await assert.rejects(api.hasPublishedSourceArtifact(100123,token,async()=>new Response("{}",{status:403})),
    /SOURCE_ARTIFACT_LOOKUP_FAILED/);
  await assert.rejects(api.hasPublishedSourceArtifact(100123,token,async()=>new Response("{}",{status:200})),
    /SOURCE_ARTIFACT_RESPONSE_INVALID/);
  assert.equal(status.scientificVerdict,null);
  assert.equal(status.runUrl,"https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/100123");
  assert.equal(api.sourceJobState([run(id,"in_progress")],id).state,"RUNNING");
  assert.equal(api.sourceJobState([run(id,"completed","failure")],id).state,"EXECUTION_FAILED");
  assert.equal(api.sourceJobState([],id).state,"AWAITING_GITHUB_RUN");
  const wrongEvent={...run(id,"completed","success"),event:"push"};
  assert.equal(api.sourceJobState([wrongEvent],id).state,"AWAITING_GITHUB_RUN");
  assert.throws(()=>api.sourceJobState([],"../../root"),/INVALID_JOB_ID/);
  await assert.rejects(api.recentSourceRuns(token,async()=>new Response("{}",{status:403})),
    /SOURCE_RUN_LOOKUP_FAILED/);
  console.log("OECL_GENERIC_SOURCE_DISPATCH: PASS · six source profiles, guarded dispatch, verified artifact listing, null scientific verdict");
})().catch(e=>{console.error(e);process.exitCode=1;});
