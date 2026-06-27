export interface CompositionQuery {

    eligibleOnly?: boolean;

    maxRisk?: "Low" | "Medium" | "High";

    minEvidence?: number;

    minStabilityScore?: number;

}