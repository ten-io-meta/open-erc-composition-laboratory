# Vectorized/solady

Repository: Vectorized/solady

URL: https://github.com/Vectorized/solady

## Description

Automatically generated OECL research bundle from GitHub repository Vectorized/solady.

## Protocols

- ERC1967
- ERC1271
- ERC4337
- ERC7739
- ERC6551
- ERC7562
- IERC6551Executable
- ERC165
- ERC721
- ERC7821
- ERC7579
- ERC1155
- ERC20
- ERC2981
- ERC4626
- ERC6909
- ERC5805
- ERC6372
- IERC721Receiver
- ERC6492
- ERC1167
- ERC2771
- IERC20
- IERC1155Receiver
- IERC20Permit
- ERC1822
- ERC155
- IERC6551Registry

## Capabilities

- Reservation
- Accounting
- InvariantValidation
- Testing
- Redemption

## Claims

- Performs the signature validation without nested EIP-712 if the caller is
- ERC1271 signature validation (Nested EIP-712 workflow).
- Performs the signature validation without nested EIP-712 to allow for easy sign ins.
- `LibClone.deployDeterministicERC1967` to clone the implementation. See: [`ERC4337Factory.sol`](accounts/erc4337factory.md).
- returns (uint256 validationData)
- this validation call returns successfully.
- ) internal virtual returns (uint256 validationData)
- - The ERC4337 standard expects the factory to use deterministic deployment.
- As such, this factory does not include any non-deterministic deployment methods.
- Deploys an ERC4337 account with `ownSalt` and returns its deterministic address.
- Returns the deterministic address of the account created via `createAccount`.
- Recent updates to the account abstraction validation scope rules
- [ERC7562](https://eips.ethereum.org/EIPS/eip-7562) has made ERC6551 compatible with ERC4337.
- user operation validation functionality (and use ERC6551's execution functionality).
- function supportsInterface(bytes4 interfaceId)
- Returns true if this contract implements the interface defined by `interfaceId`.
- - `0x01000000000078210001...`: Single batch. Supports optional `opData`.
- supportsExecutionMode(bytes32)
- function supportsExecutionMode(bytes32 mode)
- deployProxyDeterministic(address,address,bytes32)
- uint256 savedBlockedNumber,
- savedBlockedNumber = _bound(savedBlockedNumber, 0, 2 ** 64 - 1);
- vm.roll(savedBlockedNumber + 1);
- vm.setBlockhash(savedBlockedNumber, hashToSave);
- function testFullMulDivAlwaysRevertsIfDivisorIsZero(uint256 a, uint256 b) public {
- import "./utils/InvariantTest.sol";
- contract ERC20Invariants is SoladyTest, InvariantTest {
- function invariantBalanceSum() public {
- struct _TestVoteInvariantsTemps {
- function testVoteInvariants(bytes32) public {
- _TestVoteInvariantsTemps memory t;
- if (_randomChance(8)) _checkVoteInvariants(t);
- _checkVoteInvariants(t);
- function _checkVoteInvariants(_TestVoteInvariantsTemps memory t) internal {
- `bob` must accept recovery.
- function testCannotExceedMaxBalance() public {
- so always 2 * 2 * 64 = 256
- / @dev bytes32[] because len_in_bytes is always a multiple of 32 in our case even 128
- exponent always 1
- The pool must not also fund a vault for that same payout.
- This must be placed at the end of the `and` clause,
- _mustCompute(this.argsOnClone(instance));
- _mustCompute(this.argsOnClone(instance, _random()));
- _mustCompute(this.argsOnClone(instance, _random(), _random()));
- _mustCompute(this.argsOnERC1967(instance));
- _mustCompute(this.argsOnERC1967(instance, _random()));
- _mustCompute(this.argsOnERC1967(instance, _random(), _random()));
- _mustCompute(this.argsOnERC1967I(instance));
- _mustCompute(this.argsOnERC1967I(instance, _random()));
- _mustCompute(this.argsOnERC1967I(instance, _random(), _random()));
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository exposes 1995 executable test or invariant target(s).
- Repository uses the Foundry toolchain.
