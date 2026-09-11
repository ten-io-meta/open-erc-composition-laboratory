import {
    ScientificFinalReportRenderer
} from "../laboratory/scientific-final-report/ScientificFinalReportRenderer.js";

import type {
    ScientificFinalReportSummary
} from "../laboratory/scientific-final-report/ScientificFinalReportSummary.js";

const summary: ScientificFinalReportSummary = {
    reportId: "REPORT-RENDER-TEST",
    scientificPolarity: "INCONCLUSIVE",
    participantIds: ["ERC8004", "ERC8060"],

    candidates: [{
        candidateId: "CANDIDATE-1",
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
        ]
    }],

    compositions: [],
    globalRunCount: 1,
    terminalEvidenceCount: 10,
    evidenceLinkCount: 8,
    evidenceResolutionCount: 8,
    unresolvedEvidenceCount: 0,
    lineageErrorCount: 0,
    summaryAuthority: "FINAL_REPORT_PROJECTION_ONLY",
    summaryStatus: "PROJECTED"
};

const rendered =
    new ScientificFinalReportRenderer()
        .render(summary);

const parsed =
    JSON.parse(rendered.json);

const checks = [
    [
        "GLOBAL POLARITY PRESERVED",
        rendered.text.includes(
            "Scientific polarity: INCONCLUSIVE"
        )
    ],
    [
        "CANDIDATE SUPPORT PRESERVED",
        rendered.text.includes(
            "compatibility=SUPPORT"
        )
    ],
    [
        "REASON PRESERVED",
        rendered.text.includes(
            "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
        )
    ],
    [
        "COUNTS PRESERVED",
        rendered.text.includes(
            "boundaries known=37 observed=17 unevaluated=0 gaps=0"
        )
    ],
    [
        "JSON PRESERVES POLARITY",
        parsed.scientificPolarity === "INCONCLUSIVE"
    ],
    [
        "RENDERER REMAINS PROJECTION ONLY",
        rendered.renderAuthority ===
            "SUMMARY_PROJECTION_ONLY"
    ]
] as const;

let failures = 0;

for (const [name, ok] of checks) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
    if (!ok) failures++;
}

console.log(
    `RESULT: ${failures === 0 ? "PASS" : "FAIL"}`
);

if (failures > 0) {
    process.exitCode = 1;
}
