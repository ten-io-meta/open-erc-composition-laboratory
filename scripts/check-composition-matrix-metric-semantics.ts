import {
    CompositionMatrixEngine
} from "../laboratory/matrix/CompositionMatrixEngine.js";

import {
    CompositionIntelligenceEngine
} from "../laboratory/intelligence/CompositionIntelligenceEngine.js";

import {
    CompositionHypothesisEngine
} from "../laboratory/hypotheses/CompositionHypothesisEngine.js";

import {
    AdaptiveResearchPlanner
} from "../laboratory/adaptive-research/AdaptiveResearchPlanner.js";

import {
    CompositionQueryEngine
} from "../laboratory/query/CompositionQueryEngine.js";

import {
    ResearchReportEngine
} from "../laboratory/research-report/ResearchReportEngine.js";

function check(
    condition: boolean,
    label: string
): boolean {

    console.log(
        `${label}: ${condition ? "PASS" : "FAIL"}`
    );

    return condition;

}

/*
 * The relationship has one real aggregate:
 *
 * relationshipConfidence = 50
 *
 * It has NO independently measured:
 *
 * - compatibility
 * - stability
 * - safety
 * - risk
 *
 * Those unknown metrics must remain unknown through
 * matrix, intelligence, hypothesis generation,
 * adaptive planning, querying and reporting.
 */

const relationships = [
    {
        from:
            "ERC1000",

        to:
            "ERC1001",

        occurrences:
            2,

        successfulCompositions:
            1,

        confidence:
            50,

        experimentIds: [
            "EXPERIMENT-A",
            "EXPERIMENT-B"
        ]
    }
];

const requirements = [
    {
        protocolId:
            "ERC1000",

        eligibility:
            "Eligible"
    },
    {
        protocolId:
            "ERC1001",

        eligibility:
            "Eligible"
    }
];

const matrix =
    new CompositionMatrixEngine().build(
        relationships,
        requirements
    );

const row: any =
    matrix[0];

const intelligence =
    new CompositionIntelligenceEngine().analyse(
        matrix
    );

const protocol: any =
    intelligence.find(
        entry =>
            entry.protocolId === "ERC1000"
    );

const hypotheses =
    new CompositionHypothesisEngine().generate({
        compositionMatrix:
            matrix,

        protocolIntelligence:
            intelligence
    });

const adaptivePlans =
    new AdaptiveResearchPlanner().plan({
        compositionMatrix:
            matrix
    });

const riskFiltered =
    new CompositionQueryEngine().query(
        matrix,
        {
            maxRisk:
                "High"
        }
    );

const report =
    new ResearchReportEngine().build({
        requirements,
        relationships,
        compositionMatrix:
            matrix,
        protocolIntelligence:
            intelligence,
        compositionHypotheses:
            hypotheses
    });

console.log("");
console.log(
    "COMPOSITION MATRIX METRIC SEMANTICS"
);
console.log(
    "-----------------------------------"
);

const checks = [
    check(
        row?.relationshipConfidence === 50,
        "RELATIONSHIP CONFIDENCE PRESERVED"
    ),

    check(
        row?.compatibility === null,
        "RELATIONSHIP CONFIDENCE DOES NOT INVENT COMPATIBILITY"
    ),

    check(
        row?.stabilityScore === null,
        "RELATIONSHIP CONFIDENCE DOES NOT INVENT STABILITY"
    ),

    check(
        row?.safetyScore === null,
        "RELATIONSHIP CONFIDENCE DOES NOT INVENT SAFETY"
    ),

    check(
        row?.risk === "Unknown",
        "UNMEASURED METRICS PRODUCE UNKNOWN RISK"
    ),

    check(
        protocol !== undefined,
        "PROTOCOL INTELLIGENCE CREATED"
    ),

    check(
        protocol?.averageCompatibility === null,
        "UNMEASURED COMPATIBILITY DOES NOT BECOME ZERO"
    ),

    check(
        protocol?.averageStability === null,
        "UNMEASURED STABILITY DOES NOT BECOME ZERO"
    ),

    check(
        protocol?.averageSafety === null,
        "UNMEASURED SAFETY DOES NOT BECOME ZERO"
    ),

    check(
        protocol?.averageRisk === "Unknown",
        "UNMEASURED RISK REMAINS UNKNOWN"
    ),

    check(
        protocol?.strongestPartner === undefined,
        "UNMEASURED COMPATIBILITY DOES NOT INVENT STRONGEST PARTNER"
    ),

    check(
        protocol?.weakestPartner === undefined,
        "UNMEASURED COMPATIBILITY DOES NOT INVENT WEAKEST PARTNER"
    ),

    check(
        protocol?.dominantRiskReason ===
            "Risk has not been evaluated for current observations.",
        "UNMEASURED RISK DOES NOT CREATE HIGH-RISK EXPLANATION"
    ),

    check(
        hypotheses.length === 0,
        "UNMEASURED METRICS DO NOT CREATE METRIC-BASED HYPOTHESES"
    ),

    check(
        adaptivePlans.length === 0,
        "UNKNOWN RISK DOES NOT CREATE ADAPTIVE HIGH OR MEDIUM RISK PLAN"
    ),

    check(
        riskFiltered.length === 0,
        "UNKNOWN RISK DOES NOT SATISFY A MEASURED MAX-RISK QUERY"
    ),

    check(
        !report.includes(
            "compatibility null%"
        ),
        "REPORT DOES NOT PRINT NULL COMPATIBILITY PERCENTAGE"
    ),

    check(
        !report.includes(
            "safety null%"
        ),
        "REPORT DOES NOT PRINT NULL SAFETY PERCENTAGE"
    ),

    check(
        !report.includes(
            "stability null%"
        ),
        "REPORT DOES NOT PRINT NULL STABILITY PERCENTAGE"
    ),

    check(
        report.includes(
            "compatibility Not measured"
        ),
        "REPORT EXPLICITLY MARKS UNMEASURED COMPATIBILITY"
    ),

    check(
        report.includes(
            "Average compatibility: Not measured"
        ),
        "INTELLIGENCE REPORT EXPLICITLY MARKS UNKNOWN AVERAGE"
    ),

    check(
        report.includes(
            "risk Unknown"
        ),
        "REPORT PRESERVES UNKNOWN RISK"
    )
];

const pass =
    checks.every(Boolean);

console.log("");
console.log(
    `RESULT: ${pass ? "PASS" : "FAIL"}`
);

if (!pass) {
    process.exitCode = 1;
}