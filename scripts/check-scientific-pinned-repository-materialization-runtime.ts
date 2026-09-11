import assert from "node:assert/strict";

import {
    mkdtemp,
    mkdir,
    rm,
    writeFile
} from "node:fs/promises";

import {
    join
} from "node:path";

import {
    tmpdir
} from "node:os";

import {
    execFile
} from "node:child_process";

import {
    promisify
} from "node:util";

import {
    ScientificPinnedRepositoryMaterializer
} from "../laboratory/scientific-pinned-repository-materialization/ScientificPinnedRepositoryMaterializer.js";


const execFileAsync =
    promisify(
        execFile
    );


let pass =
    0;

let fail =
    0;


async function check(
    name: string,
    fn: () => Promise<void> | void
): Promise<void> {

    try {

        await fn();

        console.log(
            `${name}: PASS`
        );

        pass++;

    } catch (error) {

        console.log(
            `${name}: FAIL`
        );

        console.log(
            error instanceof Error
                ? error.message
                : String(error)
        );

        fail++;

    }

}


async function git(
    repositoryPath: string,
    args: string[]
): Promise<string> {

    const {
        stdout
    } =
        await execFileAsync(
            "git",
            [
                "-C",
                repositoryPath,
                ...args
            ],
            {
                encoding: "utf8"
            }
        );

    return stdout.trim();

}


console.log("");
console.log(
    "SCIENTIFIC PINNED REPOSITORY MATERIALIZATION"
);
console.log(
    "--------------------------------------------"
);


const temporaryRoot =
    await mkdtemp(
        join(
            tmpdir(),
            "oecl-pinned-materialization-"
        )
    );


try {

    const originPath =
        join(
            temporaryRoot,
            "origin"
        );

    const materializationRoot =
        join(
            temporaryRoot,
            "materialized"
        );


    await mkdir(
        originPath,
        {
            recursive: true
        }
    );


    await execFileAsync(
        "git",
        [
            "init",
            originPath
        ]
    );


    await git(
        originPath,
        [
            "config",
            "user.email",
            "oecl@example.invalid"
        ]
    );

    await git(
        originPath,
        [
            "config",
            "user.name",
            "OECL Runtime Test"
        ]
    );


    const payloadPath =
        join(
            originPath,
            "payload.txt"
        );


    await writeFile(
        payloadPath,
        "REVISION-ONE\n",
        "utf8"
    );

    await git(
        originPath,
        [
            "add",
            "payload.txt"
        ]
    );

    await git(
        originPath,
        [
            "commit",
            "-m",
            "revision one"
        ]
    );


    const revisionOne =
        await git(
            originPath,
            [
                "rev-parse",
                "HEAD"
            ]
        );


    await writeFile(
        payloadPath,
        "REVISION-TWO\n",
        "utf8"
    );

    await git(
        originPath,
        [
            "add",
            "payload.txt"
        ]
    );

    await git(
        originPath,
        [
            "commit",
            "-m",
            "revision two"
        ]
    );


    const revisionTwo =
        await git(
            originPath,
            [
                "rev-parse",
                "HEAD"
            ]
        );


    assert.notEqual(
        revisionOne,
        revisionTwo
    );


    const materializer =
        new ScientificPinnedRepositoryMaterializer();


    const result =
        await materializer.materialize(
            {
                repository:
                    "fixture/pinned-repository",

                requiredRevision:
                    revisionOne,

                remoteUrl:
                    originPath,

                workspaceRoot:
                    materializationRoot
            }
        );


    await check(
        "MATERIALIZER CHECKS OUT EXACT REQUIRED REVISION",
        async () => {

            assert.equal(
                result.status,
                "MATERIALIZED"
            );

            assert.ok(
                result.localPath
            );

            assert.equal(
                result.observedRevision,
                revisionOne
            );

            const actualHead =
                await git(
                    result.localPath!,
                    [
                        "rev-parse",
                        "HEAD"
                    ]
                );

            assert.equal(
                actualHead,
                revisionOne
            );

            assert.notEqual(
                actualHead,
                revisionTwo
            );

        }
    );


    await check(
        "PINNED MATERIALIZATION PRODUCES CLEAN ISOLATED WORKTREE",
        async () => {

            assert.ok(
                result.localPath
            );

            assert.equal(
                result.worktreeClean,
                true
            );

            const status =
                await git(
                    result.localPath!,
                    [
                        "status",
                        "--porcelain"
                    ]
                );

            assert.equal(
                status,
                ""
            );

            assert.equal(
                result.localPath ===
                    originPath,
                false
            );

        }
    );


    const impossibleRevision =
        "0000000000000000000000000000000000000000";


    const rejected =
        await materializer.materialize(
            {
                repository:
                    "fixture/pinned-repository",

                requiredRevision:
                    impossibleRevision,

                remoteUrl:
                    originPath,

                workspaceRoot:
                    materializationRoot
            }
        );


    await check(
        "MISSING REQUIRED REVISION FAILS CLOSED WITHOUT HEAD FALLBACK",
        async () => {

            assert.equal(
                rejected.status,
                "REJECTED"
            );

            assert.equal(
                rejected.localPath,
                null
            );

            assert.notEqual(
                rejected.observedRevision,
                revisionTwo
            );

            assert.ok(
                rejected.errors.length >
                0
            );

        }
    );

} finally {

    await rm(
        temporaryRoot,
        {
            recursive: true,
            force: true
        }
    );

}


console.log("");
console.log(
    `PASS: ${pass}`
);
console.log(
    `FAIL: ${fail}`
);
console.log(
    `RESULT: ${
        fail === 0
            ? "PASS"
            : "FAIL"
    }`
);


if (
    fail >
    0
) {

    process.exitCode =
        1;

}
