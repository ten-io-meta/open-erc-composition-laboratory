import { NextResponse } from "next/server";
import { getProtocolEvidenceGate } from "@/server/oeclProtocolEvidenceGate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getProtocolEvidenceGate();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        error:
          error instanceof Error
            ? error.message
            : "Unknown protocol evidence gate error.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
