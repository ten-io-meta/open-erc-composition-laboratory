import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const path = process.argv[2];
if (!path) throw new Error("Usage: npx tsx scripts/check-session2-composition-report.ts report.json");
const report = JSON.parse(await readFile(path, "utf8"));

assert.equal(report.schemaVersion, "OECL_COMPOSITION_RESEARCH_DOSSIER_V1");
assert.deepEqual(report.requestedErcIds, ["ERC-8004", "ERC-8060"]);
assert.equal(report.decisionAuthority, "UPSTREAM_SCIENTIFIC_ENGINES_ONLY");
assert.equal(report.researchMode, "PINNED_GITHUB_SCIENTIFIC_COMPOSITION_NO_GLOBAL_EXPERIMENT");
assert.equal(report.compatibility.assessmentScope, "CANDIDATE_BOUNDARIES_AND_GLOBAL_HARMONY");
assert.equal(report.evidence.globalObservationCount, 0);
assert.equal(report.evidence.globalExecutionStatus, "NOT_PERFORMED_IN_DOSSIER_MODE");
assert.equal(report.scientificFinalReportStatus, "NOT_GENERATED_NO_JOINT_COMPOSITION_EXECUTION");
assert.equal(report.sourceProvenance.length, 2);
assert.ok(report.sourceProvenance.every((s: any) =>
    /^[0-9a-f]{40}$/.test(s.expectedRevision) &&
    s.expectedRevision === s.observedRevision
));
assert.ok(report.participantContributions.some((p: any) => p.protocolId === "ERC-8004"));
assert.ok(report.participantContributions.some((p: any) => p.protocolId === "ERC-8060"));
assert.equal(report.structuralDiscovery.normalizedCandidates.length, 1);
const structural = report.structuralDiscovery.normalizedCandidates[0];
assert.deepEqual(
    [structural.participantAId, structural.participantBId],
    ["ERC-8004", "ERC-8060"]
);
assert.equal(structural.foundationProtocolId, "ERC-721");
assert.equal(structural.mechanism, "SHARED_PROTOCOL_FOUNDATION");
assert.equal(structural.evaluationStatus, "UNEVALUATED");
assert.ok(structural.provenance.length >= 2);
assert.ok(
    structural.provenance.every((p: any) =>
        report.sourceProvenance.some((source: any) =>
            source.sourceId === p.sourceId &&
            source.observedRevision === p.sourceRevision
        )
    ),
    "Every structural relation must be traceable to pinned source revisions"
);

assert.ok(Array.isArray(report.compatibility.candidateEvaluations));
assert.ok(Array.isArray(report.compatibility.globalHarmony));
assert.equal(report.compatibility.candidateEvaluations.length, 1);
const evaluation = report.compatibility.candidateEvaluations[0];
assert.equal(evaluation.kind, "STRUCTURAL_FOUNDATION");
assert.equal(evaluation.compatibilityPolarity, "INCONCLUSIVE");
assert.equal(evaluation.compatibilityEvidenceIds.length, 0);
assert.ok(evaluation.discoveryEvidenceIds.length > 0);
assert.equal(report.compositionProperties.valueAssessments.length, 1);
assert.equal(
    report.compositionProperties.valueAssessments[0].valueEvaluationStatus,
    "NOT_ESTABLISHED"
);
assert.equal(report.configurations.solutions.length, 1);


assert.ok(Array.isArray(report.compositionProperties.valueAssessments));
assert.ok(Array.isArray(report.risksAndBoundaries.regions));
assert.ok(Array.isArray(report.risksAndBoundaries.gaps));
assert.ok(Array.isArray(report.configurations.solutions));
assert.ok(Array.isArray(report.evidence.decisionTrace.evidenceCatalog));
assert.ok(Array.isArray(report.evidence.lineage.resolutions));
assert.ok(report.evidence.provenanceCatalog.length > 0, "No source provenance");

assert.equal(
    report.compositionProperties.verifiedEmergentProperties.length,
    0,
    "A verified emergent property requires jointly executed independent evidence"
);
assert.equal(
    report.configurations.globallySupportedSubsets.length,
    0,
    "Cannot claim globally supported subset with zero global observations"
);
assert.ok(
    report.compatibility.globalHarmony.every((a: any) => a.harmonyStatus === "INCONCLUSIVE"),
    "Harmony must not claim global SUPPORT with zero global observations"
);

console.log("SESSION2 REAL COMPOSITION DOSSIER: PASS");
console.log("Requested:", report.requestedErcIds.join(", "));
console.log("Evaluated:", report.evaluatedErcIds.join(", "));
console.log("Pinned source revisions:", report.sourceProvenance.length);
console.log("Candidate evaluations:", report.compatibility.candidateEvaluations.length);
console.log("Harmony:", report.compatibility.globalHarmony.map((a: any) => a.harmonyStatus).join(", ") || "none");
console.log("Provenance evidence:", report.evidence.provenanceCatalog.length);
console.log("Scientific status: no unproven compatibility or emergent-property claims");