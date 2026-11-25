"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {runPinnedPair}=require("./SourceBackedHypothesisBridge.cjs");
async function main(){
 const [a,b,root,outDir]=process.argv.slice(2);
 assert(a&&b&&root&&outDir,"USAGE: <registered-erc-a> <registered-erc-b> <pinned-dependency-root> <output-dir>");
 const report=await runPinnedPair(a,b,root);
 fs.mkdirSync(outDir,{recursive:true});
 fs.writeFileSync(path.join(outDir,"source-backed-hypotheses.json"),JSON.stringify(report,null,2)+"\n");
 console.log("OECL_SOURCE_BACKED_HYPOTHESES",JSON.stringify({
   selected:report.participants.map(x=>x.id),
   hypothesisCount:report.participants.map(x=>x.hypothesisCount),
   compiler:report.compilerVersion,evmExecuted:false,
   admission:report.candidateAdmission}));
}
main().catch(e=>{console.error("OECL_GENERIC_SOURCE_BRIDGE_FAILURE:",e.stack||e);process.exitCode=1;});
