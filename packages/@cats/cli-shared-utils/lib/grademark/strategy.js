"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeDirection = void 0;
/**
 * Specifies which direction we are trading.
 *
 * Long:    We'll make a profit if the price of the instrument rises.
 * Short:   We'll make a profit if the price of the instrument falls.
 */
var TradeDirection;
(function (TradeDirection) {
    TradeDirection["Long"] = "long";
    TradeDirection["Short"] = "short";
})(TradeDirection = exports.TradeDirection || (exports.TradeDirection = {}));
