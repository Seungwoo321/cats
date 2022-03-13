const path = require('path')
const dotenv = require('dotenv')

if (process.env.NODE_ENV === 'development') {
    dotenv.config({ path: path.join(__dirname, '../../.env.development') })
} else {
    dotenv.config({ path: path.join(__dirname, '../../.env') })
}
