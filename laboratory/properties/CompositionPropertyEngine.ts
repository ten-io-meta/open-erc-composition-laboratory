import type {
    CompositionProperty,
    CompositionPropertyResult
} from "./CompositionProperty.js";

export class CompositionPropertyEngine {
    private readonly properties: CompositionProperty[] = [];

    register(property: CompositionProperty): void {
        this.properties.push(property);
    }

    evaluate(context: {
        requiredCapabilities: string[];
        resolvedProtocols: string[];
        validationPassed: boolean;
    }): CompositionPropertyResult[] {
        return this.properties.map(property =>
            property.evaluate(context)
        );
    }
}