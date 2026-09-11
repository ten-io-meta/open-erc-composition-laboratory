import {
    NextRequest,
    NextResponse
} from "next/server";

import catalog from "@/data/scientificPairCatalog.json";


function normalizeProtocolId(
    value: string | null
): string | null {

    if (value === null) {
        return null;
    }

    const normalized =
        value
            .trim()
            .toUpperCase();

    const match =
        normalized.match(
            /^ERC-?([1-9][0-9]*)$/
        );

    return match
        ? `ERC-${match[1]}`
        : null;

}


export function GET(
    request: NextRequest
) {

    const protocolA =
        normalizeProtocolId(
            request.nextUrl.searchParams.get(
                "protocolA"
            )
        );

    const protocolB =
        normalizeProtocolId(
            request.nextUrl.searchParams.get(
                "protocolB"
            )
        );

    if (
        protocolA === null ||
        protocolB === null
    ) {

        return NextResponse.json(
            {
                status:
                    "INVALID_PROTOCOL_PAIR",

                message:
                    "Use two ERC identifiers such as ERC-8301 and ERC-8354."
            },
            {
                status:
                    400
            }
        );

    }

    if (protocolA === protocolB) {

        return NextResponse.json(
            {
                status:
                    "INVALID_PROTOCOL_PAIR",

                message:
                    "Check a pair requires two distinct ERC identifiers."
            },
            {
                status:
                    400
            }
        );

    }

    const projections =
        catalog.projections
            .filter(
                projection =>
                    (
                        projection.sourceParticipantId === protocolA &&
                        projection.targetParticipantId === protocolB
                    ) ||
                    (
                        projection.sourceParticipantId === protocolB &&
                        projection.targetParticipantId === protocolA
                    )
            );

    return NextResponse.json({

        status:
            "SCIENTIFIC_PAIR_PROJECTION",

        scientificScope:
            catalog.scientificScope,

        protocols: [
            protocolA,
            protocolB
        ],

        projectionCount:
            projections.length,

        projections,

        note:
            projections.length === 0
                ? "No evaluated pair projection for this protocol pair is present in the currently materialized scientific corpus. This is not an incompatibility verdict."
                : "Pair evaluation is projected from materialized scientific state. Discovery alone does not create compatibility or SUPPORT."

    });

}