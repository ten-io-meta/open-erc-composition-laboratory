import type { GitHubScannedFile } from "./GitHubFileScanner.js";

export class GitHubClaimExtractor {

    extract(files: GitHubScannedFile[]): string[] {
        const claims: string[] = [];

        const lines = files
            .filter(file => file.path.toLowerCase().includes("readme") || file.path.endsWith(".md"))
            .flatMap(file => file.content.split(/\r?\n/));

        for (const line of lines) {
            const clean = line.replace(/^#+\s*/, "").trim();

            if (clean.length < 30) continue;

            const lower = clean.toLowerCase();

            if (
                lower.includes("implements") ||
                lower.includes("supports") ||
                lower.includes("composes") ||
                lower.includes("compatible") ||
                lower.includes("invariant") ||
                lower.includes("validation") ||
                lower.includes("deterministic") ||
                lower.includes("accounting")
            ) {
                claims.push(clean);
            }
        }

        return [...new Set(claims)].slice(0, 20);
    }

}