# foundry-rs/foundry

Repository: foundry-rs/foundry

URL: https://github.com/foundry-rs/foundry

## Description

Automatically generated OECL research bundle from GitHub repository foundry-rs/foundry.

## Protocols

- IERC20ToBytes32Map
- IERC20
- IERC20ToBytes32MapEntry
- ERC20
- IERC721
- IERC165
- ERC1155
- ERC165
- ERC7201
- IERC721Empty
- IERC20Permit
- ERC1967
- IERC4626
- IERC712View
- IERC1271
- ERC721
- IERC20Metadata
- IERC3156FlashBorrower
- IERC20Aux
- IERC20Incorrect
- IERC20Correct
- IERC20NamedCorrect
- IERC721Incorrect
- IERC721Correct
- IERC721NamedCorrect
- IERC20Like
- IERC20LikeMetadata
- ERC6909
- IERC20Wrapper
- IERC721Receiver
- IERC165Upgradeable
- IERC721Upgradeable
- IERC20Upgradeable
- IERC20MetadataUpgradeable
- IERC3156FlashLender
- ERC3156
- IERC20Indexable
- ERC4494
- IERC4494
- IERC4494Alternative
- ERC1271
- ERC2981
- IERC1155
- IERC1155Receiver
- IERC173
- ERC173
- IERC1155Internal
- IERC2612
- IERC20Internal
- IERC1155Enumerable

## Capabilities

- Reservation
- Accounting
- EmbeddedValue
- InvariantValidation
- Testing
- Redemption

## Claims

- Made Anvil state dumps deterministic by sorting blocks, transactions, and historical state.
- Kept fork endpoint identity validation strict and atomic during resets and RPC URL replacement.
- Updated Foundry's Ethereum, Optimism, and Tempo EVM integrations to revm 42, including Amsterdam state-gas accounting and the latest hardfork mappings.
- Added optional Touch ID-assisted authentication for encrypted Cast keystores used by Cast and Forge on supported macOS builds. Packaged Apple Silicon releases enable Touch ID, while the packaged Intel macOS artifact retains its previous deployment target without the `touch-id` feature. Authentication may fall back to the macOS login password, and explicit keystore passwords remain supported. Cast can report, enroll, and remove Touch ID enrollment for existing keystores. Wallet listings hide recognized sidecars while preserving and deterministically ordering unknown files.
- Treat zero invariant time and block delay limits as disabled instead of panicking.
- Reduced gas report runtime and peak memory use for fuzz and invariant tests.
- Include singleton entries and final transactions when splicing invariant fuzz corpora.
- Fixed persistent trace-cmp values in the fuzz dictionary being dropped when state values are reverted between invariant runs.
- PR validation is deterministic and independent of the advisory AI suggestion. It rejects
- Fixed persisted failures causing secondary invariants to be skipped in later campaigns.
- Reduced symbolic model validation overhead by caching shared expression results.
- Unified stateless and invariant fuzz execution behind a shared campaign lifecycle, ensuring rejected
- invariant assumptions do not advance the block timestamp or number.
- Unified stateless and invariant fuzz input generation behind a shared sequence pipeline.
- For fuzz or invariant corpus coverage work, `forge test --showmap-out <DIR>`
- not include validation/testing boilerplate such as "Validated with", "Tested
- - For invariant or campaign-style benchmarking, use `foundry-scfuzzbench`; this
- is the local equivalent of the `derek bench invariant`/`decofe bench
- invariant` PR flow, which publishes a `scfuzzbench` event.
- Do not use `foundry-bench` for long-running invariant campaign quality,
- CARGO_TERM_COLOR: always
- run: cargo nextest run --locked --profile flaky --no-fail-fast
- # Use a unique key for each run to always update the cache.
- cargo nextest run --locked "${args[@]}"
- config: multiline_func_header = "params_always"
- always returns true
- require(a > 0, "a must be positive");
- require(b > 0, "b must be positive");
- require(value > 0, "ExternalMathLib: value must be positive");
- require(value > 0, "InternalMathLib: value must be positive");
- require(value > 0, "Value must be greater than zero");
- require(value > 0, "Value must be positive");
- / Ensure that you cannot use expectCall with an expectRevert.
- This should fail, as this event is never emitted
- / While we can ignore static calls, we cannot ignore normal calls.
- Regression: must fail because 0xdead is not the actual reverter when a
- Regression: must fail because the reverter address argument is enforced
- Regression: must fail when the innermost reverting frame is a nested
- the outer address must fail.
- assertGt(uint256(orderId), 0, "order id must be non-zero");
- assertEq(quote.allowance(payer, STABLECOIN_DEX), 0, "allowance must remain zero");
- Permit on a side branch must not suppress the fall-through path.
- Guard scoped to one branch must not leak.
- Sink runs before the equality short-circuits — the guard cannot retroactively
- Modifier guard placed *after* `_;` cannot be hoisted.
- State-var token reassigned after permit must invalidate the record.
- State-var owner reassigned after permit must invalidate the record.
- `immutable` state vars can chain: storage cannot be rewritten post-deploy.
- ERC721 same-named methods must NOT trigger this lint.
- Flash-loan call on the RHS of `&&` may not execute; its repayment must not leak.
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository toolchain could not be determined.
