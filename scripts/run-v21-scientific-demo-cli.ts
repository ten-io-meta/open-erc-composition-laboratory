import {
    readFileSync
} from "node:fs";

import {
    resolve
} from "node:path";

import {
    ScientificDemoCliBundleEngine
} from "../laboratory/scientific-demo-cli/ScientificDemoCliBundleEngine.js";

import {
    ScientificDemoCliRenderer
} from "../laboratory/scientific-demo-cli/ScientificDemoCliRenderer.js";


const args =
    process.argv.slice(2);

function valueAfter(flag: string): string | null {

    const index =
        args.indexOf(flag);

    if (
        index < 0 ||
        index + 1 >= args.length
    ) {
        return null;
    }

    return args[index + 1];
}


if (args.includes("--help")) {
    console.log(
        "Usage: npx tsx scripts/run-v21-scientific-demo-cli.ts " +
        "--input <bundle.json> --format <text|json>"
    );

    process.exit(0);
}


const inputPath =
    valueAfter("--input");

const format =
    valueAfter("--format") ?? "text";


if (inputPath === null) {
    throw new Error(
        "CLI requires --input <bundle.json>."
    );
}

if (
    format !== "text" &&
    format !== "json"
) {
    throw new Error(
        "CLI --format must be text or json."
    );
}


const inputText =
    readFileSync(
        resolve(inputPath),
        "utf8"
    ).replace(/^\uFEFF/, "");


const raw =
    JSON.parse(inputText) as any;


if (
    raw === null ||
    typeof raw !== "object" ||
    raw.finalReport === undefined ||
    !Array.isArray(raw.candidates)
) {
    throw new Error(
        "CLI input is not a scientific demo bundle."
    );
}


for (const candidate of raw.candidates) {

    if (
        candidate === null ||
        typeof candidate !== "object" ||
        candidate.dossier === undefined ||
        candidate.explanation === undefined
    ) {
        throw new Error(
            "CLI candidate entry is incomplete."
        );
    }
}


const projected =
    new ScientificDemoCliBundleEngine()
        .project({
            finalReport: raw.finalReport,
            candidates: raw.candidates
        });


if (projected.bundle === null) {
    throw new Error(
        projected.errors.join("\n")
    );
}


const rendered =
    new ScientificDemoCliRenderer()
        .render(projected.bundle);


process.stdout.write(
    format === "json"
        ? `${rendered.json}\n`
        : `${rendered.text}\n`
);
