import type { ProtocolRelationship } from "./ProtocolRelationship.js";

export class CompositionRelationshipEngine {

    discover(datasets: any[]): ProtocolRelationship[] {

        const relationships = new Map<string, ProtocolRelationship>();

        for (const dataset of datasets) {

            const protocols =
                dataset.resolvedProtocols ?? [];

            const successful =
                dataset.validationPassed === true;

            for (let i = 0; i < protocols.length; i++) {

                for (let j = i + 1; j < protocols.length; j++) {

                    const from = protocols[i];
                    const to = protocols[j];

                    const key = `${from}|${to}`;

                    if (!relationships.has(key)) {

                        relationships.set(key, {

                            from,

                            to,

                            occurrences: 0,

                            confidence: 0,

                            successfulCompositions: 0

                        });

                    }

                    const relationship =
                        relationships.get(key)!;

                    relationship.occurrences++;

                    if (successful) {

                        relationship.successfulCompositions++;

                    }

                }

            }

        }

        for (const relationship of relationships.values()) {

            relationship.confidence = Math.round(

                relationship.successfulCompositions
                / relationship.occurrences
                * 100

            );

        }

        return [...relationships.values()];

    }

}
