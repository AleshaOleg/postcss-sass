const Stringifier = require('./stringifier')

module.exports = (node, builder) => {
    let str = new Stringifier(builder)
    str.stringify(node)
}
