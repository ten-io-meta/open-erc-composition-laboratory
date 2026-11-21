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
