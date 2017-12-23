const getCss = require('../helpers/getCss');
const getTreeFromSass = require('../helpers/getTreeFromSass');
const getPostCssTreeFromSassTree =
    require('../helpers/getPostCssTreeFromSassTree');
const getSassFromPostCssTree = require('../helpers/getSassFromPostCssTree');

it('getCss', function () {
    expect(typeof getCss).toBe('function');
});

it('getTreeFromSass', function () {
    expect(typeof getTreeFromSass).toBe('function');
});

it('getPostCssTreeFromSassTree', function () {
    expect(typeof getPostCssTreeFromSassTree).toBe('function');
});

it('getSassFromPostCssTree', function () {
    expect(typeof getSassFromPostCssTree).toBe('function');
});

// console.log(getCss('basic'));
// console.log(getTreeFromSass('basic'));
// console.log(getPostCssTreeFromSassTree('basic'));
// getSassFromPostCssTree('basic').then(function (res) {
//     console.log(res);
// });
