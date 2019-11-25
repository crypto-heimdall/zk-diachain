pragma solidity >= 0.4.25 < 0.6.0;

contract MockFundPool {

    event Deposit(address from, uint256 id ,uint256 amount);
    mapping(uint256 => uint256) public deposits;


    function requestDeposit(uint256 requestId, uint256 amount) public returns (bool) {
        deposits[requestId] = amount;
        emit Deposit(msg.sender, requestId, amount);
        return true;
    }
}