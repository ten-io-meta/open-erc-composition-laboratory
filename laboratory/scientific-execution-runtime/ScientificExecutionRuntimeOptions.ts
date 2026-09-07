export interface ScientificExecutionRuntimeOptions {

    /*
     * When either composition workspace option is supplied,
     * COMPOSITION_EXECUTION advances from requirement admission
     * to physical bilateral workspace materialization.
     *
     * This still does not execute participant contracts.
     */
    compositionWorkspaceRoot?:
        string;

    /*
     * Optional repository -> remote URL override.
     *
     * Scientific regressions use local Git repositories here.
     * Real GitHub execution may omit this map and allow the pinned
     * repository materializer to derive the GitHub remote URL from
     * the repository identity.
     */
    compositionRemoteUrls?:
        Record<
            string,
            string
        >;

}
