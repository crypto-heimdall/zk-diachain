//import './zkpUtils.js';
const utils = require('./zkpUtils')
const contract = require('truffle-contract')
const config = require('./config')
const ele = require('./Element')
const cv = require('./compute-vectors')

const BN = require('bn.js')
const Web3 = require('./web3')

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
        /* def main(field publicInputHash, 
                    private field assetHigh, private field assetLow, 
                    private field[32] path, private field order, 
                    private field nullifierHigh, private field nullifierLow, 
                    private field publicKeyBHigh, private field publicKeyBLow, 
                    private field  saltAHigh, private field saltALow, 
                    private field saltBHigh, private field  saltBLow, 
                    private field secretKeyAHigh, private field secretKeyALow, 
                    private field rootHigh, private field rootLow, 
                    private field commitmentBHigh, private field commitmentBLow)->():
        */
    // 위에서의 이슈는 path 가 아닐까 합니다!!!!!!
}



// blockchainOption.nfTokenShieldJson : abi..
// blockchainOption.nfTokenShieldAddress : Contract Address                 // <-- nfTokenShield : DiaNFT
// blockchainOption.account : account that is sending these transactions

async function mintDia( tokenId, ownerPublicKey, salt, blockchainOptions) {
    const {nfTokenShieldJson, nfTokenShieldAddress} = blockchainOptions;
    const account = util.ensure0x(blockchainOptions.account);

    const p = config.ZOKRATES_PACKING_SIZE; // ????
    const pt = Math.ceil((config.INPUTS_HASHLENGTH * 8 ) / config.ZOKRATES_PACKING_SIZE);   // ????

    // Contract 연결!!
    const nfTokenShield = contract(nfTokenShieldJson);
    nfTokenShield.setProvider(Web3.connect());
    const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

    const commitment = utils.concatenateThenHash(
        utils.strip0x(tokenId).slice(-32*2),
        ownerPublicKey,
        salt,
    );
    console.log('z_A commitment:', commitment, ' : ', utils.hexToFieldPreserve(commitment, p, pt));

    const publicInputHash = utils.concatenateThenHash(tokenId, commitment);

    console.log('Computing proof with w=[pk_A, S_A] x=[A,z_A,1]');
    
    let proof;
    let witnesses = [
        new ele.Element(publicInputHash, 'field', 248, 1),
        new ele.Element(tokenId, 'field'),
        new ele.Element(ownerPublicKey, 'field'),
        new ele.Element(salt, 'field'),
        new ele.Element(commitment, 'field'),
    ];
    // === proof will be generated from 'witnesses'

    let inputs = [new ele.Element(publicInputHash, 'field', 248,1)];
    
    console.log('witness : ', cv.computeVectors(witnesses), 
                    ', inputs : ',  cv.computeVectors(inputs));

    const txReceipt = await nfTokenShieldInstance.mint(proof, inputs, tokenId, commitment, {
        from: account,
        gas: 6500000,
        gasPrice: config.GASPRICE,
    });
    const commitmentIndex = txReceipt.logs[0].args.commitment_index;
    const root = await nfTokenShieldInstance.latestRoot();

}


async function transferDia(tokenID, receiverPublicKey, originalCommitmentSalt, newCommitmentSalt,
                        senderSecretKey, commitment, commitmentIndex,
                        blockchainOptions) {    // vkId

    const {nfTokenShieldJson, nfTokenShieldAddress} = blockchainOptions;
    const account = utils.ensure0x(blockchainOptions.account);

    const nfTokenShield = contract(nfTokenShieldJson);
    nfTokenShield.setProvider(Web3.connect());
    const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

    // Contract 연결!!
    const nfTokenShield = contract(nfTokenShieldJson);
    nfTokenShield.setProvider(Web3.connect());
    const nfTokenShieldInstance = await nfTokenShield.at(nfTokenShieldAddress);

    let A = await utils.rndHex(32);                                                     // tokenId
    let B = await utils.rndHex(32);
    let skA = '0x0000000000111111111111111111111111111111111111111111111111111111';     // senderSecretKey
    let skB = '0x0000000000222222222222222222222222222222222222222222222222222222';
    
    let pkB = utils.ensure0x(utils.strip0x(utils.hash(skB)).padStart(32,'0'));          // receiverPublicKey
    let pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32,'0'));
    console.log(pkB);

    let S_A_A = await utils.rndHex(32);                                                 // originalCommitmentSalt
    let sAToBA = await utils.rndHex(32);                                                // newCommitmentSalt
    let Z_A_A = utils.concatenateThenHash(utils.strip0x(A).slice(-32 * 2), pkA, S_A_A); // commitment

    let zIndA;                                                                          // commitment Index

    // const Verifier 관련
    // const Verifier = contract(jsonfile.readFileSync('./build/contracts/transfer_verifier.json));
        // contract 는 truffle-contract npm 임
    // Verifier.setProvider(Web3.connect())

}

