"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MARIADB_PASSWORD = exports.MARIADB_USERNAME = exports.MARIADB_DATABASE = exports.MARIADB_HOST = exports.INFLUX2_TOKEN = exports.INFLUX2_URL = exports.INFLUX2_ORG = exports.GRAPHQL_URL = exports.EXCHANGE_SECRET_KEY = exports.EXCHANGE_API_KEY = exports.EXCHANGE_ID = void 0;
const path = require('path');
const dotenv = require('dotenv');
if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.join(__dirname, '../.env.development') });
}
else {
    dotenv.config({ path: path.join(__dirname, '../.env') });
}
exports.EXCHANGE_ID = process.env.EXCHANGE_ID || 'bitmex';
exports.EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || '';
exports.EXCHANGE_SECRET_KEY = process.env.EXCHANGE_SECRET_KEY || '';
exports.GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4000';
exports.INFLUX2_ORG = process.env.INFLUX2_ORG || '';
exports.INFLUX2_URL = process.env.INFLUX2_URL || '';
exports.INFLUX2_TOKEN = process.env.INFLUX2_TOKEN || '';
exports.MARIADB_HOST = process.env.MARIADB_HOST || '';
exports.MARIADB_DATABASE = process.env.MARIADB_DATABASE || '';
exports.MARIADB_USERNAME = process.env.MARIADB_USERNAME || '';
exports.MARIADB_PASSWORD = process.env.MARIADB_PASSWORD || '';
