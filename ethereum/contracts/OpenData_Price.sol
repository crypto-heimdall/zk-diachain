pragma solidity >= 0.4.25 < 0.6.0;
import "./OraclizeAPI.sol";

contract OpenData_Price is usingOraclize {
string public gemstonePrice;
event NewOraclizeQuery(string description);
event NewGenstonePrice(string gemstonePrice);
constructor() public {
        update();
    }
function __callback(bytes32 myid, string memory result) public {
        (myid);
        require(msg.sender == oraclize_cbAddress());
        gemstonePrice = result;
        emit NewGenstonePrice(gemstonePrice);
        // do something with viewsCount. like tipping the author if viewsCount > X?
    }
function update() public payable {
        if (oraclize_getPrice("URL") > address(this).balance) {
            emit NewOraclizeQuery("Oraclize query was NOT sent, please add some ETH to cover for the query fee");
        } else {
            emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
            oraclize_query("URL", 'html(https://www.....).xpath(//*[contains(@class, "fetch-gemstone-pirce")]/text())');
        }
    }
}