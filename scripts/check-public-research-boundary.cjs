"use strict";
/**
 * CI guardrail: historical public fixtures remain public, while NEW
 * accumulated research and client data must not enter the public repo.
 *
 * This is not a DLP scanner or a substitute for permissioned human review.
 * The base SHA is supplied from the pull_request event (or push.before).
 */
const assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const {posix}=require("node:path");

const RESERVED=[
 ".oecl-private/","private-research/","client-research/","research-secret/",
];
// Existing recorded scientific outputs are public, historical examples.
// Modifications/additions here are denied by default: publish new reviewed,
// anonymized case reports in a distinct intentional public fixture namespace.
const LEGACY_RESULT=/^(?:[^/]+-results|analysis-results|sources\/research)(?:\/|$)/;

function classify(path){
 const p=String(path).replace(/\\/g,"/");
 if(!p||p[0]==="/"||p===".."||p.includes("../")||p.includes("/./")||
    p.includes("\0")||posix.normalize(p)!==p)
  return {allowed:false,reason:"INVALID_GIT_PATH"};
 if(RESERVED.some(prefix=>p.startsWith(prefix)))
  return {allowed:false,reason:"PRIVATE_OR_CLIENT_MATERIAL_CANNOT_BE_COMMITTED"};
 if(LEGACY_RESULT.test(p))
  return {allowed:false,reason:"LEGACY_PUBLIC_RESEARCH_FIXTURES_ARE_FROZEN"};
 return {allowed:true,reason:"UNCLASSIFIED_REQUIRES_NORMAL_HUMAN_REVIEW"};
}
function git(...args){
 return execFileSync("git",args,{encoding:"utf8",maxBuffer:15000000});
}
function stagedNames(args){
 return git(...args).split("\0").filter(Boolean);
}
function selfTest(){
 const privateCases=[
  ".oecl-private/research-memory/knowledge.json",
  "private-research/protocol-adapters/internal.ts",
  "client-research/customer-42/dossier.json",
  "research-secret/my-private-keys.json",
 ];
 const frozenCases=[
  "research-memory-results/OECL-V2-RESEARCH-MEMORY.json",
  "research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json",
  "analysis-results/DOI-0001/research-knowledge.json",
  "scientific-memory-results/run.json",
  "knowledge-consolidation-results/example.json",
  "sources/research/CUSTOMER-PRIVATE/source.json",
 ];
 const allowedCases=[
  "laboratory/research-memory/ResearchMemoryEngine.ts",
  "scripts/run-research-memory.ts",
  "docs/RESEARCH_BOUNDARY_AUDIT.md",
  "fixtures/public-reviewed/example.json",
 ];
 for(const path of [...privateCases,...frozenCases]){
  assert(!classify(path).allowed,"UNSAFE_PATH_CLASSIFIER_ACCEPTED:"+path);
 }
 for(const path of allowedCases){
  assert(classify(path).allowed,"UNEXPECTED_PUBLIC_SOURCE_BLOCK:"+path);
 }
 console.log("OECL_PUBLIC_RESEARCH_BOUNDARY_NEGATIVE_CONTROLS_PASS",
  JSON.stringify({blockedPrivateExamples:privateCases.length,
   blockedHistoricOutputExamples:frozenCases.length,
   safePublicExamples:allowedCases.length}));
}
function audit(){
 const tracked=stagedNames(["ls-files","-z","--cached"]);
 const reserved=tracked.filter(x=>RESERVED.some(prefix=>x.startsWith(prefix)));
 assert.equal(reserved.length,0,
  "PRIVATE_DATA_ALREADY_TRACKED_IN_PUBLIC_GIT:"+reserved.slice(0,10).join(","));

 for(const folder of RESERVED){
  // A checked-in README inside these paths would defeat the guarantee.
  // check-ignore verifies the path is protected *locally* from git add.
  const probe=folder+"NEVER_TRACK_THIS.json";
  const ignored=git("check-ignore","-q",probe); // -q emits no text; exits 0
  assert.equal(ignored,"");
 }
 const base=process.env.OECL_PUBLIC_BOUNDARY_BASE;
 assert(base&&/^[a-f0-9]{40}$/i.test(base),
  "PR_OR_PUSH_BASE_SHA_REQUIRED_FOR_PRIVACY_DIFF_CHECK");
 git("rev-parse","--verify",base+"^{commit}");
 const raw=stagedNames(["diff","--name-status","--no-renames","-z",base,"HEAD"]);
 assert.equal(raw.length%2,0,"INVALID_GIT_DIFF_FORMAT");
 const checked=[];
 for(let i=0;i<raw.length;i+=2){
  const status=raw[i],path=raw[i+1];
  assert(/^[ADM]$/.test(status),"UNREVIEWED_DIFF_STATUS:"+status);
  const verdict=classify(path);
  assert(verdict.allowed,verdict.reason+":"+path);
  checked.push(path);
 }
 // Verify the original memory CLI is NOT still writing to tracked output
 // paths by default. CI separately executes it with a private root.
 const runner=git("show","HEAD:scripts/run-research-memory.ts");
 assert(runner.includes("OECL_PRIVATE_RESEARCH_ROOT"));
 assert(runner.includes(".oecl-private"));
 assert(!runner.includes('const memoryPath =\n        "./research-memory-results/'),
  "LEGACY_PUBLIC_OUTPUT_PATH_STILL_DEFAULT");
 console.log("OECL_PUBLIC_RESEARCH_BOUNDARY_PASS",JSON.stringify({
  comparedBase:base,head:git("rev-parse","HEAD").trim(),
  trackedPublicFiles:tracked.length,changedPathsReviewed:checked.length,
  newlyCommittedPrivateFiles:0,
  modificationsToHistoricResearchArtifacts:0,
  prospectiveResearchOutputSeparation:true,
  historicalPublicMITGrantsNotRevoked:true,
  humanApprovalStillRequired:true}));
}
if(require.main===module){
 try{
  selfTest();
  audit();
 }catch(e){
  console.error("OECL_PUBLIC_RESEARCH_BOUNDARY_BLOCKED",
   e instanceof Error?e.message:String(e));
  process.exitCode=1;
 }
}
module.exports={classify,selfTest};
