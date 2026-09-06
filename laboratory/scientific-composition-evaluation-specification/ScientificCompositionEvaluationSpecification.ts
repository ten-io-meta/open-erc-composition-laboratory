import type {
    ScientificCompositionMechanism
} from "../scientific-cross-protocol-composition/ScientificCompositionCandidate.js";

import type {
    ScientificCompositionConstraint
} from "./ScientificCompositionConstraint.js";


export type ScientificCompositionEvaluationSpecificationStatus =
    | "READY"
    | "INSUFFICIENT_EVIDENCE";


export interface ScientificCompositionEvaluationSpecification {

    specificationId: string;

    candidateId: string;

    mechanism:
        ScientificCompositionMechanism;

    status:
        ScientificCompositionEvaluationSpecificationStatus;

    sourceIds: string[];

    targetEvidenceIds: string[];

    constraints:
        ScientificCompositionConstraint[];

    participantAConstraintIds: string[];

    participantBConstraintIds: string[];

    unresolvedGuardFactIds: string[];

    scientificCriteria:
        | {
            relation:
                "PRESERVES_OBSERVED_CONSTRAINTS";

            support: {
                expectedPolarity:
                    "SUPPORT";

                condition:
                    "ALL_OBSERVED_PARTICIPANT_CONSTRAINTS_PRESERVED";
            };

            challenge: {
                expectedPolarity:
                    "CHALLENGE";

                condition:
                    "ANY_OBSERVED_PARTICIPANT_CONSTRAINT_VIOLATED";
            };

            inconclusive: {
                whenNoScientificPolarity:
                    true;
            };
        }
        | null;

}
