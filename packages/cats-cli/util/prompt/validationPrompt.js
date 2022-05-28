const {
    EXCHANGE_BITMEX,
    EXCHANGE_UPBIT,
    SUPPORTABLE_EXCHANGES,
    ENABLE_TEST_EXCHANGES
} = require('./consts')

function supportableExchange (exchangeId) {
    return SUPPORTABLE_EXCHANGES.includes(exchangeId)
}

function enableTestExchange (exchangeId) {
    return ENABLE_TEST_EXCHANGES.includes(exchangeId)
}

function isExchangeBitmex (exchangeId) {
    return exchangeId === EXCHANGE_BITMEX
}

function isExchangeUpbit (exchangeId) {
    return exchangeId === EXCHANGE_UPBIT
}

module.exports = {
    supportableExchange,
    enableTestExchange,
    isExchangeBitmex,
    isExchangeUpbit
}