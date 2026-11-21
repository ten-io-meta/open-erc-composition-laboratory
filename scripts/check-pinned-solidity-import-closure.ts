import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { ScientificPinnedSolidityImportClosureEngine } from "../laboratory/scientific-solidity-inheritance/ScientificPinnedSolidityImportClosure.js";

const tmp=mkdtempSync(join(tmpdir(),"oecl-source-imports-"));
const root=join(tmp,"package");
mkdirSync(root,{recursive:true});
const put=(name:string,source:string)=>{
    const path=join(root,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,source);
};
const close=new ScientificPinnedSolidityImportClosureEngine();
const input=(imports:string[],maxFiles?:number)=>close.resolve({
    packageRoot:root,packagePrefix:"@example/solidity/",initialImports:imports,maxFiles
});
try{
    put("token/A.sol",'pragma solidity ^0.8.20;\nimport "./B.sol";\ncontract A is B {}');
    put("token/B.sol",'pragma solidity ^0.8.20;\nimport "../utils/C.sol";\ncontract B is C {}');
    put("utils/C.sol",'pragma solidity ^0.8.20;\ncontract C {}');
    let result=input(["@example/solidity/token/A.sol"]);
    assert.equal(result.status,"RESOLVED");
    assert.deepEqual(result.files.map(x=>x.filePath),["token/A.sol","token/B.sol","utils/C.sol"]);
    assert.ok(result.files.every(x=>/^[a-f0-9]{64}$/.test(x.sourceSha256)));
    assert.deepEqual(result, input(["@example/solidity/token/A.sol"]));
    // A local cycle must terminate rather than duplicating sources.
    put("utils/C.sol",'pragma solidity ^0.8.20;\nimport "../token/A.sol";\ncontract C {}');
    result=input(["@example/solidity/token/A.sol"]);
    assert.equal(result.status,"RESOLVED");
    assert.equal(result.files.length,3);
    // A package may not silently import missing dependencies.
    put("token/B.sol",'pragma solidity ^0.8.20;\nimport "../missing/D.sol";\ncontract B {}');
    result=input(["@example/solidity/token/A.sol"]);
    assert.equal(result.status,"INCOMPLETE");
    assert.ok(result.unresolved.some(x=>x.includes("MISSING_OR_OUTSIDE_PACKAGE")));
    // The user may not trick the resolver into reading arbitrary absolute paths.
    assert.equal(input(["@example/solidity/../../private.sol"]).status,"INCOMPLETE");
    assert.equal(input(["./../../../private.sol"]).status,"INCOMPLETE");
    assert.equal(input(["https://example.com/Remote.sol"]).status,"INCOMPLETE");
    assert.equal(input(["@example/solidity/token/A.sol"],1).status,"INCOMPLETE");
    // File symlinks must not escape the physically installed pinned package.
    writeFileSync(join(tmp,"private.sol"),"contract Private {}");
    symlinkSync(join(tmp,"private.sol"),join(root,"outside.sol"));
    assert.equal(input(["@example/solidity/outside.sol"]).status,"INCOMPLETE");
    // Syntax outside actual Solidity import statements must not be accepted.
    put("notes.sol", `pragma solidity ^0.8.20;
// import "./missing.sol";
string constant example = "import './missing.sol';";`);
    assert.equal(input(["@example/solidity/notes.sol"]).status,"RESOLVED");
    console.log("PASS: full pinned Solidity import closure and adversarial path, cycle, missing dependency checks");
}finally{rmSync(tmp,{recursive:true,force:true});}
