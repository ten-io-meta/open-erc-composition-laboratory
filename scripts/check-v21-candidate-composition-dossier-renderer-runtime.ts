import {
    ScientificCandidateCompositionDossierRenderer
} from "../laboratory/scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierRenderer.js";

import type {
    ScientificCandidateCompositionDossierSummary
} from "../laboratory/scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierSummary.js";

const summary: ScientificCandidateCompositionDossierSummary = {
    dossierId: "DOSSIER-A",
    candidateId: "CANDIDATE-A",
    candidateKind: "STRUCTURAL_FOUNDATION",
    sourceParticipantId: "ERC8004",
    targetParticipantId: "ERC8060",
    compatibilityPolarity: "SUPPORT",

    knownBoundaries: 37,
    observedBoundaries: 17,
    unevaluatedBoundaries: 0,
    evidenceGaps: 0,

    reasonCodes: [
        "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
    ],

    scopedCompatibilityAvailable: true,
    protocolBoundaryTotal: 37,
    relevantBoundaries: 17,
    outOfScopeBoundaries: 20,
    unresolvedRelevance: 0,

    functionalConfigurationCount: 1,
    functionalConfigurationIds: ["CONFIG-1"],
    runtimeCandidateIds: ["RUNTIME-A"],

    summaryAuthority: "DOSSIER_PROJECTION_ONLY",
    summaryStatus: "PROJECTED"
};

const rendered =
    new ScientificCandidateCompositionDossierRenderer()
        .render(summary);

const parsed = JSON.parse(rendered.json);

const checks = [
    ["KIND PRESERVED",
        rendered.text.includes("Kind: STRUCTURAL_FOUNDATION")],

    ["COMPATIBILITY PRESERVED",
        rendered.text.includes("Compatibility: SUPPORT")],

    ["RELEVANCE PRESERVED",
        rendered.text.includes("relevant: 17") &&
        rendered.text.includes("out of scope: 20")],

    ["FUNCTIONAL EVIDENCE PRESERVED",
        rendered.text.includes("configurations: 1") &&
        rendered.text.includes("CONFIG-1")],

    ["JSON PRESERVES CANDIDATE",
        parsed.candidateId === "CANDIDATE-A" &&
        parsed.candidateKind === "STRUCTURAL_FOUNDATION"],

    ["RENDERER REMAINS PROJECTION ONLY",
        rendered.renderAuthority ===
        "DOSSIER_SUMMARY_PROJECTION_ONLY"]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(`RESULT: ${failures === 0 ? "PASS" : "FAIL"}`);

if (failures > 0) {
    process.exitCode = 1;
}
