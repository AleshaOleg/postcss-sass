const getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');
const getSassFromPostCssTree = require('../../helpers/getSassFromPostCssTree');

it('list1.sass', function () {
    expect(getPostCssTreeFromSass('list1')).toMatchSnapshot();
    getSassFromPostCssTree('list1')
        .then(result => expect(result).toMatchSnapshot());
});
