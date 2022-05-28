const fs = require('fs-extra')
const path = require('path')
const debug = require('debug')
const dotenv = require('dotenv')
const pm2 = require('pm2')

module.exports = class Service {
    constructor (context, mode) {
        this.initialized = false
        this.context = context
        this.serverName = 'apollo-server'
        this.scriptPath = path.resolve(__dirname, '../../cats-apollo-server')

        if (mode) {
            this.init(mode)
        }
        this.init()
    }

    init(mode = process.env.CATS_CLI_MODE) {
        if (this.initialized) {
            return
        }
        this.initialized = true
        this.mode = mode

        this.loadEnv(process.env.NODE_ENV)

    }

    loadEnv (mode) {
        const logger = debug('@cats/cli')
        const basePath = path.resolve(this.context, `.env${mode ? `.${mode}` : ``}`)
        const localPath = `${basePath}.local`
        const load = envPath => {
            try {
                const env = dotenv.config({ path: envPath, debug: process.env.DEBUG })
                logger(envPath, env)
            } catch (err) {
                // only ignore error if file is not found
                if (err.toString().indexOf('ENOENT') < 0) {
                    logger('Error: environment variable setting')
                }
            }
        }

        load(localPath)
        load(basePath)
    }

    getApollo () {
        return new Promise((resolve, reject) => {
            pm2.connect(function (err) {
                if (err) {
                    return reject(err)
                }
                pm2.list((err, list) => {
                    pm2.disconnect()
                    if (err) {
                        return reject(err)
                    }
                    const apollo = list.some(app => app.name === this.serverName)
                    return resolve(apollo)
                })
            })
        })

    }

    runApollo () {
        return new Promise((resolve, reject) => {
            pm2.connect(function (err) {
                if (err) {
                    return reject(err)
                }
                pm2.start({
                    script: this.scriptPath,
                    name: this.serverName
                }, function (err, apps) {
                    pm2.disconnect()
                    if (err) {
                        return reject(err)
                    }
                    return resolve(apps)
                })
            })
        })

    }

    async run (args) {
        const scriptFile = path.resolve(__dirname, process.env.EXCHANGE_ID + '.js')
        if (!fs.existsSync(scriptFile)) {
            throw new Error('script is not found!')
        }
        const fn = require(scriptFile)
        await fn(args)
    }
}