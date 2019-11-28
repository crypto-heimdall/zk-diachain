const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const jsonfile = require('jsonfile')

// precise-proof
const pp = require('../precise-proof');
const utils = require('../zkpUtils');
const base = require('../baseUtils')

// NF-Token Shield
const exec = require('child_process').exec;
const shell = require('shelljs');
const nft = require('../nf-token-controller');

// boilerplate
const config = require('../config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req, res) => {
	res.send('Hello World!\n');
});


let users = [
    {
      id: 1,
      name: 'alice'
    },
    {
      id: 2,
      name: 'bek'
    },
    {
      id: 3,
      name: 'chris'
    }
]

app.get('/users', (req, res) => {
    return res.json(users);
});
// http://webframeworks.kr/tutorials/nodejs/api-server-by-nodejs-03/
app.post('/users', (req, res) => {
    const name = req.body.name;
    console.log(name);

    if (!name.length) {
        return res.status(400).json({error:'Incorrect name'});
    }

    const id = users.reduce((maxId, user) => {
        return user.id > maxId ? user.id : maxId
    },0 ) + 1;

    const newUser = {
        id : id,
        name : name
    };

    users.push(newUser);

    console.log(users);

    return res.status(201).json(newUser);
})

//============================================Done with Testing================================================//

//======== #1. RegisterReport ============//
/* Example
[input]
{
    cut : "shallow",
    color : "D",
    clarity : "VVS1",   // Verify, Verify Slightly Included 1
    carat : "1.0",
    girdleCode : "SAMI161203",
    details : {
        issuer : "0x",  // public key..
        uri : "http://bit.ly/2CYyz3x",
    },
}
*/

app.post('/registerReport', async (req,res) => {
    const cut = req.body.cut;
    const color = req.body.cut;
    const clarity = req.body.clarity;
    const carat = req.body.carat;
    const girdleCode = req.body.girdleCode;
    const issuer = req.body.issuer;

    const leafs = pp.PreciseProofs.createLeafs(req.body);   
    //console.log(leafs); // array of leaf (key/value/salt/hash)

    const merkleTree = pp.PreciseProofs.createMerkleTree(leafs.map((leaf) => leaf.hash))
    console.log(merkleTree);

    // Generate hash of 'Report file'
    const reporthash = await utils.rndHex(32);
    const ppRoot = utils.ensure0x( merkleTree[merkleTree.length -1][0] );
    const schema= leafs.map((leaf) => leaf.key);

    var precise_proof = {};
    precise_proof["ppRoot"] = ppRoot;
    precise_proof["reportHash"] = reporthash;
    precise_proof["schema"] = schema;
    precise_proof["reportUri"] = config.REPORT_URI;
    
    console.log(precise_proof);
    return res.status(201).json(precise_proof);  
})

app.post('/generateMintProof', async (req, res) => {
    const tokenId = req.body.tokenId;
    const salt = req.body.salt;
    const publicKey = req.body.publicKey;

    /* Testing!!
    let _tokenId = await utils.rndHex(32);
    const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
    let _publicKey = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32,'0'));
    let _salt = await utils.rndHex(32);

    mintValue = await nft.generateCmdforMint(_tokenId, _publicKey, _salt);
    */
    const mintValue = await nft.generateCmdforMint(tokenId, publicKey, salt);

    let path = 'mint';
    
    await exec(mintValue.cmd, {cwd:path});  // would be compute-witness
    await exec('zokrates generate-proof', {cwd:path})   // would generate proof.json
    
    console.log(mintValue.cmd)

    let {proof} = jsonfile.readFileSync(`./${path}/proof.json`) // Reference : testZkProof.js
    proof = Object.values(proof);
    proof = utils.flattenDeep(proof);   // would be array of integers.
    proof = proof.map(element => base.hexToDec(element));

    let zkproof = {};
    zkproof.proof = proof;
    zkproof.inputs = mintValue.inputs;
    zkproof.commitment = mintValue.commitment;

    console.log(zkproof);

    return res.status(201).json(zkproof);
})


app.post('/generateTransferProof', async(req, res) => {
    const tokenId = req.body.tokenId;
    //const path = req.body.path;               // fetched in the controller!!
    //const merkleRoot = req.body.merkleRoot;   // fetched in the controller!!
    const commitmentIndexSend = req.body.commitmentIndexSend;
    const publickKeySend = req.body.publicKeySend;
    const saltSend = req.body.saltSend;
    const publicKeyRecv = req.body.publicKeyRecv;
    const saltRecv = req.body.saltRecv;
    const account = req.body.account;

    const nfTokenShield = contract(jsonfile.readFileSync(config.DIASHIELDTOKEN_JSON));
    let web3_connection = Web3.connect();

    nfTokenShield.setProvider(web3_connection);
    const nfTokenShieldInstance = await nfTokenShield.at(config.DIASHIELDTOKEN_ADDRESS);

    const transferValue = await nft.generateCmdforTransfer(
                                        tokenId, publickKeySend, saltSend, commitmentIndexSend,
                                        publicKeyRecv, saltRecv,
                                        nfTokenShieldInstance, account);

    let path = 'transfer';
    
    await exec(transferValue.cmd, {cwd:path});          // run compute-witness
    await exec('zokrates generate-proof', {cwd:path});
    
    console.log(transferValue.cmd);

    let {proof} = jsonfile.readFileSync(`./${path}/proof.json`)
    proof = Object.values(proof)
    proof = utils.flattenDeep(proof)
    proof = proof.map(element => base.hexToDec(element));

    let zkproof = {};
    zkproof.proof = proof;
    zkproof.inputs = transferValue.inputs;
    zkproof.commitment = transferValue.commitment;
    zkproof.root = transferValue.root;
    zkproof.nullifier = transferValue.nullifier;

    console.log(zkproof);
    return res.status(201).json(zkproof);    
    
})





app.listen(3000, () => {
	console.log('Delegate Server listening on port 3000!');
});

/* ===== using http ===== 
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

server.listen(port, hostname, () => {
    console.log(`Server runing at htpp://${hostname}:${port}/`);
})
*/
