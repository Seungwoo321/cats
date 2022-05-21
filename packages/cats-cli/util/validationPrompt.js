
function isSupportableExchange(exchangeId) {
    const supportExchanges = ['bitmex']
    return supportExchanges.includes(exchangeId)
}

function isEnableTestExchange(exchangeId) {
    const testExchanges = ['bitmex']
    return testExchanges.includes(exchangeId)
}

module.exports = {
    isSupportableExchange,
    isEnableTestExchange
}