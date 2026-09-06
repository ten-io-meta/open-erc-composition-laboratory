export interface ScientificSourceObservationLocator {

    /*
     * Canonical location of the research source.
     *
     * For a GitHub source this is normally the repository URL.
     * Other source adapters may use another stable source location.
     */
    sourceLocation: string;

    /*
     * Path inside the source when the observation comes from
     * a concrete file.
     */
    filePath?: string;

    /*
     * Optional source line boundaries.
     *
     * These identify where the raw observation was obtained.
     * They are provenance only and carry no semantic meaning.
     */
    startLine?: number;

    endLine?: number;

}