"use client";

import {
    useEffect,
    useState
} from "react";


type ScientificPairProjection = {

    projectionId:
        string;

    candidateId:
        string;

    sourceParticipantId:
        string;

    targetParticipantId:
        string;

    candidateKind:
        string;

    documentaryRelation:
        string | null;

    foundationProtocolId:
        string | null;

    discoveryEvidenceCount:
        number;

    compatibility: {

        polarity:
            string;

        evidenceCount:
            number;

        evaluationStatus:
            string;

    };

    boundaries: {

        knownProtocolBoundaries:
            number;

        envelopeKnownBoundaries:
            number;

        relevant:
            number;

        outOfScope:
            number;

        unresolved:
            number;

        preservedRegions:
            number;

        violatedRegions:
            number;

        unevaluatedRegions:
            number;

    };

    harmony: {

        status:
            string;

        globallySupportedFullConfigurations:
            number;

        globallySupportedSubsets:
            number;

    } | null;

    compositionValue: {

        status:
            string;

        findingCount:
            number;

        decisionAuthority:
            string;

    } | null;

};


type ScientificPairResponse = {

    status:
        string;

    scientificScope:
        string;

    projectionCount:
        number;

    projections:
        ScientificPairProjection[];

    note:
        string;

};


function scientificSummary(
    projection:
        ScientificPairProjection
): string {

    if (
        projection.boundaries.unresolved >
        0
    ) {

        return (
            `${projection.boundaries.envelopeKnownBoundaries} protocol boundaries are known, ` +
            `but ${projection.boundaries.unresolved} candidate-boundary relevance assessments remain unresolved. ` +
            "Compatibility cannot therefore be established from the current evidence."
        );

    }

    if (
        projection.compatibility.polarity ===
        "SUPPORT"
    ) {

        return (
            "Candidate-scoped compatibility is supported by the current scientific evaluation. " +
            "Any global composition conclusion remains governed separately by Harmony and Composition Value."
        );

    }

    if (
        projection.compatibility.polarity ===
        "CHALLENGE"
    ) {

        return (
            "Candidate-scoped evidence challenges this composition. " +
            "This evaluated result is independent from discovery evidence."
        );

    }

    return (
        "The currently materialized candidate-scoped evidence does not establish compatibility."
    );

}


