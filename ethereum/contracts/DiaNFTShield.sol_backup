pragma solidity >= 0.4.25 < 0.6.0;

import "./ReportRegistry_pp.sol";

contract DiaNFTShield {

    // Anchoring with ReportRegistry to check/bring Report's Precise-Proof Root!!
    bytes4 internal constant InterfaceId_AnchorRegistry = 0x4d5222e1;
    // Ancrho Registry..
    address internal anchorRegistry_;


    uint constant merkleWidth = 4294967296; // 2^32
    uint constant merkleDepth = 33;

    mapping(bytes32 => bytes32) public commitments; // array holding the commitments. Basically the bottom row of the merkle tree
    mapping(uint256 => bytes27) public merkleTree;  // the entire Merkle Tree of nodes, with the latter 'half' of merkleTree being the leaves..
    mapping(bytes32 => bytes32) public roots;

    uint256 public leafCount;
    bytes32 public latestRoot;


    event Mint(address from, address to, uint256 token_id, bytes32 commitment, uint256 commitment_index);

    constructor(address _anchorRegistry) public {
        require(ReportRegistry_pp(_anchorRegistry).supportsInterface(InterfaceId_AnchorRegistry), "Not a Valid Report Registry..");
        anchorRegistry_ = _anchorRegistry;
    }

    // Check if a given girdlecode is registered in the anchor registry of this contract with the given documentRoot
    function _isRegisteredInRegistered (string memory _girdlecode, bytes32 reportRoot) internal view returns (bool) {
        ReportRegistry_pp registry = ReportRegistry_pp(anchorRegistry_);
        (string memory identifier, bytes32 documentRoot) = registry.getAnchorById (_girdlecode);
        // String comparision should be done via 'hashing..'
        if ( keccak256(abi.encodePacked(identifier)) == keccak256( abi.encodePacked(_girdlecode)) && documentRoot != 0x00) {
            return true;
        }
        return false;
    }

    // [!!!!!!!] external .. calldata vs memeory..?????
    function mint(uint256[] calldata _proof, uint256[] calldata _inputs, uint256 _tokenId, bytes32 _commitment,
                        string calldata _girdlecode, bytes32 reportRoot) external {
        // Parameter checks!!
        require(reportRoot != 0x0, "Report Root needs to be valid..");
        require( bytes(_girdlecode).length != 0, "girdlecode needs to be valid..");
        
        // Check with Anchoring
        require(_isRegisteredInRegistered(_girdlecode, reportRoot), "Report Root needs to be registered in the registry..");

        // Check that the publicInputHash equals the hash of the 'public inputs'
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_tokenId, _commitment)));
        require(publicInputHash == publicInputHashCheck, "publicInputHash cannot be reconciled");

        // verify the proof with _proof and _inputs

        // if correct, update contract states
        uint256 leafIndex = merkleWidth - 1 + leafCount;
        merkleTree[leafIndex] = bytes27(_commitment << 40);
        commitments[_commitment] = _commitment;

        bytes32 root = updatePathToRoot(leafIndex);
        roots[root] = root;
        latestRoot = root;

        //Finally, transfer token from the sender to this contract address.

        emit Mint (msg.sender, address(this), _tokenId, _commitment, leafCount++);
    }

    function updatePathToRoot (uint p)  private returns (bytes32) {
        uint s; // s is the sister path of p
        uint t; // temp index for the next p (ex. the path node of the row above)
        bytes32 h;

        for (uint r = merkleDepth -1; r >0 ; r--) {
            if (p%2 == 0) {
                s = p-1;
                t = (p-1)/2;
                h = sha256(abi.encodePacked(merkleTree[s], merkleTree[p]));
                merkleTree[t] = bytes27(h<<40);
            } else {
                s = p+1;
                t = p/2;
                h = sha256(abi.encodePacked(merkleTree[p], merkleTree[s]));
                merkleTree[t] = bytes27(h<<40);
            }
            p = t;  // move to the path node on the next highest row of the tree..
        }
        return h;   // the (256-bit) root of the merkleTree

    }

    // function transfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, bytes32 _commitment)

}