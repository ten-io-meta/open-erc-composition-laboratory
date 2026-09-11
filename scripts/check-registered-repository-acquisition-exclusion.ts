import {
    CandidateSourceAcquisitionEngine
} from "../laboratory/candidate-source-acquisition/CandidateSourceAcquisitionEngine.js";

import type {
    CandidateRepositoryAcquirer
} from "../laboratory/candidate-source-acquisition/CandidateRepositoryAcquirer.js";

import type {
    ResearchPlan
} from "../laboratory/research-planner/ResearchPlan.js";

async function main(): Promise<void> {

    const calls: string[] = [];

    const acquirer: CandidateRepositoryAcquirer = {

        async acquire(repository: string) {

            calls.push(repository);

            return {
                repository,
                sourceId:
                    `TEST-${repository
                        .replace("/", "-")
                        .toUpperCase()}`,
                status: "ACQUIRED",
                enabled: false,
                errors: []
            };
        }
    };

    const plan: ResearchPlan = {

        generatedAt:
            "2026-09-04T00:00:00.000Z",

        tasks: [
            {
                taskId: "TASK-00001",
                priority: "HIGH",
                reason:
                    "Previous research strategy",
                recommendedRepositories: [
                    "Vectorized/solady",
                    "transmissions11/solmate",
                    "new-org/new-repo"
                ]
            },
            {
                taskId: "TASK-00002",
                priority: "MEDIUM",
                reason:
                    "Current evidence",
                recommendedRepositories: [
                    "THIRDWEB-DEV/CONTRACTS",
                    "new-org/new-repo"
                ]
            }
        ],

        errors: []
    };

    const registeredRepositories = [
        "vectorized/SOLADY",
        "transmissions11/solmate",
        "thirdweb-dev/contracts"
    ];

    const result =
        await new CandidateSourceAcquisitionEngine(
            acquirer
        ).acquire(
            plan,
            registeredRepositories
        );

    const acquired =
        result.candidates.filter(
            candidate =>
                candidate.status === "ACQUIRED"
        );

    const skipped =
        result.candidates.filter(
            candidate =>
                candidate.status === "SKIPPED"
        );

    const pass =
        calls.length === 1 &&
        calls[0] === "new-org/new-repo" &&
        acquired.length === 1 &&
        acquired[0]?.repository ===
            "new-org/new-repo" &&
        skipped.length === 3 &&
        skipped.every(
            candidate =>
                candidate.enabled === false
        );

    console.log("");
    console.log(
        "REGISTERED REPOSITORY ACQUISITION EXCLUSION"
    );
    console.log(
        "-------------------------------------------"
    );

    console.log(
        `ACQUIRER CALLS: ${calls.length}`
    );

    console.log(
        `ACQUIRED: ${acquired.length}`
    );

    console.log(
        `SKIPPED: ${skipped.length}`
    );

    console.log(
        `RESULT: ${pass ? "PASS" : "FAIL"}`
    );

    if(!pass){
        process.exitCode = 1;
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});