export function ScientificPairResults(
    {
        protocolA,
        protocolB
    }: {
        protocolA:
            string;

        protocolB:
            string;
    }
) {

    const [
        result,
        setResult
    ] =
        useState<
            ScientificPairResponse | null
        >(
            null
        );

    const [
        error,
        setError
    ] =
        useState<
            string | null
        >(
            null
        );


    useEffect(
        () => {

            let cancelled =
                false;



            fetch(
                `/api/scientific/pair?protocolA=${encodeURIComponent(protocolA)}&protocolB=${encodeURIComponent(protocolB)}`
            )
                .then(
                    async response => {

                        const body =
                            await response.json();

                        if (!response.ok) {

                            throw new Error(
                                body.message ??
                                "Scientific pair request failed."
                            );

                        }

                        return body as ScientificPairResponse;

                    }
                )
                .then(
                    body => {

                        if (!cancelled) {

                            setResult(
                                body
                            );

                        }

                    }
                )
                .catch(
                    reason => {

                        if (!cancelled) {

                            setError(
                                reason instanceof Error
                                    ? reason.message
                                    : "Scientific pair request failed."
                            );

                        }

                    }
                );

            return () => {
                cancelled =
                    true;
            };

        },
        [
            protocolA,
            protocolB
        ]
    );


    if (error !== null) {

        return (
            <div>

                <div className="font-mono text-xs text-[#8a6b20]">
                    SCIENTIFIC PAIR REQUEST ERROR
                </div>

                <p className="mt-2 text-sm leading-6 text-[#68706c]">
                    {error}
                </p>

            </div>
        );

    }


    if (result === null) {

        return (
            <div className="font-mono text-xs text-[#68706c]">
                LOADING MATERIALIZED SCIENTIFIC PAIR STATE...
            </div>
        );

    }


    if (result.projections.length === 0) {

        return (
            <div>

                <div className="font-mono text-xs text-[#8a6b20]">
                    NO MATERIALIZED PAIR EVALUATION
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68706c]">
                    {result.note}
                </p>

            </div>
        );

    }


    return (
        <div className="grid gap-4">

            {result.projections.map(
                projection => {

                    const mechanism =
                        projection.documentaryRelation ??
                        (
                            projection.foundationProtocolId !== null
                                ? `FOUNDATION ${projection.foundationProtocolId}`
                                : projection.candidateKind
                        );

                    const supportedConfigurations =
                        (
                            projection.harmony
                                ?.globallySupportedFullConfigurations ??
                            0
                        ) +
                        (
                            projection.harmony
                                ?.globallySupportedSubsets ??
                            0
                        );

                    return (
                        <article
                            key={projection.projectionId}
                            className="rounded-2xl border border-[#dfe4e1] bg-[#f7f9f7] p-5"
                        >

                            <div className="flex flex-wrap items-center justify-between gap-3">

                                <div>

                                    <div className="text-lg font-medium">
                                        {projection.sourceParticipantId}
                                        {" \u00d7 "}
                                        {projection.targetParticipantId}
                                    </div>

                                    <div className="mt-1 font-mono text-xs text-[#68706c]">
                                        {projection.candidateKind}
                                        {" \u00b7 "}
                                        {mechanism}
                                    </div>

                                </div>


                                <div
                                    className={
                                        projection.compatibility.polarity === "SUPPORT"
                                            ? "rounded-full bg-[#173f32] px-4 py-2 text-xs font-semibold text-white"
                                            : projection.compatibility.polarity === "CHALLENGE"
                                                ? "rounded-full bg-[#5a2d2d] px-4 py-2 text-xs font-semibold text-white"
                                                : "rounded-full bg-[#ece7d9] px-4 py-2 text-xs font-semibold text-[#65572b]"
                                    }
                                >
                                    {projection.compatibility.polarity}
                                </div>

                            </div>


                            <div className="mt-4">

                                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#1e5d46]">
                                    Evaluated scientific state
                                </div>

                                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#68706c]">
                                    {scientificSummary(
                                        projection
                                    )}
                                </p>

                            </div>


                            <div className="mt-4 flex flex-wrap gap-2">

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Discovery evidence:{" "}
                                    <strong>
                                        {projection.discoveryEvidenceCount}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Known protocol boundaries:{" "}
                                    <strong>
                                        {projection.boundaries.envelopeKnownBoundaries}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Relevant:{" "}
                                    <strong>
                                        {projection.boundaries.relevant}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Out of scope:{" "}
                                    <strong>
                                        {projection.boundaries.outOfScope}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Unresolved relevance:{" "}
                                    <strong>
                                        {projection.boundaries.unresolved}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Compatibility evidence:{" "}
                                    <strong>
                                        {projection.compatibility.evidenceCount}
                                    </strong>
                                </span>

                                <span className="rounded-full border border-[#d7ddda] bg-white px-3 py-1.5 text-xs">
                                    Unevaluated boundary regions:{" "}
                                    <strong>
                                        {projection.boundaries.unevaluatedRegions}
                                    </strong>
                                </span>

                            </div>


                            <div className="mt-5 grid gap-3 md:grid-cols-2">

                                <div className="rounded-xl border border-[#dfe4e1] bg-white p-4">

                                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#68706c]">
                                        Harmony
                                    </div>

                                    <div className="mt-1 text-sm font-medium">
                                        {
                                            projection.harmony?.status ??
                                            "NOT MATERIALIZED"
                                        }
                                    </div>

                                    <div className="mt-1 text-xs leading-5 text-[#68706c]">
                                        Globally supported configurations:{" "}
                                        {supportedConfigurations}
                                    </div>

                                </div>


                                <div className="rounded-xl border border-[#dfe4e1] bg-white p-4">

                                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#68706c]">
                                        Composition Value
                                    </div>

                                    <div className="mt-1 text-sm font-medium">
                                        {
                                            projection.compositionValue?.status ??
                                            "NOT MATERIALIZED"
                                        }
                                    </div>

                                    <div className="mt-1 text-xs leading-5 text-[#68706c]">
                                        Findings:{" "}
                                        {
                                            projection.compositionValue
                                                ?.findingCount ??
                                            0
                                        }
                                    </div>

                                </div>

                            </div>


                            <div className="mt-4 font-mono text-[11px] text-[#1e5d46]">
                                MATERIALIZED SCIENTIFIC PAIR PROJECTION {"\u00b7"} OECL V2.1
                            </div>

                        </article>
                    );

                }
            )}


            <p className="text-xs leading-5 text-[#68706c]">
                {result.note}
            </p>

        </div>
    );

}
