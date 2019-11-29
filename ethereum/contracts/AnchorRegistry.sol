pragma solidity >=0.4.25 <0.6.0;

import "openzeppelin-solidity/contracts/introspection/ERC165.sol";

// crypto-heimdall : reference from [privacy-enabled-erc721]
contract AnchorRegistry is ERC165 {
  bytes4 internal constant InterfaceId_AnchorRegistry = 0x04d466b2;
  /*
   * 0x04d466b2 ===
   *   bytes4(keccak256('getAnchorById(bytes32)')) 


    > const eth = require("ethereumjs-util")
    > eth.bufferToHex(eth.keccak256('getAnchorById(bytes32)'))
        '0x04d466b2 b47ca9a92d4fbe5f15220e2a22fca44279846be2457cb9162d02cbed'
    > eth.bufferToHex(eth.keccak256('getAnchorById(string)'))
        '0x4d5222e1 7628f21784d722c6797c32e6c31b462812c93fabce92c0262bcbc971'


   */  

  /**
   * @dev Gets the anchor details for a document.
   * @param _identifier bytes32 The document anchor identifier
   * @return identifier bytes32 The document anchor identifier as found
   * @return merkleRoot bytes32 The document's root hash value
   */
  function getAnchorById (string calldata _identifier) 
  external view 
  returns (
    string memory identifier, bytes32 merkleRoot
    );    
}