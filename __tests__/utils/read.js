const fs = require('fs')
const path = require('path')

module.exports = file => {
    return fs.readFileSync(path.join(__dirname, '../cases', file)).toString()
}
