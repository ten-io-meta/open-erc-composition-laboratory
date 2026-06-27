import {
    CompositionProperty,
    CompositionPropertyResult
} from "./CompositionProperty.js";

export class CompatibilityProperty implements CompositionProperty {

    evaluate(context: {
        requiredCapabilities: string[];
        resolvedProtocols: string[];
        validationPassed: boolean;
    }): CompositionPropertyResult {

        const passed = context.resolvedProtocols.length > 0;

        return {
            property: "Compatibility",
            passed,
            score: passed ? 100 : 0,
            message: passed
                ? "All required capabilities were resolved by the composition."
                : "No protocols were resolved for the requested composition."
        };

    }

}