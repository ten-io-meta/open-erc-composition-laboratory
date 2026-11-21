// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IOECLValueNFT is IERC721 {
    function burn(uint256 tokenId) external;
    function valueOf(uint256 tokenId) external view returns (uint256);
}

interface IOECLMonotoneSupply {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
    function totalSupply() external view returns (uint256);
}

/// @notice Local experiment only: atomically burn a value NFT and non-increasing ERC-20.
/// @dev Not a proposed ERC, production router or protocol-compliance certificate.
contract OECLJointRedemption is ReentrancyGuard {
    IOECLValueNFT public immutable nft;
    IOECLMonotoneSupply public immutable supplyToken;
    uint256 public immutable burnUnits;

    event JointRedeemed(address indexed owner, uint256 indexed tokenId, uint256 ethPaid, uint256 unitsBurned);

    constructor(address nft_, address supplyToken_, uint256 burnUnits_) {
        require(nft_ != address(0) && supplyToken_ != address(0), "Zero participant");
        require(burnUnits_ > 0, "Zero burn");
        nft = IOECLValueNFT(nft_);
        supplyToken = IOECLMonotoneSupply(supplyToken_);
        burnUnits = burnUnits_;
    }

    function redeem(uint256 tokenId) external nonReentrant {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        uint256 value = nft.valueOf(tokenId);
        uint256 supplyBefore = supplyToken.totalSupply();

        // Atomic cross-contract operation: every later failure reverts both transfers and burns.
        nft.transferFrom(msg.sender, address(this), tokenId);
        require(supplyToken.transferFrom(msg.sender, address(this), burnUnits), "Token transfer failed");
        nft.burn(tokenId);
        supplyToken.burn(burnUnits);
        require(supplyToken.totalSupply() == supplyBefore - burnUnits, "Unexpected supply evolution");

        (bool paid, ) = payable(msg.sender).call{value: value}("");
        require(paid, "ETH payment failed");
        emit JointRedeemed(msg.sender, tokenId, value, burnUnits);
    }

    receive() external payable {}
}
