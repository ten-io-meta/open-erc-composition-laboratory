import { readFile, writeFile, mkdir } from "fs/promises";

import type { ResearchHistory } from "./ResearchHistory.js";

export class ResearchHistoryManager {

    private readonly file =
        "./research-history/OECL-V2-LAST-STATE.json";

    async load(): Promise<ResearchHistory | null> {

        try {

            const json =
                await readFile(this.file, "utf8");

            return JSON.parse(json);

        } catch {

            return null;

        }

    }

    async save(state: ResearchHistory): Promise<void> {

        await mkdir(
            "./research-history",
            { recursive: true }
        );

        await writeFile(
            this.file,
            JSON.stringify(state, null, 4)
        );

    }

}