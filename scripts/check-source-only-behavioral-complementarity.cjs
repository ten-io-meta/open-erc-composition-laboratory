"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {execFileSync}=require("node:child_process");
const {discover}=require("../laboratory/scientific-behavioral-complementarity/SourceOnlyBehavioralComplementarityDiscovery.cjs");
const [rootA,rootB,output]=process.argv.slice(2);
assert.ok(rootA&&rootB&&output,"Usage: node scripts/check-source-only-behavioral-complementarity.cjs <source-8060> <source-8098> <output.json>");
const shaA="c7eed906835ab39fbc8439eb0493e5a5371b23a2";
const shaB="68a05289bd68d89db8453c49500e0a1ae6cd11ec";
const git=dir=>execFileSync("git",["-C",dir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
assert.equal(git(rootA),shaA,"Unpinned ERC8060");
assert.equal(git(rootB),shaB,"Unpinned ERC8098");
const read=(root,file)=>fs.readFileSync(path.join(root,file),"utf8");
const lockA=JSON.parse(read(rootA,"package-lock.json"));
const lockB=JSON.parse(read(rootB,"package-lock.json"));
const ozA=lockA.packages["node_modules/@openzeppelin/contracts"];
const ozB=lockB.packages["node_modules/@openzeppelin/contracts"];
assert.equal(ozA.version,"4.9.6");
assert.equal(ozA.version,ozB.version);
assert.equal(ozA.integrity,ozB.integrity,"Source dependency integrity mismatch");
const sources=[
  {id:"ten-io-meta/erc8060-native-eth-value",revision:shaA,file:"contracts/ERC8060Reference.sol",
    text:read(rootA,"contracts/ERC8060Reference.sol")},
  {id:"ten-io-meta/erc8098-reference",revision:shaB,file:"contracts/ERC8098Reference.sol",
    text:read(rootB,"contracts/ERC8098Reference.sol")}
];
const dep={id:"@openzeppelin/contracts",revision:ozA.version,
  file:"token/ERC20/extensions/ERC20Burnable.sol",
  text:read(rootA,"node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol")};
const run=(s=sources,d=dep)=>discover(s,d);
const original=run();
assert.deepEqual(original.errors,[]);
assert.equal(original.candidates.length,1,
  "No source-only behavioral complementarity hypothesis discovered");
const candidate=original.candidates[0];
assert.equal(candidate.status,"SOURCE_ONLY_UNEVALUATED");
assert.equal(candidate.candidateAdmission,"NOT_ADMITTED");
assert.equal(candidate.scientificPolarity,"INCONCLUSIVE");
assert.ok(candidate.provenance.length>=8 && candidate.provenance.every(p=>p.sourceSha256 && p.line>0));
assert.equal(candidate.participants.length,2);
const controls=[
  ["nft_owner_guard_absent",(s)=>{s[0].text=s[0].text.replace("ownerOf(tokenId) == msg.sender","ownerOf(tokenId) != msg.sender");}],
  ["nft_value_transfer_absent",(s)=>{s[0].text=s[0].text.replace(".call{value: redeemable}",".call{value: 0}");}],
  ["nft_liability_not_decreased",(s)=>{s[0].text=s[0].text.replace("totalRedeemableValue -= redeemable","totalRedeemableValue += redeemable");}],
  ["nft_balance_guard_absent",(s)=>{s[0].text=s[0].text.replace("address(this).balance >= redeemable","address(this).balance < redeemable");}],
  ["erc20_burnable_inheritance_removed",(s)=>{s[1].text=s[1].text.replace("ERC20, ERC20Burnable","ERC20");}],
  ["erc20_initial_allocation_removed",(s)=>{s[1].text=s[1].text.replace("_mint(initialHolder, initialSupply)","_transfer(initialHolder, initialHolder, initialSupply)");}],
  ["unexpected_public_mint",(s)=>{s[1].text+="\nfunction mint(uint256 amount) external {}\n";}],
  ["dependency_burn_removed",(s,d)=>{d.text=d.text.replace("_burn(_msgSender(), amount)","_transfer(_msgSender(), address(0), amount)");}],
  ["owner_guard_only_a_comment",(s)=>{s[0].text=s[0].text.replace("require(ownerOf(tokenId) == msg.sender, \"Not token owner\");","// require(ownerOf(tokenId) == msg.sender, \"Not token owner\");");}],
  ["entire_nft_source_commented_out",(s)=>{s[0].text="/*\\n"+s[0].text+"\\n*/";}],
  ["erc20_burn_import_only_comment",(s)=>{s[1].text=s[1].text.replace('import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";','// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";');}],
  ["dependency_burn_only_comment",(s,d)=>{d.text=d.text.replace("_burn(_msgSender(), amount);","// _burn(_msgSender(), amount);");}],
  ["nft_burn_unconditionally_reverts",(s)=>{s[0].text=s[0].text.replace('require(ownerOf(tokenId) == msg.sender, "Not token owner");','revert("disabled");\\n        require(ownerOf(tokenId) == msg.sender, "Not token owner");');}]
];
for(const [label,change] of controls) {
  const s=structuredClone(sources),d=structuredClone(dep);
  change(s,d);
  const result=run(s,d);
  assert.equal(result.candidates.length,0,"Unsupported source alteration manufactured a hypothesis: "+label);
}
const hash=text=>crypto.createHash("sha256").update(text).digest("hex");
const report={
  schemaVersion:"OECL_SOURCE_ONLY_BEHAVIORAL_HYPOTHESIS_V1",
  inputKind:"PINNED_SOURCE_TEXT_AND_LOCKED_DEPENDENCY_ONLY",
  sourceRevisions:[{id:sources[0].id,revision:shaA,sha256:hash(sources[0].text)},
    {id:sources[1].id,revision:shaB,sha256:hash(sources[1].text)}],
  dependency:{package:"@openzeppelin/contracts",version:"4.9.6",integrity:ozA.integrity,
    path:dep.file,sha256:hash(dep.text)},
  hypothesis:candidate,
  rejectedSourceMutations:controls.map(x=>x[0]),
  originalStructuralNativeCandidateStatus:"SEPARATE_DISCOVERY_PATH_NOT_PROMOTED",
  executionEvidenceUsed:false,
  candidateAdmission:"NOT_ADMITTED",
  scientificPolarity:"INCONCLUSIVE",
  limitations:"This is a narrow, rule-based source-only hypothesis. It does not prove control flow, valid coordinator custody, atomic cross-protocol execution, universal compatibility, or generalized emergent-property discovery."
};
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log("OECL_SOURCE_ONLY_BEHAVIORAL_DISCOVERY:"+JSON.stringify({
  hypothesis:candidate.mechanism,sourceEvidence:candidate.provenance.length,
  sourceMutationsRejected:controls.length,executionEvidenceUsed:false,
  admission:report.candidateAdmission,polarity:report.scientificPolarity
}));
