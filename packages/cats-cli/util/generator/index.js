const fs = require('fs-extra')
const path = require('path')
const homedir = require('os').homedir()
const minimist = require('minimist')

module.exports = class GeneratorAPI {
    constructor() {
        this._templatePath = path.resolve(__dirname, 'template/cats.default.json')
        this._config = {
            apps: []
        }
        this.configPath = path.resolve(homedir, `.cats.config.json`)
        this.templatePath = this.configPath

        if (!fs.existsSync(this.configPath)) {
            this.templatePath = this._templatePath
        }
    }

    set data (data) {
        this._config.apps = data.apps
    }

    get data () {
        return this._config.apps
    }

    async getData () {
        return await fs.readJson(this.templatePath)
    }

    existsName (name) {
        return this._config.apps.some(app => app.name === name)
    }

    getConfig (name) {
        if (!this.existsName(name)) {
            throw new Error(`Not found config for "${name}"`)
        }
        return this._config.apps.find(app => app.name === name)
    }

    formatter({ name, script, args, env }) {
        const argvs = minimist(args.split(/\s+/).slice(2))
        return {
            name,
            script,
            symbol: argvs.symbol,
            strategy: argvs.strategy,
            timeframe: argvs.timeframe,
            exchange: env.EXCHANGE_ID,
            api_key: env.EXCHANGE_API_KEY,
            secret_key: env.EXCHANGE_SECRET_KEY
        }
    }

    async addConfig (name, options) {
        this._config.apps.push({
            name,
            script: 'cats',
            args: `run ${name} --symbol ${options.symbol} --strategy ${options.strategy} --timeframe ${options.timeframe}`,
            env: {
                EXCHANGE_ID: options.exchangeId,
                EXCHANGE_API_KEY: options.exchangeApiKey,
                EXCHANGE_SECRET_KEY: options.exchangeSecretKey,
                EXCHANGE_MODE: options.exchangeMode
            }
        })
        await fs.writeJsonSync(this.configPath, this._config)
    }

    async removeConfig(name) {
        if (!this.existsName(name)) {
            throw new Error(`Not found config for "${name}"`)
        }
        this._config.apps = this._config.apps.filter(app => app.name !== name)
        await fs.writeJsonSync(this.configPath, this._config)

    }

    async resetConfig() {
        const initConfig = await fs.readJson(this._templatePath)
        await fs.writeJsonSync(this.configPath, initConfig)
    }
}
