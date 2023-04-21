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
    // transfer functions must fire the Transfer event
    // events provide tracking and alerts for users who are subscribed to the event
    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );
    // indexed keyword makes it easier to filter events

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals);
        // msg is a Solidity global variable, sender is the address
        // add the balance of the sender
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);
        require(_to != address(0));
        // Deduct tokens from sender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        // Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;

        // emit event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}
