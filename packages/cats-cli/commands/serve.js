

const Service = require('../util/service')
const GeneratorAPI = require('../util/generator')
const { chalk, debug } = require('@cats/shared-utils')
const logger = debug('cats:cli')

process.env.CATS_CLI_MODE = true

async function serve(name, options) {

    try {
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
        const pm2 = require('./pm2')
        const appConfigPath = generator.getConfigPath()
        pm2(['start', appConfigPath, name])

    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return serve(...args).catch(err => {
        console.log(err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}