<template>
  <div>
    <section>
      <LayoutNavbar></LayoutNavbar>
    </section>
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
    <section class="section">
      <div class="columns">
        <div class="column is-12">
            {{ openPosition }}
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import LayoutNavbar from '@/components/LayoutNavbar'
import OverviewLevel from '@/components/OverviewLevel'
import TradingVueChart from '@/components/TradingVueChart'
import CompletedTradeTable2 from '@/components/CompletedTradeTable2'
export default {
  components: {
    LayoutNavbar,
    OverviewLevel,
    TradingVueChart,
    CompletedTradeTable2
  },
  apollo: {
    candles: {
      query: gql`query Candles ($symbol: String, $timeframe: String) {
        candles (symbol: $symbol, timeframe: $timeframe) {
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
        timeframe: '1h'
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
