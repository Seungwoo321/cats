import { Exchange } from 'ccxt'
import config from '@cats/config'

const { EXCHANGE_ID, EXCHANGE_API_KEY, EXCHANGE_SECRET_KEY } = config

if (EXCHANGE_ID === '' || !EXCHANGE_ID) {
    throw Error('Error: EXCHANGE_ID is not defined in .env')
}

const ccxt = require('ccxt')
const ExchangeClass = ccxt[EXCHANGE_ID]

export const exchange: Exchange = new ExchangeClass({
    apiKey: EXCHANGE_API_KEY,
    secret: EXCHANGE_SECRET_KEY,
    nonce() { return this.milliseconds() }
})