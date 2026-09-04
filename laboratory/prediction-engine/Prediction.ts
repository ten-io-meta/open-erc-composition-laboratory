export interface Prediction {

    predictionId: string;

    prediction: string;

    basedOn: string[];

    confidence: number;

    expectedValue: "HIGH" | "MEDIUM" | "LOW";

    validationTarget: string;

}