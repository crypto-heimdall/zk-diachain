const utils = require('./zkpUtils')
const config = require('./config.js')

function Element(hex, encoding, packingSize, packets) {
    const allowedEncoding = ['bits', 'bytes', 'field'];

    if (!allowedEncoding.includes(encoding))
        throw new Error('Element encoding must be one of:', allowedEncoding);
    if (hex === undefined) throw new Error('Hex string was undefined');
    if (hex === '') throw new Error('Hex string was empty');
    if (!utils.isHex(hex)) throw new Error(`This does not appear to be hex:${hex.toString()}`);

    this.hex = utils.ensure0x(hex);
    this.encoding = encoding;
    if (encoding === 'field') {
        this.packingSize = packingSize || config.ZOKRATES_PACKING_SIZE;
    }
    if (packets !== undefined) this.packets = packets;
}
/*
class Element {
    constructor(hex, encoding, packingSize, packets) {
        const allowedEncoding = ['bits', 'bytes', 'field'];

        if (!allowedEncoding.includes(encoding))
            throw new Error('Element encoding must be one of:', allowedEncoding);
        if (hex === undefined) throw new Error('Hex string was undefined');
        if (hex === '') throw new Error('Hex string was empty');
        if (!utils.isHex(hex)) throw new Error(`This does not appear to be hex:${hex.toString()}`);

        this.hex = utils.ensure0x(hex);
        this.encoding = encoding;
        if (encoding === 'field') {
            this.packingSize = packingSize || config.ZOKRATES_PACKING_SIZE;
        }
        if (packets !== undefined) this.packets = packets;
    }
}*/

module.exports={
    Element,
}