export type Position = {
    'info': {}, // json response returned from the exchange as is
    'id': string, // string, position id to reference the position, similar to an order id
    'symbol': string, // uppercase string literal of a pair of currencies
    'timestamp': number, // integer unix time since 1st Jan 1970 in milliseconds
    'datetime': Date, // ISO8601 representation of the unix time above
    'isolated': Boolean, // boolean, whether or not the position is isolated, as opposed to cross where margin is added automatically
    'hedged': Boolean, // boolean, whether or not the position is hedged, i.e. if trading in the opposite direction will close this position or make a new one
    'side': 'long' | 'short', // string, long or short
    'contracts': number, // float, number of contracts bought, aka the amount or size of the position
    'contractSize': number, // float, the size of one contract in quote units
    'entryPrice': number, // float, the average entry price of the position
    'markPrice': number, // float, a price that is used for funding calculations
    'notional': number, // float, the value of the position in the settlement currency
    'leverage': number, // float, the leverage of the position, related to how many contracts you can buy with a given amount of collateral
    'collateral': number, // float, the maximum amount of collateral that can be lost, affected by pnl
    'initialMargin': number, // float, the amount of collateral that is locked up in this position
    'maintenanceMargin': number, // float, the mininum amount of collateral needed to avoid being liquidated
    'initialMarginPercentage': number, // float, the initialMargin as a percentage of the notional
    'maintenanceMarginPercentage': number, // float, the maintenanceMargin as a percentage of the notional
    'unrealizedPnl': number, // float, the difference between the market price and the entry price times the number of contracts, can be negative
    'liquidationPrice': number, // float, the price at which collateral becomes less than maintenanceMargin
    'marginType': string, // string, can be cross or isolated
    'percentage': number, // float, represents unrealizedPnl / initialMargin * 100
}
