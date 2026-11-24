import type { ResearchConclusion } from "./ResearchConclusion.js";
import type { ResearchConclusionResult } from "./ResearchConclusionResult.js";
import type { SourceIndependenceAssessment } from "../source-independence/SourceIndependenceAssessment.js";
import { SourceIndependenceSetAssessmentEngine } from "../source-independence/SourceIndependenceSetAssessmentEngine.js";

export class ResearchConclusionEngine {

    build(
        crossSourcePatterns: any,
        independenceAssessments: SourceIndependenceAssessment[] = []
    ): ResearchConclusionResult {

        try {

            if (!crossSourcePatterns ||
                !Array.isArray(crossSourcePatterns.patterns) ||
                (Array.isArray(crossSourcePatterns.errors) && crossSourcePatterns.errors.length > 0)) {
                throw Error("INVALID_OR_CHALLENGED_SOURCE_PATTERNS");
            }
            const patterns = crossSourcePatterns.patterns;
            const independence = new SourceIndependenceSetAssessmentEngine();

            const conclusions: ResearchConclusion[] = patterns.map(
                (pattern: any, index: number) => {

                    const relationParts = this.parseRelation(
                        String(pattern.normalizedRelation ?? pattern.relation ?? "")
                    );

                    const sources: string[] = Array.isArray(pattern.sources)
                        ? [...new Set<string>(pattern.sources
                            .filter((source: unknown): source is string =>
                                typeof source === "string" && source.trim().length > 0)
                            .map((source: string) => source.trim()))]
                        : [];
                    const evidence: string[] = Array.isArray(pattern.evidence)
                        ? [...new Set<string>(pattern.evidence
                            .filter((claim: unknown): claim is string =>
                                typeof claim === "string" && claim.trim().length > 0)
                            .map((claim: string) => claim.trim()))]
                        : [];
                    const independent = independence.build(sources, independenceAssessments);
                    const confidence = Number(pattern.confidence);
                    const safeConfidence = Number.isFinite(confidence) &&
                        confidence >= 0 && confidence <= 100 ? confidence : 0;
                    const statement = this.statementFor(
                        relationParts.subject,
                        relationParts.predicate,
                        relationParts.object,
                        sources
                    );

                    return {
                        conclusionId: `CONCLUSION-${String(index + 1).padStart(5, "0")}`,
                        subject: relationParts.subject,
relation: relationParts.predicate,
object: relationParts.object,
sourcePatternId:
    String(
        pattern.patternId ?? ""
    ),

sourcePatternRelation:
    String(
        pattern.normalizedRelation ??
        pattern.relation ??
        ""
    ),
    protocolPair:
    pattern.protocolPair
        ? String(
            pattern.protocolPair
        )
        : undefined,
                        statement,
                        supportedBy: sources,
                        confidence: safeConfidence,
                        status: this.statusFor(
                            pattern.status, safeConfidence, evidence.length,
                            independent.establishedIndependentSources
                        ),
                        evidence
                    };

                }
            );

            return {
                generatedAt: new Date().toISOString(),
                conclusions,
                errors: []
            };

        } catch (error) {

            return {
                generatedAt: new Date().toISOString(),
                conclusions: [],
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown research conclusion error"
                ]
            };

        }

    }

    private parseRelation(relation: string): {
        subject: string;
        predicate: string;
        object: string;
    } {

        const parts = relation
            .replace(/->/g, ":")
            .split(":")
            .map((part: string) => part.trim())
            .filter(Boolean);

        return {
            subject: this.pretty(parts[0] ?? "UnknownSubject"),
            predicate: this.pretty(parts[1] ?? "RELATES_TO"),
            object: this.pretty(parts[2] ?? "UnknownObject")
        };

    }

    private statementFor(
    subject: string,
    predicate: string,
    object: string,
    sources: string[]
): string {

    const phrase =
        this.phraseFor(
            predicate
        );

    const uniqueSourceIds =
        [
            ...new Set(
                sources
            )
        ];

    const sourceText =
        uniqueSourceIds.length === 1
            ? "1 observed source identity"
            : `${uniqueSourceIds.length} observed source identities`;

    return (
        `${subject} ${phrase} ${object} across ${sourceText}.`
    );

}

    private phraseFor(predicate: string): string {

        switch (predicate.toUpperCase()) {
            case "ENABLES":
                return "appears to enable";
            case "CONSTRAINS":
                return "appears to constrain";
            case "BOUNDS":
                return "appears to bound";
            case "SUPPORTS":
                return "appears to support";
            case "REQUIRES":
                return "appears to require";
            case "VALIDATES":
                return "appears to validate";
            case "INDICATES":
                return "appears to indicate";
            case "IMPLEMENTS":
                return "appears to implement";
            case "PRESERVES":
                return "appears to preserve";
            case "UPDATES":
                return "appears to update";
            default:
                return "appears to relate to";
        }

    }

    /**
     * A high input score and a self-described SUPPORTED pattern are NOT an
     * attestation. Stronger research labels require nonempty evidence IDs
     * and independently verified source identities. No EVM claim is made.
     */
    private statusFor(
        patternStatus: string,
        confidence: number,
        evidenceCount: number,
        independentSources: number
    ): ResearchConclusion["status"] {
        if (patternStatus !== "SUPPORTED" || evidenceCount < 1 ||
            independentSources < 2 || !Number.isFinite(confidence))
            return "PRELIMINARY";
        if (independentSources >= 3 && confidence >= 70)
            return "ESTABLISHED";
        return "SUPPORTED";
    }

    private pretty(value: string): string {

    const knownTerms: Record<string, string> = {
        EMBEDDEDVALUE: "Embedded Value",
        DETERMINISTICEXECUTION: "Deterministic Execution",
        INVARIANTVALIDATION: "Invariant Validation",
        SECURITYCONSIDERATIONS: "Security Considerations",
        STANDARDIZATION: "Standardization",
        RESERVATION: "Reservation",
        ACCOUNTING: "Accounting",
        SETTLEMENT: "Settlement",
        SPECIFICATION: "Specification",
        IERC8060RESERVABLE: "IERC8060Reservable"
    };

    const normalized = value
        .replace(/_/g, "")
        .replace(/\s+/g, "")
        .toUpperCase();

    if (knownTerms[normalized]) {
        return knownTerms[normalized];
    }

    if (
        /^ERC\d+$/i.test(value) ||
        /^EIP\d+$/i.test(value) ||
        /^IERC\d+/i.test(value)
    ) {
        return value.toUpperCase();
    }

    return value
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map((word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

}

}