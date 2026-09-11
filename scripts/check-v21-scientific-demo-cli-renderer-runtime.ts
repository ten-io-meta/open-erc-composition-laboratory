import {
    ScientificDemoCliRenderer
} from "../laboratory/scientific-demo-cli/ScientificDemoCliRenderer.js";

const bundle = {
    finalReport: {
        reportId: "REPORT-DEMO",
        scientificPolarity: "INCONCLUSIVE",
        participantIds: ["ERC8004", "ERC8060"],
        candidates: [],
        compositions: [],
        globalRunCount: 1,
        terminalEvidenceCount: 10,
        evidenceLinkCount: 8,
        evidenceResolutionCount: 8,
        unresolvedEvidenceCount: 0,
        lineageErrorCount: 0,
        summaryAuthority: "FINAL_REPORT_PROJECTION_ONLY",
        summaryStatus: "PROJECTED"
    },

    candidates: [{
        dossier: {
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
            runtimeCandidateIds: ["RUNTIME-1"],
            summaryAuthority: "DOSSIER_PROJECTION_ONLY",
            summaryStatus: "PROJECTED"
        },

        explanation: {
            explanationId: "WHY-1",
            candidateId: "CANDIDATE-1",
            candidateKind: "STRUCTURAL_FOUNDATION",
            compatibilityPolarity: "SUPPORT",
            upstreamReasonCodes: [
                "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
            ],
            observations: [
                "FUNCTIONAL_CONFIGURATION_EVIDENCED"
            ],
            explanationAuthority:
                "UPSTREAM_DOSSIER_STATE_ONLY",
            explanationStatus:
                "PROJECTED"
        }
    }],

    bundleAuthority:
        "PROJECTED_SCIENTIFIC_OUTPUT_ONLY"
} as any;

const rendered =
    new ScientificDemoCliRenderer()
        .render(bundle);

const parsed =
    JSON.parse(rendered.json);

const checks = [
    [
        "GLOBAL INCONCLUSIVE PRESERVED",
        rendered.text.includes(
            "Scientific polarity: INCONCLUSIVE"
        )
    ],
    [
        "CANDIDATE SUPPORT PRESERVED",
        rendered.text.includes(
            "Compatibility: SUPPORT"
        )
    ],
    [
        "STRUCTURAL KIND PRESERVED",
        rendered.text.includes(
            "Kind: STRUCTURAL_FOUNDATION"
        )
    ],
    [
        "WHY EXPLANATION INCLUDED",
        rendered.text.includes(
            "Observed evidence preserved the evaluated known boundaries."
        )
    ],
    [
        "JSON PRESERVES LEVELS",
        parsed.finalReport.scientificPolarity === "INCONCLUSIVE" &&
        parsed.candidates[0].dossier.compatibilityPolarity === "SUPPORT"
    ],
    [
        "CLI RENDERER REMAINS PROJECTION ONLY",
        rendered.renderAuthority ===
            "PROJECTED_CLI_BUNDLE_ONLY"
    ]
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
