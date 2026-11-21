"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const {buildGraph}=require("../laboratory/scientific-solidity-graph/ScientificSolidityAstGraph.cjs");
const [rootA,rootB,out]=process.argv.slice(2);
assert.ok(rootA&&rootB&&out,
  "Usage: node check-solidity-structural-graph.cjs <pinned-8060> <pinned-8098> <output.json>");
const SHA_A="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const SHA_B="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const sourceA="contracts/ERC8060Reference.sol";
const sourceB="contracts/ERC8098Reference.sol";
const ozBurnable="@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
const ozCore="@openzeppelin/contracts/token/ERC20/ERC20.sol";
const sourceHash=x=>crypto.createHash("sha256").update(x).digest("hex");
const git=root=>execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(git(rootA),SHA_A,"ERC8060 source revision changed");
assert.equal(git(rootB),SHA_B,"ERC8098 source revision changed");
const read=(root,p)=>fs.readFileSync(path.join(root,p),"utf8");
const originalA=read(rootA,sourceA),originalB=read(rootB,sourceB);
const installedOZ=path.join(rootA,"node_modules/@openzeppelin/contracts");
const pkg=JSON.parse(read(installedOZ,"package.json"));
const lockA=JSON.parse(read(rootA,"package-lock.json"));
const lockB=JSON.parse(read(rootB,"package-lock.json"));
const aLock=lockA.packages["node_modules/@openzeppelin/contracts"];
const bLock=lockB.packages["node_modules/@openzeppelin/contracts"];
assert.equal(pkg.version,"4.9.6");
assert.equal(aLock?.version,"4.9.6");
assert.equal(aLock?.integrity,bLock?.integrity);
const compilerInputs=[
  [sourceA,originalA],
  [sourceB,originalB],
  [ozBurnable,read(installedOZ,"token/ERC20/extensions/ERC20Burnable.sol")],
  [ozCore,read(installedOZ,"token/ERC20/ERC20.sol")]
];
const buildDir=path.join(rootA,"artifacts/build-info");
assert.ok(fs.existsSync(buildDir),"Hardhat must compile pinned sources before AST graph extraction");
const candidates=fs.readdirSync(buildDir).filter(f=>f.endsWith(".json")).map(f=>{
  const build=JSON.parse(fs.readFileSync(path.join(buildDir,f),"utf8"));
  if(!compilerInputs.every(([unit,text])=>
    build.input?.sources?.[unit]?.content===text&&build.output?.sources?.[unit]?.ast))
    return null;
  return {file:f,build};
}).filter(Boolean);
assert.equal(candidates.length,1,
  "Expected exactly one compiler build-info containing all four pinned source/dependency ASTs");
const {build,file:buildFile}=candidates[0];
const graph=buildGraph(build);
const findContract=(unit,name)=>{
  const matches=graph.contracts.filter(x=>x.unit===unit&&x.name===name);
  assert.equal(matches.length,1,"Expected exact AST contract "+name);
  return matches[0];
};
const findFunction=(owner,name,kind="function")=>{
  const matches=graph.functions.filter(f=>f.contractId===owner.id&&f.name===name&&f.kind===kind);
  assert.equal(matches.length,1,"Expected exact AST function "+owner.name+"."+name);
  return matches[0];
};
const call=(graph,from,to)=>graph.edges.some(e=>
  e.kind==="CALLS"&&e.from===from.id&&e.to===to.id);
const applies=(graph,from,to)=>graph.edges.some(e=>
  e.kind==="APPLIES_MODIFIER"&&e.from===from.id&&e.to===to.id);
const write=(graph,fn,name,kind)=>graph.writes.some(e=>
  e.owner===fn.id&&e.state===name&&e.kind===kind);
