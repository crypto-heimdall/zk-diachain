pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

contract ReportRegistrtNozkp {

    struct ReportInfo {
        uint itemId;
        
        string girdleCode;
        string cut;
        string color;
        string clarity;
        string carat;
        string reportURI;   // 해당 Report 원본 URI
        //bytes32 hashedReport;

        address issuer;

    }
    uint private itemCount;

    mapping (uint => ReportInfo) RegisteredReport;

    constructor () public {
        itemCount = 0;
    }

    function register(string memory _girdlecode, string memory _cut, string memory _color,
                    string memory _clarity, string memory _carat, string memory _reportURI,
                    address _issuer) public {
        RegisteredReport[itemCount] = ReportInfo(itemCount, _girdlecode, _cut, _color, _clarity, _carat, _reportURI, _issuer);
        itemCount++;
    }

    function getReports () public view returns (ReportInfo[] memory) {
        ReportInfo[] memory reports = new ReportInfo[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            ReportInfo storage report = RegisteredReport[i];
            reports[i] = report;
        }
        return reports;
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