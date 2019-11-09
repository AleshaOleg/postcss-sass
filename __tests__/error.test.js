const postcss = require('postcss')
const CssSyntaxError = require('postcss/lib/css-syntax-error')

const postcssSass = require('..')

it('should throw a CssSyntaxError', () => {
  let sassText = '.foo'

  postcss()
    .process(sassText, { parser: postcssSass })
    .catch(err => {
      expect(err).toBeInstanceOf(CssSyntaxError)
      expect(err.input.line).toBe(1)
      expect(err.input.column).toBe(1)
    })
})

it('should throw original error', () => {
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
    })
})
