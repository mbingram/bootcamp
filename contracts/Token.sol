// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// allows for console logging in project
import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Mapping is a key/value pair and a state variable
    // We define the data type of the key and value, variable is balanceOf
    mapping(address => uint256) public balanceOf;
    // first address is always msg.sender
    mapping(address => mapping(address => uint256)) public allowance;

    // events provide tracking and alerts for users who are subscribed to the event
    event Transfer(address indexed from, address indexed to, uint256 value);
    // indexed keyword makes it easier to filter events

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

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

    // transfer functions must fire the Transfer event
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_to != address(0));
        // Deduct tokens from sender
        balanceOf[_from] = balanceOf[_from] - _value;
        // Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;

        emit Transfer(_from, _to, _value);
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0));
        // nested mapping accessed with two sets of brackets
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // check approval
        require(_value <= balanceOf[_from], 'insufficient balance');
        require(_value <= allowance[_from][msg.sender], 'insufficient allowance');

        // reset allowance
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;

        // spend tokens
        _transfer(_from, _to, _value);
        return true;
    }

}
