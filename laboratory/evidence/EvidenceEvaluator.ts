import type { ResearchSource } from "../research-source/ResearchSource.js";

import type { EvidenceAssessment } from "./EvidenceAssessment.js";
import type { EvidenceEvaluationResult } from "./EvidenceEvaluationResult.js";

export class EvidenceEvaluator {

    evaluate(source: ResearchSource): EvidenceEvaluationResult {

        let confidence = 0;
        const observations: string[] = [];

        let reproducible = false;
        let hasImplementation = false;
        let hasTests = false;
        let hasFormalInvariants = false;
        let peerReviewed = false;

        const text = [
            source.title,
            source.description,
            source.location,
            source.version,
            ...(source.keywords ?? []),
            ...(source.referencedProtocols ?? []),
            ...(source.referencedCapabilities ?? [])
        ].join(" ").toLowerCase();

        if (text.includes("github") || text.includes("implementation")) {
            hasImplementation = true;
            confidence += 20;
            observations.push("Implementation or repository evidence detected.");
        }

        if (text.includes("test") || text.includes("validation") || text.includes("suite")) {
            hasTests = true;
            confidence += 20;
            observations.push("Validation or test evidence detected.");
        }

        if (text.includes("invariant") || text.includes("deterministic accounting") || text.includes("accounting")) {
            hasFormalInvariants = true;
            confidence += 20;
            observations.push("Invariant or deterministic accounting evidence detected.");
        }

        if (text.includes("reproducible") || text.includes("npm install") || text.includes("hardhat")) {
            reproducible = true;
            confidence += 20;
            observations.push("Reproducibility evidence detected.");
        }

        if (source.type === "DOI" || text.includes("doi") || text.includes("citation")) {
            peerReviewed = true;
            confidence += 20;
            observations.push("Persistent citation or DOI evidence detected.");
        }

        const quality =
            confidence >= 90 ? "VERY_HIGH" :
            confidence >= 70 ? "HIGH" :
            confidence >= 50 ? "MEDIUM" :
            confidence >= 30 ? "LOW" :
            "VERY_LOW";

        const assessment: EvidenceAssessment = {
            sourceId: source.sourceId,
            quality,
            confidence,
            reproducible,
            hasImplementation,
            hasTests,
            hasFormalInvariants,
            peerReviewed,
            observations
        };

        return {
            evaluatedAt: new Date().toISOString(),
            sourceId: source.sourceId,
            assessment,
            errors: []
        };
    }
}