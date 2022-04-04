
const path = require('path')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.join(__dirname, '.env.development') })
} else {
    dotenv.config({ path: path.join(__dirname, '.env') })
}

export const EXCHANGE_ID = process.env.EXCHANGE_ID || 'bitmex'
export const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || ''
export const EXCHANGE_SECRET_KEY = process.env.EXCHANGE_SECRET_KEY || ''
export const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4000'
export const INFLUX2_ORG = process.env.INFLUX2_ORG || ''
export const INFLUX2_URL = process.env.INFLUX2_URL || 'http://localhost:8086'
export const INFLUX2_TOKEN = process.env.INFLUX2_TOKEN || ''
export const MARIADB_HOST = process.env.MARIADB_HOST || 'localhost'
export const MARIADB_DATABASE = process.env.MARIADB_DATABASE || ''
export const MARIADB_USERNAME = process.env.MARIADB_USERNAME || ''
export const MARIADB_PASSWORD = process.env.MARIADB_PASSWORD || ''
