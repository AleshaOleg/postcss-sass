const postcss = require('postcss');
const gonzales = require('gonzales-pe');
const postcssSass = require('../');

it('PostCSS dependency', () => {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', () => {
    expect(typeof gonzales).toBe('object');
});

it('parse Sass as postcss syntax', () => {
    expect(typeof postcss()
        .process(
            'div\n  a\n    color: red\n  li\n    color: green',
            { syntax: postcssSass }
        ).root)
        .toBe('object');
});
