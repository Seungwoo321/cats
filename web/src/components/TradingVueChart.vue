<template>
  <div class="card">
    <div class="card-content" ref="card-content">
      <trading-vue
        v-if="chartData"
        ref="tradingVue"
        :overlays="overlays"
        :index-based="indexBased"
        :toolbar="false"
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
        :timezone="9"
      />
    </div>
  </div>
</template>

<script>
import TradingVue from 'trading-vue-js'
import DataCube from 'trading-vue-js/src/helpers/datacube'
import Utils from 'trading-vue-js/src/stuff/utils'
import Const from 'trading-vue-js/src/stuff/constants'
import Overlays from '@/utils/Overlays'
import moment from 'moment'
// import Stream from '@/utils/stream'
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
      // dc: new DataCube({}),
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
    // if (this.stream[this.symbol]) this.stream[this.symbol].off()
  },
  methods: {
    onResize () {
      // const width = (this.$refs['chart-container'] && this.$refs['chart-container'].getBoundingClientRect().width) || window.innerWidth
      // this.width = width > 1024 ? width - 45 : width - 30
      this.width = this.$refs['card-content'].getBoundingClientRect().width - 40
      this.height = this.width > 800 ? 400 : this.width * 0.9
    },
    getOptionOnChart () {
      console.log(this.data.trades)
      return [
        {
          name: 'Trades',
          type: 'PerfectTrades',
          data: this.data.trades
        }
      ]
    },
    getOptionOffChart () {
      return this.offchart.filter(name => this.indicatorFlag[name]).map(name => this.indicatorOption[name])
    },
    drawCandles () {
      // const options = {
      //   ohlcv: this.parseCandle(this.ohlcv) || []
      //   // onchart: this.getOptionOnChart(),
      //   // offchart: this.getOptionOffChart()
      // }
      // this.dc = new DataCube(options)

      if (this.$refs.tradingVue) {
        this.$refs.tradingVue.resetChart()
      }
      if (!this.stream[this.symbol]) {
        // const WSS = `wss://ws.bitmex.com/realtime?subscribe=trade:${this.symbol}`
        // this.stream[this.symbol] = new Stream(WSS)
        // this.stream[this.symbol].ontrades = this.onTrades
        window.dc = this.dc
        window.tv = this.$refs.tradingVue
      }
      // this.chart = {}
      const now = Utils.now()
      console.log([now - Const.HOUR * 100, now])
      // this.loadChunck([now - Const.HOUR1 * 100, now]).then(data => {
      //   const options = {
      //     ohlcv: data['chart.data'] || [],
      //     onchart: this.getOptionOnChart(),
      //     offchart: this.getOptionOffChart()
      //   }
      //   this.chart = new DataCube(options)
      //   if (this.$refs.tradingVue) {
      //     this.$refs.tradingVue.resetChart()
      //   }
      //   if (!this.stream[this.symbol]) {
      //     const WSS = `wss://ws.bitmex.com/realtime?subscribe=trade:${this.symbol}`
      //     this.stream[this.symbol] = new Stream(WSS)
      //     this.stream[this.symbol].ontrades = this.onTrades
      //     window.dc = this.chart
      //     window.tv = this.$refs.tradingVue
      //   }
      // console.log(this.chartData)
      // this.chartData.onrange(this.loadChunck)
      // }).catch(() => {
      //   if (this.stream[this.symbol]) {
      //     this.price = 'No data.'
      //     this.stream[this.symbol].off()
      //     this.stream[this.symbol] = null
      //   }
      // })
    },
    loadChunck (range) {
      console.log(range)
      // const [t1, t2] = range
      // return this.fetchCandles({ symbol: this.symbol, timeframe: this.timeframe, range }).then(() => {
      //   return this.tech(this.parseCandle(this.candles[this.timeframe]))
      // })
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
          this.chartData = new DataCube({
            ohlcv: this.parseCandle(value.ohlcv),
            onchart: this.getOptionOnChart()
          })
          console.log(new DataCube({
            ohlcv: this.parseCandle(value.ohlcv),
            onchart: this.getOptionOnChart()
          }))
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
