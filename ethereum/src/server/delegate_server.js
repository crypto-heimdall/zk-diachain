const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

// precise-proof
const pp = require('../precise-proof');
const utils = require('../zkpUtils');


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

const report_uri = 'http://';
app.post('/registerreport', async (req,res) => {
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
    precise_proof["reportUri"] = report_uri;
    
    console.log(precise_proof);
    return res.status(201).json(precise_proof);  
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
