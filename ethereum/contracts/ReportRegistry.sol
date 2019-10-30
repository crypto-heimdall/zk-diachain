pragma solidity >=0.4.25 <0.6.0;

import "./AnchorRegistry.sol";

contract ReportRegistry is AnchorRegistry {


    //==== Report itself ====//
    struct reportInfo {
        string girdleCode;
        string cut;
        string color;
        string clarity;
        string carat;
        string remarks;

        bytes32 hashedReport;   // private
        bytes32 owner;          // private
    }

    //==== Anchor ====//
    // a represenstation of a report anchor
    struct Anchor {
        bytes32 reportRoot; // sha256 ( merkle root of precise-proof merkle tree for the report, 
                            //          signatures)
        reportInfo details;
    }
    mapping (bytes32 => Anchor)  anchors;


    reportInfo[] public registeredReport;
    bytes32 documentRoot;
    uint32  blockNumber;

    constructor () public {
        documentRoot = 0x0;
        blockNumber = 0;

        _registerInterface(InterfaceId_AnchorRegistry);
    }

    function setAnchorById (bytes32 _anchorId, bytes32 _reportRoot, reportInfo memory _details) internal  {
        // not allowing empty vals
        require (_anchorId != 0x0);
        require (_reportRoot != 0x0);

        anchors[_anchorId] = Anchor(_reportRoot, _details);
    }

    function getAnchorById (bytes32 _identifier) external view returns (bytes32 identifier, bytes32 merkleRoot) {
        return (_identifier, anchors[_identifier].reportRoot);
    }

    function register( string memory _code, string memory _cut, string memory _color, 
                        string memory _clarity, string memory _carat, 
                        string memory _remarks, bytes32 _hashedReport, bytes32 _owner,
                        bytes32 _reportRoot) public {
        // 메모리에 인스턴스 저장
        reportInfo memory newReport = reportInfo(_code, _cut, _color, _clarity, _carat, _remarks, _hashedReport, _owner);
        registeredReport.push(newReport);

        // Temp.. need to set "proper" anchor Id.. ex. hash ( owner, hash(report))
        setAnchorById (_hashedReport, _reportRoot, newReport);
    }

    function getNumofReports() public view returns(uint) {
        return registeredReport.length;
    }

/*
    function getReportbyCode (string memory code) view public returns (string memory, bytes32, uint32) {
        return (code, documentRoot, blockNumber);
    }
*/


}
