var getPostCssTreeFromSass = require('../../helpers/getPostCssTreeFromSassTree');

it('nested.sass', function () {
    expect(getPostCssTreeFromSass('nested')).toMatchSnapshot();
});
