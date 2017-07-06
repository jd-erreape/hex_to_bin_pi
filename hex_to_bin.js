const R = require('ramda');

// Extracted from:
// https://stackoverflow.com/questions/7695450/how-to-program-hex2bin-in-javascript

const _checkHex = n => /^[0-9A-Fa-f]{1,64}$/.test(n);
const hex2BinString = n => _checkHex(n) && parseInt(n,16).toString(2);

// Convert the binary string into an array of boolean values

const pad = (size, num) => {
    while (num.length < size) num = "0" + num;
    return num;
}

const pad4 = R.curry(pad)(4);
const toBool = char => char === '1';
const split = string => string.split('');

module.exports = R.compose(R.map(toBool), split, pad4, hex2BinString);
