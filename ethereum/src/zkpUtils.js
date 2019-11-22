const crypto = require('crypto');
const base = require('./baseUtils');
const config = require('./config.js');

const inputsHashLength = 32;


function ensure0x(hex='') {
    const hexString = hex.toString();
    if (typeof hexString === 'string' && hexString.indexOf('0x') !== 0) {
        return `0x${hexString}`;
    }
    return hexString;
}

function strip0x(hex) {
    if (typeof hex === 'undefined') return '';
    if (typeof hex === 'string' && hex.indexOf('0x') === 0 ) {
        return hex.slice(2).toString();
    }
    return hex.toString();
}

function isHex(h) {
    const regexp = /^[0-9a-fA-F]+$/;
    return regexp.test(strip0x(h));
}

function hash(item) {
    const preimage = strip0x(item);
    const h = `0x${crypto.createHash('sha256').update(preimage, 'hex').digest('hex').slice(-(inputsHashLength *2))}`;
    return h;
}

function rndHex(bytes) {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(bytes, (err, buf) => {
            if (err) reject(err);
            resolve(`0x${buf.toString('hex')}`)
        })
    })
}

function concatenate(a,b) { // two hex string into a buffer
    const length = a.length + b.length;
    const buffer = Buffer.allocUnsafe(length);
    for (let i = 0; i < a.length ; i += 1) {
        buffer[i] = a[i];
    }
    for (let j = 0; j < b.length; j += 1) {
        buffer[a.length + j] = b[j];
    }
    return buffer;
}

function concatenateThenHash (...items) {
    const concatvalue = items.map(item => Buffer.from(strip0x(item), 'hex')).reduce((acc, item) => concatenate(acc, item));
    const h = `0x${crypto.createHash('sha256').update(concatvalue, 'hex').digest('hex')}`;
    return h;
}


function hexToFieldPreserve(hexStr, packingSize, packets, silenceWarnings) {
    let bitsArr = [];
    bitsArr = base.splitHexToBits(strip0x(hexStr).toString(), packingSize.toString());
    
    let decArr = [];    //decimal Array
    decArr = bitsArr.map(item => base.binToDec(item.toString()));
    if (packets !== undefined) {
        if (packets < decArr.length) {
            const overflow = decArr.length - packets;
            // remove extra packets (?? Dangerous?!)
            for (let i =0; i < overflow; i += 1) decArr.shift();
        } else {
            const missing = packets - decArr.length;
            // add any missing zero elements
            for (let i = 0; i < missing; i += 1)    decArr.unshift('0');
        }
    }
    return decArr;
}

function getLeafIndexFromZCount(zCount) {
    const zCountInt = parseInt(zCount, 10);
    const merkleWidth = parseInt(2 ** (config.MERKLE_DEPTH - 1), 10);
    const leafIndex = parseInt(merkleWidth - 1 + zCount, 10);

    return leafIndex;
}

module.exports = {
    ensure0x,
    strip0x,
    hash,
    rndHex,
    concatenateThenHash,
    hexToFieldPreserve,
    isHex,
    getLeafIndexFromZCount,
};