const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');
const BN = require('bn.js');

const ADDR_STABLECOIN = '0xD7e67B9B0915CDF836966c2Df72Fd030cFc6285D';
const ADDR_POOL = '0x91c929617d35F1083336044218F31FB6C5FaCD46';
const ACCOUNT_0 = '0xc0bdc5a3c498f3ef252b2afb00707b9985a83eed';
const ACCOUNT_1 = '0x6304Dfe18f9C9e345300e5E6D4112DF1F426dE46';
const ACCOUNT_2 = '0xa09550C9B7c9B0884c3296a64073E80596B718E2';
const ACCOUNT_3 = '0xD778e88dCF26f63D104c88056AE3c2A57FC3a0df';

async function testDeposit() {
    const pool = contract(jsonfile.readFileSync('../build/contracts/Pool.json'));
    let web3_connection = Web3.connect();
    pool.setProvider(web3_connection);
    const poolInstance = await pool.at(ADDR_POOL);

    const txReciept = await poolInstance.investForDiaTx(10000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    });
}

async function testBalance() {
    const coin = contract(jsonfile.readFileSync('../build/contracts/DiaStableCoin.json'));
    let web3_connection = Web3.connect();
    coin.setProvider(web3_connection);
    const coinInstance = await coin.at(ADDR_STABLECOIN);

    const bal = await coinInstance.balanceOf(ACCOUNT_0);
    console.log('balance_0 : ', BN(bal).toString());

    const txReciept1 = await coinInstance.transfer(ACCOUNT_1,100000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })    

    const bal1 = await coinInstance.balanceOf(ACCOUNT_1);
    console.log('balance_1 : ', BN(bal1).toString());

    const txReciept2 = await coinInstance.transfer(ACCOUNT_2,100000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })    

    const bal2 = await coinInstance.balanceOf(ACCOUNT_2);
    console.log('balance_2 : ', BN(bal2).toString());

    const txReciept3 = await coinInstance.transfer(ACCOUNT_3,100000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })    

    const bal3 = await coinInstance.balanceOf(ACCOUNT_3);
    console.log('balance_3 : ', BN(bal3).toString());

    /*
    const bal0 = await coinInstance.balanceOf(ADDR_POOL);
    console.log(BN(bal0).toString());

    const bal = await coinInstance.balanceOf(ACCOUNT_0);
    console.log(BN(bal).toString());

    const txReciept = await coinInstance.transfer(ACCOUNT_1,1000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const bal1 = await coinInstance.balanceOf(ACCOUNT_1);
    console.log(BN(bal1).toString());

    const txReciept1 = await coinInstance.increaseAllowance(ADDR_POOL, 100,{
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const txReciept2 = await coinInstance.transfer(ACCOUNT_2,1000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const bal2 = await coinInstance.balanceOf(ACCOUNT_2);
    console.log(bal2.toString());

    const txReciept3 = await coinInstance.increaseAllowance(ADDR_POOL, 100,{
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const txReciept4 = await coinInstance.transfer(ACCOUNT_3,1000, {
        from : ACCOUNT_0, gas: 6500000, gasPrice: config.GASPRICE,
    })

    const bal3 = await coinInstance.balanceOf(ACCOUNT_3);
    console.log(bal3.toString());
    */
}


testBalance();
//testDeposit();