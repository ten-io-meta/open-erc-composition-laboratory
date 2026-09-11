export interface GitHubCompositionSignal {

    fromCapability: string;

    toCapability: string;

    relation: string;

    reason: string;

}

export class GitHubCompositionSignalExtractor {

    extract(source: any): GitHubCompositionSignal[] {

        const claims: string[] = source.claims ?? [];
        const capabilities: string[] = source.capabilities ?? [];

        const signals: GitHubCompositionSignal[] = [];

        const has = (capability: string) =>
            capabilities.includes(capability);

        const text = claims.join("\n").toLowerCase();

        if (
            has("EmbeddedValue") &&
            has("Reservation")
        ) {
            signals.push({
                fromCapability: "EmbeddedValue",
                toCapability: "Reservation",
                relation: "ENABLES",
                reason: "GitHub repository claims indicate that embedded ERC8060 value enables reservation accounting."
            });
        }

        if (
            has("Reservation") &&
            has("Accounting")
        ) {
            signals.push({
                fromCapability: "Reservation",
                toCapability: "Accounting",
                relation: "PROTECTS",
                reason: "GitHub repository claims indicate that reservation separates locked value from available value."
            });
        }

        if (
            has("Reservation") &&
            has("Settlement")
        ) {
            signals.push({
                fromCapability: "Reservation",
                toCapability: "Settlement",
                relation: "CONSTRAINS",
                reason: "GitHub repository claims indicate that reservation can bound deterministic settlement."
            });
        }

        if (
            has("InvariantValidation") &&
            (
                text.includes("invariant") ||
                text.includes("cannot") ||
                text.includes("must") ||
                text.includes("never")
            )
        ) {
            signals.push({
                fromCapability: "InvariantValidation",
                toCapability: "Accounting",
                relation: "VALIDATES",
                reason: "GitHub repository contains invariant-like statements related to accounting safety."
            });
        }

        if (
            has("Testing") &&
            has("InvariantValidation")
        ) {
            signals.push({
                fromCapability: "Testing",
                toCapability: "InvariantValidation",
                relation: "VALIDATES",
                reason: "GitHub repository contains test evidence supporting invariant validation."
            });
        }

        if (
            has("Redemption") &&
            has("EmbeddedValue")
        ) {
            signals.push({
                fromCapability: "Redemption",
                toCapability: "EmbeddedValue",
                relation: "CONSUMES",
                reason: "GitHub repository claims indicate redemption consumes embedded value."
            });
        }

        return signals;

    }

}