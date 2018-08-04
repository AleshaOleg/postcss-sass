const postcss = require('postcss')
const postcssSass = require('../')
const CssSyntaxError = require('postcss/lib/css-syntax-error')

it('should throw a CssSyntaxError', done => {
  let sassText = '.foo'

  postcss()
    .process(sassText, { parser: postcssSass })
    .catch(err => {
      expect(err).toBeInstanceOf(CssSyntaxError)
      expect(err.input.line).toBe(1)
      expect(err.input.column).toBe(1)
      done()
    })
})

it('should throw original error', done => {
  let errorHolder = {
    toString: () => {
      throw new Error('Error in parser.')
    }
  }

  postcss()
    .process(errorHolder, { parser: postcssSass })
    .catch(err => {
      expect(err).toBeInstanceOf(Error)
      expect(err.message).toBe('Error in parser.')
      done()
    })
})
