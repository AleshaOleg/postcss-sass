var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('list1.sass', function () {
    expect(getPostCssTreeFromSass('list1')).toMatchSnapshot();
});
