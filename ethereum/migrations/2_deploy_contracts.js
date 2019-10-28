const ReportRegistry = artifacts.require("ReportRegistry")

module.exports = function(deployer) {
    deployer.deploy(ReportRegistry)
}