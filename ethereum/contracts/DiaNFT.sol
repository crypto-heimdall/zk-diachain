pragma solidity >=0.4.25 <0.6.0;

import "./ReportRegistry.sol";


contract DiaNFT {
    
    ReportRegistry public   registry;   // check validity of requests for minting new DiaNFT

    struct TokenData {
        string      girdleCode; // public
        bytes32     owner;      // private
    }

    mapping (uint => TokenData) public data;

    constructor (address _registry) public {
        registry = ReportRegistry(_registry);
    }

    function checkReportValidity (string memory girdleCode, bytes32 droot, bytes32 sigs) view public returns (bool) {
        bytes32 root;
        (, root, ) = registry.getReportbyCode (girdleCode);
        
        return root == sha256(concat(droot, sigs));
    }

    //----- Utils -----
    function concat(bytes32 b1, bytes32 b2) pure internal returns (bytes memory) {
        bytes memory result = new bytes(64);
        assembly {
            mstore (add(result, 32), b1)
            mstore (add(result, 64), b2)
        }
        return result;
    }

}