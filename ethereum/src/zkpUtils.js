

function ensure0x(hex='') {
    const hexString = hex.toString();
    if (typeof hexString === 'string' && hexString.indexOf('0x') !== 0) {
        return `0x${hexString}`;
    }
    return hexString;
}