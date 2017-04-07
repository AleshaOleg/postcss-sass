var postcss = require('postcss');
var gonzales = require('gonzales-pe');

it('PostCSS dependency', function () {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', function () {
    expect(typeof gonzales).toBe('object');
});
