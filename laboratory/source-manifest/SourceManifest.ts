import type { SourceManifestEntry } from "./SourceManifestEntry.js";

export interface SourceManifest {

    manifestId: string;

    sources: SourceManifestEntry[];

}