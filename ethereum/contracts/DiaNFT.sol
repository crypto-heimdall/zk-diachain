pragma solidity >=0.4.25 <0.6.0;

import "./ReportRegistry.sol";


contract DiaNFT {
    //==== Anchor by AnchorRegistry =====//
    bytes4 internal constant InterfaceId_AnchorRegistry = 0x04d466b2;
  /*
   * 0x04d466b2 ===
   *   bytes4(keccak256('getAnchorById(bytes32)')) 
   */
    // Anchor Registry
    address internal anchorRegisty_;
    // The Ownable Anchor
    struct OwnedAnchor {
        bytes32 reportId;
        bytes32 rootHash;
    }
    // Mapping from details to Report ID
    mapping (uint256 => OwnedAnchor) internal reportDetails_;


    //ReportRegistry public   registry;   // check validity of requests for minting new DiaNFT
    address internal registry;

    struct TokenData {
        string      girdleCode; // public
        bytes32     owner;      // private
    }

    mapping (bytes32 => TokenData) public data;

    constructor (address _registry) public {
        require (ReportRegistry(_registry).supportsInterface(InterfaceId_AnchorRegistry), "not a valid anchor registry");
        registry = _registry;
        
    }

    function reportRegistry () external view returns (address) {
        return registry;
    }

    function checkAnchor(bytes32 _anchorId, bytes32 _droot, bytes32 _sigs) public returns (bool) {
        bytes32 root;
        (, root) = ReportRegistry(registry).getAnchorById (_anchorId);  //reportRoot - merkle root for precise proof of 'the Report'
    
        return root == sha256(concat(_droot, _sigs));   // Temp..
    }

    function mint ( bytes32 _owner, string memory _girdleCode, 
                    bytes32 _anchor, bytes32 _data_root, bytes32 _signature_root ) public returns (bytes32) {
        // Check if the request has been registered in the anchor (ReportRegistry)
        require (checkAnchor (_anchor, _data_root, _signature_root), "anchor-root-failed..");

    }

    // Temp for compiling the contract.... will be removed when verifier.sol is created by zokrates.
    function verifyTx ( uint[2] memory a, uint[2][2] memory b, uint[2] memory c, 
                        uint[5] memory input) public returns (bool) {
        return true;
    }



    function verify ( bytes32 _data_root, string memory _girdleCode, uint[8] memory points) public {
        // _girdleCode must be not empty..
        require (bytes(_girdleCode).length != 0, "girdleCode must be not empty..");

        uint[2] memory a = [points[0], points[1]];
        uint[2][2] memory b = [[points[2], points[3]], [points[4], points[5]]];
        uint[2] memory c = [points[6], points[7]];

        // intputs :
        uint[5] memory input;
        bytes32 b_girdleCode = stringToBytes32(_girdleCode);
        (input[0], input[1]) = unpack (b_girdleCode);
        (input[2], input[3]) = unpack (_data_root);
        input[4] = 1;

        require (verifyTx (a,b,c, input), "failed to verify the proof..");

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

    // code from http://bit.ly/2Py2ZB1
    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    // unpack - takes one bytes32 arg and turns it into two uint256 to make it fit into a field element
    function unpack (bytes32 x) pure internal returns (uint, uint) {
        bytes32 a = bytes32(x);
        bytes32 b = (a >> 128);
        bytes32 c = ((a << 128) >> 128);

        return (uint(b), uint(c));
    }



/*
    function checkReportValidity (string memory girdleCode, bytes32 droot, bytes32 sigs) view public returns (bool) {
        bytes32 root;
        (, root, ) = registry.getReportbyCode (girdleCode);
        
        return root == sha256(concat(droot, sigs));
    }
*/

}