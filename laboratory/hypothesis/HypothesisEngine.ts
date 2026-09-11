import type { CompositionLearningResult } from "../composition-learning/CompositionLearningResult.js";

import type { HypothesisResult } from "./HypothesisResult.js";

import { HypothesisGenerator } from "./HypothesisGenerator.js";

export class HypothesisEngine {

    generate(
        learning: CompositionLearningResult
    ): HypothesisResult {

        try {

            const generator = new HypothesisGenerator();

            const hypotheses = generator.generate(
                learning.knowledge.statistics
            );

            return {

                generatedAt: new Date().toISOString(),

                hypotheses,

                errors: []

            };

        }

        catch (error) {

            return {

                generatedAt: new Date().toISOString(),

                hypotheses: [],

                errors: [

                    error instanceof Error
                        ? error.message
                        : "Unknown hypothesis generation error"

                ]

            };

        }

    }

}