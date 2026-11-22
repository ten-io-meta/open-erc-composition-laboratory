import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GitHubRepositoryLoader } from "../laboratory/github-adapter/GitHubRepositoryLoader.js";

const cwd=process.cwd(),temp=mkdtempSync(join(tmpdir(),"oecl-loader-gate-"));
const owner="fixture-owner",repo="fixture-repo";
const path=join(temp,"external","github",owner,repo);
mkdirSync(path,{recursive:true});
const git=(...args:string[])=>execFileSync("git",["-C",path,...args],{encoding:"utf8"}).trim();
async function main(){
  try {
    process.chdir(temp);
    git("init");
    git("config","user.email","ci-fixture@example.invalid");
    git("config","user.name","CI Fixture");
    writeFileSync(join(path,"README.md"),"Pinned fixture\n");
    git("add","README.md");
    git("commit","-m","pinned-fixture");
    git("remote","add","origin",`https://github.com/${owner}/${repo}.git`);
    const initial=git("rev-parse","HEAD");
    // A CI checkout can be detached while still being an immutable valid source.
    git("checkout","--detach",initial);
    const loader=new GitHubRepositoryLoader();
    const pinned=await loader.load({owner,repo,forceFresh:false});
    assert.equal(pinned.commitSha,initial);
    assert.equal(pinned.worktreeClean,true);
    assert.equal(git("rev-parse","HEAD"),initial);
    // A remote URL without .git must be equivalent.
    git("remote","set-url","origin",`https://github.com/${owner}/${repo}`);
    const withoutSuffix=await loader.load({owner,repo});
    assert.equal(withoutSuffix.commitSha,initial);
    // Remote mismatch MUST fail before any source is admitted.
    git("remote","set-url","origin","https://github.com/different/repository.git");
    await assert.rejects(()=>loader.load({owner,repo}),/EXTERNAL_SOURCE_REMOTE_MISMATCH/);
    git("remote","set-url","origin",`https://github.com/${owner}/${repo}.git`);
    // Locally edited pinned source is not admissible.
    writeFileSync(join(path,"README.md"),"uncommitted mutation\n");
    await assert.rejects(()=>loader.load({owner,repo}),/EXTERNAL_SOURCE_DIRTY/);
    console.log("PASS: detached pinned source reuse, .git origin normalization, wrong origin and dirty worktree rejection");
  }finally{
    process.chdir(cwd);
    rmSync(temp,{force:true,recursive:true});
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
