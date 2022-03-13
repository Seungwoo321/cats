# Trading Bot

> Still in development

Algorithmic trading bot based on `ccxt`

## Requirments

- InfluxDB 2.0 must be installed.
- ~~MySQL must be installed~~ TBD

## Getting Started

### You need to set the following environment variable values

```bash
# .env
INFLUX2_ORG= # input
INFLUX2_URL= # input
INFLUX2_TOKEN= # input
GRAPHQL_URL= # input
EXCHANGE_ID= # input
EXCHANGE_API_KEY= # input
EXCHANGE_SECRET_KEY= # input
```

## Usage

### Installation

```bash
npm install
```

### Build

TypeScript to JavaScript

```bash
npm run build
```

### Lint

```bash
npm run lint: fix
```

### Run Test

```bash
npm run test
```

## Script

### Collecting

Store candle data in influxDB 2.0

```bash
npm run collector:bitmex
```
