const globby = require('globby')
const merge = require('lodash.merge')
// const { GraphQLJSON } = require('graphql-type-json')

const resolvers = [{
    // JSON: GraphQLJSON,
    // Subscription: {}
}]

// Load resolvers in './schema'
const paths = globby.sync(['./schema/*.js'], { cwd: __dirname, absolute: true })
paths.forEach(file => {
    const { resolvers: r } = require(file)
    r && resolvers.push(r)
})

module.exports = merge.apply(null, resolvers)
