export interface Contradiction {

    contradictionId: string;

    subject: string;

    relationA: string;

    relationB: string;

    object: string;

    supportingSources: string[];

    confidence: number;

    severity: "LOW" | "MEDIUM" | "HIGH";

}