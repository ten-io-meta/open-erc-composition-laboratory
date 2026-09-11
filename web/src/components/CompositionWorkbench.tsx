"use client";

import {
    useState
} from "react";

import {
    ScientificDiscoveryResults
} from "@/components/ScientificDiscoveryResults";

import {
    ScientificPairResults
} from "@/components/ScientificPairResults";


function normalize(
    value: string
) {

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
        : normalized;

}


export function CompositionWorkbench() {

    const [
        mode,
        setMode
    ] =
        useState<
            "find" | "pair"
        >(
            "find"
        );

    const [
        primary,
        setPrimary
    ] =
        useState(
            ""
        );

    const [
        secondary,
        setSecondary
    ] =
        useState(
            ""
        );

    const [
        submitted,
        setSubmitted
    ] =
        useState(
            false
        );


    const primaryReady =
        /^ERC-[1-9][0-9]*$/.test(
            normalize(
                primary
            )
        );

    const secondaryReady =
        /^ERC-[1-9][0-9]*$/.test(
            normalize(
                secondary
            )
        );

    const canInvestigate =
        primaryReady &&
        (
            mode === "find" ||
            secondaryReady
        );


    return (
        <section className="mt-9 rounded-[28px] border border-[#cfd7d2] bg-white p-6 md:p-8">

            <div className="flex flex-wrap gap-2">

                <button
                    onClick={
                        () => {

                            setMode(
                                "find"
                            );

                            setSubmitted(
                                false
                            );

                        }
                    }
                    className={
                        `rounded-full px-4 py-2 text-sm ${
                            mode === "find"
                                ? "bg-[#101312] text-white"
                                : "bg-[#f1f3f2]"
                        }`
                    }
                >
                    Find compositions
                </button>


                <button
                    onClick={
                        () => {

                            setMode(
                                "pair"
                            );

                            setSubmitted(
                                false
                            );

                        }
                    }
                    className={
                        `rounded-full px-4 py-2 text-sm ${
                            mode === "pair"
                                ? "bg-[#101312] text-white"
                                : "bg-[#f1f3f2]"
                        }`
                    }
                >
                    Check a pair
                </button>

            </div>


            <div className="mt-6 flex flex-col gap-3 md:flex-row">

                <input
                    value={primary}
                    onChange={
                        event => {

                            setPrimary(
                                event.target.value.toUpperCase()
                            );

                            setSubmitted(
                                false
                            );

                        }
                    }
                    placeholder="ERC-8004"
                    className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
                />


                {mode === "pair" && (

                    <input
                        value={secondary}
                        onChange={
                            event => {

                                setSecondary(
                                    event.target.value.toUpperCase()
                                );

                                setSubmitted(
                                    false
                                );

                            }
                        }
                        placeholder="ERC-8060"
                        className="flex-1 rounded-2xl border border-[#cfd7d2] px-5 py-3 outline-none focus:border-[#1e5d46]"
                    />

                )}


                <button
                    onClick={
                        () =>
                            setSubmitted(
                                true
                            )
                    }
                    disabled={
                        !canInvestigate
                    }
                    className="rounded-2xl bg-[#1e5d46] px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Investigate
                </button>

            </div>


            {submitted && (

                <div className="mt-7 border-t border-[#e2e7e4] pt-6">

                    {mode === "find"
                        ? (

                            <ScientificDiscoveryResults
                                protocolId={
                                    normalize(
                                        primary
                                    )
                                }
                            />

                        )
                        : (

                            <ScientificPairResults
                                protocolA={
                                    normalize(
                                        primary
                                    )
                                }
                                protocolB={
                                    normalize(
                                        secondary
                                    )
                                }
                            />

                        )
                    }

                </div>

            )}

        </section>
    );

}