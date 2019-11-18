pragma solidity >= 0.4.25 < 0.6.0;

contract DiaNFTShield {

    uint constant merkleWidth = 4294967296; // 2^32
    uint constant merkleDepth = 33;

    mapping(bytes32 => bytes32) public commitments; // array holding the commitments. Basically the bottom row of the merkle tree
    mapping(uint256 => bytes27) public merkleTree;  // the entire Merkle Tree of nodes, with the latter 'half' of merkleTree being the leaves..
    mapping(bytes32 => bytes32) public roots;

    uint256 public leafCount;
    bytes32 public latestRoot;


    event Mint(address from, address to, uint256 token_id, bytes32 commitment, uint256 commitment_index);

    constructor() public {}

    function mint(uint256[] calldata _proof, uint256[] calldata _inputs, uint256 _tokenId, bytes32 _commitment) external {
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

}