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

const execa = require('execa')
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
    .option('--exchange-api-key <exchangeApiKey>', 'ccxt for EXCHANGE_API_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation')
    .option('--exchange-secret-key <exchangeSecretKey>', 'ccxt for EXCHANGE_SECRET_KEY - https://docs.ccxt.com/en/latest/manual.html#instantiation')
    .option('--exchange-mode <exchangeMode>', 'ccxt for enable exchange’s sandbox - https://docs.ccxt.com/en/latest/manual.html#testnets-and-sandbox-environments')
    .action((name, options) => {
        if (minimist(process.argv.slice(3))._.length > 1) {
            console.log(chalk.yellow('\n Info: You provided more than one argument.'))
        }
        require('../commands/create')(name, options)
    })

program
    .command('list')
    .argument('[bot-name]')
    .description('List the bot application configured. Require --all flags or [bot name].')
    .option('-a, --all', 'List all settings.')
    .action((name, options) => {
        if (!name && !options.all) {
            program.outputHelp()
            process.exit(1)
        }
        require('../commands/list')(name, options)
    })
    
program
    .command('delete')
    .argument('[bot-name]')
    .description('Delete the bot application configured. Require --all flags or [bot name].')
    .option('-a, --all', 'Delete all settings.')
    .action((name, options) => {
        if (!name && !options.all) {
            program.outputHelp()
            process.exit(1)
        }
        require('../commands/delete')(name, options)
    })

program
    .command('run <bot-name>')
    .description('run bot created app')
    .option('-c, --capital <capital>', 'starting capital. currency is XBt (Satoshi)')
    .option('-f, --force', 'force to apply capital')
    .option('--skip', 'first only skip')
    .action((name, options) => {
        if (options.force && !options.capital) {
            program.outputHelp()
            process.exit(1)
        }
        require('../commands/run')(name, options)
    })

program
    .command('serve <bot-name>')
    .description('pm2 start <bot-name>')
    .option('-c, --capital <capital>', 'starting capital. currency is XBt (Satoshi)')
    .option('-f, --force', 'force to apply capital')
    .action((name, options) => {
        require('../commands/serve')(name, options)
    })

program
    .command('pm2')
    .description('pm2 installed in devDependencies')
    .action((name, options) => {
        const argvs = minimist(process.argv.slice(3))._
        require('../commands/pm2')(argvs)
    })

program
    .command('collector')
    .description('Collect candles from exchanges into influxdb.')
    .option('--exchange <exchangeId>', 'exchange Name to collect data. eg. bitmex')
    .option('--symbol <symbol>', 'currency symbol')
    .option('--timeframe <timeframe>', 'trading cycle')
    .option('--start <startDate>', 'data collection start date')
    .option('--end <endDate>', 'data collection end date')
    .option('--influxdb-token <token>', 'Token for access Influxdb (localhost:8086)')
    .action((name, options) => {
        if (minimist(process.argv.slice(3))._.length < 1) {
            options = {}
        }
        require('../commands/collector')(name, options)
    }) 

// output help information on unknown commands
program.on('command', ([cmd]) => {
    program.outputHelp()
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    process.exitCode = 1
})
program.on('command:', ([cmd]) => {
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