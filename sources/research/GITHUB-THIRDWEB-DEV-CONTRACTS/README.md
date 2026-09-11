# thirdweb-dev/contracts

Repository: thirdweb-dev/contracts

URL: https://github.com/thirdweb-dev/contracts

## Description

Automatically generated OECL research bundle from GitHub repository thirdweb-dev/contracts.

## Protocols

- ERC20
- ERC1155
- ERC165
- IERC165
- IERC2981
- ERC2981
- ERC721
- IERC721Metadata
- IERC1155Receiver
- IERC20
- IERC20Metadata
- IERC721Receiver
- IERC1155
- IERC1155Metadata
- ERC1271
- IERC721A
- IERC721
- IERC721AUpgradeable
- IERC721ReceiverUpgradeable
- IERC165Upgradeable
- IERC721Upgradeable
- IERC721MetadataUpgradeable
- IERC1155Enumerable
- IERC1155Supply
- IERC20Permit
- IERC4906
- IERC721Enumerable
- IERC721Supply
- IERC721AQueryable
- IERC721AQueryableUpgradeable
- ERC2309
- ERC1967
- IERC2309
- IERC2771Context
- ERC2771
- IERC1822Proxiable
- ERC1167
- ERC1822
- IERC20Upgradeable
- IERC1822
- ERC6551
- IERC6551Account
- ERC4337
- ERC777
- IERC777Recipient
- IERC2981Upgradeable
- IERC1155Upgradeable
- IERC20MetadataUpgradeable
- IERC1155ReceiverUpgradeable
- IERC1155MetadataURIUpgradeable
- ERC11555
- ERC155
- ERC71155
- ERC191
- IERC721EnumerableUpgradeable

## Capabilities

- Reservation
- Accounting
- InvariantValidation
- Testing
- Redemption

## Claims

- To be able to escrow NFTs in the case of auctions, Marketplace implements the receiver interfaces for [ERC1155](https://eips.ethereum.org/EIPS/eip-1155) and [ERC721](https://eips.ethereum.org/EIPS/eip-721) tokens.
- To enable meta-transactions (gasless), Marketplace implements [ERC2771](https://eips.ethereum.org/EIPS/eip-2771).
- The contract supports both ERC20 currencies and a chain's native token (e.g. ether for Ethereum mainnet). This means that any action that involves transferring currency (e.g. buying a token from a direct listing) can be performed with either an ERC20 token or the chain's native token.
- At a high level, we want `Marketplace` to be a single smart contract that supports all features related to both direct listings *and* auction listings.
- The `Marketplace` contract supports both ERC20 currencies, and a chain's native token (e.g. ether for Ethereum mainnet). This means that any action that involves transferring currency (e.g. buying a token from a direct listing) can be performed with either an ERC20 token or the chain's native token.
- | 2981 | https://eips.ethereum.org/EIPS/eip-2981 | Multiwrap implements ERC 2981 for distributing royalties for sales of the wrapped NFTs. |
- | 2771 | https://eips.ethereum.org/EIPS/eip-2771 | Multiwrap implements ERC 2771 to support meta-transactions (aka “gasless” transactions). |
- uint256 _availableAmount = drop.availableAmount(id);
- assertEq(drop.availableAmount(id), _availableAmount - quantity);
- function test_revert_claim_nonAllowlistedClaimer_exceedsAvailable() public {
- for (; i < _availableAmount; i++) {
- vm.expectRevert("exceeds available tokens.");
- uint256 _availableAmount = drop.availableAmount();
- assertEq(erc20.balanceOf(address(airdropTokenOwner)), _availableAmount - quantity);
- assertEq(drop.availableAmount(), _availableAmount - quantity);
- / @notice Emitted when a buyer is approved to buy from a reserved listing.
- bool reserved = false;
- function test_approveBuyerForListing_whenListingNotReserved() public whenListingExists whenCallerIsListingCreator {
- vm.expectRevert("Marketplace: listing not reserved.");
- modifier whenListingIsReserved() {
- listingParams.reserved = true;
- function test_approveBuyerForListing_whenListingIsReserved()
- whenListingIsReserved
- bool reserved = true;
- vm.expectRevert("Marketplace: msg.value must exactly be the total price.");
- assertEq(listing.reserved, true);
- vm.expectRevert("Marketplace: cannot update what token is listed.");
- assertEq(updatedListing.reserved, true);
- assertEq(listing.reserved, reserved);
- vm.expectRevert("Marketplace: listed token must be ERC1155 or ERC721.");
- assertEq(listing.reserved, listingParamsToUpdate.reserved);
- assertEq(DirectListingsLogic(marketplace).getListing(listingId).reserved, true);
- Seller approves buyer for reserved listing.
- Someone other than the seller approves buyer for reserved listing.
- function test_revert_approveBuyerForListing_listingNotReserved() public {
- listingParamsToUpdate.reserved = false;
- assertEq(DirectListingsLogic(marketplace).getListing(listingId).reserved, false);
- Repository contains README research context.
- Repository contains contract or interface material.
- Repository contains test evidence.
- Repository contains documentation material.
- Repository contains invariant-like statements.
- Repository exposes 2147 executable test or invariant target(s).
- Repository uses the Foundry toolchain.
