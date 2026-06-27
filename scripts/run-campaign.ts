import { CampaignLoader } from "../laboratory/campaign/CampaignLoader.js";
import { spawn } from "child_process";

interface BatchRunResult {
    batchId: string;
    completed: boolean;
    hadValidationFailures: boolean;
}

async function main() {
    const campaignId = process.argv[2] ?? "CAMPAIGN-0001";

    const loader = new CampaignLoader();

    const campaign = await loader.load(
        `./campaigns/${campaignId}.json`
    );

    console.log("");
    console.log("====================================");
    console.log("OECL Campaign Runner");
    console.log("====================================");
    console.log("");
    console.log("Campaign:");
    console.log(campaign.name);

    const results: BatchRunResult[] = [];

    for (const batch of campaign.batches) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Executing batch ${batch}`);
        console.log("------------------------------------");

        const result = await runBatch(batch);
        results.push(result);
    }

    const completed = results.filter(result => result.completed).length;
    const withValidationFailures = results.filter(
        result => result.hadValidationFailures
    ).length;

    console.log("");
    console.log("====================================");
    console.log("Campaign Summary");
    console.log("====================================");
    console.log(`Batches executed: ${results.length}`);
    console.log(`Batches completed: ${completed}`);
    console.log(`Batches with validation failures: ${withValidationFailures}`);

    console.log("");
    console.log("Campaign finished.");
}

function runBatch(batchId: string): Promise<BatchRunResult> {
    return new Promise(resolve => {
        const child = spawn(
            "npm",
            ["run", "scenario:batch", "--", batchId],
            {
                stdio: "inherit",
                shell: true
            }
        );

        child.on("exit", code => {
            const hadValidationFailures = code !== 0;

            if (hadValidationFailures) {
                console.log("");
                console.log(`Batch completed with validation failures: ${batchId}`);
            }

            resolve({
                batchId,
                completed: true,
                hadValidationFailures
            });
        });
    });
}

main();