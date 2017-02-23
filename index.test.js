var postcss = require('postcss');
var gonzales = require('gonzales-pe');

it('PostCSS dependency', () => {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', () => {
    expect(typeof gonzales).toBe('object');
});
