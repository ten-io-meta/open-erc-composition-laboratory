import { readFile } from "fs/promises";
import type { Campaign } from "./Campaign.js";

export class CampaignLoader {
    async load(path: string): Promise<Campaign> {
        return JSON.parse(
            await readFile(path, "utf8")
        );
    }
}