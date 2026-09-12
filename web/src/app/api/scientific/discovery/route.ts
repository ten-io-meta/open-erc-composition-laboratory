import {
  NextRequest,
  NextResponse,
} from "next/server";

import catalog from "@/data/scientificDiscoveryCatalog.json";
import pairCatalog from "@/data/scientificPairCatalog.json";


function normalizeProtocolId(
  value: string,
): string | null {

  const normalized =
    value.trim().toUpperCase();

  const match =
    normalized.match(
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


type PairProjection = {
  sourceParticipantId: string;
  targetParticipantId: string;

  compatibility?: {
    polarity?: string;
    evaluationStatus?: string;
    evidenceCount?: number;
  };

  harmony?: {
    status?: string;
  };

  compositionValue?: {
    status?: string;
  };
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


function findPairProjection(
  sourceParticipantId: string,
  targetParticipantId: string,
): PairProjection | null {

  const projections =
    pairCatalog.projections as PairProjection[];

  return (
    projections.find(
      projection =>
        (
          projection.sourceParticipantId === sourceParticipantId &&
          projection.targetParticipantId === targetParticipantId
        ) ||
        (
          projection.sourceParticipantId === targetParticipantId &&
          projection.targetParticipantId === sourceParticipantId
        ),
    ) ?? null
  );
}


function projectCandidate(
  candidate: ScientificCandidate,
  protocolId: string | null,
) {

  const counterpartId =
    protocolId === null
      ? null
      : candidate.sourceParticipantId === protocolId
        ? candidate.targetParticipantId
        : candidate.sourceParticipantId;

  const pairProjection =
    findPairProjection(
      candidate.sourceParticipantId,
      candidate.targetParticipantId,
    );

  return {
    candidateId:
      candidate.candidateId,

    protocols: [
      candidate.sourceParticipantId,
      candidate.targetParticipantId,
    ],

    sourceParticipantId:
      candidate.sourceParticipantId,

    targetParticipantId:
      candidate.targetParticipantId,

    counterpartId,

    kind:
      candidate.kind,

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

    candidateStatus:
      "MATERIALIZED",

    pairEvaluation: pairProjection === null
      ? {
          available: false,
          compatibility: "NOT_MATERIALIZED",
          harmony: null,
          compositionValue: null,
        }
      : {
          available: true,
          compatibility:
            pairProjection.compatibility?.polarity ??
            "INCONCLUSIVE",
          harmony:
            pairProjection.harmony?.status ??
            null,
          compositionValue:
            pairProjection.compositionValue?.status ??
            null,
        },
  };
}


export async function GET(
  request: NextRequest,
) {

  const rawProtocol =
    request.nextUrl.searchParams.get(
      "protocol",
    );

  const discovered =
    catalog.discovery.candidateSet
      .candidates as ScientificCandidate[];


  if (
    rawProtocol === null ||
    rawProtocol.trim() === ""
  ) {

    const candidates =
      discovered.map(
        candidate =>
          projectCandidate(
            candidate,
            null,
          ),
      );

    return NextResponse.json({
      status:
        "SCIENTIFIC_DISCOVERY_SNAPSHOT",

      scientificScope:
        catalog.scientificScope,

      protocolId:
        null,

      candidateCount:
        candidates.length,

      candidates,

      errors:
        catalog.discovery.candidateSet.errors,

      generatedAt:
        catalog.generatedAt,

      note:
        "This is the complete candidate set materialized in the current OECL scientific snapshot. It is not an exhaustive search of Ethereum standards and does not rank candidates by compatibility.",
    });
  }


  const protocolId =
    normalizeProtocolId(
      rawProtocol,
    );

  if (protocolId === null) {

    return NextResponse.json(
      {
        status:
          "INVALID_PROTOCOL_ID",

        message:
          "Use an ERC identifier such as ERC-8004.",
      },
      {
        status: 400,
      },
    );
  }


  const candidates =
    discovered
      .filter(
        candidate =>
          candidate.sourceParticipantId === protocolId ||
          candidate.targetParticipantId === protocolId,
      )
      .map(
        candidate =>
          projectCandidate(
            candidate,
            protocolId,
          ),
      );


  return NextResponse.json({
    status:
      "SCIENTIFIC_DISCOVERY_PROJECTION",

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
        ? "No composition candidate involving this protocol was materialized in the current scientific snapshot. This is not an incompatibility verdict."
        : "These candidates were already materialized in the current scientific snapshot. They are not ranked compatibility recommendations.",
  });
}