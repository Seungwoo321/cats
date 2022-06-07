const { chalk } = require('@cats/shared-utils')
const GeneratorAPI = require('../util/generator')

async function list(name, options) {
    try {
        let logData = []
        const generator = new GeneratorAPI()
        generator.data = await generator.getData()

        if (options.all) {
            const allConfig = generator.data
            if (allConfig.length > 0) {
                logData = logData.concat(allConfig.map(generator.formatter))
            }
        } else {
            const config = generator.getConfig(name)
            logData = logData.concat([config].map(generator.formatter))
        }

        if (logData.length) {
            console.log()
            console.table(logData)
            console.log()
        } else {
            console.log()
            console.log('No configuration')
            console.log()
        }

       
    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return list(...args).catch(err => {
        console.log(`${chalk.red('Failed:')} ${err.message}`)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}
