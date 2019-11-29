const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');
const BN = require('bn.js');

const ADDR_STABLECOIN = '0xA7E696f4266cC95039939A1d227Ac029B8C3a137';
const ADDR_POOL = '0xB292d9657b85F515Cd1333fbbb0A226194Ff8E18';
const ACCOUNT_0 = '0xc0bdc5a3c498f3ef252b2afb00707b9985a83eed';
const ACCOUNT_1 = '0x0b04beacd46a1813c0a895ab7e0a3a85bd0ace2b';
const ACCOUNT_2 = '0xaef4a953107bd2d3924704cc58d5ebdf97ba3ead';

async function testDeposit() {
    const pool = contract(jsonfile.readFileSync('../build/contracts/Pool.json'));
    let web3_connection = Web3.connect();
    pool.setProvider(web3_connection);
    const poolInstance = await pool.at(ADDR_POOL);

    const txReciept = await poolInstance.investForDiaTx(100, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    });

}

async function testBalance() {
    const coin = contract(jsonfile.readFileSync('../build/contracts/DiaStableCoin.json'));
    let web3_connection = Web3.connect();
    coin.setProvider(web3_connection);
    const coinInstance = await coin.at(ADDR_STABLECOIN);

    const bal0 = await coinInstance.balanceOf(ADDR_POOL);
    console.log(BN(bal0).toString());

    const bal = await coinInstance.balanceOf(ACCOUNT_0);
    console.log(BN(bal).toString());

    const txReciept = await coinInstance.transfer(ACCOUNT_1,1000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const bal1 = await coinInstance.balanceOf(ACCOUNT_1);
    console.log(BN(bal1).toString());

    const txReciept1 = await coinInstance.transfer(ACCOUNT_2,1000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const bal2 = await coinInstance.balanceOf(ACCOUNT_2);
    console.log(bal2.toString());
}


testDeposit();
testBalance();