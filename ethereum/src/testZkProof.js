const fs = require('fs')
const utils = require('./zkpUtils')
const base = require('./baseUtils')

function loadProof() {

    let {proof} = JSON.parse(fs.readFileSync('../../zkp/circuit/proof.json'));
    /* proof
    {   a:
            [ '0x0c40a2c89e757aa06258d68d47ddef22b5dfd57a9421ff46fbb829a9ab137553',
            '0x179cf88c16635064f556a2587d487bc1822cac2b29135a4184b4a46c60a2bffd' ],
        b:
            [ [ '0x0bd4f98ca7fd546f73b94b406ec71be24654668668906e9d89f705e5f0319040',
            '0x2b4ec020671ed525ca617a9ae6753cf3cdcfc53ffed71fc83db34333d0caf53e' ],
            [ '0x2f44fb490f74f4b28f927330cdc4ac9d39842b396be7bee403a7b86d1deb5898',
            '0x11b4a9114e1fd4b8bd01f08d46c6d73538fc75e7ce12112a5b396d7c8aee05b0' ] ],
        c:
            [ '0x2d588690e18debe327994a437b2f02e74cf64d450f4e5d58ba9d604f6602b692',
            '0x07075a2a171be715b77b34115ac1d3804bb4c8f1aa6f601c45f8b3fc6690b6e0' ] }
    */
    proof = Object.values(proof);
    proof = utils.flattenDeep(proof);
    // convert to decimal, as the solidity functions expect uints
    proof = proof.map(el => base.hexToDec(el));
    console.log(typeof proof[0])
    console.log(proof);

}

loadProof();