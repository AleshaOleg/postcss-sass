const Input = require('postcss/lib/input')

const Parser = require('./parser')

module.exports = (sass, opts) => {
    let input = new Input(sass, opts)

    let parser = new Parser(input)
    parser.parse()

    return parser.root
}
