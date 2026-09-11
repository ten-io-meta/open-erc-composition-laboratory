import {
    readFile,
    rm,
    writeFile
} from "fs/promises";

import {
    GitHubBundleBuilder
} from "../laboratory/github-adapter/GitHubBundleBuilder.js";

import {
    SourceBundleWriter
} from "../laboratory/source-adapters/SourceBundleWriter.js";

import type {
    GitHubRepositoryMetadata
} from "../laboratory/github-adapter/GitHubRepositoryMetadata.js";

async function main(): Promise<void> {

    const commitSha =
        "0123456789abcdef0123456789abcdef01234567";

    const repository:
        GitHubRepositoryMetadata & {
            commitSha: string;
            worktreeClean: boolean;
        } = {
            owner:
                "oecl-provenance-test",

            repo:
                "revision-fixture",

            url:
                "https://github.com/oecl-provenance-test/revision-fixture",

            localPath:
                "./external/github/oecl-provenance-test/revision-fixture",

            commitSha,

            worktreeClean:
                true
        };

    const builder =
        new GitHubBundleBuilder();

    const built =
        builder.build({
            repository,
            protocols: [
                "ERC8004"
            ],
            capabilities: [
                "Testing"
            ],
            claims: [
                "Controlled revision provenance fixture."
            ],
            evidence: {
                quality:
                    "HIGH",

                confidenceWeight:
                    0.85,

                reproducible:
                    true,

                hasImplementation:
                    true,

                hasTests:
                    true,

                hasInvariants:
                    false,

                hasCoverage:
                    false,

                hasCitation:
                    false,

                observations: [
                    "Controlled provenance fixture."
                ]
            }
        }) as any;

    const builderPreservedCommit =
        built.commitSha === commitSha;

    const builderPreservedWorktreeState =
        built.worktreeClean === true;

    /*
     * Inject the known revision and clean-state
     * directly so the writer boundary is tested
     * independently from the builder boundary.
     */

    const cleanWriterBundle = {
        ...built,

        localPath:
            repository.localPath,

        toolchain:
            "UNKNOWN",

        executableTargets:
            [],

        commitSha,

        worktreeClean:
            true
    } as any;

    const manifestPath =
        "./sources/manifest.json";

    const bundlePath =
        `./sources/research/${built.sourceId}`;

    const manifestBefore =
        await readFile(
            manifestPath,
            "utf8"
        );

    let cleanSourceCommitPreserved =
        false;

    let cleanSourceWorktreeStatePreserved =
        false;

    let cleanEvidenceCommitPreserved =
        false;

    let cleanEvidenceWorktreeStatePreserved =
        false;

    let cleanReproducibilityBackedByRevision =
        false;

    let dirtySourceCommitPreserved =
        false;

    let dirtySourceWorktreeStatePreserved =
        false;

    let dirtyEvidenceCommitPreserved =
        false;

    let dirtyEvidenceWorktreeStatePreserved =
        false;

    let dirtyReproducibilityRejected =
        false;

    try {

        /*
         * CLEAN WORKTREE
         */

        await new SourceBundleWriter().write(
            cleanWriterBundle
        );

        const cleanSource =
            JSON.parse(
                await readFile(
                    `${bundlePath}/source.json`,
                    "utf8"
                )
            );

        const cleanEvidence =
            JSON.parse(
                await readFile(
                    `${bundlePath}/evidence.json`,
                    "utf8"
                )
            );

        cleanSourceCommitPreserved =
            cleanSource.commitSha === commitSha;

        cleanSourceWorktreeStatePreserved =
            cleanSource.worktreeClean === true;

        cleanEvidenceCommitPreserved =
            cleanEvidence.commitSha === commitSha;

        cleanEvidenceWorktreeStatePreserved =
            cleanEvidence.worktreeClean === true;

        cleanReproducibilityBackedByRevision =
            cleanEvidence.reproducible === true &&
            cleanEvidence.commitSha === commitSha &&
            cleanEvidence.worktreeClean === true;

        /*
         * DIRTY WORKTREE
         *
         * HEAD remains identical, but the scanned
         * filesystem can differ from that immutable
         * revision. Therefore reproducible must be
         * false.
         */

        const dirtyWriterBundle = {
            ...cleanWriterBundle,

            worktreeClean:
                false
        };

        await new SourceBundleWriter().write(
            dirtyWriterBundle
        );

        const dirtySource =
            JSON.parse(
                await readFile(
                    `${bundlePath}/source.json`,
                    "utf8"
                )
            );

        const dirtyEvidence =
            JSON.parse(
                await readFile(
                    `${bundlePath}/evidence.json`,
                    "utf8"
                )
            );

        dirtySourceCommitPreserved =
            dirtySource.commitSha === commitSha;

        dirtySourceWorktreeStatePreserved =
            dirtySource.worktreeClean === false;

        dirtyEvidenceCommitPreserved =
            dirtyEvidence.commitSha === commitSha;

        dirtyEvidenceWorktreeStatePreserved =
            dirtyEvidence.worktreeClean === false;

        dirtyReproducibilityRejected =
            dirtyEvidence.reproducible === false;

    } finally {

        await writeFile(
            manifestPath,
            manifestBefore,
            "utf8"
        );

        await rm(
            bundlePath,
            {
                recursive: true,
                force: true
            }
        );
    }

    const pass =
        builderPreservedCommit &&
        builderPreservedWorktreeState &&
        cleanSourceCommitPreserved &&
        cleanSourceWorktreeStatePreserved &&
        cleanEvidenceCommitPreserved &&
        cleanEvidenceWorktreeStatePreserved &&
        cleanReproducibilityBackedByRevision &&
        dirtySourceCommitPreserved &&
        dirtySourceWorktreeStatePreserved &&
        dirtyEvidenceCommitPreserved &&
        dirtyEvidenceWorktreeStatePreserved &&
        dirtyReproducibilityRejected;

    console.log("");
    console.log(
        "GITHUB REPOSITORY REVISION PROVENANCE"
    );
    console.log(
        "-------------------------------------"
    );

    console.log(
        `BUILDER PRESERVED COMMIT: ${builderPreservedCommit}`
    );

    console.log(
        `BUILDER PRESERVED WORKTREE STATE: ${builderPreservedWorktreeState}`
    );

    console.log("");
    console.log(
        "CLEAN WORKTREE"
    );

    console.log(
        `SOURCE PRESERVED COMMIT: ${cleanSourceCommitPreserved}`
    );

    console.log(
        `SOURCE PRESERVED WORKTREE STATE: ${cleanSourceWorktreeStatePreserved}`
    );

    console.log(
        `EVIDENCE PRESERVED COMMIT: ${cleanEvidenceCommitPreserved}`
    );

    console.log(
        `EVIDENCE PRESERVED WORKTREE STATE: ${cleanEvidenceWorktreeStatePreserved}`
    );

    console.log(
        `REPRODUCIBILITY BACKED BY REVISION: ${cleanReproducibilityBackedByRevision}`
    );

    console.log("");
    console.log(
        "DIRTY WORKTREE"
    );

    console.log(
        `SOURCE PRESERVED COMMIT: ${dirtySourceCommitPreserved}`
    );

    console.log(
        `SOURCE PRESERVED WORKTREE STATE: ${dirtySourceWorktreeStatePreserved}`
    );

    console.log(
        `EVIDENCE PRESERVED COMMIT: ${dirtyEvidenceCommitPreserved}`
    );

    console.log(
        `EVIDENCE PRESERVED WORKTREE STATE: ${dirtyEvidenceWorktreeStatePreserved}`
    );

    console.log(
        `REPRODUCIBILITY REJECTED: ${dirtyReproducibilityRejected}`
    );

    console.log("");
    console.log(
        `RESULT: ${pass ? "PASS" : "FAIL"}`
    );

    if (!pass) {
        process.exitCode = 1;
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});