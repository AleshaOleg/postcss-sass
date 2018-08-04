const path = require('path')
const fs = require('fs')

const postcss = require('postcss')
const stringify = require('../stringify')
const parse = require('../parse')
const read = require('./utils/read')

const tests = fs
  .readdirSync(path.join(__dirname, 'cases'))
  .filter(i => path.extname(i) === '.sass')

function run (sass) {
  let root = parse(sass)
  let output = root.toString(stringify)
  expect(sass.trim()).toEqual(output.trim())
}

for (let name of tests) {
  it('stringifies ' + name, () => {
    run(read(name))
  })
}

it('stringifies empty block', () => {
  expect(postcss.parse('a{}').toString(stringify)).toEqual('a')
})
