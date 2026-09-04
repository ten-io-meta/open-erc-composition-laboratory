import {
    mkdir,
    readFile,
    writeFile
} from "fs/promises";

import type {
    GitHubSourceBundle
} from "./GitHubSourceBundle.js";

export class SourceBundleWriter {

    async write(
        bundle:
            GitHubSourceBundle
    ): Promise<void> {

        const bundlePath =
            `./sources/research/${bundle.sourceId}`;

        await mkdir(
            bundlePath,
            {
                recursive: true
            }
        );

        /*
         * Persist repository source metadata
         * together with concrete executable targets.
         */

        await writeFile(
            `${bundlePath}/source.json`,
            JSON.stringify(
                {
                    sourceId:
                        bundle.sourceId,

                    title:
                        bundle.title,

                    type:
                        "GITHUB_REPOSITORY",

                    repository:
                        bundle.repository,

                    localPath:
                        bundle.localPath,

                    url:
                        bundle.url,

                    description:
                        bundle.description,

                    toolchain:
                        bundle.toolchain,

                    protocols:
                        bundle.protocols,

                    capabilities:
                        bundle.capabilities,

                    claims:
                        bundle.claims,

                    executableTargets:
                        bundle.executableTargets ?? []
                },
                null,
                4
            )
        );

        const evidence =
            bundle.evidence ?? {
                quality:
                    "HIGH",

                confidenceWeight:
                    0.85,

                reproducible:
                    true,

                hasImplementation:
                    true,

                hasTests:
                    true,

                hasInvariants:
                    true,

                hasCoverage:
                    false,

                hasCitation:
                    false,

                observations: [
                    "Repository-based evidence bundle.",
                    "Includes implementation-oriented research material.",
                    "Requires manual review before scientific interpretation."
                ]
            };

        await writeFile(
            `${bundlePath}/evidence.json`,
            JSON.stringify(
                {
                    sourceId:
                        bundle.sourceId,

                    evidenceType:
                        "GITHUB_REPOSITORY",

                    quality:
                        evidence.quality,

                    reproducible:
                        evidence.reproducible,

                    hasImplementation:
                        evidence.hasImplementation,

                    hasTests:
                        evidence.hasTests,

                    hasInvariants:
                        evidence.hasInvariants,

                    hasCoverage:
                        evidence.hasCoverage,

                    hasCitation:
                        evidence.hasCitation,

                    confidenceWeight:
                        evidence.confidenceWeight,

                    observations:
                        evidence.observations
                },
                null,
                4
            )
        );

        await writeFile(
            `${bundlePath}/README.md`,
            `# ${bundle.title}

Repository: ${bundle.repository}

URL: ${bundle.url}

## Description

${bundle.description}

## Protocols

${bundle.protocols
    .map(
        protocol =>
            `- ${protocol}`
    )
    .join("\n")}

## Capabilities

${bundle.capabilities
    .map(
        capability =>
            `- ${capability}`
    )
    .join("\n")}

## Claims

${bundle.claims
    .map(
        claim =>
            `- ${claim}`
    )
    .join("\n")}
`
        );

        await this.updateManifest(
            bundle
        );

    }

    private async updateManifest(
        bundle:
            GitHubSourceBundle
    ): Promise<void> {

        const manifestPath =
            "./sources/manifest.json";

        const manifest =
            JSON.parse(
                await readFile(
                    manifestPath,
                    "utf8"
                )
            );

        const entry = {

            sourceId:
                bundle.sourceId,

            path:
                `./sources/research/${bundle.sourceId}/source.json`,

            evidencePath:
                `./sources/research/${bundle.sourceId}/evidence.json`,

            enabled:
                false

        };

        manifest.sources =
            manifest.sources.filter(
                (source: any) =>
                    source.sourceId !==
                    bundle.sourceId
            );

        manifest.sources.push(
            entry
        );

        await writeFile(
            manifestPath,
            JSON.stringify(
                manifest,
                null,
                4
            )
        );

    }

}