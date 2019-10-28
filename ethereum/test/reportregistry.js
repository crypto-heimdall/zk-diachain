const ReportRegistry = artifacts.require("ReportRegistry")
const assert = require('assert')

contract('ReportRegistry', (accounts) => {
    it('register Report', async function() {
        let instance = await ReportRegistry.deployed()
        const tx = await instance.register('1','2','3','4','5','6', web3.utils.fromUtf8('7'), web3.utils.fromUtf8('8'))

        const len = await instance.getNumofReports.call();
        console.log('the number of reports', len)

        assert.equal(len,1, 'The number of reports registered should be 1')
    })

    it('get report metadata by GirdleCode', async () => {
        let instance = await ReportRegistry.deployed();

        metadata = await instance.getReportbyCode.call('1');
        console.log(metadata)
    })
})

