const Service = require('../util/service')
const GeneratorAPI = require('../util/generator')
const { chalk, debug } = require('@cats/shared-utils')
const logger = debug('cats:cli')
const path = require('path')
const gqlService = require('@cats/helper-gql').service

process.env.CATS_CLI_MODE = true

async function run (name, options) {

    try {
        // Generator
        const generator = new GeneratorAPI()
        generator.data = await generator.getData()

        const config = generator.getConfig(name)

        if (!config) {
            logger(chalk.yellow(`Not configuration ${name}`))
            process.exit(1)
        }

        const argvs = [config].map(generator.formatter)[0]

        // Capital
        let positionStatus = await gqlService.getPositionStatus(argvs.symbol)
        if ((!positionStatus.startingCapital || positionStatus.startingCapital <= 0 || options.force) && Number(options.capital) > 0) {
            logger('update startingCapital.')
            positionStatus = await gqlService.updatePositionCapital(argvs.symbol, Number(options.capital))
        }
        
        const startingCapital = positionStatus.startingCapital
        
        if (startingCapital <= 0) {
            console.log()
            console.log(chalk.red('No starting capital.'))
            console.log()
            process.exit(0)
        } else {
            console.log('startingCapital:' + startingCapital)
        }

        // Service       
        const projectRoot = path.resolve(__dirname, '../../../')
        const service = new Service(projectRoot, process.env.CATS_CLI_MODE)

        process.env.EXCHANGE_ID = config.env.EXCHANGE_ID
        process.env.EXCHANGE_API_KEY = config.env.EXCHANGE_API_KEY
        process.env.EXCHANGE_SECRET_KEY = config.env.EXCHANGE_SECRET_KEY
        process.env.EXCHANGE_MODE = argvs.exchangeMode

        if (options.symbol && options.symbol !== argvs.symbol) {
            throw(new Error('Invalid parameter value --symbol'))
        }
        if (options.strategy && options.strategy !== argvs.strategy) {
            throw(new Error('Invalid parameter value --strategy'))
        }
        if (options.timeframe && options.timeframe !== argvs.timeframe) {
            throw (new Error('Invalid parameter value --timeframe'))
        }

        const parmas = Object.assign({}, {
            symbol: argvs.symbol,
            strategy: argvs.strategy,
            timeframe: argvs.timeframe
        })
        
        service.run(parmas, options.skip)
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