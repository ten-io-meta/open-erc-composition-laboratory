export interface EmergentPropertyResult {
    property: string;
    confidence: number;
    evidence: number;
    description: string;
}

export interface EmergentProperty {
    detect(datasets: any[]): EmergentPropertyResult[];
}
