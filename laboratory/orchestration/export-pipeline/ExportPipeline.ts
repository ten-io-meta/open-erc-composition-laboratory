import {
    mkdir,
    writeFile
} from "fs/promises";

import type {
    ExportDefinition
} from "./ExportDefinition.js";

import type {
    ExportPipelineResult
} from "./ExportPipelineResult.js";

export class ExportPipeline {

    async run(
        outputs: ReadonlyArray<ExportDefinition>
    ): Promise<ExportPipelineResult> {

        const exportedFiles: string[] = [];
        const errors: string[] = [];

        for (const output of outputs) {

            const path =
                `${output.directory}/${output.filename}`;

            try {

                await mkdir(
                    output.directory,
                    {
                        recursive: true
                    }
                );

                await writeFile(
                    path,
                    JSON.stringify(
                        output.data,
                        null,
                        4
                    ),
                    "utf8"
                );

                exportedFiles.push(
                    path
                );

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : "Unknown export error";

                errors.push(
                    `${path}: ${message}`
                );

            }

        }

        return {

            generatedAt:
                new Date().toISOString(),

            exportedFiles,

            statistics: {

                requested:
                    outputs.length,

                exported:
                    exportedFiles.length,

                failed:
                    errors.length

            },

            errors

        };

    }

}