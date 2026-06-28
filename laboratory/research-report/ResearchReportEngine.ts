export class ResearchReportEngine {
    build(knowledge: any): string {
        const benchmark = knowledge.benchmark ?? {};
        const requirements = knowledge.requirements ?? [];
        const emergentProperties = knowledge.emergentProperties ?? [];
        const patterns = knowledge.patterns ?? [];
        const relationships = knowledge.relationships ?? [];
        const matrix = knowledge.compositionMatrix ?? [];
        const intelligence = knowledge.protocolIntelligence ?? [];
        const hypotheses = knowledge.compositionHypotheses ?? [];
        const validationPlans = knowledge.hypothesisValidationPlans ?? [];
        const memory = knowledge.researchMemory ?? {};

        return [
            "# OECL V1 Research Report",
            "",
            `Generated at: ${new Date().toISOString()}`,
            "",
            "---",
            "",
            "## 1. Campaign Summary",
            "",
            `- Scenarios executed: ${benchmark.scenariosExecuted ?? 0}`,
            `- Scenarios passed: ${benchmark.scenariosPassed ?? 0}`,
            `- Scenarios failed: ${benchmark.scenariosFailed ?? 0}`,
            `- Validation rules checked: ${benchmark.validationRulesChecked ?? 0}`,
            `- Validation passed: ${benchmark.validationPassed ?? 0}`,
            `- Validation failed: ${benchmark.validationFailed ?? 0}`,
            `- Protocols used: ${benchmark.protocolsUsed ?? 0}`,
            `- Datasets generated: ${benchmark.datasetsGenerated ?? 0}`,
            `- Reports generated: ${benchmark.reportsGenerated ?? 0}`,
            "",
            "## 2. Protocols Analysed",
            "",
            ...requirements.map((protocol: any) => [
                `### ${protocol.protocolId}`,
                "",
                `- Eligibility: ${protocol.eligibility}`,
                `- Requirements passed: ${protocol.passed}/${protocol.total}`,
                `- Capabilities: ${(protocol.capabilities ?? []).join(", ")}`,
                `- Invariants: ${(protocol.invariants ?? []).join(", ")}`,
                `- Adapter available: ${protocol.adapterAvailable}`,
                ""
            ].join("\n")),
            "",
            "## 3. Emergent Properties",
            "",
            ...emergentProperties.map((property: any) => [
                `### ${property.property}`,
                "",
                `- Confidence: ${property.confidence}%`,
                `- Evidence: ${property.evidence}`,
                `- Description: ${property.description}`,
                ""
            ].join("\n")),
            "",
            "## 4. Composition Patterns",
            "",
            ...patterns.map((pattern: any) => [
                `### ${pattern.name}`,
                "",
                `- Confidence: ${pattern.confidence}%`,
                `- Evidence: ${pattern.evidence}`,
                `- Description: ${pattern.description}`,
                ""
            ].join("\n")),
            "",
            "## 5. Protocol Relationships",
            "",
            ...relationships.map((relationship: any) =>
                `- ${relationship.from} -> ${relationship.to}: ${relationship.successfulCompositions}/${relationship.occurrences} successful compositions, confidence ${relationship.confidence}%`
            ),
            "",
            "",
            "## 6. Composition Matrix Highlights",
            "",
            ...matrix.map((entry: any) =>
                `- ${entry.protocolA} + ${entry.protocolB}: compatibility ${entry.compatibility}%, safety ${entry.safetyScore}%, stability ${entry.stabilityScore}%, risk ${entry.risk}`
            ),
            "",
            "",
            "## 7. Protocol Intelligence",
            "",
            ...intelligence.map((protocol: any) => [
                `### ${protocol.protocolId}`,
                "",
                `- Observations: ${protocol.observations}`,
                `- Successful compositions: ${protocol.successfulCompositions}`,
                `- Average compatibility: ${protocol.averageCompatibility}%`,
                `- Average stability: ${protocol.averageStability}%`,
                `- Average safety: ${protocol.averageSafety}%`,
                `- Average risk: ${protocol.averageRisk}`,
                `- Eligible relationships: ${protocol.eligibleRelationships}`,
                `- Strongest partner: ${protocol.strongestPartner ?? "N/A"}`,
                `- Weakest partner: ${protocol.weakestPartner ?? "N/A"}`,
                `- Dominant risk reason: ${protocol.dominantRiskReason ?? "N/A"}`,
                "",
                "Supporting evidence:",
                "",
                ...(protocol.supportingEvidence ?? []).map(
                    (evidence: string) => `- ${evidence}`
                ),
                ""
            ].join("\n")),
            "",
            "## 8. Research Hypotheses",
            "",
            ...hypotheses.map((hypothesis: any) => [
                `### ${hypothesis.hypothesisId ?? "HYP"}: ${hypothesis.title}`,
                "",
                `- Confidence: ${hypothesis.confidence}%`,
                `- Evidence: ${hypothesis.evidence}`,
                `- Falsifiable: ${hypothesis.falsifiable}`,
                `- Validation target: ${hypothesis.validationTarget ?? "N/A"}`,
                `- Description: ${hypothesis.description}`,
                `- Recommendation: ${hypothesis.recommendation}`,
                "",
                "Supporting evidence:",
                "",
                ...(hypothesis.supportingEvidence ?? []).map(
                    (evidence: string) => `- ${evidence}`
                ),
                ""
            ].join("\n")),
            "",
            "## 9. Validation Plans",
            "",
            ...validationPlans.map((plan: any) => [
                `### ${plan.hypothesisId ?? "HYP"}: ${plan.hypothesisTitle}`,
                "",
                `- Priority: ${plan.priority}`,
                `- Validation target: ${plan.validationTarget ?? "N/A"}`,
                `- Strategy: ${plan.validationStrategy}`,
                `- Recommended scenarios: ${(plan.recommendedScenarios ?? []).join(", ")}`,
                ""
            ].join("\n")),
            "",
            "## 10. Research Memory",
            "",
            `- Total campaigns: ${memory.totalCampaigns ?? 0}`,
            `- Total scenarios: ${memory.totalScenarios ?? 0}`,
            `- Total passed: ${memory.totalPassed ?? 0}`,
            `- Total failed: ${memory.totalFailed ?? 0}`,
            `- Hypothesis coverage: ${memory.hypothesisCoverage ?? 0}`,
            "",
            "### Protocol Coverage",
            "",
            ...Object.entries(memory.protocolCoverage ?? {}).map(
                ([protocol, count]) => `- ${protocol}: ${count}`
            ),
            "",
            "## 11. Conclusions",
            "",
            "OECL V1 demonstrates that structured protocol descriptions can be transformed into reproducible research artifacts.",
            "",
            "The current pipeline is capable of executing deterministic analysis, discovering relationships, identifying emergent properties, generating hypotheses, planning validation scenarios, preserving research memory, and exporting accumulated knowledge.",
            "",
            "This report represents the final human-readable research artifact of the OECL V1 pipeline.",
            "",
            "## 12. Next Research Priorities",
            "",
            "- Expand scenario coverage for high-risk eligible compositions.",
            "- Improve explanations for risk, compatibility, safety, and stability scores.",
            "- Preserve campaign history across multiple research runs.",
            "- Prepare the Core for future protocol discovery and code intelligence in V2.",
            ""
        ].join("\n");
    }
}
