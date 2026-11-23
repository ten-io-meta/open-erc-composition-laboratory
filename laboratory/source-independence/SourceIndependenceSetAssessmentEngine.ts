import type {
    SourceIndependenceAssessment
} from "./SourceIndependenceAssessment.js";
import type {
    SourceIndependenceSetAssessment
} from "./SourceIndependenceSetAssessment.js";

/**
 * Scientific independence is an attested, pairwise property, not a proxy for
 * source count. Never treat duplicate, contradictory, missing or malformed
 * assessments as proof that two sources are independent.
 *
 * The old bit-mask enumeration used (1 << sourceCount), which overflows beyond
 * 30 sources and has exponential resource usage. Keep exact enumeration only
 * for small sets and return a conservative verified clique on larger sets.
 */
export class SourceIndependenceSetAssessmentEngine {
    private static readonly EXACT_LIMIT = 16;
    private static readonly MAX_SOURCE_IDS = 256;

    build(
        sourceIds: string[],
        pairAssessments: SourceIndependenceAssessment[]
    ): SourceIndependenceSetAssessment {
        const valid = Array.isArray(sourceIds) &&
            sourceIds.every(id => typeof id === "string" && id.trim().length > 0);
        const unique = valid ? [...new Set(sourceIds)] : [];

        // Unsupported or excessive inputs cannot confer independence.
        if (!valid || unique.length > SourceIndependenceSetAssessmentEngine.MAX_SOURCE_IDS) {
            return this.result(unique, [], false, true);
        }
        if (unique.length < 2) {
            return this.result(unique, [], false, false);
        }

        const known = new Set(unique);
        const pairs = new Map<string, { independent: boolean; unresolved: boolean }>();
        const key = (a: string, b: string) =>
            JSON.stringify([a, b].sort());

        for (const assessment of pairAssessments) {
            const ids = assessment?.sourceIds;
            if (!Array.isArray(ids) || ids.length !== 2 ||
                typeof ids[0] !== "string" || typeof ids[1] !== "string" ||
                ids[0] === ids[1] || !known.has(ids[0]) || !known.has(ids[1])) {
                continue;
            }
            const currentIndependent =
                assessment.status === "INDEPENDENT" &&
                assessment.establishedIndependentSources === 2;
            const currentUnresolved =
                assessment.status === "INCONCLUSIVE" ||
                assessment.status === "NOT_APPLICABLE" ||
                (assessment.status === "INDEPENDENT" && !currentIndependent);
            const pairKey = key(ids[0], ids[1]);
            const previous = pairs.get(pairKey);
            if (!previous) {
                pairs.set(pairKey, {
                    independent: currentIndependent,
                    unresolved: currentUnresolved
                });
            } else {
                // Conjunctive agreement: contradictory attestations fail closed.
                pairs.set(pairKey, {
                    independent: previous.independent && currentIndependent,
                    unresolved: previous.unresolved || currentUnresolved ||
                        previous.independent !== currentIndependent
                });
            }
        }

        const isIndependent = (a: string, b: string) =>
            pairs.get(key(a, b))?.independent === true;

        let fullyEstablished = true;
        let hasInconclusiveRelationships = false;
        for (let i = 0; i < unique.length; i++) {
            for (let j = i + 1; j < unique.length; j++) {
                const entry = pairs.get(key(unique[i], unique[j]));
                if (!entry?.independent) fullyEstablished = false;
                if (!entry || entry.unresolved) hasInconclusiveRelationships = true;
            }
        }

        if (fullyEstablished) {
            return this.result(unique, unique, true, hasInconclusiveRelationships);
        }

        let best: string[] = [];
        const choose = (candidate: string[]) => {
            if (candidate.length < 2) return;
            if (candidate.length > best.length ||
                (candidate.length === best.length &&
                    JSON.stringify(candidate) < JSON.stringify(best))) {
                best = candidate;
            }
        };

        if (unique.length <= SourceIndependenceSetAssessmentEngine.EXACT_LIMIT) {
            // 2^16 candidates at most, not 2^N for unbounded N.
            const limit = 2 ** unique.length;
            for (let mask = 0; mask < limit; mask++) {
                const candidate = unique.filter((_, index) =>
                    (mask & (1 << index)) !== 0);
                if (candidate.length < Math.max(2, best.length)) continue;
                if (candidate.every((a, i) =>
                    candidate.slice(i + 1).every(b => isIndependent(a, b)))) {
                    choose(candidate);
                }
            }
        } else {
            // Conservative, polynomial-cost verified-clique search. This is a
            // LOWER BOUND on independence, never a maximum-clique claim.
            const seeds = [...unique].sort().slice(0, 12);
            for (const seed of seeds) {
                const candidate = [seed];
                for (const source of unique) {
                    if (source !== seed &&
                        candidate.every(previous => isIndependent(previous, source))) {
                        candidate.push(source);
                    }
                }
                choose(candidate);
            }
        }
        return this.result(unique, best, false, hasInconclusiveRelationships);
    }

    private result(
        sourceIds: string[],
        establishedIndependentSourceIds: string[],
        fullyEstablished: boolean,
        hasInconclusiveRelationships: boolean
    ): SourceIndependenceSetAssessment {
        return {
            sourceIds,
            establishedIndependentSourceIds,
            establishedIndependentSources: establishedIndependentSourceIds.length,
            fullyEstablished,
            hasInconclusiveRelationships
        };
    }
}
