import { Overlay } from 'trading-vue-js'
export default {
  name: 'Stochastic',
  mixins: [
    Overlay
  ],
  computed: {
    lineWidth () {
      return this.settings.lineWidth || 0.75
    },
    kWidth () {
      return this.settings.kWidth || this.lineWidth
    },
    dWidth () {
      return this.settings.dWidth || this.lineWidth
    },
    kColor () {
      return this.settings.kColor || '#0915f4'
    },
    dColor () {
      return this.settings.dColor || '#f43409'
    },
    bandColor () {
      return this.settings.bandColor || '#b5b3b3'
    },
    backColor () {
      // return this.settings.backColor || '#381e9c16'
      return 'rgba(182, 178, 184, 0.1)'
    }
  },
  methods: {
    meta_info () {
      return {
        author: 'StdSquad',
        version: '1.0.1',
        desc: this.desc
      }
    },
    draw (ctx) {
      const layout = this.$props.layout
      const upper = layout.$2screen(this.settings.upper || 80)
      const lower = layout.$2screen(this.settings.lower || 20)
      // K
      ctx.lineWidth = this.kWidth
      ctx.strokeStyle = this.kColor
      ctx.beginPath()
      for (const p of this.$props.data) {
        const x = layout.t2screen(p[0])
        const y = layout.$2screen(p[1])
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      // D
      ctx.lineWidth = this.dWidth
      ctx.strokeStyle = this.dColor
      ctx.beginPath()
      for (const p of this.$props.data) {
        const x = layout.t2screen(p[0])
        const y = layout.$2screen(p[2])
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.strokeStyle = this.bandColor
      ctx.setLineDash([5]) // Will be removed after draw()
      ctx.beginPath()
      // Fill the area between the bands
      ctx.fillStyle = this.backColor
      ctx.fillRect(0, upper, layout.width, lower - upper)
      // Upper band
      ctx.moveTo(0, upper)
      ctx.lineTo(layout.width, upper)
      // Lower band
      ctx.moveTo(0, lower)
      ctx.lineTo(layout.width, lower)
      ctx.stroke()
    },
    use_for () {
      return ['Stochastic']
    },
    data_colors () {
      return [this.color]
    },
    y_range (hi, lo) {
      return [
        Math.max(hi, this.settings.upper || 80),
        Math.min(lo, this.settings.lower || 20)
      ]
    },
    calc () {
      return {
        props: {
          type: {
            def: 'slow'
          },
          hiddenK: {
            def: false
          },
          hiddenD: {
            def: false
          },
          k: {
            def: 5,
            text: '%K'
          },
          d: {
            def: 3,
            text: '%D'
          },
          smooth: {
            def: 3,
            text: 'Smooth'
          }
        },
        update: `
          const fast_k_array = stoch(close, high, low, k, 'stoch')
          const fast_d_array = sma(fast_k_array, d, 'sma')
          if (type === "slow") {
            const slow_k = !hiddenK ? sma(fast_k_array, smooth, fast_k_array._id)[0] : undefined
            const slow_d = !hiddenD ? sma(fast_d_array, smooth, fast_d_array._id)[0] : undefined
            return [slow_k, slow_d]
          } else {
            return [!hiddenK ? fast_k_array[0] : undefined, !hiddenD ? fast_d_array[0] : undefined]
          }
        `
      }
    }
  }
}
