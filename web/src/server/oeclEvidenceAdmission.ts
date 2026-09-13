export type EvidenceAdmission =
  | "ADMISSIBLE"
  | "REJECTED"
  | "INCOMPLETE";


export type EvidenceVerdict =
  | "VERIFIED"
  | "MISMATCH"
  | "INCOMPLETE";


export type EvidenceAdmissionInput = {
  observerReady: boolean;
  witnessReady: boolean;
  chainMatch: boolean;
  blockHashMatch: boolean;
  runtimeCodePresent: boolean;
  ownerMatch: boolean;
};


export type EvidenceAdmissionDecision = {
  verdict: EvidenceVerdict;
  admission: EvidenceAdmission;
  reasons: string[];
};


export function evaluateEvidenceAdmission(
  input: EvidenceAdmissionInput
): EvidenceAdmissionDecision {

  /*
   * Availability failure is not contradiction.
   *
   * If the standardized observer cannot provide
   * complete provenance, the evidence is incomplete.
   */
  if (!input.observerReady) {

    return {
      verdict: "INCOMPLETE",
      admission: "INCOMPLETE",
      reasons: [
        "OBSERVER_EVIDENCE_UNAVAILABLE",
      ],
    };
  }


  /*
   * If independent chain state cannot be obtained,
   * OECL also remains incomplete.
   */
  if (!input.witnessReady) {

    return {
      verdict: "INCOMPLETE",
      admission: "INCOMPLETE",
      reasons: [
        "WITNESS_EVIDENCE_UNAVAILABLE",
      ],
    };
  }


  const reasons: string[] = [];


  if (!input.chainMatch) {
    reasons.push(
      "CHAIN_ID_MISMATCH"
    );
  }


  if (!input.blockHashMatch) {
    reasons.push(
      "BLOCK_HASH_MISMATCH"
    );
  }


  if (!input.runtimeCodePresent) {
    reasons.push(
      "REGISTRY_RUNTIME_ABSENT"
    );
  }


  if (!input.ownerMatch) {
    reasons.push(
      "AGENT_OWNER_MISMATCH"
    );
  }


  /*
   * Once both observer and witness evidence exist,
   * any contradiction is explicitly rejected.
   *
   * A mismatch is never retried into admissibility.
   */
  if (reasons.length > 0) {

    return {
      verdict: "MISMATCH",
      admission: "REJECTED",
      reasons,
    };
  }


  return {
    verdict: "VERIFIED",
    admission: "ADMISSIBLE",
    reasons: [],
  };
}