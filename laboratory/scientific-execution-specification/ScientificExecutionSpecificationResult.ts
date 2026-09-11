import type {
    ScientificExecutionSpecification
} from "./ScientificExecutionSpecification.js";

export interface ScientificExecutionSpecificationResult {

    generatedAt: string;

    campaignId: string;

    specifications:
        ScientificExecutionSpecification[];

    statistics: {

        total: number;

        testExecution: number;

        invariantValidation: number;

        staticAnalysis: number;

        executable: number;

        unresolved: number;

    };

    errors: string[];

}