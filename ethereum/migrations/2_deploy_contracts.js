//const ReportRegistry = artifacts.require("ReportRegistry")
//const Verifier = artifacts.require("Verifier")
const DiaNFT_Merkle = artifacts.require("DiaNFT_Merkle")
const Market = artifacts.require("Market");

module.exports = function(deployer) {
//    deployer.deploy(ReportRegistry)
//    deployer.deploy(Verifier)
    deployer.deploy(DiaNFT_Merkle)
    deployer.deploy(Market)

}