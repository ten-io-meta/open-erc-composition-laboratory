import { readdir, readFile } from "fs/promises";
import type { BatchResultSummary } from "./BenchmarkEngine.js";

export class BenchmarkLoader {

    async loadAll(): Promise<BatchResultSummary[]> {

        const files = await readdir("./campaign-results");

        const results: BatchResultSummary[] = [];

        for (const file of files) {

            if (!file.endsWith(".json")) {
                continue;
            }

            const json = JSON.parse(
                await readFile(
                    `./campaign-results/${file}`,
                    "utf8"
                )
            );

            results.push(json);
        }

        return results;
    }

}