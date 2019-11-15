const ReportRegistry = artifacts.require("ReportRegistry")
const Verifier = artifacts.require("Verifier")
const DiaNFT = artifacts.require("DiaNFT")

module.exports = function(deployer) {
    deployer.deploy(ReportRegistry)
    deployer.deploy(Verifier)
    deployer.deploy(DiaNFT)
}