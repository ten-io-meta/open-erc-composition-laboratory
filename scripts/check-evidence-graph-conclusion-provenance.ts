import {
    EvidenceGraphEngine
} from "../laboratory/evidence-graph/EvidenceGraphEngine.js";

function assert(
    condition: boolean,
    message: string
): void {

    if (!condition) {
        throw new Error(
            `FAIL: ${message}`
        );
    }

    console.log(
        `PASS: ${message}`
    );
}

const conclusionId =
    "CONCLUSION-CONTROLLED-00001";

const sourceIds = [
    "SOURCE-CONTROLLED-A",
    "SOURCE-CONTROLLED-B"
];

const conclusions = {
    conclusions: [
        {
            conclusionId,

            sourcePatternId:
                "PATTERN-CONTROLLED-00001",

            sourcePatternRelation:
                "RESERVATION:CONSTRAINS:ACCOUNTING",

            subject:
                "RESERVATION",

            relation:
                "CONSTRAINS",

            object:
                "ACCOUNTING",

            statement:
                "RESERVATION appears to CONSTRAINS ACCOUNTING across 2 observed source identities.",

            supportedBy:
                [...sourceIds],

            confidence:
                80,

            status:
                "SUPPORTED",

            evidence:
                [
                    "EVIDENCE-CONTROLLED-00001"
                ]
        }
    ]
};

const result =
    new EvidenceGraphEngine().build(
        conclusions
    );

assert(
    result.edges.length === 1,
    "one evidence edge was created"
);

const edge =
    result.edges[0];

assert(
    edge.sourceConclusionId ===
        conclusionId,
    "evidence edge preserves the exact source conclusion ID"
);

assert(
    edge.sources.length === 2,
    "evidence edge preserves both source identities"
);

assert(
    edge.sources.includes(
        "SOURCE-CONTROLLED-A"
    ),
    "first source identity is preserved"
);

assert(
    edge.sources.includes(
        "SOURCE-CONTROLLED-B"
    ),
    "second source identity is preserved"
);

assert(
    edge.from ===
        "RESERVATION",
    "evidence edge preserves relation subject"
);

assert(
    edge.relation ===
        "CONSTRAINS",
    "evidence edge preserves relation predicate"
);

assert(
    edge.to ===
        "ACCOUNTING",
    "evidence edge preserves relation object"
);

console.log(
    "\nPHASE 10.4C CONTROLLED CONCLUSION PROVENANCE REGRESSION PASSED"
);