const fs = require('fs-extra')
const path = require('path')
const os = require('os')

const getRcPath = file => {
    return (
        process.env.CATS_CLI_CONFIG_PATH ||
        path.join(os.homedir(), file)
    )
}

let folder

if (process.env.CATS_CLI_UI_TEST) {
    folder = path.resolve(__dirname, '../live-test')
    // Clean DB
    fs.removeSync(path.resolve(__dirname, folder))
} else if (process.env.CATS_CLI_UI_DEV) {
    folder = path.resolve(__dirname, '../live')
} else {
    folder = 
        (process.env.CATS_CLI_UI_DB_PATH &&
            path.resolve(__dirname, process.env.CATS_CLI_UI_DB_PATH)) ||
        getRcPath('.cats-cli-ui')
}

fs.ensureDirSync(path.resolve(__dirname, folder))

exports.rcFolder = folder
