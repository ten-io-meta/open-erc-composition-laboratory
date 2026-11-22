import { NextRequest, NextResponse } from "next/server";
import {
  DOSSIER_EVIDENCE_RUN,
  DOSSIER_SNAPSHOT_SHA256,
  getVerifiedScientificDossier,
  isDossierPair,
  normalizeErc,
} from "@/server/oeclScientificDossier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only: returns a verified, pinned local-EVM report.
 * There is no arbitrary Solidity execution or new scientific candidate
 * discovery via this endpoint.
 */
export function GET(request: NextRequest) {
  const a = normalizeErc(request.nextUrl.searchParams.get("protocolA"));
  const b = normalizeErc(request.nextUrl.searchParams.get("protocolB"));
  if (!a || !b || a === b) {
    return NextResponse.json({
      status: "INVALID_PROTOCOL_PAIR",
      message: "Provide two distinct valid ERC identifiers.",
    }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  if (!isDossierPair(a, b)) {
    return NextResponse.json({
      status: "NO_VERIFIED_DOSSIER",
      scientificConclusion: "NOT_EVALUATED",
      message: "No pinned scientific dossier exists for this pair. This is not proof of incompatibility. New analyses are not enabled yet.",
    }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const dossier = getVerifiedScientificDossier();
    const download = request.nextUrl.searchParams.get("download") === "1";
    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
      "X-OECL-Snapshot-SHA256": DOSSIER_SNAPSHOT_SHA256,
      "X-OECL-Evidence-Run": DOSSIER_EVIDENCE_RUN,
    };
    if (download) {
      return new NextResponse(JSON.stringify(dossier, null, 2) + "\n", {
        status: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="oecl-erc8060-erc8098-scientific-dossier.json"',
        },
      });
    }
    return NextResponse.json({
      status: "PINNED_SCIENTIFIC_DOSSIER",
      snapshotSha256: DOSSIER_SNAPSHOT_SHA256,
      evidenceRunUrl: DOSSIER_EVIDENCE_RUN,
      dossier,
    }, { headers });
  } catch {
    return NextResponse.json({
      status: "SCIENTIFIC_EVIDENCE_NOT_VERIFIED",
      message: "The pinned dossier failed integrity checks and cannot be displayed.",
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
