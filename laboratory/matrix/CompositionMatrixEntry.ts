export interface CompositionMatrixEntry {
    protocolA: string;
    protocolB: string;

    occurrences: number;
    successfulCompositions: number;

    experimentIds: string[];

    relationshipConfidence: number;

    compatibility: number | null;
    stabilityScore: number | null;
    safetyScore: number | null;

    risk:
        | "Low"
        | "Medium"
        | "High"
        | "Unknown";

    eligibility: boolean;

    evidence: number;
}