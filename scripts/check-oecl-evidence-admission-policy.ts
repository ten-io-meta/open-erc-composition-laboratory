import assert from "node:assert/strict";

import {
  evaluateEvidenceAdmission,
} from "../web/src/server/oeclEvidenceAdmission.ts";


const cases = [
  {
    caseId:
      "CASE-VERIFIED",

    input: {
      observerReady: true,
      witnessReady: true,
      chainMatch: true,
      blockHashMatch: true,
      runtimeCodePresent: true,
      ownerMatch: true,
    },

    expected: {
      verdict: "VERIFIED",
      admission: "ADMISSIBLE",
      reasons: [],
    },
  },

  {
    caseId:
      "CASE-BLOCK-HASH-MISMATCH",

    input: {
      observerReady: true,
      witnessReady: true,
      chainMatch: true,
      blockHashMatch: false,
      runtimeCodePresent: true,
      ownerMatch: true,
    },

    expected: {
      verdict: "MISMATCH",
      admission: "REJECTED",
      reasons: [
        "BLOCK_HASH_MISMATCH",
      ],
    },
  },

  {
    caseId:
      "CASE-OBSERVER-UNAVAILABLE",

    input: {
      observerReady: false,
      witnessReady: false,
      chainMatch: false,
      blockHashMatch: false,
      runtimeCodePresent: false,
      ownerMatch: false,
    },

    expected: {
      verdict: "INCOMPLETE",
      admission: "INCOMPLETE",
      reasons: [
        "OBSERVER_EVIDENCE_UNAVAILABLE",
      ],
    },
  },
] as const;


const results =
  cases.map(
    testCase => {

      const actual =
        evaluateEvidenceAdmission(
          testCase.input
        );

      assert.deepEqual(
        actual,
        testCase.expected,
        `${testCase.caseId} produced an unexpected decision.`
      );

      return {
        Case:
          testCase.caseId,

        Verdict:
          actual.verdict,

        Admission:
          actual.admission,

        Reasons:
          actual.reasons.length === 0
            ? "-"
            : actual.reasons.join(","),
      };
    }
  );


console.table(results);

console.log(
  "\n3/3 deterministic OECL evidence-admission cases passed."
);