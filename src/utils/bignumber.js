import BigNumber from "bignumber.js"

// BigNumber.set({ EXPONENTIAL_AT: [-7, 50] })
BigNumber.config({
    EXPONENTIAL_AT: [-7, 50],
    FORMAT: {
        // string to prepend
        prefix: '',
        // decimal separator
        decimalSeparator: '.',
        // grouping separator of the integer part
        groupSeparator: ',',
        // primary grouping size of the integer part
        groupSize: 3,
        // secondary grouping size of the integer part
        secondaryGroupSize: 0,
        // grouping separator of the fraction part
        fractionGroupSeparator: ' ',
        // grouping size of the fraction part
        fractionGroupSize: 0,
        // string to append
        suffix: ''
    }
})
export default BigNumber