const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
const skB = '0x0000000000222222222222222222222222222222222222222222222222222222';
let pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32,'0'));
let pkB = utils.ensure0x(utils.strip0x(utils.hash(skB)).padStart(32,'0'));

async function mintNFToken () {
    let A = await utils.rndHex(32);
    let S_A_A = await utils.rndHex(32);
    let S_A_G = await utils.rndHex(32);
    let sAToBA = await utils.rndHex(32);
    let Z_A_A = utils.concatenateThenHash(utils.strip0x(A).slice(-32*2), pkB, S_A_A);

    let zIndexA;    // will return from mint func.
    const p = config.ZOKRATES_PACKING_SIZE; // ????
    const pt = Math.ceil((config.INPUTS_HASHLENGTH * 8 ) / config.ZOKRATES_PACKING_SIZE);   // ????
    console.log('A:' , A, ' : ', utils.hexToFieldPreserve(A, p, pt));
    console.log('pk_A:', pkA, ' : ', utils.hexToFieldPreserve(pkA, p, pt));
    console.log('S_A:' , S_A_G, ' : ', utils.hexToFieldPreserve(S_A_G,p,pt));

    console.log(S_A_A)
    console.log(skA)
    console.log(pkA)
    console.log(Z_A_A)

    //======= Proof - witnesses for mint!! ========//
    // - publicInputHash = hash(asset, commitment)
    // - asset - is the ERC-721 tokenId for the asset
    // - publicKey (private) is the public key of Alice derived by hashing the secretKey of Alice
    // - salt (private) is the salt for the commitment
    // - commitment - is the public commitment
    let commitment = utils.concatenateThenHash( // tokenId || public key || salt
        utils.strip0x(A).slice(-32 * 2),
        pkA,
        S_A_A,
    );

    let publicInputHash = utils.concatenateThenHash(
        A, commitment
    );

    let elements = [
        new ele.Element(publicInputHash, 'field', 248,1),    //
        new ele.Element(A, 'field'),        // asset - tokenId
        new ele.Element(pkA, 'field'),      // public key
        new ele.Element(S_A_A, 'field'),    // salt
        new ele.Element(commitment, 'field'),   // commitment

    ];
    witness = cv.computeVectors(elements);
    console.log(witness);
    
    let cmd = './zokrates compute-witness -a ';
    witness.forEach( p => {
        cmd += `${new BN(p,10).toString(10)} `
    });
    console.log(cmd);

    //======= Verify ========//
    let verifyElements = [
        new ele.Element(Z_A_A, 'field', 248,1)
    ];
    console.log('Verify : ', cv.computeVectors(verifyElements));


    //=============================nft-transfer.code 관련 테스트===============================//

}

