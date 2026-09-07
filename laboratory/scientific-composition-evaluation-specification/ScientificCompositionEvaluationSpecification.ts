import type {
    ScientificCompositionCandidate,
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

    /*
     * Complete structural snapshot of the composition candidate
     * from which this evaluation specification was derived.
     *
     * Optional temporarily for compatibility with manually
     * constructed legacy fixtures. The scientific evaluation
     * engine emits it for every generated specification.
     */
    candidateSnapshot?:
        ScientificCompositionCandidate;

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
