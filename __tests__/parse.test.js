const jsonify = require('postcss-parser-tests').jsonify
const path = require('path')
const fs = require('fs')
const parse = require('../parse')
const read = require('./utils/read')

const tests = fs
  .readdirSync(path.join(__dirname, 'cases'))
  .filter(i => path.extname(i) === '.sass')

for (let name of tests) {
  it('parses ' + name, () => {
    let sass = read(name)
    let root = parse(sass, { from: name })
    expect(jsonify(root)).toMatchSnapshot()
  })
}
