const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp}    ${level}     ${message}`
})
const loggerLevels = {
    levels: {
        trace: 0,
        debug: 1,
        info: 2,
        warn: 3,
        error: 4
    },
    colors: {
        trace: 'blue',
        debug: 'green',
        info: 'grey',
        warn: 'yellow',
        error: 'red'
    }
}

const logger = createLogger({
    levels: loggerLevels.levels,
    format: combine(
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        logFormat
    ),
    transports: [new transports.Console()]
})

module.exports = {
    logger
}
