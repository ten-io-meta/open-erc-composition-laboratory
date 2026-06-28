import {
    CompositionProperty,
    CompositionPropertyResult
} from "./CompositionProperty.js";

export class ComposabilityProperty implements CompositionProperty {
    evaluate(context: {
        requiredCapabilities: string[];
        resolvedProtocols: string[];
        validationPassed: boolean;
    }): CompositionPropertyResult {
        const passed =
            context.resolvedProtocols.length > 1 &&
            context.validationPassed;

        return {
            property: "Composability",
            passed,
            score: passed ? 100 : 0,
            message: passed
                ? "Multiple protocols composed successfully."
                : "Composition did not complete successfully."
        };
    }
}
