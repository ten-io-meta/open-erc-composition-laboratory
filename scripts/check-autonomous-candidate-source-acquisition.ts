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
                    `TEST-${repository.replace("/", "-").toUpperCase()}`,
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
                reason: "Previous research strategy",
                recommendedRepositories: [
                    "Vectorized/solady",
                    "transmissions11/solmate"
                ]
            },
            {
                taskId: "TASK-00002",
                priority: "MEDIUM",
                reason: "Independent current evidence",
                recommendedRepositories: [
                    "Vectorized/solady",
                    "invalid-repository"
                ]
            }
        ],
        errors: []
    };

    const result =
        await new CandidateSourceAcquisitionEngine(
            acquirer
        ).acquire(plan);

    const uniqueCalls =
        [...new Set(calls)];

    const soladyCalls =
        calls.filter(
            repository =>
                repository === "Vectorized/solady"
        ).length;

    const acquired =
        result.candidates.filter(
            candidate =>
                candidate.status === "ACQUIRED"
        );

    const rejected =
        result.candidates.filter(
            candidate =>
                candidate.status === "REJECTED"
        );

    const allAcquiredDisabled =
        acquired.every(
            candidate =>
                candidate.enabled === false
        );

    const pass =
        soladyCalls === 1 &&
        uniqueCalls.length === 2 &&
        uniqueCalls.includes("Vectorized/solady") &&
        uniqueCalls.includes("transmissions11/solmate") &&
        acquired.length === 2 &&
        rejected.length === 1 &&
        rejected[0]?.repository === "invalid-repository" &&
        allAcquiredDisabled;

    console.log("");
    console.log(
        "AUTONOMOUS CANDIDATE SOURCE ACQUISITION"
    );
    console.log(
        "---------------------------------------"
    );

    console.log(
        `ACQUIRER CALLS: ${calls.length}`
    );

    console.log(
        `UNIQUE ACQUIRER CALLS: ${uniqueCalls.length}`
    );

    console.log(
        `ACQUIRED: ${acquired.length}`
    );

    console.log(
        `REJECTED: ${rejected.length}`
    );

    console.log(
        `ALL ACQUIRED DISABLED: ${allAcquiredDisabled}`
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