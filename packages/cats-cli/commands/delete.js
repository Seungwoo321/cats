const inquirer = require('inquirer')
const { chalk } = require('@cats/shared-utils')
const GeneratorAPI = require('../util/generator')

async function list(name, options) {
    try {

        const generator = new GeneratorAPI()
        generator.data = await generator.getData()

        if (options.all) {
            const { ok } = await inquirer.prompt([
                {
                    name: 'ok',
                    type: 'confirm',
                    message: 'Continue to remove these configurations?',
                    default: true
                }
            ])
            if (ok) {
                await generator.resetConfig()
            }
        } else if (name) {
            await generator.removeConfig(name)
        } else {
            throw new Error('Check out the remove options')
        }

        console.log(`${chalk.green(`Successfully${options.all ? ' all' : ''} removed.`)}`)

    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return list(...args).catch(err => {
        console.log(`
            ${chalk.red('Failed:')} ${err.message}
        `)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}
