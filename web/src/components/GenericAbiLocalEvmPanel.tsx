"use client";

/**
 * Compact, read-only rendering of the exact archived CI evidence:
 * https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45688750270
 *
 * No browser EVM, no public Solidity execution, no mainnet receipt claims.
 * The controlled compiler-generated inheritance-only wrappers were used.
 */
const tests=[
  {id:"0x01ffc9a7",name:"IERC-165 positive control",a:true,b:true},
  {id:"0xffffffff",name:"Invalid interface negative control",a:false,b:false},
  {id:"0x2a55205a",name:"ERC-2981 royalty interface challenge",a:false,b:true},
] as const;
const receipts=[
  {id:"ERC-165",hash:"0x8e00f3aa947403e1c19b293c55c686389226abb4e1562511cfc20c0c39a5ff45"},
  {id:"ERC-2981",hash:"0x43cbcd1e236680191dc99331a601748da946e448983b75d4a290e85beb1d1ca1"},
] as const;
const origin="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45688750270";
export function GenericAbiLocalEvmPanel(){
  return <section data-testid="oecl-generic-abi-evm" aria-label="Compiler-derived safe ABI EVM experiment"
    className="space-y-4 rounded-2xl border border-[#bad5c6] bg-[#f7fcf8] p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#236a46]">
          First capability-derived local EVM experiment
        </p>
        <h4 className="mt-2 text-xl font-semibold text-[#214d35]">
          ERC-165 × ERC-2981: identical typed method, different observed support
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#547263]">
          OECL compiled immutable OpenZeppelin 4.9.6 source profiles, automatically checked
          the shared supportsInterface(bytes4) ABI, generated concrete inheritance-only wrappers
          for the abstract bases and preregistered three challenges before Hardhat deployment.
        </p>
      </div>
      <span className="rounded-full border border-[#e1c69a] bg-[#fff9ed] px-3 py-1 text-[11px] font-semibold text-[#825f35]">
        INCONCLUSIVE · NOT ADMITTED
      </span>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {value:"2",title:"Locally mined deployment receipts"},
        {value:"6",title:"Read-only EVM calls, not receipts"},
        {value:"1",title:"Differing preregistered challenge"},
      ].map(x=><div key={x.title} className="rounded-xl border border-[#dbe9df] bg-white p-3">
        <p className="text-xl font-semibold tabular-nums text-[#265b40]">{x.value}</p>
        <p className="mt-1 text-xs leading-5 text-[#65786b]">{x.title}</p>
      </div>)}
    </div>

    <div className="overflow-x-auto rounded-xl border border-[#d5e5d9] bg-white">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="border-b border-[#e2ece4] bg-[#f0f7f2] text-[#3d6149]">
          <tr><th className="px-3 py-3">Read-only challenge</th>
            <th className="px-3 py-3">ERC-165</th>
            <th className="px-3 py-3">ERC-2981</th>
          </tr>
        </thead>
        <tbody className="text-[#4d6557]">
          {tests.map(t=><tr key={t.id} data-testid="oecl-generic-abi-probe"
            className="border-b border-[#edf1ed] last:border-0">
            <td className="px-3 py-3"><strong>{t.name}</strong>
              <span className="mt-1 block font-mono text-[11px]">{t.id}</span></td>
            <td className="px-3 py-3 font-semibold">{String(t.a)}</td>
            <td className="px-3 py-3 font-semibold">{String(t.b)}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <p className="rounded-xl border border-[#d1dfe8] bg-[#f4f9fc] p-3 text-sm leading-6 text-[#4c6676]">
      The royalty interface identifier returned <strong>false</strong> for the pinned ERC-165
      wrapper and <strong>true</strong> for the pinned ERC-2981 wrapper. This challenges
      behavioral equivalence on one typed method and test input. It does <strong>not</strong>
      establish general ERC compatibility, contract security or mainnet behavior.
    </p>

    <details className="rounded-xl border border-[#d6e4da] bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#355d46]">
        Original deployment receipts, preregistered protocol and limits
      </summary>
      <div className="mt-3 space-y-3 text-xs leading-5 text-[#5b6d60]">
        <p>Isolated Hardhat chain: 31337. The two contract creations were mined,
          rechecked on the local provider and linked to the published run.</p>
        {receipts.map(tx=><p key={tx.id} className="break-all font-mono text-[11px]">
          {tx.id} deployment: {tx.hash}
        </p>)}
        <p className="break-all font-mono text-[11px]">
          Preregistered source/ABI protocol SHA-256:
          0d79bc62ffcd2ea9a6464562a6ffa916daceb43b052d084a8003015136c6fdc8
        </p>
        <p>A separate CI job recompiled sources and checked archived evidence.
          It could not requery the terminated in-memory local chain or authenticate Ethereum mainnet consensus.
          All six interface probes are unmined eth_call results; no arbitrary public Solidity execution is enabled.</p>
      </div>
    </details>

    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#286748]">
      <a href={origin} target="_blank" rel="noopener noreferrer" className="underline">
        Inspect full GitHub Actions experiment and independent review
      </a>
      <a href={origin+"/artifacts/15056484427"} target="_blank" rel="noopener noreferrer"
        className="underline">Original source protocol and local EVM witness JSON</a>
    </div>
  </section>;
}