import { mkdir, readFile, writeFile, rename, realpath } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

import type { KnowledgeResult } from "../laboratory/research-knowledge/KnowledgeResult.js";
import { ResearchMemoryEngine } from "../laboratory/research-memory/ResearchMemoryEngine.js";
import { ResearchMemoryLoader } from "../laboratory/research-memory/ResearchMemoryLoader.js";

/**
 * Privacy-first output boundary for future research memory.
 *
 * Previously this legacy CLI wrote directly into tracked
 * research-memory-results/*.json in the PUBLIC repository. It now reads an
 * explicit knowledge input, while all generated cumulative memory is placed
 * in an ignored local .oecl-private/ directory (or an external secure root).
 *
 * This does not retract the historical public MIT files or change the
 * evidence-based scientific memory engine itself.
 */
const isInside = (parent: string, child: string): boolean => {
    const path = relative(parent, child);
    return path === "" || (path !== ".." &&
        !path.startsWith(".." + sep) && !isAbsolute(path));
};

async function privateMemoryDirectory(): Promise<string> {
    const repo = await realpath(process.cwd());
    const allowed = resolve(repo, ".oecl-private");
    const root = resolve(
        process.env.OECL_PRIVATE_RESEARCH_ROOT ?? allowed
    );
    if (isInside(repo, root) && !isInside(allowed, root)) {
        throw new Error("PRIVATE_RESEARCH_ROOT_WITHIN_PUBLIC_GIT_TREE");
    }

    const directory = join(root, "research-memory");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const actual = await realpath(directory);

    // Detect symlinks that redirect a protected root into a tracked
    // location; .gitignore alone does not protect against such mistakes.
    if (isInside(repo, actual) && !isInside(allowed, actual)) {
        throw new Error("PRIVATE_RESEARCH_SYMLINK_REDIRECTS_TO_PUBLIC_GIT");
    }
    return actual;
}

async function writePrivateJson(path: string, object: unknown): Promise<void> {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const temporary = path + ".tmp-" + randomUUID();
    try {
        await writeFile(temporary, JSON.stringify(object, null, 4) + "\n", {
            mode: 0o600, flag: "wx"
        });
        await rename(temporary, path);
    } catch (error) {
        const { unlink } = await import("node:fs/promises");
        await unlink(temporary).catch(() => undefined);
        throw error;
    }
}

async function main() {
    console.log("OECL Research Memory — PRIVATE output");
    const repo = await realpath(process.cwd());
    const directory = await privateMemoryDirectory();
    const memoryPath = join(directory, "OECL-V2-RESEARCH-MEMORY.json");
    const sourceId = process.env.OECL_RESEARCH_SOURCE_ID || "DOI-0001";
    if (!/^[A-Za-z0-9._-]{1,100}$/.test(sourceId)) {
        throw new Error("INVALID_RESEARCH_SOURCE_IDENTIFIER");
    }

    const input = resolve(process.env.OECL_RESEARCH_KNOWLEDGE_INPUT ??
        join(repo, "research-knowledge-results/OECL-V2-RESEARCH-KNOWLEDGE.json"));
    const knowledge = JSON.parse(await readFile(input, "utf8")) as KnowledgeResult;
    if (!knowledge?.knowledge || !Array.isArray(knowledge.knowledge.entries)) {
        throw new Error("RESEARCH_KNOWLEDGE_INPUT_INVALID");
    }

    const loader = new ResearchMemoryLoader();
    let previous = await loader.load(memoryPath);
    if (!previous && process.env.OECL_RESEARCH_SEED_PUBLIC_HISTORY === "1") {
        // Explicit opt-in: the existing public data is NOT confidential.
        previous = await loader.load(
            join(repo, "research-memory-results/OECL-V2-RESEARCH-MEMORY.json")
        );
        console.log("Seeded from historic PUBLIC research memory fixture");
    }

    const result = new ResearchMemoryEngine().update(
        previous, knowledge.knowledge, sourceId
    );
    if (result.errors.length) {
        throw new Error("RESEARCH_MEMORY_ENGINE_FAILED: " + result.errors.join("; "));
    }

    const resultPath = join(directory, "OECL-V2-RESEARCH-MEMORY-RESULT.json");
    await writePrivateJson(memoryPath, result.memory);
    await writePrivateJson(resultPath, result);

    // No client identifiers, input content, memory metrics or private
    // filesystem paths are logged; CI and hosted logs may be public.
    console.log("OECL_PRIVATE_RESEARCH_MEMORY_PASS", JSON.stringify({
        storage: "PRIVATE_RESEARCH_ROOT_NOT_TRACKED_PUBLIC_RESULTS",
        publicHistoricalDataChanged: false,
    }));
}
main().catch(error => {
    console.error("OECL_PRIVATE_RESEARCH_MEMORY_FAILED",
        error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
