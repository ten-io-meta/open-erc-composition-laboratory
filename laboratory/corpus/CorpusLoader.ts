import { readdir, readFile } from "fs/promises";

export class CorpusLoader {

    async listAnalysisSources(path: string): Promise<string[]> {
        return readdir(path);
    }

    async readJson(path: string): Promise<any> {
        return JSON.parse(
            await readFile(path, "utf8")
        );
    }

}