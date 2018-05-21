const path = require('path')
const fs = require('fs')
const scssParse = require('postcss-scss').parse
const sassStringify = require('../stringify')
const read = require('./utils/read')

const tests = fs
  .readdirSync(path.join(__dirname, 'cases'))
  .filter(i => path.extname(i) === '.scss')

for (const name of tests) {
  it('convert' + name, () => {
    const sass = read(name.replace(/\.\w+$/, '.sass'))
    const scss = read(name)
    expect(scssParse(scss, { from: name }).toString(sassStringify).trim()).toEqual(sass.trim())
  })
}
