import type { EvidenceGraphResult } from "../evidence-graph/EvidenceGraphResult.js";
import type { ResearchTheory } from "./ResearchTheory.js";
import type { ResearchTheoryResult } from "./ResearchTheoryResult.js";

export class TheoryEngine {

    build(
        graph: EvidenceGraphResult
    ): ResearchTheoryResult {

        const theories: ResearchTheory[] = [];

        let counter = 1;

        const hasEdge = (from: string, relation: string, to: string) =>
            graph.edges.some(edge =>
                edge.from === from &&
                edge.relation === relation &&
                edge.to === to
            );

        const edgeIds = (terms: string[]) =>
            graph.edges
                .filter(edge =>
                    terms.includes(edge.from) ||
                    terms.includes(edge.to)
                )
                .map(edge => edge.edgeId);

        if (
            hasEdge("Reservation", "CONSTRAIN", "Accounting") ||
            hasEdge("Reservation", "CONSTRAINS", "Accounting")
        ) {
            theories.push({
                theoryId: `THEORY-${String(counter++).padStart(5, "0")}`,
                title: "Reservation-Constrained Accounting Theory",
                description:
                    "Reservation appears to constrain accounting boundaries and reduce unsafe settlement ambiguity across independent sources.",
                supportingEdges: edgeIds([
                    "Reservation",
                    "Accounting",
                    "Settlement",
                    "Invariant Validation"
                ]),
                confidence: this.averageConfidence(graph, [
                    "Reservation",
                    "Accounting",
                    "Settlement",
                    "Invariant Validation"
                ]),
                maturity: "SUPPORTED"
            });
        }

        if (
            hasEdge("Invariant Validation", "VALIDATE", "Accounting") ||
            hasEdge("Invariant Validation", "VALIDATES", "Accounting")
        ) {
            theories.push({
                theoryId: `THEORY-${String(counter++).padStart(5, "0")}`,
                title: "Invariant-Supported Accounting Theory",
                description:
                    "Accounting conclusions become stronger when invariant validation and testing evidence are present.",
                supportingEdges: edgeIds([
                    "Invariant Validation",
                    "Testing",
                    "Accounting",
                    "Safety Constraint"
                ]),
                confidence: this.averageConfidence(graph, [
                    "Invariant Validation",
                    "Testing",
                    "Accounting",
                    "Safety Constraint"
                ]),
                maturity: "SUPPORTED"
            });
        }

        if (
            hasEdge("Standardization", "ENABLE", "Interoperability") ||
            hasEdge("Standardization", "ENABLES", "Interoperability")
        ) {
            theories.push({
                theoryId: `THEORY-${String(counter++).padStart(5, "0")}`,
                title: "Standardization-Driven Interoperability Theory",
                description:
                    "Standardized specifications and interfaces appear to support interoperability and protocol composition.",
                supportingEdges: edgeIds([
                    "Specification",
                    "Standardization",
                    "Interoperability",
                    "Composition"
                ]),
                confidence: this.averageConfidence(graph, [
                    "Specification",
                    "Standardization",
                    "Interoperability",
                    "Composition"
                ]),
                maturity: "SUPPORTED"
            });
        }

        return {
            generatedAt: new Date().toISOString(),
            theories,
            statistics: {
                theories: theories.length,
                emerging: theories.filter(theory => theory.maturity === "EMERGING").length,
                supported: theories.filter(theory => theory.maturity === "SUPPORTED").length,
                established: theories.filter(theory => theory.maturity === "ESTABLISHED").length
            },
            errors: []
        };

    }

    private averageConfidence(
        graph: EvidenceGraphResult,
        terms: string[]
    ): number {

        const relevant = graph.edges.filter(edge =>
            terms.includes(edge.from) ||
            terms.includes(edge.to)
        );

        if (relevant.length === 0) {
            return 0;
        }

        return Math.round(
            relevant.reduce((sum, edge) => sum + edge.confidence, 0) /
            relevant.length
        );

    }

}