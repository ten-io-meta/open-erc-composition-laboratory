// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title ERC8098Reference
 * @notice Non-upgradeable example implementation of the proposed ERC-8098 ERC-20 profile.
 * @dev A fixed constructor allocation is the only mint. No exposed post-deployment
 *      mint, proxy upgrade, governance hook, custom balance mirror, or supply mirror.
 *      This is a reference *candidate*, not an audit or ERC committee endorsement.
 */
contract ERC8098Reference is ERC20, ERC20Burnable {
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        address initialHolder
    ) ERC20(tokenName, tokenSymbol) {
        require(initialHolder != address(0), "ERC8098: zero initial holder");
        _mint(initialHolder, initialSupply);
    }
}
