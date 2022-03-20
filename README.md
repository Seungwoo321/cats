# Crypto Automated Trading System (CATS)

Algorithmic trading bot based on [`grademark's backtest.ts`](https://github.com/Grademark/grademark/blob/master/src/lib/backtest.ts)

> Still in development.
> **Currently, only BitMEX exchanges are supported.**

## Pre requirements

- InfluxDB 2.0 must be installed and [run collecting](https://github.com/Seungwoo321/crypto-automated-trading-system#run-collecting)
- MySQL must be installed and create database.
- Following next step:

Step 1. Installation

```bash
npm install
```

Step 2. Build ts file

```bash
npm run build:lib
```

Step 3. Set environment (if not exist then create .env file)

```bash
# .env

## GraphQL Info
GRAPHQL_URL=http://localhost:4000 # use default

## MariaDB Info
MARIADB_HOST=
MARIADB_DATABASE=
MARIADB_USERNAME=
MARIADB_PASSWORD=

## InfluxData Info
INFLUX2_ORG=
INFLUX2_URL=
INFLUX2_TOKEN=

## Exchange info based on `ccxt`
EXCHANGE_ID=
EXCHANGE_API_KEY=
EXCHANGE_SECRET_KEY=
```

Step 4. Write strategy

[See here](https://github.com/Grademark/grademark-first-example/blob/master/index.js#L37-L53)

For example, write the strategy name a as:

```js
// strategy/a.js 
require('data-forge-indicators')

module.exports = {
    // required
    entryRule: async (enterPostion, args) => {
        if (/** If you want to enter a long position */) {
            await enterPosition({ symbol: args.parameters.symbol, direction: 'long', entryPrice: args.parameters.entryPrice })

        } else if (/** If you want to enter a short position */) {
            await enterPosition({ symbol: args.parameters.symbol, direction: 'short', entryPrice: args.parameters.entryPrice })

        }
    },
    // required
    exitRule: async (exitPosition, args) => {
        if (args.position.direction === 'long') {
            if (/** If you want to exit long position */) {
                await exitPosition(args.parameters.symbol)
            }

        } else {
            if (/** If you want to exit short position */) {
                await exitPosition(args.parameters.symbol)
            }
        }
    },

    // option
    stopLoss: args => {
        return args.entryPrice * (5 / 100)
    },

    // option
    trailingStopLoss: args => {
        return args.entryPrice * (5 / 100)
    },

    // option
    prepIndicators: ({ inputSeries }) => {
        if (!inputSeries.toArray().length) {
            return inputSeries
        }
        // If you want to add "Moving Average"
        const sma20 = inputSeries
            .deflate(bar => bar.close)
            .sma(20)
        inputSeries = inputSeries.withSeries('sma20', movingAverage)
            .skip(20)
        const sma60 = inputSeries
            .deflate(bar => bar.close)
            .sma(60)
        inputSeries = inputSeries.withSeries('sma60', movingAverage)
            .skip(60)
        const sma60 = inputSeries
            .deflate(bar => bar.close)
            .sma(120)
        inputSeries = inputSeries.withSeries('sma60', movingAverage)
            .skip(120)
        return inputSeries
    }
}

// strategy/index.js 
const a = require('./a')

module.exports = {
    a
}

```

## Getting Started

[run apollo server](https://github.com/Seungwoo321/crypto-automated-trading-system#run-apollo-server) then [run bot](https://github.com/Seungwoo321/crypto-automated-trading-system#run-bot)

### Lint

```bash
npm run lint:fix
```

### Run Test

```bash
npm run test
```

### Run apollo server

```bash
npm run serve:apollo-server
```

### Run collecting

Store candle data in influxDB 2.0

```bash
npm run collector:bitmex
```

### Run Bot

#### required 3 argumnets

1. **symbol**
    - e.g `BTC/USD:BTC`, `BCH/USD:BTC`, `ETH/USD:BTC`, `LTC/USD:BTC` in bitmex
2. **timeframe**
    - e.g `30m`, `1h`, `4h`, `1d` using in influxData
3. **strategy name**
    - create like `a.js` in strategy directory

#### basic format

```bash
npm run bot:bitmex {symbol} {timeframe} {strategy name}
```

#### e.g

```bash
npm run bot:bitmex BTC/USD:BTC 4h a

npm run bot:bitmex ETH/USD:BTC 1d b
```

## License

MIT
