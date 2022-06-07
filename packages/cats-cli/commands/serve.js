

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