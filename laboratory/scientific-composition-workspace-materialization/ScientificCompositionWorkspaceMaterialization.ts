export type ScientificCompositionWorkspaceMaterializationStatus =
    | "MATERIALIZED"
    | "REJECTED";


export interface ScientificCompositionWorkspaceSourceMaterialization {

    participantSide:
        "A" | "B";

    participantKind:
        string;

    participantId:
        string;

    sourceId:
        string;

    repository:
        string;

    requiredRevision:
        string;

    localPath:
        string;

    observedRevision:
        string;

    worktreeClean:
        true;

}


export interface ScientificCompositionWorkspaceMaterialization {

    requirementId:
        string;

    candidateId:
        string;

    workspacePath:
        string | null;

    sourceMaterializations:
        ScientificCompositionWorkspaceSourceMaterialization[];

    status:
        ScientificCompositionWorkspaceMaterializationStatus;

    errors:
        string[];

}
