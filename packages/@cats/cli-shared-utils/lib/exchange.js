"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exchange = exports.OrderStatus = exports.OrderText = void 0;
const _config_1 = require("@config");
const ccxt = require('ccxt');
const ExchangeClass = ccxt[_config_1.EXCHANGE_ID];
var OrderText;
(function (OrderText) {
    OrderText["EntryRule"] = "entry-rule";
    OrderText["ExitRule"] = "exit-rule";
    OrderText["StopLoss"] = "stop-loss";
    OrderText["TrailingStopLoss"] = "trailing-stop";
    OrderText["Funding"] = "Funding";
})(OrderText = exports.OrderText || (exports.OrderText = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["New"] = "New";
    OrderStatus["Filled"] = "Filled";
    OrderStatus["PartiallyFilled"] = "PartiallyFilled";
    OrderStatus["Canceled"] = "Canceled";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
exports.exchange = new ExchangeClass({
    apiKey: _config_1.EXCHANGE_API_KEY,
    secret: _config_1.EXCHANGE_SECRET_KEY,
    nonce() { return this.milliseconds(); }
});
