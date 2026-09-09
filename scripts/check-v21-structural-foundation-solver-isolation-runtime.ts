import {
    readFileSync
} from "node:fs";


const source =
    readFileSync(
        "./laboratory/scientific-n-protocol-composition-solver/ScientificNProtocolCompositionSolverEngine.ts",
        "utf8"
    );


let pass = 0;
let fail = 0;


function check(
    name: string,
    condition: boolean
): void {

    console.log(
        `${name}: ${condition ? "PASS" : "FAIL"}`
    );

    condition
        ? pass++
        : fail++;

}


console.log("");
console.log(
    "V2.1 STRUCTURAL FOUNDATION SOLVER ISOLATION"
);
console.log(
    "==========================================="
);


check(
    "SOLVER SELECTS FUNCTIONAL COMPLEMENTARITY ONLY",
    source.includes(
        'relation.candidateKind ==='
    ) &&
    source.includes(
        '"FUNCTIONAL_COMPLEMENTARITY"'
    )
);


check(
    "SOLVER REQUIRES CANDIDATE SUPPORT",
    source.includes(
        'relation.compatibilityPolarity ==='
    ) &&
    source.includes(
        '"SUPPORT"'
    )
);


check(
    "SOLVER NARROWS EVALUATION EDGE TO FUNCTIONAL KIND",
    source.includes(
        'edge.kind ==='
    ) &&
    source.includes(
        '"FUNCTIONAL_COMPLEMENTARITY"'
    )
);


check(
    "STRUCTURAL FOUNDATION HAS NO SOLVER-SPECIFIC PROMOTION PATH",
    !source.includes(
        '"STRUCTURAL_FOUNDATION"'
    )
);


check(
    "SOLVER TOPOLOGY IS EXPLICITLY SUPPORTED FUNCTIONAL EDGES",
    source.includes(
        "supportedFunctionalEdges"
    )
);


check(
    "SOLVER SOURCE DOES NOT CLAIM DOCUMENTARY OR STRUCTURAL COMPOSITION AS FUNCTIONAL",
    source.includes(
        "Only exact functional candidates"
    )
);


console.log("");
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log(
    `RESULT: ${fail === 0 ? "PASS" : "FAIL"}`
);


if (fail > 0) {
    process.exitCode = 1;
}