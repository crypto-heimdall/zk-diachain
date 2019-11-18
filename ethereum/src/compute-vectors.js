const utils = require('./zkpUtils');
const base = require('./baseUtils');

function computeVectors(elements) {
    let a = [];
    elements.forEach(element => {
        switch (element.encoding) {
            case 'bits':
                a = a.concat(base.hexToBin(utils.strip0x(element.hex)));
                break;
            case 'bytes':
                a = a.concat(base.hexToBytes(utils.strip0x(element.hex)));
                break;
            case 'field':
                a = a.concat(utils.hexToFieldPreserve(element.hex, element.packingSize, element.packets));
                break;
            default:
                throw new Error('Encoding type not recognized..');
        }
    });
    return a;
}

module.exports={
    computeVectors,
};