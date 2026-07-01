import { readFile } from "fs/promises";

import type { SourceManifest } from "./SourceManifest.js";

export class SourceManifestLoader {

    async load(path: string): Promise<SourceManifest> {
        return JSON.parse(
            await readFile(path, "utf8")
        ) as SourceManifest;
    }

    enabledSources(manifest: SourceManifest) {
        return manifest.sources.filter(source => source.enabled);
    }

}