import { Overlay } from 'trading-vue-js'

export default {
  name: 'Trades',
  mixins: [Overlay],
  data () {
    return {
      desc: ''
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
      return ['Trades']
    },
    draw (ctx) {
      const layout = this.$props.layout // Layout object (see API BOOK)
      ctx.lineWidth = 1.5
      ctx.strokeStyle = 'black'
      console.log(this)
      for (const i in this.$props.data) {
        const p = this.$props.data[i]
        console.log(p)
        // We use previos point here, but the profit should
        // be already in the data (in a real usecase)
        const prev = this.$props.data[i - 1]

        ctx.fillStyle = p[1] ? '#bfff00' : '#ec4662'
        ctx.beginPath()
        const x = layout.t2screen(p[0]) // x - Mapping
        const y = layout.$2screen(p[2]) // y - Mapping
        ctx.arc(x, y, 5.5, 0, Math.PI * 2, true) // Trade point
        ctx.fill()
        ctx.stroke()

        // If this is a SELL, draw the profit label
        if (p[1] === 0 && prev) {
          let profit = p[2] / prev[2] - 1
          profit = (profit * 100).toFixed(2) + '%'
          ctx.fillStyle = '#555'
          ctx.font = '16px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(profit, x, y - 25)
        }
      }
    }
  }
}
