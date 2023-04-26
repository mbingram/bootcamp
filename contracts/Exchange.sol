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
    mapping(uint256 => bool) public orderCancelled; // can't actually delete an order, but we can change this variable in the mappping
    mapping(uint256 => bool) public orderFilled; // marks whether the order has been filled

    event Deposit(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
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
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
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
        require( // require token balance
            balanceOf(_tokenGive, msg.sender) >= _amountGive);

        // increment orderCount
        orderCount ++;

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

    function cancelOrder(uint256 _id) public {
        // Fetch the order
        _Order storage _order = orders[_id]; // pulling this _order from storage using the orders[id]
        // ensure the caller of the function is the owner
        require(address(_order.user) == msg.sender);
        // require that the order id matches the passed-in id
        require(_order.id == _id);
        // Cancel the order
        orderCancelled[_id] = true;
        // Emit a cancellation event
        emit Cancel(_id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.timestamp);
    }

    // Executing orders
    function fillOrder(uint256 _id) public {
        // 1. Order must be valid
        require(_id > 0 && _id <= orderCount, 'order does not exist');
        // 2. Order can't be filled
        require(!orderFilled[_id]);
        // 3. Order can't be cancelled
        require(!orderCancelled[_id]);
        // Fetch order
        _Order storage _order = orders[_id];
        // Swapping tokens (Trading)
        _trade(// write internal function to hold trade logic
            _order.id,
            _order.user,
            _order.tokenGet,
            _order.amountGet,
            _order.tokenGive,
            _order.amountGive
        );
        // mark order as filled in mapping
        orderFilled[_order.id] = true;
    }

    function _trade(
        uint256 _orderId,
        address _user,
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) internal {
        // fee is paid by user who filled order (msg.sender)
        // fee is deducted from _amountGet
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        // Execute the trade
        // access the tokens mapping // args: tokens[token address][user address]
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount); // Take one token from first account 
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet; // and give it to second account

        // Charge fees
        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

        tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive; // subtract _amountGive from second account
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive; // add _amountGive to first account

        // Emit Trade event
        emit Trade(
            _orderId,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user,
            block.timestamp
        );
    }

}
