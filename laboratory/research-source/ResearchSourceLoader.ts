import { readFile } from "fs/promises";

import type { ResearchSource } from "./ResearchSource.js";

export class ResearchSourceLoader {

    async load(path: string): Promise<ResearchSource> {

        const json = JSON.parse(
            await readFile(path, "utf8")
        );

        return json as ResearchSource;

    }

    async loadMany(paths: string[]): Promise<ResearchSource[]> {

        const sources: ResearchSource[] = [];

        for (const path of paths) {

            const source = await this.load(path);

            sources.push(source);

        }

        return sources;

    }

}