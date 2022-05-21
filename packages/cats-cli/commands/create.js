const inquirer = require('inquirer')
const { chalk } = require('@cats/shared-utils')
const createPrompt = require('../util/createPrompt')
const GeneratorAPI = require('../util/generator')
const validationPrompt = require('../util/validationPrompt')
async function create (name, options) {
    try {
        const generator = new GeneratorAPI()
        generator.data = await generator.getData()

        if (generator.existsName(name)) {
            throw new Error('bot name already exists.')
        }

        const promptOptions = await inquirer.prompt(createPrompt(options))
        const fullOptions = Object.assign({}, options, promptOptions)

        if (fullOptions.testMode === 'test' && !validationPrompt.isEnableTestExchange(fullOptions.exchangeId)) {
            throw new Error(`${fullOptions.exchangeId} is not supported test mode`)
        }

        if (validationPrompt.isSupportableExchange(fullOptions.exchangeId)) {
            await generator.addConfig(name, fullOptions)

            console.log(`${chalk.green(`Successfully registered.`)}
                run command: ${chalk.blue(`cats list ${name}`)}`)
        }

    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return create(...args).catch(err => {
        console.log(`${chalk.red('Failed:')} ${err.message}`)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}