const validate=g=>{
  assert.equal(g.schemaVersion,"OECL_SOLIDITY_COMPILER_AST_GRAPH_V1");
  assert.equal(g.scientificPolarity,"INCONCLUSIVE");
  assert.equal(g.candidateAdmission,"NOT_ADMITTED");
  assert.ok(compilerInputs.every(([unit,text])=>
    g.sources.some(f=>f.unit===unit&&f.sha256===sourceHash(text))),
    "AST graph is not bound to exact independent source and installed dependency bytes");
  const nft=findContract(sourceA,"ERC8060Reference");
  const ft=findContract(sourceB,"ERC8098Reference");
  const burnable=findContract(ozBurnable,"ERC20Burnable");
  const erc20=findContract(ozCore,"ERC20");
  assert.ok(ft.linearizedBaseContracts.includes(burnable.id));
  assert.ok(ft.linearizedBaseContracts.includes(erc20.id));
  const nftBurn=findFunction(nft,"burn"),internalBurn=findFunction(nft,"_burn");
  const ftBurn=findFunction(burnable,"burn");
  const erc20Burn=findFunction(erc20,"_burn");
  const erc20Mint=findFunction(erc20,"_mint");
  const ftConstructor=findFunction(ft,"constructor","constructor");
  assert.ok(call(g,nftBurn,internalBurn),
    "Public ERC8060 burn has no compiler-resolved edge to internal burn");
  assert.ok(write(g,internalBurn,"totalRedeemableValue","DECREASE"),
    "Internal ERC8060 burn does not debit redemption obligations");
  assert.ok(g.guards.some(x=>x.owner===nftBurn.id&&
    x.condition.includes("ownerOf(tokenId) == msg.sender")));
  assert.ok(g.externalCalls.some(x=>x.owner===nftBurn.id&&
    x.valueExpression?.trim()==="redeemable"));
  const guardContract=g.contracts.find(x=>x.name==="ReentrancyGuard");
  const nonReentrant=g.modifiers.find(x=>x.contractId===guardContract?.id&&x.name==="nonReentrant");
  assert.ok(nonReentrant&&applies(g,nftBurn,nonReentrant),
    "Inherited modifier invocation is not compiler-resolved");
  assert.ok(call(g,ftConstructor,erc20Mint),
    "ERC8098 constructor does not resolve to inherited mint");
  assert.ok(call(g,ftBurn,erc20Burn),
    "ERC20Burnable's function does not resolve to ERC20._burn");
  assert.ok(write(g,erc20Burn,"_totalSupply","DECREASE"),
    "Inherited ERC20 burn does not reduce total supply");
  assert.ok(write(g,erc20Mint,"_totalSupply","INCREASE"),
    "Inherited ERC20 mint is not visible in graph");
  // The mint capability is present in inherited code. Its post-deployment
  // reachability cannot be inferred from its mere existence in this graph.
  return {nft,ft,nftBurn,internalBurn,ftBurn,erc20Burn,erc20Mint,ftConstructor,nonReentrant};
};
const resolved=validate(graph);
const controls=[
  ["swapped_source_digest",g=>{
    const a=g.sources.find(x=>x.unit===sourceA),b=g.sources.find(x=>x.unit===sourceB);
    [a.sha256,b.sha256]=[b.sha256,a.sha256];
  }],
  ["forged_dependency_digest",g=>{
    g.sources.find(x=>x.unit===ozBurnable).sha256="0".repeat(64);
  }],
  ["missing_nft_internal_call",g=>{
    g.edges=g.edges.filter(x=>!(x.kind==="CALLS"&&x.from===resolved.nftBurn.id&&x.to===resolved.internalBurn.id));
  }],
  ["missing_nft_liability_decrease",g=>{
    g.writes=g.writes.filter(x=>!(x.owner===resolved.internalBurn.id&&x.state==="totalRedeemableValue"));
  }],
  ["wrong_erc20_burn_dispatch",g=>{
    g.edges=g.edges.filter(x=>!(x.kind==="CALLS"&&x.from===resolved.ftBurn.id&&x.to===resolved.erc20Burn.id));
  }],
  ["missing_inherited_mint_evidence",g=>{
    g.edges=g.edges.filter(x=>!(x.kind==="CALLS"&&x.from===resolved.ftConstructor.id&&x.to===resolved.erc20Mint.id));
  }],
  ["removed_modifier_edge",g=>{
    g.edges=g.edges.filter(x=>!(x.kind==="APPLIES_MODIFIER"&&x.from===resolved.nftBurn.id&&x.to===resolved.nonReentrant.id));
  }],
  ["erased_eth_payout",g=>{
    g.externalCalls=g.externalCalls.filter(x=>x.owner!==resolved.nftBurn.id);
  }]
];
for(const [name,mutate] of controls){
  const altered=structuredClone(graph);
  mutate(altered);
  assert.throws(()=>validate(altered),undefined,"Graph mutation wrongly accepted: "+name);
}
const report={
  ...graph,
  provenance:{
    primary:[
      {repository:"ten-io-meta/erc8060-native-eth-value",revision:SHA_A,
       unit:sourceA,sourceSha256:sourceHash(originalA)},
      {repository:"ten-io-meta/erc8098-reference",revision:SHA_B,
       unit:sourceB,sourceSha256:sourceHash(originalB)}
    ],
    dependency:{package:"@openzeppelin/contracts",version:pkg.version,
      integrity:aLock.integrity,sourceUnits:[ozCore,ozBurnable]},
    compilerBuildInfoFile:buildFile,
    compilerBuildInfoSha256:sourceHash(fs.readFileSync(path.join(buildDir,buildFile)))
  },
  verifiedStructuralPaths:[
    "NFT_PUBLIC_BURN_TO_INTERNAL_BURN",
    "NFT_INTERNAL_BURN_TO_REDEMPTION_OBLIGATION_DECREASE",
    "NFT_PUBLIC_BURN_TO_INHERITED_NON_REENTRANT_MODIFIER",
    "NFT_BURN_HAS_OWNER_REQUIRE_AND_ETH_LOW_LEVEL_CALL",
    "ERC8098_CONSTRUCTOR_TO_INHERITED_ERC20_MINT",
    "ERC8098_INHERITS_ERC20_BURNABLE",
    "ERC20_BURNABLE_TO_ERC20_INTERNAL_BURN",
    "ERC20_INTERNAL_BURN_DECREASES_SUPPLY",
    "ERC20_INTERNAL_MINT_INCREASES_SUPPLY"
  ],
  rejectedStructuralMutations:controls.map(([name])=>name),
  interpretation:"Compiler-resolved syntax and source identities, not call-path satisfiability, post-deployment supply proof, independent discovery admission or universal ERC compatibility."
};
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+"\n");
console.log("OECL_SOLIDITY_AST_GRAPH:"+JSON.stringify({
  compiler:report.compilerVersion,sources:graph.sources.length,
  contracts:graph.contracts.length,functions:graph.functions.length,
  calls:graph.edges.filter(e=>e.kind==="CALLS").length,
  modifiers:graph.edges.filter(e=>e.kind==="APPLIES_MODIFIER").length,
  guards:graph.guards.length,stateWrites:graph.writes.length,
  verifiedPaths:report.verifiedStructuralPaths.length,
  negativeControls:controls.length,status:report.status,
  scientificPolarity:report.scientificPolarity
}));
