//const ReportRegistry = artifacts.require("ReportRegistry")
//const Verifier = artifacts.require("Verifier")
const DiaNFT_Merkle = artifacts.require("DiaNFT_Merkle")

module.exports = function(deployer) {
//    deployer.deploy(ReportRegistry)
//    deployer.deploy(Verifier)
    deployer.deploy(DiaNFT_Merkle)
}