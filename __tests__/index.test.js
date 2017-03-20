var fs = require('fs');

var postcss = require('postcss');
var gonzales = require('gonzales-pe');

var sassToPostCss = require('../');

function getPostCssTree(fileName) {
    var source = fs.readFileSync(
        './__tests__/sass/' + fileName + '.sass',
        'utf-8'
    );
    var tree = gonzales.parse(source, { syntax: 'sass' });
    return sassToPostCss(tree, null, source, '');
}

it('PostCSS dependency', function () {
    expect(typeof postcss).toBe('function');
});

it('gonzales-pe dependency', function () {
    expect(typeof gonzales).toBe('object');
});

it('basic.sass', function () {
    expect(getPostCssTree('basic')).toMatchSnapshot();
});
