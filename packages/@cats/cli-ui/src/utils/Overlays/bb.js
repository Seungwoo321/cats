import { Overlay } from 'trading-vue-js'
export default {
  name: 'BB',
  mixins: [
    Overlay
  ],
  methods: {
    meta_info () {
      return {
        author: 'StdSquad',
        version: '1.0.1',
        desc: this.desc
      }
    },
    use_for () {
      return ['BB']
    },
    calc () {
      return {
        props: {
          hiddenMiddle: {
            def: false
          },
          length: {
            def: 40,
            text: 'Length'
          },
          stddev: {
            def: 2,
            text: 'StdDev'
          }
        },
        conf: {
          renderer: 'Channel'
        },
        update: `
            let [m, h, l] = bb(close, length, stddev)
            if (hiddenMiddle) {
                return [h[0], l[0]]
            } else {
                return [h[0], m[0], l[0]]
            }
        `
      }
    }
  }
}
