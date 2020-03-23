const path = require('path')
const fs = require('fs')

const postcss = require('postcss')
const stringify = require('../stringify')
const parse = require('../parse')
const read = require('./utils/read')

const ignoredFiles = [
  'import.sass'
]

const tests = fs
  .readdirSync(path.join(__dirname, 'cases'))
  .filter(i => path.extname(i) === '.sass')
  .filter(i => !ignoredFiles.includes(i))

for (let name of tests) {
  it('stringifies ' + name, () => {
    let sass = read(name)
    let root = parse(sass)
    let output = root.toString(stringify)
    expect(sass.trim()).toEqual(output.trim())
  })
}

it('stringifies empty block', () => {
  expect(postcss.parse('a{}').toString(stringify)).toEqual('a')
})
