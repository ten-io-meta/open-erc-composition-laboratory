import { readFile } from "fs/promises";

import type { EvidenceProfile } from "./EvidenceProfile.js";

export class EvidenceProfileLoader {

    async load(path: string): Promise<EvidenceProfile> {
        return JSON.parse(
            await readFile(path, "utf8")
        ) as EvidenceProfile;
    }

}