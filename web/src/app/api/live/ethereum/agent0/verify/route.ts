import { NextResponse } from "next/server";
import { getLiveErc8004EthereumVerification } from "@/server/oeclEthereumVerification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data =
      await getLiveErc8004EthereumVerification();

    return NextResponse.json(data, {
      status:
        data.status === "NOT_CONFIGURED"
          ? 503
          : 200,
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
            : "Unknown Ethereum verification error",
      },
      {
        status: 500,
      }
    );
  }
}
