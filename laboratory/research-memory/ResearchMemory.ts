import type { ResearchMemoryTimeline } from "./ResearchMemoryTimeline.js";
import type { ResearchMemoryStatistics } from "./ResearchMemoryStatistics.js";

export interface ResearchMemory {

    memoryId: string;

    generatedAt: string;

    timelines: ResearchMemoryTimeline[];

    statistics: ResearchMemoryStatistics;

}