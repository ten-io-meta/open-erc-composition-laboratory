export function normalizeSemanticRelation(
    relation:
        string
): string {

    const normalized =
        String(
            relation ?? ""
        )
            .trim()
            .toUpperCase();

    switch (
        normalized
    ) {

        case "CONSTRAIN":
            return "CONSTRAINS";

        case "ENABLE":
            return "ENABLES";

        case "REQUIRE":
            return "REQUIRES";

        case "VALIDATE":
            return "VALIDATES";

        case "PROTECT":
            return "PROTECTS";

        case "PRODUCE":
            return "PRODUCES";

        case "CONSUME":
            return "CONSUMES";

        case "SETTLE":
            return "SETTLES";

        case "RESERVE":
            return "RESERVES";

        case "ANCHOR":
            return "ANCHORS";

        case "ACCOUNT_FOR":
            return "ACCOUNTS_FOR";

        case "DEPEND_ON":
            return "DEPENDS_ON";

        default:
            return normalized;

    }

}


export function semanticRelationPhrase(
    relation:
        string
): string {

    switch (
        normalizeSemanticRelation(
            relation
        )
    ) {

        case "ENABLES":
            return "enable";

        case "DEPENDS_ON":
            return "depend on";

        case "REQUIRES":
            return "require";

        case "CONSTRAINS":
            return "constrain";

        case "PRODUCES":
            return "produce";

        case "CONSUMES":
            return "consume";

        case "SETTLES":
            return "settle";

        case "PROTECTS":
            return "protect";

        case "VALIDATES":
            return "validate";

        case "ANCHORS":
            return "anchor";

        case "RESERVES":
            return "reserve";

        case "ACCOUNTS_FOR":
            return "account for";

        default:
            return "";

    }

}


export interface SemanticRelationEvidenceCues {

    support:
        string[];

    challenge:
        string[];

}


