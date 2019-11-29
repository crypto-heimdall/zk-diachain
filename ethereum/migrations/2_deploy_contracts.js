//const ReportRegistry = artifacts.require("ReportRegistry")
//const Verifier = artifacts.require("Verifier")
/*
const DiaNFT_Merkle = artifacts.require("DiaNFT_Merkle");
const Market = artifacts.require("Market");
const MockFundPool = artifacts.require("MockFundPool");
const PlayerRole = artifacts.require("PlayerRole");
*/
const DiaStableCoin = artifacts.require("DiaStableCoin");
const Pool = artifacts.require("Pool");
const ReportRegistry = artifacts.require("ReportRegistry_pp");

module.exports = function(deployer) {
//    deployer.deploy(ReportRegistry)
//    deployer.deploy(Verifier)

    deployer.deploy(DiaStableCoin).then( function() {
        return deployer.deploy(Pool, DiaStableCoin.address);
    })

    deployer.deploy(ReportRegistry)

/*
    deployer.deploy(PlayerRole)
    deployer.deploy(DiaNFT_Merkle)

    // link Market with MockFundPool 
    deployer.deploy(MockFundPool).then( function() {
        return deployer.deploy(Market, MockFundPool.address);
    })
    //deployer.deploy(Market)
*/

}