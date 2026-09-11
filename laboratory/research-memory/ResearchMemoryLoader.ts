import { access, readFile } from "fs/promises";

import type { ResearchMemory } from "./ResearchMemory.js";

export class ResearchMemoryLoader {

    async exists(path: string): Promise<boolean> {
        try {
            await access(path);
            return true;
        } catch {
            return false;
        }
    }

    async load(path: string): Promise<ResearchMemory | null> {
        if (!(await this.exists(path))) {
            return null;
        }

        return JSON.parse(
            await readFile(path, "utf8")
        ) as ResearchMemory;
    }

}