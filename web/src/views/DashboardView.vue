<template>
  <div>
    <section class="section">
      <OverviewLevel
        :data="completedTrades"
      >
      </OverviewLevel>
      <hr>
      <!-- <h1 class="title">
        BCH/USD:BTC
      </h1> -->
    <!-- </section>
    <section class="section pt-0"> -->
      <div class="columns is-desktop">
        <div class="column is-9-desktop is-12-tablet">
          <TradingVueChart
            :data="{ ohlcv: candles, trades: completedTrades }"
          ></TradingVueChart>
        </div>
        <div class="column is-3-desktop is-12-tablet">
          <CompletedTradeTable2
            :data="completedTrades"
          >
          </CompletedTradeTable2>
        </div>
      </div>
    </section>
    <!-- <section class="section">
      <div class="columns">
        <div class="column is-12">
            {{ openPosition }}
        </div>
      </div>
    </section> -->
  </div>
</template>

<script>
import gql from 'graphql-tag'
import OverviewLevel from '@/components/dashboard/OverviewLevel'
import TradingVueChart from '@/components/dashboard/TradingVueChart'
import CompletedTradeTable2 from '@/components/dashboard/CompletedTradeTable2'
import moment from 'moment'
export default {
  components: {
    OverviewLevel,
    TradingVueChart,
    CompletedTradeTable2
  },
  apollo: {
    candles: {
      query: gql`query Candles ($symbol: String, $timeframe: String, $start: Int, $stop: Int) {
        candles (symbol: $symbol, timeframe: $timeframe, start: $start, stop: $stop) {
          time
          open
          high
          low
          close
          volume
        }
      }`,
      variables: {
        symbol: 'BCH/USD:BTC',
        timeframe: '5m',
        start: new Date(moment().subtract(10, 'day').format('YYYY-MM-DD HH:mm:ss')).getTime() / 1000,
        stop: new Date(moment().format('YYYY-MM-DD HH:mm:ss')).getTime() / 1000
      }
    },
    completedTrades: {
      query: gql`query CompletedTrades ($symbol: String) {
        completedTrades (symbol: $symbol) {
          tradingId
          symbol
          direction
          entryTime
          entryPrice
          exitTime
          exitPrice
          profit
          profitPct
          holdingPeriod
          exitReason
          qty
        }
      }`,
      variables: {
        symbol: 'BCH/USD:BTC'
      }
    },
    openPosition: {
      query: gql`query OpenPosition ($symbol: String) {
        openPosition (symbol: $symbol) {
            symbol
            direction
            entryTime
            entryPrice
            growth
            profit
            profitPct
            holdingPeriod
            initialStopPrice
            curStopPrice
            profitTarget
            initialUnitRisk
            initialRiskPct
            curRiskPct
            curRMultiple
        }
      }`,
      variables: {
        symbol: 'BCH/USD:BTC'
      }
    }
  }
}
</script>

<style>

</style>
