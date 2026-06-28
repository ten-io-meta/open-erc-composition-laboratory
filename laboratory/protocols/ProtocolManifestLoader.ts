import { readFile } from "fs/promises";

export interface ProtocolManifest {
    id: string;
    name: string;
    version: string;
    capabilities: string[];
}

export class ProtocolManifestLoader {
    async load(path: string): Promise<ProtocolManifest> {
        const content = await readFile(path, "utf8");
        return JSON.parse(content) as ProtocolManifest;
    }
}
