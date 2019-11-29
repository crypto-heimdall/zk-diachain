pragma solidity >= 0.4.25 < 0.6.0;

import "./StableCoin_pp.sol";

contract Pool {

    struct DepositDetail {
        uint256 amount;
        bool    settled;
    }

    uint    private investorCount;
    address private _token;

    uint256 public totalDeposit;
    uint256 public availableDeposit;
    uint256 public profits;

    mapping(address => uint)      addressIndex;
    mapping(address => uint256)   remainingInvest;
    mapping(uint256 => DepositDetail)   currentDeposits;    // itemId - deposit!!

    constructor(address token) public {
        require(token != address(0), "Pool: token is the zero address");
        _token = token;
        investorCount = 0;
        totalDeposit = 0;
        availableDeposit = 0;
    }

    function investForDiaTx(uint256 deposit) public {
        uint256 balance = DiaStableCoin(_token).balanceOf(msg.sender);
        require(balance > deposit, "Not enough DiaStableCoin..");

        // ERC20 Transfer from msg.sender to this..
        DiaStableCoin(_token).approve(address(this), deposit);
        DiaStableCoin(_token).transferFrom(msg.sender, address(this), deposit);
        remainingInvest[msg.sender] = deposit;
        totalDeposit += deposit;
        availableDeposit += deposit;

        addressIndex[msg.sender] = investorCount++;
    }

    function requestDeposit(uint256 itemId, uint256 amount) public returns (bool){
        if (amount > availableDeposit) {
            return false;
        }
        availableDeposit = availableDeposit - amount;
        currentDeposits[itemId] = DepositDetail(amount,false);
    }

    function settleforDeposit(uint256 itemId, uint256 amount) public {
        availableDeposit = availableDeposit + currentDeposits[itemId].amount;
        profits += amount;
    }

    // return investor's Deposit, total deposit, profit
    function caculateProfit(address investor) public returns (uint256, uint256, uint256) {
        return (remainingInvest[investor], totalDeposit,  profits);
    }
}