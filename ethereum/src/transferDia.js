const BN = require('bn.js');
const fs = require('fs');
const jsonFile = "../build/contracts/DiaNFT.json";
let parsed = JSON.parse(fs.readFileSync(jsonFile));
const abi = parsed.abi;

var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

const diaNFTAddress = '0xf4f6207bF17E6e82143F2bEf50784DbE3076799C';

async function execute() {
    let proofJson = fs.readFileSync('../../zkp/circuit/proof.json', 'utf8');
    proofJson = JSON.parse(proofJson);

    const proof = proofJson.proof;
    const input = proofJson.inputs;

    const _proof = [];
    Object.keys(proof).forEach(key => _proof.push(proof[key]));
    _proof.push(input);

    // 
    const encDia1 = await encrypt ('9e8f633D0C46ED7170EF3B30E291c64a91a49C7E', '9');    // Receiver?!
    const encDia2 = await encrypt ('3644B986B3F5Ba3cb8D5627A22465942f8E06d09', '2');    // leftOver?!
    console.log('calling transferDia with params', ..._proof, encDia1, encDia2);
    
    let diaNFTContract = new web3.eth.Contract(abi, diaNFTAddress);

    try {
        await diaNFTContract.methods.transferDia(..._proof, encDia1, encDia2).send({
            from: '0xaea19bed7dd9717a78ee24bac271eca5cb149f3a', // Address..
            gasPrice: '0x' + parseInt('90339414640000000000').toString(16)
        })
    } catch(e) {
        console.log(e)
    }
}

async function encrypt(address, _amount) {
    // 20 12
    let amount = new BN(_amount, 16).toString(16, 24); // 12 bytes = 24 chars in hex
    const payload = address + amount;
    return payload;
}

module.exports = async function(callback) {
    // Perform actions
    await execute();
    callback();
}

execute();