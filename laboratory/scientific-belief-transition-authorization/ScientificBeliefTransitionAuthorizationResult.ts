import type {
    ScientificBeliefTransitionAuthorization
} from "./ScientificBeliefTransitionAuthorization.js";

export interface ScientificBeliefTransitionAuthorizationResult {

    generatedAt: string;

    authorizations:
        ScientificBeliefTransitionAuthorization[];

    statistics: {

        total: number;

        authorized: number;

        notAuthorized: number;

        inconclusive: number;

        noChangeRequired: number;

        strengthenAuthorized: number;

        challengeAuthorized: number;

        confidenceMutationAuthorized: number;

        statusMutationAuthorized: number;

        requiringFurtherExperiment: number;
    };

    errors: string[];
}