pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

contract Market {

    enum DiaStatus {OnSale, OffSale, Rented}

    struct OpenData {

        uint itemId;

        string cut;
        string color;
        string clarity;
        string carat;           // Public

        uint32 price;
        DiaStatus status;
    }
    uint private itemCount;

    mapping (uint => OpenData) RegisteredDiaList;

    constructor () public {
        itemCount = 0;
    }

    function register(string memory cut, string memory color, string memory clarity, string memory carat, uint32 price) public {
        RegisteredDiaList[itemCount] = OpenData(itemCount, cut, color, clarity, carat, price, DiaStatus.OffSale);
        itemCount++;
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
    function getDiamonds () public view returns (string[] memory , string[] memory,string[] memory , string[] memory, uint[] memory ) {
        
        string[] memory cuts = new string[](itemCount);
        string[] memory colors = new string[](itemCount);
        string[] memory clarity = new string[](itemCount);
        string[] memory carat = new string[](itemCount);
        uint[] memory price = new uint[](itemCount);
        
        //OpenData[] memory dias = new OpenData[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            OpenData storage dia = RegisteredDiaList[i];
            cuts[i] = dia.cut;
            colors[i] = dia.color;
            clarity[i] = dia.clarity;
            carat[i] = dia.carat;
            
            price[i] = dia.price;
            
        }
        return (cuts, colors, clarity, carat, price);
    }

    function transitState (uint itemId, DiaStatus newStatus) public {
        RegisteredDiaList[itemId].status = newStatus;
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