const crypto = require('crypto');
const BN = require('bn.js');

function getSecretZokratesParams(concat) {  // 128 long in hex.. 4bit = 512bits..split into 4 * 128 bits 
    return [concat.slice(0,32), concat.slice(32,64), concat.slice(64,96), concat.slice(96)]
}

function getPublicZokratesParams(hexPayload) {  // payload - string with 128 long in 0x type
    const buf = Buffer.from(hexPayload, 'hex')

    const digest = crypto.createHash('sha256').update(buf).digest('hex')
    console.log('Public-Zokrates', digest)  // 256 bits - 64 long in hex(4bits)
    return [digest.slice(0,32), digest.slice(32)]   // 그럼 64 /2 = 32 반!! * 4bits 는 결국 128 bits 만큼 나눈다.
}

function getHexPayload(from, amount) {
    let paddedAddress = new BN(from, 16).toString(16,64);
    let paddedAmount = new BN(amount, 16).toString(16,64);
    return paddedAddress + paddedAmount;    // 64 + 64 = 128 (concat)
}

function getNoteParams (from, amount) {
    let hexPayload = getHexPayload(from, amount);   // 128 long in hex
    console.log('hexPayload', hexPayload);
    // Public 의 경우 sha256 hash 떠서 Hidden 시킴!!
    let zkParams = getPublicZokratesParams(hexPayload).concat(getSecretZokratesParams(hexPayload))
    console.log('zkParams', zkParams)
    return zkParams;
}

function printZokratesCommand(params) {
    let cmd = './zokrates compute-witness -a ';
    params.forEach(p => {
        cmd += `${new BN(p,16).toString(10)} `   // why converting?!?!
    });
    console.log(cmd)
}

function getTransferZkParams(from, fromAmount, to, toAmount) {
    from = from.slice(2)    // remove '0x'
    fromAmount = fromAmount.slice(2)
    to = to.slice(2)
    toAmount = toAmount.slice(2)

    let change = parseInt(fromAmount,16) - parseInt(toAmount, 16);
    // NoteParams : public param (보통 해시값 256 bits) + private param (해시값을 만든 거!)
        // 다만 어디선가 본바에 따르면 ZoKrates 의 변수가 256 즉 32 bytes 가 안된다 그래서 Note Param에서 256 bits를 둘로 나눈다!!
        // 나눈 값은 그럼.. zokrates 코드에서 뭐 sha256packed 에서 처리해주는 듯하다!!
    let params = getNoteParams(from, fromAmount).concat(getNoteParams(to, toAmount));
    console.log('leftOver')
    let leftOver = getNoteParams(from, change)
    
    console.log('org-leftOver', leftOver)
    leftOver.splice(2,2)    //first 2 params (spender public key) are the same.. delete elements at 2,3 index (secret key)

    printZokratesCommand(params.concat(leftOver));
}
/*
getTransferZkParams(
    '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09', // sender
    '0xb',  // value of the secret from the sender
    '0x9e8f633D0C46ED7170EF3B30E291c64a91a49C7E',
    '0x9'
)
*/

module.exports = {
    getTransferZkParams,
}