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
exports.trading = void 0;
const grademark_1 = require("@lib/grademark");
const exchange_1 = require("@lib/exchange");
const gql_1 = require("@lib/gql");
const chai_1 = require("chai");
const uuid_1 = require("uuid");
/**
 * Update an open position for a new bar.
 *
 * @param position The position to update.
 * @param bar The current bar.
 * @returns
 */
function updatePosition(position, bar, amount, flagNewTrailingStop) {
    return __awaiter(this, void 0, void 0, function* () {
        position.profit = bar.close - position.entryPrice;
        position.profitPct = (position.profit / position.entryPrice) * 100;
        position.growth = position.direction === grademark_1.TradeDirection.Long
            ? bar.close / position.entryPrice
            : position.entryPrice / bar.close;
        position.holdingPeriod += 1;
        if (flagNewTrailingStop && typeof position.curStopPrice === 'number') {
            const symbol = position.symbol;
            yield exchange_1.exchange.createOrder(symbol, 'stopLimit', position.direction === grademark_1.TradeDirection.Long ? 'sell' : 'buy', amount, position.curStopPrice, {
                stopPrice: position.curStopPrice,
                text: 'trailing-stop',
                execInst: 'LastPrice,Close'
            });
        }
        return yield gql_1.service.updatePosition(position);
    });
}
/**
 *
 * @param symbol
 * @param bar
 */
