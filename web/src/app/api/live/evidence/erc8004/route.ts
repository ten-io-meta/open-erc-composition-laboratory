import { NextResponse } from "next/server";

import {
  getErc8004EvidenceReceiptBundle,
} from "@/server/oeclEvidenceReceipt";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET() {

  try {

    const bundle =
      await getErc8004EvidenceReceiptBundle();

    return NextResponse.json(
      bundle,
      {
        status:
          bundle.status === "NOT_CONFIGURED"
            ? 503
            : 200,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );

  } catch (error) {

    return NextResponse.json(
      {
        schemaVersion:
          "OECL_EVIDENCE_RECEIPT_BUNDLE_V1",

        status:
          "ERROR",

        decision:
          "INCOMPLETE",

        error:
          error instanceof Error
            ? error.message
            : "Unknown evidence receipt error",
      },
      {
        status: 500,
      }
    );
  }
}