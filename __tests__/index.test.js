var postcss = require('postcss');
var gonzales = require('gonzales-pe');
var postcssSass = require('../');

it('PostCSS dependency', function () {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', function () {
    expect(typeof gonzales).toBe('object');
});

it('parse Sass as postcss syntax', function () {
    expect(typeof postcss()
        .process(
            'div\n  a\n    color: red\n  li\n    color: green',
            { parser: postcssSass }
        ).root)
        .toBe('object');
});
