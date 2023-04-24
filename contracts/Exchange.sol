// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import './Token.sol';

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    // args: token address, user address, tokens to be deposited
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit tokens
    function depositToken(
        address _token,
        uint256 _amount
    ) public {
        // Transfer tokens to exchange (parenthesis instantiate the smart contract Token)
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // Update user balance (old balance plus transaction amount)
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check balances (read from tokens mapping)
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

}