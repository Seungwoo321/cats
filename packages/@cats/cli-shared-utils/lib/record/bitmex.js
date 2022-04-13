"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.record = void 0;
const exchange_1 = require("@lib/exchange");
const gql_1 = require("@lib/gql");
const grademark_1 = require("@lib/grademark");
function record(symbol, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const positionStatus = yield gql_1.service.getPositionStatus(symbol);
        if (!positionStatus.tradingId) {
            throw new Error('Expect tradingId must exist');
        }
        const openPosition = yield gql_1.service.getOpenPosition(symbol);
        let holdingPeriod = 0;
        if (openPosition === null || openPosition === void 0 ? void 0 : openPosition.holdingPeriod) {
            holdingPeriod = openPosition === null || openPosition === void 0 ? void 0 : openPosition.holdingPeriod;
        }
        const tradingId = positionStatus.tradingId;
        const currentTrading = yield gql_1.service.completedTrading(tradingId);
        function newTrading(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (data.text === exchange_1.OrderText.EntryRule) {
                    const trade = {
                        tradingId,
                        symbol,
                        orderId: data.orderId,
                        direction: data.side === 'Buy' ? grademark_1.TradeDirection.Long : grademark_1.TradeDirection.Short,
                        entryTime: data.time,
                        entryPrice: data.avgPrice,
                        qty: +data.orderQty - +data.leavesQty,
                        stopPrice: data.stopPrice,
                        holdingPeriod
                    };
                    yield gql_1.service.updateTrading(trade);
                }
                return Promise.resolve();
            });
        }
        function filledTrading(data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (data.text === exchange_1.OrderText.EntryRule) {
                    const trade = {
                        tradingId,
                        symbol,
                        orderId: data.orderId,
                        direction: data.side === 'Buy' ? grademark_1.TradeDirection.Long : grademark_1.TradeDirection.Short,
                        entryTime: currentTrading.entryTime || data.time,
                        entryPrice: data.avgPrice,
                        qty: +data.orderQty - +data.leavesQty,
                        stopPrice: data.stopPrice,
                        holdingPeriod
                    };
                    yield gql_1.service.updateTrading(trade);
                }
                else {
                    if (data.text === exchange_1.OrderText.Funding) {
                        return;
                    }
                    const profit = currentTrading.direction === grademark_1.TradeDirection.Long
                        ? +data.avgPrice - +currentTrading.entryPrice
                        : +currentTrading.entryPrice - +data.avgPrice;
                    const trade = Object.assign(Object.assign({}, currentTrading), { exitTime: data.time, exitPrice: data.avgPrice, profit, profitPct: (profit / +currentTrading.entryPrice) * 100, exitReason: data.text, stopPrice: data.stopPrice, holdingPeriod });
                    yield gql_1.service.updateTrading(trade);
                }
                return Promise.resolve();
            });
        }
        const order = Object.assign(Object.assign({}, data), { tradingId,
            symbol });
        switch (data.ordStatus) {
            case exchange_1.OrderStatus.New:
                yield gql_1.service.updateOrder(order);
                yield newTrading(data);
                break;
            case exchange_1.OrderStatus.Filled:
                yield gql_1.service.updateOrder(order);
                yield filledTrading(data);
                break;
            case exchange_1.OrderStatus.PartiallyFilled:
                yield gql_1.service.updateOrder(order);
                yield filledTrading(data);
                break;
            case exchange_1.OrderStatus.Canceled:
                yield gql_1.service.updateOrder(order);
                if (data.orderId === currentTrading.orderId) {
                    yield gql_1.service.removeTrading(tradingId);
                }
                break;
            default:
                break;
        }
    });
}
exports.record = record;
