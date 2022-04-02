import { Exchange } from 'ccxt'
import { EXCHANGE_ID, EXCHANGE_API_KEY, EXCHANGE_SECRET_KEY } from '@config'
import { TradeDirection } from '@lib/grademark/strategy'
const ccxt = require('ccxt')
const ExchangeClass = ccxt[EXCHANGE_ID]

export enum OrderText {
    EntryRule = 'entry-rule',
    ExitRule = 'exit-rule',
    StopLoss = 'stop-loss',
    TrailingStopLoss = 'trailing-stop'
}

export enum OrderStatus {
    New ='New',
    Filled = 'Filled',
    PartiallyFilled = 'PartiallyFilled',
    Canceled = 'Canceled'
}

export const exchange: Exchange = new ExchangeClass({
    apiKey: EXCHANGE_API_KEY,
    secret: EXCHANGE_SECRET_KEY,
    nonce () { return this.milliseconds() }
})

// export type Position = {
//     info?: {}, // json response returned from the exchange as is
//     id?: string, // string, position id to reference the position, similar to an order id
//     symbol?: string, // uppercase string literal of a pair of currencies
//     timestamp?: number, // integer unix time since 1st Jan 1970 in milliseconds
//     datetime?: Date, // ISO8601 representation of the unix time above
//     isolated?: Boolean, // boolean, whether or not the position is isolated, as opposed to cross where margin is added automatically
//     hedged?: Boolean, // boolean, whether or not the position is hedged, i.e. if trading in the opposite direction will close this position or make a new one
//     side?: 'long' | 'short', // string, long or short
//     contracts?: number, // float, number of contracts bought, aka the amount or size of the position
//     contractSize?: number, // float, the size of one contract in quote units
//     entryPrice?: number, // float, the average entry price of the position
//     markPrice?: number, // float, a price that is used for funding calculations
//     notional?: number, // float, the value of the position in the settlement currency
//     leverage?: number, // float, the leverage of the position, related to how many contracts you can buy with a given amount of collateral
//     collateral?: number, // float, the maximum amount of collateral that can be lost, affected by pnl
//     initialMargin?: number, // float, the amount of collateral that is locked up in this position
//     maintenanceMargin?: number, // float, the mininum amount of collateral needed to avoid being liquidated
//     initialMarginPercentage?: number, // float, the initialMargin as a percentage of the notional
//     maintenanceMarginPercentage?: number, // float, the maintenanceMargin as a percentage of the notional
//     unrealizedPnl?: number, // float, the difference between the market price and the entry price times the number of contracts, can be negative
//     liquidationPrice?: number, // float, the price at which collateral becomes less than maintenanceMargin
//     marginType?: string, // string, can be cross or isolated
//     percentage?: number, // float, represents unrealizedPnl / initialMargin * 100
// }

// todo unify parsePosition/parsePositions - https://github.com/ccxt/ccxt/blob/master/js/bitmex.js#L1715
export type Position = {
    account?: string
    symbol?: string
    currency?: string
    underlying?: string
    quoteCurrency?: string
    commission?: string
    initMarginReq?: string
    maintMarginReq?: string
    riskLimit?: string
    leverage?: string
    crossMargin?: Boolean,
    deleveragePercentile?: string
    rebalancedPnl?: string
    prevRealisedPnl?: string
    prevUnrealisedPnl?: string
    prevClosePrice?: string
    openingTimestamp?: Date,
    openingQty?: string
    openingCost?: string
    openingComm?: string
    openOrderBuyQty?: string
    openOrderBuyCost?: string
    openOrderBuyPremium?: string
    openOrderSellQty?: string
    openOrderSellCost?: string
    openOrderSellPremium?: string
    execBuyQty?: string
    execBuyCost?: string
    execSellQty?: string
    execSellCost?: string
    execQty?: string
    execCost?: string
    execComm?: string
    currentTimestamp?: Date,
    currentQty: string
    currentCost?: string
    currentComm?: string
    realisedCost?: string
    unrealisedCost?: string
    grossOpenCost?: string
    grossOpenPremium?: string
    grossExecCost?: string
    isOpen: Boolean,
    markPrice?: string
    markValue?: string
    riskValue?: string
    homeNotional?: string
    foreignNotional?: string
    posState?: string
    posCost?: string
    posCost2?: string
    posCross?: string
    posInit?: string
    posComm?: string
    posLoss?: string
    posMargin?: string
    posMaint?: string
    posAllowance?: string
    taxableMargin?: string
    initMargin?: string
    maintMargin?: string
    sessionMargin?: string
    targetExcessMargin?: string
    varMargin?: string
    realisedGrossPnl?: string
    realisedTax?: string
    realisedPnl?: string
    unrealisedGrossPnl?: string
    longBankrupt?: string
    shortBankrupt?: string
    taxBase?: string
    indicativeTaxRate?: string
    indicativeTax?: string
    unrealisedTax?: string
    unrealisedPnl?: string
    unrealisedPnlPcnt?: string
    unrealisedRoePcnt?: string
    simpleQty?: string
    simpleCost?: string
    simpleValue?: string
    simplePnl?: string
    simplePnlPcnt?: string
    avgCostPrice?: string
    avgEntryPrice?: string
    breakEvenPrice?: string
    marginCallPrice?: string
    liquidationPrice?: string
    bankruptPrice?: string
    timestamp?: Date,
    lastPrice?: string
    lastValue?: string
}

export interface ITrade {
    tradingId: string
    symbol: string
    direction: TradeDirection
    entryTime: Date
    entryPrice: number
    exitTime?: Date
    exitPrice?: number
    profit?: number
    profitPct?: number
    exitReason?: string
    qty: number
    holdingPeriod: number
    stopPrice: number
}

export interface IOrder {
    orderId: string
    tradingId?: string
    symbol: string
    time: Date
    lastQty: number
    orderQty: number
    leavesQty: number
    lastPrice: number
    price: number
    avgPrice: number
    stopPrice: number
    side: string
    ordType: string
    ordStatus: OrderStatus
    currency: string
    homeNotional: number
    text: string
}
