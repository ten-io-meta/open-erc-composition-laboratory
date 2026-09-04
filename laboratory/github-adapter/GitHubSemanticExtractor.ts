import type { GitHubScannedFile } from "./GitHubFileScanner.js";

export class GitHubSemanticExtractor {

    extractProtocols(files: GitHubScannedFile[]): string[] {
        const text = files.map(file => file.content).join("\n");

        const matches = text.match(/ERC[- ]?\d+|IERC\d+[A-Za-z0-9]*/g) ?? [];

        return [...new Set(
            matches.map(match => match.replace(" ", "").replace("-", ""))
        )];
    }

    extractCapabilities(files: GitHubScannedFile[]): string[] {
        const text = files.map(file => file.content.toLowerCase()).join("\n");

        const capabilities = new Set<string>();

        if (/\breservations?\b/.test(text)) capabilities.add("Reservation");
        if (/\baccounting\b/.test(text)) capabilities.add("Accounting");
        if (text.includes("settlement")) capabilities.add("Settlement");
        if (text.includes("embedded value") || text.includes("value-bearing")) capabilities.add("EmbeddedValue");
        if (text.includes("invariant")) capabilities.add("InvariantValidation");
        if (text.includes("test")) capabilities.add("Testing");
        if (text.includes("burn")) capabilities.add("Redemption");

        return [...capabilities];
    }

}