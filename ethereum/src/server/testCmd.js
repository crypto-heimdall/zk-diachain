const util = require('util');
const exec = util.promisify(require('child_process').exec);
const zokcmd = require('../zokcmd');
const jsonfile = require('jsonfile');

async function test_zokrates() {   
    
    //
    await exec('zokrates compile -i ../../../../zkp/circuit/mint-zkdia.code >> compile.log', {cwd:'mint-zkdia'})
    await exec('zokrates setup >> setup.log', {cwd:'mint-zkdia'}) 

    await exec('zokrates compute-witness -a 232310020822901034104762510965330293111 290107346578087637545360782727286918188 910473606 239207701314920212136923811659422657801 0 11 210219292964116369102883671286459321076 227322991366389551999749449849806758625 2660197181 16319012648326391858874240100255177854 0 9 42022122505097917127364068979301637648 120910671520054972343429929459551033400 0 2 >> ./compute-witness.log'
                , {cwd:'mint-zkdia'});
    await exec('zokrates generate-proof >> genProof.log', {cwd:'mint-zkdia'})
    const proof = jsonfile.readFileSync('./mint-zkdia/proof.json')
    console.log(proof);
    console.log(proof.proof.b)
    //const { stdout, stderr } = await exec('ls -al');
    //console.log('stdout:', stdout);
    //console.log('stderr:', stderr);
}

function test2()  { //
    const shell = require('shelljs')
 
    shell.cd('~')
    
    if(shell.exec('ls -la').code !== 0) {
    shell.echo('Error: command failed')
    shell.exit(1)
    }
}

test_zokrates();

/*
zokcmd.getTransferZkParams(
    '0x3644B986B3F5Ba3cb8D5627A22465942f8E06d09', // sender
    '0xb',  // value of the secret from the sender
    '0x9e8f633D0C46ED7170EF3B30E291c64a91a49C7E',
    '0x9'
)
*/