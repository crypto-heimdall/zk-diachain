import utils from './zkpUtils'

/**
 * Mint a commitment 
 * @param {Object} vkId - vkId for NFT's MintToken ..(Low Priority)
 * @param {String} blockchainOptions.nfTokenShieldJson - ABI of nfTokenShield
 * @param {String} blockchainOptions.nfTokenShieldAddress - Address of deployed nfTokenShieldContract
 * @param {String} blockchainOptions.account - Account that is sending these transactions
 */
async function mint(tokenId, ownerPublicKey, salt, vkId, blockchainOptions) {
    const {nfTokenShieldJson, nfTokenShieldAddress } = blockchainOptions;

    // nfTokenShield Contract 에 대한 deployed instance 확보..

    // verifier 와 Verifier_Registry 의 Deploy! <- vkid 는 Low Priority!!.. 다만 호출하는 방식은 익혀두기!

    // Calculate new arguments for the proof?! - commitment 라는데.. "굳이" 무엇을 감추기 위한 의도인가?!
        // Hash 값 : Hash (tokenId || ownerPublicKey || salt )
    
    // publicInputHash : Hash (tokenId || commit)   <- 이는 smart contract 상에서 그냥 판단!!
            // publicInputHash cannot be reconciled..

    // zokrates 를 이용해서 computeWitness 와 generateProof 를 진행함..
        // zokrates 모듈을 보면.. ./zokrates compute-witness 동작을 위해 param 들을 자동생성해주는데..
        // nf-token-controller 의 computeProof 할 때 넘겨주는 elements 를 기반으로 zokrates 가 받아드리는 크기로 data 들을 나눠준다!1
            // 현재 mint 를 보고 있는데 nft-mint.code 를 보면 매칭이 된다!!
                // 32 bytes 이상의 데이터들은 둘로 나누게 된다!! 
                // 항상 이슈는 ==> 이 값을 둘로 나눠도 합쳐서 처리하는 것이 기존 zokrates 와 연동 되겠냐는거였는데.. 되나보다!
                // 자동화는 좀 먼 이야기니 이를 print 해주는 것 만으로도 감사하다!!
                // <== 이거 zknft 나  ethsingapole 에도 있지 않나?!
        // generateProof 는 따로 param 이 필요 없다!!

    // 결국 nft-mint.code 는 publicInputHash 즉 TokenID + ownPublicKey + Salt 값으로 제대로 생성하였다를 증명!!
        // Public은 Public Input Hash
        // Private은 TokenId, ownPublicKey, Salt
    
    // nfTokenShieldInstance 에서는 해당 Proof 를 검증하고 mint 하게 된다!!
        // verify 할 때도 verifier.sol 이 받을 수 있도록 cv.computeVectors()를 이용해서 input 값을 변환함!!
        // mint 하면 그제서야 Merkle Tree 의 하나로 commitment 가 저장됨!!..
            // 위에서 보듯이 commitment는 

    // 결국 nfTokenShieldInstance 에서 mint 하게 되면 nfToken의 해당 tokenId 에 대한 소유권이
        // nfTokenShieldInstnace 의 Address으로 옮긴다!!
}
/**
 * 
 * @param {*} tokenId 
 * @param {*} receiverPublicKey 
 * @param {*} originalCommitmentSalt 
 * @param {*} newCommitmentSalt 
 * @param {*} snederSecretKey 
 * @param {*} commitment 
 * @param {*} commitmentIndex 
 * @param {Object} blockchainOptions 
 * @param {String} blockchainOptions.nfTokenShieldJson
 * @param {String} blockchainOptions.nfTokenShieldAddress
 * @param {String} blockchainOptions.account
 */
async function transfer(tokenId, receiverPublicKey, originalCommitmentSalt, newCommitmentSalt,
                        snederSecretKey, commitment, commitmentIndex, blockchainOptions, ) {

    // nft-transfer.code
        /* def main(field publicInputHash, private field assetHigh, private field assetLow, private field[32] path, private field order, private field nullifierHigh, private field nullifierLow, private field publicKeyBHigh, private field publicKeyBLow, private field  saltAHigh, private field saltALow, private field saltBHigh, private field  saltBLow, private field secretKeyAHigh, private field secretKeyALow, private field rootHigh, private field rootLow, private field commitmentBHigh, private field commitmentBLow)->():
        */
}
