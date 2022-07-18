# @cats/cli

## example

- backtest

```bash
cats backtest --exchange-id bitmex --exchange-mode production --symbol BTC/USD:BTC --strategy b --timeframe 1h --startDate "2022-03-20 00:00:00" --endDate "2022-07-01 00:00:00" --token cats -c 100000
```

```bash
cats backtest --exchange-id bitmex --exchange-mode production --symbol BTC/USD:BTC --strategy a --timeframe 1h --startDate "2017-01-01 00:00:00" --endDate "2022-07-01 00:00:00" --token cats -c 100000
```

```bash
cats backtest --exchange-id bitmex --exchange-mode production --symbol BCH/USD:BTC --strategy a --timeframe 1h --startDate "2022-03-20 00:00:00" --endDate "2022-07-01 00:00:00" --token cats -c 100000
```