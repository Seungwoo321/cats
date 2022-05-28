import { Exchange } from 'ccxt'
import config from '@cats/config'

const { EXCHANGE_ID, EXCHANGE_API_KEY, EXCHANGE_SECRET_KEY, EXCHANGE_MODE } = config()

if (EXCHANGE_ID === '' || !EXCHANGE_ID) {
    throw Error('Error: EXCHANGE_ID is not defined in .env')
}
const debug = require('debug')
const ccxt = require('ccxt')
const ExchangeClass = ccxt[EXCHANGE_ID]
const exchange: Exchange = new ExchangeClass({
    apiKey: EXCHANGE_API_KEY,
    secret: EXCHANGE_SECRET_KEY,
    nonce() { return this.milliseconds() }
})

if (EXCHANGE_MODE === 'test') {
    const logger = debug('@cats/helper-exchange')
    logger(`EXCHANGE_MODE: ${EXCHANGE_MODE}`)
    exchange.setSandboxMode(true)
}

export default exchange

export {
    exchange
}