async function transferNFToken() {
    let tokenId = await utils.rndHex(32);                                                     // tokenId
    let B = await utils.rndHex(32);
    let senderSecretKey = '0x0000000000111111111111111111111111111111111111111111111111111111';     // senderSecretKey
    let skB = '0x0000000000222222222222222222222222222222222222222222222222222222';
    
    let receiverPublicKey = utils.ensure0x(utils.strip0x(utils.hash(skB)).padStart(32,'0'));          // receiverPublicKey
    let pkA = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32,'0'));
    console.log(pkB);

    let originalCommitmentSalt = await utils.rndHex(32);                                                 // originalCommitmentSalt
    let newCommitmentSalt = await utils.rndHex(32);                                                // newCommitmentSalt
    let commitment = utils.concatenateThenHash(utils.strip0x(A).slice(-32 * 2), pkA, S_A_A); // commitment

    let commitmentIndex;                                                                          // commitment Index

    // [!!!!!!!!!] compute-vectors와 관련해서 contract 의 도움이 필요한 곳이 있으니 
    //  일단 node <-> contract 연결을 테스트하고 transferNFToken 을 구동하라!!
    let nfTokenShieldInstance;
    let account;

    //const root = await nfTokenShieldInstance.latestRoot();
    const root = '0x1234';  // from the merkle tree in the contract
    console.log(`Merkle Root : ${root}`);

    // Calculate new arguments for the proof..
    const nullifier = utils.concatenateThenHash(originalCommitmentSalt, senderSecretKey);
    const outputCommitment = utils.concatenateThenHash(     // commitment = tokenId || publicKey || salt
            utils.strip0x(tokenId).slice(-config.INPUT_HASHLENGTH * 2),
            receiverPublicKey,
            newCommitmentSalt,
    );

    // the Merkle Path from the token commitment to the root..
    const path = await cv.computePath(account, nfTokenShieldInstance, commitment, commitmentIndex,)
            .then(result =>{
                return {
                    elements: result.path.map(
                        element => new Element(lelement, 'field', config.MERKLE_HASHLENGTH * 8, 1),
                    ),
                    position: new Element(result.positions, 'field', 128, 1),
                };
            });
    
    // check the path and root match
    if (path.elements[0].hex != root) {
        throw new Error (`Root inequality: sister-path[0]=${path.elements[0].hex} root=${root}`);
    }

    const p = config.ZOKRATES_PACKING_SIZE;                                                         // packing size in bits
    const pt = Math.ceil((config.INPUT_HASHLENGTH*8) / config.ZOKRATES_PACKING_SIZE)    //????????? // packets in bits..

    const publicInputHash = utils.concatenateThenHash(root, nullifier, outputCommitment);
    console.log('publicInputHash: ', publicInputHash);  // zkp circuit 에 public input 들에 대한 전체 해쉬값!!! - To check integrity??!!
    let elements =[
        new ele.Element(publicInputHash, 'field', 248, 1),
        new ele.Element(tokenId, 'field'),
        ...path.elements.slice(1),
        path,positions, // why these two not to be wrapped with Element.
        new ele.Element(nullifier, 'field'),
        new ele.Element(receiverPublicKey, 'field'),
        new ele.Element(originalCommitmentSalt, 'field'),
        new ele.Element(newCommitmentSalt, 'field'),
        new ele.Element(senderSecretKey, 'field'),
        new ele.Element(root, 'field'),
        new ele.Element(outputCommitment, 'field'),
    ];

    witness = cv.computeVectors(elements);
    console.log(witness);

    let cmd = './zokrates compute-witness -a ';
    witness.forEach( p => {
        cmd += `${new BN(p,10).toString(10)} `
    });
    console.log(cmd);
    
    //=============== Verify ==============//
    let verifyElements = [
        new ele.Element(publicInputHash, 'field', 248,1),
    ];
    console.log('Verify : ', cv.computeVectors(verifyElements));
    
}

mintNFToken()

async function testConnectContract() {
    const nfTokenShield = contract('./build/contracts/DiaNFT_Merkle.json');
    nfTokenShield.setProvider(Web3.connect());
    const nfTokenShieldInstance = await nfTokenShield.at('0x854aAC232B05c2BE1B29f65216fd4444Dab72b43');

    console.log(nfTokenShieldInstance);
}

testConnectContract()


const pp = require('./precise-proof')
const report = {
    cut : "shallow",
    color : "D",
    clarity : "VVS1",   // Verify, Verify Slightly Included 1
    carat : "1.0",
    girdleCode : "SAMI161203",
    details : {
        issuer : "0x",  // public key..
        uri : "http://bit.ly/2CYyz3x",
    },
};

function testPreciseProof(){
    const demoinput = {
        operationalSince: 0,
        capacityWh: 10,
        country: "Germany",
        region: "Saxony",
        active: true,
        nestedObject: {
            id: 1,
            somedata: "hello",
            ObjectInObjectInObject: {
                id:2,
                somedata: "there"
            }
        },
        zip: "09648",
        city: "Mittweida",
        street: "Main Street",
        houseNumber: "101",
        gpsLatitude: "50.986783",
        gpsLongitude: "12.980977",
        listElement: [1, 3, 3]
    };


    const leafs = pp.PreciseProofs.createLeafs(demoinput) 
    // value - key , value , salt , hash
    /*
    {   key: 'nestedObject',
        value: '{"id":1,"somedata":"hello","ObjectInObjectInObject":{"id":2,"somedata":"there"}}',
        salt: '8lvl+HoiXG9a0gaH',
        hash: '22cd416028f65b6e3a067c98f6ee4814e0348aeba6b814a61f3a4d9a30fcaccd' }
    */
    let value = pp.PreciseProofs.findLeaf(leafs, "nestedObject")
    console.log(value)
    var json = JSON.parse(value.value)
    console.log('nestedObject : ', json.id , json.somedata, json.ObjectInObjectInObject)

    const merkleTree = pp.PreciseProofs.createMerkleTree(leafs.map((leaf) => leaf.hash))
    const rootHash = merkleTree[merkleTree.length - 1][0]
    const schema = leafs.map((leaf) => leaf.key)
    //console.log(schema)
    const extendedTreeHash = pp.PreciseProofs.createExtendedTreeRootHash(rootHash, schema)
    const extendedProof = pp.PreciseProofs.createProof('street', leafs, true)
    const result = pp.PreciseProofs.verifyProof(extendedTreeHash, extendedProof, schema);

    console.log(result)
        
}

testPreciseProof()

