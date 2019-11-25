//const ReportRegistry = artifacts.require("ReportRegistry")
//const Verifier = artifacts.require("Verifier")
const DiaNFT_Merkle = artifacts.require("DiaNFT_Merkle");
const Market = artifacts.require("Market");
const MockFundPool = artifacts.require("MockFundPool");

module.exports = function(deployer) {
//    deployer.deploy(ReportRegistry)
//    deployer.deploy(Verifier)
    deployer.deploy(DiaNFT_Merkle)

    // link Market with MockFundPool 
    deployer.deploy(MockFundPool).then( function() {
        return deployer.deploy(Market, MockFundPool.address);
    })
    //deployer.deploy(Market)

}