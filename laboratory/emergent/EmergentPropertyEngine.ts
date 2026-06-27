import type {
    EmergentProperty,
    EmergentPropertyResult
} from "./EmergentProperty.js";

export class EmergentPropertyEngine {

    private readonly properties: EmergentProperty[] = [];

    register(property: EmergentProperty): void {
        this.properties.push(property);
    }

    evaluate(
        datasets: any[]
    ): EmergentPropertyResult[] {

        return this.properties.flatMap(property =>
            property.detect(datasets)
        );

    }

}