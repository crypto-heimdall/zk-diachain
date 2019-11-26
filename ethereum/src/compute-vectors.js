const utils = require('./zkpUtils');
const base = require('./baseUtils');
const config = require('./config.js')

async function computePath(account, shieldContract, _commitment, commitmentIndex) {
    const commitment = utils.strip0x(_commitment);  // [check] if commitment is 32bytes .. (hex 타입의 string이므로 길이는 *2 @.@)
    if (commitment.length !== config.INPUT_HASHLENGTH * 2) {
        throw new Error(`token commitment has incorrect length : ${commitment}`);
    }
    const commitMerkle = commitment.slice( -config.MERKLE_HASHLENGTH * 2);
    console.log('commitment : ', commitment);
    console.log('commitment in Merkle : ' , commitMerkle);

    const leafIndex = utils.getLeafIndexFromZCount(commitmentIndex);

    // get the relevant token data from the contract..
        // Contract(DiaNFT_Merkle).merkleTree.call(index,{from:account});
    let leaf = await shieldContract.merkleTree.call(leafIndex, {from: account});
    console.log(`leafIndex : ${leafIndex} from commitmentIndex ${commitmentIndex} , leaf : ${leaf}`);

    if (commitMerkle === utils.strip0x(leaf)) {
        console.log('Found the matched one...');
    } else {
        throw new Error('Failed to match a leaf with commitment..');
    }

    let p0 = leafIndex;
    let nodeHash;
    let s = [];
    let s0 = 0;
    let t0 = 0;
    let sisterSide = '';


    for (let index = 0; index < 31; index++) {
        nodeHash = await shieldContract.merkleTree.call(index, {from:account});
        console.log('Index : ', index, ' , Nodehash : ', nodeHash);
    }

    for ( let r = config.MERKLE_DEPTH - 1 ; r > 0 ; r -= 1) { // bottom-top 
        console.log(r, s0, p0, t0);
        if (p0 % 2 === 0) { // p even
            s0 = p0 - 1;
            t0 = Math.floor((p0-1)/2);
            sisterSide = '0';   // if p is even then the sister will be on the left. Encode this as 0
        } else {            // p odd
            s0 = p0 + 1;
            t0 = Math.floor(p0/2);
            sisterSide = '1';   // the sister will be on the right..
        }
        // Temp .. nodeHash is fetched from the contract with index s0
        //nodeHash = '0x1234';
        nodeHash = await shieldContract.merkleTree.call(s0, {from:account});
        console.log('s0 : ', s0, ' , Nodehash : ', nodeHash);
        s[r] = {
            merkleIndex : s0,
            nodeHashOld : nodeHash,
            sisterSide,
        };
        p0 = t0;
    }

    // Temp - this nodeHash will be from 'getLatestRoot' from the contract
    // nodeHash = '0x5678';
    nodeHash = await shieldContract.latestRoot();
    s[0] = {
        merkleIndex : 0,
        nodeHashOld : nodeHash,
    };

    // [왜 이렇게 async로 하는지는 잘... map이라서 그런가?!?!]
    s = s.map(async el => {
        return {
            merkleIndex : el.merkleIndex,
            sisterSide : el.sisterSide,
            nodeHashOld : utils.strip0x(el.nodeHashOld),
        };
    });

    console.log(s);

    s = await Promise.all(s);

    console.log('here...');

    // Check the lengths of the hashes of the path and the sister-path..
    // Merkle Hash length : 27 .. Hash length : 32
    if (s[0].nodeHashOld.length !== config.INPUT_HASHLENGTH * 2) {
        console.log('..Oops..1..');
        throw new Error (`path nodeHash has incorrect length : ${s[0].nodeHashOld}`);
    }
    // the rest of the nodes..
    for (let i = 1; i < s.length; i += 1) {
        if (s[i].nodeHashOld.length != config.MERKLE_HASHLENGTH *2) {
            console.log('..Oops..2');
            throw new Error (`sister path nodeHash has incorrect length : ${s[i].nodeHashOld}`);
        }
    }
  // next work out the path from our token or coin to the root
  /*
  E.g.
                 ABCDEFG
        ABCD                EFGH
    AB        CD        EF        GH
  A    B    C    D    E    F    G    H

  If C were the token, then the X's mark the 'path' (the path is essentially a path of 'siblings'):

                 root
        ABCD                 X
     X        CD        EF        GH
  A    B    C    X    E    F    G    H
  */
    let sisterPositions = s.map(pos => pos.sisterSide)
        .join('').padEnd(config.ZOKRATES_PACKING_SIZE, '0');
    console.log('sisterPositions binary encoding : ', sisterPositions);

    sisterPositions = base.binToHex(sisterPositions);
    console.log ('systerPositions hex encoding :', sisterPositions);
    const sisterPath = s.map(pos => utils.ensure0x(pos.nodeHashOld));

    return {path: sisterPath, positions: sisterPositions};
}

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
    computePath,
};