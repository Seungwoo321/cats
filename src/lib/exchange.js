"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchange = void 0;
const config_1 = require("../config");
const ccxt = require('ccxt');
const ExchangeClass = ccxt[config_1.EXCHANGE_ID];
exports.exchange = new ExchangeClass({
    apiKey: config_1.EXCHANGE_API_KEY,
    secret: config_1.EXCHANGE_SECRET_KEY,
    nonce() { return this.milliseconds(); }
});
