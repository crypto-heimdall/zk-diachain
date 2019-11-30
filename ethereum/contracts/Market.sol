pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

import './MockFundPool.sol';
import './Pool.sol';

contract Market {

    event Register(uint itemId, string cut, string color, string clarity, string carat, uint32 price);
    event Deposit(uint itemId, uint32 price, bool success);

    enum DiaStatus {OffSale, OnSale, Rented, Sold}

    struct OpenData {

        uint itemId;

        string cut;
        string color;
        string clarity;
        string carat;           // Public

        uint32 price;
        bytes32 reportRoot;

        DiaStatus status;
    }
    uint private itemCount;
    mapping (uint => OpenData) RegisteredDiaList;

    // linking with other contracts
    address public addrFundPool;

    constructor (address fundPool) public {
        addrFundPool = fundPool;
        itemCount = 0;
    }

    function register(string memory cut, string memory color, string memory clarity, string memory carat, bytes32 reportRoot, uint32 price) public {
        RegisteredDiaList[itemCount] = OpenData(itemCount, cut, color, clarity, carat,  price, reportRoot, DiaStatus.OffSale);
        itemCount++;
        emit Register(itemCount-1, cut, color, clarity, carat, price);
    }
/*
    function getDiamonds () public view returns (OpenData[] memory) {
        OpenData[] memory dias = new OpenData[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            OpenData storage dia = RegisteredDiaList[i];
            dias[i] = dia;
        }
        return dias;
    }
*/
    function getDiamond(uint itemId) public view returns(OpenData memory) {
        for(uint i=0 ; i < itemCount ; i++) {
            OpenData storage dia = RegisteredDiaList[i];
            if (dia.itemId == itemId) {
                return dia;
            }
        }
    }

    function getDiamonds () public view returns
            (uint[] memory , string[] memory , string[] memory,string[] memory , 
            string[] memory, uint[] memory, bytes32[] memory, DiaStatus[] memory ) {

        uint[] memory ids = new uint[] (itemCount);
        string[] memory cuts = new string[](itemCount);
        string[] memory colors = new string[](itemCount);
        string[] memory clarity = new string[](itemCount);
        string[] memory carat = new string[](itemCount);
        uint[] memory price = new uint[](itemCount);
        bytes32[] memory reportsHash = new bytes32[](itemCount);
        DiaStatus[] memory status = new DiaStatus[](itemCount);

        //OpenData[] memory dias = new OpenData[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            OpenData storage dia = RegisteredDiaList[i];

            ids[i] = dia.itemId;
            cuts[i] = dia.cut;
            colors[i] = dia.color;
            clarity[i] = dia.clarity;
            carat[i] = dia.carat;
            reportsHash[i] = dia.reportRoot;
            price[i] = dia.price;
            status[i] = dia.status;
        }
        return (ids, cuts, colors, clarity, carat, price, reportsHash, status);
    }

    function transitStatus (uint itemId, DiaStatus newStatus) public {
        RegisteredDiaList[itemId].status = newStatus;
    }

    function rentDiamond(uint itemId) public returns (bool) {
        require(RegisteredDiaList[itemId].status == DiaStatus.OnSale, "The item is not onsale..");
        
        // Request deposit to FundPool
        Pool fp = Pool(addrFundPool);
        if (fp.requestDeposit(itemId, RegisteredDiaList[itemId].price)) {
            // event Deposit(uint itemId, uint32 price, bool success);
            emit Deposit(itemId, RegisteredDiaList[itemId].price, true);
            RegisteredDiaList[itemId].status == DiaStatus.Rented;
            return true;
        }
        emit Deposit(itemId, RegisteredDiaList[itemId].price, false);
        return false;
    }

    function returnDiamond(uint itemId) public returns (bool) {
        MockFundPool fp = MockFundPool(addrFundPool);
        if (fp.refundDeposit(itemId)) {
            return true;
        }
        return false;
    }



/*
    function stateTransition(   bytes32 targetHashedDia, DiaStatus toStatus,
                                bytes32 _anchor, // Merkle Root of NFT Tree..
                                uint[8] memory points) public returns (bool) {
        
    }

    // Temp for compiling the contract.... will be removed when verifier.sol is created by zokrates.
    function verifyTx (uint[2] memory a, uint[2][2] memory b, uint[2] memory c,
                        uint[5] memory input) public returns (bool) {
        return true;
    }

    function verify (bytes32 targetHash, uint[8] memory points) public {
        
    }
*/

}