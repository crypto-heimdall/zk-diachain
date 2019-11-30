const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');

const ADDR_MARKET = '0xA48ec45b78fBC1be1F8288f1383ca3E95B5e4eD3';
const ACCOUNT = '0xc0bdc5a3c498f3ef252b2afb00707b9985a83eed';

async function testGetDiamonds() {
    const market = contract(jsonfile.readFileSync('../build/contracts/Market.json'));
    let web3_connection = Web3.connect();
    market.setProvider(web3_connection);
    const marketInstance = await market.at(ADDR_MARKET);

    const ret = await marketInstance.getDiamonds();
    console.log(ret);
}

async function testRentDiamond() {
    const market = contract(jsonfile.readFileSync('../build/contracts/Market.json'));
    let web3_connection = Web3.connect();
    market.setProvider(web3_connection);
    const marketInstance = await market.at(ADDR_MARKET);

    const txReciept0 = await marketInstance.transitStatus (0, 1, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });

    const txReciept = await marketInstance.rentDiamond(0, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });

}

async function testChangeDiamondStatus() {
    const market = contract(jsonfile.readFileSync('../build/contracts/Market.json'));
    let web3_connection = Web3.connect();
    market.setProvider(web3_connection);
    const marketInstance = await market.at(ADDR_MARKET);

    const txReciept = await marketInstance.register('cut2','color2','clarity2','carat2', '0x12341234', 1200, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });
    const itemId = txReciept.logs[0].args.itemId;
    console.log ('register done : ', itemId);
/*
    const txReciept0 = await marketInstance.transitStatus (itemId, 1, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });

    const txReciept1 = await marketInstance.changeDiamondStatus(itemId, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });
    const success = txReciept1.logs[0].args.success;
    console.log('change Diamond Status : ', success);
*/
}
//testRentDiamond();
//testChangeDiamondStatus();
testGetDiamonds();
