const DiaNFT = artifacts.require("DiaNFT");
const BN = require('bn.js')
const crypto = require('crypto')

contract('DiaNFT', function(accounts) {
    it.only('transferDia', async function() {

    })
})

// address - string
async function encrypt(address, _amount) {
    let amount = new BN(_amount, 16).toString(16,24);   // 24chars in hex.. 96bits = 12bytes???!!
    const payload = address + amount;
    console.log('enc payload', payload);
    const encryptedDia = await web3.eth.accounts.encrypt('0x' + payload, 'vitalik')
}