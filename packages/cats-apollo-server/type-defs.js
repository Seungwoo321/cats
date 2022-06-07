const gql = require('graphql-tag')
const globby = require('globby')

const typeDefs = [gql`
    enum TradeDirection {
        long
        short
    }
`]

// Load types in './schema'
const paths = globby.sync(['./schema/*.js'], { cwd: __dirname, absolute: true })
paths.forEach(file => {
    const { types } = require(file)
    types && typeDefs.push(types)
})

module.exports = typeDefs
