const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config')

const ADDR_MARKET = '0x473839c2aC0FD78A8740b1f3c03be6cc7529c1b8';
const ACCOUNT = '0xc0bdc5a3c498f3ef252b2afb00707b9985a83eed';

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

dummyForMarket();