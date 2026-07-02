import type { GitHubSourceBundle } from "./GitHubSourceBundle.js";

export class GitHubSourceAdapter {

    createBundle(): GitHubSourceBundle {
        return {
            sourceId: "GITHUB-ERC8060-RESERVABLE",
            repository: "ten-io-meta/erc8060-reservable",
            url: "https://github.com/ten-io-meta/erc8060-reservable",
            title: "ERC8060 Reservable GitHub Repository",
            description:
                "Reference implementation and validation suite for IERC8060Reservable, exploring reservation-based accounting over ERC8060 embedded value.",
            protocols: [
                "ERC8060",
                "IERC8060Reservable"
            ],
            capabilities: [
                "EmbeddedValue",
                "Reservation",
                "Accounting"
            ],
            claims: [
                "IERC8060Reservable introduces reservation-based accounting over embedded ERC8060 value.",
                "Reservation separates locked value from available value.",
                "Reservable accounting can support deterministic settlement boundaries."
            ]
        };
    }

}