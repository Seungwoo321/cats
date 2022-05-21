<template>
  <div class="card" ref="card-content">
    <trading-vue
      v-if="dc"
      ref="tradingVue"
      :overlays="overlays"
      :index-based="indexBased"
      :toolbar="true"
      :titleTxt="symbol"
      :legend-buttons="buttons"
      colorTitle="#939399"
      colorBack="hsl(0deg, 0%, 21%)"
      colorCandleDw="rgba(24, 113, 242, 1)"
      colorVolDw="rgba(24, 113, 242, .3)"
      colorWickDw="rgba(24, 113, 242, 1)"
      colorCandleUp="rgba(216, 14, 53, 1)"
      colorVolUp="rgba(216, 14, 53, .3)"
      colorWickUp="rgba(216, 14, 53, 1)"
      colorWickSm="#bdbec0"
      :width="width"
      :height="height"
      :data="chartData"
    />
  </div>
</template>

<script>
import TradingVue from 'trading-vue-js'
import DataCube from 'trading-vue-js/src/helpers/datacube'
// import Utils from 'trading-vue-js/src/stuff/utils'
// import Const from 'trading-vue-js/src/stuff/constants'
import Overlays from '@/utils/Overlays'
import moment from 'moment'
export default {
  components: {
    TradingVue
  },
  props: {
    data: {
      type: Object,
      default: function () {
        return {
          ohlcv: [],
          trades: []
        }
      }
    }
  },
  data () {
    return {
      buttons: [
        'display'
      ],
      moment: moment,
      indexBased: false,
      symbol: 'BCHUSD',
      price: '',
      width: 0,
      height: 0,
      timeframe: '1h',
      overlays: [Overlays.Trades],
      minute: 60000,
      hour: 3600000,
      stream: {
        BCHUSD: null
      },
      dc: null,
      indicatorOption: {
        trades: {
          name: 'Trades',
          type: 'Trades',
          data: []
        }
      }
    }
  },
  computed: {
    chartData: {
      get () {
        return this.dc
      },
      set (dc) {
        this.dc = dc
      }
    }
  },
  mounted () {
    this.onResize()
    this.drawCandles()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onResize () {
      this.width = this.$refs['card-content'].getBoundingClientRect().width
      // this.height = this.width * 0.5 > 511 ? 511 : this.width * 0.5
      this.height = 511
    },
    getOptionOffChart () {
      return this.offchart.filter(name => this.indicatorFlag[name]).map(name => this.indicatorOption[name])
    },
    drawCandles () {
      if (this.$refs.tradingVue) {
        this.$refs.tradingVue.resetChart()
      }
      if (!this.stream[this.symbol]) {
        window.dc = this.dc
        window.tv = this.$refs.tradingVue
      }
      // TBD - stream
      // const now = Utils.now()
      // console.log([now - Const.HOUR * 100, now])
    },
    loadChunck (range) {
      // TBD
    },
    parseCandle (data) {
      if (!Array.isArray(data)) return []
      return data.map(item => {
        return [new Date(item.time).getTime(), item.open, item.high, item.low, item.close, item.volume]
      })
    },
    onTrades (trade) {
      if (trade.data) {
        const price = trade.data[0].price
        const volume = trade.data[0].foreignNotional
        this.price = price
        this.chartData.update({
          price,
          volume
        })
      }
    },
    tech (data) {
      return {
        'chart.data': data
      }
    }
  },
  watch: {
    data: {
      handler (value, oldValue) {
        if (value && value.ohlcv && value.ohlcv.length && value.trades && value.trades.length) {
          const trades = this.data.trades.reduce((accumulator, currentValue) => {
            accumulator.push([new Date(currentValue.entryTime).getTime(), 1, currentValue.entryPrice, currentValue.direction])
            if (currentValue.exitTime) {
              accumulator.push([new Date(currentValue.exitTime).getTime(), 0, currentValue.exitPrice, currentValue.direction, currentValue.profitPct])
            }
            return accumulator
          }, [])
          this.chartData = new DataCube({
            ohlcv: this.parseCandle(value.ohlcv),
            onchart: [
              {
                name: 'Trades',
                type: 'CompletedTrades',
                data: trades,
                settings: {
                  'z-index': 2
                }
              }
            ]
          })
          this.chartData.onrange(this.loadChunck)
        }
      },
      deep: true
    }
  }
}
</script>

<style>

</style>
