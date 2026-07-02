import type { GitHubScannedFile } from "./GitHubFileScanner.js";

export class GitHubEvidenceExtractor {

    extract(files: GitHubScannedFile[]) {
        const paths = files.map(file => file.path.toLowerCase());

        const hasReadme = paths.some(path => path.includes("readme"));
        const hasPackage = paths.some(path => path.endsWith("package.json"));
        const hasTests = paths.some(path => path.includes("test") || path.includes("spec"));
        const hasContracts = paths.some(path => path.includes("contract") || path.endsWith(".sol"));
        const hasDocs = paths.some(path => path.includes("doc"));
        const hasCI = paths.some(path => path.includes(".github/workflows"));
        const hasCitation = paths.some(path => path.includes("citation"));

        const score =
            (hasReadme ? 15 : 0) +
            (hasPackage ? 10 : 0) +
            (hasTests ? 25 : 0) +
            (hasContracts ? 20 : 0) +
            (hasDocs ? 10 : 0) +
            (hasCI ? 10 : 0) +
            (hasCitation ? 10 : 0);

        const quality =
            score >= 85 ? "VERY_HIGH" :
            score >= 65 ? "HIGH" :
            score >= 40 ? "MEDIUM" :
            score >= 20 ? "LOW" :
            "SUSPICIOUS";

        const confidenceWeight =
            quality === "VERY_HIGH" ? 1.0 :
            quality === "HIGH" ? 0.85 :
            quality === "MEDIUM" ? 0.6 :
            quality === "LOW" ? 0.35 :
            0.15;

        return {
            quality,
            confidenceWeight,
            reproducible: true,
            hasImplementation: hasContracts,
            hasTests,
            hasInvariants: files.some(file => file.content.toLowerCase().includes("invariant")),
            hasCoverage: paths.some(path => path.includes("coverage")),
            hasCitation,
            observations: [
                `README: ${hasReadme}`,
                `Package metadata: ${hasPackage}`,
                `Tests: ${hasTests}`,
                `Contracts/interfaces: ${hasContracts}`,
                `Documentation: ${hasDocs}`,
                `CI: ${hasCI}`,
                `Citation: ${hasCitation}`,
                `Evidence score: ${score}`
            ]
        };
    }

}