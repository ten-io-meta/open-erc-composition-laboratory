import type { ResearchReportResult } from "./ResearchReportResult.js";

export class ResearchReportV2Engine {

    build(
        knowledge: any,
        patterns: any,
        conclusions: any,
        evolution: any,
        memory: any
    ): ResearchReportResult {

        const entries = knowledge.entries ?? [];
        const patternList = patterns.patterns ?? [];
        const conclusionList = conclusions.conclusions ?? [];
        const evolutionList = evolution.evolutions ?? [];
        const memoryEvents = memory.events ?? [];

        const supportedKnowledge =
            entries.filter((entry: any) => entry.status === "SUPPORTED").length;

        const emergingKnowledge =
            entries.filter((entry: any) => entry.status !== "SUPPORTED").length;

        const supportedPatterns =
            patternList.filter((pattern: any) => pattern.status === "SUPPORTED").length;

        const emergingPatterns =
            patternList.filter((pattern: any) => pattern.status !== "SUPPORTED").length;

        const supportedConclusions =
            conclusionList.filter((conclusion: any) => conclusion.status === "SUPPORTED").length;

        const preliminaryConclusions =
            conclusionList.filter((conclusion: any) => conclusion.status !== "SUPPORTED").length;

        return {

            generatedAt: new Date().toISOString(),

            summary: {
                totalKnowledge: entries.length,
                supportedKnowledge,
                emergingKnowledge,
                totalPatterns: patternList.length,
                supportedPatterns,
                emergingPatterns,
                totalConclusions: conclusionList.length,
                supportedConclusions,
                preliminaryConclusions,
                totalEvolution: evolutionList.length,
                memoryEvents: memoryEvents.length
            },

            highlights: [
                `${supportedPatterns} supported cross-source patterns discovered.`,
                `${supportedConclusions} supported research conclusions generated.`,
                `${evolution.statistics?.newPatterns ?? 0} new patterns appeared during evolution.`,
                `${evolution.statistics?.strengthenedPatterns ?? 0} patterns strengthened after incorporating new evidence.`
            ],

            recommendations: [
                "Continue ingesting independent repositories.",
                "Increase evidence diversity before promoting preliminary conclusions.",
                "Prioritize repositories containing executable implementations.",
                "Monitor pattern evolution across future research cycles."
            ],

            errors: []

        };

    }

}