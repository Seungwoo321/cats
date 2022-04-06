<template>
  <div class="columns">
    <div class="column is-8">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">
            Chart
          </p>
        </header>
        <table class="table is-narrow is-fullwidth">
          <thead>
            <tr>
              <th>
                Direction
              </th>
              <th>
                Entry Time
              </th>
              <th>
                Entry Price
              </th>
              <th>
                Exit Time
              </th>
              <th>
                Exit Price
              </th>
              <th>
                Qty
              </th>
              <th>
                Profit Percent
              </th>
              <th>
                Exit Reason
              </th>
            </tr>
          </thead>
          <tbody>
            <!--
              { "tradingId": "001ba3ee-8540-45aa-976a-656b53d7b5d2", "symbol": "BCH/USD:BTC", "direction": "short", "entryTime": "2022-04-04T22:36:24.000Z", "entryPrice": 373.95, "exitTime": "2022-04-05T00:00:22.000Z", "exitPrice": 376.5, "profit": -2.55, "profitPct": -0.681909, "holdingPeriod": 0, "exitReason": "exit-rule", "qty": 41, "__typename": "ITrade" }
              -->
            <tr v-for="(item, index) in completedTrades" :key="index">
              <td>
                {{ item.direction }}
              </td>
              <td>
                {{ item.entryTime.substring(0, 10) }} {{ item.entryTime.substring(11, 19) }}
              </td>
              <td>
                {{ item.entryPrice }}
              </td>
              <td>
                {{ item.exitTime ? item.exitTime.substring(0, 10) + ' ' + item.exitTime.substring(11, 19): undefined }}
              </td>
              <td>
                {{ item.exitPrice }}
              </td>
              <td>
                {{ item.qty }}
              </td>
              <td>
                {{ item.profitPct }}
              </td>
              <td>
                {{ item.exitReason }}
              </td>
            </tr>
          </tbody>
        </table>
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
            <div class="table-container">

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
  },
  components: {
  }
}
</script>
