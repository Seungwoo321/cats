import { Sequelize } from 'sequelize'
import config from '@cats/config'

const { MARIADB_HOST, MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, EXCHANGE_ID } = config

export const sequelize = new Sequelize(MARIADB_DATABASE, MARIADB_USERNAME, MARIADB_PASSWORD, {
    host: MARIADB_HOST,
    dialect: 'mariadb',
    dialectOptions: {
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
})

export const options = {
    sequelize: sequelize,
    schema: EXCHANGE_ID,
    freezeTableName: true,
    underscored: true
}

export { DataTypes } from 'sequelize'