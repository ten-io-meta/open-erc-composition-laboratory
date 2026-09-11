import type {
    ScientificCompositionExecutionRequirement
} from "../scientific-composition-experiment/ScientificCompositionExecutionRequirement.js";

import type {
    ScientificJointContractHarnessRecipeRegistration,
    ScientificJointContractHarnessRecipeParticipantBinding
} from "./ScientificJointContractHarnessRecipeRegistration.js";

import type {
    ScientificJointContractHarnessRecipeSelection
} from "./ScientificJointContractHarnessRecipeSelection.js";


export class ScientificJointContractHarnessRecipeSelector {

    select(
        requirement:
            ScientificCompositionExecutionRequirement,
        registrations:
            ScientificJointContractHarnessRecipeRegistration[]
    ): ScientificJointContractHarnessRecipeSelection {

        /*
         * Recipe selection is strictly post-discovery.
         *
         * This layer is allowed to answer only:
         *
         * "Can exactly one registered operational recipe execute the
         * already-existing scientific composition requirement?"
         *
         * It cannot create candidates, alter candidate identity,
         * introduce confidence or establish scientific polarity.
         */
        const matchingRegistrations =
            registrations.filter(
                registration =>
                    this.matches(
                        requirement,
                        registration
                    )
            );


        const matchingRegistrationIds =
            matchingRegistrations.map(
                registration =>
                    registration.registrationId
            );


        if (
            matchingRegistrations.length ===
            0
        ) {

            return {

                status:
                    "NO_MATCH",

                selectedRegistration:
                    null,

                matchingRegistrationIds:
                    [],

                reasons: [
                    "No registered joint contract harness recipe exactly matches the discovered composition requirement."
                ]

            };

        }


        if (
            matchingRegistrations.length >
            1
        ) {

            /*
             * Never pick by insertion order, name, confidence,
             * specificity or any other hidden heuristic.
             */
            return {

                status:
                    "AMBIGUOUS",

                selectedRegistration:
                    null,

                matchingRegistrationIds,

                reasons: [
                    "Multiple registered joint contract harness recipes exactly match the discovered composition requirement."
                ]

            };

        }


        return {

            status:
                "SELECTED",

            selectedRegistration:
                matchingRegistrations[0],

            matchingRegistrationIds,

            reasons: [
                "Exactly one registered joint contract harness recipe matches the discovered composition requirement."
            ]

        };

    }


    private matches(
        requirement:
            ScientificCompositionExecutionRequirement,
        registration:
            ScientificJointContractHarnessRecipeRegistration
    ): boolean {

        const candidate =
            requirement.candidate;

        const applicability =
            registration.applicability;


        if (
            registration.registrationId
                .trim()
                .length ===
            0
        ) {

            return false;

        }


        /*
         * Composition mechanism is exact.
         */
        if (
            candidate.mechanism !==
            applicability.mechanism
        ) {

            return false;

        }


        /*
         * Foundation identity is exact as well.
         *
         * Omitting foundationProtocolId from a registration is not a
         * wildcard. Absence must match absence.
         */
        if (
            (
                candidate.foundationProtocolId ??
                null
            ) !==
            (
                applicability.foundationProtocolId ??
                null
            )
        ) {

            return false;

        }


        /*
         * Candidate participant orientation is preserved.
         *
         * A recipe registered for A=x, B=y cannot silently execute
         * candidate A=y, B=x.
         */
        if (
            candidate.participantA.kind !==
                applicability
                    .participantA
                    .participantKind ||
            candidate.participantA.id !==
                applicability
                    .participantA
                    .participantId
        ) {

            return false;

        }


        if (
            candidate.participantB.kind !==
                applicability
                    .participantB
                    .participantKind ||
            candidate.participantB.id !==
                applicability
                    .participantB
                    .participantId
        ) {

            return false;

        }


        /*
         * Operational source identity must also be demonstrated by
         * the execution requirement itself.
         *
         * A matching protocol ID without the exact repository and
         * pinned revision is insufficient.
         */
        if (
            !this.hasExactParticipantSource(
                requirement,
                "A",
                applicability.participantA
            )
        ) {

            return false;

        }


        if (
            !this.hasExactParticipantSource(
                requirement,
                "B",
                applicability.participantB
            )
        ) {

            return false;

        }


        return true;

    }


    private hasExactParticipantSource(
        requirement:
            ScientificCompositionExecutionRequirement,
        participantSide:
            "A" | "B",
        binding:
            ScientificJointContractHarnessRecipeParticipantBinding
    ): boolean {

        return requirement
            .participantSources
            .some(
                source => {

                    if (
                        source.participantSide !==
                        participantSide
                    ) {

                        return false;

                    }


                    if (
                        source.participantKind !==
                        binding.participantKind
                    ) {

                        return false;

                    }


                    if (
                        source.participantId !==
                        binding.participantId
                    ) {

                        return false;

                    }


                    if (
                        source.repository !==
                        binding.repository
                    ) {

                        return false;

                    }


                    /*
                     * Git object IDs are hexadecimal. Case has no
                     * semantic meaning, but the complete pinned
                     * revision must otherwise match exactly.
                     */
                    if (
                        source.sourceRevision
                            .trim()
                            .toLowerCase() !==
                        binding.sourceRevision
                            .trim()
                            .toLowerCase()
                    ) {

                        return false;

                    }


                    return true;

                }
            );

    }

}
