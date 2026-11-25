"use client";

/* Exact archived local Hardhat-only experiment; no browser EVM dispatch. */
const origin="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45701796743";
const deployments=[
  {id:"ERC-721",hash:"0xe3a41efeaed576bf6721d29427efab56e3da98863a2f86783554345b6b72da0a"},
  {id:"ERC-1155",hash:"0xaeceef94811cb309af4641046efed4dfa1cef37e30df59a862caf81958f3c53a"}
] as const;
const checks=[
  {name:"ERC-721: third party without approval",kind:"Unmined eth_call revert"},
  {name:"ERC-721: reusing approval after transfer",kind:"Unmined eth_call revert"},
  {name:"ERC-721: operator after revocation",kind:"Unmined eth_call revert"},
  {name:"ERC-721: transfer to the zero address",kind:"Unmined eth_call revert"},
  {name:"ERC-1155: unapproved operator",kind:"Unmined eth_call revert"},
  {name:"ERC-1155: transfer above remaining balance",kind:"Unmined eth_call revert"},
  {name:"ERC-1155: operator after revocation",kind:"Unmined eth_call revert"},
  {name:"ERC-1155: transfer to the zero address",kind:"Unmined eth_call revert"}
] as const;
export function GenericNftAuthorizationEvmPanel(){
  return <section data-testid="oecl-nft-ownership-local-evm"
      aria-label="Reviewed ERC721 and ERC1155 permission-based local EVM scientific evidence"
      className="space-y-4 rounded-2xl border border-[#bad4c4] bg-[#f7fcf8] p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#236a46]">
          Compiler AST + typed ABI → preregistered owner/operator tests → local Hardhat → independent review
        </p>
        <h4 className="mt-2 text-xl font-semibold text-[#214d35]">
          ERC-721 × ERC-1155: independent permission models tested
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#547263]">
          The registered OpenZeppelin 4.9.6 implementations were compiled and checked for
          approval-to-transfer call paths and actual storage writes. Hash-identified test-only
          minting wrappers supplied initial assets. Both contracts ran separately on local Hardhat 31337.
        </p>
      </div>
      <span className="rounded-full border border-[#e1c69a] bg-[#fff9ed] px-3 py-1 text-[11px] font-semibold text-[#825f35]">
        INCONCLUSIVE · NOT ADMITTED
      </span>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {value:"15",title:"Locally mined successes, including two deployments"},
        {value:"8",title:"Adversarial unmined eth_call reverts"},
        {value:"18",title:"Forged evidence mutations rejected"},
      ].map(x=><div key={x.title} className="rounded-xl border border-[#dbe9df] bg-white p-3">
        <p className="text-xl font-semibold tabular-nums text-[#265b40]">{x.value}</p>
        <p className="mt-1 text-xs leading-5 text-[#65786b]">{x.title}</p>
      </div>)}
    </div>

    <div className="overflow-x-auto rounded-xl border border-[#d5e5d9] bg-white">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="border-b border-[#e2ece4] bg-[#f0f7f2] text-[#3d6149]">
          <tr><th className="px-3 py-3">Isolated local fixture</th>
            <th className="px-3 py-3">Owner after tests</th>
            <th className="px-3 py-3">Recipient after tests</th>
            <th className="px-3 py-3">Operator approval</th></tr>
        </thead>
        <tbody className="text-[#4d6557]">
          <tr data-testid="oecl-nft-ownership-ledger">
            <td className="px-3 py-3 font-semibold">ERC-721 · NFTs 101, 102, 103</td>
            <td className="px-3 py-3">1 NFT (103)</td>
            <td className="px-3 py-3">2 NFTs (101, 102)</td>
            <td className="px-3 py-3">Revoked</td>
          </tr>
          <tr data-testid="oecl-nft-ownership-ledger">
            <td className="px-3 py-3 font-semibold">ERC-1155 · ID 101</td>
            <td className="px-3 py-3">75 raw units</td>
            <td className="px-3 py-3">25 raw units</td>
            <td className="px-3 py-3">Revoked</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p className="rounded-xl border border-[#d1dfe8] bg-[#f4f9fc] p-3 text-xs leading-6 text-[#486475]">
      In the ERC-721 fixture, a per-token approval was used and then cleared following the
      first transfer; a separately approved global operator moved token 102. In the ERC-1155
      fixture, 25 of the original 100 units were moved, and a zero-quantity transfer succeeded
      without changing the balances. Both fixtures subsequently revoked operator access.
    </p>

    <details className="rounded-xl border border-[#d6e4da] bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#355d46]">
        View eight refuters, mined deployment receipts and protocol SHA-256
      </summary>
      <div className="mt-3 space-y-3">
        <div className="space-y-2">
          {checks.map(x=><div key={x.name} className="flex flex-wrap justify-between gap-2
              border-b border-[#edf1ed] pb-2 text-xs last:border-0">
            <span className="font-medium text-[#425a4b]">{x.name}</span>
            <span className="text-[#66796b]">{x.kind}</span>
          </div>)}
        </div>
        <p className="text-xs text-[#5b6d60]">
          Two locally mined creation transactions, independently rechecked against local blocks:
        </p>
        {deployments.map(d=><p key={d.id} className="break-all font-mono text-[11px] text-[#5b6d60]">
          {d.id}: {d.hash}
        </p>)}
        <p className="break-all font-mono text-[11px] text-[#5b6d60]">
          Preregistered experimental protocol SHA-256:
          c7fbc79a601c24839e9cb49cc82093cb538dab16fe1d66fb2dc74054e91cf496
        </p>
      </div>
    </details>

    <p className="rounded-xl border border-[#e5d7b6] bg-[#fff9ed] p-3 text-xs leading-6 text-[#785e38]">
      <strong>Scope:</strong> Both deployments use deliberately unprotected, test-only minting
      methods not present in the unchanged originals. The independent job rebuilt the protocol
      and checked the archived state, but could not query the terminated Hardhat chain or
      authenticate Ethereum mainnet. No actual ERC-721 × ERC-1155 cross-contract integration,
      security certification or general compatibility verdict is established.
    </p>

    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#286748]">
      <a href={origin} target="_blank" rel="noopener noreferrer" className="underline">
        Original local EVM execution and independent review
      </a>
      <a href={origin+"/artifacts/15064385479"} target="_blank"
        rel="noopener noreferrer" className="underline">
        Preregistered source plan and complete EVM witness JSON
      </a>
    </div>
  </section>;
}