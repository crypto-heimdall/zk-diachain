const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');

const ADDR_MARKET = '0x0e399d51118eea16127c40234692824556d03AE0';
const ACCOUNT = '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a';

async function testChangeDiamondStatus() {
    const market = contract(jsonfile.readFileSync('../build/contracts/Market.json'));
    let web3_connection = Web3.connect();
    market.setProvider(web3_connection);
    const marketInstance = await market.at(ADDR_MARKET);

    const txReciept = await marketInstance.register('cut1','color1','clarity1','carat1',1000, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });
    const itemId = txReciept.logs[0].args.itemId;
    console.log ('register done : ', itemId);

    const txReciept0 = await marketInstance.transitStatus (itemId, 1, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });

    const txReciept1 = await marketInstance.changeDiamondStatus(itemId, {
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    });
    const success = txReciept1.logs[0].args.success;
    console.log('change Diamond Status : ', success);

}

testChangeDiamondStatus();