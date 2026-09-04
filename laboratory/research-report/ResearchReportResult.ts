import type { ResearchReportSummary } from "./ResearchReportSummary.js";

export interface ResearchReportResult {

    generatedAt: string;

    summary: ResearchReportSummary;

    highlights: string[];

    recommendations: string[];

    errors: string[];

}