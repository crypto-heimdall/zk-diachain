pragma solidity >= 0.4.25 < 0.6.0;

import "./verifier.sol";    // Verifier : Transfer Circuit

contract DiaNFT is Verifier {

    enum State {OnSale, OffSale, InProgress}
    mapping(bytes32 => State) public diamonds;
    string[] public allDias;
    bytes32[] public allHashedDias;

    constructor() public {}

    function transferDia (  // its parameters depend on 'Proving Scheme of Zokrates'
        uint[2] memory a, uint[2] memory a_p, uint[2][2] memory b, uint[2] memory b_p, uint[2] memory c, uint[2] memory c_p,
        uint[2] memory h, uint[2] memory k, uint[7] memory input,   // int - 16bytes
        string memory encryptedDia1, string memory encryptedDia2
    ) public {
        require (verifyTx(a, a_p, b, b_p, c, c_p, h, k, input), 'Invalid zk proof');

        bytes32 spendingDia = calcDiaHash(input[0], input[1]);  // input 은 각 int 즉 16 bytes (128bits)
        diamonds[spendingDia] = State.InProgress;
        
        bytes32 newDia1 = calcDiaHash(input[2], input[3]);
        createDia(newDia1, encryptedDia1);
        bytes32 newDia2 = calcDiaHash(input[4], input[5]);
        createDia(newDia2, encryptedDia2);
    }

    function createDia(bytes32 dia, string memory encryptedDia) internal {
        diamonds[dia] = State.OffSale;
        allDias.push(encryptedDia);
        allHashedDias.push(dia);
    }

    function calcDiaHash (uint _a, uint _b) internal pure returns (bytes32) {
        bytes32 a = bytes32(_a);
        bytes32 b = bytes32(_b);
        bytes memory _note = new bytes(32);

        for (uint i=0; i < 16; i++) {
            _note[i] = a[i];
            _note[16+i] = b[i];
        }
        return bytesToBytes32(_note,0);
    }

    function bytesToBytes32(bytes memory b, uint offset) internal pure returns (bytes32) {
        bytes32 out;
        for (uint i=0; i<32; i++) {
            out |= bytes32(b[offset+i] & 0xFF) >> (i*8);
        }
        return out;
    }
}
