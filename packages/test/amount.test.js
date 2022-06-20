
process.env.EXCHANGE_ID = 'bitmex'

const { exchange } = require('@cats/helper-exchange')
const { service: gqlService  } = require('@cats/helper-gql')

it('get amount', async () => {
    // expect.assertions(2)
    
    const markets = await exchange.loadMarkets()

    const getMinimumCapital = (markets, symbol, target) => {
        const market = markets[symbol]
        const entryPrice = market.info.prevClosePrice
        let availableMargin = (1 - +market.info.initMargin - +market.info.maintMargin)
        if (market.maker) {
            availableMargin += market?.maker
        }
        const amount = symbol === 'BTC/USD:BTC'
            ? availableMargin * entryPrice / 100000000
            : availableMargin / market.info.multiplier / entryPrice * market.info.lotSize
        return target / amount
    }
    ['BTC/USD:BTC', 'ETH/USD:BTC'].forEach(symbol => {
        console.log(symbol, getMinimumCapital(markets, symbol, 100))
    })
    // const formattedAmount = exchange.amountToPrecision(symbol, amount)
    // const formattedPrice = exchange.priceToPrecision(symbol, market.info.prevClosePrice)
    // console.log('availableMargin', availableMargin)
    // console.log('market.info.lotSize', market.info.lotSize)
    // console.log('formattedAmount', formattedAmount)
    // console.log('formattedPrice', formattedPrice)
    // expect(formattedAmount % market.precision.amount).toBe(0)
    // expect(formattedPrice * formattedAmount).toBeLessThan(availableMargin)
})