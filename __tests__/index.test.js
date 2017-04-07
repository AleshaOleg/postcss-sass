var postcss = require('postcss');
var gonzales = require('gonzales-pe');

var getPostCssTreeFromSass = require('../helpers/getPostCssTreeFromSass');
var getCss = require('../helpers/getCss');

it('PostCSS dependency', function () {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', function () {
    expect(typeof gonzales).toBe('object');
});

console.log(getPostCssTreeFromSass('alt').nodes[0]);
console.log(getCss('alt').nodes[0]);

