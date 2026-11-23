import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import registry from "../../laboratory/scientific-open-source-worker/source-registry.json" with {type:"json"};

// Inventory only: verifies what AST CI schedules, NOT whether untested pairs are compatible.
const workflow=readFileSync(resolve(process.argv[2]||"oecl/.github/workflows/oecl-generic-source-lab.yml"),"utf8");
const output=resolve(process.argv[3]||"audit-output/registered-source-pairs.json");
const ids=registry.sources.map(x=>x.id);
assert.equal(ids.length,new Set(ids).size,"Duplicate implementation profiles");
assert.ok(ids.length>=6);
const key=(a,b)=>[a,b].sort().join("|");
const configured=new Set();
const regex=/run-generic-source-worker\.cjs\s+(ERC-[A-Z0-9-]+)\s+(ERC-[A-Z0-9-]+)\s+dependency-source\s+source-output\/pair-[a-z0-9-]+/g;
for(const match of workflow.matchAll(regex)){
  const a=match[1],b=match[2];
  assert.ok(ids.includes(a)&&ids.includes(b)&&a!==b,"Unregistered or self-comparison in CI workflow");
  const k=key(a,b);
  assert.ok(!configured.has(k),"Duplicate CI source-pair experiment");
  configured.add(k);
}
assert.ok(configured.size>=9,"Existing CI source experiments must not disappear");
const pairs=[];
for(let i=0;i<ids.length;i++){
  for(let j=i+1;j<ids.length;j++){
    const a=ids[i],b=ids[j],k=key(a,b);
    pairs.push({sourceA:a,sourceB:b,
      ciStatus:configured.has(k)?"CI_EXPERIMENT_CONFIGURED":"PAIR_AST_EXPERIMENT_NOT_CONFIGURED",
      astExecutedInThisInventory:false,evmExecutedInThisInventory:false,
      scientificVerdict:"NOT_EVALUATED"});
  }
}
assert.equal(pairs.length,ids.length*(ids.length-1)/2);
assert.equal(pairs.filter(x=>x.ciStatus==="CI_EXPERIMENT_CONFIGURED").length,configured.size);
const report={
  schemaVersion:"OECL_PINNED_SOURCE_PROFILE_PAIR_COVERAGE_V1",
  evidenceLevel:"IMPLEMENTATION_REGISTRY_INVENTORY_ONLY",
  scientificVerdict:"NOT_EVALUATED",evmExecuted:false,
  sourceProfiles:ids,
  summary:{registeredSourceProfiles:ids.length,possibleDistinctPairs:pairs.length,
    ciAstExperimentsConfigured:configured.size,
    noDedicatedCiAstExperiment:pairs.length-configured.size},
  limitation:"A configured regression command is not proof of EVM execution or safe composability. Consult exact CI artifacts separately.",
  pairs
};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log("OECL_REGISTERED_SOURCE_PAIR_MATRIX_PASS",JSON.stringify(report.summary));
