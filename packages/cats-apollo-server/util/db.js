const Lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const { rcFolder } = require('./rcFolder')

const db = new Lowdb(new FileSync(path.resolve(rcFolder, 'db.json')))

db.defaults({
    tasks: []
}).write()

module.exports = {
    db
}
