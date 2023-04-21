// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// allows for console logging in project
import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track balances
    // Mapping is a key/value pair and a state variable
    // We define the data type of the key and value, variable is balanceOf
    mapping(address => uint256) public balanceOf;
    // Send tokens

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        // msg is a Solidity global variable, sender is the address
        // add the balance of the sender
        balanceOf[msg.sender] = totalSupply;
    }
}
