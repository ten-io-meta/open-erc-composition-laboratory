import {
    GitHubFileScanner
} from "../laboratory/github-adapter/GitHubFileScanner.js";

import {
    GitHubStructureAnalyzer
} from "../laboratory/github-adapter/GitHubStructureAnalyzer.js";

import {
    GitHubExecutableTargetExtractor
} from "../laboratory/github-adapter/GitHubExecutableTargetExtractor.js";


async function main() {

    const scanner =
        new GitHubFileScanner();

    const analyzer =
        new GitHubStructureAnalyzer();

    const extractor =
        new GitHubExecutableTargetExtractor();


    const files =
        await scanner.scan(
            "./external/github/Vectorized/solady"
        );


    const structure =
        analyzer.analyze(
            files
        );


    const targets =
        extractor.extract(
            structure
        );


    const target =
        targets.find(
            target =>
                target.selector ===
                "testPRNGNext"
        );


    console.log("");
    console.log(
        "=== DIRECT EXTRACTOR TEST ==="
    );

    console.log(
        "Targets:",
        targets.length
    );

    console.log(
        "Found:",
        Boolean(target)
    );


    if (target) {

        console.log(
            "Selector:",
            target.selector
        );

        console.log(
            "Length:",
            target.semanticContext.length
        );

        console.log("");
        console.log(
            target.semanticContext
        );

    }

}


main();
