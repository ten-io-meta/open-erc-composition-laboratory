import { NextResponse } from "next/server";
import { getLiveAgent0MultichainState } from "@/server/oeclTheGraph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getLiveAgent0MultichainState();

    return NextResponse.json(data, {
      status: data.status === "NOT_CONFIGURED" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        error:
          error instanceof Error
            ? error.message
            : "Unknown live multi-chain provider error",
      },
      { status: 500 }
    );
  }
}
