#!/usr/bin/env node

const { chalk, semver } = require('@cats/shared-utils')
const requiredVersion = require('../package.json').engines.node
const minimist = require('minimist')

function checkNodeVersion(wanted, id) {
    if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
        console.log(chalk.red(
            'You are using Node ' + process.version + ', but this version of ' + id +
            ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
        ))
        process.exit(1)
    }
}

checkNodeVersion(requiredVersion, '@cats/cli')

const program = require('commander')

program
    .version(`@cats/cli ${require('../package').version}`)
    .usage('<command> [options]')


program
    .command('create <bot-name>')
    .description('Configure variables to run the bot application.')
    .option('--symbol <symbol>', 'currency symbol to apply automatic trading')
    .option('--strategy <strategy>', 'trading strategy e.g ...')
    .option('--timeframe <timeframe> ', 'trading cycle. e.g 30m,1h,4h,1d')
    .option('--exchange-id <exchangeId>', 'ccxt for EXCHANGE_ID - https://docs.ccxt.com/en/latest/manual.html#instantiation')
    .option('--exchange-access-key <exchangeAccessKey>', 'ccxt for EXCHANGE_ACCESS_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation')
    .option('--exchagne-secret-key <exhcnageSecretKey', 'ccxt for EXCHANGE_SECRET_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation')
    .option('--exchange-mode <exchangeMode>', 'ccxt for enable exchange’s sandbox - https://docs.ccxt.com/en/latest/manual.html#testnets-and-sandbox-environments')
    .action((name, options) => {
        if (minimist(process.argv.slice(3))._.length > 1) {
            console.log(chalk.yellow('\n Info: You provided more than one argument.'))
        }
        require('../commands/create')(name, options)
    })

program
    .command('list [bot-name]')
    .description('list configured bot.')
    .action(name => {
        const options = {
            all: !name,
            name
        }
        require('../commands/list')(options)
    })

program
    .command('delete [bot-name]')
    .description('delete the bot application configured or all')
    .action(name => {
        const options = {
            all: !name,
            name
        }
        require('../commands/delete')(options)
    })

program
    .command('run <bot-name>')
    .option('--symbol <symbol>', 'currency symbol to apply automatic trading')
    .option('--strategy <strategy>', 'trading strategy')
    .option('--timeframe <timeframe>  ', 'trading cycle')
    .description('run bot app')
    .action((name, options) => {
        require('../commands/run')(name, options)
    })

// output help information on unknown commands
program.on('command:*', ([cmd]) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    process.exitCode = 1
})

program.on('--help', () => {
    console.log()
    console.log(`  Run ${chalk.cyan(`cats <command> --help`)} for detailed usage of given command.`)
    console.log()
})

program.commands.forEach(c => c.on('--help', () => console.log()))

// enhance common error messages
const enhanceErrorMessages = require('../util/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', argName => {
    return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
    return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
    return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
        flag ? `, got ${chalk.yellow(flag)}` : ``
    )
})

program.parse(process.argv)