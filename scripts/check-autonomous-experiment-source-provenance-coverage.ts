import fs from "node:fs/promises";


interface SourceManifestEntry {
    sourceId: string;
    path: string;
    enabled: boolean;
}


interface SourceManifest {
    manifestId: string;
    sources: SourceManifestEntry[];
}


interface SourceMetadata {
    repository?: string;
    type?: string;
    title?: string;
    location?: string;
}


function resolveRepository(
    metadata: SourceMetadata
): string | undefined {

    let repository =
        metadata.repository;

    if (
        !repository &&
        metadata.type === "GITHUB" &&
        metadata.location
    ) {

        const match =
            metadata.location.match(
                /^https?:\/\/github\.com\/([^/]+\/[^/#?]+)/
            );

        if (match?.[1]) {
            repository =
                match[1].replace(
                    /\.git$/,
                    ""
                );
        }

    }

    if (
        !repository &&
        metadata.type === "GITHUB" &&
        metadata.title &&
        /^[^/\s]+\/[^/\s]+$/.test(
            metadata.title
        )
    ) {

        repository =
            metadata.title;

    }

    return repository;

}


const manifestRaw =
    await fs.readFile(
        "./sources/manifest.json",
        "utf8"
    );

const manifest =
    JSON.parse(
        manifestRaw
    ) as SourceManifest;


const resolved:
    Array<{
        sourceId: string;
        repository: string;
        strategy:
            | "METADATA"
            | "LOCATION"
            | "TITLE";
    }> = [];

const unresolved:
    Array<{
        sourceId: string;
        reason: string;
    }> = [];


for (
    const source
    of manifest.sources ?? []
) {

    let metadataRaw: string;

    try {

        metadataRaw =
            await fs.readFile(
                source.path,
                "utf8"
            );

    }
    catch {

        unresolved.push({
            sourceId:
                source.sourceId,

            reason:
                "SOURCE_FILE_MISSING"
        });

        continue;

    }

    const metadata =
        JSON.parse(
            metadataRaw
        ) as SourceMetadata;


    const repository =
        resolveRepository(
            metadata
        );


    if (!repository) {

        unresolved.push({
            sourceId:
                source.sourceId,

            reason:
                metadata.type === "GITHUB"
                    ? "GITHUB_REPOSITORY_UNRESOLVED"
                    : "NON_GITHUB_SOURCE"
        });

        continue;

    }


    let strategy:
        | "METADATA"
        | "LOCATION"
        | "TITLE";


    if (metadata.repository) {

        strategy =
            "METADATA";

    }
    else if (
        metadata.type === "GITHUB" &&
        metadata.location &&
        /^https?:\/\/github\.com\//.test(
            metadata.location
        )
    ) {

        strategy =
            "LOCATION";

    }
    else {

        strategy =
            "TITLE";

    }


    resolved.push({
        sourceId:
            source.sourceId,

        repository,
        strategy
    });

}


const slither =
    resolved.find(
        item =>
            item.sourceId ===
            "GITHUB-CRYTIC-SLITHER"
    );


if (!slither) {

    throw new Error(
        "GITHUB-CRYTIC-SLITHER did not resolve to a repository."
    );

}


if (
    slither.repository !==
    "crytic/slither"
) {

    throw new Error(
        `Expected GITHUB-CRYTIC-SLITHER -> crytic/slither but got ${slither.repository}.`
    );

}


if (
    slither.strategy !==
    "LOCATION"
) {

    throw new Error(
        `Expected Slither to resolve through LOCATION fallback but got ${slither.strategy}.`
    );

}


console.log(
    "AUTONOMOUS SOURCE PROVENANCE COVERAGE: PASS"
);

console.log(
    ""
);

console.log(
    "RESOLVED REPOSITORIES:"
);

for (
    const item
    of resolved
) {

    console.log(
        `${item.sourceId} -> ${item.repository} [${item.strategy}]`
    );

}


console.log(
    ""
);

console.log(
    "UNRESOLVED SOURCES:"
);

for (
    const item
    of unresolved
) {

    console.log(
        `${item.sourceId} -> ${item.reason}`
    );

}


console.log(
    ""
);

console.log(
    `RESOLVED: ${resolved.length}`
);

console.log(
    `UNRESOLVED: ${unresolved.length}`
);

console.log(
    "GITHUB-CRYTIC-SLITHER -> crytic/slither: PASS"
);