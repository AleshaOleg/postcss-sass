const Stringifier = require('./stringifier')

module.exports = (node, builder) => {
  const str = new Stringifier(builder)
  str.stringify(node)
}
