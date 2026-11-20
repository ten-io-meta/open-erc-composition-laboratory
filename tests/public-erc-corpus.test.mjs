import test from "node:test";
import assert from "node:assert/strict";
import {parseOfficialErc,normalizeErc,indexedDiscussionIds,relatePair} from "../scripts/lib/erc-corpus.mjs";
const sourceA = [
 "---","eip: 721","title: Non-Fungible Token Standard","category: ERC",
 "status: Final","requires: 165, 20",
 "discussions-to: https://ethereum-magicians.org/t/nft-standard/42",
 "---","## Abstract","ERC-721 tokens can be referenced by ERC-8004.",
 "## Motivation","The body mentions ERC-9999 only as background."
].join("\n");
const sourceB = [
 "---","eip: 20","title: Token Standard","category: ERC",
 "status: Final","---","## Abstract","Fungible token balances.","## Motivation"
].join("\n");
test("official ERC metadata retains requirements, mentions and source",()=>{
 const a=parseOfficialErc("ERCS/erc-721.md",sourceA);
 assert.equal(a.id,"ERC-721");assert.equal(a.status,"Final");
 assert.deepEqual(a.requires,["ERC-20","ERC-165"]);
 assert.ok(a.mentions.includes("ERC-8004"));
 assert.equal(a.discussionUrl,"https://ethereum-magicians.org/t/nft-standard/42");
 assert.match(a.sourceUrl,/ethereum\/ERCs/);
 assert.equal(parseOfficialErc("ERCS/erc-721.md",sourceA.replace("eip: 721","eip: 20")),null);
});
test("a documentary mention or requirement is never a validated composition",()=>{
 const a=parseOfficialErc("ERCS/erc-721.md",sourceA);
 const b=parseOfficialErc("ERCS/erc-20.md",sourceB);
 const relation=relatePair(a,b);
 assert.equal(relation.declaredDependency,true);
 assert.equal(relation.evidenceLevel,"DOCUMENTED_DEPENDENCY");
 assert.equal(relation.scientificConclusion,"NOT_EVALUATED");
 assert.deepEqual(relation.emergentProperties,[]);
});
test("ERC ID normalizing and Magicians topic extraction reject misleading names",()=>{
 assert.equal(normalizeErc(" 721 "),"ERC-721");
 assert.equal(normalizeErc("ERC-8004"),"ERC-8004");
 assert.equal(normalizeErc("ERC-0"),null);
 assert.equal(normalizeErc("https://host/erc-721"),null);
 assert.deepEqual(indexedDiscussionIds({title:"ERC-721 and ERC-8004 composition, ERC-721"}),["ERC-721","ERC-8004"]);
});
