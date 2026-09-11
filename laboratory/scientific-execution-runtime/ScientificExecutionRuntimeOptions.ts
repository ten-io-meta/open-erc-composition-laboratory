import type {
    ScientificJointContractHarnessRecipeRegistration
} from "../scientific-joint-contract-harness/ScientificJointContractHarnessRecipeRegistration.js";


export interface ScientificExecutionRuntimeOptions {

    /*
     * When either composition workspace option is supplied,
     * COMPOSITION_EXECUTION advances from requirement admission
     * to physical bilateral workspace materialization.
     */
    compositionWorkspaceRoot?:
        string;

    compositionRemoteUrls?:
        Record<
            string,
            string
        >;

    /*
     * Operational recipes are supplied only after scientific
     * discovery has already produced a composition requirement.
     *
     * The runtime does not own or discover these registrations.
     */
    compositionRecipeRegistrations?:
        ScientificJointContractHarnessRecipeRegistration[];

}
