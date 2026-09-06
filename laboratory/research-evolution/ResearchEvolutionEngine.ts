import type {
    CrossSourcePattern
} from "../cross-source-patterns/CrossSourcePattern.js";

import type {
    ResearchConclusion
} from "../research-conclusions/ResearchConclusion.js";

import type {
    ResearchEvolution,
    ResearchEvolutionDimension,
    ResearchEvolutionType
} from "./ResearchEvolution.js";

import type {
    ResearchAcceleration,
    ResearchEvolutionResult,
    ResearchMaturity,
    ResearchVelocity
} from "./ResearchEvolutionResult.js";

interface ComparableEntity {

    id: string;

    statement: string;

    status: string;

    confidence: number;

    sourceCount: number;

    observations: number;

    sources: string[];

    evidence: string[];

    score: number;

}

export class ResearchEvolutionEngine {

    build(
        previousState: any,
        currentState: {
            knowledge?: any;
            patterns?: any;
            conclusions?: any;
        }
    ): ResearchEvolutionResult {

        try {

            const evolutions:
                ResearchEvolution[] = [];

            const previousKnowledge =
                this.extractKnowledgeEntities(
                    previousState?.knowledge
                );

            const currentKnowledge =
                this.extractKnowledgeEntities(
                    currentState.knowledge
                );

            evolutions.push(
                ...this.compareEntities(
                    "KNOWLEDGE",
                    previousKnowledge,
                    currentKnowledge,
                    evolutions.length
                )
            );

            const previousPatterns =
                this.extractPatternEntities(
                    previousState?.patterns
                );

            const currentPatterns =
                this.extractPatternEntities(
                    currentState.patterns
                );

            evolutions.push(
                ...this.compareEntities(
                    "PATTERN",
                    previousPatterns,
                    currentPatterns,
                    evolutions.length
                )
            );

            const previousConclusions =
                this.extractConclusionEntities(
                    previousState?.conclusions
                );

            const currentConclusions =
                this.extractConclusionEntities(
                    currentState.conclusions
                );

            evolutions.push(
                ...this.compareEntities(
                    "CONCLUSION",
                    previousConclusions,
                    currentConclusions,
                    evolutions.length
                )
            );

            const totalCurrentEntities =
                currentKnowledge.length +
                currentPatterns.length +
                currentConclusions.length;

            const positiveEvolutions =
                evolutions.filter(
                    evolution =>
                        this.isPositive(
                            evolution.type
                        )
                ).length;

            const negativeEvolutions =
                evolutions.filter(
                    evolution =>
                        this.isNegative(
                            evolution.type
                        )
                ).length;

            const unchangedEntities =
                Math.max(
                    0,
                    totalCurrentEntities -
                    positiveEvolutions -
                    evolutions.filter(
                        evolution =>
                            evolution.type.startsWith(
                                "WEAKENED_"
                            )
                    ).length
                );

            const knowledgeDecay =
                this.calculateKnowledgeDecay(
                    evolutions,
                    totalCurrentEntities
                );

            const campaignProductivity =
                this.calculateProductivity(
                    evolutions,
                    totalCurrentEntities
                );

            const researchMaturityScore =
                this.calculateMaturityScore(
                    [
                        ...currentKnowledge,
                        ...currentPatterns,
                        ...currentConclusions
                    ]
                );

            const researchMaturity =
                this.maturityFor(
                    researchMaturityScore
                );

            const researchVelocityScore =
                this.calculateVelocityScore(
                    positiveEvolutions,
                    negativeEvolutions,
                    totalCurrentEntities
                );

            const researchVelocity =
                this.velocityFor(
                    researchVelocityScore,
                    positiveEvolutions,
                    negativeEvolutions
                );

            const previousVelocityScore =
                this.previousMetric(
                    previousState,
                    "researchVelocityScore"
                );

            const researchAccelerationScore =
                researchVelocityScore -
                previousVelocityScore;

            const researchAcceleration =
                this.accelerationFor(
                    researchAccelerationScore
                );

            const statistics:
                ResearchEvolutionResult["statistics"] = {

                evolutions:
                    evolutions.length,

                newKnowledge:
                    this.countType(
                        evolutions,
                        "NEW_KNOWLEDGE"
                    ),

                strengthenedKnowledge:
                    this.countType(
                        evolutions,
                        "STRENGTHENED_KNOWLEDGE"
                    ),

                weakenedKnowledge:
                    this.countType(
                        evolutions,
                        "WEAKENED_KNOWLEDGE"
                    ),

                removedKnowledge:
                    this.countType(
                        evolutions,
                        "REMOVED_KNOWLEDGE"
                    ),

                newPatterns:
                    this.countType(
                        evolutions,
                        "NEW_PATTERN"
                    ),

                strengthenedPatterns:
                    this.countType(
                        evolutions,
                        "STRENGTHENED_PATTERN"
                    ),

                weakenedPatterns:
                    this.countType(
                        evolutions,
                        "WEAKENED_PATTERN"
                    ),

                removedPatterns:
                    this.countType(
                        evolutions,
                        "REMOVED_PATTERN"
                    ),

                newConclusions:
                    this.countType(
                        evolutions,
                        "NEW_CONCLUSION"
                    ),

                strengthenedConclusions:
                    this.countType(
                        evolutions,
                        "STRENGTHENED_CONCLUSION"
                    ),

                weakenedConclusions:
                    this.countType(
                        evolutions,
                        "WEAKENED_CONCLUSION"
                    ),

                removedConclusions:
                    this.countType(
                        evolutions,
                        "REMOVED_CONCLUSION"
                    ),

                positiveEvolutions,

                negativeEvolutions,

                unchangedEntities,

                stagnantCycle:
                    positiveEvolutions === 0 &&
                    negativeEvolutions === 0,

                knowledgeDecay,

                campaignProductivity,

                researchMaturityScore,

                researchMaturity,

                researchVelocityScore,

                researchVelocity,

                researchAccelerationScore,

                researchAcceleration

            };

            return {

                generatedAt:
                    new Date().toISOString(),

                evolutions,

                statistics,

                errors: []

            };

        } catch (error) {

            return {

                generatedAt:
                    new Date().toISOString(),

                evolutions: [],

                statistics:
                    this.emptyStatistics(),

                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown research evolution error"
                ]

            };

        }

    }

    private compareEntities(
        dimension:
            ResearchEvolutionDimension,

        previousEntities:
            ComparableEntity[],

        currentEntities:
            ComparableEntity[],

        startIndex:
            number
    ): ResearchEvolution[] {

        const previousById =
            new Map<string, ComparableEntity>(
                previousEntities.map(
                    entity => [
                        entity.id,
                        entity
                    ]
                )
            );

        const currentById =
            new Map<string, ComparableEntity>(
                currentEntities.map(
                    entity => [
                        entity.id,
                        entity
                    ]
                )
            );

        const evolutions:
            ResearchEvolution[] = [];

        for (
            const current
            of currentEntities
        ) {

            const previous =
                previousById.get(
                    current.id
                );

            if (!previous) {

                evolutions.push(
                    this.createEvolution(
                        startIndex +
                        evolutions.length +
                        1,
                        this.newTypeFor(
                            dimension
                        ),
                        dimension,
                        current,
                        undefined
                    )
                );

                continue;

            }

            const scoreDelta =
                current.score -
                previous.score;

            if (
                scoreDelta >= 3
            ) {

                evolutions.push(
                    this.createEvolution(
                        startIndex +
                        evolutions.length +
                        1,
                        this.strengthenedTypeFor(
                            dimension
                        ),
                        dimension,
                        current,
                        previous
                    )
                );

                continue;

            }

            if (
                scoreDelta <= -3
            ) {

                evolutions.push(
                    this.createEvolution(
                        startIndex +
                        evolutions.length +
                        1,
                        this.weakenedTypeFor(
                            dimension
                        ),
                        dimension,
                        current,
                        previous
                    )
                );

            }

        }

        for (
            const previous
            of previousEntities
        ) {

            if (
                currentById.has(
                    previous.id
                )
            ) {
                continue;
            }

            evolutions.push(
                this.createEvolution(
                    startIndex +
                    evolutions.length +
                    1,
                    this.removedTypeFor(
                        dimension
                    ),
                    dimension,
                    undefined,
                    previous
                )
            );

        }

        return evolutions;

    }

    private createEvolution(
        index: number,
        type: ResearchEvolutionType,
        dimension: ResearchEvolutionDimension,
        current?: ComparableEntity,
        previous?: ComparableEntity
    ): ResearchEvolution {

        const entity =
            current ?? previous;

        if (!entity) {
            throw new Error(
                "Research evolution entity is missing."
            );
        }

        const scoreBefore =
            previous?.score ?? 0;

        const scoreAfter =
            current?.score ?? 0;

        return {

            evolutionId:
                `EVOLUTION-${String(
                    index
                ).padStart(5, "0")}`,

            type,

            dimension,

            entityId:
                entity.id,

            statement:
                this.statementFor(
                    type,
                    entity.statement
                ),

            before:
                previous
                    ? this.describeEntity(
                        previous
                    )
                    : undefined,

            after:
                current
                    ? this.describeEntity(
                        current
                    )
                    : undefined,

            scoreBefore,

            scoreAfter,

            scoreDelta:
                scoreAfter -
                scoreBefore,

            sources:
                current?.sources ??
                previous?.sources ??
                [],

            evidence:
                current?.evidence ??
                previous?.evidence ??
                [],

            explanation:
                this.explanationFor(
                    type,
                    previous,
                    current
                )

        };

    }

    private extractKnowledgeEntities(
        result: any
    ): ComparableEntity[] {

        const entries =
            this.findArray(
                result,
                [
                    "entries",
                    "knowledge",
                    "mergedKnowledge",
                    "mergedEntries"
                ]
            );

        return entries.map(
            (entry: any) => {

                const statement =
                    String(
                        entry.statement ??
                        entry.relation ??
                        entry.claim ??
                        entry.knowledgeId ??
                        entry.id ??
                        "Unknown knowledge"
                    );

                const status =
                    String(
                        entry.status ??
                        "EMERGING"
                    );

                const confidence =
                    this.numberFor(
                        entry.averageConfidence ??
                        entry.confidence
                    );

                const sources =
                    this.stringArray(
                        entry.sources ??
                        entry.supportedBy ??
                        entry.sourceIds
                    );

                const evidence =
                    this.stringArray(
                        entry.evidence
                    );

                const observations =
                    this.numberFor(
                        entry.observations ??
                        entry.evidenceCount
                    );

                const sourceCount =
                    Math.max(
                        sources.length,
                        this.numberFor(
                            entry.independentSources
                        )
                    );

                return {

                    id:
                        this.entityId(
                            entry.knowledgeId ??
                            entry.id ??
                            `${
                                entry.relation ?? statement
                            }|PROTOCOL:${
                                entry.protocolPair ?? ""
                            }|CAPABILITY:${
                                entry.capabilityPair ?? ""
                            }`
                        ),

                    statement,

                    status,

                    confidence,

                    sourceCount,

                    observations,

                    sources,

                    evidence,

                    score:
                        this.entityScore(
                            status,
                            confidence,
                            sourceCount,
                            observations
                        )

                };

            }
        );

    }

    private extractPatternEntities(
        result: any
    ): ComparableEntity[] {

        const patterns:
            CrossSourcePattern[] =
                result?.patterns ?? [];

        return patterns.map(
            pattern => {

                const statement =
                    String(
                        pattern.relation
                    );

                const sources =
                    pattern.sources ?? [];

                const evidence =
                    pattern.evidence ?? [];

                const confidence =
                    this.numberFor(
                        (pattern as any)
                            .confidence
                    );

                const status =
                    String(
                        pattern.status ??
                        "EMERGING"
                    );

                return {

                    id:
                        this.entityId(
                            pattern
                                .normalizedRelation ??
                            pattern.relation
                        ),

                    statement,

                    status,

                    confidence,

                    sourceCount:
                        sources.length,

                    observations:
                        evidence.length,

                    sources,

                    evidence,

                    score:
                        this.entityScore(
                            status,
                            confidence,
                            sources.length,
                            evidence.length
                        )

                };

            }
        );

    }

    private extractConclusionEntities(
        result: any
    ): ComparableEntity[] {

        const conclusions:
            ResearchConclusion[] =
                result?.conclusions ?? [];

        return conclusions.map(
            conclusion => {

                const sources =
                    conclusion.supportedBy ??
                    [];

                const evidence =
                    conclusion.evidence ??
                    [];

                const confidence =
                    this.numberFor(
                        conclusion.confidence
                    );

                const status =
                    String(
                        conclusion.status ??
                        "PRELIMINARY"
                    );

                return {

                    id:
                        this.entityId(
                            conclusion.statement
                        ),

                    statement:
                        conclusion.statement,

                    status,

                    confidence,

                    sourceCount:
                        sources.length,

                    observations:
                        evidence.length,

                    sources,

                    evidence,

                    score:
                        this.entityScore(
                            status,
                            confidence,
                            sources.length,
                            evidence.length
                        )

                };

            }
        );

    }

    private entityScore(
        status: string,
        confidence: number,
        sourceCount: number,
        observations: number
    ): number {

        const statusScore =
            this.statusRank(
                status
            ) * 8;

        const confidenceScore =
            confidence * 0.55;

        const sourceScore =
            Math.min(
                20,
                sourceCount * 4
            );

        const observationScore =
            Math.min(
                10,
                observations
            );

        return this.clamp(
            statusScore +
            confidenceScore +
            sourceScore +
            observationScore
        );

    }

    private statusRank(
        status: string
    ): number {

        switch (
            String(
                status
            ).toUpperCase()
        ) {

            case "REJECTED":
            case "REFUTED":
            case "ARCHIVED":
                return 0;

            case "CHALLENGED":
            case "INCONCLUSIVE":
                return 1;

            case "EMERGING":
            case "PRELIMINARY":
                return 2;

            case "SUPPORTED":
            case "MODERATE":
                return 3;

            case "VALIDATED":
            case "ESTABLISHED":
            case "STRONG":
                return 4;

            case "CANONICAL":
                return 5;

            default:
                return 2;

        }

    }

    private calculateMaturityScore(
        entities:
            ComparableEntity[]
    ): number {

        if (
            entities.length === 0
        ) {
            return 0;
        }

        return Math.round(
            entities.reduce(
                (sum, entity) =>
                    sum + entity.score,
                0
            ) /
            entities.length
        );

    }

    private maturityFor(
        score: number
    ): ResearchMaturity {

        if (
            score >= 85
        ) {
            return "MATURE";
        }

        if (
            score >= 70
        ) {
            return "ESTABLISHED";
        }

        if (
            score >= 45
        ) {
            return "DEVELOPING";
        }

        return "INITIAL";

    }

    private calculateVelocityScore(
        positive: number,
        negative: number,
        totalEntities: number
    ): number {

        if (
            totalEntities === 0
        ) {
            return 0;
        }

        return Math.round(
            (
                (
                    positive -
                    negative
                ) /
                totalEntities
            ) * 100
        );

    }

    private velocityFor(
        score: number,
        positive: number,
        negative: number
    ): ResearchVelocity {

        if (
            negative > positive
        ) {
            return "DECLINING";
        }

        if (
            positive === 0 &&
            negative === 0
        ) {
            return "STAGNANT";
        }

        if (
            score >= 30
        ) {
            return "RAPID";
        }

        if (
            score >= 12
        ) {
            return "NORMAL";
        }

        return "SLOW";

    }

    private accelerationFor(
        score: number
    ): ResearchAcceleration {

        if (
            score >= 5
        ) {
            return "ACCELERATING";
        }

        if (
            score <= -5
        ) {
            return "DECELERATING";
        }

        return "STABLE";

    }

    private calculateProductivity(
        evolutions:
            ResearchEvolution[],
        totalEntities:
            number
    ): number {

        if (
            totalEntities === 0
        ) {
            return 0;
        }

        const newEntities =
            evolutions.filter(
                evolution =>
                    evolution.type.startsWith(
                        "NEW_"
                    )
            ).length;

        const strengthened =
            evolutions.filter(
                evolution =>
                    evolution.type.startsWith(
                        "STRENGTHENED_"
                    )
            ).length;

        return this.clamp(
            (
                newEntities * 1.5 +
                strengthened
            ) /
            totalEntities *
            100
        );

    }

    private calculateKnowledgeDecay(
        evolutions:
            ResearchEvolution[],
        totalEntities:
            number
    ): number {

        if (
            totalEntities === 0
        ) {
            return 0;
        }

        const negative =
            evolutions.filter(
                evolution =>
                    this.isNegative(
                        evolution.type
                    )
            ).length;

        return this.clamp(
            negative /
            totalEntities *
            100
        );

    }

    private previousMetric(
        previousState: any,
        key: string
    ): number {

        return this.numberFor(
            previousState
                ?.statistics
                ?.[key] ??
            previousState
                ?.researchEvolution
                ?.statistics
                ?.[key]
        );

    }

    private findArray(
        value: any,
        keys: string[]
    ): any[] {

        if (
            Array.isArray(
                value
            )
        ) {
            return value;
        }

        for (
            const key
            of keys
        ) {

            if (
                Array.isArray(
                    value?.[key]
                )
            ) {
                return value[key];
            }

        }

        return [];

    }

    private stringArray(
        value: unknown
    ): string[] {

        if (
            !Array.isArray(
                value
            )
        ) {
            return [];
        }

        return value.map(
            item =>
                typeof item === "string"
                    ? item
                    : JSON.stringify(
                        item
                    )
        );

    }

    private entityId(
        value: unknown
    ): string {

        return this.normalize(
            String(
                value ?? ""
            )
        )
            .replace(
                /\bacross \d+ independent sources?\b/g,
                ""
            )
            .replace(
                /\bconfidence \d+\b/g,
                ""
            )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            .toUpperCase();

    }

    private normalize(
        value: string
    ): string {

        return String(
            value ?? ""
        )
            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )
            .replace(
                /[^a-zA-Z0-9]+/g,
                " "
            )
            .toLowerCase()
            .trim();

    }

    private describeEntity(
        entity:
            ComparableEntity
    ): string {

        return (
            `${entity.status} / ` +
            `confidence ${entity.confidence} / ` +
            `${entity.sourceCount} source(s) / ` +
            `score ${entity.score}`
        );

    }

    private statementFor(
        type:
            ResearchEvolutionType,
        statement:
            string
    ): string {

        return (
            `${type.replace(
                /_/g,
                " "
            )}: ${statement}`
        );

    }

    private explanationFor(
        type:
            ResearchEvolutionType,
        previous:
            ComparableEntity | undefined,
        current:
            ComparableEntity | undefined
    ): string {

        if (
            type.startsWith(
                "NEW_"
            )
        ) {

            return (
                `A new ${type
                    .replace(
                        "NEW_",
                        ""
                    )
                    .toLowerCase()} was detected with score ` +
                `${current?.score ?? 0}.`
            );

        }

        if (
            type.startsWith(
                "STRENGTHENED_"
            )
        ) {

            return (
                `Scientific strength increased from ` +
                `${previous?.score ?? 0} to ` +
                `${current?.score ?? 0}.`
            );

        }

        if (
            type.startsWith(
                "WEAKENED_"
            )
        ) {

            return (
                `Scientific strength decreased from ` +
                `${previous?.score ?? 0} to ` +
                `${current?.score ?? 0}.`
            );

        }

        return (
            `The entity was present in the previous research state ` +
            `but is absent from the current state.`
        );

    }

    private newTypeFor(
        dimension:
            ResearchEvolutionDimension
    ): ResearchEvolutionType {

        switch (dimension) {

            case "KNOWLEDGE":
                return "NEW_KNOWLEDGE";

            case "PATTERN":
                return "NEW_PATTERN";

            case "CONCLUSION":
                return "NEW_CONCLUSION";

        }

    }

    private strengthenedTypeFor(
        dimension:
            ResearchEvolutionDimension
    ): ResearchEvolutionType {

        switch (dimension) {

            case "KNOWLEDGE":
                return "STRENGTHENED_KNOWLEDGE";

            case "PATTERN":
                return "STRENGTHENED_PATTERN";

            case "CONCLUSION":
                return "STRENGTHENED_CONCLUSION";

        }

    }

    private weakenedTypeFor(
        dimension:
            ResearchEvolutionDimension
    ): ResearchEvolutionType {

        switch (dimension) {

            case "KNOWLEDGE":
                return "WEAKENED_KNOWLEDGE";

            case "PATTERN":
                return "WEAKENED_PATTERN";

            case "CONCLUSION":
                return "WEAKENED_CONCLUSION";

        }

    }

    private removedTypeFor(
        dimension:
            ResearchEvolutionDimension
    ): ResearchEvolutionType {

        switch (dimension) {

            case "KNOWLEDGE":
                return "REMOVED_KNOWLEDGE";

            case "PATTERN":
                return "REMOVED_PATTERN";

            case "CONCLUSION":
                return "REMOVED_CONCLUSION";

        }

    }

    private isPositive(
        type:
            ResearchEvolutionType
    ): boolean {

        return (
            type.startsWith(
                "NEW_"
            ) ||
            type.startsWith(
                "STRENGTHENED_"
            )
        );

    }

    private isNegative(
        type:
            ResearchEvolutionType
    ): boolean {

        return (
            type.startsWith(
                "WEAKENED_"
            ) ||
            type.startsWith(
                "REMOVED_"
            )
        );

    }

    private countType(
        evolutions:
            ResearchEvolution[],
        type:
            ResearchEvolutionType
    ): number {

        return evolutions.filter(
            evolution =>
                evolution.type ===
                type
        ).length;

    }

    private numberFor(
        value: unknown
    ): number {

        const number =
            Number(
                value ?? 0
            );

        return Number.isFinite(
            number
        )
            ? number
            : 0;

    }

    private clamp(
        value: number
    ): number {

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(value)
            )
        );

    }

    private emptyStatistics():
        ResearchEvolutionResult["statistics"] {

        return {
            evolutions: 0,
            newKnowledge: 0,
            strengthenedKnowledge: 0,
            weakenedKnowledge: 0,
            removedKnowledge: 0,
            newPatterns: 0,
            strengthenedPatterns: 0,
            weakenedPatterns: 0,
            removedPatterns: 0,
            newConclusions: 0,
            strengthenedConclusions: 0,
            weakenedConclusions: 0,
            removedConclusions: 0,
            positiveEvolutions: 0,
            negativeEvolutions: 0,
            unchangedEntities: 0,
            stagnantCycle: true,
            knowledgeDecay: 0,
            campaignProductivity: 0,
            researchMaturityScore: 0,
            researchMaturity: "INITIAL",
            researchVelocityScore: 0,
            researchVelocity: "STAGNANT",
            researchAccelerationScore: 0,
            researchAcceleration: "STABLE"
        };

    }

}