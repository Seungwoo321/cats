import { Exchange } from 'ccxt'

const ccxt = require('ccxt')
const EXCHANGE_ID = process.env.EXCHANGE_ID || 'bitmex'
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY
const EXCHANGE_SECRET_KEY = process.env.EXCHANGE_SECRET_KEY
const ExchangeClass = ccxt[EXCHANGE_ID]

export const exchange: Exchange = new ExchangeClass({
    apiKey: EXCHANGE_API_KEY,
    secret: EXCHANGE_SECRET_KEY,
    nonce () { return this.milliseconds() }
})
