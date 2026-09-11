import { readFile } from "fs/promises";

export class EvidenceSupportLoader {
    async loadJson(path: string): Promise<any> {
        return JSON.parse(await readFile(path, "utf8"));
    }
}