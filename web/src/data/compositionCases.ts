export type ScientificDecision = "SUPPORTED" | "INCONCLUSIVE";

export type CompositionCase = {
  id: string;
  protocols: string[];
  relation: string;
  foundation?: string;
  discoveryState: string;
  decision: ScientificDecision;
  summary: string;
  metrics: { label: string; value: string }[];
};

export const compositionCases: CompositionCase[] = [
  {
    id: "REAL-CONTROL-POSITIVE-8004-8060",
    protocols: ["ERC-8004", "ERC-8060"],
    relation: "STRUCTURAL_FOUNDATION",
    foundation: "ERC-721",
    discoveryState: "UNEVALUATED",
    decision: "SUPPORTED",
    summary: "Shared ERC-721 foundation discovered first; compatibility supported only after scientific evaluation.",
    metrics: [
      { label: "Scientific gates", value: "6 / 6" },
      { label: "Relevant boundaries", value: "17" },
      { label: "Out of scope", value: "20" },
      { label: "Unresolved", value: "0" },
    ],
  },
  {
    id: "REAL-CONTROL-INCONCLUSIVE-8301-8354",
    protocols: ["ERC-8301", "ERC-8354"],
    relation: "DOCUMENTARY_RELATION",
    discoveryState: "DISCOVERED",
    decision: "INCONCLUSIVE",
    summary: "Documentary evidence exists, but the scientific state is insufficient for a compatibility claim.",
    metrics: [
      { label: "Documentary evidence", value: "2" },
      { label: "Known boundaries", value: "0" },
      { label: "Compatibility observations", value: "0" },
      { label: "Functional configurations", value: "0" },
    ],
  },
];
