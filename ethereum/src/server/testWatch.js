const contract = require('truffle-contract');
const Web3 = require('../web3');
const jsonfile = require('jsonfile');

const ADDR_MARKET = '0x473839c2aC0FD78A8740b1f3c03be6cc7529c1b8';
const ADDR_DIANFT_MERKLE = '0x19c43C361AcE6BE4fa4Ed7517aD341ff32c8C00D';
const ACCOUNT = '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a';

async function testWatchForEvent() {
    const marketContract = contract(jsonfile.readFileSync('../../build/contracts/DiaNFT_Merkle.json'));
    let web3_connection = Web3.connect();
    marketContract.setProvider(web3_connection);
    const diaNftInstance = await marketContract.at(ADDR_DIANFT_MERKLE);

    diaNftInstance.Mint(function (err, result) {
        if (err) {
            return error(err);
        }
        console.log(result);
    })

    diaNftInstance.Transfer(function (err, result) {
        if (err) {
            return error(err);
        }
        console.log(result);
    })

}

testWatchForEvent();