<template>
  <div id="app">
    <section>
      <LayoutNavbar></LayoutNavbar>
    </section>
    <section class="section">
      <OverviewLevel
        :data="completedTrades"
      >
      </OverviewLevel>
    </section>
    <section class="section is-hidden-mobile">
      <div class="columns">
        <div class="column is-12">
          <h1 class="title">
            BCH/USD:BTC
          </h1>
          <h2 class="subtitle">
            Trading Log
          </h2>
          <hr>
          <CompletedTradeTable
            :data="completedTrades"
          >
          </CompletedTradeTable>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import LayoutNavbar from '@/components/LayoutNavbar'
import OverviewLevel from '@/components/OverviewLevel'
import CompletedTradeTable from '@/components/CompletedTradeTable'
export default {
  components: {
    LayoutNavbar,
    OverviewLevel,
    CompletedTradeTable
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
    }
  }
}
</script>

<style>

</style>
