"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const {analyze}=require("../laboratory/scientific-behavioral-complementarity/ScientificGraphBoundBehavioralDiscovery.cjs");
const [graphPath,outputPath]=process.argv.slice(2);
assert.ok(graphPath&&outputPath,"Usage: node check-graph-behavioral-discovery.cjs <AST-graph.json> <output.json>");
const bytes=fs.readFileSync(graphPath),graph=JSON.parse(bytes);
const result=analyze(graph);
assert.deepEqual(result.errors,[],"AST graph must produce one source-only hypothesis");
assert.equal(result.hypotheses.length,1,"No independent AST-derived behavioral hypothesis");
assert.equal(result.status,"SOURCE_ONLY_UNEVALUATED");
assert.equal(result.admission,"NOT_ADMITTED");
assert.equal(result.scientificPolarity,"INCONCLUSIVE");
assert.deepEqual(result.participants.map(p=>p.assetClass).sort(),["CLAIM","FUNGIBLE"]);
assert.equal(result.hypotheses[0].admission,"NOT_ADMITTED");
assert.equal(result.hypotheses[0].scientificPolarity,"INCONCLUSIVE");
assert.ok(result.hypotheses[0].sourceEvidence.every(f=>
  /^[a-f0-9]{64}$/i.test(f.sourceSha256)&&f.factId.startsWith("AST:")));
const tests=[
  ["missing_nft_internal_call",g=>{
    const nft=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="burn");
    const intern=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="_burn");
    g.edges=g.edges.filter(x=>!(x.kind==="CALLS"&&x.from===nft.id&&x.to===intern.id));
  }],
  ["missing_nft_liability_decrease",g=>{
    g.writes=g.writes.filter(x=>x.state!=="totalRedeemableValue"||x.kind!=="DECREASE");
  }],
  ["missing_owner_authorization",g=>{
    const fn=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="burn");
    g.guards=g.guards.filter(x=>x.owner!==fn.id||!x.condition.includes("ownerOf(tokenId)"));
  }],
  ["missing_nft_solvency_guard",g=>{
    const fn=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="burn");
    g.guards=g.guards.filter(x=>x.owner!==fn.id||!x.condition.includes("address(this).balance"));
  }],
  ["missing_eth_payment",g=>{
    const fn=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="burn");
    g.externalCalls=g.externalCalls.filter(x=>x.owner!==fn.id);
  }],
  ["nft_burn_unreachable_revert",g=>{
    const fn=g.functions.find(x=>x.contractName==="ERC8060Reference"&&x.name==="burn");
    g.aborts.push({owner:fn.id,kind:"REVERT",location:fn.location});
  }],
  ["forged_primary_source_hash",g=>{
    const p=g.provenance.primary[0];
    g.sources.find(s=>s.unit===p.unit).sha256="0".repeat(64);
  }],
  ["swapped_primary_source_sha",g=>{
    const [a,b]=g.provenance.primary;
    [a.sourceSha256,b.sourceSha256]=[b.sourceSha256,a.sourceSha256];
  }],
  ["removed_erc20_inheritance",g=>{
    const f=g.contracts.find(x=>x.name==="ERC8098Reference");
    f.linearizedBaseContracts=[];
  }],
  ["removed_inherited_fungible_burn",g=>{
    const x=g.functions.find(x=>x.contractName==="ERC20Burnable"&&x.name==="burn");
    const y=g.functions.find(x=>x.contractName==="ERC20"&&x.name==="_burn");
    g.edges=g.edges.filter(e=>!(e.kind==="CALLS"&&e.from===x.id&&e.to===y.id));
  }],
  ["removed_inherited_fungible_sender",g=>{
    const x=g.functions.find(x=>x.contractName==="ERC20Burnable"&&x.name==="burn");
    g.edges=g.edges.filter(e=>!(e.kind==="CALLS"&&e.from===x.id&&
      g.functions.some(f=>f.id===e.to&&f.name==="_msgSender")));
  }],
  ["removed_inherited_fungible_supply_debit",g=>{
    const x=g.functions.find(x=>x.contractName==="ERC20"&&x.name==="_burn");
    g.writes=g.writes.filter(e=>!(e.owner===x.id&&e.state==="_totalSupply"));
  }],
  ["removed_inherited_balance_guard",g=>{
    const x=g.functions.find(x=>x.contractName==="ERC20"&&x.name==="_burn");
    g.guards=g.guards.filter(e=>!(e.owner===x.id&&e.condition.includes("accountBalance")));
  }],
  ["missing_constructor_mint_link",g=>{
    const x=g.functions.find(x=>x.contractName==="ERC8098Reference"&&x.kind==="constructor");
    const y=g.functions.find(x=>x.contractName==="ERC20"&&x.name==="_mint");
    g.edges=g.edges.filter(e=>!(e.kind==="CALLS"&&e.from===x.id&&e.to===y.id));
  }],
  ["unexpected_fungible_public_mint",g=>{
    const x=g.contracts.find(x=>x.name==="ERC8098Reference");
    g.functions.push({id:9999999,contractId:x.id,contractName:x.name,name:"mint",
      kind:"function",visibility:"external",implemented:true,parameterTypes:["uint256"],
      unit:x.unit,location:x.location});
  }],
  ["missing_dependency_lineage",g=>{
    g.provenance.dependency.integrity="";
  }]
];
for(const [name,mutate] of tests){
  const changed=structuredClone(graph);
  mutate(changed);
  const tested=analyze(changed);
  assert.equal(tested.hypotheses.length,0,
    "Malicious graph alteration produced a hypothesis: "+name);
}
const report={
  schemaVersion:"OECL_AST_BOUND_BEHAVIORAL_SOURCE_DISCOVERY_V1",
  inputKind:"PINNED_COMPILER_RESOLVED_AST_ONLY",
  graphEvidence:{path:graphPath,sha256:crypto.createHash("sha256").update(bytes).digest("hex")},
  normalizedParticipants:result.participants,
  hypotheses:result.hypotheses,
  relation:result.mechanism,
  negativeControls:tests.map(x=>x[0]),
  admission:"NOT_ADMITTED",
  scientificPolarity:"INCONCLUSIVE",
  executionEvidenceUsed:false,
  limitations:result.warnings
};
fs.mkdirSync(path.dirname(outputPath),{recursive:true});
fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n");
console.log("OECL_AST_BEHAVIORAL_DISCOVERY:"+JSON.stringify({
  hypotheses:report.hypotheses.length,
  participants:report.normalizedParticipants.map(x=>x.assetClass),
  sourceFacts:report.hypotheses[0].sourceEvidence.length,
  negativeControls:report.negativeControls.length,
  candidateAdmission:report.admission,
  scientificPolarity:report.scientificPolarity
}));
