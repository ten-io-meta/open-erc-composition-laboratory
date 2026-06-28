export interface CompositionMatrixEntry {

    protocolA: string;

    protocolB: string;

    occurrences: number;

    successfulCompositions: number;

    compatibility: number;

    eligibility: boolean;

    relationshipConfidence: number;

    evidence: number;

    stabilityScore: number;

    safetyScore: number;

    risk: "Low" | "Medium" | "High";

}
