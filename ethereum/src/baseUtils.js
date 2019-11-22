const hexToBinary = require('hex-to-binary');

function strip0x(hex) {
    if (typeof hex === 'undefined') return '';
    if (typeof hex === 'string' && hex.indexOf('0x') === 0 ) {
        return hex.slice(2).toString();
    }
    return hex.toString();
}

function hexToBin(hex) {
  return hexToBinary(strip0x(hex)).split('');
}
/**
Converts hex strings into byte (decimal) values.  This is so that they can
be passed into  merkle-proof.code in a more compressed fromat than bits.
Each byte is invididually converted so 0xffff becomes [15,15]
*/
function hexToBytes(hex) {
  const cleanHex = strip0x(hex);
  const out = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const h = ensure0x(cleanHex[i] + cleanHex[i + 1]);
    out.push(parseInt(h, 10).toString());
  }
  return out;
}


/** Helper function for the converting any base to any base
 */
function add(x, y, base) {
    const z = [];
    const n = Math.max(x.length, y.length);
    let carry = 0;
    let i = 0;
    while (i < n || carry) {
      const xi = i < x.length ? x[i] : 0;
      const yi = i < y.length ? y[i] : 0;
      const zi = carry + xi + yi;
      z.push(zi % base);
      carry = Math.floor(zi / base);
      i += 1;
    }
    return z;
  }

/** Helper function for the converting any base to any base
 Returns a*x, where x is an array of decimal digits and a is an ordinary
 JavaScript number. base is the number base of the array x.
*/
function multiplyByNumber(num, x, base) {
    if (num < 0) return null;
    if (num === 0) return [];
  
    let result = [];
    let power = x;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-bitwise
      if (num & 1) {
        result = add(result, power, base);
      }
      num >>= 1; // eslint-disable-line
      if (num === 0) break;
      power = add(power, power, base);
    }
    return result;
  }

/** Helper function for the converting any base to any base
 */
function parseToDigitsArray(str, base) {
    const digits = str.split('');
    const ary = [];
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      const n = parseInt(digits[i], base);
      if (Number.isNaN(n)) return null;
      ary.push(n);
    }
    return ary;
  }

/** Helper function for the converting any base to any base
 */
function convertBase(str, fromBase, toBase) {
    const digits = parseToDigitsArray(str, fromBase);
    if (digits === null) return null;
  
    let outArray = [];
    let power = [1];
    for (let i = 0; i < digits.length; i += 1) {
      // invariant: at this point, fromBase^i = power
      if (digits[i]) {
        outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
      }
      power = multiplyByNumber(fromBase, power, toBase);
    }
  
    let out = '';
    for (let i = outArray.length - 1; i >= 0; i -= 1) {
      out += outArray[i].toString(toBase);
    }
    // if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
    if (out === '') {
      let sum = 0;
      for (let i = 0; i < digits.length; i += 1) {
        sum += digits[i];
      }
      if (sum === 0) out = '0';
    }
    return out;
}

function hexToBinSimple(hex) {
    const bin = convertBase(strip0x(hex), 16, 2);
    return bin;
  }

/**
Used by splitAndPadBitsN function.
Left-pads the input binary string with zeros, so that it becomes of size N bits.
@param {string} bitStr A binary number/string.
@param {integer} N The 'chunk size'.
@return A binary string (padded) to size N bits.
*/
function leftPadBitsN(bitStr, n) {
    const len = bitStr.length;
    let paddedStr;
    if (len > n) {
      return new Error(`String larger than ${n} bits passed to leftPadBitsN`);
    }
    if (len === n) {
      return bitStr;
    }
    paddedStr = '0'.repeat(n - len);
    paddedStr = paddedStr.toString() + bitStr.toString();
    return paddedStr;
}

/**
Used by split'X'ToBitsN functions.
Checks whether a binary number is larger than N bits, and splits its binary representation into chunks of size = N bits. The left-most (big endian) chunk will be the only chunk of size <= N bits. If the inequality is strict, it left-pads this left-most chunk with zeros.
@param {string} bitStr A binary number/string.
@param {integer} N The 'chunk size'.
@return An array whose elements are binary 'chunks' which altogether represent the input binary number.
*/
function splitAndPadBitsN(bitStr, n) {
    let a = [];
    const len = bitStr.length;
    if (len <= n) {
      return [leftPadBitsN(bitStr, n)];
    }
    const nStr = bitStr.slice(-n); // the rightmost N bits
    const remainderStr = bitStr.slice(0, len - n); // the remaining rightmost bits
  
    a = [...splitAndPadBitsN(remainderStr, n), nStr, ...a];
  
    return a;
  }

function splitHexToBits(hexStr, n) {
    const strippedHexStr = strip0x(hexStr);
    const bitStr = hexToBinSimple(strippedHexStr.toString());
    let a = [];
    a = splitAndPadBitsN(bitStr, n);
    return a;
}

// Converts binary value strings to decimal values
function binToDec(binStr) {
    const dec = convertBase(binStr, 2, 10);
    return dec;
}

function binToHex(binStr) {
  const hex = convertBase(binStr, 2, 16);
  return hex ? `0x${hex}` : null;
}

module.exports={
    splitHexToBits,
    binToDec,
    hexToBin,
    hexToBytes,
    binToHex,
};