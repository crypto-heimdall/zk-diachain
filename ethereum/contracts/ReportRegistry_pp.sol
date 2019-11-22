pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

import "./AnchorRegistry.sol";

/* = an Example of an report
{
    cut : "shallow",
    color : "D",
    clarity : "VVS1",   // Verify, Verify Slightly Included 1
    carat : "1.0",
    girdleCode : "SAMI161203",
    details : {
        issuer : "0x",  // public key..
        uri : "http://bit.ly/2CYyz3x",
    },
}
*/
/** To Be Done!!
For Anchoring from DiaNFT, merkleRoot should be replaced with merkleRoot || salt;
but, salt would be one-time if revealed to mint DiaNFT related to this report.
 */

contract ReportRegistry_pp is AnchorRegistry {
    struct Commitment {
        bytes32 merkleRoot; 
        string schema;
    }

    event NewCommitment(address by, string  code);

    // string - girdlecode / Commitment - precise-proof for Report
    mapping(string => Commitment) internal commitments;
    string[] public girdleCodesLUT;     // reference from http://bit.ly/2Os0U7L

    function size() public view returns (uint) {
        return girdleCodesLUT.length;
    }

    function getCommitment(string memory girdleCode) public returns (Commitment memory) {
        require(commitments[girdleCode].merkleRoot != bytes32(0x0),"the given girdlecode NOT FOUND..");
        return commitments[girdleCode];
    }

    function register(string memory girdleCode, bytes32 merkleRoot, string memory schema) public returns (bool) {
        require(commitments[girdleCode].merkleRoot == bytes32(0x0), "the girdle code ALREADY Registered..");
        commitments[girdleCode] = Commitment(merkleRoot, schema);
        girdleCodesLUT.push(girdleCode);

        emit NewCommitment(msg.sender, girdleCode);
    }

    // Data location must be "calldata" for parameter in external function, but "memory" was given.
    // !! Must be Checked : calldata vs memory indicator
    function getAnchorById(string calldata _identifier) external view returns (string memory, bytes32) {
        return (_identifier, commitments[_identifier].merkleRoot);
    }
/*  Is it needed??
    function setAnchorById (string calldata _anchorId, bytes32 documentRoot) external payable {
        commitments[_anchorId] = Commitment(documentRoot, "...");
    }
*/

}