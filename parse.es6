const Input = require('postcss/lib/input')

const Parser = require('./parser')

module.exports = (sass, opts) => {
  const input = new Input(sass, opts)

  const parser = new Parser(input)
  parser.parse()

  return parser.root
}
