pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

import "./ReportRegistry_pp.sol";
import "./Verifier_Mint.sol";
//import "./Verifier_Transfer.sol";

contract DiaShieldNFT_pp {
  /*
  @notice Explanation of the Merkle Tree, in this contract:
  We store the merkle tree nodes in a flat array.



                                      0  <-- this is our Merkle Root
                               /             \
                        1                             2
                    /       \                     /       \
                3             4               5               6
              /   \         /   \           /   \           /    \
            7       8      9      10      11      12      13      14
          /  \    /  \   /  \    /  \    /  \    /  \    /  \    /  \
         15  16  17 18  19  20  21  22  23  24  25  26  27  28  29  30

depth row  width  st#     end#
  1    0   2^0=1  w=0   2^1-1=0
  2    1   2^1=2  w=1   2^2-1=2
  3    2   2^2=4  w=3   2^3-1=6
  4    3   2^3=8  w=7   2^4-1=14
  5    4   2^4=16 w=15  2^5-1=30

  d = depth = 5
  r = row number
  w = width = 2^(depth-1) = 2^3 = 16
  #nodes = (2^depth)-1 = 2^5-2 = 30
*/
//===== Merkle Tree for Privacy Preserving NFT ======//
    uint constant merkleWidth = 16; // 2^32
    uint constant merkleDepth = 5;

    uint256 public leafCount;   // remembers the number of commitments we hold..
    bytes32 public latestRoot;

    mapping(uint256 => bytes27) public merkleTree;
    
    uint256[] public treeLUT;   // Lookup Table.
    
    mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
    mapping(bytes32 => bytes32) commitment;
    mapping(bytes32 => bytes32) roots;

    struct Merkle {
        uint256     index;
        bytes27     hash;
    }

//===== Anchoring ======//
    // Anchoring with ReportRegistry to check/bring Report's Precise-Proof Root!!
    bytes4 internal constant InterfaceId_AnchorRegistry = 0x04d466b2;
    // Ancrho Registry..
    address internal anchorRegistry_;

    address internal verifier_mint_;
    address internal verifier_transfer_;

//===== Event =======//
    event Mint(address from, address to, bytes32 token_id, bytes32 commitment, uint256 commitment_index);
    event Transfer(bytes32 nullifier, bytes32 commitment, uint256 commitment_index);
    
    constructor(address _anchorRegistry, address _verifier_mint, address _verifier_transfer) public {
        require(ReportRegistry_pp(_anchorRegistry).supportsInterface(InterfaceId_AnchorRegistry), "Not a Valid Report Registry..");
        anchorRegistry_ = _anchorRegistry;

        // set up verifier for zkp
        verifier_mint_ = _verifier_mint;
        verifier_transfer_ = _verifier_transfer;

    }

    // Check if a given girdlecode is registered in the anchor registry of this contract with the given documentRoot
    function _isRegisteredInRegistery (bytes32 _girdlecode, bytes32 reportRoot) internal view returns (bool) {
        ReportRegistry_pp registry = ReportRegistry_pp(anchorRegistry_);
        (bytes32 identifier, bytes32 documentRoot) = registry.getAnchorById (_girdlecode);
        // Hash (owner's public key || pp_report_Root) == documentRoot
        if ( documentRoot == keccak256(abi.encodePacked(msg.sender, reportRoot)) ) {
            return true;
        }
        return false;
    }

    function mint (uint256[] calldata _proof, uint256[] calldata _inputs,
                        bytes32 _reportRoot, bytes32 _tokenId, bytes32 _commitment ) external {

        require(_isRegisteredInRegistery(_tokenId, _reportRoot), "Report Root needs to be registered in the registry..");

        // Check that the publicInputHash equals the hash of the 'public inputs'
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_tokenId, _commitment)));
        require(publicInputHash == publicInputHashCheck, "publicInputHash cannot be reconciled");

        // verify the proof
            //address internal verifier_mint_;
//        bool result = Verifier_Mint(verifier_mint_).verify(_proof, _inputs);
//        require(result, "The proof has not been verified by the contract");

        uint256 leafIndex = merkleWidth - 1 + leafCount;
        merkleTree[leafIndex] = bytes27(_commitment<<40);
        commitment[_commitment] = _commitment;

        bytes32 root = updatePathToRoot(leafIndex);
        roots[root] = root;
        latestRoot = root;
        
        emit Mint(msg.sender, address(this), _tokenId, _commitment, leafCount++);
    }

    function transfer(uint256[] calldata _proof, uint256[] calldata _inputs,
                        bytes32 _root, bytes32 _nullifier, bytes32 _commitment) external {

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitment))<<8);
        require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

        // verify the proof
            //address internal verifier_transfer_;

//        bool result = Verifier_Transfer(verifier_transfer_).verify(_proof, _inputs);
//        require(result, "The proof has not been verified by the contract");

        // check inputs vs on-chain states
        require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");

        // update contract states
        nullifiers[_nullifier] = _nullifier; // remember we spent it

        uint256 leafIndex = merkleWidth - 1 + leafCount; // specify the index of the commitment within the merkleTree
        merkleTree[leafIndex] = bytes27(_commitment<<40); // add the commitment to the merkleTree

        commitment[_commitment] = _commitment; // add Bob's commitment to the list of tokens

        latestRoot = updatePathToRoot(leafIndex); // recalculate the root of the merkleTree as it's now different
        roots[latestRoot] = latestRoot; // and save the new root to the list of roots

        emit Transfer(_nullifier, _commitment, leafCount++);
    }

    function updatePathToRoot(uint p) private returns (bytes32) {
        /*
        If Z were the commitment, then the p's mark the 'path', and the s's mark the 'sibling path'

                         p
                p                  s
           s         p        EF        GH
        A    B    Z    s    E    F    G    H
        */

        uint s; //s is the 'sister' path of p.
        uint t; //temp index for the next p (i.e. the path node of the row above)
        bytes32 h; //hash
        for (uint r = merkleDepth-1; r > 0; r--) {
            if (p%2 == 0) { //p even index in the merkleTree
                s = p-1;
                t = (p-1)/2;
                h = sha256(abi.encodePacked(merkleTree[s],merkleTree[p]));
                merkleTree[t] = bytes27(h<<40);
            } else { //p odd index in the merkleTree
                s = p+1;
                t = p/2;
                h = sha256(abi.encodePacked(merkleTree[p],merkleTree[s]));
                merkleTree[t] = bytes27(h<<40);
            }
            p = t; //move to the path node on the next highest row of the tree
        }
        return h; //the (256-bit) root of the merkleTree
    }
}