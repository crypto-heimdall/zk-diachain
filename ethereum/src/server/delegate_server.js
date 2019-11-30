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
const redis = require('redis');

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
//==========================//

const client = redis.createClient(6379, '127.0.0.1');
app.use(function(req,res,next){
    req.cache = client;
    next();
})

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
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');

    const cut = req.body.cut;
    const color = req.body.color;
    const clarity = req.body.clarity;
    const carat = req.body.carat;
    let girdleCode = req.body.girdleCode;
    const issuer = req.body.issuer;
    const address = req.body.wholeSaler.toLowerCase();

    const leafs = pp.PreciseProofs.createLeafs(req.body);   
    //console.log(leafs); // array of leaf (key/value/salt/hash)

    console.log(cut);

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
    //const bytes32 = name => 

    console.log(girdleCode);
    precise_proof["girdleCode"] = base.utf8StringToHex(girdleCode, 32);
    
    console.log(precise_proof);

//==== redis 
    var info_json = {}
    info_json.reportRoot = ppRoot;
    info_json.cut = cut;
    info_json.color = color;
    info_json.clarity = clarity;
    info_json.carat = carat;
    info_json.girdleCode = girdleCode;

    req.cache.get(address,function(err,data){
        if(err){
            console.log(err);
            res.send("error "+err);
            return;
        }
        var values = JSON.parse(data);
        console.log(values);
        var exists = false;
        if (values != null) {
            values.forEach(function(value) {
                if (value.reportRoot === ppRoot) {
                    exists = true;
                }
            })
        } else {
            values =[];
        }

        if (exists == false) {
            values.push(info_json);

            req.cache.set (address, JSON.stringify(values), function(err, data) {
                if (err) {
                console.log(err);
                res.send("error: " + err);
                return res.status(404);
                }
                return res.status(201).json(precise_proof); 
            })
        } else {
            return res.status(201).json(precise_proof); 
        }
    })



    //return res.status(201).json(precise_proof);  
})

app.post('/generateMintProof', async (req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');

    const girdleCode = req.body.girdleCode;
    //const tokenId = base.utf8StringToHex(girdleCode, 32);
    const _tokenId = await utils.rndHex(32);
    //const salt = req.body.salt;
    const _salt = await utils.rndHex(32);
    const _publicKey = req.body.address;

    /* Testing!!
    let _tokenId = await utils.rndHex(32);
    const skA = '0x0000000000111111111111111111111111111111111111111111111111111111';
    let _publicKey = utils.ensure0x(utils.strip0x(utils.hash(skA)).padStart(32,'0'));
    let _salt = await utils.rndHex(32);
*/
    const mintValue = await nft.generateCmdforMint(_tokenId, _publicKey, _salt);

    console.log('tokenId : ' , _tokenId);
    console.log('salt : ', _salt);
    console.log('publicKey : ', _publicKey);

    let path = 'mint';

    await exec(mintValue.cmd, {cwd:path});  // would be compute-witness
    await exec('zokrates generate-proof >> proof.log', {cwd:path})   // would generate proof.json
    
/*
   let path = 'mint-zkdia';

    await exec('zokrates compute-witness -a 232310020822901034104762510965330293111 290107346578087637545360782727286918188 910473606 239207701314920212136923811659422657801 0 11 210219292964116369102883671286459321076 227322991366389551999749449849806758625 2660197181 16319012648326391858874240100255177854 0 9 42022122505097917127364068979301637648 120910671520054972343429929459551033400 0 2 >> ./compute-witness.log'
                , {cwd:'mint-zkdia'});
    
    await exec('zokrates generate-proof >> genProof.log', {cwd:'mint-zkdia'})
*/
    console.log(mintValue.cmd)

    let {proof} = jsonfile.readFileSync(`./${path}/proof.json`) // Reference : testZkProof.js
    proof = Object.values(proof);
    proof = utils.flattenDeep(proof);   // would be array of integers.
    proof = proof.map(element => base.hexToDec(element));

    let zkproof = {};
    zkproof.proof = proof;
    zkproof.inputs = mintValue.inputs;
    zkproof.commitment = mintValue.commitment;
    zkproof.salt = _salt;
    zkproof.tokenId = _tokenId;

    console.log(zkproof);

    return res.status(201).json(zkproof);
})

