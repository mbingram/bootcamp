// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    mapping(address => mapping(address => uint256)) public tokens; // args: token address, user address, tokens to be deposited
    mapping(uint256 => _Order) public orders; // this mapping is basically a database lookup for the _Order struct

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct _Order {
        uint256 id; // unique identifier per order
        address user; // user who made order
        address tokenGet; // address of token
        uint256 amountGet; // amount user receives
        address tokenGive; // address of token they give
        uint256 amountGive; // amount they give
        uint256 timestamp; // time when order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Deposit tokens
    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange (parenthesis instantiate the smart contract Token)
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // Update user balance (old balance plus transaction amount)
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);

        // Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);

        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        // Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check balances (read from tokens mapping)
    function balanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // Make and cancel orders
    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        // require token balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive, 'insufficient balance');

        // Instantiate an order
        orderCount = orderCount + 1;
        orders[orderCount] = _Order(
            orderCount, // counter cache from state
            msg.sender, // user who made the order
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp // built in function to receive current time <3
        );

        // Emit event
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
}
