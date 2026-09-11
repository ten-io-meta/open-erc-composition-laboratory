import {
    ScientificConceptAbstractionEngine
} from "../laboratory/scientific-concept-abstraction/ScientificConceptAbstractionEngine.js";

import type {
    ScientificSemanticDerivationResult
} from "../laboratory/scientific-semantic-derivation/ScientificSemanticDerivationResult.js";


const sourceId =
    "GITHUB-EXAMPLE-CONCEPT-SOURCE";

const sourceRevision =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const sourceModelId =
    `SCIENTIFIC-SEMANTIC-${sourceId}-${sourceRevision}`;


const validDerivation:
    ScientificSemanticDerivationResult = {

    sourceId,

    sourceRevision,

    model: {

        modelId:
            sourceModelId,

        generatedAt:
            "2026-01-01T00:00:00.000Z",

        capabilities: [
            {
                capabilityId:
                    "LEXICAL-RESERVE-VALUE",

                label:
                    "reserve value",

                protocols:
                    [],

                evidence: [
                    "FACT-RESERVE-VALUE-1",
                    "FACT-RESERVE-VALUE-1"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-RELEASE-VALUE",

                label:
                    "release value",

                protocols:
                    [],

                evidence: [
                    "FACT-RELEASE-VALUE-1"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-APPROVE-AGENT",

                label:
                    "approve agent",

                protocols:
                    [],

                evidence: [
                    "FACT-APPROVE-AGENT"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-REVOKE-AGENT",

                label:
                    "revoke agent",

                protocols:
                    [],

                evidence: [
                    "FACT-REVOKE-AGENT"
                ]
            },
            {
                capabilityId:
                    "LEXICAL-ONLY-ONCE",

                label:
                    "single",

                protocols:
                    [],

                /*
                 * Multiple facts inside one lexical capability
                 * must not be mistaken for multiple capabilities.
                 */
                evidence: [
                    "FACT-SINGLE-1",
                    "FACT-SINGLE-2"
                ]
            }
        ],

        relationships:
            []

    },

    errors:
        []

};


const engine =
    new ScientificConceptAbstractionEngine();


const result =
    engine.abstract(
        validDerivation
    );


const valueConcept =
    result.concepts.find(
        concept =>
            concept.conceptId ===
            "CONCEPT-VALUE"
    );


const agentConcept =
    result.concepts.find(
        concept =>
            concept.conceptId ===
            "CONCEPT-AGENT"
    );


const upstreamFailure =
    engine.abstract({
        ...validDerivation,

        errors: [
            "Controlled upstream scientific failure."
        ]
    });


const nonLexicalFailure =
    engine.abstract({
        ...validDerivation,

        model: {
            ...validDerivation.model,

            capabilities: [
                ...validDerivation.model.capabilities,
                {
                    capabilityId:
                        "SEMANTIC-INVENTED-CAPABILITY",

                    label:
                        "invented",

                    protocols:
                        [],

                    evidence: [
                        "FACT-INVENTED"
                    ]
                }
            ]
        }
    });


const protocolOwnershipFailure =
    engine.abstract({
        ...validDerivation,

        model: {
            ...validDerivation.model,

            capabilities:
                validDerivation
                    .model
                    .capabilities
                    .map(
                        capability =>
                            capability.capabilityId ===
                                "LEXICAL-RESERVE-VALUE"
                                ? {
                                    ...capability,

                                    protocols: [
                                        "INVENTED-PROTOCOL"
                                    ]
                                }
                                : capability
                    )
        }
    });


const missingEvidenceFailure =
    engine.abstract({
        ...validDerivation,

        model: {
            ...validDerivation.model,

            capabilities:
                validDerivation
                    .model
                    .capabilities
                    .map(
                        capability =>
                            capability.capabilityId ===
                                "LEXICAL-RELEASE-VALUE"
                                ? {
                                    ...capability,

                                    evidence:
                                        []
                                }
                                : capability
                    )
        }
    });


const checks: Array<{
    name: string;
    passed: boolean;
}> = [
    {
        name:
            "RUNTIME ABSTRACTION PRESERVES SOURCE ID",
        passed:
            result.sourceId ===
            sourceId
    },
    {
        name:
            "RUNTIME ABSTRACTION PRESERVES SOURCE REVISION",
        passed:
            result.sourceRevision ===
            sourceRevision
    },
    {
        name:
            "RUNTIME ABSTRACTION PRESERVES SOURCE MODEL ID",
        passed:
            result.sourceModelId ===
            sourceModelId
    },
    {
        name:
            "VALID ABSTRACTION HAS NO ERRORS",
        passed:
            result.errors.length ===
            0
    },
    {
        name:
            "ONLY RECURRENT TOKENS BECOME CONCEPTS",
        passed:
            result.concepts.length ===
            2
    },
    {
        name:
            "VALUE BECOMES RECURRENT CONCEPT",
        passed:
            valueConcept !==
            undefined
    },
    {
        name:
            "VALUE CONCEPT PRESERVES OBSERVED LABEL",
        passed:
            valueConcept?.label ===
            "value"
    },
    {
        name:
            "VALUE CONCEPT REQUIRES TWO DISTINCT LEXICAL CAPABILITIES",
        passed:
            valueConcept
                ?.lexicalCapabilityIds
                .length ===
            2
    },
    {
        name:
            "VALUE CONCEPT PRESERVES RESERVE CAPABILITY",
        passed:
            valueConcept
                ?.lexicalCapabilityIds
                .includes(
                    "LEXICAL-RESERVE-VALUE"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES RELEASE CAPABILITY",
        passed:
            valueConcept
                ?.lexicalCapabilityIds
                .includes(
                    "LEXICAL-RELEASE-VALUE"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES RESERVE FACT",
        passed:
            valueConcept
                ?.evidence
                .includes(
                    "FACT-RESERVE-VALUE-1"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT PRESERVES RELEASE FACT",
        passed:
            valueConcept
                ?.evidence
                .includes(
                    "FACT-RELEASE-VALUE-1"
                ) ===
            true
    },
    {
        name:
            "VALUE CONCEPT DEDUPLICATES REPEATED FACT EVIDENCE",
        passed:
            valueConcept
                ?.evidence
                .filter(
                    evidence =>
                        evidence ===
                        "FACT-RESERVE-VALUE-1"
                )
                .length ===
            1
    },
    {
        name:
            "AGENT BECOMES RECURRENT CONCEPT",
        passed:
            agentConcept !==
            undefined
    },
    {
        name:
            "AGENT CONCEPT PRESERVES TWO DISTINCT CAPABILITIES",
        passed:
            agentConcept
                ?.lexicalCapabilityIds
                .length ===
            2
    },
    {
        name:
            "SINGLE OCCURRENCE RESERVE DOES NOT BECOME CONCEPT",
        passed:
            !result.concepts.some(
                concept =>
                    concept.conceptId ===
                    "CONCEPT-RESERVE"
            )
    },
    {
        name:
            "SINGLE OCCURRENCE RELEASE DOES NOT BECOME CONCEPT",
        passed:
            !result.concepts.some(
                concept =>
                    concept.conceptId ===
                    "CONCEPT-RELEASE"
            )
    },
    {
        name:
            "MULTIPLE FACTS IN ONE CAPABILITY DO NOT CREATE CONCEPT",
        passed:
            !result.concepts.some(
                concept =>
                    concept.conceptId ===
                    "CONCEPT-SINGLE"
            )
    },
    {
        name:
            "CONCEPT ORDER IS DETERMINISTIC",
        passed:
            result.concepts[0]
                ?.conceptId ===
                "CONCEPT-AGENT" &&
            result.concepts[1]
                ?.conceptId ===
                "CONCEPT-VALUE"
    },
    {
        name:
            "UPSTREAM SCIENTIFIC FAILURE IS PRESERVED",
        passed:
            upstreamFailure.errors.includes(
                "Controlled upstream scientific failure."
            )
    },
    {
        name:
            "UPSTREAM SCIENTIFIC FAILURE FAILS CLOSED",
        passed:
            upstreamFailure.concepts.length ===
            0
    },
    {
        name:
            "NON-LEXICAL CAPABILITY IS REJECTED",
        passed:
            nonLexicalFailure.errors.some(
                error =>
                    error.includes(
                        "outside the lexical abstraction boundary"
                    )
            )
    },
    {
        name:
            "NON-LEXICAL CONTAMINATION FAILS CLOSED",
        passed:
            nonLexicalFailure.concepts.length ===
            0
    },
    {
        name:
            "PREATTRIBUTED PROTOCOL OWNERSHIP IS REJECTED",
        passed:
            protocolOwnershipFailure.errors.some(
                error =>
                    error.includes(
                        "already carries protocol ownership"
                    )
            )
    },
    {
        name:
            "PROTOCOL OWNERSHIP CONTAMINATION FAILS CLOSED",
        passed:
            protocolOwnershipFailure.concepts.length ===
            0
    },
    {
        name:
            "CAPABILITY WITHOUT EVIDENCE IS REJECTED",
        passed:
            missingEvidenceFailure.errors.some(
                error =>
                    error.includes(
                        "has no structural fact evidence"
                    )
            )
    },
    {
        name:
            "MISSING EVIDENCE FAILS CLOSED",
        passed:
            missingEvidenceFailure.concepts.length ===
            0
    },
    {
        name:
            "RUNTIME CONCEPTS CONTAIN NO CONFIDENCE FIELD",
        passed:
            !result.concepts.some(
                concept =>
                    Object.prototype.hasOwnProperty.call(
                        concept,
                        "confidence"
                    )
            )
    }
];


console.log("");
console.log(
    "SCIENTIFIC CONCEPT ABSTRACTION â€” RUNTIME"
);
console.log(
    "----------------------------------------"
);


for (
    const check
    of checks
) {

    console.log(
        `${check.name}: ${
            check.passed
                ? "PASS"
                : "FAIL"
        }`
    );

}


const failures =
    checks.filter(
        check =>
            !check.passed
    );


console.log("");


if (
    failures.length ===
    0
) {

    console.log(
        "RESULT: PASS"
    );

} else {

    console.log(
        `RESULT: FAIL (${failures.length}/${checks.length})`
    );

    process.exitCode =
        1;

}
