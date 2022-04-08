<template>
  <nav class="level">
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Total Trades</p>
        <p class="title">
          {{ analyze.totalTrades }}
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Bar Count</p>
        <p class="title">
          {{ analyze.barCount }}
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">percent Profitable</p>
        <p class="title">
          {{ analyze.percentProfitable.toFixed(2) }}
        </p>
      </div>
    </div>
    <div class="level-item has-text-centered">
      <div>
        <p class="heading">Profit Percent</p>
        <p class="title">
          {{ analyze.profitPct.toFixed(2) }}
        </p>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    analyze () {
      if (!this.data) return {}
      const startingCapital = 1000
      let workingCapital = startingCapital
      let barCount = 0
      let totalProfits = 0
      let totalLosses = 0
      let numWinningTrades = 0
      let numLosingTrades = 0
      let totalTrades = 0
      // let maxRiskPct
      for (const trade of this.data) {
        if (!trade.exitPrice) {
          continue
        }
        ++totalTrades
        workingCapital *= trade.direction === 'long'
          ? trade.exitPrice / trade.entryPrice
          : trade.entryPrice / trade.exitPrice
        barCount += trade.holdingPeriod

        if (trade.profit > 0) {
          totalProfits += trade.profit
          ++numWinningTrades
        } else {
          totalLosses += trade.profit
          ++numLosingTrades
        }
      }
      const profit = workingCapital - startingCapital
      const profitPct = (profit / startingCapital) * 100
      const proportionWinning = totalTrades > 0 ? numWinningTrades / totalTrades : 0
      const proportionLosing = totalTrades > 0 ? numLosingTrades / totalTrades : 0
      const averageWinningTrade = numWinningTrades > 0 ? totalProfits / numWinningTrades : 0
      const averageLosingTrade = numLosingTrades > 0 ? totalLosses / numLosingTrades : 0
      return {
        startingCapital: startingCapital,
        finalCapital: workingCapital,
        profit: profit,
        profitPct: profitPct,
        growth: workingCapital / startingCapital,
        totalTrades: totalTrades,
        barCount: barCount,
        proportionProfitable: proportionWinning,
        percentProfitable: proportionWinning * 100,
        averageProfitPerTrade: profit / totalTrades,
        numWinningTrades: numWinningTrades,
        numLosingTrades: numLosingTrades,
        averageWinningTrade: averageWinningTrade,
        averageLosingTrade: averageLosingTrade,
        expectedValue: (proportionWinning * averageWinningTrade) + (proportionLosing * averageLosingTrade)
      }
    }
  },
  mounted () {
    console.log(this.analyze)
  }
}
</script>

<style>

</style>
