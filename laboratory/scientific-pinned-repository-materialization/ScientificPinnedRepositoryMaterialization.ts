export type ScientificPinnedRepositoryMaterializationStatus =
    | "MATERIALIZED"
    | "REJECTED";


export interface ScientificPinnedRepositoryMaterialization {

    repository: string;

    requiredRevision: string;

    remoteUrl: string;

    localPath:
        string | null;

    observedRevision:
        string | null;

    worktreeClean:
        boolean | null;

    status:
        ScientificPinnedRepositoryMaterializationStatus;

    errors:
        string[];

}
