import {
    ScientificDemoCliBundleEngine
} from "../laboratory/scientific-demo-cli/ScientificDemoCliBundleEngine.js";

const engine = new ScientificDemoCliBundleEngine();

const finalReport = {
    reportId: "REPORT-1",
    scientificPolarity: "INCONCLUSIVE",
    participantIds: ["ERC8004", "ERC8060"],
    candidates: [],
    compositions: [],
    globalRunCount: 1,
    terminalEvidenceCount: 1,
    evidenceLinkCount: 1,
    evidenceResolutionCount: 1,
    unresolvedEvidenceCount: 0,
    lineageErrorCount: 0,
    summaryAuthority: "FINAL_REPORT_PROJECTION_ONLY",
    summaryStatus: "PROJECTED"
} as any;

const dossier = {
    dossierId: "DOSSIER-1",
    candidateId: "CANDIDATE-1",
    candidateKind: "STRUCTURAL_FOUNDATION",
    sourceParticipantId: "ERC8004",
    targetParticipantId: "ERC8060",
    compatibilityPolarity: "SUPPORT",
    knownBoundaries: 37,
    observedBoundaries: 17,
    unevaluatedBoundaries: 0,
    evidenceGaps: 0,
    reasonCodes: [],
    scopedCompatibilityAvailable: true,
    protocolBoundaryTotal: 37,
    relevantBoundaries: 17,
    outOfScopeBoundaries: 20,
    unresolvedRelevance: 0,
    functionalConfigurationCount: 1,
    functionalConfigurationIds: ["CONFIG-1"],
    runtimeCandidateIds: ["RUNTIME-1"],
    summaryAuthority: "DOSSIER_PROJECTION_ONLY",
    summaryStatus: "PROJECTED"
} as any;

const explanation = {
    explanationId: "WHY-1",
    candidateId: "CANDIDATE-1",
    candidateKind: "STRUCTURAL_FOUNDATION",
    compatibilityPolarity: "SUPPORT",
    upstreamReasonCodes: [],
    observations: [],
    explanationAuthority: "UPSTREAM_DOSSIER_STATE_ONLY",
    explanationStatus: "PROJECTED"
} as any;

const valid = engine.project({
    finalReport,
    candidates: [{
        dossier,
        explanation
    }]
});

const badFinalReport = engine.project({
    finalReport: {
        ...finalReport,
        summaryAuthority: "INVALID"
    },
    candidates: []
});

const badDossier = engine.project({
    finalReport,
    candidates: [{
        dossier: {
            ...dossier,
            summaryAuthority: "INVALID"
        },
        explanation
    }]
});

const badExplanation = engine.project({
    finalReport,
    candidates: [{
        dossier,
        explanation: {
            ...explanation,
            explanationAuthority: "INVALID"
        }
    }]
});

const mismatch = engine.project({
    finalReport,
    candidates: [{
        dossier,
        explanation: {
            ...explanation,
            candidateId: "CANDIDATE-2"
        }
    }]
});

const checks = [
    [
        "VALID PROJECTED BUNDLE PASSES",
        valid.bundle !== null &&
        valid.errors.length === 0
    ],
    [
        "BUNDLE AUTHORITY PRESERVED",
        valid.bundle?.bundleAuthority ===
        "PROJECTED_SCIENTIFIC_OUTPUT_ONLY"
    ],
    [
        "INVALID FINAL REPORT FAILS CLOSED",
        badFinalReport.bundle === null &&
        badFinalReport.errors.length > 0
    ],
    [
        "INVALID DOSSIER FAILS CLOSED",
        badDossier.bundle === null &&
        badDossier.errors.length > 0
    ],
    [
        "INVALID EXPLANATION FAILS CLOSED",
        badExplanation.bundle === null &&
        badExplanation.errors.length > 0
    ],
    [
        "CANDIDATE ID MISMATCH FAILS CLOSED",
        mismatch.bundle === null &&
        mismatch.errors.length > 0
    ]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(`RESULT: ${failures === 0 ? "PASS" : "FAIL"}`);

if (failures > 0) process.exitCode = 1;
