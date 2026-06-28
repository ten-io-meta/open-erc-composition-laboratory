export interface CompositionPropertyResult {
    property: string;
    passed: boolean;
    score: number;
    message: string;
}

export interface CompositionProperty {
    evaluate(context: {
        requiredCapabilities: string[];
        resolvedProtocols: string[];
        validationPassed: boolean;
    }): CompositionPropertyResult;
}
