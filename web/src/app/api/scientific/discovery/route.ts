import { NextRequest, NextResponse } from "next/server";

import catalog from "@/data/scientificDiscoveryCatalog.json";

function normalizeProtocolId(
  value: string | null,
): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim().toUpperCase();

  const match = normalized.match(
    /^(?:ERC[- ]?)?([1-9][0-9]*)$/,
  );

  if (match === null) {
    return null;
  }

  return `ERC-${match[1]}`;
}

type ScientificCandidate = {
  candidateId: string;
  kind: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  directionality?: string;
  foundationProtocolId?: string;
  sourceCrossProtocolCandidateId?: string;
  relation?: string;
  evidenceIds?: string[];
  provenance?: unknown[];
  evaluationStatus: string;
};

function candidateMechanism(
  candidate: ScientificCandidate,
): string {
  if (
    candidate.sourceCrossProtocolCandidateId?.includes(
      "SHARED_PROTOCOL_FOUNDATION",
    )
  ) {
    return "SHARED_PROTOCOL_FOUNDATION";
  }

  if (candidate.relation !== undefined) {
    return candidate.relation;
  }

  return candidate.kind;
}

export async function GET(
  request: NextRequest,
) {
  const protocolId = normalizeProtocolId(
    request.nextUrl.searchParams.get("protocol"),
  );

  if (protocolId === null) {
    return NextResponse.json(
      {
        status: "INVALID_PROTOCOL_ID",
        message:
          "Use an ERC identifier such as ERC-8004.",
      },
      {
        status: 400,
      },
    );
  }

  const discovered =
    catalog.discovery.candidateSet
      .candidates as ScientificCandidate[];

  const candidates = discovered
    .filter(
      (candidate) =>
        candidate.sourceParticipantId === protocolId ||
        candidate.targetParticipantId === protocolId,
    )
    .map((candidate) => {
      const counterpartId =
        candidate.sourceParticipantId === protocolId
          ? candidate.targetParticipantId
          : candidate.sourceParticipantId;

      return {
        candidateId: candidate.candidateId,

        protocols: [
          candidate.sourceParticipantId,
          candidate.targetParticipantId,
        ],

        sourceParticipantId:
          candidate.sourceParticipantId,

        targetParticipantId:
          candidate.targetParticipantId,

        counterpartId,

        kind: candidate.kind,

        mechanism:
          candidateMechanism(candidate),

        directionality:
          candidate.directionality ?? null,

        foundationProtocolId:
          candidate.foundationProtocolId ?? null,

        relation:
          candidate.relation ?? null,

        evidenceCount:
          candidate.evidenceIds?.length ?? 0,

        evidenceIds:
          candidate.evidenceIds ?? [],

        provenance:
          candidate.provenance ?? [],

        discoveryStatus:
          candidate.evaluationStatus,

        evaluatedResult: null,
      };
    });

  return NextResponse.json({
    status: "SCIENTIFIC_DISCOVERY_PROJECTION",

    scientificScope:
      catalog.scientificScope,

    protocolId,

    candidateCount:
      candidates.length,

    candidates,

    errors:
      catalog.discovery.candidateSet.errors,

    generatedAt:
      catalog.generatedAt,

    note:
      candidates.length === 0
        ? "No composition candidate involving this protocol was discovered in the currently materialized scientific corpus. This is not an incompatibility verdict."
        : "Discovery opens candidates only. It does not imply compatibility or SUPPORT.",
  });
}
