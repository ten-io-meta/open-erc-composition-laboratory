import type {
    ScientificBeliefRevision
} from "./ScientificBeliefRevision.js";

export interface ScientificBeliefRevisionResult {

    generatedAt: string;

    revisions:
        ScientificBeliefRevision[];

    statistics: {

        total: number;

        preserve: number;

        reviewSupport: number;

        reviewChallenge: number;

        reviewConflict: number;

        defer: number;

        requiringScientificReview: number;

        requiringFurtherExperiment: number;

        repositoryDiversityObserved: number;

        sourceIndependenceEstablished: number;

        automaticConfidenceChanges: number;

        automaticStatusChanges: number;
    };

    errors: string[];
}