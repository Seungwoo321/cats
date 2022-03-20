require('../src/config')
const { exchange } = require('../src/lib/exchange')

it('BCH/USD:BTC - Calculate available order amount', async () => {
    expect.assertions(2)
    const symbol = 'BCH/USD:BTC'
    const markets = await exchange.loadMarkets()
    const market = markets[symbol]
    const balance = await exchange.fetchBalance()
    const availableMargin = balance.BTC.total * 100000000 * (1 - +market.info.initMargin + +market.info.maintMargin + +market.maker)
    const amount = availableMargin / market.info.multiplier / market.info.prevClosePrice * market.info.lotSize
    const formattedAmount = exchange.amountToPrecision(symbol, amount)
    const formattedPrice = exchange.priceToPrecision(symbol, market.info.prevClosePrice)
    expect(formattedAmount % market.precision.amount).toBe(0)
    expect(formattedPrice * formattedAmount).toBeLessThan(availableMargin)
})

it('BCHUSD - Fetch currentPostion', async () => {
    expect.assertions(1)
    const symbol = 'BCHUSD'
    const currentPosition = await exchange.fetchPositions(null, {
        filter: {
            symbol
        }
    })
    expect(currentPosition.length).toBeLessThan(2)
})
