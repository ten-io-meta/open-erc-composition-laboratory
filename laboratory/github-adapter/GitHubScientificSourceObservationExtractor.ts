import type {
    GitHubScannedFile
} from "./GitHubFileScanner.js";

import type {
    ScientificSourceObservation,
    ScientificSourceObservationKind
} from "../scientific-source-observation/ScientificSourceObservation.js";


export interface GitHubScientificSourceObservationInput {

    sourceId: string;

    sourceRevision?: string;

    sourceLocation: string;

    files: GitHubScannedFile[];

}


export class GitHubScientificSourceObservationExtractor {

    extract(
        input:
            GitHubScientificSourceObservationInput
    ): ScientificSourceObservation[] {

        const files =
            [...input.files]
                .filter(
                    file =>
                        file.content.trim().length >
                        0
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.path.localeCompare(
                            b.path
                        )
                );

        return files.map(
            (
                file,
                index
            ) =>
                this.buildObservation(
                    input,
                    file,
                    index + 1
                )
        );

    }


    private buildObservation(
        input:
            GitHubScientificSourceObservationInput,
        file:
            GitHubScannedFile,
        index:
            number
    ): ScientificSourceObservation {

        return {

            observationId:
                `${input.sourceId}-OBS-${String(
                    index
                ).padStart(
                    5,
                    "0"
                )}`,

            sourceId:
                input.sourceId,

            sourceType:
                "GITHUB",

            sourceRevision:
                input.sourceRevision,

            kind:
                this.kindFor(
                    file.path
                ),

            locator: {

                sourceLocation:
                    input.sourceLocation,

                filePath:
                    file.path,

                startLine:
                    1,

                endLine:
                    this.lineCount(
                        file.content
                    )

            },

            rawText:
                file.content

        };

    }


    private kindFor(
        filePath:
            string
    ): ScientificSourceObservationKind {

        const lower =
            filePath.toLowerCase();


        if (
            lower.includes(
                "/test/"
            ) ||
            lower.includes(
                "/tests/"
            ) ||
            lower.includes(
                ".test."
            ) ||
            lower.includes(
                ".spec."
            )
        ) {

            return "TEST_SOURCE";

        }


        if (
            lower.endsWith(
                "package.json"
            ) ||
            lower.endsWith(
                "tsconfig.json"
            ) ||
            lower.endsWith(
                "foundry.toml"
            ) ||
            lower.includes(
                "hardhat.config."
            ) ||
            lower.endsWith(
                ".yml"
            ) ||
            lower.endsWith(
                ".yaml"
            ) ||
            lower.endsWith(
                ".toml"
            )
        ) {

            return "CONFIGURATION";

        }


        if (
            lower.includes(
                "readme"
            ) ||
            lower.endsWith(
                ".md"
            )
        ) {

            return "DOCUMENTATION";

        }


        if (
            lower.endsWith(
                ".sol"
            )
        ) {

            return "CONTRACT_SOURCE";

        }


        return "OTHER";

    }


    private lineCount(
        content:
            string
    ): number {

        return content
            .split(
                /\r?\n/
            )
            .length;

    }

}