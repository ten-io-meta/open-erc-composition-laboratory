"use client";

/*
 * Read-only editorial view of the exact externally archived, independently
 * recompiled Hardhat-local ERC20/ ERC20Burnable stateful science cycle.
 * The web NEVER triggers experiments, deploys tokens or claims mainnet receipts.
 */
const origin="https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45694620334";
const initial={owner:"100",recipient:"0",allowance:"50",supply:"100"};
const final=[
  {id:"ERC-20",owner:"75",recipient:"25",allowance:"25",supply:"100"},
  {id:"ERC-20-BURNABLE",owner:"65",recipient:"25",allowance:"15",supply:"90"}
] as const;
const checks=[
  {name:"Unauthorized transferFrom (both fixtures)",count:"2",result:"Unmined eth_call revert"},
  {name:"Transfer above allowance (both fixtures)",count:"2",result:"Unmined eth_call revert"},
  {name:"Unauthorized burnFrom",count:"1",result:"Unmined eth_call revert"},
  {name:"Direct burn above account balance",count:"1",result:"Unmined eth_call revert"},
  {name:"Zero transfer (both fixtures) and zero burn",count:"3",result:"Mined successfully, state unchanged"},
] as const;
const receipts=[
  {label:"ERC-20 constructor",hash:"0x773218889e5300dc83b6dc3ac0d41e17ac912a3c20940d2d8f2d1a69c73a4973"},
  {label:"ERC20Burnable constructor",hash:"0x0820c63db164666ee1a44e9befb5d981d6a3ece340388b629156b29df522843f"},
  {label:"Approved transferFrom",hash:"0x083775c5d25fb87bcef87b362e9b222452bc220c0f67598f76fb497e1a42be54"},
  {label:"Approved burnFrom",hash:"0x91f43aff9078161a322f4d47b3a8e033e215719c6baa3b1f4d0f6461a50aacd4"},
] as const;
export function GenericStatefulEvmPanel(){
  return <section data-testid="oecl-reviewed-stateful-evm"
      aria-label="Reviewed source-driven stateful ERC20 local EVM scientific evidence"
      className="space-y-4 rounded-2xl border border-[#bad4c4] bg-[#f7fcf8] p-5 md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#236a46]">
          Stateful scientific cycle · ABI + compiler AST → falsifier → Hardhat → independent review
        </p>
        <h4 className="mt-2 text-xl font-semibold text-[#214d35]">
          ERC-20 × ERC20Burnable: allowance-based transfer and supply burn
        </h4>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#547263]">
          A reviewed compiler-AST and typed ABI protocol registered amounts, callers and adversarial
          controls before deploying two independent OpenZeppelin 4.9.6 fixtures on a local Hardhat EVM.
          ERC20Burnable is an implementation extension, not a separately numbered ERC.
        </p>
      </div>
      <span className="rounded-full border border-[#e1c69a] bg-[#fff9ed] px-3 py-1 text-[11px] font-semibold text-[#825f35]">
        INCONCLUSIVE · NOT ADMITTED
      </span>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {value:"12",title:"Locally mined successful receipts, including setup and deployments"},
        {value:"6",title:"Negative EVM callStatic reverts, not mined"},
        {value:"2",title:"Independently checked token ledgers"},
      ].map(x=><div key={x.title} className="rounded-xl border border-[#dbe9df] bg-white p-3">
        <p className="text-xl font-semibold tabular-nums text-[#265b40]">{x.value}</p>
        <p className="mt-1 text-xs leading-5 text-[#65786b]">{x.title}</p>
      </div>)}
    </div>

    <div>
      <h5 className="text-sm font-semibold text-[#365e46]">Measured accounting after the registered tests</h5>
      <p className="mt-1 text-xs leading-5 text-[#64796b]">
        Both fixtures started with {initial.owner} test-minted raw token units owned by the operator,
        an approval of {initial.allowance} and no recipient balance. Values below are raw uint256 units,
        not prices or economic equivalence.
      </p>
      <div className="mt-2 overflow-x-auto rounded-xl border border-[#d5e5d9] bg-white">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="border-b border-[#e2ece4] bg-[#f0f7f2] text-[#3d6149]">
            <tr><th className="px-3 py-3">Reviewed fixture</th>
              <th className="px-3 py-3">Owner</th><th className="px-3 py-3">Recipient</th>
              <th className="px-3 py-3">Allowance</th><th className="px-3 py-3">Supply</th></tr>
          </thead>
          <tbody className="text-[#4d6557]">
            {final.map(x=><tr key={x.id} data-testid="oecl-stateful-ledger"
                className="border-b border-[#edf1ed] last:border-0">
              <td className="px-3 py-3 font-semibold">{x.id}</td>
              <td className="px-3 py-3 tabular-nums">{x.owner}</td>
              <td className="px-3 py-3 tabular-nums">{x.recipient}</td>
              <td className="px-3 py-3 tabular-nums">{x.allowance}</td>
              <td className="px-3 py-3 tabular-nums">{x.supply}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>

    <div className="rounded-xl border border-[#d7e5d9] bg-white p-4">
      <h5 className="text-sm font-semibold text-[#365e46]">Falsification and boundary controls</h5>
      <div className="mt-2 space-y-2">
        {checks.map(x=><div key={x.name} className="flex flex-wrap justify-between gap-2
            border-b border-[#edf1ed] py-2 text-xs last:border-0">
          <span className="font-medium text-[#425a4b]">{x.name} ({x.count})</span>
          <span className="text-[#66796b]">{x.result}</span>
        </div>)}
      </div>
    </div>

    <p className="rounded-xl border border-[#e5d7b6] bg-[#fff9ed] p-3 text-xs leading-6 text-[#785e38]">
      <strong>Scientific boundary:</strong> Both source implementations were wrapped in local fixture
      contracts adding a deliberately unprotected <code>oeclResearchMint</code> for initial balances.
      This capability is <strong>not</strong> part of standard ERC-20. The results prove neither
      cross-contract atomicity, production contract security, universal compatibility nor Ethereum
      mainnet execution. ERC-20 × ERC-721 was explicitly refused by the stateful capability gate.
    </p>

    <details className="rounded-xl border border-[#d6e4da] bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-[#355d46]">
        Original local receipts, preregistration digest and independent review
      </summary>
      <div className="mt-3 space-y-3 text-xs leading-5 text-[#5b6d60]">
        <p>Hardhat chain 31337; these four example hashes are from among 12 successful locally
          mined transactions. All six expected-revert controls were unmined callStatic results.</p>
        {receipts.map(tx=><p key={tx.label} className="break-all font-mono text-[11px]">
          {tx.label}: {tx.hash}
        </p>)}
        <p className="break-all font-mono text-[11px]">
          Preregistered protocol SHA-256:
          e886432b9e66a8f8daf6d6befb445daddca2f169e004d123c08bc01b2d7f5b25
        </p>
        <p>A second GitHub Actions runner rebuilt the source AST, ABI, harness and expected
          protocol and reconciled the archived ledger. It cannot independently requery
          a terminated in-memory blockchain or authenticate these receipts to mainnet.</p>
      </div>
    </details>

    <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#286748]">
      <a href={origin} target="_blank" rel="noopener noreferrer" className="underline">
        Original stateful local EVM execution and independent review
      </a>
      <a href={origin+"/artifacts/15059574119"} target="_blank" rel="noopener noreferrer"
        className="underline">Raw source plan, ledger, mined receipts and negative observations</a>
    </div>
  </section>;
}