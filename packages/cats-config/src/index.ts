const debug = require('debug')
const path = require('path')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.join(__dirname, '.env.development') })
} else {
    dotenv.config({ path: path.join(__dirname, '.env') })
}

export default (function config (
    mode: String
) {
    const logger = debug('cats:config')
    const envPath = path.resolve(__dirname, '../../../', `.env${mode ? `.${mode}` : ''}`)
    try {
        dotenv.config({ path: envPath, debug: process.env.DEBUG })
        logger(`environment variable setting: ${envPath}`)
    } catch (err) {
        logger('Error: environment variable setting')
    }
    return {
        EXCHANGE_ID: process.env.EXCHANGE_ID || '',
        EXCHANGE_API_KEY: process.env.EXCHANGE_API_KEY || '',
        EXCHANGE_SECRET_KEY: process.env.EXCHANGE_SECRET_KEY || '',
        GRAPHQL_URL: process.env.GRAPHQL_URL || 'http://localhost:4000',
        INFLUX2_ORG: process.env.INFLUX2_ORG || '',
        INFLUX2_URL: process.env.INFLUX2_URL || 'http://localhost:8086',
        INFLUX2_TOKEN: process.env.INFLUX2_TOKEN || '',
        MARIADB_HOST: process.env.MARIADB_HOST || 'localhost',
        MARIADB_DATABASE: process.env.MARIADB_DATABASE || '',
        MARIADB_USERNAME: process.env.MARIADB_USERNAME || '',
        MARIADB_PASSWORD: process.env.MARIADB_PASSWORD || ''
    }
})(process.env.NODE_ENV || '')

