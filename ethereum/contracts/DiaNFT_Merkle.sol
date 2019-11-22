pragma solidity >= 0.4.25 < 0.6.0;
pragma experimental ABIEncoderV2;

contract DiaNFT_Merkle {
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

    uint constant merkleWidth = 16; // 2^32
    uint constant merkleDepth = 5;

    uint256 public leafCount;   // remembers the number of commitments we hold..
    bytes32 public latestRoot;

    mapping(uint256 => bytes27) public merkleTree;
    
    uint256[] public treeLUT;   // Lookup Table.
    
    mapping(bytes32 => bytes32) commitment;
    mapping(bytes32 => bytes32) roots;
    
    struct Merkle {
        uint256     index;
        bytes27     hash;
    }
    
    constructor() public {

    }

    function mint (bytes32 _tokenId, bytes32 _commitment) external {
        uint256 leafIndex = merkleWidth - 1 + leafCount;
        merkleTree[leafIndex] = bytes27(_commitment<<40);
        commitment[_commitment] = _commitment;

        bytes32 root = updatePathToRoot(leafIndex);
        roots[root] = root;
        latestRoot = root;
        
        leafCount++;
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