pragma solidity >=0.4.25 <0.6.0;


contract ReportRegistry {
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

    reportInfo[] public registeredReport;
    bytes32 documentRoot;
    uint32  blockNumber;

    constructor () public {
        documentRoot = 0x0;
        blockNumber = 0;
    }

    function register( string memory _code, string memory _cut, string memory _color, string memory _clarity, string memory _carat, string memory _remarks, bytes32 _hashedReport, bytes32 _owner) public {
        // 메모리에 인스턴스 저장
        reportInfo memory newReport = reportInfo(_code, _cut, _color, _clarity, _carat, _remarks, _hashedReport, _owner);
        registeredReport.push(newReport);
    }

    function getNumofReports() public view returns(uint) {
        return registeredReport.length;
    }

    function getReportbyCode (string memory code) view public returns (string memory, bytes32, uint32) {
        return (code, documentRoot, blockNumber);
    }



}
