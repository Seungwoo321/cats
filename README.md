# Crypto Automated Trading System (CATS)

Algorithmic trading bot based on [`grademark's backtest.ts`](https://github.com/Grademark/grademark/blob/master/src/lib/backtest.ts)

> Still in __development__.
>
> Currently, only BitMEX exchanges are supported.
>
> Added new feature @cats/cli .

## Prerequirements

- InfluxDB 2.0 must be installed and [run collector](#run-collector)
- MySQL must be installed and [run apollo-server](#run-apollo-server).
- Write strategy

### Infrastructure

mariadb and influxdb setup automatically.

```bash
docker compose up
```

### Write strategy

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

### Installation

```bash
npm install
```

### build

```bash
npm run build 
```

### Lint

```bash
npm run lint:fix
```

## Usage

### run apollo server

```bash
npm run dev:apollo -w @cats/apollo-server

```

### run create bot

- Usage 1. without options:

```bash
## command
$ cats create test-bot

? Please select the exchange to be used by ccxt Bitmex
? exchangeMode: test
? Enter the exchange API KEY to be used by ccxt <api-key>
? Enter the exchange SECRET KEY to be used by ccxt <secret-key>
? Please select an symbol BTC/USD:BTC
? Please select a time unit 1 day
? Please select a strategy name a

## ouptut
Successfully registered. 
run command: cats list test-bot

```

- Usage 2. with options:

```bash
## command
cats create test-bot \
    --symbol BTC/USD:BTC \
    --strategy a \
    --timeframe 1d \
    --exchange-id bitmex
    --exchange-access-key <api-key> \
    --exchagne-secret-key <secret-key> \
    --exchange-mode test 

## ouptut
Successfully registered. 
run command: cats list test-bot
```

Both methods work the __same__

#### run bot

```bash
DEBUG=trading:bitmex,execution-trading:bitmex cats run test-bot
```

### run collector

```bash
cats collector
? Enter a token to access Influx2 (http://localhost:8086) 2QR9pFvw6sNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
? Please select the exchange to collect Bitmex
? exchangeMode: test
? Please select an symbol BTC/USD:BTC
? Please select a time unit 5 min
? Select a start date:  2022-06-01 12:00:00
? Select a end date:  2022-06-07 08:38:00
Colleting data... |████████████████████████████████████████| 100% || 20/20 Requsts
```

### @cats/cli Help output

```bash
$ cats --help

Usage: cats <command> [options]

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  create [options] <bot-name>  Configure variables to run the bot application.
  list [options] [bot-name]    List the bot application configured. Require --all flags or [bot name].
  delete [options] [bot-name]  Delete the bot application configured. Require --all flags or [bot name].
  run [options] <bot-name>     run bot created app
  serve <bot-name>             pm2 start <bot-name>
  pm2                          pm2 installed in devDependencies
  collector [options]          Collect candles from exchanges into influxdb.
  help [command]               display help for command

  Run cats <command> --help for detailed usage of given command.
```

```bash
$ cats create --help

Usage: cats create [options] <bot-name>

Configure variables to run the bot application.

Options:
  --symbol <symbol>                          currency symbol to apply automatic trading
  --strategy <strategy>                      trading strategy e.g ...
  --timeframe <timeframe>                    trading cycle. e.g 30m,1h,4h,1d
  --exchange-id <exchangeId>                 ccxt for EXCHANGE_ID - https://docs.ccxt.com/en/latest/manual.html#instantiation
  --exchange-api-key <exchangeApiKey>        ccxt for EXCHANGE_API_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation
  --exchange-secret-key <exchangeSecretKey>  ccxt for EXCHANGE_SECRET_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation
  --exchange-mode <exchangeMode>             ccxt for enable exchange’s sandbox - https://docs.ccxt.com/en/latest/manual.html#testnets-and-sandbox-environments
  -h, --help                                 display help for command
```

```bash
$ cats list --help

Usage: cats list [options] [bot-name]

List the bot application configured. Require --all flags or [bot name].

Options:
  -a, --all   List all settings.
  -h, --help  display help for command

```

cats delete --help

```bash
Usage: cats delete [options] [bot-name]

Delete the bot application configured. Require --all flags or [bot name].

Options:
  -a, --all   Delete all settings.
  -h, --help  display help for command
```

## License

MIT
