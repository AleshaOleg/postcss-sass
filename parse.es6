const Input = require('postcss/lib/input')

const Parser = require('./parser.es6')

module.exports = (sass, opts) => {
  const input = new Input(sass, opts)

  const parser = new Parser(input)
  parser.parse()

  return parser.root
}
