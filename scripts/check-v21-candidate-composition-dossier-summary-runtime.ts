import {
    ScientificCandidateCompositionDossierSummaryEngine
} from "../laboratory/scientific-candidate-composition-dossier/ScientificCandidateCompositionDossierSummaryEngine.js";

const dossier = {
    dossierId: "DOSSIER-A",
    candidateId: "CANDIDATE-A",

    candidateTrace: {
        candidateId: "CANDIDATE-A",
        candidateKind: "STRUCTURAL_FOUNDATION",
        sourceParticipantId: "ERC8004",
        targetParticipantId: "ERC8060",
        compatibilityPolarity: "SUPPORT",
        knownBoundaryIds: Array(37).fill("B"),
        observedBoundaryIds: Array(17).fill("O"),
        unevaluatedBoundaryIds: [],
        gapIds: [],
        reasonCodes: [
            "KNOWN_BOUNDARY_PRESERVATION_SUPPORTED"
        ]
    },

    scopedCompatibility: {
        candidateId: "CANDIDATE-A",
        relevanceStatistics: {
            protocolBoundaryTotal: 37,
            relevant: 17,
            outOfScope: 20,
            unresolved: 0
        }
    },

    functionalConfigurations: [
        {
            configurationId: "CONFIG-1",
            candidateId: "CANDIDATE-A",
            runtimeCandidateId: "RUNTIME-A"
        },
        {
            configurationId: "CONFIG-2",
            candidateId: "CANDIDATE-A",
            runtimeCandidateId: "RUNTIME-A"
        }
    ],

    dossierAuthority: "UPSTREAM_CANDIDATE_STATE_ONLY",
    dossierStatus: "PROJECTED"
} as any;

const summary =
    new ScientificCandidateCompositionDossierSummaryEngine()
        .project(dossier);

const checks = [
    [
        "STRUCTURAL KIND PRESERVED",
        summary.candidateKind === "STRUCTURAL_FOUNDATION"
    ],
    [
        "COMPATIBILITY POLARITY PRESERVED",
        summary.compatibilityPolarity === "SUPPORT"
    ],
    [
        "BOUNDARY COUNTS PRESERVED",
        summary.knownBoundaries === 37 &&
        summary.observedBoundaries === 17 &&
        summary.unevaluatedBoundaries === 0
    ],
    [
        "RELEVANCE COUNTS PRESERVED",
        summary.protocolBoundaryTotal === 37 &&
        summary.relevantBoundaries === 17 &&
        summary.outOfScopeBoundaries === 20 &&
        summary.unresolvedRelevance === 0
    ],
    [
        "FUNCTIONAL CONFIGURATIONS PRESERVED",
        summary.functionalConfigurationCount === 2 &&
        summary.functionalConfigurationIds.length === 2
    ],
    [
        "RUNTIME IDS DEDUPLICATED",
        summary.runtimeCandidateIds.length === 1 &&
        summary.runtimeCandidateIds[0] === "RUNTIME-A"
    ],
    [
        "SUMMARY REMAINS PROJECTION ONLY",
        summary.summaryAuthority === "DOSSIER_PROJECTION_ONLY" &&
        summary.summaryStatus === "PROJECTED"
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
