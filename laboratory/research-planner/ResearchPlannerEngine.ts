import type { CrossSourcePatternResult } from "../cross-source-patterns/CrossSourcePatternResult.js";
import type { ResearchPlan } from "./ResearchPlan.js";
import type { ResearchTask } from "./ResearchTask.js";

export class ResearchPlannerEngine {

    build(
        patterns: CrossSourcePatternResult,
        existingRepositories: string[] = []
    ): ResearchPlan {

        const tasks: ResearchTask[] = [];

        let counter = 1;

        for (const pattern of patterns.patterns) {

            if (pattern.status === "SUPPORTED") {
                continue;
            }

            const repositories = this.recommendRepositories(
                pattern.relation,
                existingRepositories
            );

            if (repositories.length === 0) {
                continue;
            }

            tasks.push({
                taskId: `TASK-${String(counter).padStart(5, "0")}`,

                priority:
                    pattern.confidence < 40
                        ? "HIGH"
                        : pattern.confidence < 70
                            ? "MEDIUM"
                            : "LOW",

                reason:
                    `Collect additional independent evidence for "${pattern.relation}".`,

                recommendedRepositories:
                    repositories
            });

            counter++;

        }

        return {
            generatedAt: new Date().toISOString(),
            tasks,
            errors: []
        };

    }

    private recommendRepositories(
        relation: string,
        existingRepositories: string[]
    ): string[] {

        const text = relation.toLowerCase();

        const candidates = this.candidatesFor(text);

        return candidates.filter(repository =>
            !this.isAlreadyUsed(repository, existingRepositories)
        );

    }

    private candidatesFor(text: string): string[] {

        if (text.includes("reservation")) {
            return [
                "transmissions11/solmate",
                "Vectorized/solady",
                "thirdweb-dev/contracts"
            ];
        }

        if (
            text.includes("verification")
            || text.includes("invariant")
            || text.includes("security")
        ) {
            return [
                "foundry-rs/foundry",
                "Consensys/smart-contract-best-practices",
                "trailofbits/eth-security-toolbox"
            ];
        }

        if (
            text.includes("standardization")
            || text.includes("erc")
            || text.includes("eip")
        ) {
            return [
                "transmissions11/solmate",
                "Vectorized/solady",
                "thirdweb-dev/contracts"
            ];
        }

        if (
            text.includes("authority")
            || text.includes("transfer")
            || text.includes("ownership")
            || text.includes("upgradeability")
        ) {
            return [
                "Vectorized/solady",
                "transmissions11/solmate",
                "thirdweb-dev/contracts"
            ];
        }

        return [
            "Vectorized/solady",
            "transmissions11/solmate",
            "foundry-rs/foundry",
            "thirdweb-dev/contracts"
        ];

    }

    private isAlreadyUsed(
        repository: string,
        existingRepositories: string[]
    ): boolean {

        const normalizedRepository =
            this.normalize(repository);

        return existingRepositories.some(existing =>
            this.normalize(existing).includes(normalizedRepository)
            || normalizedRepository.includes(this.normalize(existing))
        );

    }

    private normalize(value: string): string {

        return value
            .toLowerCase()
            .replace(/^https:\/\/github\.com\//, "")
            .replace(/\.git$/, "")
            .replace(/^github-/, "")
            .replace(/-/g, "/")
            .replace(/\/+/g, "/")
            .trim();

    }

}