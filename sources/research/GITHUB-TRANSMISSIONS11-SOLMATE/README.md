# transmissions11/solmate

Repository: transmissions11/solmate

URL: https://github.com/transmissions11/solmate

## Description

Automatically generated OECL research bundle from GitHub repository transmissions11/solmate.

## Protocols

- ERC20
- ERC721
- ERC1155
- ERC4626
- ERC6909
- ERC155
- ERC165
- ERC777

## Capabilities

- Accounting
- InvariantValidation
- Testing
- Redemption

## Claims

- │  ├─ RolesAuthority — "Role based Authority that supports up to 256 roles"
- ├─ CREATE3 — "Deploy to deterministic addresses without an initcode factor"
- - There are implicit invariants these contracts expect to hold.
- import {DSInvariantTest} from "./utils/DSInvariantTest.sol";
- function invariantMetadata() public {
- contract ERC20Invariants is DSTestPlus, DSInvariantTest {
- function invariantBalanceSum() public {
- must be unchecked in order to support `n = type(int256).min`
- function invariantReentrancyStatusAlways1() public {
- contract DSInvariantTest {
- if (b == 0) return assertEq(a, b); // If the expected is 0, actual must be too.
- Cannot overflow because the sum of all user
- contract WETHInvariants is DSTestPlus, DSInvariantTest {
- function invariantTotalSupplyEqualsBalance() public {
- always swap out the authority even if it's reverting or using up a lot of gas.
- the array index counter which cannot possibly overflow.
- / @dev Do not manually set balances without updating totalSupply, as the sum of all user balances must not exceed it.
- the owner's nonce which cannot realistically overflow.
- Cannot underflow because a user's balance
- will never be larger than the total supply.
- uint256 private locked = 1;
- require(locked == 1, "REENTRANCY");
- return wadExp((wadLn(x) * y) / 1e18); // Using ln(x) means x must be greater than 0.
- basis, so the final right shift is always by a positive amount.
- Prefix the bytecode with a STOP opcode to ensure it cannot be called.
- This is **experimental software** and is provided on an "as is" and "as available" basis.
- - There are implicit invariants these contracts expect to hold.
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository exposes 562 executable test or invariant target(s).
- Repository uses the Foundry toolchain.
