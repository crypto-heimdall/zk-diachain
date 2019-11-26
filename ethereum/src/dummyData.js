const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');

const ADDR_MARKET = '0x473839c2aC0FD78A8740b1f3c03be6cc7529c1b8';
const ADDR_DIANFT_MERKLE = '0x7439214762d087E3aF846bfCF9e5C4239a8842d8';
const ACCOUNT = '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a';


async function dummyDiaNFT_Mint_noZkp() {
    const diaNft = contract(jsonfile.readFileSync('../build/contracts/DiaNFT_Merkle.json'));
    let web3_connection = Web3.connect();
    diaNft.setProvider(web3_connection);
    const diaNftInstance = await diaNft.at(ADDR_DIANFT_MERKLE);

    //mint (bytes32 tokenId , bytes32 commitment)
    let tokenId = await utils.rndHex(32);
    let salt = await utils.rndHex(32);

    let commitment = utils.concatenateThenHash(utils.strip0x(tokenId).slice(-config.INPUT_HASHLENGTH * 2),
                ACCOUNT, salt,);

    console.log (`DiaNFT Mint - TokenId : ${tokenId} , salt : ${salt} , commitment : ${commitment}`);
   const txReceipt =  await diaNftInstance.mint(tokenId, commitment, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });

    //console.log(txReceipt.logs[0].args);
    const commitmentIndex = txReceipt.logs[0].args.commitment_index;
    console.log('commitment index : ', commitmentIndex);

    let root = await diaNftInstance.latestRoot();
    let count = await diaNftInstance.leafCount();

    console.log('LatestRoot : ', root);
    console.log('Leaf Count : ', count);
}

async function dummyForMarket() {
    const market = contract(jsonfile.readFileSync('../build/contracts/Market.json'));
    let web3_connection = Web3.connect();
    market.setProvider(web3_connection);
    const marketInstance = await market.at(ADDR_MARKET);

    // Register dummies..
    await marketInstance.register('cut1','color1','clarity1','carat1',1000, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    })
    await marketInstance.register('cut2','color2','clarity2','carat2',2000, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    })

    // Fetch registered diamonds..
    const result = await marketInstance.getDiamonds(0,3);
    const {0:cuts, 1:colors, 2:clarity, 3:carat, 4:price} = result;

    console.log(cuts);

    //web3_connection.connection.close();
    
}

dummyDiaNFT_Mint_noZkp();
//dummyForMarket();