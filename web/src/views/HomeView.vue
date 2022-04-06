<template>
  <div class="columns">
    <div class="column is-8">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            title
          </p>
        </header>
        <div class="table-container">
          <table class="table is-narrow is-fullwidth">
            <thead>
              <tr>
                <th>
                  Time
                </th>
                <th>
                  Open
                </th>
                <th>
                  Close
                </th>
                <th>
                  High
                </th>
                <th>
                  Low
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in candles" :key="index">
                <td>
                  {{ item.time }}
                </td>
                <td>
                  {{ item.open }}
                </td>
                <td>
                  {{ item.close }}
                </td>
                <td>
                  {{ item.high }}
                </td>
                <td>
                  {{ item.low }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="column is-4">
      <div class="columns">
        <div class="column is-6">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                title
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                content
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                title
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                content
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <div class="card">
            <header class="card-header">
              <p class="card-header-title">
                Trade Logs
              </p>
            </header>
            <div class="card-content">
              <div class="content">
                content
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'HomeView',
  apollo: {
    // candles: {
    //   query: gql`query Candles ($symbol: String, $timeframe: String) {
    //     candles (symbol: $symbol, timeframe: $timeframe) {
    //       time
    //       open
    //       high
    //       low
    //       close
    //       volume
    //     }
    //   }`,
    //   variables: {
    //     symbol: 'BCH/USD:BTC',
    //     timeframe: '1h'
    //   }
    // },
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
  },
  components: {
  }
}
</script>
