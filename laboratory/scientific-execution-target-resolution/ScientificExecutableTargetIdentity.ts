export interface ScientificExecutableTargetIdentity {

    repository: string;

    filePath: string;

    selector: string;

    type:
        | "TEST"
        | "INVARIANT";

    framework:
        | "FOUNDRY"
        | "HARDHAT"
        | "UNKNOWN";

}