# Crypto Automated Trading System (CATS)

Algorithmic trading bot based on [`grademark's backtest.ts`](https://github.com/Grademark/grademark/blob/master/src/lib/backtest.ts)

> Still in development.
> **Currently, only BitMEX exchanges are supported.**

## Pre requirements

- InfluxDB 2.0 must be installed and [run collecting](https://github.com/Seungwoo321/crypto-automated-trading-system#run-collecting)
- MySQL must be installed and create database.
- Following next step.

Step 1. Installation

```bash
npm install
```

Step 2. Build ts file

```bash
npm run build:lib
```

Step 3. Set environment. (if not exist then create .env file)

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

Step 5. Write strategy

[See here](https://github.com/Grademark/grademark-first-example/blob/master/index.js#L37-L53)

## Getting Started

[run apollo server]((https://github.com/Seungwoo321/crypto-automated-trading-system#run-apollo-server)) then [run bot]((https://github.com/Seungwoo321/crypto-automated-trading-system#run-bot))

## Usage

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

## Script

### Run collecting

Store candle data in influxDB 2.0

```bash
npm run collector:bitmex
```

### Run Bot

```bash
npm run bot:bitmex
```