function trading(symbol, strategy, inputSeries) {
    return __awaiter(this, void 0, void 0, function* () {
        if (inputSeries.none()) {
            throw new Error('Expect input data series to contain at last 1 bar.');
        }
        const lookbackPeriod = strategy.lookbackPeriod || 1;
        if (inputSeries.count() < lookbackPeriod) {
            throw new Error('You have less input data than your lookback period, the size of your input data should be some multiple of your lookback period.');
        }
        const markets = yield exchange_1.exchange.loadMarkets();
        const strategyParameters = strategy.parameters || {};
        let openPosition = yield gql_1.service.getOpenPosition(symbol);
        let newTrailingStopOrder = false;
        // const indicatorsSeries = inputSeries as IDataFrame<IndexT, IndicatorBarT>
        let indicatorsSeries;
        //
        // Prepare indicators.
        //
        if (strategy.prepIndicators) {
            indicatorsSeries = strategy.prepIndicators({
                parameters: strategyParameters,
                inputSeries: inputSeries
            });
        }
        else {
            indicatorsSeries = inputSeries;
        }
        const bar = indicatorsSeries.last();
        console.table([bar]);
        const positionStatus = yield gql_1.service.getPositionStatus(symbol);
        const entryPrice = bar.close;
        const positionDirection = positionStatus.direction;
        const positions = yield exchange_1.exchange.fetchPositions();
        const currentPosition = positions.find(position => position.symbol === symbol.split(':')[0].replace('/', '')) || {
            isOpen: false,
            currentQty: '0'
        };
        /**
         *
         * @param openPosition
         * @param symbol
         */
        function createPosition(openPosition, symbol) {
            return __awaiter(this, void 0, void 0, function* () {
                const market = markets[symbol];
                const balance = yield exchange_1.exchange.fetchBalance();
                let availableMargin = balance.BTC.total * 100000000 * (1 - +market.info.initMargin - +market.info.maintMargin);
                if (market.maker) {
                    availableMargin += market === null || market === void 0 ? void 0 : market.maker;
                }
                const amount = availableMargin / market.info.multiplier / openPosition.entryPrice * market.info.lotSize;
                const formattedAmount = parseFloat(exchange_1.exchange.amountToPrecision(symbol, amount));
                openPosition.amount = formattedAmount;
                const formattedPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.entryPrice));
                // cancle all orders
                yield exchange_1.exchange.cancelAllOrders();
                // create new order
                yield exchange_1.exchange.createOrder(symbol, 'limit', openPosition.direction === grademark_1.TradeDirection.Long ? 'buy' : 'sell', formattedAmount, formattedPrice, {
                    displayQty: 0,
                    text: 'entry-rule'
                });
                // if initial stop price then add stop order
                if (openPosition.initialStopPrice) {
                    yield exchange_1.exchange.createOrder(symbol, 'stop', openPosition.direction === grademark_1.TradeDirection.Long ? 'sell' : 'buy', formattedAmount, openPosition.initialStopPrice, {
                        stopPx: openPosition.initialStopPrice,
                        text: 'stop-loss',
                        execInst: 'LastPrice,Close'
                    });
                }
                // if trailing stop loss then add trailing stop order
                if (strategy.trailingStopLoss && openPosition.curStopPrice !== undefined && openPosition.initialStopPrice !== openPosition.curStopPrice) {
                    yield exchange_1.exchange.createOrder(symbol, 'stopLimit', openPosition.direction === grademark_1.TradeDirection.Long ? 'sell' : 'buy', formattedAmount, openPosition.curStopPrice, {
                        ordType: 'stopLimit',
                        stopPx: openPosition.curStopPrice,
                        text: 'trailing-stop',
                        execInst: 'LastPrice,Close'
                    });
                }
                yield gql_1.service.createPosition(symbol, openPosition);
            });
        }
        /**
         *
         * @param direction
         * @param symbol
         * @param amount
         * @param exitPrice
         * @param exitReason
         * @returns
         */
        function closePosition(direction, symbol, amount, exitPrice, exitReason) {
            return __awaiter(this, void 0, void 0, function* () {
                yield exchange_1.exchange.createOrder(symbol, 'limit', direction === grademark_1.TradeDirection.Long ? 'sell' : 'buy', amount, exitPrice, {
                    displayQty: 0,
                    text: exitReason,
                    execInst: 'ReduceOnly'
                });
                return yield gql_1.service.closePosition(symbol);
            });
        }
        /**
         *
         * @param options
         */
        function enterPosition(options) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, chai_1.assert)(positionStatus.value === grademark_1.PositionStatus.None, 'Can only enter a position when not already in one.');
                if ((options === null || options === void 0 ? void 0 : options.symbol) && (options === null || options === void 0 ? void 0 : options.direction) && (options === null || options === void 0 ? void 0 : options.entryPrice)) {
                    yield gql_1.service.enterPosition(symbol, options.direction, options.entryPrice, (0, uuid_1.v4)());
                }
            });
        }
        /**
         *
         * @param symbol
         * @returns
         */
        function exitPosition(symbol) {
            return __awaiter(this, void 0, void 0, function* () {
                (0, chai_1.assert)(positionStatus.value === grademark_1.PositionStatus.Position, 'Can only exit a position when we are in a position.');
                return yield gql_1.service.exitPosition(symbol);
            });
        }
        /**
         *
         * @param openPosition
         * @param exitTime
         * @param exitPrice
         * @param exitReason
         * @returns
         */
        switch (positionStatus.value) {
            case grademark_1.PositionStatus.None:
                if (currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.isOpen) {
                    const direction = +(currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.currentQty) > 0
                        ? grademark_1.TradeDirection.Long
                        : grademark_1.TradeDirection.Short;
                    yield closePosition(direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'none position');
                }
                yield strategy.entryRule(enterPosition, {
                    bar,
                    parameters: Object.assign(Object.assign({}, strategyParameters), { symbol,
                        entryPrice })
                });
                break;
            case grademark_1.PositionStatus.Enter:
                (0, chai_1.assert)(openPosition === null, 'Expected there to be no open position initialised yet!');
                if (positionStatus.conditionalEntryPrice !== undefined) {
                    if (positionStatus.direction === grademark_1.TradeDirection.Long) {
                        if (bar.high < positionStatus.conditionalEntryPrice) {
                            break;
                        }
                    }
                    else {
                        if (bar.low > positionStatus.conditionalEntryPrice) {
                            break;
                        }
                    }
                }
                openPosition = {
                    symbol,
                    direction: positionDirection,
                    entryTime: new Date(bar.time),
                    entryPrice,
                    growth: 1,
                    profit: 0,
                    profitPct: 0,
                    holdingPeriod: 0,
                    amount: Number(currentPosition.currentQty)
                };
                if (strategy.stopLoss) {
                    const initialStopDistance = strategy.stopLoss({
                        entryPrice,
                        position: openPosition,
                        bar,
                        parameters: strategyParameters
                    });
                    openPosition.initialStopPrice = openPosition.direction === grademark_1.TradeDirection.Long
                        ? entryPrice - initialStopDistance
                        : entryPrice + initialStopDistance;
                    openPosition.curStopPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.initialStopPrice));
                    openPosition.initialStopPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.initialStopPrice));
                }
                if (strategy.trailingStopLoss) {
                    const trailingStopDistance = strategy.trailingStopLoss({
                        entryPrice,
                        position: openPosition,
                        bar,
                        parameters: strategyParameters
                    });
                    const trailingStopPrice = openPosition.direction === grademark_1.TradeDirection.Long
                        ? entryPrice - trailingStopDistance
                        : entryPrice + trailingStopDistance;
                    if (openPosition.initialStopPrice === undefined) {
                        openPosition.initialStopPrice = trailingStopPrice;
                    }
                    else {
                        openPosition.initialStopPrice = openPosition.direction === grademark_1.TradeDirection.Long
                            ? Math.max(openPosition.initialStopPrice, trailingStopPrice)
                            : Math.min(openPosition.initialStopPrice, trailingStopPrice);
                    }
                    openPosition.curStopPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.initialStopPrice));
                    openPosition.initialStopPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.initialStopPrice));
                }
                if (strategy.profitTarget) {
                    const profitDistance = strategy.profitTarget({
                        entryPrice,
                        position: openPosition,
                        bar,
                        parameters: strategyParameters
                    });
                    openPosition.profitTarget = openPosition.direction === grademark_1.TradeDirection.Long
                        ? entryPrice + profitDistance
                        : entryPrice - profitDistance;
                    openPosition.profitTarget = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.profitTarget));
                }
                if (currentPosition.isOpen) {
                    yield gql_1.service.createPosition(symbol, openPosition);
                    break;
                }
                yield createPosition(openPosition, symbol);
                break;
            case grademark_1.PositionStatus.Position:
                (0, chai_1.assert)(openPosition !== null, 'Expected open position to already be initialised!');
                if (!currentPosition.isOpen) {
                    yield exchange_1.exchange.cancelAllOrders();
                    yield gql_1.service.closePosition(symbol);
                    break;
                }
                if (+currentPosition.currentQty !== 0 && (openPosition === null || openPosition === void 0 ? void 0 : openPosition.curStopPrice)) {
                    if (openPosition.direction === grademark_1.TradeDirection.Long) {
                        if (bar.close <= openPosition.curStopPrice) {
                            yield closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'stop-loss');
                            break;
                        }
                    }
                    else if (openPosition.direction === grademark_1.TradeDirection.Short) {
                        if (bar.close >= openPosition.curStopPrice) {
                            yield closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'stop-loss');
                        }
                    }
                }
                if (+currentPosition.currentQty !== 0 && (openPosition === null || openPosition === void 0 ? void 0 : openPosition.profitTarget)) {
                    if (openPosition.direction === grademark_1.TradeDirection.Long) {
                        if (bar.high >= openPosition.profitTarget) {
                            yield closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), openPosition.profitTarget, 'profit-target');
                            break;
                        }
                    }
                    else {
                        if (bar.low <= openPosition.profitTarget) {
                            yield closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), openPosition.profitTarget, 'profit-target');
                            break;
                        }
                    }
                }
                if (strategy.trailingStopLoss) {
                    const trailingStopDistance = strategy.trailingStopLoss({
                        entryPrice: openPosition.entryPrice,
                        position: openPosition,
                        bar,
                        parameters: strategyParameters
                    });
                    if (openPosition.direction === grademark_1.TradeDirection.Long) {
                        const newTrailingStopPrice = bar.close - trailingStopDistance;
                        if (newTrailingStopPrice > openPosition.curStopPrice) {
                            openPosition.curStopPrice = newTrailingStopPrice;
                            newTrailingStopOrder = true;
                        }
                    }
                    else {
                        const newTrailingStopPrice = bar.close + trailingStopDistance;
                        if (newTrailingStopPrice < openPosition.curStopPrice) {
                            openPosition.curStopPrice = newTrailingStopPrice;
                            newTrailingStopOrder = true;
                        }
                    }
                    openPosition.curStopPrice = parseFloat(exchange_1.exchange.priceToPrecision(symbol, openPosition.curStopPrice));
                }
                if (+currentPosition.currentQty !== 0) {
                    yield updatePosition(openPosition, bar, Math.abs(+currentPosition.currentQty), newTrailingStopOrder);
                }
                if (strategy.exitRule) {
                    yield strategy.exitRule(exitPosition, {
                        entryPrice: openPosition.entryPrice,
                        position: openPosition,
                        bar: bar,
                        parameters: Object.assign(Object.assign({}, strategyParameters), { symbol, entryPrice: openPosition.entryPrice })
                    });
                }
                break;
            case grademark_1.PositionStatus.Exit:
                (0, chai_1.assert)(openPosition !== null, 'Expected open position to already be initialised!');
                if (+currentPosition.currentQty !== 0) {
                    yield closePosition(openPosition.direction, symbol, Math.abs(+currentPosition.currentQty), bar.close, 'exit-rule');
                }
                else {
                    yield gql_1.service.closePosition(symbol);
                }
                break;
            default:
                throw new Error('Unexpected state!');
        }
    });
}
exports.trading = trading;
