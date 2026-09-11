import type {
    ResearchPlan
} from "../research-planner/ResearchPlan.js";

import type {
    CandidateRepositoryAcquirer
} from "./CandidateRepositoryAcquirer.js";

import type {
    CandidateSourceAcquisition,
    CandidateSourceAcquisitionResult
} from "./CandidateSourceAcquisitionResult.js";

export class CandidateSourceAcquisitionEngine {

    constructor(
        private readonly acquirer:
            CandidateRepositoryAcquirer
    ) {}

    async acquire(
        plan: ResearchPlan,
        registeredRepositories: string[] = []
    ): Promise<CandidateSourceAcquisitionResult> {

        const repositories =
            this.uniqueRepositories(plan);

        const registered =
            new Set(
                registeredRepositories
                    .map(repository =>
                        this.normalizeRepository(
                            repository
                        )
                    )
                    .filter(Boolean)
            );

        const candidates:
            CandidateSourceAcquisition[] = [];

        for (const repository of repositories) {

            if (!this.isValidRepository(repository)) {

                candidates.push({
                    repository,
                    sourceId: null,
                    status: "REJECTED",
                    enabled: false,
                    errors: [
                        "Repository identifier must use owner/repository form."
                    ]
                });

                continue;
            }

            if (
                registered.has(
                    this.normalizeRepository(
                        repository
                    )
                )
            ) {

                candidates.push({
                    repository,
                    sourceId: null,
                    status: "SKIPPED",
                    enabled: false,
                    errors: []
                });

                continue;
            }

            try {

                const candidate =
                    await this.acquirer.acquire(
                        repository
                    );

                /*
                 * Acquisition and scientific admission are
                 * deliberately separate operations.
                 */
                candidates.push({
                    ...candidate,
                    repository,
                    enabled: false
                });

            } catch (error) {

                candidates.push({
                    repository,
                    sourceId: null,
                    status: "FAILED",
                    enabled: false,
                    errors: [
                        error instanceof Error
                            ? error.message
                            : String(error)
                    ]
                });
            }
        }

        return {
            generatedAt:
                new Date().toISOString(),
            candidates,
            errors: []
        };
    }

    private uniqueRepositories(
        plan: ResearchPlan
    ): string[] {

        const repositories =
            plan.tasks.flatMap(
                task =>
                    task.recommendedRepositories
            );

        const unique =
            new Map<string, string>();

        for (const repository of repositories) {

            const trimmed =
                repository.trim();

            if (!trimmed) {
                continue;
            }

            const identity =
                this.normalizeRepository(
                    trimmed
                );

            if (!unique.has(identity)) {
                unique.set(
                    identity,
                    trimmed
                );
            }
        }

        return [...unique.values()];
    }

    private normalizeRepository(
        repository: string
    ): string {

        return repository
            .trim()
            .toLowerCase();
    }

    private isValidRepository(
        repository: string
    ): boolean {

        const parts =
            repository.split("/");

        return (
            parts.length === 2 &&
            parts[0].length > 0 &&
            parts[1].length > 0 &&
            !parts[0].includes(" ") &&
            !parts[1].includes(" ")
        );
    }
}