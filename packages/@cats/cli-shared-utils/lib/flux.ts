const { flux } = require('@influxdata/influxdb-client')
const createOhlcvFlux = (bucket: string, measurement: string, symbol: string, startRange: number, stopRange: number) => {
    return flux`
        from(bucket: ${bucket})
        |> range(start: ${startRange}, stop: ${stopRange})
        |> filter(fn: (r) => r._measurement == ${measurement} and r.symbol == ${symbol})
        |> keep(columns: ["_time", "symbol", "_field", "_value"])
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `
}
const createOhlcvWithBbFlux = (bucket: string, measurement: string, symbol: string, startRange: number, stopRange: number, n: number, std: number) => {
    return flux`
        import "math"
        
        ohlcv = from(bucket: ${bucket})
        |> range(start: ${startRange}, stop: ${stopRange})
        |> filter(fn: (r) => r._measurement == ${measurement} and r.symbol == ${symbol})
        |> keep(columns: ["_time", "symbol", "_field", "_value"])
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")

        bolingerBand = (tables=<-, n, std, start, stop) => {
            getStddev = (n, t) => tables
            |> range(start: start, stop: stop)
            |> filter(fn: (r) => r._time <= t)
            |> tail(n: n)
            |> stddev()
            |> map(fn: (r) => ({
                _field: "stddev",
                _value: r._value
            }))
            |> findRecord(
                fn: (key) => key._field == "stddev",
                idx: 0
            )
            result = tables
            |> movingAverage(n: n)
            |> map(fn: (r) => ({
                r with
                middle: r._value,
                upper: r._value + (getStddev(n: n, t: r._time)._value * std),
                lower: r._value - (getStddev(n: n, t: r._time)._value * std)
            }))
            |> drop(columns:["_field", "_value"])
            return result
        }

        biband = from(bucket: ${bucket})
        |> range(start: ${startRange}, stop: ${stopRange} )
        |> filter(fn: (r) =>
            r._measurement == ${measurement} and
            r.symbol == ${symbol} and
            r._field == "close"
        )
        |> bolingerBand(n: ${n}, std: ${std}, start: ${startRange}, stop: ${stopRange})
        |> keep(columns: ["_time", "upper", "middle", "lower"])

        join(
            tables: {
                t1: ohlcv,
                t2: biband
            },
            on: ["_time"]
        )
    `
}
const createOhlcvWithStochFlux = (bucket: string, measurement: string, symbol: string, startRange: number, stopRange: number, n: number, m: number, t: number) => {
    return flux`
        import "math"

        ohlcv = from(bucket: ${bucket})
        |> range(start: ${startRange}, stop: ${stopRange})
        |> filter(fn: (r) => r._measurement == ${measurement} and r.symbol == ${symbol})
        |> keep(columns: ["_time", "symbol", "_field", "_value"])
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")

        Stochastic = (tables=<-, n, m, t, start, stop) => {
            maxHigh = (n, _t) => tables
            |> range(start: start, stop: stop)
            |> filter(fn: (r) => r._time <= _t and r._field == "high")
            |> tail(n: n)
            |> max()
            |> findRecord(
                fn: (key) => key._field == "high",
                idx: 0
            )

            minLow = (n, _t) => tables
            |> range(start: start, stop: stop)
            |> filter(fn: (r) => r._time <= _t and r._field == "low")
            |> tail(n: n)
            |> min()
            |> findRecord(
                fn: (key) => key._field == "low",
                idx: 0
            )

            tmp = tables
            |> map(fn: (r) => ({
                r with
                max: float(v: maxHigh(n: n, _t: r._time)._value),
                min: float(v: minLow(n: n, _t: r._time)._value)
            }))

            result = tmp
            |> filter(fn: (r) => r._field == "close")
            |> map(fn: (r) => ({
                r with
                _value: (float(v: r._value) - r.min) / (r.max - r.min) * 100.0
            }))
            |> drop(columns: ["min", "max", "_field"])
            |> movingAverage(n: m)
            |> duplicate(as: "k", column: "_value")
            |> movingAverage(n: t)
            |> rename(columns: { _value: "d" })

            return result
        }

        stoch = from(bucket: ${bucket})
            |> range(start: ${startRange}, stop: ${stopRange})
            |> filter(fn: (r) =>
                r._measurement == ${measurement} and
                r.symbol == ${symbol} and
                r._field != "volume"
            )
            |> Stochastic(n: ${n}, m: ${m}, t: ${t}, start: ${startRange}, stop: ${stopRange})
            |> keep(columns: ["_time", "k", "d"])

        join(
            tables: {
                t1: ohlcv,
                t2: stoch
            },
            on: ["_time"]
        )
    `
}

export {
    createOhlcvFlux,
    createOhlcvWithBbFlux,
    createOhlcvWithStochFlux
}
