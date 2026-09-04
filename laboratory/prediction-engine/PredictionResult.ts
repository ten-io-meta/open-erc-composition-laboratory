import type { Prediction } from "./Prediction.js";

export interface PredictionResult {

    generatedAt: string;

    predictions: Prediction[];

    statistics: {
        predictions: number;
        highValue: number;
        mediumValue: number;
        lowValue: number;
    };

    errors: string[];

}