pragma solidity >= 0.4.25 < 0.6.0;

contract MockFundPool {

    event Deposit(address from, uint id ,uint32 amount);
    event Refund(address from, uint id);
    mapping(uint => uint32) public deposits;


    function requestDeposit(uint requestId, uint32 amount) public returns (bool) {
        deposits[requestId] = amount;
        emit Deposit(msg.sender, requestId, amount);
        return true;
    }

    function refundDeposit(uint itemId) public returns (bool) {
        deposits[itemId] = 0;
        emit Refund(msg.sender, itemId);
        return true;
    }
}