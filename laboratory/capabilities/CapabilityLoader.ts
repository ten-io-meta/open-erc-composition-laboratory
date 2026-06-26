import { readFile } from "fs/promises";
import type { Capability } from "./Capability.js";

export class CapabilityLoader {
    async load(path: string): Promise<Capability[]> {
        const content = await readFile(path, "utf8");
        return JSON.parse(content) as Capability[];
    }
}