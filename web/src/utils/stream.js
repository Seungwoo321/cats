export default function Stream (url) {
  const ws = new WebSocket(url)
  let cb = () => { }

  ws.onopen = function () {
    console.info('Websocket is opened')
  }

  ws.onmessage = function (data) {
    try {
      data = JSON.parse(data.data)
      cb(data)
    } catch (e) {
      console.error(e.toString())
    }
  }

  return {
    // eslint-disable-next-line accessor-pairs
    set ontrades (val) { cb = val },
    off () { ws.close(1000) }
  }
}