app.post('/generateTransferProof', async(req, res) => {

   
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');

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



app.post('/getInfos/:address', function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');


    var key = req.params.address;

    req.cache.get(key,function(err,data){
        if(err){
              console.log(err);
              res.send("error "+err);
              return;
        }
        var value = JSON.parse(data);
        return res.status(201).json(value);
   });
})

app.post('/getInfos/:address/:girdlecode', function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');


    var key = req.params.address;
    var code = req.params.girdlecode;

    console.log (key, code);

    req.cache.get(key,function(err,data){
        if(err){
              console.log(err);
              res.send("error "+err);
              return;
        }
        var values = JSON.parse(data);
        if (values != null) {
            values.forEach(function(value) {
                if (value.girdleCode === code) {
                    var info_json = {};
                    info_json.reportRoot = value.reportRoot;
                    info_json.cut = value.cut;
                    info_json.color = value.color;
                    info_json.clarity = value.clarity;
                    info_json.carat = value.carat;
                    info_json.girdleCode = value.girdleCode;

                    info_json.tokenId = value.tokenId;

                    return res.status(201).json(info_json);
                }
            })
        } else {
            return res.status(404);
        }
   });
})

app.post('/storeReport', async(req, res) => {


    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');

    const address = req.body.address;
    const cut = req.body.cut;
    const color = req.body.cut;
    const clarity = req.body.clarity;
    const carat = req.body.carat;
    const girdleCode = req.body.girdleCode;
    const reportRoot = req.body.reportRoot;

    var info_json = {}
    info_json.reportRoot = reportRoot;
    info_json.cut = cut;
    info_json.color = color;
    info_json.clarity = clarity;
    info_json.carat = carat;
    info_json.girdleCode = girdleCode;

    req.cache.get(address,function(err,data){
        if(err){
              console.log(err);
              res.send("error "+err);
              return;
        }
        var values = JSON.parse(data);
        console.log(values);
        var exists = false;
        values.forEach(function(value) {
            if (value.reportRoot === reportRoot) {
                exists = true;
            }
        })

        if (exists == false) {
            values.push(info_json);

            req.cache.set (address, JSON.stringify(values), function(err, data) {
                if (err) {
                console.log(err);
                res.send("error: " + err);
                return res.status(404);
                }
                return res.status(201).json(info_json); 
            })
        } else {
            return res.status(201).json(info_json); 
        }
    })

})

app.post('/storeNFT', async(req, res) => {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');

    const address = req.body.address;
    const reportRoot = req.body.reportRoot;
    const tokenId = req.body.tokenId;
    const commitment = req.body.commitment;
    const commitmentIndex = req.body.commitmentIndex;

    console.log('address : ', address);
    console.log('reportRoot : ', reportRoot);

    // Report_Root, Token_Id, Commitment, Commitment Index
    req.cache.get(address,function(err,data){
        if(err){
              console.log(err);
              res.send("error "+err);
              return;
        }
        var values = JSON.parse(data);
        console.log ('values : ', values);

        var newValues = []
        var retValue = {};
        if (values != null) {
            values.forEach(function(value){
                console.log (value)
                if (value.reportRoot === reportRoot ) {
                    value.tokenId = tokenId;
                    value.commitment = commitment;
                    value.commitmentIndex = commitmentIndex;
                    newValues.push(value);

                    retValue = value;
                } else {
                    newValues.push(value);
                }
            })
        }

        console.log('newValues : ', newValues);
        req.cache.set (address, JSON.stringify(newValues), function(err, data) {
            if (err) {
                console.log(err);
                res.send("error: " + err);
                return res.status(404);
            }
            return res.status(201).json(retValue); 
        })
   });    


})
app.all('/*', function(req, res, next) {
    console.log('ac');

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers',
    'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.listen(3333, () => {
	console.log('Delegate Server listening on port 3333!');
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
