const contract = require('truffle-contract');
const Web3 = require('./web3');
const jsonfile = require('jsonfile');
const config = require('./config');
const utils = require('./zkpUtils');

const ADDR_PLAYERROLE = '0x4BAdf90a6149E6f78d5974783EB0F19Cee71463F';
const ACCOUNT = '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a';

async function testPlayerRole() {
    const playerRole = contract(jsonfile.readFileSync('../build/contracts/PlayerRole.json'));
    let web3_connection = Web3.connect();
    playerRole.setProvider(web3_connection);
    const playerRoleInstance = await playerRole.at(ADDR_PLAYERROLE);

    const A = '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a';
    const B = '0x6778cf52a91ed0532d217eb041f385ae57a9d9d3';
    const C = '0xbf91ee2339ecee9533500034d21771e157131ca0';
    const D = '0x8c4bc19ac4541d3266ecc963d97fc75f4fb028f8';
    const E = '0x3d3b65cf3b54daa48386aa3ca257523488f8ee72';
    const F = '0x89757e11f6b7788ab3dd15d471da49d7adffc52d';
    const G = '0x1d946894c9c3bcb51848de6bb5a4ea5956463c31';

    let txReceipt = await playerRoleInstance.addWholesalers([A, B],{
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    })
    txReceipt = await playerRoleInstance.addRetailers([A, C, D, E],{
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    })
    txReceipt = await playerRoleInstance.addGemologists([B, F, G],{
        from : ACCOUNT,    gas: 6500000, gasPrice: config.GASPRICE,
    })

    roles = await playerRoleInstance.checkPlayerRole(A);
    console.log(roles);

}

testPlayerRole();