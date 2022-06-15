#!/bin/bash

set -e

CATS_PRODUCTION_EXCHANGES=("bitmex" "binance" "upbit")
CATS_TESTNET_EXCHANGES=("bitmex" "binance")

echo "create bucket for production..."

for exchange in "${CATS_PRODUCTION_EXCHANGES[@]}"; do
  echo $exchange
  influx bucket create -n $exchange -o $DOCKER_INFLUXDB_INIT_ORG -t $DOCKER_INFLUXDB_INIT_ADMIN_TOKEN
done

echo "create bucket for testnet..."

for testnet in "${CATS_TESTNET_EXCHANGES[@]}"; do
echo $testnet.test
  influx bucket create -n $testnet.test -o $DOCKER_INFLUXDB_INIT_ORG -t $DOCKER_INFLUXDB_INIT_ADMIN_TOKEN
done

echo ""
echo "init-influxdb.sh execution completed."
echo ""
