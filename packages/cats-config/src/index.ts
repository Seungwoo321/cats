const debug = require('debug')
const path = require('path')
const dotenv = require('dotenv')

const mode = process.env.NODE_ENV
const envPath = path.resolve(__dirname, '../../../', `.env${mode ? `.${mode}` : ''}`)

function configuration () {
    if (!process.env.CATS_CLI_MODE) {
        const logger = debug('cats:config')
        try {
            dotenv.config({ path: envPath, debug: process.env.DEBUG })
            logger(`environment variable setting: ${envPath}`)
        } catch (err) {
            logger('Error: environment variable setting')
        }
    }
    return {
        EXCHANGE_ID: process.env.EXCHANGE_ID || '',
        EXCHANGE_API_KEY: process.env.EXCHANGE_API_KEY || '',
        EXCHANGE_SECRET_KEY: process.env.EXCHANGE_SECRET_KEY || '',
        EXCHANGE_MODE: process.env.EXCHANGE_MODE,
        GRAPHQL_URL: process.env.GRAPHQL_URL || 'http://localhost:4000',
        INFLUX2_URL: process.env.INFLUX2_URL || 'http://localhost:8086',
        INFLUX2_TOKEN: process.env.INFLUX2_TOKEN || '',
        MARIADB_HOST: process.env.MARIADB_HOST || 'localhost',
        MARIADB_DATABASE: process.env.MARIADB_DATABASE || '',
        MARIADB_USERNAME: process.env.MARIADB_USERNAME || '',
        MARIADB_PASSWORD: process.env.MARIADB_PASSWORD || ''
    }

}

const config = configuration()

export default config

export {
    config
}