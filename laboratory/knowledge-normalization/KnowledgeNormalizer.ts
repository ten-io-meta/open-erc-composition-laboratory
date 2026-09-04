import { ConceptAlias } from "./ConceptAlias.js";
import { KnowledgeNormalizationResult } from "./KnowledgeNormalizationResult.js";
import { NormalizedConcept } from "./NormalizedConcept.js";

export class KnowledgeNormalizer {

    private readonly aliases: ConceptAlias[] = [

        {
            canonical: "Reservation",
            aliases: [
                "Reservation",
                "Reserve",
                "Reserved Value",
                "ReservedValue",
                "ReservedAsset"
            ]
        },

        {
            canonical: "Accounting",
            aliases: [
                "Accounting",
                "Ledger",
                "BalanceAccounting",
                "AccountingSystem"
            ]
        },

        {
            canonical: "Settlement",
            aliases: [
                "Settlement",
                "SettlementEngine",
                "Settlement Layer"
            ]
        },

        {
            canonical: "EmbeddedValue",
            aliases: [
                "EmbeddedValue",
                "Embedded Value",
                "IntrinsicValue"
            ]
        }

    ];

    normalize(
        concepts: string[]
    ): KnowledgeNormalizationResult {

        const normalized: NormalizedConcept[] = [];

        for (const concept of concepts) {

            let canonical = concept;

            for (const alias of this.aliases) {

                const match = alias.aliases.some(

                    value =>

                        value.toLowerCase() ===

                        concept.toLowerCase()

                );

                if (match) {

                    canonical = alias.canonical;

                    break;

                }

            }

            normalized.push({

                original: concept,

                normalized: canonical,

                confidence: canonical === concept ? 100 : 90

            });

        }

        return {

            generatedAt: new Date().toISOString(),

            concepts: normalized,

            errors: []

        };

    }

}