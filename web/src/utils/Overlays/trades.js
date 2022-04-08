import { Overlay } from 'trading-vue-js'

export default {
  name: 'Trades',
  mixins: [Overlay],
  data () {
    return {
      desc: ''
    }
  },
  computed: {
    sett () {
      return this.$props.settings
    }
  },
  methods: {
    meta_info () {
      return {
        author: 'SeungwooLee',
        version: '1.0.0',
        desc: this.desc
      }
    },
    use_for () {
      return ['CompletedTrades']
    },
    draw (ctx) {
      console.log(this.$props.settings['z-index'])
      const layout = this.$props.layout // Layout object (see API BOOK)
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'black'
      for (const i in this.$props.data) {
        const p = this.$props.data[i]
        // We use previos point here, but the profit should
        // be already in the data (in a real usecase)
        const prev = this.$props.data[i - 1]

        // ctx.strokeStyle = p[1] === 1 ? 'black' : 'white'
        if (p[1] === 0) {
          ctx.fillStyle = 'white'
        } else {
          ctx.fillStyle = p[3] === 'long' ? '#48C78E' : '#F14668'
        }
        ctx.beginPath()
        const x = layout.t2screen(p[0]) // x - Mapping
        const y = layout.$2screen(p[2]) // y - Mapping
        ctx.arc(x, y, 5, 0, Math.PI * 2, true) // Trade point
        ctx.fill()
        ctx.stroke()
        console.log(ctx)
        // If this is a SELL, draw the profit label
        if (p[1] === 1) {
          ctx.fillStyle = p[3] === 'long' ? '#48C78E' : '#F14668'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(p[3][0].toUpperCase(), x, y - 25)
        }
        if (p[1] === 0 && prev) {
          ctx.fillStyle = '#dfdfdf'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(p[4], x, y - 25)
        }
      }
    }
  }
}
