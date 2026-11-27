"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {assess,load,EXPECTED_SHA}=require("../laboratory/scientific-causal-mechanism/PinnedVaultAssetCallWitness.cjs");

const dir=process.env.OECL_ED001_FIXED_SOURCE_PAIR_DIR;
const oz=process.env.OECL_ED001_PINNED_OZ_ROOT;
assert.ok(dir&&oz,"OECL_ED001_PINNED_SOURCE_TEST_REQUIRES_REAL_COMPILED_SHARD_AND_PINNED_OZ_FILES");
function original(){return load({reportDir:dir,sourceRoot:oz});}
function reject(mutator,code){
 const input=original();mutator(input);
 assert.throws(()=>assess(input),new RegExp("OECL_ED001_PINNED_DEPENDENCY_UNRESOLVED:"+code));
}
test("real compiler and raw pinned bytes establish a generic IERC20 dependency only",()=>{
 const source=original();
 const before=JSON.stringify(source.graph);
 const result=assess(source);
 assert.equal(JSON.stringify(source.graph),before,"no modification to source");
 assert.equal(result.scientificFinding,"PINNED_GENERIC_IERC20_TRANSFER_DEPENDENCY_IN_ERC4626_SOURCE_ONLY");
 assert.equal(result.callChains.length,4);
 assert.deepEqual(result.callChains.map(x=>x.id),[
   "VAULT_DEPOSIT_TO_IERC20_TRANSFER_FROM",
   "VAULT_REDEEM_TO_IERC20_TRANSFER",
   "VAULT_REDEEM_BURNS_OWN_SHARES",
   "BURNABLE_EXT_BURNS_OWN_TOKEN"
 ]);
 for(const x of result.callChains)assert.ok(x.verifiedEdges.length>=1);
 assert.equal(result.identifiedSourceLevelDependency.underlyingTransferRequestsPresent,true);
 assert.equal(result.identifiedSourceLevelDependency.burnableImplementationAsActualAsset,
   "NOT_ESTABLISHED");
 assert.equal(result.actualCrossParticipantCausalEffect,"NOT_ESTABLISHED");
 assert.equal(result.novelEmergentProperty,"NOT_DEMONSTRATED");
 assert.equal(result.evmExecuted,false);
 assert.equal(result.canAnnounceEmergence,false);
 assert.equal(result.changesExistingVerdicts,false);
 assert.equal(result.evmExecutionAuthorized,false);
 assert.equal(result.hypothesisOrigin,"HUMAN_INTERPRETATION_OF_BOUNDED_AST_FINDING");
});
test("changing a single byte of the original source fails closed",()=>{
 reject(x=>{x.files.VAULT=Buffer.from(x.files.VAULT);
   x.files.VAULT[30]=x.files.VAULT[30]^1;}, "RAW_SOURCE_BYTES_NOT_PINNED_VAULT");
});
test("substituting another source file cannot impersonate SafeERC20",()=>{
 reject(x=>{x.files.SAFE=x.files.ERC20;}, "RAW_SOURCE_BYTES_NOT_PINNED_SAFE");
});
test("graph source identity must match the byte-for-byte raw files",()=>{
 reject(x=>{x.graph.sources.find(s=>s.unit.endsWith("/ERC4626.sol")).sha256="0".repeat(64);},
   "COMPILER_GRAPH_DIGEST_MISMATCH");
});
test("an inserted forged compiler call path is not accepted",()=>{
 reject(x=>{x.graph.edges.push({...x.graph.edges[0],from:1237,to:854});},
   "COMPILER_GRAPH_DIGEST_MISMATCH");
});
test("forged machine-origin emergent claim is rejected",()=>{
 reject(x=>{x.report.scientificVerdict="SCOPED_EMERGENCE_SUPPORTED";},
   "PINNED_SOURCE_REPORT_CHANGED");
});
test("swapping profile identities rejects cross-contract binding illusion",()=>{
 reject(x=>{x.report.selected[0].id="ERC-721";},
   "PINNED_SOURCE_REPORT_CHANGED");
});
test("missing selected raw source bytes is not a valid proof",()=>{
 reject(x=>{delete x.files.IERC20;}, "SOURCE_FILE_SET_NOT_EXACT");
});
test("hypothesis cannot launder a runtime asset address into the witness",()=>{
 const x=original();
 x.runtimeAssetAddress="0x"+"a".repeat(40);
 x.causalProof={established:true};
 const r=assess(x);
 assert.equal(r.identifiedSourceLevelDependency.runtimeCalleeAddress,
   "UNRESOLVED_UNTIL_DEPLOYED_CONSTRUCTOR_ARG_AND_CODE_CHECK");
 assert.equal(r.identifiedSourceLevelDependency.recipientImplementationConformance,
   "NOT_ESTABLISHED");
 assert.equal(r.canAnnounceEmergence,false);
});
test("all pinned sha256s remain fully qualified digests, not guesses",()=>{
 for(const sha of Object.values(EXPECTED_SHA))
   assert.match(sha,/^[a-f0-9]{64}$/);
});
console.log("OECL_ED001_EXTERNAL_DEPENDENCY_SOURCE_ONLY_NOT_A_CAUSAL_DISCOVERY");
