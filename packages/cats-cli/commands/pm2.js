const execa = require('execa')

process.env.CATS_CLI_MODE = true

async function pm2(argvs) {
    try {
        const pm2BinPath = require.resolve('pm2/bin/pm2')
        execa(
            pm2BinPath,
            argvs,
            {
                stdio: 'inherit'
            }
        )
    } catch (error) {
        throw error
    }
}

module.exports = (...args) => {
    return pm2(...args).catch(err => {
        console.log(err)
        if (!process.env.CLI_TEST) {
            process.exit(1)
        }
    })
}