import type {
    ScientificRevision
} from "./ScientificRevision.js";

export interface ScientificRevisionResult {

    generatedAt: string;

    campaignId: string;

    revisions:
        ScientificRevision[];

    statistics: {

        total: number;

        keep: number;

        review: number;

        weaken: number;

        challenge: number;

        retest: number;

        refuteCandidate: number;

        requiringExperiment: number;

        requiringHumanReview: number;

    };

    errors: string[];

}