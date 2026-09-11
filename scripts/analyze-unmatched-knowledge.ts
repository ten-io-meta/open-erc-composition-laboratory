import fs from "node:fs";
import path from "node:path";

import type {
    ScientificKnowledgeEvidenceMatchResult
} from "../laboratory/scientific-knowledge-evidence-matcher/ScientificKnowledgeEvidenceMatchResult.js";

const INPUT_FILE =
    path.join(
        "./scientific-knowledge-evidence-matcher-results",
        "OECL-V2-SCIENTIFIC-KNOWLEDGE-EVIDENCE-MATCHES.json"
    );

const dataset =
    JSON.parse(
        fs.readFileSync(
            INPUT_FILE,
            "utf8"
        )
    ) as ScientificKnowledgeEvidenceMatchResult;

const unmatched =
    dataset.matches.filter(
        match =>
            match.matchStatus === "UNMATCHED"
    );
    console.log("");

console.log("==============================================");
console.log("OECL V2");
console.log("UNMATCHED KNOWLEDGE ANALYSIS");
console.log("==============================================");

console.log("");

console.log(
    `Campaign: ${dataset.campaignId}`
);

console.log(
    `Generated: ${dataset.generatedAt}`
);

console.log("");

console.log(
    `Total Matches: ${dataset.statistics.total}`
);

console.log(
    `Matched: ${dataset.statistics.matched}`
);

console.log(
    `Ambiguous: ${dataset.statistics.ambiguous}`
);

console.log(
    `Unmatched: ${dataset.statistics.unmatched}`
);

console.log("");
const actionCounts =
    new Map<string, number>();

for (const match of unmatched) {

    actionCounts.set(
        match.feedbackAction,
        (actionCounts.get(
            match.feedbackAction
        ) ?? 0) + 1
    );

}

console.log(
    "UNMATCHED BY FEEDBACK ACTION"
);

console.log(
    "----------------------------"
);

for (const [action, count] of actionCounts) {

    console.log(
        `${action}: ${count}`
    );

}

console.log("");
console.log("FIRST 10 UNMATCHED");
console.log("------------------");
console.log("");

for (const match of unmatched.slice(0, 10)) {

    console.log(
        `Feedback: ${match.feedbackId}`
    );

    console.log(
        `Action: ${match.feedbackAction}`
    );

    console.log(
    "Statement:"
);

console.log(
    match.statement
);

console.log(
    `Knowledge Id: ${
        match.knowledgeId ?? "(none)"
    }`
);

console.log(
    "Explanation:"
);

console.log(
    match.explanation
);
    console.log("----------------------------------------");
    console.log("");

}
console.log("RAW FIRST UNMATCHED OBJECT");
console.log("--------------------------");

console.log(
    JSON.stringify(
        unmatched[0],
        null,
        2
    )
);

console.log("");
console.log("");
console.log("UNMATCHED STATEMENTS");
console.log("--------------------");

const statementCounts =
    new Map<string, number>();

for (const match of unmatched) {

    statementCounts.set(
        match.statement,
        (statementCounts.get(match.statement) ?? 0) + 1
    );

}

const orderedStatements =
    [...statementCounts.entries()]
        .sort(
            (a, b) => b[1] - a[1]
        );

for (const [statement, count] of orderedStatements) {

    console.log(`${count}x`);

    console.log(statement);

    console.log("");

}