import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  normalizeErcNumber, parseOfficialErc, deriveRelation,
  readOfficialErc, investigateErcSpecifications,
} from "../src/server/oeclErcDocumentaryDiscovery.ts";

const makeDoc=(num,opts={})=>[
  "---",
  "eip: "+num,
  "title: "+(opts.title||"Test ERC "+num),
  "description: "+(opts.description||"Example public standard"),
  "status: "+(opts.status||"Final"),
  "type: Standards Track",
  "category: "+(opts.category||"ERC"),
  ...(opts.requires?["requires: "+opts.requires]:[]),
  "---",
  "## Abstract",
  "This standard defines the documented API for ERC-"+num+".",
  "",
  "## Specification",
  ...(opts.nestedToken?["## Token"]:[]),
  "### Methods",
  "#### "+(opts.method||"balanceOf"),
  "MUST verify the caller and permitted token accounting before execution.",
  "",
].join("\n")+"\n";
const docs=new Map([
  ["4626",makeDoc("4626",{title:"Tokenized Vaults",requires:"20, 2612",method:"deposit"})],
  ["20",makeDoc("20",{title:"Token Standard",method:"transfer",nestedToken:true})],
  ["2612",makeDoc("2612",{title:"Permit Extension",requires:"20",method:"permit"})],
  ["7575",makeDoc("7575",{title:"Multi-Asset Tokenized Vaults",requires:"20, 4626",method:"withdraw"})],
  ["721",makeDoc("721",{title:"Non-Fungible Token Standard",method:"ownerOf"})],
]);
const calls=[];
const mock=async (url,opts)=>{
  calls.push({url,opts});
  assert.match(url,/^https:\/\/raw\.githubusercontent\.com\/ethereum\/ERCs\/master\/ERCS\/erc-[1-9][0-9]{0,7}\.md$/);
  assert.equal(opts.method,"GET");
  assert.equal(opts.redirect,"error");
  assert.equal(opts.cache,"no-store");
  const match=url.match(/erc-([0-9]+)\.md$/);
  const text=docs.get(match[1]);
  return text ? new Response(text,{status:200}) : new Response("missing",{status:404});
};

assert.equal(normalizeErcNumber("4626"),"ERC-4626");
assert.equal(normalizeErcNumber("erc 4626"),"ERC-4626");
assert.equal(normalizeErcNumber("ERC-20"),"ERC-20");
for(const invalid of ["", "ERC-0","ERC-00020","ERC-123456789","https://foo", "../etc/passwd", "ERC-20?url=http://x", "ERC-20-BURNABLE"]){
  assert.equal(normalizeErcNumber(invalid),null,"Must reject unsupported numeric ERC id: "+invalid);
}
assert.equal(parseOfficialErc("ERC-20",makeDoc("721")),null);
assert.equal(parseOfficialErc("ERC-20",makeDoc("20",{category:"Core"})),null);
assert.equal(parseOfficialErc("ERC-20",makeDoc("20",{status:"Moved"})),null);
assert.equal(parseOfficialErc("ERC-20","not an ERC document"),null);

const pair=await investigateErcSpecifications("ERC-4626","ERC-20",mock);
assert.equal(pair.status,"DOCUMENTARY_COMPARISON");
assert.equal(pair.scientificVerdict,"NOT_EVALUATED");
assert.equal(pair.candidateAdmission,"NOT_ADMITTED");
assert.equal(pair.evmExecuted,false);
assert.equal(pair.implementationVerified,false);
assert.equal(pair.relation.kind,"DECLARED_DEPENDENCY");
assert.match(pair.relation.statements[0],/ERC-4626 explicitly lists ERC-20/);
assert.equal(pair.standards[0].title,"Tokenized Vaults");
assert.deepEqual(pair.standards[1].interfaceNames,["transfer"],"ERC-20 nested Token specification must retain methods");
assert.deepEqual(pair.standards[0].requires,["ERC-20","ERC-2612"]);
assert.deepEqual(pair.standards[0].interfaceNames,["deposit"]);
assert.equal(pair.standards[0].provenance.sha256,
  createHash("sha256").update(docs.get("4626")).digest("hex"));
assert.match(pair.standards[0].provenance.sourceUrl,/ethereum\/ERCs/);
console.log("OECL_DOCUMENTARY_DIRECT_DEPENDENCY_PASS");

const reverse=await investigateErcSpecifications("ERC-20","ERC-4626",mock);
assert.equal(reverse.relation.kind,"DECLARED_DEPENDENCY");
assert.match(reverse.relation.statements[0],/ERC-4626 explicitly lists ERC-20/);
const shared=deriveRelation(
  parseOfficialErc("ERC-4626",docs.get("4626")),
  parseOfficialErc("ERC-7575",makeDoc("7575",{requires:"20, 2612"})));
assert.equal(shared.kind,"SHARED_DEPENDENCY");
assert.deepEqual(shared.sharedPrerequisites,["ERC-20","ERC-2612"]);
const unrelated=await investigateErcSpecifications("ERC-20","ERC-721",mock);
assert.equal(unrelated.relation.kind,"NO_DECLARED_DEPENDENCY");
assert.equal(unrelated.evmExecuted,false);
console.log("OECL_DOCUMENTARY_SHARED_AND_UNRELATED_PASS");

const missing=await investigateErcSpecifications("ERC-20","ERC-9999",mock);
assert.equal(missing.standards[1].availability,"NOT_IN_OFFICIAL_REGISTRY");
assert.equal(missing.relation.kind,"INCOMPLETE_SPECIFICATIONS");
assert.ok(missing.relation.statements[0].includes("No relationship"));
const offline=await readOfficialErc("ERC-20",async()=>{throw Error("offline");});
assert.equal(offline.availability,"SOURCE_UNAVAILABLE");
const oversized=await readOfficialErc("ERC-20",async()=>new Response("x".repeat(400001)));
assert.equal(oversized.availability,"SOURCE_UNAVAILABLE");
await assert.rejects(investigateErcSpecifications("ERC-0","ERC-20",mock),/INVALID_ERC_PAIR/);
await assert.rejects(investigateErcSpecifications("ERC-20","ERC-20",mock),/INVALID_ERC_PAIR/);
assert.ok(calls.every(x=>!x.url.includes("?")));
console.log("OECL_DOCUMENTARY_FAIL_CLOSED_AND_BOUNDARY_PASS");
console.log("OECL_DOCUMENTARY_ALL_TESTS_PASS");
