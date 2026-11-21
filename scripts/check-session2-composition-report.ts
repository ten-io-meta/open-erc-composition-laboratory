import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = process.argv[2];
if (!path) throw new Error("Usage: npx tsx scripts/check-session2-composition-report.ts report.json");
const report = JSON.parse(await readFile(path, "utf8"));

assert.equal(report.schemaVersion, "OECL_COMPOSITION_RESEARCH_DOSSIER_V1");
assert.deepEqual(report.requestedErcIds, ["ERC-8004", "ERC-8060"]);
assert.equal(report.decisionAuthority, "UPSTREAM_EVIDENCE_ONLY");
assert.equal(report.researchMode, "PINNED_GITHUB_SOURCE_DISCOVERY_ONLY");
assert.equal(report.compatibility.status, "NOT_EVALUATED");
assert.equal(report.compositionProperties.status, "NOT_EVALUATED");
assert.equal(report.risksAndBoundaries.status, "NOT_EVALUATED");
assert.equal(report.configurations.status, "NOT_EVALUATED");
assert.equal(report.evidence.globalObservationCount, 0);
assert.equal(report.evidence.globalExecutionStatus, "NOT_PERFORMED");
assert.equal(report.evidence.scientificDecisionTraceStatus, "NOT_COMPUTED_IN_SOURCE_ONLY_MODE");
assert.equal(report.sourceProvenance.length, 2);
assert.ok(report.sourceProvenance.every((source: any) =>
    /^[a-f0-9]{40}$/.test(source.expectedRevision) &&
    source.expectedRevision === source.observedRevision
));
assert.ok(report.participantContributions.some((p: any) => p.protocolId === "ERC-8004"));
assert.ok(report.participantContributions.some((p: any) => p.protocolId === "ERC-8060"));
assert.ok(Array.isArray(report.compatibility.candidateSet));
assert.ok(Array.isArray(report.compatibility.documentaryCandidates));
assert.ok(Array.isArray(report.compatibility.functionalMatches));
assert.ok(Array.isArray(report.risksAndBoundaries.knownProtocolBoundaries));
assert.ok(Array.isArray(report.evidence.sourceObservations));
assert.ok(report.evidence.sourceObservations.length > 0);
assert.ok(Array.isArray(report.evidence.sourceFacts));
assert.ok(report.evidence.sourceFacts.length > 0);

assert.equal(report.compositionProperties.verifiedEmergentProperties.length, 0);
assert.equal(report.configurations.globallySupportedSubsets.length, 0);
assert.equal(report.compatibility.globalHarmony.length, 0);

console.log("SESSION2 PINNED SOURCE DOSSIER: PASS");
console.log("Requested:", report.requestedErcIds.join(", "));
console.log("Evaluated:", report.evaluatedErcIds.join(", "));
console.log("Source revisions:", report.sourceProvenance.length);
console.log("Candidate proposals:", report.compatibility.candidateSet.length);
console.log("Known protocol boundaries:", report.risksAndBoundaries.knownProtocolBoundaries.length);
console.log("Source observations:", report.evidence.sourceObservations.length);
console.log("Scientific status: NOT EVALUATED — no invented compatibility or emergent-property claims");