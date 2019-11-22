const {bufferToHex, keccak} = require("ethereumjs-util");

let ReportRegistry = artifacts.require("ReportRegistry");
let DiaNFT = artifacts.require("DiaNFT");

const getValidProofHashes = function (){
    /**
     * This is a proof coming from the precise-proofs library via
     * https://github.com/centrifuge/precise-proofs/blob/master/examples/simple.go
     * using Keccak256 as the hashing algorithm
     * 
     */
    return [
      base64ToHex("EUqfrgLuRdt+ot+3vI9qnCdybeYN3xwwe/MJVsCH2wc="),
      base64ToHex("3hsHx/etwya5rcyIe3Avw2724ThyZl9pS4tMdybn05w="),
      base64ToHex("zlt7lxQcvwpEfh17speU89j/J2xZdAYfSu/JDLujXqA=")
    ];
  }

contract("DiaNFT", function (accounts){
    describe("mintMerklePlainText", async function () {
        it("should mint a token if the Merkle proof validates", async function () {
          let documentIdentifer = "0xce5b7b97141cbf0a447e1d7bb29794f3d8ff276c5974061f4aefc90cbba35eaf"
          await this.anchorRegistry.setAnchorById(
              documentIdentifer,
              "0x1e5e444f4c4c7278f5f31aeb407c3804e7c34f79f72b8438be665f8cee935744"
          );

          let validProof = getValidProofHashes();

          //root hash is 0x1e5e444f4c4c7278f5f31aeb407c3804e7c34f79f72b8438be665f8cee935744 in hex
          let validRootHash = base64ToHex("Hl5ET0xMcnj18xrrQHw4BOfDT3n3K4Q4vmZfjO6TV0Q=");
          
          await this.registry.mint(
              "0x1",
              1,
              documentIdentifer,
              validRootHash,
              validProof,
              "valueA", 
              "Foo", 
              base64ToHex("UXfmxueEm0hxx9zzO21HQ5Bwg8Zg64lpQfq1y2r94ys=")
          );
        });
    });
})