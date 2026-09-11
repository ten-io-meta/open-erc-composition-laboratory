import { mkdir, writeFile } from "fs/promises";

import type { NormalizedSource } from "../normalized-source/NormalizedSource.js";

export class ResearchSourceExporter {

    async export(source: NormalizedSource): Promise<{
        sourcePath: string;
        evidencePath: string;
    }> {

        const basePath = `./sources/research/${source.sourceId}`;

        await mkdir(basePath, { recursive: true });

        const researchSource = {
            sourceId: source.sourceId,
            title: source.title,
            type: source.sourceType,
            author: source.author ?? "UNKNOWN",
            publishedAt: source.publishedAt ?? source.importedAt,
            version: source.version ?? "INGESTED",
                        location: source.location,
            repository: source.repository,
            branch: source.branch,
            commit: source.commit,
            metadata: {
                ...source.metadata
            },
            description: source.description,
            keywords: source.tags,
            referencedProtocols: source.protocols,
            referencedCapabilities: source.capabilities,
            claims: source.claims,
            ingested: true
        };

        const evidence = {
            sourceId: source.sourceId,
            evidenceType: source.sourceType,
            quality: source.evidence.quality,
            reproducible: source.evidence.reproducible,
            hasImplementation: source.evidence.implementation,
            hasTests: source.evidence.tests,
            hasInvariants: source.evidence.invariants,
            hasCoverage: false,
            hasCitation: source.evidence.citations,
            confidenceWeight: source.evidence.confidenceWeight,
            observations: [
                `Normalized from ${source.sourceType}.`,
                `Location: ${source.location}.`,
                ...source.claims.map(claim => `Claim: ${claim}`)
            ]
        };

        const sourcePath = `${basePath}/source.json`;
        const evidencePath = `${basePath}/evidence.json`;

        await writeFile(sourcePath, JSON.stringify(researchSource, null, 4));
        await writeFile(evidencePath, JSON.stringify(evidence, null, 4));

        return {
            sourcePath,
            evidencePath
        };

    }

}