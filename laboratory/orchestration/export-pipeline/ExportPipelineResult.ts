export interface ExportPipelineResult {

    generatedAt: string;

    exportedFiles: string[];

    statistics: {
        requested: number;
        exported: number;
        failed: number;
    };

    errors: string[];

}