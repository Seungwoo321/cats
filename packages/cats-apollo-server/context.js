const { db } = require('./util/db')
const pubsub = require('./pubsub')
const cwd = process.cwd()

// Context passed to all resolvers (third argument)
// eslint-disable-next-line no-unused-vars
module.exports = ({ req } = {}) => {
    return {
        db,
        pubsub,
        cwd
    }
}

