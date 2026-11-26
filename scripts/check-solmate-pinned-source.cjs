"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {verifiedSolmateUnits,SOLMATE_BLOBS,gitBlobSha,SOLMATE_COMMIT}=
 require("../laboratory/scientific-open-source-worker/SolmateCrossVaultProtocol.cjs");
const root=process.argv[2];
assert(root,"USAGE: <pinned-solmate-checkout-root>");
const verified=verifiedSolmateUnits(root);
assert.equal(verified.commit,SOLMATE_COMMIT);
assert.equal(Object.keys(verified.sources).length,4);
for(const [file,blob] of Object.entries(SOLMATE_BLOBS)){
 const bytes=fs.readFileSync(path.join(root,file));
 assert.equal(gitBlobSha(bytes),blob,"GIT_BLOB_MISMATCH");
 assert(verified.sha256ByFile[file]?.length===64);
}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"oecl-solmate-integrity-"));
try{
 for(const file of Object.keys(SOLMATE_BLOBS)){
  const target=path.join(temp,file);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(path.join(root,file),target);
 }
 const changed=path.join(temp,"src/tokens/ERC4626.sol");
 fs.appendFileSync(changed,"\n// SOURCE_TAMPERING_SHOULD_FAIL\n");
 assert.throws(()=>verifiedSolmateUnits(temp),/SOLMATE_REVIEWED_GIT_BLOB_MISMATCH/);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log("OECL_SOLMATE_PINNED_SOURCE_INTEGRITY_PASS",JSON.stringify({
 commit:SOLMATE_COMMIT,checkedGitBlobs:Object.keys(SOLMATE_BLOBS).length,
 tamperedSolmateSourceRejected:true,licensedSourceVendoredIntoOECL:false
}));
