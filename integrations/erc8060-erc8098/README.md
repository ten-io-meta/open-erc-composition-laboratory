# OECL ERC-8060 × experimental monotone ERC-20 local experiment

This is an **executed Solidity composition experiment**, **not** proof that
ERC-8060 and the proposed ERC-8098 are generally compatible.

## Participant provenance

- A: untouched external `ten-io-meta/erc8060-native-eth-value`,
  pinned to `c7eed906835ab39fbc8439eb0493e5a5371b23a2`.
- B: local `ERC8098Experimental.sol` written for this experiment,
  implementing an initialized ERC-20 with only burn exposed after deployment.
  Its source SHA-256 is preserved in the execution receipt.
- Integration: local `OECLJointRedemption.sol` coordinator.

The integration deploys all contracts to one ephemeral Hardhat EVM,
transfers an ERC-8060 NFT and experimental ERC-20 tokens to the coordinator,
burns both in one atomic transaction and returns the NFT's redeemable ETH.
The test checks solvency, obligation reduction, monotone ERC-20 supply,
absence of retained assets, access control, one-time redemption, and full
rollback when allowances are missing.

The GitHub Actions workflow `joint-composition-local-evm.yml` checks out
ERC-8060 at the pinned Git commit; it only copies the experiment files into
the temporary checkout on the runner. Neither source protocol repository is
modified.

## Evidence and scope

The workflow uploads the execution JSON and a separate validated receipt.
The receipt is **INCONCLUSIVE** for protocol-level scientific polarity:
there is no independent, pinned ERC-8098 reference implementation admitted
by the scientific candidate pipeline, and no complete discovered constraints
for both sources. The successful joint transaction is valid evidence of
behavior in the tested local configuration only.

This experiment does not deploy to a public network, does not demonstrate
economic safety of all possible compositions, and does not automatically
promote the target of an OECL scientific conclusion.

## To establish a candidate-scoped conclusion

1. Provide an independent ERC-8098 implementation at a pinned commit.
2. Admit the exact participant identities and relevant boundary constraints
   through the existing scientific discovery and evaluation pipeline.
3. Register a unique joint harness recipe for the admitted candidate.
4. Re-run the candidate-specific joint experiment, including counterexamples,
   and reconcile the emitted constraint observations.
5. Apply the final evidence gate and review both preservation and violations.

## Independent-source admission gate

The workflow separately executes `check-source-admission.cjs`, which
checks the **actual ERC-8060 Git HEAD**, the `@openzeppelin/contracts`
version and locked integrity (`4.9.6`), and the SHA-256 of the local
second-participant source against the EVM execution receipt.

OpenZeppelin is an independently maintained dependency for ERC-20 behavior,
**not** an independent ERC-8098 implementation. Its presence does not meet
the full-source admission requirement. The resulting machine-readable
`*.admission.json` report is deliberately:

- `compositionCandidateAdmission: BLOCKED_INDEPENDENT_ERC8098_SOURCE_MISSING`
- `allowedScientificPolarity: INCONCLUSIVE`

The four regression cases also confirm that forged independent-source status,
incorrect ERC-8060 revision or altered second-participant source hashes
cannot pass the admission checks. This is a provenance safeguard rather
than an independent ERC-8098 audit.


## Pinned ERC-8060 × ERC-8098: source-bound invariant witnesses

The `joint-pinned-references.yml` workflow now checks out **two autonomous
GitHub implementations** at exact commits. The earlier experimental 8098
fixture is retained only as a separately labelled historical control.

After real local-EVM contract tests and the original transaction receipt
validation, `evaluate-pinned-invariants.cjs` creates
`erc8060-erc8098-pinned.invariants.json`. It links four observed properties
to eight exact source facts:

- ERC-8060: redemption payout, reduction of NFT backing obligations and
  the limited surplus-withdrawal source guard
- ERC-8098: constructor-only mint in the reference candidate, the
  declared ERC-20 and ERC20Burnable inheritance
- OpenZeppelin Contracts **4.9.6**: installed and lockfile-checked ERC20
  `_totalSupply -= amount`, ERC20 `_totalSupply += amount`, and the
  ERC20Burnable `_burn` dispatch

Source excerpts include file paths, line numbers, pinned revisions and
SHA-256 digests. The runtime observations are attributed to the single
successful local-EVM transaction hash. The emitted property witnesses
cover exact gas-adjusted NFT holder payout, remaining NFT solvency,
non-increasing ERC-20 supply, and burn event co-occurrence. The
`check-pinned-invariant-regression.cjs` verifier rejects thirteen mutated
receipts that falsify accounting, supply, source identities or event linkage.

**Scientific boundary:** this report is a *reproducible observation from a
test-generated JSON receipt*, not independent replay of chain data and not a
formal proof of inherited OpenZeppelin logic. The current native scientific
constraint model recognizes source `require(...)` guards, but these four
property witnesses have **not** been admitted as discovered
candidate-specific constraints. The evaluation surface stays `PARTIAL`
and the correct scientific outcome stays `INCONCLUSIVE`. Only a later
discovered candidate with validated complete scope and constraint-level
machine evidence could produce a scoped `SUPPORTS` result.

No changes to the independent ERC repositories and no deployments to a
public network are performed.
