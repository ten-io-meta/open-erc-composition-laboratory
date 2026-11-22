// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/// @notice EXPERIMENTAL ERC-8098-style test participant, NOT a certified reference implementation.
/// @dev The only supply increase is constructor initialization. No post-deployment mint authority.
contract ERC8098Experimental is ERC20, ERC20Burnable {
    constructor(uint256 initialSupply) ERC20("OECL Monotone Supply Fixture", "O8098") {
        _mint(msg.sender, initialSupply);
    }
}
