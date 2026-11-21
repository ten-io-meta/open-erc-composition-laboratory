# ERC-8098 non-increasing supply reference candidate

This directory contains a **standalone, non-upgradeable reference candidate**
for the author's [draft ERC-8098](https://github.com/ethereum/ERCs/pull/1390).
It is not a change to the editorial ERC PR and does not claim EIP editor
approval, independent audit, or certification.

## Specification mapping

- No post-deployment supply increase: `_mint` is called **only in the
  constructor** and the derived contract exposes no mint function.
- Burns through OpenZeppelin ERC20Burnable decrease canonical
  `totalSupply()` and emit `Transfer(from, address(0), amount)`.
- One canonical ERC-20 balance and supply state, inherited from OpenZeppelin
  ERC20. No custom virtual units, wrapper balances, synthetic mirrors, or
  internal parallel accounting.
- No upgrade mechanism, proxy, owner, admin, role-based minting, or external
  initialization path.
- ERC-20 transfers and allowances do not modify `totalSupply()`.

## Source/provenance

The Solidity contract and tests are authored within OECL as a **portable
reference candidate** and must later be moved to a dedicated implementation
repository if a repository-independent source is required. They are not
an independently authored third-party implementation. For automated tests
the workflow uses the original ERC-8060 reference repository only as a
pre-existing, pinned Hardhat toolchain; the ERC-8060 source code is **not**
required by or imported into ERC-8098.

Dependency: OpenZeppelin Contracts `4.9.6` pinned by the toolchain's
`package-lock.json`. Solidity `0.8.20`. No TEN.IO business logic.

## Scope and limitations

A passing finite test suite demonstrates conformance **for the tested
execution paths**, not a mathematical proof that every possible trace is
safe. Solidity implementation inheritance, upstream dependencies and build
configuration are part of the trust boundary. Non-upgradeability and the
lack of any alternate accounting representation must also be checked by
source review and static analysis. The standard does not require zero-
knowledge privacy; the draft's proof-compatibility paragraph describes
a possible later use case, not a mandatory privacy feature.

## Local reproduction

Run with Hardhat 2.22.19 and `@openzeppelin/contracts` 4.9.6:

```bash
npx hardhat test test/ERC8098Reference.test.js
```

This contract is not evidence by itself of ERC-8060 × ERC-8098 composition.
The separate OECL joint harness must still bind both source revisions
and record candidate-specific constraints and execution receipts.
