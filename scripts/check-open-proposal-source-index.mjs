import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
const data=JSON.parse(readFileSync("web/src/data/openErcProposalIndex.json","utf8"));
assert.equal(data.schemaVersion,"OECL_OPEN_ERC_PROPOSAL_INDEX_V1");
assert.equal(data.source,"ethereum/ERCs");
assert.ok(data.scannedOpenPullRequests>=200,"Open PR scan must not be silently truncated");
assert.equal(data.proposals.length,data.examinedDocumentProposals);
assert.ok(data.proposals.length>=200,"Too few attributed proposal sources");
assert.ok(data.proposals.some(x=>x.id==="ERC-8060"),"Missing exact ERC-8060 open proposal");
const knownBad=new Set(data.errors.map(x=>x.pr+"/"+x.erc));
assert.ok(data.errors.length<=15,"Too many inconsistent upstream sources");
for(const p of data.proposals) {
 assert.match(p.id,/^ERC-[1-9]\d{0,6}$/);
 assert.equal(p.status,"OPEN_PROPOSAL_PR");
 assert.equal(p.evidenceLevel,"UNMERGED_GITHUB_PROPOSAL_SOURCE_ONLY");
 assert.match(p.sourceRevision,/^[a-f0-9]{40}$/);
 assert.match(p.githubPRUrl,new RegExp("^https://github.com/ethereum/ERCs/pull/"+p.prNumber+"$"));
 assert.ok(typeof p.submittedBy==="string"&&p.submittedBy.length>0);
 assert.ok(typeof p.openedAt==="string"&&Number.isFinite(Date.parse(p.openedAt)));
 assert.ok(!knownBad.has(p.prNumber+"/"+Number(p.id.slice(4))),"Conflicting ERC source silently admitted");
}
console.log("OECL_OPEN_PROPOSAL_CORPUS_VALID "+JSON.stringify({
 pullRequests:data.scannedOpenPullRequests,
 proposals:data.proposals.length,
 sourcesWithIssues:data.errors.length,
 coverage:data.coverage,
 approvedStandards:0
}));