export function semanticRelationEvidenceCues(
    relation:
        string
): SemanticRelationEvidenceCues {

    switch (
        normalizeSemanticRelation(
            relation
        )
    ) {

        case "ENABLES":

            return {

                support: [
                    "enable",
                    "enabled",
                    "allow",
                    "allowed",
                    "permit",
                    "permitted",
                    "activate",
                    "activated",
                    "available",
                    "possible",
                    "succeed",
                    "succeeds"
                ],

                challenge: [
                    "disable",
                    "disabled",
                    "prevent",
                    "prevented",
                    "block",
                    "blocked",
                    "deny",
                    "denied",
                    "impossible",
                    "unavailable",
                    "fail",
                    "failed"
                ]

            };


        case "DEPENDS_ON":

            return {

                support: [
                    "depend",
                    "depends",
                    "dependent",
                    "require",
                    "required",
                    "prerequisite",
                    "necessary",
                    "missing",
                    "revert",
                    "reverted"
                ],

                challenge: [
                    "independent",
                    "optional",
                    "bypass",
                    "bypassed",
                    "without",
                    "unnecessary",
                    "unneeded"
                ]

            };


        case "REQUIRES":

            return {

                support: [
                    "require",
                    "required",
                    "must",
                    "necessary",
                    "prerequisite",
                    "enforce",
                    "enforced",
                    "revert",
                    "reverted",
                    "reject",
                    "rejected"
                ],

                challenge: [
                    "optional",
                    "bypass",
                    "bypassed",
                    "without",
                    "unnecessary",
                    "ignore",
                    "ignored",
                    "permit",
                    "permitted"
                ]

            };


        case "CONSTRAINS":

    return {

        support: [
            "bound",
            "bounded",
            "limit",
            "limited",
            "restrict",
            "restricted",
            "lock",
            "locked",
            "reserve",
            "reserved",
            "prevent",
            "prevented"
        ],

        challenge: [
            "bypass",
            "bypassed",
            "ignore",
            "ignored",
            "unrestricted",
            "exceed",
            "exceeded"
        ]

    };
        case "PRODUCES":

            return {

                support: [
                    "produce",
                    "produced",
                    "create",
                    "created",
                    "generate",
                    "generated",
                    "emit",
                    "emitted",
                    "output",
                    "result",
                    "return",
                    "returned"
                ],

                challenge: [
                    "absent",
                    "missing",
                    "none",
                    "empty",
                    "fail",
                    "failed",
                    "prevent",
                    "prevented",
                    "omit",
                    "omitted"
                ]

            };


        case "CONSUMES":

            return {

                support: [
                    "consume",
                    "consumed",
                    "spend",
                    "spent",
                    "deduct",
                    "deducted",
                    "decrease",
                    "decreased",
                    "reduce",
                    "reduced",
                    "use",
                    "used"
                ],

                challenge: [
                    "preserve",
                    "preserved",
                    "unchanged",
                    "retain",
                    "retained",
                    "restore",
                    "restored",
                    "increase",
                    "increased"
                ]

            };


        case "SETTLES":

            return {

                support: [
                    "settle",
                    "settled",
                    "finalize",
                    "finalized",
                    "complete",
                    "completed",
                    "resolve",
                    "resolved",
                    "pay",
                    "paid",
                    "transfer",
                    "transferred"
                ],

                challenge: [
                    "pending",
                    "unsettled",
                    "incomplete",
                    "revert",
                    "reverted",
                    "fail",
                    "failed",
                    "cancel",
                    "cancelled"
                ]

            };


        case "PROTECTS":

            return {

                support: [
                    "protect",
                    "protected",
                    "prevent",
                    "prevented",
                    "reject",
                    "rejected",
                    "guard",
                    "guarded",
                    "secure",
                    "secured",
                    "revert",
                    "reverted"
                ],

                challenge: [
                    "bypass",
                    "bypassed",
                    "exploit",
                    "exploited",
                    "unsafe",
                    "unprotected",
                    "vulnerable",
                    "violate",
                    "violated"
                ]

            };


        case "VALIDATES":

            return {

                support: [
                    "validate",
                    "validated",
                    "verify",
                    "verified",
                    "check",
                    "checked",
                    "assert",
                    "asserted",
                    "confirm",
                    "confirmed",
                    "pass",
                    "passed"
                ],

                challenge: [
                    "invalid",
                    "unverified",
                    "unchecked",
                    "reject",
                    "rejected",
                    "fail",
                    "failed",
                    "violate",
                    "violated"
                ]

            };


        case "ANCHORS":

            return {

                support: [
                    "anchor",
                    "anchored",
                    "bind",
                    "bound",
                    "commit",
                    "committed",
                    "reference",
                    "referenced",
                    "link",
                    "linked",
                    "associate",
                    "associated"
                ],

                challenge: [
                    "detach",
                    "detached",
                    "unlink",
                    "unlinked",
                    "unbound",
                    "independent",
                    "orphan",
                    "orphaned"
                ]

            };


        case "RESERVES":

            return {

                support: [
                    "reserve",
                    "reserved",
                    "lock",
                    "locked",
                    "hold",
                    "held",
                    "allocate",
                    "allocated",
                    "commit",
                    "committed"
                ],

                challenge: [
                    "release",
                    "released",
                    "unlock",
                    "unlocked",
                    "available",
                    "free",
                    "unreserved",
                    "withdraw",
                    "withdrawn"
                ]

            };


        case "ACCOUNTS_FOR":

            return {

                support: [
                    "account",
                    "accounted",
                    "track",
                    "tracked",
                    "record",
                    "recorded",
                    "include",
                    "included",
                    "reflect",
                    "reflected",
                    "balance",
                    "balanced"
                ],

                challenge: [
                    "ignore",
                    "ignored",
                    "omit",
                    "omitted",
                    "missing",
                    "untracked",
                    "unaccounted",
                    "exclude",
                    "excluded",
                    "mismatch"
                ]

            };


        default:

            return {
                support: [],
                challenge: []
            };

    }

}