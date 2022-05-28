const Service = require('../util/service')
const GeneratorAPI = require('../util/generator')
const debug = require('debug')
const { chalk } = require('@cats/shared-utils')
const path = require('path')

process.env.CATS_CLI_MODE = true

async function run (name, options) {
    const logger = debug('@cats/cli:run')

    try {
        const generator = new GeneratorAPI()
        generator.data = await generator.getData()

        const config = generator.getConfig(name)

        if (!config) {
            logger(chalk.yellow(`Not configuration ${name}`))
            process.exit(1)
        }
        if (!options) {

            const argvs = [config].map(generator.formatter)[0]
            options = Object.assign({}, {
                symbol: argvs.symbol,
                strategy: argvs.strategy,
                timeframe: argvs.timeframe
            })
        }

        const projectDir = path.resolve(__dirname, '../../../')
        const service = new Service(projectDir, process.env.CATS_CLI_MODE)

        const isServe = await service.getApollo()
        // console.log(isServe)
        if (!isServe) {
            // console.log(isServe)
            // console.log(process.env)
        }

        // process.env.EXCHANGE_ID = config.env.EXCHANGE_ID
        // process.env.EXCHANGE_API_KEY = config.env.EXCHANGE_API_KEY
        // process.env.EXCHANGE_SECRET_KEY = config.env.EXCHANGE_SECRET_KEY
        
        service.run(options)

    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return run(...args).catch(err => {
        console.log(err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}