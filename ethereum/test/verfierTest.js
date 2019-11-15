const verifier = artifacts.require('Verifier');
const fs = require('fs');

contract('verifier', function (accounts) {
    it('verifyTx', async function() {
        let proofJson = fs.readFileSync('../zkp/circuit/proof.json', 'utf8');   // 상대경로는 해당 test 를 실행하는 Pwd!!
        console.log(proofJson)
        /* matching below returns 'null'
        var rx2 = /([0-9]+)[,]/gm
        proofJson.match(rx2).forEach(p => {
            proofJson = proofJson.replace(p, `${p.slice(0, p.length-1)}",`)
        })
        */
        proofJson = JSON.parse(proofJson)
        //console.log(proofJson)

       const proof = proofJson.proof;
       const input = proofJson.inputs;

       //console.log('proof', proof)
       //console.log('input', input)

       /* input in proofJson already in type 'hex'
       input.forEach((i,key) =>{
           if (typeof i == 'number') i = i.toString();
           input[key] = '0x' + new  BN(i,10).toString('hex')
       })
       */

      const _proof = [];
      Object.keys(proof).forEach(key => _proof.push(proof[key]));
      _proof.push(input)

      //console.log('_proof', _proof)


      let instance = await verifier.deployed();
      //console.log('calling verifyTx with proof', _proof);
      const success = await instance.verifyTx.call(..._proof);
      assert(success);
    })
})