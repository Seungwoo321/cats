<template>
  <trading-vue
      v-if="stream"
      ref="tradingVue"
      :overlays="overlays"
      :index-based="indexBased"
      :toolbar="false"
      :titleTxt="symbol"
      :legend-buttons="buttons"
      @legend-button-click="onLegentButtonClick"
      colorTitle="#939399"
      colorBack="#3f404a"
      colorCandleDw="rgba(24, 113, 242, 1)"
      colorVolDw="rgba(24, 113, 242, .3)"
      colorWickDw="rgba(24, 113, 242, 1)"
      colorCandleUp="rgba(216, 14, 53, 1)"
      colorVolUp="rgba(216, 14, 53, .3)"
      colorWickUp="rgba(216, 14, 53, 1)"
      colorWickSm="#bdbec0"
      :width="width"
      :height="height"
      :data="chart"
      :timezone="9"
  />
</template>

<script>
import TradingVue from 'trading-vue-js'
import DataCube from 'trading-vue-js/src/helpers/datacube'
// import Utils from 'trading-vue-js/src/stuff/utils'
// import Const from 'trading-vue-js/src/stuff/constants'
import Overlays from '@/components/Overlays'
import moment from 'moment'
export default {
  components: {
    TradingVue
  },
  data () {
    return {
      onchart: ['bb', 'bb2', 'bb100', 'sma15'],
      offchart: ['stoch533', 'stoch1066', 'stoch201212', 'stoch56'],
      buttons: [
        'display'
      ],
      indicatorOption: {
        sma15: {
          name: 'sma 15',
          type: 'SMA',
          data: [],
          settings: {
            length: 15
          }
        },
        bb: {
          name: 'BI band',
          type: 'BB',
          data: [],
          settings: {
            length: 40,
            stddev: 0.5,
            color: 'rgba(255, 255, 255, 1)',
            backColor: 'rgba(122, 122, 122, 0.3)'
          }
        },
        bb2: {
          name: '40/2 band',
          type: 'BB',
          data: [],
          settings: {
            hiddenMiddle: true,
            length: 40,
            stddev: 2,
            color: 'rgba(237, 242, 82, 1)'
          }
        },
        bb100: {
          name: '100/0.5 band',
          type: 'BB',
          data: [],
          settings: {
            length: 100,
            stddev: 0.5,
            color: 'rgba(250, 163, 255, 1)',
            backColor: 'rgba(250, 163, 255, 0.1)'
          }
        },
        stoch533: {
          name: 'Stoch5/3/3',
          type: 'Stochastic',
          data: [],
          settings: {
            kColor: '#ffffff',
            kWidth: 2,
            dWidth: 1,
            lineWidth: 0.75,
            type: 'slow',
            k: 5,
            d: 3,
            smooth: 3
          }
        },
        stoch1066: {
          name: 'Stoch10/6/6',
          type: 'Stochastic',
          data: [],
          settings: {
            kColor: '#ffffff',
            kWidth: 2,
            dWidth: 1,
            lineWidth: 0.75,
            type: 'slow',
            k: 10,
            d: 6,
            smooth: 6
          }
        },
        stoch201212: {
          name: 'Stoch20/12/12',
          type: 'Stochastic',
          data: [],
          settings: {
            kColor: '#ffffff',
            kWidth: 2,
            dWidth: 1,
            lineWidth: 0.75,
            type: 'slow',
            k: 20,
            d: 12,
            smooth: 12
          }
        },
        stoch56: {
          name: 'Stoch56/32/32',
          type: 'Stochastic',
          data: [],
          settings: {
            kColor: '#e3ff47',
            kWidth: 2,
            hiddenD: false,
            type: 'slow',
            k: 56,
            d: 32,
            smooth: 32
          }
        }
      },
      indicatorFlag: {
        more: false,
        sma15: true,
        bb: true,
        bb2: true,
        bb100: true,
        stoch533: true,
        stoch1066: true,
        stoch201212: true,
        stoch56: true
      },
      moment: moment,
      indexBased: false,
      chart: new DataCube({}),
      symbol: 'XBTUSD',
      price: '',
      width: 0,
      height: 0,
      timeframe: '4h',
      overlays: [Overlays.BB, Overlays.Stochastic, Overlays.SMA],
      minute: 60000,
      hour: 3600000,
      stream: {
        XBTUSD: null,
        ETHUSD: null,
        XRPUSD: null,
        BCHUSD: null
      }
    }
  }
}
</script>

<style>

</style>
