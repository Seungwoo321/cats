const fs = require('fs-extra')
const path = require('path')
const { debug } = require('@cats/shared-utils')
const dotenv = require('dotenv')
const logger = debug('cats:cli')

module.exports = class Service {
    constructor (context, mode) {
        this.initialized = false
        this.context = context

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

    async run (args, skip) {
        const scriptFile = path.resolve(__dirname, process.env.EXCHANGE_ID + '.js')
        if (!fs.existsSync(scriptFile)) {
            throw new Error('script is not found!')
        }
        const fn = require(scriptFile)
        await fn(args, skip)
    }
}