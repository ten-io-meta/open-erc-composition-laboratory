import type {
    ResearchSource
} from "../research-source/ResearchSource.js";

import type {
    SourceIndependenceAssessment
} from "./SourceIndependenceAssessment.js";

import type {
    SourceIndependenceAssessmentResult
} from "./SourceIndependenceAssessmentResult.js";

import type {
    SourceIndependenceEvidence
} from "./SourceIndependenceEvidence.js";

export class SourceIndependenceAssessmentEngine {

    build(
        sources: ResearchSource[],
        explicitEvidence: SourceIndependenceEvidence[] = []
    ): SourceIndependenceAssessmentResult {

        try {

            const assessments:
                SourceIndependenceAssessment[] = [];

            if (sources.length === 1) {

                assessments.push({
                    sourceIds: [
                        sources[0].sourceId
                    ],
                    status:
                        "NOT_APPLICABLE",
                    reason:
                        "SINGLE_SOURCE",
                    establishedIndependentSources:
                        0,
                    explanation:
                        `Source ${sources[0].sourceId} cannot be assessed ` +
                        `for independence without another scientific source.`
                });

            } else {

                for (
                    let leftIndex = 0;
                    leftIndex < sources.length;
                    leftIndex++
                ) {

                    for (
                        let rightIndex = leftIndex + 1;
                        rightIndex < sources.length;
                        rightIndex++
                    ) {

                        assessments.push(
                            this.assessPair(
                                sources[leftIndex],
                                sources[rightIndex],
                                explicitEvidence
                            )
                        );

                    }

                }

            }

            return {
                generatedAt:
                    new Date().toISOString(),

                assessments,

                statistics: {
                    total:
                        assessments.length,

                    independent:
                        assessments.filter(
                            assessment =>
                                assessment.status ===
                                "INDEPENDENT"
                        ).length,

                    dependent:
                        assessments.filter(
                            assessment =>
                                assessment.status ===
                                "DEPENDENT"
                        ).length,

                    inconclusive:
                        assessments.filter(
                            assessment =>
                                assessment.status ===
                                "INCONCLUSIVE"
                        ).length,

                    notApplicable:
                        assessments.filter(
                            assessment =>
                                assessment.status ===
                                "NOT_APPLICABLE"
                        ).length
                },

                errors:
                    []
            };

        } catch (error) {

            return {
                generatedAt:
                    new Date().toISOString(),

                assessments:
                    [],

                statistics: {
                    total: 0,
                    independent: 0,
                    dependent: 0,
                    inconclusive: 0,
                    notApplicable: 0
                },

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown source independence assessment error"
                ]
            };

        }

    }

    private assessPair(
        sourceA: ResearchSource,
        sourceB: ResearchSource,
        explicitEvidence: SourceIndependenceEvidence[]
    ): SourceIndependenceAssessment {

        const sourceIds = [
            sourceA.sourceId,
            sourceB.sourceId
        ];

        if (
            sourceA.sourceId ===
            sourceB.sourceId
        ) {

            return {
                sourceIds,
                status:
                    "DEPENDENT",
                reason:
                    "SAME_SOURCE_ID",
                establishedIndependentSources:
                    0,
                explanation:
                    `Sources ${sourceA.sourceId} and ${sourceB.sourceId} ` +
                    `share the same scientific source identity.`
            };

        }

        const repositoryA =
            this.repositoryIdentityFor(
                sourceA
            );

        const repositoryB =
            this.repositoryIdentityFor(
                sourceB
            );

        if (
            repositoryA !== null &&
            repositoryB !== null &&
            repositoryA === repositoryB
        ) {

            return {
                sourceIds,
                status:
                    "DEPENDENT",
                reason:
                    "SAME_REPOSITORY",
                establishedIndependentSources:
                    0,
                explanation:
                    `Sources ${sourceA.sourceId} and ${sourceB.sourceId} ` +
                    `resolve to the same repository ${repositoryA}.`
            };

        }

        const locationA =
            this.normalizedLocation(
                sourceA.location
            );

        const locationB =
            this.normalizedLocation(
                sourceB.location
            );

        if (
            locationA !== null &&
            locationB !== null &&
            locationA === locationB
        ) {

            return {
                sourceIds,
                status:
                    "DEPENDENT",
                reason:
                    "SAME_NORMALIZED_LOCATION",
                establishedIndependentSources:
                    0,
                explanation:
                    `Sources ${sourceA.sourceId} and ${sourceB.sourceId} ` +
                    `resolve to the same normalized source location.`
            };

        }

        const explicit = this.explicitEvidenceFor(
            sourceA.sourceId,sourceB.sourceId,explicitEvidence
        );
        if (explicit.length) {
            const statuses = new Set(explicit.map(item=>item.status));
            const malformed = explicit.some(item=>
                !item.basis?.trim() ||
                !Array.isArray(item.evidenceIds) ||
                item.evidenceIds.length===0 ||
                item.evidenceIds.some(id=>typeof id!=="string"||!id.trim()));
            // A contradictory or unanchored declaration must not establish
            // independence by input order or by a bare status label.
            if (statuses.size!==1 || malformed) {
                return {
                    sourceIds,status:"INCONCLUSIVE",
                    reason:"INSUFFICIENT_PROVENANCE",
                    establishedIndependentSources:0,
                    explanation:"Conflicting or unanchored source-independence attestations."
                };
            }
            if (explicit[0].status==="DEPENDENT") {
                return {
                    sourceIds,status:"DEPENDENT",
                    reason:"DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
                    establishedIndependentSources:0,
                    explanation:"Explicit documented source dependence: "+explicit[0].basis
                };
            }
            if (explicit[0].status==="INDEPENDENT") {
                return {
                    sourceIds,status:"INDEPENDENT",
                    reason:"DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
                    establishedIndependentSources:2,
                    explanation:"Independence explicitly attested with evidence IDs: "+explicit[0].basis
                };
            }
        }

        if (
            !this.hasUsefulProvenance(sourceA) ||
            !this.hasUsefulProvenance(sourceB)
        ) {

            return {
                sourceIds,
                status:
                    "INCONCLUSIVE",
                reason:
                    "INSUFFICIENT_PROVENANCE",
                establishedIndependentSources:
                    0,
                explanation:
                    `Available provenance is insufficient to establish ` +
                    `scientific independence between ` +
                    `${sourceA.sourceId} and ${sourceB.sourceId}.`
            };

        }

        return {
            sourceIds,
            status:
                "INCONCLUSIVE",
            reason:
                "DISTINCT_SOURCE_IDENTITY_WITHOUT_DEPENDENCY_EVIDENCE",
            establishedIndependentSources:
                0,
            explanation:
                `Sources ${sourceA.sourceId} and ${sourceB.sourceId} ` +
                `have distinct identities, but no explicit evidence ` +
                `establishes their scientific independence.`
        };

    }

    private explicitEvidenceFor(
        sourceAId: string,
        sourceBId: string,
        explicitEvidence: SourceIndependenceEvidence[]
    ): SourceIndependenceEvidence[] {
        return explicitEvidence.filter(evidence=>
            evidence &&
            ((evidence.sourceAId===sourceAId && evidence.sourceBId===sourceBId) ||
             (evidence.sourceAId===sourceBId && evidence.sourceBId===sourceAId))
        );
    }

    private repositoryIdentityFor(
        source: ResearchSource
    ): string | null {

        if (
            source.repository &&
            source.repository.trim().length > 0
        ) {

            return this.normalizeRepository(
                source.repository
            );

        }

        const location =
            source.location?.trim();

        if (
            !location
        ) {
            return null;
        }

        const match =
            location.match(
                /^https?:\/\/github\.com\/([^/]+\/[^/#?]+)(?:[/?#].*)?$/i
            );

        if (
            !match
        ) {
            return null;
        }

        return this.normalizeRepository(
            match[1]
        );

    }

    private normalizeRepository(
        repository: string
    ): string {

        return repository
            .trim()
            .replace(
                /^https?:\/\/github\.com\//i,
                ""
            )
            .replace(
                /\.git$/i,
                ""
            )
            .replace(
                /\/+$/,
                ""
            )
            .toLowerCase();

    }

    private normalizedLocation(
        location: string | undefined
    ): string | null {

        const normalized =
            String(
                location ?? ""
            )
                .trim()
                .replace(
                    /\/+$/,
                    ""
                )
                .toLowerCase();

        return normalized.length > 0
            ? normalized
            : null;

    }

    private hasUsefulProvenance(
        source: ResearchSource
    ): boolean {

        return Boolean(
            source.sourceId &&
            (
                source.location ||
                source.repository ||
                source.author ||
                source.publishedAt ||
                source.version
            )
        );

    }

}