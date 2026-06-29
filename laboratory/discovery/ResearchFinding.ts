import { ResearchFindingType } from "./ResearchFindingType.js";

export interface ResearchFinding {

    findingId: string;

    type: ResearchFindingType;

    title: string;

    description: string;

    evidence: string[];

    confidence: number;

}