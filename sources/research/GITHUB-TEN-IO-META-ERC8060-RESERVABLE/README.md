# ten-io-meta/erc8060-reservable

Repository: ten-io-meta/erc8060-reservable

URL: https://github.com/ten-io-meta/erc8060-reservable

## Description

Automatically generated OECL research bundle from GitHub repository ten-io-meta/erc8060-reservable.

## Protocols

- IERC8060Reservable
- ERC8004
- ERC8281
- ERC8060

## Capabilities

- Reservation
- Accounting
- Settlement
- EmbeddedValue
- InvariantValidation
- Testing
- Redemption

## Claims

- Commitment Accounting for ERC-8060
- These applications require accounting for commitments rather than moving assets.
- The missing primitive is commitment accounting.
- The extension only tracks commitment accounting.
- IERC8060Reservable	Commitment accounting
- IERC8060Reservable provides commitment accounting for that value.
- Draft (Protocol-Closed Accounting Layer)
- IERC8060Reservable extends ERC-8060 with a minimal reservation accounting primitive.
- These concerns were classified as application-layer concerns rather than accounting-layer concerns.
- No protocol-layer accounting defect was identified.
- No missing mandatory accounting primitive was identified.
- IERC8060Reservable appears protocol-closed for reservation accounting.
- No additional accounting primitive has been demonstrated as necessary.
- Final hostile review rounds did not identify any transaction sequence capable of violating the documented accounting invariants. Remaining concerns were classified as integration-layer, application-layer, disclosure-layer, or recoverability-layer risks.
- IERC8060Reservable standardizes reservation accounting.
- IERC8060Reservable remains a minimal accounting primitive.
- IERC8060Reservable intentionally standardizes only reservation accounting.
- Applications may voluntarily expose recovery functionality while preserving reservation accounting compatibility.
- IERC8060Reservable supports both:
- Minimal reservation accounting extension for ERC-8060 value-bearing NFTs.
- it("blocks owner withdraw when value is locked", async function () {
- it("keeps locked value bound to tokenId after transfer", async function () {
- it("reducing allowance does not release already locked value", async function () {
- expect((await mock.lockedValue(TOKEN_ID, ETH)).toString()).to.equal(
- expect((await mock.availableValue(TOKEN_ID, ETH)).toString()).to.equal(
- it("cannot reserve zero value", async function () {
- it("cannot release zero value", async function () {
- it("underlying value inflation increases available value without changing locked value", async function () {
- expect((await mock.lockedValue(TOKEN_ID, ETH)).toString()).to.equal("0");
- expect((await mock.lockedValue(TOKEN_ID_2, ETH)).toString()).to.equal("0");
- it("prevents spender from releasing more than its own locked allocation", async function () {
- it("releases locked value back to available value", async function () {
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("1000");
- expect((await token.availableValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("0");
- expect(error.message).to.include("insufficient available value");
- it("new owner can reserve remaining available value after transfer", async function () {
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("700");
- expect((await token.availableValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("300");
- it("old spender cannot reserve more after transfer without sufficient allowance", async function () {
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("100");
- expect((await token.availableValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("900");
- it("new owner can withdraw only available value after transfer", async function () {
- ethers.utils.toUtf8Bytes("new-owner-withdraw-available")
- it("cannot reserve after new owner withdraws all available value", async function () {
- it("active obligations remain releasable after available value is withdrawn", async function () {
- ethers.utils.toUtf8Bytes("withdraw-available-then-release")
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("400");
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("0");
- expect((await token.availableValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("700");
- expect((await token.lockedValue(TOKEN_ID, ETH_ASSET)).toString()).to.equal("900");
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository exposes 61 executable test or invariant target(s).
- Repository uses the Hardhat toolchain.
