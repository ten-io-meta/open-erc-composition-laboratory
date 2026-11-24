import assert from "node:assert/strict";
import {parseGitTree,parseOfficialTitles,buildErcCatalog,catalogSnapshotHash} from "../src/server/oeclErcCatalog.ts";

const ids=Array.from({length:96},(_,i)=>i+20);
const tree={sha:"a".repeat(40),truncated:false,tree:ids.map(n=>({
  path:"ERCS/erc-"+n+".md",type:"blob",sha:"f".repeat(40)
})).concat([
  {path:"EIPS/eip-1.md",type:"blob"},
  {path:"ERCS/erc-12.md",type:"tree"},
  {path:"ERCS/erc-00009.md",type:"blob"},
  {path:"ERCS/erc-8004.MD",type:"blob"},
])};
assert.throws(()=>parseGitTree({...tree,truncated:true}),/INCOMPLETE_CATALOG_TREE/);
assert.throws(()=>parseGitTree({...tree,sha:"bad"}),/INCOMPLETE_CATALOG_TREE/);
assert.throws(()=>parseGitTree({...tree,tree:[]}),/CATALOG_COVERAGE_UNVERIFIED/);
assert.equal(parseGitTree(tree).ids.length,96);
assert.equal(parseGitTree(tree).ids[0],"ERC-20");
assert.equal(parseGitTree(tree).ids.at(-1),"ERC-115");
assert.equal(parseGitTree(tree).ids.includes("ERC-12"),false);
const titles=parseOfficialTitles("<table><tr><td><a href='/ERCS/erc-20'>20</a></td><td><a>Token Standard</a></td></tr>"+
  "<tr><td>ERC-721</td><td>Non-Fungible Token Standard</td></tr>"+
  "<tr><td>foo</td><td>irrelevant</td></tr></table>");
assert.equal(titles.get("ERC-20"),"Token Standard");
assert.equal(titles.get("ERC-721"),"Non-Fungible Token Standard");
assert.equal(titles.has("ERC-foo"),false);

const requests=[];
const fake=async(url,init)=>{
  requests.push({url,init});
  assert.ok(["https://api.github.com/repos/ethereum/ERCs/git/trees/master?recursive=1",
    "https://ercs.ethereum.org/erc"].includes(url));
  assert.equal(init.redirect,"error");
  return url.includes("api.github.com")?
    new Response(JSON.stringify(tree),{status:200,headers:{"content-type":"application/json"}}):
    new Response("<table><tr><td>20</td><td>Token Standard</td></tr></table>",{status:200});
};
const result=await buildErcCatalog(fake);
assert.equal(result.status,"COMPLETE_OFFICIAL_INDEX");
assert.equal(result.officialCount,96);
assert.equal(result.entries.find(x=>x.id==="ERC-20").title,"Token Standard");
assert.equal(result.entries.find(x=>x.id==="ERC-20").sourceProfile,true);
assert.equal(result.entries.find(x=>x.id==="ERC-8060").origin,"OECL_SOURCE_ONLY");
assert.equal(result.entries.find(x=>x.id==="ERC-8098").sourceProfile,true);
assert.ok(result.localOnlyCount>=2);
assert.match(catalogSnapshotHash(result),/^[0-9a-f]{64}$/);
assert.equal(requests.length,2);
console.log("OECL_ERC_CATALOG_COMPLETE_AND_SOURCE_MERGE_PASS");

const incomplete=await buildErcCatalog(async()=>{throw Error("Network down");});
assert.equal(incomplete.status,"PARTIAL_LOCAL_INDEX");
assert.equal(incomplete.officialCount,0);
assert.ok(incomplete.entries.some(x=>x.id==="ERC-8060"));
assert.ok(incomplete.message.includes("Official ERC index temporarily unavailable"));
const invalid=await buildErcCatalog(async url=>
  url.includes("api.github.com")?new Response(JSON.stringify({...tree,truncated:true}),{status:200}):
    new Response("<table></table>",{status:200}));
assert.equal(invalid.status,"PARTIAL_LOCAL_INDEX");
const tooLarge=await buildErcCatalog(async()=>new Response("x".repeat(5_000_010),{status:200}));
assert.equal(tooLarge.status,"PARTIAL_LOCAL_INDEX");
console.log("OECL_ERC_CATALOG_FAIL_CLOSED_PASS");
