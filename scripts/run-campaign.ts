import { CampaignLoader } from "../laboratory/campaign/CampaignLoader.js";
import { spawn } from "child_process";

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

    for (const batch of campaign.batches) {
        console.log("");
        console.log("------------------------------------");
        console.log(`Executing batch ${batch}`);
        console.log("------------------------------------");

        await runBatch(batch);
    }

    console.log("");
    console.log("Campaign finished.");
}

function runBatch(batchId: string): Promise<void> {
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
            if (code !== 0) {
                console.log("");
                console.log(`Batch completed with validation failures: ${batchId}`);
            }

            resolve();
        });
    });
}

main();